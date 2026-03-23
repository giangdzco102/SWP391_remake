/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import useHttpClient from "@/api/useHttpClient";
import APP_CONFIG from "@/config/app-config";
import { useToast } from "@/hooks/use-toast";
import usePaymentService, { CoinPackage } from "@/api/usePayment.service";

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

interface ChapterDetail {
  id: number;
  title: string;
  content: string;
  chapterOrder: number;
  coinPrice: number;
  storyTitle?: string;
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

interface VersionItem {
  id: number;
  content: string;
  editorNote?: string;
  createdAt: string;
}

/* ================================================================
   THEME TOKENS — shared soft palette
   ================================================================ */
const T = {
  bg: "#f6f4f1",
  card: "#ffffff",
  border: "#e8e3dc",
  borderLight: "#f0ece6",
  text: "#2d2319",
  textSec: "#7a6e63",
  textMuted: "#b5a99e",
  accent: "#4a7c59",
  accentLight: "#eaf5ee",
  accentBorder: "#b8d8c4",
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
  headerGrad: "linear-gradient(135deg, #1a3a2a 0%, #2d5a3e 50%, #3d7a52 100%)",
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

function stripHtml(html: string): string {
  if (typeof document === "undefined") return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const d = document.createElement("div");
  d.innerHTML = html;
  return (d.textContent ?? d.innerText ?? "").trim();
}

function toHtml(text: string): string {
  if (/<[a-z]/i.test(text)) return text;
  return text.split(/\n+/).filter(Boolean).map((p) => `<p>${p}</p>`).join("") || "<p><br></p>";
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

function fLabel(): React.CSSProperties { return { display: "block", fontSize: 12, fontWeight: 700, color: T.textSec, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }; }
function fInput(): React.CSSProperties { return { width: "100%", padding: "10px 14px", borderRadius: T.radiusSm, border: `1.5px solid ${T.border}`, fontSize: 14, color: T.text, fontFamily: T.font, outline: "none", boxSizing: "border-box", background: T.card }; }

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
    <div style={{ border: `1.5px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden", background: T.card }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, padding: "8px 10px", background: T.grayBg, borderBottom: `1px solid ${T.border}`, alignItems: "center" }}>
        {tb("B", "bold", "Bold", undefined, { fontWeight: 800 })}
        {tb("I", "italic", "Italic", undefined, { fontStyle: "italic" })}
        {tb("U", "underline", "Underline", undefined, { textDecoration: "underline" })}
        {sep}
        {tb("H1", "formatBlock", "Heading 1", "h1")}
        {tb("H2", "formatBlock", "Heading 2", "h2")}
        {tb("¶", "formatBlock", "Paragraph", "p")}
        {sep}
        {tb("❝", "formatBlock", "Quote", "blockquote")}
        {tb("•", "insertUnorderedList", "List")}
        {tb("1.", "insertOrderedList", "Numbered")}
        {sep}
        {tb("↺", "undo", "Undo")}
        {tb("↻", "redo", "Redo")}
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning onInput={() => { if (ref.current) onChange(ref.current.innerHTML); }}
        style={{ minHeight: 300, maxHeight: 500, overflowY: "auto", padding: "16px 20px", fontSize: 15, color: T.text, fontFamily: "'Lora', Georgia, serif", lineHeight: 1.85, outline: "none" }}
      />
    </div>
  );
}

/* ================================================================
   CHAPTER PREVIEW MODAL
   ================================================================ */
function ChapterPreviewModal({ chapterId, onClose }: { chapterId: number; onClose: () => void }) {
  const httpClient = useHttpClient();
  const [chapter, setChapter] = useState<ChapterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    httpClient.get(APP_CONFIG.CHAPTER.GET(chapterId))
      .then((res: any) => setChapter(res?.data ?? res ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [chapterId]);// eslint-disable-line react-hooks/exhaustive-deps
  const content = chapter?.content ?? "";
  const isHtml = /<[a-z][\s\S]*>/i.test(content);
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)" }}>
      <div style={{ background: T.card, borderRadius: 20, width: "100%", maxWidth: 700, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: T.shadowMd, overflow: "hidden" }}>
        <div style={{ padding: "18px 22px 14px", borderBottom: `1.5px solid ${T.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: T.fontSerif, fontSize: 16, fontWeight: 800, color: T.text }}>{chapter?.title ?? "Đang tải…"}</div>
            {chapter && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{chapter.storyTitle} · Chương {chapter.chapterOrder} · {chapter.coinPrice > 0 ? `🪙 ${chapter.coinPrice} xu` : "Miễn phí"}</div>}
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${T.border}`, background: T.bg, cursor: "pointer", fontSize: 16, color: T.textSec, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ overflowY: "auto", padding: "20px 24px" }}>
          {loading ? <div style={{ textAlign: "center", padding: 20, color: T.textMuted }}>⏳ Đang tải nội dung…</div> :
            !content ? <div style={{ color: T.textMuted, fontStyle: "italic" }}>Không có nội dung.</div> :
              isHtml ? <div style={{ fontSize: 15, color: T.text, lineHeight: 1.85, fontFamily: "'Lora',serif" }} dangerouslySetInnerHTML={{ __html: content }} /> :
                content.split(/\n+/).filter(Boolean).map((p, i) => <p key={i} style={{ fontSize: 15, color: T.text, lineHeight: 1.85, fontFamily: "'Lora',serif", marginBottom: "1em" }}>{p}</p>)
          }
        </div>
        <div style={{ padding: "12px 22px", borderTop: `1px solid ${T.borderLight}`, display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
          <button onClick={onClose} style={btnOutline}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   EDITOR WORK MODAL — Side by side editing
   ================================================================ */
function EditorWorkModal({ request, onClose, onSubmit, onWithdraw }: { request: EditRequest; onClose: () => void; onSubmit: (id: number, content: string, note: string) => Promise<void>; onWithdraw: (id: number) => Promise<void> }) {
  const httpClient = useHttpClient();
  const [originalContent, setOriginalContent] = useState<string>("");
  const [editedContent, setEditedContent] = useState(request.editedContent ?? "");
  const [editorNote, setEditorNote] = useState(request.editorNote ?? "");
  const [saving, setSaving] = useState(false);
  const [loadingOriginal, setLoadingOriginal] = useState(true);

  useEffect(() => {
    httpClient.get(APP_CONFIG.CHAPTER.GET(request.chapterId))
      .then((res: any) => setOriginalContent(res?.data?.content ?? res?.content ?? ""))
      .catch(() => {})
      .finally(() => setLoadingOriginal(false));
  }, [request.chapterId]);// eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    if (!stripHtml(editedContent).trim()) return;
    setSaving(true);
    try { await onSubmit(request.id, editedContent, editorNote); onClose(); }
    catch { /* error handled in parent */ }
    finally { setSaving(false); }
  };

  const isSubmitted = request.status === "SUBMITTED";
  const isRejected = request.status === "IN_PROGRESS" && request.attemptCount > 1;
  const canWithdraw = request.status === "IN_PROGRESS" && request.attemptCount <= 1;
  const wordCount = stripHtml(editedContent).split(/\s+/).filter(Boolean).length;

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)" }}>
      <div style={{ background: T.card, borderRadius: 20, width: "100%", maxWidth: 1100, maxHeight: "96vh", display: "flex", flexDirection: "column", boxShadow: T.shadowMd, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "16px 22px 12px", borderBottom: `1.5px solid ${T.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, background: T.grayBg }}>
          <div>
            <div style={{ fontFamily: T.fontSerif, fontSize: 17, fontWeight: 800, color: T.text }}>
              {isSubmitted ? "📋 Bản chỉnh sửa đã nộp" : "✏️ Soạn thảo chỉnh sửa"}
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
              {request.chapterTitle} · {request.storyTitle} · <span style={{ color: T.success, fontWeight: 700 }}>🪙 {request.coinReward} xu</span>
              {request.attemptCount > 1 && <span style={{ color: T.warn, fontWeight: 700 }}> · Lần #{request.attemptCount}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${T.border}`, background: T.card, cursor: "pointer", fontSize: 16, color: T.textSec, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Alerts */}
        <div style={{ padding: "12px 22px 0", display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
          {isSubmitted && (
            <div style={{ background: T.infoBg, border: `1.5px solid ${T.infoBorder}`, borderRadius: T.radiusSm, padding: "10px 14px", fontSize: 13, color: T.info }}>
              ⏳ Bản chỉnh sửa đã nộp — đang chờ Author xem xét. Không thể chỉnh sửa thêm.
            </div>
          )}
          {request.description && (
            <div style={{ background: T.warnBg, border: `1.5px solid ${T.warnBorder}`, borderRadius: T.radiusSm, padding: "10px 14px", fontSize: 13, color: T.warn }}>
              📋 <strong>Yêu cầu của Author:</strong> {request.description}
            </div>
          )}
          {isRejected && request.authorNote && (
            <div style={{ background: T.dangerBg, border: `1.5px solid ${T.dangerBorder}`, borderRadius: T.radiusSm, padding: "10px 14px", fontSize: 13, color: T.danger }}>
              ❌ <strong>Author từ chối lần trước:</strong> {request.authorNote}
            </div>
          )}
        </div>

        {/* Main content — side by side */}
        <div style={{ flex: 1, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
          {/* Left: Original */}
          <div style={{ display: "flex", flexDirection: "column", borderRight: `1.5px solid ${T.borderLight}` }}>
            <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.borderLight}`, fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", flexShrink: 0 }}>📄 Nội dung gốc (readonly)</div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
              {loadingOriginal ? <div style={{ color: T.textMuted }}>Đang tải…</div> :
                !originalContent ? <div style={{ color: T.textMuted, fontStyle: "italic" }}>Không có nội dung gốc.</div> :
                  /<[a-z]/i.test(originalContent) ?
                    <div style={{ fontSize: 14, color: T.text, lineHeight: 1.8, fontFamily: "'Lora',serif" }} dangerouslySetInnerHTML={{ __html: originalContent }} /> :
                    originalContent.split(/\n+/).filter(Boolean).map((p, i) => <p key={i} style={{ fontSize: 14, color: T.text, lineHeight: 1.8, fontFamily: "'Lora',serif", marginBottom: "0.8em" }}>{p}</p>)
              }
            </div>
          </div>
          {/* Right: Editor */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.borderLight}`, fontSize: 12, fontWeight: 700, color: T.accent, textTransform: "uppercase", flexShrink: 0, display: "flex", justifyContent: "space-between" }}>
              <span>✏️ Bản chỉnh sửa</span>
              <span style={{ color: T.textMuted, fontWeight: 400 }}>{wordCount.toLocaleString()} chữ</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
              {isSubmitted ? (
                <div style={{ fontSize: 14, color: T.text, lineHeight: 1.8, fontFamily: "'Lora',serif", whiteSpace: "pre-wrap" }}>
                  {editedContent || "(Trống)"}
                </div>
              ) : (
                <RichEditor value={editedContent} onChange={setEditedContent} />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 22px", borderTop: `1.5px solid ${T.borderLight}`, display: "flex", gap: 12, alignItems: "flex-end", flexShrink: 0, background: T.grayBg }}>
          {!isSubmitted && (
            <div style={{ flex: 1 }}>
              <label style={{ ...fLabel(), marginBottom: 4 }}>Ghi chú cho Author</label>
              <input value={editorNote} onChange={(e) => setEditorNote(e.target.value)} placeholder="Giải thích những thay đổi bạn đã thực hiện…" style={{ ...fInput(), padding: "8px 12px", fontSize: 13 }} />
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={btnOutline}>Đóng</button>
            {canWithdraw && (
              <button onClick={async () => { await onWithdraw(request.id); onClose(); }} style={{ ...btnOutline, color: T.danger }}>🚪 Rút lui</button>
            )}
            {!isSubmitted && (
              <button onClick={handleSubmit} disabled={!stripHtml(editedContent).trim() || saving} style={!stripHtml(editedContent).trim() || saving ? btnDisabled : btnPrimary}>
                {saving ? "Đang nộp…" : "📤 Nộp bản chỉnh sửa"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   WALLET SECTION (Editor)
   ================================================================ */
const EDITOR_FALLBACK_PKGS: CoinPackage[] = [
  { id: "BASIC",    displayName: "Cơ Bản",      amountVnd: 10000,  coinAmount: 10000,  bonusPercent: 0  },
  { id: "SAVING",   displayName: "Tiết Kiệm",   amountVnd: 50000,  coinAmount: 56000,  bonusPercent: 12 },
  { id: "POPULAR",  displayName: "Phổ Biến ⭐", amountVnd: 100000, coinAmount: 118000, bonusPercent: 18 },
  { id: "ADVANCED", displayName: "Nâng Cao",    amountVnd: 200000, coinAmount: 244000, bonusPercent: 22 },
  { id: "VIP",      displayName: "VIP",          amountVnd: 500000, coinAmount: 650000, bonusPercent: 30 },
];

function WalletSection({ wallet, transactions, loadingTx }: { wallet: WalletInfo | null; transactions: WalletTx[]; loadingTx: boolean }) {
  const [packages, setPackages] = useState<CoinPackage[]>(EDITOR_FALLBACK_PKGS);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const paymentService = usePaymentService();
  const toastW = useToast();
  const txColor: Record<string, string> = { TOPUP: T.success, BUY: T.info, GIFT: T.purple, REWARD: T.accent, LOCK: T.warn, RELEASE: T.success };

  useEffect(() => {
    paymentService.getPackages().then((res: any) => {
      const list: CoinPackage[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (list.length > 0) setPackages(list);
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBuy = async (pkgId: string) => {
    setBuyingId(pkgId);
    try {
      const res: any = await paymentService.createPaymentLink(pkgId);
      const d = res?.data ?? res;
      const url: string = d?.checkoutUrl ?? d?.checkout_url ?? "";
      if (url) window.location.href = url;
      else toastW.error("Không lấy được link thanh toán.");
    } catch (err: any) {
      toastW.error(err?.response?.data?.message ?? "Không thể tạo đơn thanh toán.");
    } finally { setBuyingId(null); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Balance */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ background: T.successBg, border: `1.5px solid ${T.successBorder}`, borderRadius: T.radius, padding: "20px" }}>
          <div style={{ fontSize: 12, color: T.success, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Số dư</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: T.success }}>{(wallet?.balance ?? 0).toLocaleString()} <span style={{ fontSize: 14 }}>xu</span></div>
        </div>
        <div style={{ background: T.accentLight, border: `1.5px solid ${T.accentBorder}`, borderRadius: T.radius, padding: "20px" }}>
          <div style={{ fontSize: 12, color: T.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Tiền thưởng</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>Nhận được khi Author duyệt bản chỉnh sửa của bạn</div>
        </div>
      </div>

      {/* PayOS packages */}
      <div style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: T.radius, padding: "18px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>💳 Nạp coin qua PayOS</div>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 14 }}>Thanh toán an toàn · Coin vào ngay sau khi thanh toán thành công</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => !buyingId && handleBuy(pkg.id)}
              disabled={!!buyingId}
              style={{ padding: "12px 8px", borderRadius: T.radiusSm, border: `1.5px solid ${buyingId === pkg.id ? T.accent : T.border}`, background: buyingId === pkg.id ? T.accentLight : T.card, cursor: buyingId ? "wait" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.15s", opacity: buyingId && buyingId !== pkg.id ? 0.55 : 1, fontFamily: T.font }}
            >
              {pkg.bonusPercent > 0 && (
                <span style={{ fontSize: 9, fontWeight: 700, background: T.warnBg, color: T.warn, border: `1px solid ${T.warnBorder}`, borderRadius: 10, padding: "1px 6px" }}>+{pkg.bonusPercent}%</span>
              )}
              <span style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{pkg.displayName}</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: T.accent }}>🪙 {pkg.coinAmount.toLocaleString()}</span>
              <span style={{ fontSize: 11, color: T.textMuted }}>{pkg.amountVnd.toLocaleString()}đ</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", background: buyingId === pkg.id ? T.textMuted : T.accent, borderRadius: 6, padding: "3px 10px", marginTop: 2 }}>
                {buyingId === pkg.id ? "⏳" : "Nạp"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      <div style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.borderLight}`, fontWeight: 700, fontSize: 14, color: T.text }}>📜 Lịch sử giao dịch</div>
        <div style={{ maxHeight: 320, overflowY: "auto" }}>
          {loadingTx ? <div style={{ padding: 20, textAlign: "center", color: T.textMuted }}>Đang tải…</div> :
            transactions.length === 0 ? <div style={{ padding: 20, textAlign: "center", color: T.textMuted }}>Chưa có giao dịch.</div> :
              transactions.map((tx) => (
                <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: `1px solid ${T.borderLight}` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: txColor[tx.type] ?? T.gray, background: T.grayBg, borderRadius: 6, padding: "2px 8px", minWidth: 60, textAlign: "center" }}>{tx.type}</span>
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
export default function EditorDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const httpClient = useHttpClient();
  const toast = useToast();

  type Tab = "open" | "mine" | "done" | "wallet" | "guide";
  const [tab, setTab] = useState<Tab>("open");
  const [openRequests, setOpenRequests] = useState<EditRequest[]>([]);
  const [mineRequests, setMineRequests] = useState<EditRequest[]>([]);
  const [doneRequests, setDoneRequests] = useState<EditRequest[]>([]);
  const [loadingOpen, setLoadingOpen] = useState(true);
  const [loadingMine, setLoadingMine] = useState(true);
  const [assigning, setAssigning] = useState<number | null>(null);
  const [editModal, setEditModal] = useState<EditRequest | null>(null);
  const [previewChapter, setPreviewChapter] = useState<number | null>(null);
  const [sortOpen, setSortOpen] = useState<"newest" | "oldest" | "reward">("reward");
  const [openSearch, setOpenSearch] = useState("");
  const [mineFilter, setMineFilter] = useState<string>("ALL");
  const [mineSearch, setMineSearch] = useState("");
  const [doneSort, setDoneSort] = useState<"newest" | "oldest">("newest");
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [walletTxs, setWalletTxs] = useState<WalletTx[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  const loadOpen = useCallback(async () => {
    setLoadingOpen(true);
    try {
      const res: any = await httpClient.get(APP_CONFIG.EDIT_REQUEST.OPEN);
      const list: EditRequest[] = res?.data?.content ?? res?.data ?? res?.content ?? res ?? [];
      setOpenRequests(Array.isArray(list) ? list : []);
    } catch { setOpenRequests([]); }
    finally { setLoadingOpen(false); }
  }, [httpClient]);

  const loadAssigned = useCallback(async () => {
    setLoadingMine(true);
    try {
      const res: any = await httpClient.get(APP_CONFIG.EDIT_REQUEST.ASSIGNED);
      const list: EditRequest[] = res?.data?.content ?? res?.data ?? res?.content ?? res ?? [];
      const all = Array.isArray(list) ? list : [];
      setMineRequests(all.filter((r) => r.status === "IN_PROGRESS" || r.status === "SUBMITTED"));
      setDoneRequests(all.filter((r) => r.status === "APPROVED"));
    } catch { setMineRequests([]); setDoneRequests([]); }
    finally { setLoadingMine(false); }
  }, [httpClient]);

  const loadWallet = useCallback(async () => {
    try { const res: any = await httpClient.get(APP_CONFIG.WALLET.GET); setWallet(res?.data ?? res ?? null); }
    catch { /* ignore */ }
  }, [httpClient]);

  const loadWalletTxs = useCallback(async () => {
    setLoadingTx(true);
    try { const res: any = await httpClient.get(APP_CONFIG.WALLET.TRANSACTIONS); const list = res?.data?.content ?? res?.data ?? res?.content ?? res ?? []; setWalletTxs(Array.isArray(list) ? list : []); }
    catch { setWalletTxs([]); }
    finally { setLoadingTx(false); }
  }, [httpClient]);

  useEffect(() => {
    if (!user) { router.push("/?login"); return; }
    const hasEditor = user.roles?.some((r: string) => r === "EDITOR" || r === "ROLE_EDITOR" || r === "ADMIN" || r === "ROLE_ADMIN");
    if (!hasEditor) { router.push("/"); return; }
    loadOpen();
    loadAssigned();
    loadWallet();
  }, [user]);// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tab === "wallet" && walletTxs.length === 0) loadWalletTxs();
  }, [tab]);// eslint-disable-line react-hooks/exhaustive-deps

  const handleAssign = async (req: EditRequest) => {
    setAssigning(req.id);
    try {
      await httpClient.post(APP_CONFIG.EDIT_REQUEST.ASSIGN(req.id), {});
      toast.success(`Đã nhận yêu cầu "${req.chapterTitle}"`);
      setOpenRequests((p) => p.filter((r) => r.id !== req.id));
      setMineRequests((p) => [...p, { ...req, status: "IN_PROGRESS" as const, editorId: user?.id }]);
      setTab("mine");
    } catch { toast.error("Không thể nhận yêu cầu."); }
    finally { setAssigning(null); }
  };

  const handleWithdraw = async (reqId: number) => {
    if (!window.confirm("Rút lui khỏi yêu cầu này?")) return;
    try {
      await httpClient.post(APP_CONFIG.EDIT_REQUEST.WITHDRAW(reqId), {});
      toast.success("Đã rút lui.");
      loadAssigned();
      loadOpen();
    } catch { toast.error("Không thể rút lui."); }
  };

  const handleSubmitEdit = async (requestId: number, editedContent: string, editorNote: string) => {
    try {
      await httpClient.put(APP_CONFIG.EDIT_REQUEST.SUBMIT(requestId), { editedContent, editorNote: editorNote || undefined });
      toast.success("Đã nộp — chờ Author duyệt!");
      loadAssigned();
    } catch {
      toast.error("Không thể nộp bản chỉnh sửa.");
      throw new Error("failed");
    }
  };

  /* Sorted & filtered */
  const sortedOpen = [...openRequests]
    .sort((a, b) => sortOpen === "reward" ? b.coinReward - a.coinReward
      : sortOpen === "newest" ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .filter((r) => !openSearch.trim() || r.chapterTitle.toLowerCase().includes(openSearch.trim().toLowerCase()) || r.storyTitle.toLowerCase().includes(openSearch.trim().toLowerCase()) || r.authorName.toLowerCase().includes(openSearch.trim().toLowerCase()));
  const filteredMine = mineRequests
    .filter((r) => mineFilter === "ALL" || r.status === mineFilter)
    .filter((r) => !mineSearch.trim() || r.chapterTitle.toLowerCase().includes(mineSearch.trim().toLowerCase()) || r.storyTitle.toLowerCase().includes(mineSearch.trim().toLowerCase()));

  const TABS: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: "open", label: "Thị trường", icon: "🏪", count: openRequests.length },
    { id: "mine", label: "Đang làm", icon: "⚙️", count: mineRequests.length },
    { id: "done", label: "Hoàn thành", icon: "✅", count: doneRequests.length },
    { id: "wallet", label: "Ví", icon: "💰" },
    { id: "guide", label: "Hướng dẫn", icon: "📋" },
  ];

  const totalEarnings = doneRequests.reduce((s, r) => s + r.coinReward, 0);

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      {/* ════════════════ HEADER ════════════════ */}
      <div style={{ background: T.headerGrad, padding: "32px 40px 0", color: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>✏️</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: -0.5, fontFamily: T.fontSerif }}>Bảng Editor</h1>
              <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>Xin chào, {user?.fullName} — nhận yêu cầu chỉnh sửa và kiếm coin</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { icon: "🏪", label: "Yêu cầu mở", value: openRequests.length },
              { icon: "⚙️", label: "Đang thực hiện", value: mineRequests.filter((r) => r.status === "IN_PROGRESS").length },
              { icon: "⏳", label: "Chờ Author duyệt", value: mineRequests.filter((r) => r.status === "SUBMITTED").length },
              { icon: "🪙", label: "Tổng đã nhận", value: `${totalEarnings.toLocaleString()} xu` },
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

        {/* ──── TAB: OPEN MARKETPLACE ──── */}
        {tab === "open" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ background: T.accentLight, border: `1.5px solid ${T.accentBorder}`, borderRadius: T.radiusSm, padding: "10px 16px", fontSize: 13, color: T.accent, flex: 1, marginRight: 12 }}>
                🏪 Tác giả đăng yêu cầu chỉnh sửa kèm thưởng coin. Nhận việc, hoàn thành và được trả thưởng!
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {(["reward", "newest", "oldest"] as const).map((s) => (
                  <button key={s} onClick={() => setSortOpen(s)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${sortOpen === s ? T.accent : T.border}`, background: sortOpen === s ? T.accentLight : T.card, color: sortOpen === s ? T.accent : T.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {s === "reward" ? "🪙 Coin cao nhất" : s === "newest" ? "🔽 Mới nhất" : "🔼 Cũ nhất"}
                  </button>
                ))}
              </div>
            </div>
            {loadingOpen ? <div style={{ textAlign: "center", padding: "40px 0", color: T.textMuted }}>⏳ Đang tải…</div> :
              sortedOpen.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", background: T.card, borderRadius: 18, border: `1.5px dashed ${T.border}` }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Không có yêu cầu nào đang mở</div>
                  <div style={{ fontSize: 13, color: T.textMuted, marginTop: 6 }}>Hãy quay lại sau.</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380, 1fr))", gap: 14 }}>
                  {sortedOpen.map((req) => (
                    <div key={req.id} style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: "18px 20px", boxShadow: T.shadow, display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: T.fontSerif, fontSize: 15, fontWeight: 700, color: T.text, flex: 1 }}>{req.chapterTitle}</span>
                        <span style={{ fontSize: 13, fontWeight: 800, background: T.successBg, color: T.success, border: `1.5px solid ${T.successBorder}`, borderRadius: 20, padding: "3px 12px" }}>🪙 {req.coinReward} xu</span>
                      </div>
                      <div style={{ fontSize: 12, color: T.textMuted, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <span>📖 {req.storyTitle}</span>
                        <span>✍️ {req.authorName}</span>
                        <span>🕐 {timeAgo(req.createdAt)}</span>
                      </div>
                      {req.description && (
                        <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.5, background: T.warnBg, borderRadius: 8, padding: "8px 12px", border: `1px solid ${T.warnBorder}` }}>
                          📋 {req.description}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                        <button onClick={() => setPreviewChapter(req.chapterId)} style={btnOutline}>👁 Xem chapter</button>
                        <button onClick={() => handleAssign(req)} disabled={assigning === req.id} style={assigning === req.id ? btnDisabled : btnPrimary}>
                          {assigning === req.id ? "Đang nhận…" : "✋ Nhận việc"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* ──── TAB: MINE ──── */}
        {tab === "mine" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="text"
                placeholder="🔍 Tìm theo tên chương / truyện…"
                value={mineSearch}
                onChange={(e) => setMineSearch(e.target.value)}
                style={{ padding: "7px 14px", borderRadius: T.radiusSm, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.text, fontFamily: T.font, outline: "none", width: 260, background: T.card }}
              />
              <div style={{ display: "flex", gap: 6 }}>
                {["ALL", "IN_PROGRESS", "SUBMITTED"].map((f) => (
                  <button key={f} onClick={() => setMineFilter(f)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${mineFilter === f ? T.accent : T.border}`, background: mineFilter === f ? T.accentLight : T.card, color: mineFilter === f ? T.accent : T.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {f === "ALL" ? "Tất cả" : f === "IN_PROGRESS" ? "⚙️ Đang làm" : "⏳ Đã nộp"}
                  </button>
                ))}
              </div>
            </div>
            {loadingMine ? <div style={{ textAlign: "center", padding: "40px 0", color: T.textMuted }}>⏳ Đang tải…</div> :
              filteredMine.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", background: T.card, borderRadius: 18, border: `1.5px dashed ${T.border}` }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Chưa có yêu cầu đang làm</div>
                  <div style={{ fontSize: 13, color: T.textMuted, marginTop: 6 }}>Nhận yêu cầu từ tab &quot;Thị trường&quot;.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {filteredMine.map((req) => {
                    const isSubmitted = req.status === "SUBMITTED";
                    const isRejected = req.status === "IN_PROGRESS" && req.attemptCount > 1;
                    return (
                      <div key={req.id} style={{ background: T.card, border: `1.5px solid ${isRejected ? T.dangerBorder : isSubmitted ? T.infoBorder : T.accentBorder}`, borderRadius: 16, padding: "16px 20px", boxShadow: T.shadow }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                              <span style={{ fontFamily: T.fontSerif, fontSize: 15, fontWeight: 700, color: T.text }}>{req.chapterTitle}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 10px",
                                ...(isSubmitted ? { background: T.infoBg, color: T.info, border: `1px solid ${T.infoBorder}` }
                                  : isRejected ? { background: T.dangerBg, color: T.danger, border: `1px solid ${T.dangerBorder}` }
                                    : { background: T.accentLight, color: T.accent, border: `1px solid ${T.accentBorder}` })
                              }}>
                                {isSubmitted ? "⏳ Chờ Author duyệt" : isRejected ? "🔄 Cần viết lại" : "⚙️ Đang làm"}
                              </span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: T.success }}>🪙 {req.coinReward} xu</span>
                              {req.attemptCount > 1 && <span style={{ fontSize: 11, color: T.warn }}>Lần #{req.attemptCount}</span>}
                            </div>
                            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 8 }}>📖 {req.storyTitle} · ✍️ {req.authorName}</div>
                            {isRejected && req.authorNote && (
                              <div style={{ background: T.dangerBg, border: `1.5px solid ${T.dangerBorder}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: T.danger, marginBottom: 8 }}>
                                ❌ <strong>Author từ chối:</strong> {req.authorNote}
                              </div>
                            )}
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={() => setEditModal(req)} style={btnPrimary}>
                                {isSubmitted ? "👁 Xem bản đã nộp" : "✏️ Mở soạn thảo"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        )}

        {/* ──── TAB: DONE ──── */}
        {tab === "done" && (
          <div>
            {doneRequests.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", background: T.card, borderRadius: 18, border: `1.5px dashed ${T.border}` }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Chưa hoàn thành yêu cầu nào</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ background: T.successBg, border: `1.5px solid ${T.successBorder}`, borderRadius: T.radius, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.success }}>🎉 Tổng cộng: {doneRequests.length} yêu cầu hoàn thành</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: T.success }}>🪙 {totalEarnings.toLocaleString()} xu</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {(["newest", "oldest"] as const).map((s) => (
                    <button key={s} onClick={() => setDoneSort(s)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${doneSort === s ? T.accent : T.border}`, background: doneSort === s ? T.accentLight : T.card, color: doneSort === s ? T.accent : T.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {s === "newest" ? "🔽 Mới nhất" : "🔼 Cũ nhất"}
                    </button>
                  ))}
                </div>
                {[...doneRequests].sort((a, b) => doneSort === "newest" ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() : new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()).map((req) => (
                  <div key={req.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: T.card, borderRadius: 12, border: `1.5px solid ${T.border}` }}>
                    <span style={{ fontSize: 20 }}>✅</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{req.chapterTitle}</div>
                      <div style={{ fontSize: 12, color: T.textMuted }}>{req.storyTitle} · ✍️ {req.authorName}</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.success }}>+{req.coinReward} xu</span>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{timeAgo(req.updatedAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ──── TAB: WALLET ──── */}
        {tab === "wallet" && <WalletSection wallet={wallet} transactions={walletTxs} loadingTx={loadingTx} />}

        {/* ──── TAB: GUIDE ──── */}
        {tab === "guide" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              {
                icon: "⚙️", color: T.accent, bg: T.accentLight, border: T.accentBorder,
                title: "Quy trình làm việc",
                items: [
                  "1. Vào tab 'Thị trường' — xem các yêu cầu chỉnh sửa đang mở",
                  "2. Nhấn 'Xem chapter' để đọc nội dung trước khi nhận việc",
                  "3. Nhấn 'Nhận việc' — coin của Author được tạm lock",
                  "4. Vào tab 'Đang làm', mở trình soạn thảo — chỉnh sửa nội dung",
                  "5. Ghi chú thay đổi và nộp bản chỉnh sửa — chờ Author duyệt",
                  "6. Nếu Author từ chối → chỉnh sửa lại (không giới hạn lần)",
                  "7. Khi Author chấp thuận → coin thưởng vào ví bạn ngay!",
                ],
              },
              {
                icon: "📝", color: T.info, bg: T.infoBg, border: T.infoBorder,
                title: "Quy tắc chỉnh sửa",
                items: [
                  "Giữ nguyên ý nghĩa và phong cách của tác giả",
                  "Chỉ sửa theo yêu cầu: chính tả, ngữ pháp, dấu câu, văn phong",
                  "Không thêm hoặc bớt nội dung quan trọng ngoài yêu cầu",
                  "Luôn ghi chú rõ những thay đổi lớn để Author nắm",
                  "Đọc kỹ yêu cầu và authorNote (nếu bị reject) trước khi sửa",
                ],
              },
              {
                icon: "⚠️", color: T.warn, bg: T.warnBg, border: T.warnBorder,
                title: "Lưu ý quan trọng",
                items: [
                  "Bạn có thể rút lui khi chưa bị từ chối (lần đầu nhận)",
                  "Sau khi bị từ chối — phải sửa lại, không thể rút lui",
                  "Coin chỉ về ví khi Author chấp thuận bản chỉnh sửa",
                  "Nếu Author huỷ yêu cầu (OPEN) → coin hoàn về Author",
                  "Liên hệ admin nếu gặp tranh chấp",
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
      {editModal && <EditorWorkModal request={editModal} onClose={() => setEditModal(null)} onSubmit={handleSubmitEdit} onWithdraw={handleWithdraw} />}
      {previewChapter !== null && <ChapterPreviewModal chapterId={previewChapter} onClose={() => setPreviewChapter(null)} />}
    </div>
  );
}
