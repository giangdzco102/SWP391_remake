/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useNavStore } from "@/stores/navStore";
import { useAuthStore } from "@/stores";
import useChapterService from "@/api/useChapter.service";
import useCommentService from "@/api/useComment.service";
import useReportService from "@/api/useReport.service";
import useStoryService from "@/api/useStory.service";
import useGiftService from "@/api/useGift.service";
import { useStoryStore } from "@/stores/storyStore";
import { useGotoReader } from "@/hooks/useGotoReader";
import Utils from "@/utils/utils";
import { Ico } from "@/components/Icons";
import { useToast } from "@/hooks/use-toast";

import {
  ReaderCommentItem as CommentItem,
  ReaderChapterData as ChapterData,
} from "@/types/story";
import { FONT_OPTIONS } from "@/utils/constants";
import { CommentNode } from "@/components/readerPage/CommentNode";
import { ReadingSettingsPanel } from "@/components/popup/ReadingSettingsPanel";
import { ChapterListModal } from "@/components/modals/ChapterListModal";
import { ReportModal } from "@/components/modals/ReportModal";

// ── Main Page ─────────────────────────────────────────────────────────────
export default function ReaderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gotoReader = useGotoReader();
  const { selectedStory, selectedChapterId, setSelectedChapterId, setSelectedStory } =
    useNavStore();
  const { chapters, setChapters } = useStoryStore();
  const { user, updateBalance } = useAuthStore();
  const { getChapter, getChaptersByStory, purchaseChapter } =
    useChapterService();
  const { getStoryDetail } = useStoryService();
  const commentService = useCommentService();
  const commentServiceRef = useRef(commentService);
  commentServiceRef.current = commentService;
  const { createReport } = useReportService();
  const { sendGift } = useGiftService();
  const toast = useToast();

  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [confirmPurchase, setConfirmPurchase] = useState(false);
  const [chapterError, setChapterError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0].value);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [scrollPct, setScrollPct] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);

  // Comment state
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reportModal, setReportModal] = useState<{
    targetType: string;
    targetId: number;
    label: string;
  } | null>(null);
  const [reporting, setReporting] = useState(false);
  const [giftAmount, setGiftAmount] = useState<number | null>(null);
  const [showGiftOptions, setShowGiftOptions] = useState(false);
  const [storyAuthorId, setStoryAuthorId] = useState<number | null>(null);

  // Load comments — use ref so it's never stale
  const loadComments = useCallback(async (chapterId: number) => {
    try {
      const res: any = await commentServiceRef.current.getCommentsByChapter(
        chapterId,
        { page: 0, size: 100 },
      );
      const data: CommentItem[] = (res?.data?.content ??
        res?.data ??
        res?.content ??
        res) as CommentItem[];
      if (Array.isArray(data)) setComments(data);
    } catch {
      // keep existing comments on error
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch chapter list for prev/next navigation
  useEffect(() => {
    const sId = searchParams.get("storyId");
    const storyId = chapterData?.storyId || (sId ? Number(sId) : null);
    if (!storyId || (chapters.length > 0 && chapters[0].id)) {
      // If we have chapters and they match the current story, skip
      // Actually, better to check if chapters[0] belongs to current storyId
      // but let's keep it simple for now as per user request
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
        // API envelope: { success, status, data: [...] }
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
        // getChaptersByStory failed — try story detail for published chapters
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getStoryDetail(storyId)
      .then((r: any) => {
        const det = r?.data ?? r;
        const authorId: number | undefined = det?.authorId ?? det?.author?.id;
        if (authorId) setStoryAuthorId(authorId);
      })
      .catch(() => {});
  }, [chapterData?.storyId, getStoryDetail]);

  // ── Sync from URL ─────────────────────────────────────────────────────────
  useEffect(() => {
    const sId = searchParams.get("storyId");
    const cId = searchParams.get("chapterId");
    if (!sId || !cId) return;

    // Check if cId is numeric
    if (!isNaN(Number(cId))) {
      if (Number(cId) !== selectedChapterId) {
        setSelectedChapterId(Number(cId));
      }
    } else if (chapters.length > 0) {
      // Find by slug
      const found = chapters.find(ch => Utils.slugify(ch.title) === cId);
      if (found && found.id !== selectedChapterId) {
        setSelectedChapterId(found.id);
      } else if (!found) {
        // Fallback: if slug doesnt match exactly (titles changed?), maybe use first chapter or error
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

  // Fetch chapter + comments when id changes
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
    setComments([]);
    setCommentText("");
    getChapter(selectedChapterId)
      .then((res: any) => {
        const data: ChapterData = res?.data ?? res;
        if (!data?.id) {
          setChapterData(null);
          setChapterError("Dữ liệu chương không hợp lệ (thiếu ID).");
        } else {
          setChapterData(data);
          // Update selectedStory if missing
          if (!selectedStory && data.storyId) {
            setSelectedStory({ id: data.storyId, title: data.storyTitle });
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
    loadComments(selectedChapterId);
  }, [selectedChapterId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Post new root comment
  const handlePostComment = async () => {
    if (!user) {
      router.push("?login");
      return;
    }
    if (!commentText.trim() || !chapterData) return;
    setSubmitting(true);
    try {
      // 1. Send gift if selected
      if (giftAmount && giftAmount > 0) {
        try {
          await sendGift(chapterData.storyId, giftAmount);
          updateBalance(giftAmount);
          // Optional: toast.success(`Đã tặng ${giftAmount} xu!`);
        } catch (err: any) {
          toast.error(err?.response?.data?.message ?? "Không đủ xu để tặng quà.");
          setSubmitting(false);
          return;
        }
      }

      // 2. Post comment
      let content = commentText.trim();
      if (giftAmount && giftAmount > 0) {
        content += `\n\n[DONATE:${giftAmount}]`;
      }

      await commentServiceRef.current.createComment({
        chapterId: chapterData.id,
        content,
      });

      setCommentText("");
      setGiftAmount(null);
      setShowGiftOptions(false);
      await loadComments(chapterData.id);
      toast.success(giftAmount ? "Đã tặng quà và đăng bình luận!" : "Đã đăng bình luận!");
    } catch {
      toast.error("Không thể đăng bình luận. Thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  // Post reply (passed down to CommentNode) — throws on error so CommentNode can handle
  const handleSubmitReply = async (parentId: number, content: string) => {
    if (!chapterData) throw new Error("no chapter");
    await commentServiceRef.current.createComment({
      chapterId: chapterData.id,
      content,
      parentId,
    });
    await loadComments(chapterData.id);
  };

  // Delete own comment
  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("Xóa bình luận này?")) return;
    try {
      await commentServiceRef.current.deleteComment(commentId);
      if (chapterData) await loadComments(chapterData.id);
      toast.success("Đã xóa bình luận.");
    } catch {
      toast.error("Không thể xóa bình luận.");
    }
  };

  // Open report modal
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

  // Submit report
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

  // Navigate prev/next by chapterOrder
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
      {/* Progress bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${scrollPct}%` }} />
      </div>

      {/* Nav */}
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

        {/* Chapter list trigger */}
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

        {/* Settings trigger — replaces old A-/A+ buttons */}
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

      {/* Meta */}
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

      {/* Locked gate */}
      {isLocked ? (
        <div
          style={{
            maxWidth: 520,
            margin: "40px auto",
            textAlign: "center",
            padding: "48px 32px",
            background: "#fff",
            borderRadius: 20,
            border: "1.5px solid #e8e0d6",
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
          <div
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 22,
              fontWeight: 700,
              color: "#1c1512",
              marginBottom: 8,
            }}
          >
            Chương VIP
          </div>
          <div
            style={{
              background: "#fffbeb",
              border: "1.5px solid #fcd34d",
              borderRadius: 12,
              padding: "16px 24px",
              marginBottom: 24,
              display: "inline-block",
            }}
          >
            <div style={{ fontSize: 13, color: "#92400e", marginBottom: 4 }}>
              Chi phí mở khóa
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#c69526" }}>
              🪙 {chapterData.coinPrice} xu
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => router.back()}
              style={{
                padding: "10px 24px",
                borderRadius: 9,
                border: "1.5px solid #e8e0d6",
                background: "#fff",
                color: "#6b5a4e",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ← Quay lại
            </button>
            {!user ? (
              <button
                onClick={() => router.push("?login")}
                style={{
                  padding: "10px 24px",
                  borderRadius: 9,
                  border: "none",
                  background: "#c23d3f",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Đăng nhập để mở khóa
              </button>
            ) : (
              <button
                onClick={() => setConfirmPurchase(true)}
                style={{
                  padding: "10px 24px",
                  borderRadius: 9,
                  border: "none",
                  background: "linear-gradient(135deg,#c69526,#9a7020)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(194,149,38,.3)",
                }}
              >
                🪙 Mua {chapterData.coinPrice} xu
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Content — font, size and line-height applied here */
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

      {/* Prev / Next nav */}
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

      {/* Comments */}
      <div
        style={{ maxWidth: 680, margin: "48px auto 80px", padding: "0 16px" }}
      >
        {/* Section header + report chapter button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 20,
              fontWeight: 700,
              color: "#1c1512",
            }}
          >
            💬 Bình luận ({comments.length})
          </div>
          <button
            onClick={() =>
              handleOpenReport("CHAPTER", chapterData.id, chapterData.title)
            }
            style={{
              fontSize: 12,
              color: "#9ca3af",
              background: "none",
              border: "1px solid #e8e0d6",
              borderRadius: 8,
              padding: "5px 12px",
              cursor: "pointer",
            }}
          >
            🚩 Báo cáo chương
          </button>
        </div>

        {/* Comment input — root comments only */}
        <div
          style={{
            background: "#fdfaf7",
            border: "1.5px solid #e8e0d6",
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 24,
          }}
        >
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                handlePostComment();
            }}
            placeholder={
              user
                ? "Viết bình luận của bạn... (Ctrl+Enter để gửi)"
                : "Đăng nhập để bình luận"
            }
            disabled={!user}
            rows={3}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              resize: "none",
              fontSize: 14,
              color: "#3d2f28",
              fontFamily: "inherit",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 12,
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {user && (
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setShowGiftOptions(!showGiftOptions)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      color: giftAmount ? "#c69526" : "#9e8e82",
                      background: giftAmount ? "#fef9ee" : "none",
                      border: giftAmount ? "1px solid #fcd34d" : "1px solid #e8e0d6",
                      borderRadius: 20,
                      padding: "5px 12px",
                      cursor: "pointer",
                      fontWeight: 600,
                      transition: "all 0.15s",
                    }}
                  >
                    <span>🎁</span>
                    <span>{giftAmount ? `${giftAmount} xu` : "Tặng quà"}</span>
                  </button>

                  {showGiftOptions && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "100%",
                        left: 0,
                        marginBottom: 10,
                        background: "#fff",
                        border: "1.5px solid #e8e0d6",
                        borderRadius: 12,
                        padding: "12px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        zIndex: 100,
                        width: 240,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1c1512", marginBottom: 8 }}>Chọn mức tặng:</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                        {[10, 50, 100, 200, 500].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => {
                              setGiftAmount(amt);
                              setShowGiftOptions(false);
                            }}
                            style={{
                              fontSize: 11,
                              padding: "4px 10px",
                              borderRadius: 15,
                              border: giftAmount === amt ? "1.5px solid #c69526" : "1.5px solid #e8e0d6",
                              background: giftAmount === amt ? "#fef9ee" : "#fff",
                              color: giftAmount === amt ? "#c69526" : "#6b5a4e",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            {amt}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => {
                            setGiftAmount(null);
                            setShowGiftOptions(false);
                          }}
                          style={{
                            flex: 1,
                            fontSize: 11,
                            color: "#9ca3af",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          Xóa chọn
                        </button>
                        <button
                          onClick={() => setShowGiftOptions(false)}
                          style={{
                            fontSize: 11,
                            color: "#c23d3f",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          Đóng
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {!user && (
                <button
                  onClick={() => router.push("?login")}
                  style={{
                    fontSize: 13,
                    color: "#c23d3f",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Đăng nhập để bình luận →
                </button>
              )}
              {user && (
                <button
                  onClick={handlePostComment}
                  disabled={!commentText.trim() || submitting}
                  style={{
                    padding: "8px 24px",
                    borderRadius: 9,
                    border: "none",
                    background:
                      !commentText.trim() || submitting ? "#f3f4f6" : "#c23d3f",
                    color: !commentText.trim() || submitting ? "#9ca3af" : "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor:
                      !commentText.trim() || submitting
                        ? "not-allowed"
                        : "pointer",
                    boxShadow: !commentText.trim() || submitting ? "none" : "0 2px 8px rgba(194,61,63,0.2)",
                  }}
                >
                  {submitting ? "⏳ Đang gửi..." : giftAmount ? "🎁 Tặng & Gửi" : "Gửi bình luận"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Comment list */}
        {comments.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px 0",
              fontSize: 14,
              color: "#b0a096",
            }}
          >
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận! 🌸
          </div>
        ) : (
          comments.map((c) => (
            <CommentNode
              key={c.id}
              comment={c}
              currentUserId={user?.id}
              isLoggedIn={!!user}
              storyAuthorId={storyAuthorId}
              onSubmitReply={handleSubmitReply}
              onDelete={handleDeleteComment}
              onReport={(id) =>
                handleOpenReport("COMMENT", id, `Bình luận #${id}`)
              }
              onRequireAuth={() => router.push("?login")}
            />
          ))
        )}
      </div>

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
          storyTitle={selectedStory?.title ?? chapterData?.storyTitle ?? ""}
          onSelect={(id) => {
            goToChapter(id);
            setShowChapterList(false);
          }}
          onClose={() => setShowChapterList(false)}
        />
      )}

      {/* Purchase Confirmation Modal */}
      {confirmPurchase && chapterData && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => !purchasing && setConfirmPurchase(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "32px 28px",
              maxWidth: 400,
              width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🪙</div>
            <h3
              style={{
                margin: "0 0 6px",
                fontFamily: "'Playfair Display',serif",
                fontSize: 20,
                fontWeight: 800,
                color: "#1c1512",
              }}
            >
              Xác nhận mua chương
            </h3>
            <p
              style={{
                margin: "0 0 16px",
                fontSize: 14,
                color: "#6b5a4e",
                lineHeight: 1.6,
              }}
            >
              Bạn sắp mua{" "}
              <strong style={{ color: "#1c1512" }}>
                &ldquo;{chapterData.title}&rdquo;
              </strong>{" "}
              với giá
            </p>
            <div
              style={{
                background: "#fffbeb",
                border: "1.5px solid #fcd34d",
                borderRadius: 12,
                padding: "14px 20px",
                marginBottom: 24,
                display: "inline-block",
              }}
            >
              <span style={{ fontSize: 28, fontWeight: 800, color: "#c69526" }}>
                🪙 {chapterData.coinPrice} xu
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                disabled={purchasing}
                onClick={() => setConfirmPurchase(false)}
                style={{
                  flex: 1,
                  padding: "11px 20px",
                  borderRadius: 10,
                  border: "1.5px solid #e8e0d6",
                  background: "#fff",
                  color: "#6b5a4e",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                disabled={purchasing}
                onClick={async () => {
                  setPurchasing(true);
                  try {
                    await purchaseChapter(chapterData.id);
                    updateBalance(chapterData.coinPrice);
                    const res: any = await getChapter(chapterData.id);
                    const data = res?.data ?? res;
                    setChapterData(data);
                    toast.success(
                      `Chương "${chapterData.title}" đã được mở khóa.`,
                      "Mở khóa thành công!",
                    );
                    setConfirmPurchase(false);
                  } catch (err: any) {
                    toast.error(
                      err?.response?.data?.message ??
                        "Không đủ xu hoặc lỗi hệ thống.",
                      "Mở khóa thất bại",
                    );
                  } finally {
                    setPurchasing(false);
                  }
                }}
                style={{
                  flex: 1,
                  padding: "11px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: purchasing
                    ? "#a0a0a0"
                    : "linear-gradient(135deg,#c69526,#9a7020)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: purchasing ? "not-allowed" : "pointer",
                  boxShadow: purchasing
                    ? "none"
                    : "0 2px 8px rgba(194,149,38,.3)",
                }}
              >
                {purchasing ? "⏳ Đang mua..." : "✅ Xác nhận mua"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
