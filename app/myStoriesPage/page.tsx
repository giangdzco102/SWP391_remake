/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import useStoryService from "@/api/useStory.service";
import useChapterService from "@/api/useChapter.service";
import useHttpClient from "@/api/useHttpClient";
import APP_CONFIG from "@/config/app-config";
import { useToast } from "@/hooks/use-toast";

/* ================================================================
   TYPES
   ================================================================ */
interface EditRequest {
  id: number;
  chapterId: number;
  chapterTitle: string;
  storyTitle: string;
  authorId: number;
  authorName: string;
  editorId?: number;
  editorName?: string;
  coinReward: number;
  description?: string;
  editedContent?: string;
  editorNote?: string;
  authorNote?: string;
  status: "OPEN" | "IN_PROGRESS" | "SUBMITTED" | "APPROVED" | "CANCELLED";
  attemptCount: number;
  createdAt: string;
  updatedAt: string;
}

interface StoryItem {
  id: number;
  title: string;
  description?: string;
  coverUrl?: string;
  status: string;
  viewCount: number;
  totalChapters?: number;
  reviewNote?: string;
  author: { id: number; fullName: string };
  categories?: { id: number; name: string }[];
  categoryIds?: number[];
  categoryNames?: string[];
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
  reviewNote?: string;
  publishAt?: string;
  createdAt: string;
}

interface WalletInfo {
  balance: number;
  lockedBalance: number;
}

interface WalletTx {
  id: number;
  type: string;
  amount: number;
  description?: string;
  createdAt: string;
}

interface CategoryItem {
  id: number;
  name: string;
}

/* ================================================================
   THEME TOKENS — Soft eye-friendly palette
   ================================================================ */
const T = {
  bg: "#f6f4f1",
  card: "#ffffff",
  cardHover: "#fdfcfa",
  border: "#e8e3dc",
  borderLight: "#f0ece6",
  text: "#2d2319",
  textSec: "#7a6e63",
  textMuted: "#b5a99e",
  accent: "#c2613a",
  accentLight: "#fef0ea",
  accentBorder: "#f5c8b4",
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
  headerGrad: "linear-gradient(135deg, #3a2a1d 0%, #5c3d28 50%, #7a5035 100%)",
  radius: 14,
  radiusSm: 10,
  shadow: "0 2px 12px rgba(45,35,25,0.06)",
  shadowMd: "0 6px 24px rgba(45,35,25,0.1)",
  font: "'DM Sans', sans-serif",
  fontSerif: "'Playfair Display', 'Lora', Georgia, serif",
};

/* ================================================================
   STATUS BADGE
   ================================================================ */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; border: string }> = {
    DRAFT:          { label: "Bản nháp",     bg: T.grayBg,    color: T.gray,    border: T.grayBorder },
    EDITED:         { label: "Đã chỉnh sửa", bg: T.purpleBg, color: T.purple,  border: T.purpleBorder },
    PENDING_REVIEW: { label: "Chờ duyệt",   bg: T.warnBg,    color: T.warn,    border: T.warnBorder },
    PENDING:        { label: "Chờ duyệt",   bg: T.warnBg,    color: T.warn,    border: T.warnBorder },
    APPROVED:       { label: "Đã duyệt",    bg: T.successBg, color: T.success, border: T.successBorder },
    PUBLISHED:      { label: "Đã xuất bản",  bg: T.infoBg,   color: T.info,    border: T.infoBorder },
    REJECTED:       { label: "Bị từ chối",  bg: T.dangerBg,  color: T.danger,  border: T.dangerBorder },
    HIDDEN:         { label: "Đã ẩn",       bg: T.grayBg,    color: T.gray,    border: T.grayBorder },
  };
  const s = map[status?.toUpperCase()] ?? { label: status, bg: T.grayBg, color: T.gray, border: T.grayBorder };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 10px", background: s.bg, color: s.color, border: `1.5px solid ${s.border}`, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

/* ================================================================
   EDIT REQUEST STATUS BADGE
   ================================================================ */
function EditReqBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; border: string }> = {
    OPEN:        { label: "Đang chờ Editor", bg: T.infoBg,    color: T.info,    border: T.infoBorder },
    IN_PROGRESS: { label: "Editor đang làm", bg: T.warnBg,   color: T.warn,    border: T.warnBorder },
    SUBMITTED:   { label: "Chờ bạn duyệt",  bg: T.accentLight, color: T.accent, border: T.accentBorder },
    APPROVED:    { label: "Hoàn thành",      bg: T.successBg, color: T.success, border: T.successBorder },
    CANCELLED:   { label: "Đã huỷ",         bg: T.dangerBg,  color: T.danger,  border: T.dangerBorder },
  };
  const s = map[status] ?? { label: status, bg: T.grayBg, color: T.gray, border: T.grayBorder };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 10px", background: s.bg, color: s.color, border: `1.5px solid ${s.border}` }}>
      {s.label}
    </span>
  );
}

/* ================================================================
   HELPERS
   ================================================================ */
function stripHtml(html: string): string {
  if (typeof document === "undefined")
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const d = document.createElement("div");
  d.innerHTML = html;
  return (d.textContent ?? d.innerText ?? "").trim();
}

function toHtml(text: string): string {
  if (/<[a-z]/i.test(text)) return text;
  return text.split(/\n+/).filter(Boolean).map((p) => `<p>${p}</p>`).join("") || "<p><br></p>";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d} ngày trước`;
  const h = Math.floor(diff / 3600000);
  if (h > 0) return `${h} giờ trước`;
  return `${Math.floor(diff / 60000)} phút trước`;
}

/* ================================================================
   SHARED BUTTON STYLES
   ================================================================ */
const btnBase: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: T.radiusSm,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  border: "none",
  fontFamily: T.font,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  transition: "all 0.15s ease",
};

const btnPrimary: React.CSSProperties = { ...btnBase, background: T.accent, color: "#fff" };
const btnOutline: React.CSSProperties = { ...btnBase, background: T.card, color: T.textSec, border: `1.5px solid ${T.border}` };
const btnSuccess: React.CSSProperties = { ...btnBase, background: T.success, color: "#fff" };
const btnDanger: React.CSSProperties = { ...btnBase, background: T.danger, color: "#fff" };
const btnWarn: React.CSSProperties = { ...btnBase, background: T.warnBg, color: T.warn, border: `1.5px solid ${T.warnBorder}` };
const btnPurple: React.CSSProperties = { ...btnBase, background: T.purpleBg, color: T.purple, border: `1.5px solid ${T.purpleBorder}` };
const btnDisabled: React.CSSProperties = { ...btnBase, background: "#f0edea", color: T.textMuted, cursor: "not-allowed" };

function fLabel(): React.CSSProperties { return { display: "block", fontSize: 12, fontWeight: 700, color: T.textSec, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }; }
function fInput(): React.CSSProperties { return { width: "100%", padding: "10px 14px", borderRadius: T.radiusSm, border: `1.5px solid ${T.border}`, fontSize: 14, color: T.text, fontFamily: T.font, outline: "none", boxSizing: "border-box", background: T.card, transition: "border-color 0.15s" }; }

/* ================================================================
   RICH TEXT EDITOR
   ================================================================ */
function RichEditor({ value, onChange }: { value: string; onChange: (h: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (ref.current) ref.current.innerHTML = toHtml(value); }, []);// eslint-disable-line react-hooks/exhaustive-deps
  const exec = (cmd: string, val?: string) => { document.execCommand(cmd, false, val); ref.current?.focus(); if (ref.current) onChange(ref.current.innerHTML); };
  const tb = (lbl: string, cmd: string, title: string, val?: string, extra?: React.CSSProperties) => (
    <button type="button" title={title} onMouseDown={(e) => { e.preventDefault(); exec(cmd, val); }} style={{ minWidth: 28, padding: "4px 8px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.card, cursor: "pointer", fontSize: 12, color: T.text, fontFamily: T.font, ...extra }}>
      {lbl}
    </button>
  );
  const sep = <div style={{ width: 1, alignSelf: "stretch", background: T.border, margin: "0 2px" }} />;
  return (
    <div style={{ border: `1.5px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden", background: T.card, boxShadow: "inset 0 1px 4px rgba(0,0,0,0.03)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, padding: "8px 10px", background: T.grayBg, borderBottom: `1px solid ${T.border}`, alignItems: "center" }}>
        {tb("B", "bold", "In đậm", undefined, { fontWeight: 800 })}
        {tb("I", "italic", "In nghiêng", undefined, { fontStyle: "italic" })}
        {tb("U", "underline", "Gạch chân", undefined, { textDecoration: "underline" })}
        {sep}
        {tb("H1", "formatBlock", "Heading 1", "h1", { fontWeight: 800 })}
        {tb("H2", "formatBlock", "Heading 2", "h2", { fontWeight: 700 })}
        {tb("¶", "formatBlock", "Paragraph", "p")}
        {sep}
        {tb("❝", "formatBlock", "Quote", "blockquote")}
        {tb("•", "insertUnorderedList", "Danh sách")}
        {tb("1.", "insertOrderedList", "Đánh số")}
        {sep}
        {tb("↺", "undo", "Undo")}
        {tb("↻", "redo", "Redo")}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => { if (ref.current) onChange(ref.current.innerHTML); }}
        style={{ minHeight: 280, maxHeight: 500, overflowY: "auto", padding: "16px 20px", fontSize: 15, color: T.text, fontFamily: "'Lora', Georgia, serif", lineHeight: 1.85, outline: "none" }}
      />
    </div>
  );
}

/* ================================================================
   CHAPTER FORM MODAL
   ================================================================ */
function ChapterFormModal({ storyId, chapter, onClose, onSaved }: { storyId: number; chapter?: ChapterItem | null; onClose: () => void; onSaved: () => void }) {
  const httpClient = useHttpClient();
  const toast = useToast();
  const [title, setTitle] = useState(chapter?.title ?? "");
  const [content, setContent] = useState(chapter?.content ?? "");
  const [coinPrice, setCoinPrice] = useState(chapter?.coinPrice ?? 0);
  const [publishAt, setPublishAt] = useState(chapter?.publishAt ?? "");
  const [saving, setSaving] = useState(false);
  const wordCount = stripHtml(content).split(/\s+/).filter(Boolean).length;
  const hasContent = stripHtml(content).trim().length > 0;
  const isEdit = !!chapter;

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const body: any = { title: title.trim(), content: content.trim(), coinPrice };
      if (publishAt) body.publishAt = publishAt;
      if (!isEdit) body.chapterOrder = 0; // let backend assign
      if (isEdit) {
        await httpClient.put(APP_CONFIG.CHAPTER.UPDATE(chapter!.id), body);
        toast.success("Đã cập nhật chương!");
      } else {
        await httpClient.post(APP_CONFIG.CHAPTER.CREATE(storyId), body);
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
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)" }}>
      <div style={{ background: T.card, borderRadius: 20, width: "100%", maxWidth: 860, maxHeight: "94vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: T.shadowMd }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: `1.5px solid ${T.borderLight}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ fontFamily: T.fontSerif, fontSize: 18, fontWeight: 800, color: T.text }}>
            {isEdit ? "✏️ Chỉnh sửa chương" : "📝 Thêm chương mới"}
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${T.border}`, background: T.bg, cursor: "pointer", fontSize: 16, color: T.textSec, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={fLabel()}>Tiêu đề chương *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="vd. Chương 1: Khởi Đầu Mới" style={fInput()} />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ ...fLabel(), margin: 0 }}>Nội dung *</label>
              <span style={{ fontSize: 11, color: T.textMuted }}>{wordCount.toLocaleString()} chữ</span>
            </div>
            <RichEditor value={content} onChange={setContent} />
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={fLabel()}>Giá xu (0 = miễn phí)</label>
              <input type="number" min={0} value={coinPrice} onChange={(e) => setCoinPrice(Math.max(0, Number(e.target.value)))} style={fInput()} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={fLabel()}>Lên lịch phát hành (tuỳ chọn)</label>
              <input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} style={fInput()} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={btnOutline}>Hủy</button>
            <button onClick={handleSave} disabled={!title.trim() || !hasContent || saving} style={!title.trim() || !hasContent || saving ? btnDisabled : btnPrimary}>
              {saving ? "Đang lưu…" : isEdit ? "💾 Lưu thay đổi" : "📝 Đăng chương"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   CREATE / EDIT STORY MODAL
   ================================================================ */
function StoryFormModal({ story, onClose, onSaved }: { story?: StoryItem | null; onClose: () => void; onSaved: () => void }) {
  const httpClient = useHttpClient();
  const toast = useToast();
  const isEdit = !!story;
  const [title, setTitle] = useState(story?.title ?? "");
  const [description, setDescription] = useState(story?.description ?? "");
  const [coverUrl, setCoverUrl] = useState(story?.coverUrl ?? "");
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    story?.categoryIds ?? story?.categories?.map((c) => c.id) ?? []
  );
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    httpClient.get(APP_CONFIG.CATEGORY.LIST)
      .then((res: any) => { const list = res?.data ?? res ?? []; setCategories(Array.isArray(list) ? list : []); })
      .catch(() => setCategories([]))
      .finally(() => setLoadingCats(false));
  }, []);// eslint-disable-line react-hooks/exhaustive-deps

  const toggleCat = (id: number) => setSelectedCategories((p) => p.includes(id) ? p.filter((c) => c !== id) : [...p, id]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const body: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
      };
      if (isEdit) {
        await httpClient.put(APP_CONFIG.STORY.UPDATE(story!.id), body);
        toast.success("Đã cập nhật tác phẩm!");
      } else {
        await httpClient.post(APP_CONFIG.STORY.CREATE, body);
        toast.success("Đã tạo tác phẩm mới!");
      }
      onSaved();
      onClose();
    } catch {
      toast.error(isEdit ? "Không thể cập nhật." : "Không thể tạo tác phẩm.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)" }}>
      <div style={{ background: T.card, borderRadius: 20, width: "100%", maxWidth: 720, maxHeight: "95vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: T.shadowMd }}>
        <div style={{ padding: "22px 28px 16px", borderBottom: `1.5px solid ${T.borderLight}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: T.fontSerif, fontSize: 20, fontWeight: 800, color: T.text }}>
              {isEdit ? "✏️ Sửa thông tin truyện" : "📖 Tạo tác phẩm mới"}
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
              {isEdit ? "Cập nhật thông tin truyện của bạn" : "Điền đầy đủ thông tin để tác phẩm nổi bật hơn"}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", border: `1.5px solid ${T.border}`, background: T.bg, cursor: "pointer", fontSize: 16, color: T.textSec, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, width: 120 }}>
              <label style={fLabel()}>Ảnh bìa</label>
              <div style={{ width: 120, height: 164, borderRadius: T.radiusSm, border: `1.5px solid ${T.border}`, overflow: "hidden", background: coverUrl.trim() ? T.grayBg : T.headerGrad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 32, marginBottom: 8 }}>
                {coverUrl.trim()
                  ? <img src={coverUrl} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  : "📖"}
              </div>
              <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="URL ảnh bìa…" style={{ ...fInput(), fontSize: 11, padding: "7px 10px" }} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={fLabel()}>Tên truyện *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tên truyện…" style={fInput()} autoFocus />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={{ ...fLabel(), margin: 0 }}>Tóm tắt nội dung</label>
                  <span style={{ fontSize: 11, color: T.textMuted }}>{description.length}/2000</span>
                </div>
                <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 2000))} placeholder="Mô tả hấp dẫn giúp độc giả muốn đọc ngay…" rows={5} style={{ ...fInput(), resize: "vertical", lineHeight: 1.6, minHeight: 110 }} />
              </div>
            </div>
          </div>
          <div>
            <label style={fLabel()}>Thể loại {selectedCategories.length > 0 && <span style={{ color: T.accent }}>({selectedCategories.length})</span>}</label>
            {loadingCats ? <div style={{ fontSize: 13, color: T.textMuted }}>Đang tải…</div> : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {categories.map((cat) => {
                  const sel = selectedCategories.includes(cat.id);
                  return (
                    <button key={cat.id} onClick={() => toggleCat(cat.id)} style={{ padding: "6px 16px", borderRadius: 20, border: `1.5px solid ${sel ? T.accent : T.border}`, background: sel ? T.accentLight : T.bg, color: sel ? T.accent : T.textSec, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      {sel ? "✓ " : ""}{cat.name}
                    </button>
                  );
                })}
                {categories.length === 0 && <span style={{ fontSize: 13, color: T.textMuted, fontStyle: "italic" }}>Không có thể loại.</span>}
              </div>
            )}
          </div>
          {!isEdit && (
            <div style={{ background: T.warnBg, border: `1.5px solid ${T.warnBorder}`, borderRadius: T.radiusSm, padding: "12px 16px", fontSize: 13, color: T.warn, lineHeight: 1.6 }}>
              💡 <strong>Mẹo:</strong> Tác phẩm vừa tạo sẽ ở trạng thái <strong>Bản nháp</strong>. Thêm chương xong rồi hãy nộp kiểm duyệt để xuất bản.
            </div>
          )}
        </div>
        <div style={{ padding: "16px 28px", borderTop: `1.5px solid ${T.borderLight}`, display: "flex", gap: 12, justifyContent: "flex-end", flexShrink: 0, background: T.bg }}>
          <button onClick={onClose} style={btnOutline}>Hủy</button>
          <button onClick={handleSave} disabled={!title.trim() || saving} style={!title.trim() || saving ? btnDisabled : btnPrimary}>
            {saving ? "Đang lưu…" : isEdit ? "💾 Cập nhật" : "🚀 Tạo tác phẩm"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   CREATE EDIT REQUEST MODAL
   ================================================================ */
function CreateEditRequestModal({ chapter, walletBalance, onClose, onCreated }: { chapter: ChapterItem; walletBalance: number; onClose: () => void; onCreated: () => void }) {
  const httpClient = useHttpClient();
  const toast = useToast();
  const [coinReward, setCoinReward] = useState(50);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (coinReward < 1) return;
    setSaving(true);
    try {
      await httpClient.post(APP_CONFIG.EDIT_REQUEST.CREATE, { chapterId: chapter.id, coinReward, description: description.trim() || undefined });
      toast.success("Đã đăng yêu cầu chỉnh sửa!");
      onCreated();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Không thể tạo yêu cầu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)" }}>
      <div style={{ background: T.card, borderRadius: 20, width: "100%", maxWidth: 480, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: T.shadowMd }}>
        <div style={{ padding: "18px 22px 14px", borderBottom: `1.5px solid ${T.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: T.fontSerif, fontSize: 17, fontWeight: 800, color: T.text }}>🎨 Đặt yêu cầu chỉnh sửa</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Chương: {chapter.title}</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${T.border}`, background: T.bg, cursor: "pointer", fontSize: 16, color: T.textSec, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: T.warnBg, border: `1.5px solid ${T.warnBorder}`, borderRadius: T.radiusSm, padding: "10px 14px", fontSize: 13, color: T.warn, lineHeight: 1.6 }}>
            ⚠️ Coin sẽ bị khoá cho đến khi bạn duyệt (approve) hoặc huỷ yêu cầu.
            <br />💰 Số dư hiện tại: <strong>{walletBalance.toLocaleString()} xu</strong>
          </div>
          <div>
            <label style={fLabel()}>Tiền thưởng (coin) *</label>
            <input type="number" min={1} value={coinReward} onChange={(e) => setCoinReward(Math.max(1, Number(e.target.value)))} style={fInput()} />
          </div>
          <div>
            <label style={fLabel()}>Mô tả yêu cầu</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Lỗi chính tả, văn phong, cấu trúc cần chỉnh sửa…" rows={4} style={{ ...fInput(), resize: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={btnOutline}>Hủy</button>
            <button onClick={handleSubmit} disabled={coinReward < 1 || saving} style={coinReward < 1 || saving ? btnDisabled : btnPurple}>
              {saving ? "Đang đăng…" : "🎨 Đăng yêu cầu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   AUTHOR REVIEW EDIT MODAL — side by side
   ================================================================ */
function AuthorReviewEditModal({ request, originalContent, onClose, onAction }: { request: EditRequest; originalContent?: string; onClose: () => void; onAction: (reqId: number, isApprove: boolean, note: string) => Promise<void> }) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [viewTab, setViewTab] = useState<"side" | "edited">("side");

  const handleApprove = async () => { setSaving(true); await onAction(request.id, true, note); setSaving(false); };
  const handleReject = async () => {
    if (!note.trim()) { alert("Vui lòng nhập lý do để Editor biết đường sửa lại!"); return; }
    setSaving(true); await onAction(request.id, false, note); setSaving(false);
  };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)" }}>
      <div style={{ background: T.card, borderRadius: 20, width: "100%", maxWidth: 960, maxHeight: "94vh", display: "flex", flexDirection: "column", boxShadow: T.shadowMd, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px 12px", borderBottom: `1.5px solid ${T.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: T.fontSerif, fontSize: 16, fontWeight: 800, color: T.text }}>📋 Duyệt bản chỉnh sửa</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{request.chapterTitle} · Editor: {request.editorName} · Lần #{request.attemptCount}</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${T.border}`, background: T.bg, cursor: "pointer", fontSize: 16, color: T.textSec, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "16px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
          {request.editorNote && (
            <div style={{ background: T.successBg, border: `1.5px solid ${T.successBorder}`, borderRadius: T.radiusSm, padding: "10px 14px", fontSize: 13, color: T.success }}>
              💬 <strong>Editor ghi chú:</strong> {request.editorNote}
            </div>
          )}
          {/* View toggle */}
          <div style={{ display: "flex", gap: 6 }}>
            {(["side", "edited"] as const).map((v) => (
              <button key={v} onClick={() => setViewTab(v)} style={{ padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${viewTab === v ? T.accent : T.border}`, background: viewTab === v ? T.accentLight : T.card, color: viewTab === v ? T.accent : T.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {v === "side" ? "📐 So sánh" : "📝 Bản chỉnh sửa"}
              </button>
            ))}
          </div>
          {viewTab === "side" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 6, textTransform: "uppercase" }}>📄 Nội dung gốc</div>
                <div style={{ padding: 14, background: T.grayBg, border: `1px solid ${T.grayBorder}`, borderRadius: T.radiusSm, fontSize: 13, color: T.text, lineHeight: 1.8, minHeight: 200, maxHeight: 400, overflowY: "auto", whiteSpace: "pre-wrap" }}>
                  {originalContent ? stripHtml(originalContent) : "(Không có dữ liệu gốc)"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, marginBottom: 6, textTransform: "uppercase" }}>✏️ Bản chỉnh sửa</div>
                <div style={{ padding: 14, background: T.accentLight, border: `1px solid ${T.accentBorder}`, borderRadius: T.radiusSm, fontSize: 13, color: T.text, lineHeight: 1.8, minHeight: 200, maxHeight: 400, overflowY: "auto", whiteSpace: "pre-wrap" }}>
                  {request.editedContent || "(Trống)"}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: 16, background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 14, color: T.text, lineHeight: 1.8, minHeight: 200, maxHeight: 500, overflowY: "auto", whiteSpace: "pre-wrap" }}>
              {request.editedContent || "(Trống)"}
            </div>
          )}
          <div>
            <label style={fLabel()}>Phản hồi của bạn (bắt buộc khi từ chối)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nhập nhận xét / lý do từ chối…" rows={3} style={{ ...fInput(), resize: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={btnOutline}>Đóng</button>
            <button onClick={handleReject} disabled={saving} style={saving ? btnDisabled : btnDanger}>❌ Yêu cầu sửa lại</button>
            <button onClick={handleApprove} disabled={saving} style={saving ? btnDisabled : btnSuccess}>✅ Chấp nhận</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   WALLET SECTION
   ================================================================ */
function WalletSection({ wallet, transactions, onTopup, loadingTx }: { wallet: WalletInfo | null; transactions: WalletTx[]; onTopup: (amount: number) => void; loadingTx: boolean }) {
  const [amount, setAmount] = useState(100);
  const txColorMap: Record<string, string> = {
    TOPUP: T.success, BUY: T.info, GIFT: T.purple, REWARD: T.accent, LOCK: T.warn, RELEASE: T.success,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <div style={{ background: T.successBg, border: `1.5px solid ${T.successBorder}`, borderRadius: T.radius, padding: "18px 20px" }}>
          <div style={{ fontSize: 12, color: T.success, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Số dư khả dụng</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: T.success }}>{(wallet?.balance ?? 0).toLocaleString()} <span style={{ fontSize: 14 }}>xu</span></div>
        </div>
        <div style={{ background: T.warnBg, border: `1.5px solid ${T.warnBorder}`, borderRadius: T.radius, padding: "18px 20px" }}>
          <div style={{ fontSize: 12, color: T.warn, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Đang khoá</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: T.warn }}>{(wallet?.lockedBalance ?? 0).toLocaleString()} <span style={{ fontSize: 14 }}>xu</span></div>
        </div>
        <div style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: T.radius, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 12, color: T.textSec, fontWeight: 700, textTransform: "uppercase" }}>Nạp coin</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="number" min={1} value={amount} onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))} style={{ ...fInput(), flex: 1, padding: "8px 10px" }} />
            <button onClick={() => onTopup(amount)} style={btnPrimary}>Nạp</button>
          </div>
        </div>
      </div>
      <div style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.borderLight}`, fontWeight: 700, fontSize: 14, color: T.text }}>📜 Lịch sử giao dịch</div>
        <div style={{ maxHeight: 320, overflowY: "auto" }}>
          {loadingTx ? <div style={{ padding: 20, textAlign: "center", color: T.textMuted }}>Đang tải…</div> :
            transactions.length === 0 ? <div style={{ padding: 20, textAlign: "center", color: T.textMuted }}>Chưa có giao dịch.</div> :
              transactions.map((tx) => (
                <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: `1px solid ${T.borderLight}` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: txColorMap[tx.type] ?? T.gray, background: T.grayBg, borderRadius: 6, padding: "2px 8px", minWidth: 60, textAlign: "center" }}>{tx.type}</span>
                  <div style={{ flex: 1, fontSize: 13, color: T.text }}>{tx.description || "—"}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: tx.amount >= 0 ? T.success : T.danger }}>{tx.amount >= 0 ? "+" : ""}{tx.amount.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{new Date(tx.createdAt).toLocaleDateString("vi-VN")}</div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function MyStoriesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const storyService = useStoryService();
  const chapterService = useChapterService();
  const httpClient = useHttpClient();
  const toast = useToast();

  type Tab = "stories" | "editRequests" | "wallet";
  const [tab, setTab] = useState<Tab>("stories");
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [editRequests, setEditRequests] = useState<EditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [reviewEditModal, setReviewEditModal] = useState<EditRequest | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [chaptersMap, setChaptersMap] = useState<Record<number, ChapterItem[]>>({});
  const [loadingChapters, setLoadingChapters] = useState<Record<number, boolean>>({});
  const [showStoryForm, setShowStoryForm] = useState<StoryItem | null | false>(false);
  const [chapterModal, setChapterModal] = useState<{ storyId: number; chapter?: ChapterItem | null } | null>(null);
  const [deletingChapter, setDeletingChapter] = useState<number | null>(null);
  const [submittingStory, setSubmittingStory] = useState<number | null>(null);
  const [submittingChapter, setSubmittingChapter] = useState<number | null>(null);
  const [publishingChapter, setPublishingChapter] = useState<number | null>(null);
  const [editRequestModal, setEditRequestModal] = useState<ChapterItem | null>(null);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [walletTxs, setWalletTxs] = useState<WalletTx[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [erFilter, setErFilter] = useState<string>("ALL");
  const [storyFilter, setStoryFilter] = useState<string>("ALL");

  /* ── Data loading ── */
  const loadStories = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await storyService.getMyStories({ page: 0, size: 100 });
      const list: StoryItem[] = res?.data?.content ?? res?.data ?? res?.content ?? res ?? [];
      setStories(Array.isArray(list) ? list : []);
    } catch { setStories([]); }
    finally { setLoading(false); }
  }, [storyService]);

  const loadEditRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const res: any = await httpClient.get(APP_CONFIG.EDIT_REQUEST.MY);
      const list = res?.data?.content ?? res?.data ?? res?.content ?? res ?? [];
      setEditRequests(Array.isArray(list) ? list : []);
    } catch { setEditRequests([]); }
    finally { setLoadingRequests(false); }
  }, [httpClient]);

  const loadWallet = useCallback(async () => {
    try {
      const res: any = await httpClient.get(APP_CONFIG.WALLET.GET);
      setWallet(res?.data ?? res ?? null);
    } catch { /* ignore */ }
  }, [httpClient]);

  const loadWalletTxs = useCallback(async () => {
    setLoadingTx(true);
    try {
      const res: any = await httpClient.get(APP_CONFIG.WALLET.TRANSACTIONS);
      const list = res?.data?.content ?? res?.data ?? res?.content ?? res ?? [];
      setWalletTxs(Array.isArray(list) ? list : []);
    } catch { setWalletTxs([]); }
    finally { setLoadingTx(false); }
  }, [httpClient]);

  useEffect(() => {
    if (!user) { router.push("/?login"); return; }
    loadStories();
    loadWallet();
  }, [user]);// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tab === "editRequests" && editRequests.length === 0) loadEditRequests();
    if (tab === "wallet" && walletTxs.length === 0) loadWalletTxs();
  }, [tab]);// eslint-disable-line react-hooks/exhaustive-deps

  /* ── Actions ── */
  const handleActionEditReq = async (reqId: number, isApprove: boolean, note: string) => {
    try {
      const ep = isApprove ? APP_CONFIG.EDIT_REQUEST.APPROVE(reqId) : APP_CONFIG.EDIT_REQUEST.REJECT(reqId);
      await httpClient.post(ep, isApprove ? {} : { authorNote: note || undefined });
      toast.success(isApprove ? "Đã duyệt bản chỉnh sửa!" : "Đã từ chối, gửi lại cho Editor!");
      setReviewEditModal(null);
      loadEditRequests();
      if (isApprove) loadWallet();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi cập nhật yêu cầu");
    }
  };

  const handleCancelEditReq = async (reqId: number) => {
    if (!window.confirm("Huỷ yêu cầu? Coin sẽ được hoàn lại.")) return;
    try {
      await httpClient.post(APP_CONFIG.EDIT_REQUEST.CANCEL(reqId), {});
      toast.success("Đã huỷ yêu cầu!");
      loadEditRequests();
      loadWallet();
    } catch { toast.error("Không thể huỷ yêu cầu lúc này."); }
  };

  const loadChapters = async (storyId: number) => {
    setLoadingChapters((p) => ({ ...p, [storyId]: true }));
    try {
      const res: any = await chapterService.getChaptersByStory(storyId, { page: 0, size: 200 });
      const list: ChapterItem[] = res?.data?.content ?? res?.data ?? res?.content ?? res ?? [];
      setChaptersMap((p) => ({ ...p, [storyId]: Array.isArray(list) ? list : [] }));
    } catch { setChaptersMap((p) => ({ ...p, [storyId]: [] })); }
    finally { setLoadingChapters((p) => ({ ...p, [storyId]: false })); }
  };

  const toggleExpand = (id: number) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (!chaptersMap[id]) loadChapters(id);
  };

  const handleDeleteChapter = async (cId: number, sId: number) => {
    if (!window.confirm("Xoá chương này?")) return;
    setDeletingChapter(cId);
    try { await httpClient.delete(APP_CONFIG.CHAPTER.DELETE(cId), {}); toast.success("Đã xoá chương."); loadChapters(sId); }
    catch { toast.error("Không thể xoá chương."); }
    finally { setDeletingChapter(null); }
  };

  const handleSubmitStory = async (sId: number) => {
    if (!window.confirm("Nộp truyện này để kiểm duyệt?")) return;
    setSubmittingStory(sId);
    try { await httpClient.post(APP_CONFIG.STORY.SUBMIT(sId), {}); toast.success("Truyện đã được gửi lên Reviewer!"); loadStories(); }
    catch { toast.error("Không thể nộp truyện."); }
    finally { setSubmittingStory(null); }
  };

  const handleSubmitChapter = async (cId: number, sId: number) => {
    if (!window.confirm("Nộp chương này lên Reviewer duyệt?")) return;
    setSubmittingChapter(cId);
    try { await httpClient.post(APP_CONFIG.CHAPTER.SUBMIT(cId), {}); toast.success("Đã nộp chương — chờ kiểm duyệt!"); loadChapters(sId); }
    catch { toast.error("Không thể nộp chương."); }
    finally { setSubmittingChapter(null); }
  };

  const handlePublishChapter = async (cId: number, sId: number) => {
    if (!window.confirm("Xuất bản chương này cho độc giả?")) return;
    setPublishingChapter(cId);
    try { await httpClient.post(APP_CONFIG.CHAPTER.PUBLISH(cId), {}); toast.success("Chương đã được phát hành! 🎉"); loadChapters(sId); }
    catch { toast.error("Không thể phát hành chương."); }
    finally { setPublishingChapter(null); }
  };

  const handleTopup = async (amount: number) => {
    try { await httpClient.post(APP_CONFIG.WALLET.TOPUP, { amount }); toast.success(`Đã nạp ${amount} xu!`); loadWallet(); loadWalletTxs(); }
    catch { toast.error("Nạp coin thất bại."); }
  };

  /* ── Stats ── */
  const totalViews = stories.reduce((s, st) => s + (st.viewCount ?? 0), 0);
  const totalChapters = stories.reduce((s, st) => s + (st.totalChapters ?? 0), 0);
  const publishedCount = stories.filter((s) => s.status === "PUBLISHED" || s.status === "APPROVED").length;
  const getChapterWordCount = (ch: ChapterItem) => ch.wordCount ?? (ch.content ? ch.content.trim().split(/\s+/).filter(Boolean).length : 0);

  const filteredStories = storyFilter === "ALL" ? stories
    : storyFilter === "PUBLISHED" ? stories.filter((s) => s.status === "PUBLISHED" || s.status === "APPROVED")
    : stories.filter((s) => s.status === storyFilter);
  const filteredEditReqs = erFilter === "ALL" ? editRequests : editRequests.filter((r) => r.status === erFilter);

  if (loading) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", fontSize: 14, color: T.textMuted }}>⏳ Đang tải tác phẩm…</div>;
  }

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "stories",      label: "Tác phẩm",      icon: "📖" },
    { id: "editRequests", label: "Yêu cầu biên tập", icon: "🎨" },
    { id: "wallet",       label: "Ví của tôi",     icon: "💰" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      {/* ════════════════ HEADER ════════════════ */}
      <div style={{ background: T.headerGrad, padding: "32px 40px 0", color: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>✍️</div>
              <div>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: -0.5, fontFamily: T.fontSerif }}>Tác phẩm của tôi</h1>
                <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>Xin chào, {user?.fullName} — quản lý toàn bộ truyện tại đây</p>
              </div>
            </div>
            <button onClick={() => setShowStoryForm(null)} style={{ ...btnBase, background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: 14, fontWeight: 700, backdropFilter: "blur(4px)", padding: "10px 22px" }}>
              + Tạo tác phẩm mới
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { icon: "📖", label: "Tổng tác phẩm", value: stories.length },
              { icon: "✅", label: "Đã duyệt/xuất bản", value: publishedCount },
              { icon: "👁", label: "Lượt đọc", value: totalViews.toLocaleString() },
              { icon: "📄", label: "Tổng chương", value: totalChapters.toLocaleString() },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.12)" }}>
                <div style={{ fontSize: 20 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{s.value}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2 }}>
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "12px 18px", borderRadius: "10px 10px 0 0", border: "none", background: tab === t.id ? T.bg : "transparent", color: tab === t.id ? T.accent : "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════ CONTENT ════════════════ */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "28px 40px 80px" }}>

        {/* ──── TAB: STORIES ──── */}
        {tab === "stories" && (
          <>
            {/* Filter bar */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {["ALL", "DRAFT", "PENDING", "PUBLISHED", "REJECTED"].map((f) => (
                <button key={f} onClick={() => setStoryFilter(f)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${storyFilter === f ? T.accent : T.border}`, background: storyFilter === f ? T.accentLight : T.card, color: storyFilter === f ? T.accent : T.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  {f === "ALL" ? "Tất cả" : f === "DRAFT" ? "Bản nháp" : f === "PENDING" ? "Chờ duyệt" : f === "PUBLISHED" ? "Đã duyệt & Xuất bản" : "Từ chối"}
                </button>
              ))}
            </div>

            {filteredStories.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 24px", background: T.card, borderRadius: 18, border: `1.5px dashed ${T.border}` }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>Chưa có tác phẩm nào</div>
                <div style={{ fontSize: 14, color: T.textMuted, marginBottom: 20 }}>Bắt đầu sáng tác tác phẩm đầu tiên!</div>
                <button onClick={() => setShowStoryForm(null)} style={btnPrimary}>+ Tạo tác phẩm</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {filteredStories.map((story) => {
                  const isExpanded = expandedId === story.id;
                  const chapters = chaptersMap[story.id] ?? [];
                  const isLoadingCh = loadingChapters[story.id];
                  const totalWords = chapters.reduce((s, ch) => s + getChapterWordCount(ch), 0);
                  const canEdit = story.status !== "PENDING" && story.status !== "APPROVED";

                  return (
                    <div key={story.id} style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: T.shadow, transition: "box-shadow 0.15s" }}>
                      {/* Story header */}
                      <div onClick={() => toggleExpand(story.id)} style={{ padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 16 }}>
                        <div style={{ width: 56, height: 76, borderRadius: 10, background: story.coverUrl ? `url(${story.coverUrl}) center/cover` : T.headerGrad, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22 }}>
                          {!story.coverUrl && "📖"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                            <span style={{ fontFamily: T.fontSerif, fontSize: 16, fontWeight: 700, color: T.text }}>{story.title}</span>
                            <StatusBadge status={story.status} />
                          </div>
                          {story.description && (
                            <div style={{ fontSize: 13, color: T.textSec, marginBottom: 8, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{story.description}</div>
                          )}
                          {/* Review note for rejected stories */}
                          {story.status === "REJECTED" && story.reviewNote && (
                            <div style={{ fontSize: 12, color: T.danger, background: T.dangerBg, borderRadius: 8, padding: "6px 10px", marginBottom: 8, border: `1px solid ${T.dangerBorder}` }}>
                              ⚠️ Reviewer: {story.reviewNote}
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: T.textMuted }}>
                            <span>👁 {(story.viewCount ?? 0).toLocaleString()} lượt đọc</span>
                            <span>📄 {chaptersMap[story.id] !== undefined ? chaptersMap[story.id].length : (story.totalChapters ?? 0)} chương</span>
                            <span>{(story.categoryNames?.join(", ") || story.categories?.map((c) => c.name).join(", ")) || "Chưa phân loại"}</span>
                            <span>{timeAgo(story.createdAt)}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, alignItems: "flex-end" }}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {canEdit && (
                              <button onClick={(e) => { e.stopPropagation(); setShowStoryForm(story); }} style={{ ...btnOutline, fontSize: 11, padding: "5px 10px" }}>✏️ Sửa</button>
                            )}
                            {(story.status === "DRAFT" || story.status === "REJECTED") && (
                              <button onClick={(e) => { e.stopPropagation(); handleSubmitStory(story.id); }} disabled={submittingStory === story.id} style={{ ...btnWarn, fontSize: 11, padding: "5px 10px" }}>
                                {submittingStory === story.id ? "…" : "📤 Nộp duyệt"}
                              </button>
                            )}
                          </div>
                          <span style={{ fontSize: 16, color: T.textMuted, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
                        </div>
                      </div>

                      {/* Chapters list */}
                      {isExpanded && (
                        <div style={{ borderTop: `1.5px solid ${T.borderLight}`, padding: "16px 20px", background: T.bg }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                              Chương ({isLoadingCh ? "…" : chapters.length})
                              {chapters.length > 0 && <span style={{ fontSize: 12, fontWeight: 400, color: T.textMuted, marginLeft: 8 }}>· {totalWords.toLocaleString()} chữ</span>}
                            </div>
                            <button onClick={() => setChapterModal({ storyId: story.id, chapter: null })} style={{ ...btnPrimary, fontSize: 12 }}>+ Thêm chương</button>
                          </div>

                          {isLoadingCh ? (
                            <div style={{ textAlign: "center", padding: "20px 0", fontSize: 13, color: T.textMuted }}>Đang tải…</div>
                          ) : chapters.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "24px 0", fontSize: 13, color: T.textMuted }}>Chưa có chương nào. Hãy thêm chương đầu tiên!</div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {chapters.map((ch) => {
                                const words = getChapterWordCount(ch);
                                const readMins = Math.max(1, Math.ceil(words / 200));
                                return (
                                  <div key={ch.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: T.card, borderRadius: T.radiusSm, border: `1.5px solid ${T.border}`, transition: "background 0.1s" }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 8, background: T.grayBg, color: T.textSec, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ch.chapterOrder}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ch.title}</span>
                                        <StatusBadge status={ch.status} />
                                      </div>
                                      <div style={{ fontSize: 11, color: T.textMuted, display: "flex", gap: 10, flexWrap: "wrap" }}>
                                        <span>📝 {words.toLocaleString()} chữ</span>
                                        <span>⏱ ~{readMins} phút</span>
                                        {(ch.coinPrice ?? 0) > 0 && <span>🪙 {ch.coinPrice} xu</span>}
                                      </div>
                                      {ch.reviewNote && ch.status === "DRAFT" && (
                                        <div style={{ fontSize: 11, color: T.danger, background: T.dangerBg, borderRadius: 6, padding: "3px 8px", marginTop: 4, border: `1px solid ${T.dangerBorder}` }}>⚠️ {ch.reviewNote}</div>
                                      )}
                                    </div>
                                    <div style={{ display: "flex", gap: 5, flexShrink: 0, alignItems: "center", flexWrap: "wrap" }}>
                                      {(ch.status === "DRAFT" || ch.status === "EDITED") && (
                                        <button onClick={() => handleSubmitChapter(ch.id, story.id)} disabled={submittingChapter === ch.id} style={{ ...btnWarn, fontSize: 11, padding: "4px 8px" }}>
                                          {submittingChapter === ch.id ? "…" : "📤 Nộp"}
                                        </button>
                                      )}
                                      {ch.status === "APPROVED" && (
                                        <button onClick={() => handlePublishChapter(ch.id, story.id)} disabled={publishingChapter === ch.id} style={{ ...btnSuccess, fontSize: 11, padding: "4px 8px" }}>
                                          {publishingChapter === ch.id ? "…" : "🚀 Phát hành"}
                                        </button>
                                      )}
                                      <button onClick={() => setChapterModal({ storyId: story.id, chapter: ch })} style={{ ...btnOutline, fontSize: 11, padding: "4px 8px" }}>✏️</button>
                                      <button onClick={() => handleDeleteChapter(ch.id, story.id)} disabled={deletingChapter === ch.id} style={{ ...btnOutline, fontSize: 11, padding: "4px 8px", color: T.danger }}>
                                        {deletingChapter === ch.id ? "…" : "🗑"}
                                      </button>
                                      {(ch.status === "DRAFT" || ch.status === "EDITED" || ch.status === "PUBLISHED") && (
                                        <button onClick={() => setEditRequestModal(ch)} style={{ ...btnPurple, fontSize: 11, padding: "4px 8px" }}>🎨 Edit</button>
                                      )}
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
          </>
        )}

        {/* ──── TAB: EDIT REQUESTS ──── */}
        {tab === "editRequests" && (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {["ALL", "OPEN", "IN_PROGRESS", "SUBMITTED", "APPROVED", "CANCELLED"].map((f) => (
                <button key={f} onClick={() => setErFilter(f)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${erFilter === f ? T.accent : T.border}`, background: erFilter === f ? T.accentLight : T.card, color: erFilter === f ? T.accent : T.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  {f === "ALL" ? "Tất cả" : f === "OPEN" ? "Đang chờ" : f === "IN_PROGRESS" ? "Đang làm" : f === "SUBMITTED" ? "Chờ duyệt" : f === "APPROVED" ? "Hoàn thành" : "Đã huỷ"}
                </button>
              ))}
            </div>
            {loadingRequests ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: T.textMuted }}>⏳ Đang tải…</div>
            ) : filteredEditReqs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", background: T.card, borderRadius: 18, border: `1.5px dashed ${T.border}` }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎨</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Chưa có yêu cầu biên tập</div>
                <div style={{ fontSize: 13, color: T.textMuted, marginTop: 6 }}>Vào danh sách chương và chọn &quot;🎨 Edit&quot;.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filteredEditReqs.map((req) => (
                  <div key={req.id} style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: "16px 20px", boxShadow: T.shadow }}>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: T.fontSerif, fontSize: 15, fontWeight: 700, color: T.text }}>{req.chapterTitle}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, background: T.warnBg, color: T.warn, padding: "2px 8px", borderRadius: 12, border: `1px solid ${T.warnBorder}` }}>🪙 {req.coinReward} xu</span>
                          <EditReqBadge status={req.status} />
                        </div>
                        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 4 }}>
                          📖 {req.storyTitle} · Editor: <strong>{req.editorName || "Chưa có"}</strong> · {timeAgo(req.createdAt)}
                          {req.attemptCount > 1 && <span style={{ color: T.warn }}> · Lần {req.attemptCount}</span>}
                        </div>
                        {req.description && <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.5, marginTop: 6 }}>📋 {req.description}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        {req.status === "OPEN" && (
                          <button onClick={() => handleCancelEditReq(req.id)} style={btnOutline}>Huỷ yêu cầu</button>
                        )}
                        {req.status === "SUBMITTED" && (
                          <button onClick={() => setReviewEditModal(req)} style={btnPrimary}>👁 Duyệt bản chỉnh sửa</button>
                        )}
                        {req.status === "APPROVED" && (
                          <span style={{ fontSize: 13, color: T.success, fontWeight: 700 }}>✅ Hoàn thành</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ──── TAB: WALLET ──── */}
        {tab === "wallet" && (
          <WalletSection wallet={wallet} transactions={walletTxs} onTopup={handleTopup} loadingTx={loadingTx} />
        )}
      </div>

      {/* ════════════════ MODALS ════════════════ */}
      {showStoryForm !== false && (
        <StoryFormModal story={showStoryForm} onClose={() => setShowStoryForm(false)} onSaved={loadStories} />
      )}
      {chapterModal && (
        <ChapterFormModal storyId={chapterModal.storyId} chapter={chapterModal.chapter} onClose={() => setChapterModal(null)} onSaved={() => loadChapters(chapterModal.storyId)} />
      )}
      {editRequestModal && (
        <CreateEditRequestModal chapter={editRequestModal} walletBalance={wallet?.balance ?? 0} onClose={() => setEditRequestModal(null)} onCreated={() => { loadEditRequests(); loadWallet(); }} />
      )}
      {reviewEditModal && (
        <AuthorReviewEditModal request={reviewEditModal} onClose={() => setReviewEditModal(null)} onAction={handleActionEditReq} />
      )}
    </div>
  );
}
