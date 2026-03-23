/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import useHttpClient from "@/api/useHttpClient";
import APP_CONFIG from "@/config/app-config";
import { useToast } from "@/hooks/use-toast";

/* ================================================================
   TYPES
   ================================================================ */
interface StoryItem {
  id: number;
  title: string;
  authorId: number;
  authorName: string;
  description?: string;
  coverUrl?: string;
  categoryIds?: number[];
  categoryNames?: string[];
  status: string;
  createdAt: string;
  chapterCount?: number;
}

interface ChapterItem {
  id: number;
  title: string;
  storyId: number;
  storyTitle: string;
  authorName?: string;
  chapterOrder: number;
  content: string;
  coinPrice: number;
  status: string;
  createdAt: string;
}

interface ReviewHistoryItem {
  id: number;
  reviewerId?: number;
  reviewerName?: string;
  targetType: "STORY" | "CHAPTER";
  targetId: number;
  targetTitle: string;
  storyTitle?: string;
  action: "APPROVE" | "REJECT";
  note?: string;
  currentStatus?: string;
  createdAt: string;
}

/* ================================================================
   THEME TOKENS — consistent soft palette
   ================================================================ */
const T = {
  bg: "#f6f4f1",
  card: "#ffffff",
  border: "#e8e3dc",
  borderLight: "#f0ece6",
  text: "#2d2319",
  textSec: "#7a6e63",
  textMuted: "#b5a99e",
  accent: "#6e4ca0",
  accentLight: "#f3eefa",
  accentBorder: "#cbb8e8",
  success: "#3a8a5c",
  successBg: "#eaf7f0",
  successBorder: "#b8e0ca",
  warn: "#b08430",
  warnBg: "#fef9ee",
  warnBorder: "#f0daa8",
  danger: "#c24040",
  dangerBg: "#fdf0f0",
  dangerBorder: "#f0b8b8",
  info: "#3a72b0",
  infoBg: "#eef4fc",
  infoBorder: "#b4cde8",
  purple: "#7c5cbf",
  purpleBg: "#f4f0fc",
  purpleBorder: "#d0c2ec",
  gray: "#8a8078",
  grayBg: "#f3f0ed",
  grayBorder: "#ddd7d0",
  headerGrad: "linear-gradient(135deg, #2a1a40 0%, #4a2d70 50%, #6e4ca0 100%)",
  radius: 14,
  radiusSm: 10,
  shadow: "0 2px 12px rgba(45,35,25,0.06)",
  shadowMd: "0 6px 24px rgba(45,35,25,0.1)",
  font: "'DM Sans', sans-serif",
  fontSerif: "'Playfair Display', 'Lora', Georgia, serif",
};

/* ================================================================
   HELPERS
   ================================================================ */
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d} ngày trước`;
  const h = Math.floor(diff / 3600000);
  if (h > 0) return `${h} giờ trước`;
  return `${Math.floor(diff / 60000)} phút trước`;
}

/* ================================================================
   SHARED STYLES
   ================================================================ */
const btnBase: React.CSSProperties = { padding: "8px 16px", borderRadius: T.radiusSm, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", fontFamily: T.font, display: "inline-flex", alignItems: "center", gap: 6, transition: "all 0.15s ease" };
const btnPrimary: React.CSSProperties = { ...btnBase, background: T.accent, color: "#fff" };
const btnOutline: React.CSSProperties = { ...btnBase, background: T.card, color: T.textSec, border: `1.5px solid ${T.border}` };
const btnSuccess: React.CSSProperties = { ...btnBase, background: T.success, color: "#fff" };
const btnDanger: React.CSSProperties = { ...btnBase, background: T.danger, color: "#fff" };
const btnDisabled: React.CSSProperties = { ...btnBase, background: "#f0edea", color: T.textMuted, cursor: "not-allowed" };

/* ================================================================
   STORY DETAIL MODAL — left: info + chapters, reviewing story
   ================================================================ */
function StoryDetailModal({ story, onClose, onReview }: {
  story: StoryItem;
  onClose: () => void;
  onReview: (storyId: number, approved: boolean, note: string) => Promise<void>;
}) {
  const httpClient = useHttpClient();
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandChapter, setExpandChapter] = useState<number | null>(null);

  useEffect(() => {
    httpClient.get(APP_CONFIG.REVIEWER.STORY_DETAIL(story.id))
      .then((res: any) => {
        const data = res?.data ?? res ?? {};
        const chs = data.chapters ?? data.content ?? [];
        setChapters(Array.isArray(chs) ? chs : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [story.id]);// eslint-disable-line react-hooks/exhaustive-deps

  const handleDecision = async (approved: boolean) => {
    if (!approved && !note.trim()) return;
    setSaving(true);
    try { await onReview(story.id, approved, note); onClose(); }
    catch { /* parent handles error */ }
    finally { setSaving(false); }
  };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)" }}>
      <div style={{ background: T.card, borderRadius: 20, width: "100%", maxWidth: 950, maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: T.shadowMd, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "18px 22px 14px", borderBottom: `1.5px solid ${T.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, background: T.grayBg }}>
          <div>
            <div style={{ fontFamily: T.fontSerif, fontSize: 18, fontWeight: 800, color: T.text }}>{story.title}</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>✍️ {story.authorName} · 📅 {timeAgo(story.createdAt)}{story.categoryNames?.length ? ` · 📂 ${story.categoryNames.join(", ")}` : ""}</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${T.border}`, background: T.card, cursor: "pointer", fontSize: 16, color: T.textSec, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Body — two columns */}
        <div style={{ flex: 1, overflow: "hidden", display: "grid", gridTemplateColumns: "340px 1fr", gap: 0 }}>
          {/* Left: Story info */}
          <div style={{ borderRight: `1.5px solid ${T.borderLight}`, overflowY: "auto", padding: "16px 18px" }}>
            {story.coverUrl && <img src={story.coverUrl} alt="" style={{ width: "100%", borderRadius: 12, marginBottom: 12, objectFit: "cover", maxHeight: 220 }} />}
            <div style={{ fontSize: 13, color: T.text, lineHeight: 1.7 }}>{story.description || <span style={{ color: T.textMuted, fontStyle: "italic" }}>Chưa có mô tả.</span>}</div>
            <div style={{ marginTop: 16, fontSize: 12, color: T.textMuted }}>📊 {chapters.length} chương</div>
          </div>
          {/* Right: Chapters */}
          <div style={{ overflowY: "auto", padding: "16px 18px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textSec, marginBottom: 10, textTransform: "uppercase" }}>📚 Danh sách chương</div>
            {loading ? <div style={{ color: T.textMuted }}>Đang tải…</div> :
              chapters.length === 0 ? <div style={{ color: T.textMuted, fontStyle: "italic" }}>Không có chương.</div> :
                chapters.map((ch) => (
                  <div key={ch.id} style={{ marginBottom: 8, border: `1px solid ${expandChapter === ch.id ? T.accentBorder : T.borderLight}`, borderRadius: 10, overflow: "hidden" }}>
                    <button onClick={() => setExpandChapter(expandChapter === ch.id ? null : ch.id)} style={{ width: "100%", padding: "10px 14px", border: "none", background: expandChapter === ch.id ? T.accentLight : T.card, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.text, flex: 1 }}>Ch.{ch.chapterOrder} — {ch.title}</span>
                      <span style={{ fontSize: 11, color: T.textMuted }}>{ch.coinPrice > 0 ? `🪙 ${ch.coinPrice}` : "Free"}</span>
                      <span style={{ fontSize: 11, transform: expandChapter === ch.id ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
                    </button>
                    {expandChapter === ch.id && (
                      <div style={{ padding: "14px 16px", borderTop: `1px solid ${T.borderLight}`, fontSize: 14, color: T.text, lineHeight: 1.8, fontFamily: "'Lora',serif", maxHeight: 300, overflowY: "auto" }}>
                        {!ch.content
                          ? <span style={{ color: T.textMuted, fontStyle: "italic" }}>Nội dung chưa được tải.</span>
                          : /<[a-z]/i.test(ch.content)
                            ? <div dangerouslySetInnerHTML={{ __html: ch.content }} />
                            : ch.content.split(/\n+/).filter(Boolean).map((p, i) => <p key={i} style={{ marginBottom: "0.7em" }}>{p}</p>)
                        }
                      </div>
                    )}
                  </div>
                ))}
          </div>
        </div>

        {/* Footer — decision */}
        <div style={{ padding: "14px 22px", borderTop: `1.5px solid ${T.borderLight}`, flexShrink: 0, background: T.grayBg }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.textSec, marginBottom: 4, textTransform: "uppercase" }}>Ghi chú kiểm duyệt</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Bắt buộc nếu từ chối…" style={{ width: "100%", padding: "8px 12px", borderRadius: T.radiusSm, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.text, fontFamily: T.font, outline: "none", background: T.card, boxSizing: "border-box" }} />
            </div>
            <button onClick={onClose} style={btnOutline}>Đóng</button>
            <button onClick={() => handleDecision(false)} disabled={!note.trim() || saving} style={!note.trim() || saving ? btnDisabled : btnDanger}>
              {saving ? "…" : "❌ Từ chối"}
            </button>
            <button onClick={() => handleDecision(true)} disabled={saving} style={saving ? btnDisabled : btnSuccess}>
              {saving ? "…" : "✅ Duyệt"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   CHAPTER REVIEW MODAL — full content reading + decision
   ================================================================ */
function ChapterReviewModal({ chapter, onClose, onReview }: {
  chapter: ChapterItem;
  onClose: () => void;
  onReview: (chapterId: number, approved: boolean, note: string) => Promise<void>;
}) {
  const httpClient = useHttpClient();
  const [content, setContent] = useState<string>(chapter.content ?? "");
  const [loading, setLoading] = useState(!chapter.content);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (chapter.content) return;
    httpClient.get(APP_CONFIG.REVIEWER.CHAPTER_DETAIL(chapter.id))
      .then((res: any) => setContent(res?.data?.content ?? res?.content ?? ""))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [chapter.id]);// eslint-disable-line react-hooks/exhaustive-deps

  const handleDecision = async (approved: boolean) => {
    if (!approved && !note.trim()) return;
    setSaving(true);
    try { await onReview(chapter.id, approved, note); onClose(); }
    catch { /* parent handles error */ }
    finally { setSaving(false); }
  };

  const isHtml = /<[a-z]/i.test(content);

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)" }}>
      <div style={{ background: T.card, borderRadius: 20, width: "100%", maxWidth: 750, maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: T.shadowMd, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "18px 22px 14px", borderBottom: `1.5px solid ${T.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: T.fontSerif, fontSize: 17, fontWeight: 800, color: T.text }}>{chapter.title}</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>📖 {chapter.storyTitle} · Ch.{chapter.chapterOrder} · {chapter.coinPrice > 0 ? `🪙 ${chapter.coinPrice} xu` : "Miễn phí"} · ✍️ {chapter.authorName ?? "?"}</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${T.border}`, background: T.bg, cursor: "pointer", fontSize: 16, color: T.textSec, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {loading ? <div style={{ textAlign: "center", padding: 20, color: T.textMuted }}>⏳ Đang tải…</div> :
            !content ? <div style={{ color: T.textMuted, fontStyle: "italic" }}>Không có nội dung.</div> :
              isHtml ?
                <div style={{ fontSize: 15, color: T.text, lineHeight: 1.85, fontFamily: "'Lora',serif" }} dangerouslySetInnerHTML={{ __html: content }} /> :
                content.split(/\n+/).filter(Boolean).map((p, i) => <p key={i} style={{ fontSize: 15, color: T.text, lineHeight: 1.85, fontFamily: "'Lora',serif", marginBottom: "1em" }}>{p}</p>)
          }
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 22px", borderTop: `1.5px solid ${T.borderLight}`, flexShrink: 0, background: T.grayBg }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.textSec, marginBottom: 4, textTransform: "uppercase" }}>Ghi chú kiểm duyệt</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Bắt buộc nếu từ chối…" style={{ width: "100%", padding: "8px 12px", borderRadius: T.radiusSm, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.text, fontFamily: T.font, outline: "none", background: T.card, boxSizing: "border-box" }} />
            </div>
            <button onClick={onClose} style={btnOutline}>Đóng</button>
            <button onClick={() => handleDecision(false)} disabled={!note.trim() || saving} style={!note.trim() || saving ? btnDisabled : btnDanger}>
              {saving ? "…" : "❌ Từ chối"}
            </button>
            <button onClick={() => handleDecision(true)} disabled={saving} style={saving ? btnDisabled : btnSuccess}>
              {saving ? "…" : "✅ Duyệt"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function ReviewerDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const httpClient = useHttpClient();
  const toast = useToast();

  type Tab = "stories" | "chapters" | "history" | "criteria";
  const [tab, setTab] = useState<Tab>("stories");
  const [pendingStories, setPendingStories] = useState<StoryItem[]>([]);
  const [pendingChapters, setPendingChapters] = useState<ChapterItem[]>([]);
  const [reviewHistory, setReviewHistory] = useState<ReviewHistoryItem[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [storyModal, setStoryModal] = useState<StoryItem | null>(null);
  const [chapterModal, setChapterModal] = useState<ChapterItem | null>(null);
  const [historyFilter, setHistoryFilter] = useState<"ALL" | "APPROVE" | "REJECT">("ALL");
  const [historySort, setHistorySort] = useState<"newest" | "oldest">("newest");
  const [storySearch, setStorySearch] = useState("");
  const [storySort, setStorySort] = useState<"newest" | "oldest">("newest");
  const [chapterSearch, setChapterSearch] = useState("");
  const [chapterSort, setChapterSort] = useState<"newest" | "oldest">("newest");

  const loadPendingStories = useCallback(async () => {
    setLoadingStories(true);
    try {
      const res: any = await httpClient.get(APP_CONFIG.REVIEWER.PENDING_STORIES);
      const list = res?.data?.content ?? res?.data ?? res?.content ?? res ?? [];
      setPendingStories(Array.isArray(list) ? list : []);
    } catch { setPendingStories([]); }
    finally { setLoadingStories(false); }
  }, [httpClient]);

  const loadPendingChapters = useCallback(async () => {
    setLoadingChapters(true);
    try {
      const res: any = await httpClient.get(APP_CONFIG.REVIEWER.PENDING_CHAPTERS);
      const list = res?.data?.content ?? res?.data ?? res?.content ?? res ?? [];
      setPendingChapters(Array.isArray(list) ? list : []);
    } catch { setPendingChapters([]); }
    finally { setLoadingChapters(false); }
  }, [httpClient]);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res: any = await httpClient.get(APP_CONFIG.REVIEWER.REVIEW_HISTORY);
      const list = res?.data?.content ?? res?.data ?? res?.content ?? res ?? [];
      setReviewHistory(Array.isArray(list) ? list : []);
    } catch { setReviewHistory([]); }
    finally { setLoadingHistory(false); }
  }, [httpClient]);

  useEffect(() => {
    if (!user) { router.push("/?login"); return; }
    const hasReviewer = user.roles?.some((r: string) => {
      const ur = r.toUpperCase();
      return ur === "REVIEWER" || ur === "ROLE_REVIEWER" || ur === "ADMIN" || ur === "ROLE_ADMIN";
    });
    if (!hasReviewer) { router.push("/"); return; }
    loadPendingStories();
    loadPendingChapters();
  }, [user]);// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tab === "history" && reviewHistory.length === 0) loadHistory();
  }, [tab]);// eslint-disable-line react-hooks/exhaustive-deps

  const handleReviewStory = async (storyId: number, approved: boolean, note: string) => {
    try {
      await httpClient.post(APP_CONFIG.REVIEWER.REVIEW_STORY(storyId), {
        action: approved ? "APPROVE" : "REJECT",
        reason: note || undefined,
      });
      toast.success(approved ? "Đã duyệt truyện." : "Đã từ chối truyện.");
      setPendingStories((p) => p.filter((s) => s.id !== storyId));
    } catch {
      toast.error("Lỗi khi duyệt truyện.");
      throw new Error("failed");
    }
  };

  const handleReviewChapter = async (chapterId: number, approved: boolean, note: string) => {
    try {
      await httpClient.post(APP_CONFIG.REVIEWER.REVIEW_CHAPTER(chapterId), {
        action: approved ? "APPROVE" : "REJECT",
        note: note || undefined,
      });
      toast.success(approved ? "Đã duyệt chương." : "Đã từ chối chương.");
      setPendingChapters((p) => p.filter((c) => c.id !== chapterId));
    } catch {
      toast.error("Lỗi khi duyệt chương.");
      throw new Error("failed");
    }
  };

  const filteredHistory = (historyFilter === "ALL" ? reviewHistory : reviewHistory.filter((h) => h.action === historyFilter))
    .sort((a, b) => historySort === "newest" ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const filteredStories = (!storySearch.trim() ? pendingStories : pendingStories.filter((s) => s.title.toLowerCase().includes(storySearch.trim().toLowerCase()) || s.authorName.toLowerCase().includes(storySearch.trim().toLowerCase())))
    .sort((a, b) => storySort === "newest" ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const filteredChapters = (!chapterSearch.trim() ? pendingChapters : pendingChapters.filter((c) => c.title.toLowerCase().includes(chapterSearch.trim().toLowerCase()) || c.storyTitle.toLowerCase().includes(chapterSearch.trim().toLowerCase())))
    .sort((a, b) => chapterSort === "newest" ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const TABS: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: "stories", label: "Truyện", icon: "📖", count: pendingStories.length },
    { id: "chapters", label: "Chương", icon: "📄", count: pendingChapters.length },
    { id: "history", label: "Lịch sử", icon: "📋" },
    { id: "criteria", label: "Tiêu chí", icon: "⚖️" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      {/* ════════════════ HEADER ════════════════ */}
      <div style={{ background: T.headerGrad, padding: "32px 40px 0", color: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🔍</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: -0.5, fontFamily: T.fontSerif }}>Bảng Kiểm Duyệt</h1>
              <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>Xin chào, {user?.fullName} — kiểm duyệt nội dung truyện và chương</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { icon: "📖", label: "Truyện chờ duyệt", value: pendingStories.length, color: "#ffab91" },
              { icon: "📄", label: "Chương chờ duyệt", value: pendingChapters.length, color: "#b39ddb" },
              { icon: "📋", label: "Đã duyệt", value: reviewHistory.length || "—", color: "#a5d6a7" },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.12)" }}>
                <div style={{ fontSize: 20 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{s.value}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "12px 16px", borderRadius: "10px 10px 0 0", border: "none", background: tab === t.id ? T.bg : "transparent", color: tab === t.id ? T.accent : "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                {t.icon} {t.label}{t.count !== undefined ? ` (${t.count})` : ""}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════ CONTENT ════════════════ */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "28px 40px 80px" }}>

        {/* ──── TAB: STORIES ──── */}
        {tab === "stories" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="🔍 Tìm theo tên truyện hoặc tác giả…"
                value={storySearch}
                onChange={(e) => setStorySearch(e.target.value)}
                style={{ padding: "8px 14px", borderRadius: T.radiusSm, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.text, fontFamily: T.font, outline: "none", width: 280, background: T.card }}
              />
              <span style={{ fontSize: 13, color: T.textMuted }}>{filteredStories.length} / {pendingStories.length} truyện</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                {(["newest", "oldest"] as const).map((s) => (
                  <button key={s} onClick={() => setStorySort(s)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${storySort === s ? T.accent : T.border}`, background: storySort === s ? T.accentLight : T.card, color: storySort === s ? T.accent : T.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {s === "newest" ? "🔽 Mới nhất" : "🔼 Cũ nhất"}
                  </button>
                ))}
              </div>
            </div>
            {loadingStories ? <div style={{ textAlign: "center", padding: "40px 0", color: T.textMuted }}>⏳ Đang tải truyện chờ duyệt…</div> :
              filteredStories.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", background: T.card, borderRadius: 18, border: `1.5px dashed ${T.border}` }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Không có truyện nào cần duyệt</div>
                  <div style={{ fontSize: 13, color: T.textMuted, marginTop: 6 }}>Tất cả đã được xử lý!</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 14 }}>
                  {filteredStories.map((story) => (
                    <div key={story.id} style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: T.shadow, display: "flex", flexDirection: "column" }}>
                      {story.coverUrl && <img src={story.coverUrl} alt="" style={{ width: "100%", height: 150, objectFit: "cover" }} />}
                      <div style={{ padding: "14px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ fontFamily: T.fontSerif, fontSize: 16, fontWeight: 700, color: T.text }}>{story.title}</div>
                        <div style={{ fontSize: 12, color: T.textMuted, display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <span>✍️ {story.authorName}</span>
                          <span>🕐 {timeAgo(story.createdAt)}</span>
                          {story.categoryNames && story.categoryNames.length > 0 && <span>📂 {story.categoryNames.join(", ")}</span>}
                        </div>
                        {story.description && <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{story.description}</div>}
                        <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                          <button onClick={() => setStoryModal(story)} style={{ ...btnPrimary, flex: 1 }}>🔍 Xem chi tiết & Duyệt</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* ──── TAB: CHAPTERS ──── */}
        {tab === "chapters" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="🔍 Tìm theo tên chương hoặc truyện…"
                value={chapterSearch}
                onChange={(e) => setChapterSearch(e.target.value)}
                style={{ padding: "8px 14px", borderRadius: T.radiusSm, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.text, fontFamily: T.font, outline: "none", width: 280, background: T.card }}
              />
              <span style={{ fontSize: 13, color: T.textMuted }}>{filteredChapters.length} / {pendingChapters.length} chương</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                {(["newest", "oldest"] as const).map((s) => (
                  <button key={s} onClick={() => setChapterSort(s)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${chapterSort === s ? T.accent : T.border}`, background: chapterSort === s ? T.accentLight : T.card, color: chapterSort === s ? T.accent : T.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {s === "newest" ? "🔽 Mới nhất" : "🔼 Cũ nhất"}
                  </button>
                ))}
              </div>
            </div>
            {loadingChapters ? <div style={{ textAlign: "center", padding: "40px 0", color: T.textMuted }}>⏳ Đang tải chương chờ duyệt…</div> :
              filteredChapters.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", background: T.card, borderRadius: 18, border: `1.5px dashed ${T.border}` }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Không có chương nào cần duyệt</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filteredChapters.map((ch) => (
                    <div key={ch.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: T.card, borderRadius: 14, border: `1.5px solid ${T.border}`, boxShadow: T.shadow }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: T.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: T.accent, flexShrink: 0 }}>
                        {ch.chapterOrder}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.title}</div>
                        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2, display: "flex", gap: 10 }}>
                          <span>📖 {ch.storyTitle}</span>
                          <span>{ch.coinPrice > 0 ? `🪙 ${ch.coinPrice} xu` : "Miễn phí"}</span>
                          <span>🕐 {timeAgo(ch.createdAt)}</span>
                        </div>
                      </div>
                      <button onClick={() => setChapterModal(ch)} style={btnPrimary}>🔍 Đọc & Duyệt</button>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* ──── TAB: HISTORY ──── */}
        {tab === "history" && (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {(["ALL", "APPROVE", "REJECT"] as const).map((f) => (
                <button key={f} onClick={() => setHistoryFilter(f)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${historyFilter === f ? T.accent : T.border}`, background: historyFilter === f ? T.accentLight : T.card, color: historyFilter === f ? T.accent : T.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  {f === "ALL" ? "Tất cả" : f === "APPROVE" ? "✅ Đã duyệt" : "❌ Đã từ chối"}
                </button>
              ))}
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                {(["newest", "oldest"] as const).map((s) => (
                  <button key={s} onClick={() => setHistorySort(s)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${historySort === s ? T.accent : T.border}`, background: historySort === s ? T.accentLight : T.card, color: historySort === s ? T.accent : T.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {s === "newest" ? "🔽 Mới nhất" : "🔼 Cũ nhất"}
                  </button>
                ))}
              </div>
            </div>
            {loadingHistory ? <div style={{ textAlign: "center", padding: "40px 0", color: T.textMuted }}>⏳ Đang tải…</div> :
              filteredHistory.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", background: T.card, borderRadius: 18, border: `1.5px dashed ${T.border}` }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Chưa có lịch sử duyệt</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {filteredHistory.map((h) => (
                    <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: T.card, borderRadius: 12, border: `1.5px solid ${h.action === "APPROVE" ? T.successBorder : T.dangerBorder}` }}>
                      <span style={{ fontSize: 20 }}>{h.action === "APPROVE" ? "✅" : "❌"}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                          {h.targetType === "STORY" ? "📖 " : "📄 "}{h.targetTitle}
                        </div>
                        <div style={{ fontSize: 12, color: T.textMuted }}>
                          {h.storyTitle ? `${h.storyTitle} · ` : ""}{new Date(h.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, ...(h.action === "APPROVE" ? { background: T.successBg, color: T.success } : { background: T.dangerBg, color: T.danger }) }}>
                        {h.action === "APPROVE" ? "Duyệt" : "Từ chối"}
                      </span>
                      {h.note && <span style={{ fontSize: 12, color: T.textMuted, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={h.note}>📝 {h.note}</span>}
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* ──── TAB: CRITERIA ──── */}
        {tab === "criteria" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              {
                icon: "📖", color: T.accent, bg: T.accentLight, border: T.accentBorder,
                title: "Tiêu chí duyệt truyện",
                items: [
                  "Tiêu đề rõ ràng, không quảng cáo, không clickbait",
                  "Mô tả đúng nội dung, không spam, không link lạ",
                  "Ảnh bìa phù hợp, không chứa nội dung vi phạm",
                  "Thể loại phân loại đúng",
                  "Không trùng lặp với truyện đã có trên hệ thống",
                ],
              },
              {
                icon: "📄", color: T.info, bg: T.infoBg, border: T.infoBorder,
                title: "Tiêu chí duyệt chương",
                items: [
                  "Nội dung chương đầy đủ, không bỏ dở giữa chừng",
                  "Không vi phạm bản quyền (sao chép nguyên văn)",
                  "Không chứa nội dung bạo lực, thù ghét, khiêu dâm",
                  "Không quảng cáo, spam link trong nội dung",
                  "Giá coin (nếu có) hợp lý với độ dài chương",
                  "Thứ tự chương đúng logic, không trùng lặp",
                ],
              },
              {
                icon: "⚠️", color: T.warn, bg: T.warnBg, border: T.warnBorder,
                title: "Lưu ý khi duyệt",
                items: [
                  "Luôn ghi chú rõ ràng khi từ chối — giúp tác giả cải thiện",
                  "Nếu chưa chắc, liên hệ admin để xin ý kiến",
                  "Không sử dụng quyền reviewer cho mục đích cá nhân",
                  "Duyệt công bằng, không thiên vị tác giả nào",
                  "Kiểm tra cả nội dung images (link ảnh bìa) khi duyệt",
                ],
              },
              {
                icon: "🚫", color: T.danger, bg: T.dangerBg, border: T.dangerBorder,
                title: "Nội dung phải từ chối ngay",
                items: [
                  "Nội dung vi phạm pháp luật",
                  "Nội dung phân biệt chủng tộc, giới tính, tôn giáo",
                  "Nội dung có tính chất khủng bố, chính trị cực đoan",
                  "Truyện/chương chỉ chứa spam hoặc nội dung tự động",
                  "Vi phạm bản quyền (copy nguyên văn tác phẩm nổi tiếng)",
                ],
              },
            ].map((sec) => (
              <div key={sec.title} style={{ background: sec.bg, border: `1.5px solid ${sec.border}`, borderRadius: T.radius, padding: "18px 20px" }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: sec.color, marginBottom: 10 }}>{sec.icon} {sec.title}</div>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {sec.items.map((item, i) => <li key={i} style={{ fontSize: 13, color: T.text, lineHeight: 1.7 }}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ════════════════ MODALS ════════════════ */}
      {storyModal && <StoryDetailModal story={storyModal} onClose={() => setStoryModal(null)} onReview={handleReviewStory} />}
      {chapterModal && <ChapterReviewModal chapter={chapterModal} onClose={() => setChapterModal(null)} onReview={handleReviewChapter} />}
    </div>
  );
}
