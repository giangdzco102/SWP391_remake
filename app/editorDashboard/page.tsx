/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import useHttpClient from "@/api/useHttpClient";
import APP_CONFIG from "@/config/app-config";
import { useToast } from "@/hooks/use-toast";

// Types
import { EditRequest, WalletInfo, WalletTx } from "@/types/editorDashboard";

// Utils & Constants
import { T, btnOutline, btnPrimary, btnDisabled } from "@/utils/editorDashboard.constants";
import { timeAgo } from "@/utils/editorDashboard.utils";

// Components
import { ChapterPreviewModal } from "@/components/editorDashboard/ChapterPreviewModal";
import { EditorWorkModal } from "@/components/editorDashboard/EditorWorkModal";
import { WalletSection } from "@/components/editorDashboard/WalletSection";

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
    const hasEditor = user.roles?.some((r: string) => {
      const ur = r.toUpperCase();
      return ur === "EDITOR" || ur === "ROLE_EDITOR" || ur === "ADMIN" || ur === "ROLE_ADMIN";
    });
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 14 }}>
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
                              <span style={{
                                fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 10px",
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
