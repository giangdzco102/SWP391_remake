/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useNavStore } from "@/stores/navStore";
import { useAuthStore } from "@/stores";
import useChapterService from "@/api/useChapter.service";
import useCommentService from "@/api/useComment.service";
import useReportService from "@/api/useReport.service";
import useStoryService from "@/api/useStory.service";
import { useStoryStore } from "@/stores/storyStore";
import { Ico } from "@/components/Icons";
import { useToast } from "@/hooks/use-toast";

// ── Types ─────────────────────────────────────────────────────────────────
// Matches actual API response shape
interface CommentItem {
  id: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
  parentId?: number | null;
  replies: CommentItem[];
  // nested user object fallback (some API versions)
  user?: { id?: number; fullName?: string; name?: string };
}

interface ChapterData {
  id: number;
  storyId: number;
  storyTitle: string;
  title: string;
  content: string;
  coinPrice: number;
  chapterOrder: number;
  status: string;
  publishAt: string;
  createdAt: string;
  updatedAt: string;
  isPurchased: boolean;
}


// ── Font & Line-height options ────────────────────────────────────────────
const FONT_OPTIONS = [
  { label: "Mặc định", value: "'Roboto', sans-serif" },
  { label: "Playfair", value: "'Playfair Display', serif" },
  { label: "Lora", value: "'Lora', serif" },
  { label: "Merriweather", value: "'Merriweather', serif" },
  { label: "Sans-serif", value: "'Segoe UI', sans-serif" },
  { label: "Monospace", value: "'Courier New', monospace" },
];

const LINE_HEIGHT_OPTIONS = [
  { label: "Chật", value: 1.5 },
  { label: "Vừa", value: 1.8 },
  { label: "Thoáng", value: 2.2 },
  { label: "Rộng", value: 2.6 },
];

// ── Helper ────────────────────────────────────────────────────────────────
const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
};

const avatarColors = [
  "#c23d3f",
  "#6d7ec5",
  "#3a9d6e",
  "#c87941",
  "#7b5ea7",
  "#2c89b0",
];
const getAvatarColor = (name: string) =>
  avatarColors[name.charCodeAt(0) % avatarColors.length];

// ── Comment Component ─────────────────────────────────────────────────────
function CommentNode({
  comment,
  depth = 0,
  currentUserId,
  isLoggedIn,
  onSubmitReply,
  onDelete,
  onReport,
  onRequireAuth,
}: {
  comment: CommentItem;
  depth?: number;
  currentUserId?: number;
  isLoggedIn: boolean;
  onSubmitReply: (parentId: number, content: string) => Promise<void>;
  onDelete: (id: number) => void;
  onReport: (id: number) => void;
  onRequireAuth: () => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);
  const nodeToast = useToast();

  const name = comment.userName || comment.user?.fullName || comment.user?.name || "Người dùng";
  const initials = name
    .split(" ")
    .slice(-2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();
  const color = getAvatarColor(name);
  const isOwn = currentUserId != null && (comment.userId === currentUserId || comment.user?.id === currentUserId);

  const openReply = () => {
    if (!isLoggedIn) { onRequireAuth(); return; }
    setReplyOpen(true);
    setReplyText(`@${name} `);
    setTimeout(() => { replyInputRef.current?.focus(); replyInputRef.current?.setSelectionRange(999, 999); }, 50);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    try {
      await onSubmitReply(comment.id, replyText.trim());
      setReplyText("");
      setReplyOpen(false);
      setShowReplies(true);
    } catch {
      nodeToast.error("Không thể gửi trả lời. Thử lại sau.");
    } finally {
      setReplySubmitting(false);
    }
  };

  return (
    <div style={{ marginBottom: depth > 0 ? 8 : 12 }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "12px 16px",
          background: "#fdfaf7",
          borderRadius: 12,
          border: "1px solid #ede6dd",
          ...(depth > 0 ? { borderLeft: "3px solid #e8a0a1", borderRadius: "0 12px 12px 0" } : {}),
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: "#1c1512" }}>{name}</span>
            <span style={{ fontSize: 11, color: "#b0a096" }}>{timeAgo(comment.createdAt)}</span>
          </div>

          {/* Content */}
          <p style={{ margin: 0, fontSize: 14, color: "#3d2f28", lineHeight: 1.65, wordBreak: "break-word" }}>
            {comment.content}
          </p>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            <button
              onClick={openReply}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#c23d3f", fontWeight: 600, padding: 0 }}
            >
              ↩ Trả lời
            </button>
            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies((v) => !v)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#c23d3f", fontWeight: 600, padding: 0, display: "flex", alignItems: "center", gap: 4 }}
              >
                {showReplies
                  ? `▲ Ẩn ${comment.replies.length} phản hồi`
                  : <><span style={{ background: "#fde8e8", color: "#c23d3f", borderRadius: 20, padding: "1px 8px", fontWeight: 700, fontSize: 11 }}>{comment.replies.length}</span>&nbsp;phản hồi ▼</>}
              </button>
            )}

            {/* Three-dot menu */}
            <div style={{ position: "relative", marginLeft: "auto" }}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#b0a096", padding: "0 4px", lineHeight: 1 }}
              >
                ···
              </button>
              {menuOpen && (
                <div
                  style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", background: "#fff", border: "1px solid #e8e0d6", borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.10)", zIndex: 50, minWidth: 120, overflow: "hidden" }}
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <button
                    onClick={() => { setMenuOpen(false); onReport(comment.id); }}
                    style={{ display: "block", width: "100%", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#6b5a4e", textAlign: "left", fontFamily: "inherit" }}
                  >
                    🚩 Báo cáo
                  </button>
                  {isOwn && (
                    <button
                      onClick={() => { setMenuOpen(false); onDelete(comment.id); }}
                      style={{ display: "block", width: "100%", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#dc2626", textAlign: "left", fontFamily: "inherit" }}
                    >
                      🗑 Xóa
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inline reply input — appears directly below this comment */}
      {replyOpen && (
        <div style={{ marginLeft: 44, marginTop: 6, marginBottom: 6 }}>
          <div style={{ fontSize: 11, color: "#b0a096", marginBottom: 4 }}>Trả lời <strong style={{ color: "#6b5a4e" }}>{name}</strong></div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: "#fdfaf7", border: "1.5px solid #e8e0d6", borderRadius: 12, padding: "8px 12px" }}>
            <textarea
              ref={replyInputRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmitReply(); }}
              rows={2}
              style={{ flex: 1, border: "none", background: "transparent", resize: "none", fontSize: 13, color: "#3d2f28", fontFamily: "inherit", outline: "none" }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <button
                onClick={handleSubmitReply}
                disabled={!replyText.trim() || replySubmitting}
                style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: !replyText.trim() || replySubmitting ? "#f3f4f6" : "#c23d3f", color: !replyText.trim() || replySubmitting ? "#9ca3af" : "#fff", fontSize: 14, cursor: !replyText.trim() || replySubmitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                ➤
              </button>
              <button
                onClick={() => setReplyOpen(false)}
                style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid #e8e0d6", background: "#fff", color: "#9ca3af", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div style={{ marginLeft: 24, marginTop: 6, borderLeft: "2px solid #f5d0d0", paddingLeft: 8 }}>
          {comment.replies.map((r) => (
            <CommentNode key={r.id} comment={r} depth={depth + 1} currentUserId={currentUserId} isLoggedIn={isLoggedIn} onSubmitReply={onSubmitReply} onDelete={onDelete} onReport={onReport} onRequireAuth={onRequireAuth} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Reading Settings Panel ────────────────────────────────────────────────
interface ReadingSettingsProps {
  fontSize: number;
  setFontSize: (v: number) => void;
  fontFamily: string;
  setFontFamily: (v: string) => void;
  lineHeight: number;
  setLineHeight: (v: number) => void;
  onClose: () => void;
}

function ReadingSettingsPanel({
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  lineHeight,
  setLineHeight,
  onClose,
}: ReadingSettingsProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const sectionTitle = (text: string) => (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#b0a096",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: 10,
      }}
    >
      {text}
    </div>
  );

  return (
    <div
      ref={panelRef}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        zIndex: 200,
        background: "#fff",
        border: "1.5px solid #e8e0d6",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(60,30,20,0.13)",
        padding: "20px 20px 16px",
        minWidth: 280,
        fontFamily: "inherit",
      }}
    >
      {/* Arrow pointer */}
      <div
        style={{
          position: "absolute",
          top: -8,
          right: 20,
          width: 14,
          height: 14,
          background: "#fff",
          border: "1.5px solid #e8e0d6",
          borderBottom: "none",
          borderRight: "none",
          transform: "rotate(45deg)",
        }}
      />

      {/* ── Font size ── */}
      {sectionTitle("Cỡ chữ")}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <button
          onClick={() => setFontSize(Math.max(12, fontSize - 1))}
          style={btnStyle}
        >
          A−
        </button>

        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}
        >
          <input
            type="range"
            min={12}
            max={28}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#c23d3f", cursor: "pointer" }}
          />
          <div style={{ textAlign: "center", fontSize: 12, color: "#9e8e82" }}>
            {fontSize}px
          </div>
        </div>

        <button
          onClick={() => setFontSize(Math.min(28, fontSize + 1))}
          style={btnStyle}
        >
          A+
        </button>
      </div>

      {/* ── Font family ── */}
      {sectionTitle("Font chữ")}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 6,
          marginBottom: 20,
        }}
      >
        {FONT_OPTIONS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFontFamily(f.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border:
                fontFamily === f.value
                  ? "2px solid #c23d3f"
                  : "1.5px solid #e8e0d6",
              background: fontFamily === f.value ? "#fde8e8" : "#fdfaf7",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: f.value,
              color: fontFamily === f.value ? "#c23d3f" : "#3d2f28",
              fontWeight: fontFamily === f.value ? 700 : 400,
              transition: "all 0.15s",
              textAlign: "center",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Line height ── */}
      {sectionTitle("Khoảng cách dòng")}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 6,
        }}
      >
        {LINE_HEIGHT_OPTIONS.map((lh) => (
          <button
            key={lh.value}
            onClick={() => setLineHeight(lh.value)}
            style={{
              padding: "8px 4px",
              borderRadius: 8,
              border:
                lineHeight === lh.value
                  ? "2px solid #c23d3f"
                  : "1.5px solid #e8e0d6",
              background: lineHeight === lh.value ? "#fde8e8" : "#fdfaf7",
              cursor: "pointer",
              fontSize: 12,
              color: lineHeight === lh.value ? "#c23d3f" : "#3d2f28",
              fontWeight: lineHeight === lh.value ? 700 : 400,
              textAlign: "center",
              transition: "all 0.15s",
            }}
          >
            <div
              style={{
                fontSize: 16,
                marginBottom: 2,
                lineHeight: lh.value,
                letterSpacing: "-0.5px",
              }}
            >
              ≡
            </div>
            {lh.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 8,
  border: "1.5px solid #e8e0d6",
  background: "#fdfaf7",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 700,
  color: "#3d2f28",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

// ── Chapter List Modal ────────────────────────────────────────────────────
interface ChapterListModalProps {
  chapters: { id: number; title: string; chapterOrder?: number; coinPrice?: number; isPurchased?: boolean }[];
  currentChapterId: number | null;
  storyTitle: string;
  onSelect: (id: number) => void;
  onClose: () => void;
}

function ChapterListModal({ chapters, currentChapterId, storyTitle, onSelect, onClose }: ChapterListModalProps) {
  const currentRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Scroll the current chapter into view after modal opens
    setTimeout(() => currentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }), 80);
  }, []);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          width: "100%",
          maxWidth: 480,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 16px 48px rgba(0,0,0,0.22)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px 14px",
            borderBottom: "1.5px solid #f0e8e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 800, color: "#1c1512" }}>
              📋 Danh sách chương
            </div>
            <div style={{ fontSize: 12, color: "#b0a096", marginTop: 2 }}>
              {storyTitle} · {chapters.length} chương
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1.5px solid #e8e0d6",
              background: "#fdfaf7",
              cursor: "pointer",
              fontSize: 16,
              color: "#6b5a4e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Chapter list */}
        <div style={{ overflowY: "auto", padding: "10px 12px" }}>
          {chapters.map((ch, idx) => {
            const isCurrent = ch.id === currentChapterId;
            const isLocked = (ch.coinPrice ?? 0) > 0 && !ch.isPurchased;
            return (
              <button
                key={ch.id}
                ref={isCurrent ? currentRef : undefined}
                onClick={() => { onSelect(ch.id); onClose(); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: isCurrent ? "1.5px solid #e8a0a1" : "1.5px solid transparent",
                  background: isCurrent ? "#fde8e8" : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  marginBottom: 4,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { if (!isCurrent) (e.currentTarget as HTMLButtonElement).style.background = "#faf6f3"; }}
                onMouseLeave={(e) => { if (!isCurrent) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                {/* Chapter number badge */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: isCurrent ? "#c23d3f" : "#f0ebe6",
                    color: isCurrent ? "#fff" : "#9e8e82",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {ch.chapterOrder ?? idx + 1}
                </div>

                {/* Title */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? "#c23d3f" : "#3d2f28",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {ch.title}
                  </div>
                </div>

                {/* Badges */}
                <div style={{ display: "flex", gap: 4, flexShrink: 0, alignItems: "center" }}>
                  {isCurrent && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        background: "#c23d3f",
                        color: "#fff",
                        borderRadius: 20,
                        padding: "2px 7px",
                      }}
                    >
                      Đang đọc
                    </span>
                  )}
                  {isLocked && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        background: "#fffbeb",
                        color: "#92400e",
                        borderRadius: 20,
                        padding: "2px 7px",
                        border: "1px solid #fcd34d",
                      }}
                    >
                      🪙 {ch.coinPrice}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Report Modal ──────────────────────────────────────────────────────────
interface ReportModalProps {
  targetLabel: string;
  onSubmit: (reason: string) => void;
  onClose: () => void;
  loading?: boolean;
}
function ReportModal({ targetLabel, onSubmit, onClose, loading }: ReportModalProps) {
  const [reason, setReason] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "28px 28px 24px", maxWidth: 420, width: "100%", boxShadow: "0 12px 40px rgba(0,0,0,0.18)" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: "#1c1512", marginBottom: 6 }}>🚩 Báo cáo</div>
        <div style={{ fontSize: 13, color: "#6b5a4e", marginBottom: 16 }}>Báo cáo: <strong>{targetLabel}</strong></div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Mô tả lý do báo cáo..."
          rows={4}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e8e0d6", fontSize: 14, color: "#3d2f28", resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 9, border: "1.5px solid #e8e0d6", background: "#fff", color: "#6b5a4e", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Hủy
          </button>
          <button
            onClick={() => reason.trim() && onSubmit(reason.trim())}
            disabled={!reason.trim() || loading}
            style={{ padding: "9px 20px", borderRadius: 9, border: "none", background: !reason.trim() || loading ? "#f3f4f6" : "#c23d3f", color: !reason.trim() || loading ? "#9ca3af" : "#fff", fontSize: 13, fontWeight: 700, cursor: !reason.trim() || loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Đang gửi..." : "Gửi báo cáo"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function ReaderPage() {
  const router = useRouter();
  const { selectedStory, selectedChapterId, setSelectedChapterId } =
    useNavStore();
  const { chapters, setChapters } = useStoryStore();
  const { user } = useAuthStore();
  const { getChapter, getChaptersByStory, purchaseChapter } = useChapterService();
  const { getStoryDetail } = useStoryService();
  const commentService = useCommentService();
  const commentServiceRef = useRef(commentService);
  commentServiceRef.current = commentService;
  const { createReport } = useReportService();
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
  const [reportModal, setReportModal] = useState<{ targetType: string; targetId: number; label: string } | null>(null);
  const [reporting, setReporting] = useState(false);

  // Load comments — use ref so it's never stale
  const loadComments = useCallback(async (chapterId: number) => {
    try {
      const res: any = await commentServiceRef.current.getCommentsByChapter(chapterId, { page: 0, size: 100 });
      const data: CommentItem[] = (res?.data?.content ?? res?.data ?? res?.content ?? res) as CommentItem[];
      if (Array.isArray(data)) setComments(data);
    } catch {
      // keep existing comments on error
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch chapter list for prev/next navigation when Zustand store is empty
  // (happens on page refresh or direct URL access)
  useEffect(() => {
    const storyId = chapterData?.storyId;
    if (!storyId || chapters.length > 0) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapChapters = (list: any[]) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loadFromDetail = () =>
      getStoryDetail(storyId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((r: any) => {
          const det = r?.data ?? r;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const detList: any[] = Array.isArray(det?.chapters) ? det.chapters : [];
          if (detList.length) setChapters(mapChapters(detList));
        })
        .catch(() => {});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getChaptersByStory(storyId).then((res: any) => {
      // API envelope: { success, status, data: [...] }
      const list: any[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (!list.length) {
        return loadFromDetail();
      }
      setChapters(mapChapters(list));
    }).catch(() => {
      // getChaptersByStory failed — try story detail for published chapters
      loadFromDetail();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterData?.storyId]);

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
      setChapterError("Không có chương nào được chọn. Hãy quay lại trang truyện và chọn một chương.");
      return;
    }
    setLoading(true);
    setChapterError(null);
    window.scrollTo(0, 0);
    setComments([]);
    setCommentText("");
    getChapter(selectedChapterId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((res: any) => {
        const data: ChapterData = res?.data ?? res;
        if (!data?.id) {
          setChapterData(null);
          setChapterError("Dữ liệu chương không hợp lệ (thiếu ID).");
        } else {
          setChapterData(data);
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((err: any) => {
        setChapterData(null);
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          setChapterError("Đây là chương VIP hoặc bạn chưa đăng nhập.");
        } else if (status === 404) {
          setChapterError("Không tìm thấy chương (chương chưa được đăng tải hoặc đã bị xóa).");
        } else {
          setChapterError(`Không thể tải chương (lỗi ${status ?? "kết nối"})`);
        }
      })
      .finally(() => setLoading(false));
    loadComments(selectedChapterId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChapterId]);

  // Post new root comment
  const handlePostComment = async () => {
    if (!user) { router.push("?login"); return; }
    if (!commentText.trim() || !chapterData) return;
    setSubmitting(true);
    try {
      await commentServiceRef.current.createComment({ chapterId: chapterData.id, content: commentText.trim() });
      setCommentText("");
      await loadComments(chapterData.id);
      toast.success("Đã đăng bình luận!");
    } catch {
      toast.error("Không thể đăng bình luận. Thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  // Post reply (passed down to CommentNode) — throws on error so CommentNode can handle
  const handleSubmitReply = async (parentId: number, content: string) => {
    if (!chapterData) throw new Error("no chapter");
    await commentServiceRef.current.createComment({ chapterId: chapterData.id, content, parentId });
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
  const handleOpenReport = (targetType: string, targetId: number, label: string) => {
    if (!user) { router.push("?login"); return; }
    setReportModal({ targetType, targetId, label });
  };

  // Submit report
  const handleSubmitReport = async (reason: string) => {
    if (!reportModal) return;
    setReporting(true);
    try {
      await createReport({ targetType: reportModal.targetType, targetId: reportModal.targetId, reason });
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
    setSelectedChapterId(id);
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
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1c1512", marginBottom: 8 }}>
          Không tìm thấy chương
        </div>
        {chapterError && (
          <div style={{ fontSize: 14, color: "#c23d3f", background: "#fde8e8", borderRadius: 10, padding: "10px 20px", display: "inline-block", marginBottom: 16 }}>
            {chapterError}
          </div>
        )}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
          <button
            onClick={() => router.back()}
            style={{ padding: "10px 24px", borderRadius: 10, border: "1.5px solid #e8e0d6", background: "#fff", color: "#6b5a4e", fontWeight: 600, cursor: "pointer", fontSize: 13 }}
          >
            ← Quay lại
          </button>
          {!user && (
            <button
              onClick={() => router.push("?login")}
              style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#c23d3f", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
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
  const paragraphs = isHtmlContent ? [] : rawContent.split(/\n+/).filter(Boolean);
  const wordCount = isHtmlContent
    ? rawContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().split(/\s+/).filter(Boolean).length
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
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
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
            paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))
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
      <div style={{ maxWidth: 680, margin: "48px auto 80px", padding: "0 16px" }}>

        {/* Section header + report chapter button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#1c1512" }}>
            💬 Bình luận ({comments.length})
          </div>
          <button
            onClick={() => handleOpenReport("CHAPTER", chapterData.id, chapterData.title)}
            style={{ fontSize: 12, color: "#9ca3af", background: "none", border: "1px solid #e8e0d6", borderRadius: 8, padding: "5px 12px", cursor: "pointer" }}
          >
            🚩 Báo cáo chương
          </button>
        </div>

        {/* Comment input — root comments only */}
        <div style={{ background: "#fdfaf7", border: "1.5px solid #e8e0d6", borderRadius: 14, padding: "14px 16px", marginBottom: 24 }}>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handlePostComment(); }}
            placeholder={user ? "Viết bình luận của bạn... (Ctrl+Enter để gửi)" : "Đăng nhập để bình luận"}
            disabled={!user}
            rows={3}
            style={{ width: "100%", border: "none", background: "transparent", resize: "none", fontSize: 14, color: "#3d2f28", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8, gap: 8 }}>
            {!user && (
              <button onClick={() => router.push("?login")} style={{ fontSize: 13, color: "#c23d3f", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                Đăng nhập để bình luận →
              </button>
            )}
            {user && (
              <button
                onClick={handlePostComment}
                disabled={!commentText.trim() || submitting}
                style={{ padding: "8px 20px", borderRadius: 9, border: "none", background: !commentText.trim() || submitting ? "#f3f4f6" : "#c23d3f", color: !commentText.trim() || submitting ? "#9ca3af" : "#fff", fontSize: 13, fontWeight: 700, cursor: !commentText.trim() || submitting ? "not-allowed" : "pointer" }}
              >
                {submitting ? "Đang gửi..." : "Gửi"}
              </button>
            )}
          </div>
        </div>

        {/* Comment list */}
        {comments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", fontSize: 14, color: "#b0a096" }}>
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận! 🌸
          </div>
        ) : (
          comments.map((c) => (
            <CommentNode
              key={c.id}
              comment={c}
              currentUserId={user?.id}
              isLoggedIn={!!user}
              onSubmitReply={handleSubmitReply}
              onDelete={handleDeleteComment}
              onReport={(id) => handleOpenReport("COMMENT", id, `Bình luận #${id}`)}
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
          onSelect={(id) => { goToChapter(id); setShowChapterList(false); }}
          onClose={() => setShowChapterList(false)}
        />
      )}

      {/* Purchase Confirmation Modal */}
      {confirmPurchase && chapterData && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
          onClick={() => !purchasing && setConfirmPurchase(false)}
        >
          <div
            style={{
              background: "#fff", borderRadius: 20, padding: "32px 28px",
              maxWidth: 400, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🪙</div>
            <h3 style={{ margin: "0 0 6px", fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, color: "#1c1512" }}>
              Xác nhận mua chương
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 14, color: "#6b5a4e", lineHeight: 1.6 }}>
              Bạn sắp mua{" "}
              <strong style={{ color: "#1c1512" }}>&ldquo;{chapterData.title}&rdquo;</strong>
              {" "}với giá
            </p>
            <div style={{
              background: "#fffbeb", border: "1.5px solid #fcd34d",
              borderRadius: 12, padding: "14px 20px", marginBottom: 24, display: "inline-block",
            }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: "#c69526" }}>
                🪙 {chapterData.coinPrice} xu
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                disabled={purchasing}
                onClick={() => setConfirmPurchase(false)}
                style={{
                  flex: 1, padding: "11px 20px", borderRadius: 10,
                  border: "1.5px solid #e8e0d6", background: "#fff",
                  color: "#6b5a4e", fontSize: 14, fontWeight: 600, cursor: "pointer",
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
                    const res: any = await getChapter(chapterData.id);
                    const data = res?.data ?? res;
                    setChapterData(data);
                    toast.success(`Chương "${chapterData.title}" đã được mở khóa.`, "Mở khóa thành công!");
                    setConfirmPurchase(false);
                  } catch (err: any) {
                    toast.error(err?.response?.data?.message ?? "Không đủ xu hoặc lỗi hệ thống.", "Mở khóa thất bại");
                  } finally {
                    setPurchasing(false);
                  }
                }}
                style={{
                  flex: 1, padding: "11px 20px", borderRadius: 10, border: "none",
                  background: purchasing ? "#a0a0a0" : "linear-gradient(135deg,#c69526,#9a7020)",
                  color: "#fff", fontSize: 14, fontWeight: 700,
                  cursor: purchasing ? "not-allowed" : "pointer",
                  boxShadow: purchasing ? "none" : "0 2px 8px rgba(194,149,38,.3)",
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
