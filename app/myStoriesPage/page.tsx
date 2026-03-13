/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import useStoryService from "@/api/useStory.service";
import useChapterService from "@/api/useChapter.service";
import useHttpClient from "@/api/useHttpClient";
import APP_CONFIG from "@/config/app-config";
import { useToast } from "@/hooks/use-toast";

// ── Types ─────────────────────────────────────────────────────────────────
interface StoryItem {
  id: number;
  title: string;
  description?: string;
  coverUrl?: string;
  status: string;
  viewCount: number;
  totalChapters?: number;
  author: { id: number; fullName: string };
  categories: { id: number; name: string }[];
  createdAt: string;
  updatedAt: string;
}

interface ChapterItem {
  id: number;
  title: string;
  chapterOrder: number;
  wordCount?: number;
  content?: string;
  status: string;
  coinPrice?: number;
  viewCount?: number;
  createdAt: string;
}

// ── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    DRAFT:     { label: "Bản nháp",    bg: "#f3f4f6", color: "#6b7280" },
    PENDING:   { label: "Chờ duyệt",   bg: "#fffbeb", color: "#92400e" },
    PUBLISHED: { label: "Đã xuất bản", bg: "#dcfce7", color: "#166534" },
    REJECTED:  { label: "Bị từ chối",  bg: "#fde8e8", color: "#c23d3f" },
  };
  const s = map[status?.toUpperCase()] ?? { label: status, bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 20, padding: "2px 8px", background: s.bg, color: s.color, border: `1px solid ${s.color}33` }}>
      {s.label}
    </span>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color?: string }) {
  return (
    <div style={{ background: "#fff", border: "1.5px solid #e8e0d6", borderRadius: 14, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: color ?? "#1c1512" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#9e8e82" }}>{label}</div>
    </div>
  );
}

// ── Chapter form modal ────────────────────────────────────────────────────
interface ChapterFormModalProps {
  storyId: number;
  chapter?: ChapterItem | null;   // null = create mode
  onClose: () => void;
  onSaved: () => void;
}

function ChapterFormModal({ storyId, chapter, onClose, onSaved }: ChapterFormModalProps) {
  const httpClient = useHttpClient();
  const toast = useToast();
  const [title, setTitle] = useState(chapter?.title ?? "");
  const [content, setContent] = useState(chapter?.content ?? "");
  const [coinPrice, setCoinPrice] = useState(chapter?.coinPrice ?? 0);
  const [saving, setSaving] = useState(false);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const isEdit = !!chapter;

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      if (isEdit) {
        await httpClient.put(APP_CONFIG.CHAPTER.UPDATE(chapter!.id), { title: title.trim(), content: content.trim(), coinPrice });
        toast.success("Đã cập nhật chương!");
      } else {
        await httpClient.post(APP_CONFIG.CHAPTER.CREATE(storyId), { title: title.trim(), content: content.trim(), coinPrice });
        toast.success("Đã thêm chương mới!");
      }
      onSaved();
      onClose();
    } catch {
      toast.error("Không thể lưu chương. Thử lại sau.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 580, maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 16px 48px rgba(0,0,0,0.22)" }}>
        {/* Header */}
        <div style={{ padding: "18px 20px 14px", borderBottom: "1.5px solid #f0e8e0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 800, color: "#1c1512" }}>
            {isEdit ? "✏ Chỉnh sửa chương" : "📝 Thêm chương mới"}
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #e8e0d6", background: "#fdfaf7", cursor: "pointer", fontSize: 16, color: "#6b5a4e", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Title */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#6b5a4e", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Tiêu đề chương *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="vd. Chương 1: Khởi Đầu Mới"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e8e0d6", fontSize: 14, color: "#1c1512", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#6b5a4e", textTransform: "uppercase", letterSpacing: "0.06em" }}>Nội dung *</label>
              <span style={{ fontSize: 11, color: "#b0a096" }}>{wordCount.toLocaleString()} chữ · {content.length.toLocaleString()} ký tự</span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Viết nội dung chương ở đây…"
              rows={14}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e8e0d6", fontSize: 14, color: "#1c1512", fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.7, boxSizing: "border-box", minHeight: 240 }}
            />
          </div>

          {/* Coin price */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#6b5a4e", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Giá xu (0 = miễn phí)</label>
            <input
              type="number"
              min={0}
              value={coinPrice}
              onChange={(e) => setCoinPrice(Math.max(0, Number(e.target.value)))}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e8e0d6", fontSize: 14, color: "#1c1512", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "10px 22px", borderRadius: 9, border: "1.5px solid #e8e0d6", background: "#fff", color: "#6b5a4e", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Hủy</button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || !content.trim() || saving}
              style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: !title.trim() || !content.trim() || saving ? "#f3f4f6" : "#c23d3f", color: !title.trim() || !content.trim() || saving ? "#9ca3af" : "#fff", fontSize: 13, fontWeight: 700, cursor: !title.trim() || !content.trim() || saving ? "not-allowed" : "pointer" }}
            >
              {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Đăng chương"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Category item ─────────────────────────────────────────────────────────
interface CategoryItem { id: number; name: string; }

// ── Create Story Modal ────────────────────────────────────────────────────
function CreateStoryModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const httpClient = useHttpClient();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    httpClient.get(APP_CONFIG.CATEGORY.LIST)
      .then((res: any) => { const list: CategoryItem[] = res?.data ?? res ?? []; setCategories(Array.isArray(list) ? list : []); })
      .catch(() => setCategories([]))
      .finally(() => setLoadingCats(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCat = (id: number) => setSelectedCategories((p) => p.includes(id) ? p.filter((c) => c !== id) : [...p, id]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await httpClient.post(APP_CONFIG.STORY.CREATE, {
        title: title.trim(),
        description: description.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
      });
      toast.success("Đã tạo tác phẩm mới!");
      onSaved();
      onClose();
    } catch {
      toast.error("Không thể tạo tác phẩm. Thử lại sau.");
    } finally {
      setSaving(false);
    }
  };

  const fLabel: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 700, color: "#6b5a4e", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" };
  const fInput: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e8e0d6", fontSize: 14, color: "#1c1512", fontFamily: "inherit", outline: "none", boxSizing: "border-box" };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 720, maxHeight: "95vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.28)" }}>
        {/* Modal header */}
        <div style={{ padding: "22px 28px 16px", borderBottom: "1.5px solid #f0e8e0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg,#fdf4f4,#fff)", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, color: "#1c1512" }}>📖 Tạo tác phẩm mới</div>
            <div style={{ fontSize: 12, color: "#9e8e82", marginTop: 2 }}>Điền đầy đủ thông tin để tác phẩm nổi bật hơn</div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", border: "1.5px solid #e8e0d6", background: "#fff", cursor: "pointer", fontSize: 16, color: "#6b5a4e", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Modal body */}
        <div style={{ overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Cover + title + description */}
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            {/* Cover preview */}
            <div style={{ flexShrink: 0, width: 120 }}>
              <label style={fLabel}>Ảnh bìa</label>
              <div style={{ width: 120, height: 164, borderRadius: 10, border: "1.5px solid #e8e0d6", overflow: "hidden", background: coverUrl.trim() ? "#f0ebe5" : "linear-gradient(135deg,#c23d3f,#e8a0a1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 32, marginBottom: 8 }}>
                {coverUrl.trim()
                  ? <img src={coverUrl} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  : "📖"}
              </div>
              <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="URL ảnh bìa…" style={{ ...fInput, fontSize: 11, padding: "7px 10px" }} />
            </div>

            {/* Title + description */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={fLabel}>Tên truyện *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tên truyện…" style={fInput} autoFocus />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={{ ...fLabel, margin: 0 }}>Tóm tắt nội dung</label>
                  <span style={{ fontSize: 11, color: "#b0a096" }}>{description.length}/2000</span>
                </div>
                <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 2000))} placeholder="Mô tả hấp dẫn giúp độc giả muốn đọc ngay…" rows={5} style={{ ...fInput, resize: "vertical", lineHeight: 1.6, minHeight: 110 }} />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <label style={fLabel}>
              Thể loại {selectedCategories.length > 0 && <span style={{ color: "#c23d3f", fontWeight: 700 }}>({selectedCategories.length} đã chọn)</span>}
            </label>
            {loadingCats ? (
              <div style={{ fontSize: 13, color: "#9e8e82" }}>Đang tải thể loại...</div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {categories.map((cat) => {
                  const sel = selectedCategories.includes(cat.id);
                  return (
                    <button key={cat.id} onClick={() => toggleCat(cat.id)} style={{ padding: "6px 16px", borderRadius: 20, border: `1.5px solid ${sel ? "#c23d3f" : "#e8e0d6"}`, background: sel ? "#fde8e8" : "#fdfaf7", color: sel ? "#c23d3f" : "#6b5a4e", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      {sel ? "✓ " : ""}{cat.name}
                    </button>
                  );
                })}
                {categories.length === 0 && <span style={{ fontSize: 13, color: "#b0a096", fontStyle: "italic" }}>Không có thể loại.</span>}
              </div>
            )}
          </div>

          {/* Tip */}
          <div style={{ background: "#fffbeb", border: "1.5px solid #fcd34d", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>
            💡 <strong>Mẹo:</strong> Tác phẩm vừa tạo sẽ ở trạng thái <strong>Bản nháp</strong>. Thêm chương xong rồi hãy nộp kiểm duyệt để xuất bản.
          </div>
        </div>

        {/* Modal footer */}
        <div style={{ padding: "16px 28px", borderTop: "1.5px solid #f0e8e0", display: "flex", gap: 12, justifyContent: "flex-end", flexShrink: 0, background: "#fdfaf7" }}>
          <button onClick={onClose} style={{ padding: "11px 24px", borderRadius: 10, border: "1.5px solid #e8e0d6", background: "#fff", color: "#6b5a4e", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Hủy</button>
          <button onClick={handleSave} disabled={!title.trim() || saving} style={{ padding: "11px 28px", borderRadius: 10, border: "none", background: !title.trim() || saving ? "#f3f4f6" : "#c23d3f", color: !title.trim() || saving ? "#9ca3af" : "#fff", fontSize: 14, fontWeight: 700, cursor: !title.trim() || saving ? "not-allowed" : "pointer" }}>
            {saving ? "Đang tạo..." : "🚀 Tạo tác phẩm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function MyStoriesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const storyService = useStoryService();
  const chapterService = useChapterService();
  const httpClient = useHttpClient();
  const toast = useToast();

  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [chaptersMap, setChaptersMap] = useState<Record<number, ChapterItem[]>>({});
  const [loadingChapters, setLoadingChapters] = useState<Record<number, boolean>>({});
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [chapterModal, setChapterModal] = useState<{ storyId: number; chapter?: ChapterItem | null } | null>(null);
  const [deletingChapter, setDeletingChapter] = useState<number | null>(null);
  const [submittingStory, setSubmittingStory] = useState<number | null>(null);

  const loadStories = async () => {
    setLoading(true);
    try {
      const res: any = await storyService.getMyStories({ page: 0, size: 100 });
      const list: StoryItem[] = res?.data?.content ?? res?.data ?? res?.content ?? res ?? [];
      setStories(Array.isArray(list) ? list : []);
    } catch {
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) { router.push("/?login"); return; }
    loadStories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadChapters = async (storyId: number) => {
    setLoadingChapters((p) => ({ ...p, [storyId]: true }));
    try {
      const res: any = await chapterService.getChaptersByStory(storyId, { page: 0, size: 200 });
      const list: ChapterItem[] = res?.data?.content ?? res?.data ?? res?.content ?? res ?? [];
      setChaptersMap((p) => ({ ...p, [storyId]: Array.isArray(list) ? list : [] }));
    } catch {
      setChaptersMap((p) => ({ ...p, [storyId]: [] }));
    } finally {
      setLoadingChapters((p) => ({ ...p, [storyId]: false }));
    }
  };

  const toggleExpand = (id: number) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (!chaptersMap[id]) loadChapters(id);
  };

  const handleDeleteChapter = async (chapterId: number, storyId: number) => {
    if (!window.confirm("Xóa chương này?")) return;
    setDeletingChapter(chapterId);
    try {
      await httpClient.delete(APP_CONFIG.CHAPTER.DELETE(chapterId), {});
      toast.success("Đã xóa chương.");
      loadChapters(storyId);
    } catch {
      toast.error("Không thể xóa chương.");
    } finally {
      setDeletingChapter(null);
    }
  };

  const handleSubmitStory = async (storyId: number) => {
    if (!window.confirm("Nộp truyện này để kiểm duyệt?")) return;
    setSubmittingStory(storyId);
    try {
      await httpClient.post(APP_CONFIG.STORY.SUBMIT(storyId), {});
      toast.success("Đã nộp truyện để kiểm duyệt!");
      loadStories();
    } catch {
      toast.error("Không thể nộp truyện. Thử lại sau.");
    } finally {
      setSubmittingStory(null);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────
  const totalViews = stories.reduce((s, st) => s + (st.viewCount ?? 0), 0);
  const totalChapters = stories.reduce((s, st) => s + (st.totalChapters ?? 0), 0);
  const publishedCount = stories.filter((s) => s.status === "PUBLISHED").length;

  // ── Chapter stats helper ───────────────────────────────────────────────
  const getChapterWordCount = (ch: ChapterItem) => {
    if (ch.wordCount != null) return ch.wordCount;
    if (ch.content) return ch.content.trim().split(/\s+/).filter(Boolean).length;
    return 0;
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", fontSize: 14, color: "#9e8e82" }}>
        ⏳ Đang tải tác phẩm...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f4f0" }}>
      {/* ── Gradient header ── */}
      <div style={{ background: "linear-gradient(135deg, #7c1d1d 0%, #c23d3f 60%, #e85555 100%)", padding: "28px 40px 24px", color: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>✍</div>
              <div>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>Tác phẩm của tôi</h1>
                <p style={{ margin: 0, fontSize: 13, opacity: 0.75 }}>Xin chào, {user?.fullName} — quản lý toàn bộ truyện tại đây</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateStory(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, border: "2px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", flexShrink: 0, backdropFilter: "blur(4px)" }}
            >
              + Tạo tác phẩm mới
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { icon: "📖", label: "Tổng tác phẩm", value: stories.length },
              { icon: "✅", label: "Đã xuất bản", value: publishedCount },
              { icon: "👁", label: "Lượt đọc", value: totalViews.toLocaleString() },
              { icon: "📄", label: "Tổng chương", value: totalChapters.toLocaleString() },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.2)" }}>
                <div style={{ fontSize: 20 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginTop: 4 }}>{s.value}</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "28px 40px 80px" }}>
        {/* Story list */}
      {stories.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", background: "#fdfaf7", borderRadius: 16, border: "1.5px dashed #e8e0d6" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1c1512", marginBottom: 8 }}>Chưa có tác phẩm nào</div>
          <div style={{ fontSize: 14, color: "#9e8e82", marginBottom: 20 }}>Bắt đầu sáng tác và đăng tác phẩm đầu tiên!</div>
          <button onClick={() => setShowCreateStory(true)} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#c23d3f", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            + Tạo tác phẩm
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {stories.map((story) => {
            const isExpanded = expandedId === story.id;
            const chapters = chaptersMap[story.id] ?? [];
            const isLoadingCh = loadingChapters[story.id];
            const totalWords = chapters.reduce((s, ch) => s + getChapterWordCount(ch), 0);
            const avgWords = chapters.length > 0 ? Math.round(totalWords / chapters.length) : 0;

            return (
              <div key={story.id} style={{ background: "#fff", border: "1.5px solid #e8e0d6", borderRadius: 16, overflow: "hidden" }}>
                {/* Story header */}
                <div
                  onClick={() => toggleExpand(story.id)}
                  style={{ padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 16 }}
                >
                  {/* Cover placeholder */}
                  <div style={{ width: 52, height: 72, borderRadius: 8, background: story.coverUrl ? `url(${story.coverUrl}) center/cover` : "linear-gradient(135deg,#c23d3f,#e8a0a1)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20 }}>
                    {!story.coverUrl && "📖"}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: "#1c1512" }}>{story.title}</span>
                      <StatusBadge status={story.status} />
                    </div>

                    {story.description && (
                      <div style={{ fontSize: 13, color: "#6b5a4e", marginBottom: 8, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                        {story.description}
                      </div>
                    )}

                    {/* Stats row */}
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "#9e8e82" }}>
                      <span>👁 {(story.viewCount ?? 0).toLocaleString()} lượt đọc</span>
                      <span>📄 {story.totalChapters ?? 0} chương</span>
                      {isExpanded && chapters.length > 0 && (
                        <>
                          <span>📝 {totalWords.toLocaleString()} chữ</span>
                          <span>⌀ {avgWords.toLocaleString()} chữ/chương</span>
                        </>
                      )}
                      <span>{story.categories?.map((c) => c.name).join(", ") || "Chưa phân loại"}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, alignItems: "flex-end" }}>
                    {(story.status === "DRAFT" || story.status === "REJECTED") && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSubmitStory(story.id); }}
                        disabled={submittingStory === story.id}
                        style={{ fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 8, border: "1px solid #fcd34d", background: "#fffbeb", color: "#92400e", cursor: "pointer" }}
                      >
                        {submittingStory === story.id ? "..." : "📤 Nộp duyệt"}
                      </button>
                    )}
                    <span style={{ fontSize: 18, color: "#9e8e82" }}>{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* Chapter list (expanded) */}
                {isExpanded && (
                  <div style={{ borderTop: "1.5px solid #f0e8e0", padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#3d2f28" }}>
                        Chương ({isLoadingCh ? "..." : chapters.length})
                        {chapters.length > 0 && <span style={{ fontSize: 12, fontWeight: 400, color: "#9e8e82", marginLeft: 8 }}>· tổng {totalWords.toLocaleString()} chữ · trung bình {avgWords.toLocaleString()} chữ/chương</span>}
                      </div>
                      <button
                        onClick={() => setChapterModal({ storyId: story.id, chapter: null })}
                        style={{ fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 8, border: "none", background: "#c23d3f", color: "#fff", cursor: "pointer" }}
                      >
                        + Thêm chương
                      </button>
                    </div>

                    {isLoadingCh ? (
                      <div style={{ textAlign: "center", padding: "20px 0", fontSize: 13, color: "#9e8e82" }}>Đang tải...</div>
                    ) : chapters.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "24px 0", fontSize: 13, color: "#b0a096" }}>Chưa có chương nào. Hãy thêm chương đầu tiên!</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {chapters.map((ch) => {
                          const words = getChapterWordCount(ch);
                          const readMins = Math.max(1, Math.ceil(words / 200));
                          return (
                            <div key={ch.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#fdfaf7", borderRadius: 10, border: "1.5px solid #f0e8e0" }}>
                              {/* Order badge */}
                              <div style={{ width: 28, height: 28, borderRadius: 7, background: "#f0ebe6", color: "#9e8e82", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                {ch.chapterOrder}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#1c1512", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ch.title}</div>
                                <div style={{ fontSize: 11, color: "#b0a096", display: "flex", gap: 10, marginTop: 2, flexWrap: "wrap" }}>
                                  <span>📝 {words.toLocaleString()} chữ</span>
                                  <span>⏱ ~{readMins} phút đọc</span>
                                  {(ch.viewCount ?? 0) > 0 && <span>👁 {(ch.viewCount ?? 0).toLocaleString()} lượt</span>}
                                  {(ch.coinPrice ?? 0) > 0 && <span>🪙 {ch.coinPrice} xu</span>}
                                </div>
                              </div>
                              <StatusBadge status={ch.status} />
                              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                <button
                                  onClick={() => setChapterModal({ storyId: story.id, chapter: ch })}
                                  style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 7, border: "1.5px solid #e8e0d6", background: "#fff", color: "#6b5a4e", cursor: "pointer" }}
                                >
                                  ✏ Sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteChapter(ch.id, story.id)}
                                  disabled={deletingChapter === ch.id}
                                  style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 7, border: "1.5px solid #e8e0d6", background: "#fff", color: "#c23d3f", cursor: "pointer" }}
                                >
                                  {deletingChapter === ch.id ? "..." : "🗑"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      </div>

      {/* Modals */}
      {showCreateStory && (
        <CreateStoryModal onClose={() => setShowCreateStory(false)} onSaved={loadStories} />
      )}

      {chapterModal && (
        <ChapterFormModal
          storyId={chapterModal.storyId}
          chapter={chapterModal.chapter}
          onClose={() => setChapterModal(null)}
          onSaved={() => loadChapters(chapterModal.storyId)}
        />
      )}
    </div>
  );
}
