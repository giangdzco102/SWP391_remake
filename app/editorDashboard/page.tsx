/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import useHttpClient from "@/api/useHttpClient";
import APP_CONFIG from "@/config/app-config";
import { useToast } from "@/hooks/use-toast";

// ── Types ─────────────────────────────────────────────────────────────────
interface EditorChapter {
  id: number;
  title: string;
  chapterOrder: number;
  content?: string;
  wordCount?: number;
  coinPrice?: number;
  status: string;
  storyId: number;
  storyTitle?: string;
  authorName?: string;
  createdAt: string;
  assignedEditorId?: number;
  editedContent?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days} ngày trước`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs > 0) return `${hrs} giờ trước`;
  return `${Math.floor(diff / 60000)} phút trước`;
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color?: string }) {
  return (
    <div style={{ background: "#fff", border: "1.5px solid #e8e0d6", borderRadius: 14, padding: "16px 20px" }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: color ?? "#1c1512", marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#9e8e82", marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────
interface EditModalProps {
  chapter: EditorChapter;
  onClose: () => void;
  onSubmit: (chapterId: number, editedContent: string, note: string) => Promise<void>;
}

function EditModal({ chapter, onClose, onSubmit }: EditModalProps) {
  const [content, setContent] = useState(chapter.editedContent || chapter.content || "");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const originalWords = chapter.wordCount ?? chapter.content?.trim().split(/\s+/).filter(Boolean).length ?? 0;
  const editedWords = content.trim().split(/\s+/).filter(Boolean).length;
  const diff = editedWords - originalWords;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSubmit(chapter.id, content, note);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 760, maxHeight: "94vh", display: "flex", flexDirection: "column", boxShadow: "0 16px 48px rgba(0,0,0,0.22)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px 12px", borderBottom: "1.5px solid #f0e8e0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 800, color: "#1c1512" }}>✏ Chỉnh sửa chương</div>
            <div style={{ fontSize: 12, color: "#b0a096", marginTop: 2 }}>
              {chapter.title} · {chapter.storyTitle}
              {" · "}
              <span style={{ color: diff > 0 ? "#166534" : diff < 0 ? "#c23d3f" : "#9e8e82" }}>
                {editedWords.toLocaleString()} chữ {diff !== 0 && `(${diff > 0 ? "+" : ""}${diff})`}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #e8e0d6", background: "#fdfaf7", cursor: "pointer", fontSize: 16, color: "#6b5a4e", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Side-by-side or single editor */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: "16px 20px", gap: 12 }}>
          {/* Original (collapsed read-only) */}
          {chapter.content && (
            <details style={{ flexShrink: 0 }}>
              <summary style={{ fontSize: 12, fontWeight: 700, color: "#9e8e82", cursor: "pointer", userSelect: "none", marginBottom: 6 }}>
                📄 Bản gốc ({originalWords.toLocaleString()} chữ) — click để xem
              </summary>
              <div style={{ maxHeight: 180, overflowY: "auto", padding: "12px 14px", background: "#fafaf8", borderRadius: 10, border: "1.5px solid #e8e0d6", fontSize: 13, color: "#6b5a4e", lineHeight: 1.7, fontFamily: "'Lora',serif" }}>
                {chapter.content.split(/\n+/).filter(Boolean).map((p, i) => <p key={i} style={{ marginBottom: "0.8em" }}>{p}</p>)}
              </div>
            </details>
          )}

          {/* Editable content */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#6b5a4e", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Nội dung đã chỉnh sửa *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ flex: 1, minHeight: 280, padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e8e0d6", fontSize: 14, color: "#1c1512", fontFamily: "inherit", resize: "none", outline: "none", lineHeight: 1.75, boxSizing: "border-box" }}
            />
          </div>

          {/* Note */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#6b5a4e", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Ghi chú cho tác giả</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Mô tả những thay đổi bạn đã thực hiện…"
              rows={2}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e8e0d6", fontSize: 13, color: "#1c1512", fontFamily: "inherit", resize: "none", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "10px 22px", borderRadius: 9, border: "1.5px solid #e8e0d6", background: "#fff", color: "#6b5a4e", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Hủy</button>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || saving}
              style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: !content.trim() || saving ? "#f3f4f6" : "#1d6b3a", color: !content.trim() || saving ? "#9ca3af" : "#fff", fontSize: 13, fontWeight: 700, cursor: !content.trim() || saving ? "not-allowed" : "pointer" }}
            >
              {saving ? "Đang nộp..." : "📤 Nộp bản chỉnh sửa"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function EditorDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const httpClient = useHttpClient();
  const toast = useToast();

  const [tab, setTab] = useState<"pending" | "mine" | "done" | "guide">("pending");
  const [pendingChapters, setPendingChapters] = useState<EditorChapter[]>([]);
  const [mineChapters, setMineChapters] = useState<EditorChapter[]>([]);
  const [doneChapters, setDoneChapters] = useState<{ chapter: EditorChapter; at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<number | null>(null);
  const [editModal, setEditModal] = useState<EditorChapter | null>(null);

  const loadPending = async () => {
    setLoading(true);
    try {
      const res: any = await httpClient.get(APP_CONFIG.EDITOR.PENDING_CHAPTERS);
      const list: EditorChapter[] = res?.data?.content ?? res?.data ?? res?.content ?? res ?? [];
      const all = Array.isArray(list) ? list : [];
      // Split: mine (already assigned to me) vs open (unassigned)
      setPendingChapters(all.filter((c) => !c.assignedEditorId));
      setMineChapters(all.filter((c) => c.assignedEditorId === user?.id));
    } catch {
      setPendingChapters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) { router.push("/?login"); return; }
    const hasEditor = user.roles?.some((r: string) => r === "EDITOR" || r === "ROLE_EDITOR" || r === "ADMIN" || r === "ROLE_ADMIN");
    if (!hasEditor) { router.push("/"); return; }
    loadPending();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAssign = async (chapter: EditorChapter) => {
    setAssigning(chapter.id);
    try {
      await httpClient.post(APP_CONFIG.EDITOR.ASSIGN(chapter.id), {});
      toast.success(`Đã nhận chương "${chapter.title}"`);
      setPendingChapters((p) => p.filter((c) => c.id !== chapter.id));
      setMineChapters((p) => [...p, { ...chapter, assignedEditorId: user?.id }]);
    } catch {
      toast.error("Không thể nhận chương. Thử lại sau.");
    } finally {
      setAssigning(null);
    }
  };

  const handleSubmitEdit = async (chapterId: number, editedContent: string, note: string) => {
    try {
      await httpClient.post(APP_CONFIG.EDITOR.EDIT(chapterId), { editedContent, note: note || undefined });
      toast.success("Đã nộp bản chỉnh sửa!");
      const chapter = mineChapters.find((c) => c.id === chapterId);
      if (chapter) {
        setDoneChapters((p) => [{ chapter, at: new Date().toLocaleString("vi") }, ...p]);
        setMineChapters((p) => p.filter((c) => c.id !== chapterId));
      }
    } catch {
      toast.error("Không thể nộp bản chỉnh sửa. Thử lại sau.");
      throw new Error("failed");
    }
  };

  const TABS = [
    { id: "pending", label: `🔓 Chờ nhận (${pendingChapters.length})` },
    { id: "mine",    label: `⚙ Đang làm (${mineChapters.length})` },
    { id: "done",    label: `✓ Hoàn thành (${doneChapters.length})` },
    { id: "guide",   label: "📋 Hướng dẫn" },
  ] as const;

  return (
    <div style={{ minHeight: "100vh", background: "#f4faf6" }}>
      {/* ── Gradient header ── */}
      <div style={{ background: "linear-gradient(135deg, #064e3b 0%, #047857 60%, #059669 100%)", padding: "28px 40px 0", color: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>✏</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>Bảng Editor</h1>
              <p style={{ margin: 0, fontSize: 13, opacity: 0.75 }}>Xin chào, {user?.fullName} — nhận và chỉnh sửa chương cho tác giả</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            {[
              { icon: "🔓", label: "Chương chờ nhận", value: pendingChapters.length },
              { icon: "⚙", label: "Đang thực hiện", value: mineChapters.length },
              { icon: "✅", label: "Đã hoàn thành", value: doneChapters.length },
              { icon: "📝", label: "Tổng chữ đã sửa", value: doneChapters.reduce((s, d) => s + (d.chapter.wordCount ?? d.chapter.content?.trim().split(/\s+/).filter(Boolean).length ?? 0), 0).toLocaleString() },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.2)" }}>
                <div style={{ fontSize: 20 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginTop: 4 }}>{s.value}</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                style={{ flex: 1, minWidth: 110, padding: "10px 18px", borderRadius: "8px 8px 0 0", border: "none", background: tab === t.id ? "rgba(255,255,255,0.18)" : "transparent", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", borderBottom: `2px solid ${tab === t.id ? "#fff" : "transparent"}`, opacity: tab === t.id ? 1 : 0.72 }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "28px 40px 80px" }}>
        {/* ── Pending (open pool) ── */}
      {tab === "pending" && (
        <div>
          <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#166534", marginBottom: 16 }}>
            <strong>✏ Editor là gì?</strong> Hỗ trợ tác giả chỉnh sửa chương — sửa lỗi chính tả, văn phong, cấu trúc câu. Nhận chương, thực hiện chỉnh sửa và nộp lại.
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#9e8e82" }}>⏳ Đang tải...</div>
          ) : pendingChapters.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#b0a096" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Không có chương nào chờ nhận!</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Hãy quay lại sau.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {pendingChapters.map((ch) => {
                const words = ch.wordCount ?? ch.content?.trim().split(/\s+/).filter(Boolean).length ?? 0;
                const readMins = Math.max(1, Math.ceil(words / 200));
                return (
                  <div key={ch.id} style={{ background: "#fff", border: "1.5px solid #e8e0d6", borderRadius: 16, padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: "#f0fdf4", color: "#1d6b3a", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                        {ch.chapterOrder}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#1c1512", marginBottom: 4 }}>{ch.title}</div>
                        <div style={{ fontSize: 12, color: "#9e8e82", marginBottom: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
                          {ch.storyTitle && <span>📖 {ch.storyTitle}</span>}
                          {ch.authorName && <span>✍ {ch.authorName}</span>}
                          <span>📝 {words.toLocaleString()} chữ</span>
                          <span>⏱ ~{readMins} phút đọc</span>
                          <span>🕐 {timeAgo(ch.createdAt)}</span>
                        </div>
                        {ch.content && (
                          <div style={{ fontSize: 13, color: "#6b5a4e", lineHeight: 1.6, background: "#fdfaf7", borderRadius: 8, padding: "10px 14px", border: "1.5px solid #f0e8e0", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, marginBottom: 10 }}>
                            {ch.content}
                          </div>
                        )}
                        <button
                          onClick={() => handleAssign(ch)}
                          disabled={assigning === ch.id}
                          style={{ padding: "8px 20px", borderRadius: 9, border: "none", background: assigning === ch.id ? "#f3f4f6" : "#1d6b3a", color: assigning === ch.id ? "#9ca3af" : "#fff", fontSize: 13, fontWeight: 700, cursor: assigning === ch.id ? "not-allowed" : "pointer" }}
                        >
                          {assigning === ch.id ? "Đang nhận..." : "⚙ Nhận chương này"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Mine (in progress) ── */}
      {tab === "mine" && (
        <div>
          {mineChapters.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#b0a096" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Chưa có chương đang làm</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Nhận chương từ tab "Chờ nhận".</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {mineChapters.map((ch) => {
                const words = ch.wordCount ?? ch.content?.trim().split(/\s+/).filter(Boolean).length ?? 0;
                return (
                  <div key={ch.id} style={{ background: "#fff", border: "1.5px solid #86efac", borderRadius: 16, padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: "#f0fdf4", color: "#1d6b3a", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                        {ch.chapterOrder}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#1c1512", marginBottom: 4 }}>
                          {ch.title}
                          <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, background: "#f0fdf4", color: "#166534", borderRadius: 20, padding: "2px 8px", border: "1px solid #86efac" }}>Đang thực hiện</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#9e8e82", marginBottom: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
                          {ch.storyTitle && <span>📖 {ch.storyTitle}</span>}
                          {ch.authorName && <span>✍ {ch.authorName}</span>}
                          <span>📝 {words.toLocaleString()} chữ</span>
                        </div>
                        <button
                          onClick={() => setEditModal(ch)}
                          style={{ padding: "8px 20px", borderRadius: 9, border: "none", background: "#1d6b3a", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                        >
                          ✏ Mở trình soạn thảo
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Done ── */}
      {tab === "done" && (
        <div>
          {doneChapters.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#b0a096" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Chưa hoàn thành chương nào</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {doneChapters.map((d, i) => {
                const words = d.chapter.wordCount ?? d.chapter.content?.trim().split(/\s+/).filter(Boolean).length ?? 0;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#f0fdf4", borderRadius: 12, border: "1.5px solid #86efac" }}>
                    <span style={{ fontSize: 20 }}>✅</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#1c1512" }}>{d.chapter.title}</div>
                      <div style={{ fontSize: 12, color: "#9e8e82" }}>
                        {d.chapter.storyTitle && <>{d.chapter.storyTitle} · </>}
                        📝 {words.toLocaleString()} chữ · Nộp {d.at}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Guide ── */}
      {tab === "guide" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            {
              icon: "⚙", color: "#166534", bg: "#f0fdf4", border: "#86efac",
              title: "Quy trình làm việc",
              items: [
                "1. Xem danh sách chương chờ nhận trong tab 'Chờ nhận'",
                "2. Nhấn 'Nhận chương này' để lấy chương về làm",
                "3. Chương sẽ chuyển sang tab 'Đang làm'",
                "4. Nhấn 'Mở trình soạn thảo' và chỉnh sửa nội dung",
                "5. Ghi chú thay đổi cho tác giả rồi nhấn 'Nộp bản chỉnh sửa'",
              ],
            },
            {
              icon: "📝", color: "#1d4ed8", bg: "#eff6ff", border: "#93c5fd",
              title: "Quy tắc chỉnh sửa",
              items: [
                "Giữ nguyên ý nghĩa và phong cách của tác giả",
                "Chỉ sửa lỗi chính tả, ngữ pháp, dấu câu",
                "Không thêm hoặc bớt nội dung quan trọng",
                "Cấu trúc lại câu khi cần thiết để rõ nghĩa hơn",
                "Ghi chú rõ những thay đổi lớn để tác giả nắm",
              ],
            },
            {
              icon: "⚠", color: "#92400e", bg: "#fffbeb", border: "#fcd34d",
              title: "Lưu ý",
              items: [
                "Mỗi editor chỉ nhận tối đa 5 chương cùng lúc",
                "Hoàn thành trong vòng 72 giờ kể từ khi nhận",
                "Không sửa nội dung theo ý cá nhân ngoài yêu cầu",
                "Liên hệ admin nếu gặp chương vi phạm nội quy",
              ],
            },
          ].map((sec) => (
            <div key={sec.title} style={{ background: sec.bg, border: `1.5px solid ${sec.border}`, borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: sec.color, marginBottom: 10 }}>{sec.icon} {sec.title}</div>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {sec.items.map((item, i) => (
                  <li key={i} style={{ fontSize: 13, color: "#3d2f28", lineHeight: 1.7 }}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      </div>

      {/* Edit modal */}
      {editModal && (
        <EditModal
          chapter={editModal}
          onClose={() => setEditModal(null)}
          onSubmit={handleSubmitEdit}
        />
      )}
    </div>
  );
}
