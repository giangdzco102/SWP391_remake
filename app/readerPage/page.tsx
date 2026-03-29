/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useNavStore } from "@/stores/navStore";
import { useAuthStore } from "@/stores";
import useChapterService from "@/api/useChapter.service";
import useReportService from "@/api/useReport.service";
import useStoryService from "@/api/useStory.service";
import { formatVNDate } from "@/utils/time";
import { useStoryStore } from "@/stores/storyStore";
import { useGotoReader } from "@/hooks/useGotoReader";
import { useReaderTheme } from "@/hooks/useReaderTheme";
import Utils from "@/utils/utils";
import { useToast } from "@/hooks/use-toast";

import {
  ReaderChapterData as ChapterData,
} from "@/types/story";
import { FONT_OPTIONS } from "@/utils/constants";

import { ReaderNav } from "@/components/readerPage/ReaderNav";
import { ReaderMeta } from "@/components/readerPage/ReaderMeta";
import { ReaderBottomNav } from "@/components/readerPage/ReaderBottomNav";
import { LockedChapterGate } from "@/components/readerPage/LockedChapterGate";
import { PurchaseConfirmationModal } from "@/components/readerPage/PurchaseConfirmationModal";
import { ReaderCommentsSection } from "@/components/readerPage/ReaderCommentsSection";
import { ChapterListModal } from "@/components/modals/ChapterListModal";
import { ReportModal } from "@/components/modals/ReportModal";

// ── Main Page ─────────────────────────────────────────────────────────────
export default function ReaderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gotoReader = useGotoReader();
  const {
    selectedStory,
    selectedChapterId,
    setSelectedChapterId,
    setSelectedStory,
  } = useNavStore();
  const { chapters, setChapters, allStories, setAllStories } = useStoryStore();
  const { user } = useAuthStore();
  const { getChapter, getChaptersByStory } = useChapterService();
  const { getStoryDetail } = useStoryService();
  const { createReport } = useReportService();
  const toast = useToast();
  const { dk } = useReaderTheme();

  // Reading settings
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0].value);
  const [lineHeight, setLineHeight] = useState(1.8);

  // UI state
  const [scrollPct, setScrollPct] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);

  // Chapter data
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapterError, setChapterError] = useState<string | null>(null);

  // Purchase
  const [confirmPurchase, setConfirmPurchase] = useState(false);

  // Report modal
  const [reportModal, setReportModal] = useState<{
    targetType: string;
    targetId: number;
    label: string;
  } | null>(null);
  const [reporting, setReporting] = useState(false);

  // Story author (for comment author badge)
  const [storyAuthorId, setStoryAuthorId] = useState<number | null>(null);

  // ── Scroll progress ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => {
      const el = document.documentElement;
      const pct = Math.round(
        (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100,
      );
      setScrollPct(isNaN(pct) ? 0 : pct);
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // ── Sync chapterId from URL ───────────────────────────────────────────────
  useEffect(() => {
    const sId = searchParams.get("storyId");
    const cId = searchParams.get("chapterId");
    if (!sId || !cId) return;

    if (!isNaN(Number(cId))) {
      if (Number(cId) !== selectedChapterId) {
        setSelectedChapterId(Number(cId));
      }
    } else if (chapters.length > 0) {
      const found = chapters.find((ch) => Utils.slugify(ch.title) === cId);
      if (found && found.id !== selectedChapterId) {
        setSelectedChapterId(found.id);
      }
    }
  }, [searchParams, selectedChapterId, chapters]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch chapter list for prev/next navigation ───────────────────────────
  useEffect(() => {
    const sId = searchParams.get("storyId");
    const storyId = chapterData?.storyId || (sId ? Number(sId) : null);
    if (!storyId || (chapters.length > 0 && chapters[0].id)) return;

    const mapChapters = (list: any[]) =>
      list.map((ch: any) => ({
        id: ch.id,
        title: ch.title,
        chapterOrder: ch.chapterOrder ?? 0,
        coinPrice: ch.coinPrice ?? 0,
        isPurchased: ch.isPurchased ?? false,
        words: 0,
        readTime: "—",
        publishedAt: ch.publishAt ? formatVNDate(ch.publishAt) : undefined,
        locked: (ch.coinPrice ?? 0) > 0 && !(ch.isPurchased ?? false),
        price: ch.coinPrice ?? 0,
      }));

    const loadFromDetail = () =>
      getStoryDetail(storyId)
        .then((r: any) => {
          const det = r?.data ?? r;
          const detList: any[] = Array.isArray(det?.chapters) ? det.chapters : [];
          if (detList.length) setChapters(mapChapters(detList));
        })
        .catch(() => {});

    getChaptersByStory(storyId)
      .then((res: any) => {
        const list: any[] = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        if (!list.length) return loadFromDetail();
        setChapters(mapChapters(list));
      })
      .catch(() => loadFromDetail());
  }, [
    chapterData?.storyId,
    chapters.length,
    getChaptersByStory,
    getStoryDetail,
    setChapters,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch story author ID ─────────────────────────────────────────────────
  useEffect(() => {
    const storyId = chapterData?.storyId;
    if (!storyId) return;
    getStoryDetail(storyId)
      .then((r: any) => {
        const det = r?.data ?? r;
        const authorId: number | undefined = det?.authorId ?? det?.author?.id;
        if (authorId) setStoryAuthorId(authorId);
      })
      .catch(() => {});
  }, [chapterData?.storyId, getStoryDetail]);

  // ── Fetch chapter when ID changes ─────────────────────────────────────────
  useEffect(() => {
    if (!selectedChapterId) {
      setLoading(false);
      setChapterError(
        "Không có chương nào được chọn. Hãy quay lại trang truyện và chọn một chương.",
      );
      return;
    }
    setLoading(true);
    setChapterError(null);
    window.scrollTo(0, 0);

    getChapter(selectedChapterId)
      .then((res: any) => {
        const data: ChapterData = res?.data ?? res;
        if (!data?.id) {
          setChapterData(null);
          setChapterError("Dữ liệu chương không hợp lệ (thiếu ID).");
        } else {
          setChapterData(data);
          if (!selectedStory && data.storyId) {
            setSelectedStory({ id: data.storyId, title: data.storyTitle });
          } else if (selectedStory && selectedStory.id === data.storyId && selectedChapterId !== chapterData?.id) {
            // Tăng ảo view truyện trên Redux/Zustand store để "cập nhật dữ liệu động lướt trang" 
            const oldViews = selectedStory.views ?? parseInt(String(selectedStory.reads || "0").replace(/K/g, '000'), 10) ?? 0;
            const newViews = oldViews + 1;
            const newReads = newViews >= 1000 ? `${(newViews / 1000).toFixed(1)}K` : String(newViews);
            
            setSelectedStory({
              ...selectedStory,
              reads: newReads,
              views: newViews
            });
            
            // Sync to global context (allStories) array
            const updatedStories = allStories.map(s => 
              s.id === data.storyId ? { ...s, reads: newReads, views: newViews } : s
            );
            setAllStories(updatedStories);
          }
        }
      })
      .catch((err: any) => {
        setChapterData(null);
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          setChapterError("Đây là chương VIP hoặc bạn chưa đăng nhập.");
        } else if (status === 404) {
          setChapterError(
            "Không tìm thấy chương (chương chưa được đăng tải hoặc đã bị xóa).",
          );
        } else {
          setChapterError(`Không thể tải chương (lỗi ${status ?? "kết nối"})`);
        }
      })
      .finally(() => setLoading(false));
  }, [selectedChapterId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Report handlers ───────────────────────────────────────────────────────
  const handleOpenReport = useCallback(
    (targetType: string, targetId: number, label: string) => {
      if (!user) {
        router.push("?login");
        return;
      }
      setReportModal({ targetType, targetId, label });
    },
    [user, router],
  );

  const handleSubmitReport = async (reason: string) => {
    if (!reportModal) return;
    setReporting(true);
    try {
      await createReport({
        targetType: reportModal.targetType,
        targetId: reportModal.targetId,
        reason,
      });
      toast.success("Báo cáo đã được gửi. Cảm ơn bạn!");
      setReportModal(null);
    } catch {
      toast.error("Không thể gửi báo cáo. Thử lại sau.");
    } finally {
      setReporting(false);
    }
  };

  // ── Chapter navigation ────────────────────────────────────────────────────
  const currentIdx = chapters.findIndex((c) => c.id === selectedChapterId);
  const prevChapter = currentIdx > 0 ? chapters[currentIdx - 1] : null;
  const nextChapter =
    currentIdx < chapters.length - 1 ? chapters[currentIdx + 1] : null;

  const goToChapter = useCallback(
    (id: number) => {
      const sId = searchParams.get("storyId") || selectedStory?.id;
      if (sId) {
        const ch = chapters.find((c) => c.id === id);
        gotoReader(sId, id, ch?.title);
      } else {
        setSelectedChapterId(id);
      }
    },
    [searchParams, selectedStory, chapters, gotoReader, setSelectedChapterId],
  );

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          fontSize: 14,
          color: dk.textFaint,
        }}
      >
        <div>⏳ Đang tải chương...</div>
      </div>
    );
  }

  // ── Error / not found state ───────────────────────────────────────────────
  if (!chapterData) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: dk.text,
            marginBottom: 8,
          }}
        >
          Không tìm thấy chương
        </div>
        {chapterError && (
          <div
            style={{
              fontSize: 14,
              color: "#c23d3f",
              background: dk.navBtnActive,
              borderRadius: 10,
              padding: "10px 20px",
              display: "inline-block",
              marginBottom: 16,
            }}
          >
            {chapterError}
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 8,
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: `1.5px solid ${dk.border}`,
              background: dk.surface,
              color: dk.navBtnText,
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            ← Quay lại
          </button>
          {!user && (
            <button
              onClick={() => router.push("?login")}
              style={{
                padding: "10px 24px",
                borderRadius: 10,
                border: "none",
                background: "#c23d3f",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Derived content values ────────────────────────────────────────────────
  const rawContent = chapterData.content ?? "";
  const isHtmlContent = /<[a-z][\s\S]*>/i.test(rawContent);
  const paragraphs = isHtmlContent ? [] : rawContent.split(/\n+/).filter(Boolean);
  const wordCount = isHtmlContent
    ? rawContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().split(/\s+/).filter(Boolean).length
    : rawContent.trim().split(/\s+/).filter(Boolean).length;
  const readMins = Math.max(1, Math.ceil(wordCount / 200));
  const isLocked = (chapterData.coinPrice ?? 0) > 0 && !chapterData.isPurchased;
  const storyTitle = selectedStory?.title ?? chapterData.storyTitle;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="reader-wrap fade-in"
      style={{ background: dk.bg, minHeight: "100vh" }}
    >
      {/* Progress bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${scrollPct}%` }} />
      </div>

      {/* Top navigation */}
      <ReaderNav
        chapterTitle={chapterData.title}
        showChapterList={showChapterList}
        setShowChapterList={setShowChapterList}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        fontSize={fontSize}
        setFontSize={setFontSize}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        lineHeight={lineHeight}
        setLineHeight={setLineHeight}
      />

      {/* Chapter meta */}
      <ReaderMeta
        chapterTitle={chapterData.title}
        storyTitle={storyTitle}
        readMins={readMins}
        wordCount={wordCount}
        scrollPct={scrollPct}
      />

      {/* Locked gate or chapter content */}
      {isLocked ? (
        <LockedChapterGate
          chapterData={chapterData}
          onConfirmPurchase={() => setConfirmPurchase(true)}
        />
      ) : (
        <div
          className="reader-content"
          style={{
            fontSize,
            fontFamily,
            lineHeight,
            maxWidth: 680,
            margin: "0 auto",
            padding: "0 16px",
            transition: "font-size 0.2s, line-height 0.2s",
          }}
        >
          {isHtmlContent ? (
            <div
              style={{ fontSize, fontFamily, lineHeight }}
              dangerouslySetInnerHTML={{ __html: rawContent }}
            />
          ) : (
            paragraphs.map((p, i) => <p key={i}>{p}</p>)
          )}
        </div>
      )}

      {/* Bottom navigation */}
      <ReaderBottomNav
        prevChapter={prevChapter}
        nextChapter={nextChapter}
        goToChapter={goToChapter}
        setShowChapterList={setShowChapterList}
      />

      {/* Comments section */}
      <ReaderCommentsSection
        chapterId={chapterData.id}
        storyId={chapterData.storyId}
        storyTitle={chapterData.title}
        storyAuthorId={storyAuthorId}
        onOpenReport={handleOpenReport}
      />

      {/* Report Modal */}
      {reportModal && (
        <ReportModal
          targetLabel={reportModal.label}
          loading={reporting}
          onSubmit={handleSubmitReport}
          onClose={() => setReportModal(null)}
        />
      )}

      {/* Chapter List Modal */}
      {showChapterList && (
        <ChapterListModal
          chapters={chapters}
          currentChapterId={selectedChapterId}
          storyTitle={storyTitle}
          onSelect={(id) => {
            goToChapter(id);
            setShowChapterList(false);
          }}
          onClose={() => setShowChapterList(false)}
        />
      )}

      {/* Purchase Confirmation Modal */}
      {confirmPurchase && (
        <PurchaseConfirmationModal
          chapterData={chapterData}
          onClose={() => setConfirmPurchase(false)}
          onSuccess={(updatedChapter) => {
            setChapterData(updatedChapter);
            setConfirmPurchase(false);
          }}
        />
      )}
    </div>
  );
}
