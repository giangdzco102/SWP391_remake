/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useNavStore } from "@/stores/navStore";
import { useAuthStore } from "@/stores";
import useChapterService from "@/api/useChapter.service";
import useReportService from "@/api/useReport.service";
import useStoryService from "@/api/useStory.service";
import { useStoryStore } from "@/stores/storyStore";
import { useGotoReader } from "@/hooks/useGotoReader";
import Utils from "@/utils/utils";
import { Ico } from "@/components/Icons";
import { useToast } from "@/hooks/use-toast";

import { ReaderChapterData as ChapterData } from "@/types/story";
import { FONT_OPTIONS } from "@/utils/constants";
import { ReadingSettingsPanel } from "@/components/popup/ReadingSettingsPanel";
import { ChapterListModal } from "@/components/modals/ChapterListModal";
import { ReportModal } from "@/components/modals/ReportModal";

import { PurchaseConfirmationModal } from "@/components/readerPage/PurchaseConfirmationModal";
import { LockedChapterGate } from "@/components/readerPage/LockedChapterGate";
import { ReaderCommentsSection } from "@/components/readerPage/ReaderCommentsSection";

// ── Main Page ─────────────────────────────────────────────────────────────
export default function ReaderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gotoReader = useGotoReader();
  const { selectedStory, selectedChapterId, setSelectedChapterId, setSelectedStory } =
    useNavStore();
  const { chapters, setChapters } = useStoryStore();
  const { user } = useAuthStore();
  const { getChapter, getChaptersByStory } = useChapterService();
  const { getStoryDetail } = useStoryService();
  const { createReport } = useReportService();
  const toast = useToast();

  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmPurchase, setConfirmPurchase] = useState(false);
  const [chapterError, setChapterError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0].value);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [scrollPct, setScrollPct] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);

  // Report state
  const [reportModal, setReportModal] = useState<{
    targetType: string;
    targetId: number;
    label: string;
  } | null>(null);
  const [reporting, setReporting] = useState(false);
  const [storyAuthorId, setStoryAuthorId] = useState<number | null>(null);

  // Fetch chapter list for prev/next navigation
  useEffect(() => {
    const sId = searchParams.get("storyId");
    const storyId = chapterData?.storyId || (sId ? Number(sId) : null);
    if (!storyId || (chapters.length > 0 && chapters[0].id)) {
      return;
    }

    const mapChapters = (list: any[]) =>
      list.map((ch: any) => ({
        id: ch.id,
        title: ch.title,
        chapterOrder: ch.chapterOrder ?? 0,
        coinPrice: ch.coinPrice ?? 0,
        isPurchased: ch.isPurchased ?? false,
        words: 0,
        readTime: "—",
        publishedAt: ch.publishAt
          ? new Date(ch.publishAt).toLocaleDateString("vi-VN")
          : undefined,
        locked: (ch.coinPrice ?? 0) > 0 && !(ch.isPurchased ?? false),
        price: ch.coinPrice ?? 0,
      }));

    const loadFromDetail = () =>
      getStoryDetail(storyId)
        .then((r: any) => {
          const det = r?.data ?? r;
          const detList: any[] = Array.isArray(det?.chapters)
            ? det.chapters
            : [];
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
        if (!list.length) {
          return loadFromDetail();
        }
        setChapters(mapChapters(list));
      })
      .catch(() => {
        loadFromDetail();
      });
  }, [
    chapterData?.storyId,
    chapters.length,
    getChaptersByStory,
    getStoryDetail,
    setChapters,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch story author ID (for "Tác giả" badge in comments)
  useEffect(() => {
    const storyId = chapterData?.storyId;
    if (!storyId) return;
    getStoryDetail(storyId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((r: any) => {
        const det = r?.data ?? r;
        const authorId: number | undefined = det?.authorId ?? det?.author?.id;
        if (authorId) setStoryAuthorId(authorId);
      })
      .catch(() => {});
  }, [chapterData?.storyId, getStoryDetail]);

  // Sync from URL
  useEffect(() => {
    const sId = searchParams.get("storyId");
    const cId = searchParams.get("chapterId");
    if (!sId || !cId) return;

    if (!isNaN(Number(cId))) {
      if (Number(cId) !== selectedChapterId) {
        setSelectedChapterId(Number(cId));
      }
    } else if (chapters.length > 0) {
      const found = chapters.find(ch => Utils.slugify(ch.title) === cId);
      if (found && found.id !== selectedChapterId) {
        setSelectedChapterId(found.id);
      }
    }
  }, [searchParams, selectedChapterId, chapters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll progress
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

  // Fetch chapter when id changes
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((res: any) => {
        const data: ChapterData = res?.data ?? res;
        if (!data?.id) {
          setChapterData(null);
          setChapterError("Dữ liệu chương không hợp lệ (thiếu ID).");
        } else {
          setChapterData(data);
          if (!selectedStory && data.storyId) {
            setSelectedStory({ id: data.storyId, title: data.storyTitle });
          }
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const handleOpenReport = (
    targetType: string,
    targetId: number,
    label: string,
  ) => {
    if (!user) {
      router.push("?login");
      return;
    }
    setReportModal({ targetType, targetId, label });
  };

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

  const currentIdx = chapters.findIndex((c) => c.id === selectedChapterId);
  const prevChapter = currentIdx > 0 ? chapters[currentIdx - 1] : null;
  const nextChapter =
    currentIdx < chapters.length - 1 ? chapters[currentIdx + 1] : null;

  const goToChapter = (id: number) => {
    const sId = searchParams.get("storyId") || selectedStory?.id;
    if (sId) {
      const ch = chapters.find(c => c.id === id);
      gotoReader(sId, id, ch?.title);
    } else {
      setSelectedChapterId(id);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          fontSize: 14,
          color: "#9e8e82",
        }}
      >
        <div>⏳ Đang tải chương...</div>
      </div>
    );
  }

  if (!chapterData) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#1c1512",
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
              background: "#fde8e8",
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
              border: "1.5px solid #e8e0d6",
              background: "#fff",
              color: "#6b5a4e",
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

  const rawContent = chapterData.content ?? "";
  const isHtmlContent = /<[a-z][\s\S]*>/i.test(rawContent);
  const paragraphs = isHtmlContent
    ? []
    : rawContent.split(/\n+/).filter(Boolean);
  const wordCount = isHtmlContent
    ? rawContent
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length
    : rawContent.trim().split(/\s+/).filter(Boolean).length;
  const readMins = Math.max(1, Math.ceil(wordCount / 200));
  const isLocked = (chapterData.coinPrice ?? 0) > 0 && !chapterData.isPurchased;

  return (
    <div className="reader-wrap fade-in">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${scrollPct}%` }} />
      </div>

      <div className="reader-nav">
        <button className="nav-ch-btn" onClick={() => router.back()}>
          <Ico.Back />
          Trang truyện
        </button>
        <div
          className="reader-chapter-title"
          style={{
            maxWidth: 340,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {chapterData.title}
        </div>

        <button
          onClick={() => setShowChapterList((v) => !v)}
          title="Danh sách chương"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 8,
            border: showChapterList
              ? "1.5px solid #c23d3f"
              : "1.5px solid #e8e0d6",
            background: showChapterList ? "#fde8e8" : "#fdfaf7",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            color: showChapterList ? "#c23d3f" : "#6b5a4e",
            transition: "all 0.15s",
          }}
        >
          <span style={{ fontSize: 14 }}>☰</span>
          <span>Chương</span>
        </button>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowSettings((v) => !v)}
            title="Tuỳ chỉnh hiển thị"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 8,
              border: showSettings
                ? "1.5px solid #c23d3f"
                : "1.5px solid #e8e0d6",
              background: showSettings ? "#fde8e8" : "#fdfaf7",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              color: showSettings ? "#c23d3f" : "#6b5a4e",
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: 15 }}>Aa</span>
            <span style={{ fontSize: 10, opacity: 0.7 }}>
              {showSettings ? "▲" : "▼"}
            </span>
          </button>

          {showSettings && (
            <ReadingSettingsPanel
              fontSize={fontSize}
              setFontSize={setFontSize}
              fontFamily={fontFamily}
              setFontFamily={setFontFamily}
              lineHeight={lineHeight}
              setLineHeight={setLineHeight}
              onClose={() => setShowSettings(false)}
            />
          )}
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto 24px", padding: "0 16px" }}>
        <h1
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 22,
            fontWeight: 800,
            color: "#1c1512",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          {chapterData.title}
        </h1>
        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#b0a096",
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <span>📖 {selectedStory?.title ?? chapterData.storyTitle}</span>
          <span>·</span>
          <span>⏱ {readMins} phút đọc</span>
          <span>·</span>
          <span>{wordCount.toLocaleString()} chữ</span>
          <span>·</span>
          <span>{scrollPct}% đã đọc</span>
        </div>
      </div>

      {isLocked ? (
        <LockedChapterGate
          coinPrice={chapterData.coinPrice || 0}
          onPurchaseClick={() => setConfirmPurchase(true)}
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

      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          marginTop: 48,
          paddingTop: 32,
          borderTop: "1.5px solid #e8e0d6",
          flexWrap: "wrap",
          padding: "32px 16px 0",
        }}
      >
        <button
          className="nav-ch-btn"
          disabled={!prevChapter}
          onClick={() => prevChapter && goToChapter(prevChapter.id)}
        >
          <Ico.Back />
          Chương trước
        </button>
        <button
          className="nav-ch-btn"
          style={{
            background: "#fde8e8",
            color: "#c23d3f",
            borderColor: "#e8a0a1",
          }}
          onClick={() => router.back()}
        >
          Về trang truyện
        </button>
        <button
          className="nav-ch-btn"
          onClick={() => setShowChapterList(true)}
          style={{ gap: 6 }}
        >
          ☰ Chương
        </button>
        <button
          className="nav-ch-btn"
          disabled={!nextChapter}
          onClick={() => nextChapter && goToChapter(nextChapter.id)}
        >
          Chương tiếp
          <Ico.Next />
        </button>
      </div>

      <ReaderCommentsSection
        chapterId={chapterData.id}
        storyId={chapterData.storyId}
        storyTitle={chapterData.title}
        storyAuthorId={storyAuthorId}
        onOpenReport={handleOpenReport}
      />

      {reportModal && (
        <ReportModal
          targetLabel={reportModal.label}
          loading={reporting}
          onSubmit={handleSubmitReport}
          onClose={() => setReportModal(null)}
        />
      )}

      {showChapterList && (
        <ChapterListModal
          chapters={chapters}
          currentChapterId={selectedChapterId}
          storyTitle={selectedStory?.title ?? chapterData?.storyTitle ?? ""}
          onSelect={(id) => {
            goToChapter(id);
            setShowChapterList(false);
          }}
          onClose={() => setShowChapterList(false)}
        />
      )}

      {confirmPurchase && chapterData && (
        <PurchaseConfirmationModal
          chapterData={chapterData}
          onClose={() => setConfirmPurchase(false)}
          onSuccess={(updatedChapter) => {
            setChapterData(updatedChapter);
          }}
        />
      )}
    </div>
  );
}
