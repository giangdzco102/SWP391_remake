"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback, useRef } from "react";
import useHttpClient from "@/api/useHttpClient";
import APP_CONFIG from "@/config/app-config";
import { formatVnd, formatDate } from "@/utils/coinShop.utils";
import { useToast } from "@/hooks/use-toast";

const VIET_BANKS = [
  "Agribank – Nông nghiệp và Phát triển Nông thôn VN",
  "Vietcombank – Ngoại thương Việt Nam",
  "VietinBank – Công thương Việt Nam",
  "BIDV – Đầu tư và Phát triển Việt Nam",
  "Techcombank – Kỹ thương Việt Nam",
  "MB Bank – Quân Đội",
  "VPBank – Việt Nam Thịnh Vượng",
  "ACB – Á Châu",
  "HDBank – Phát triển TP.HCM",
  "TPBank – Tiên Phong",
  "SHB – Sài Gòn – Hà Nội",
  "MSB – Hàng Hải Việt Nam",
  "OCB – Phương Đông",
  "SeABank – Đông Nam Á",
  "VIB – Quốc tế Việt Nam",
  "LPBank – Lộc Phát Việt Nam",
  "Eximbank – Xuất nhập khẩu Việt Nam",
  "Sacombank – Sài Gòn Thương Tín",
  "ABBank – An Bình",
  "BacABank – Bắc Á",
  "NamABank – Nam Á",
  "NCB – Quốc Dân",
  "PGBank – Xăng dầu Petrolimex",
  "KienlongBank – Kiên Long",
  "BVBank – Bản Việt",
  "PVcomBank – Đại Chúng Việt Nam",
  "VietBank – Việt Nam Thương Tín",
  "Saigonbank – Sài Gòn Công Thương",
  "BAOVIET Bank – Bảo Việt",
  "CBBank – Xây dựng Việt Nam",
];
export function WithdrawTab() {
  const [wdSubTab, setWdSubTab] = useState<"form" | "history">("form");
  const [wdHistory, setWdHistory] = useState<any[]>([]);
  const [wdHistoryLoading, setWdHistoryLoading] = useState(false);
  const [wdSubmitting, setWdSubmitting] = useState(false);
  const [wdForm, setWdForm] = useState({ amount: "", bankName: "", bankAccount: "", bankOwner: "", note: "" });
  const [bankOpen, setBankOpen] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const bankRef = useRef<HTMLDivElement>(null);
  const [savedAccounts, setSavedAccounts] = useState<{ bankName: string; bankAccount: string; bankOwner: string }[]>([]);
  const [deletedAccounts, setDeletedAccounts] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("wd_deleted_accounts") ?? "[]");
    } catch {
      return [];
    }
  });
  const httpClient = useHttpClient();
  const toast = useToast();

  const loadWdHistory = useCallback(async () => {
    setWdHistoryLoading(true);
    try {
      const res: any = await httpClient.get(APP_CONFIG.WITHDRAW.MY);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setWdHistory(list);
    } catch {
      /* silent */
    } finally {
      setWdHistoryLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleSelectAccount = (acc: { bankName: string; bankAccount: string; bankOwner: string }) => {
    setWdForm((f) => ({
      ...f,
      bankName: acc.bankName,
      bankAccount: acc.bankAccount,
      bankOwner: acc.bankOwner,
    }));
  };
  const handleDeleteAccount = (bankAccount: string) => {
    const updated = [...deletedAccounts, bankAccount];
    setDeletedAccounts(updated);
    localStorage.setItem("wd_deleted_accounts", JSON.stringify(updated));
    setSavedAccounts((prev) => prev.filter((a) => a.bankAccount !== bankAccount));
    if (wdForm.bankAccount === bankAccount) {
      setWdForm((f) => ({ ...f, bankName: "", bankAccount: "", bankOwner: "" }));
    }
  };
  useEffect(() => {
    if (wdSubTab === "history") {
      loadWdHistory();
    } else {
      // Load history ngầm để lấy danh sách tài khoản đã dùng
      (async () => {
        try {
          const res: any = await httpClient.get(APP_CONFIG.WITHDRAW.MY);
          const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          // Trích xuất tài khoản unique, ưu tiên cái dùng gần nhất
          const seen = new Set<string>();
          const accounts: { bankName: string; bankAccount: string; bankOwner: string }[] = [];
          for (const item of list) {
            const key = `${item.bankAccount}`;
            if (!seen.has(key) && item.bankName && item.bankAccount && item.bankOwner && !deletedAccounts.includes(item.bankAccount)) {
              seen.add(key);
              accounts.push({
                bankName: item.bankName,
                bankAccount: item.bankAccount,
                bankOwner: item.bankOwner,
              });
            }
          }
          setSavedAccounts(accounts);
        } catch {
          /* silent */
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wdSubTab]);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bankRef.current && !bankRef.current.contains(e.target as Node)) {
        setBankOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredBanks = VIET_BANKS.filter((b) =>
    b.toLowerCase().includes(bankSearch.toLowerCase())
  );
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(wdForm.amount, 10);
    if (!amount || amount < 50000) {
      toast.error("Số xu rút tối thiểu là 50,000.");
      return;
    }
    if (!wdForm.bankName.trim()) {
      toast.error("Vui lòng nhập tên ngân hàng.");
      return;
    }
    if (!wdForm.bankAccount.trim()) {
      toast.error("Vui lòng nhập số tài khoản.");
      return;
    }
    if (!wdForm.bankOwner.trim()) {
      toast.error("Vui lòng nhập tên chủ tài khoản.");
      return;
    }
    setWdSubmitting(true);
    try {
      await httpClient.post(APP_CONFIG.WITHDRAW.CREATE, {
        amount,
        bankName: wdForm.bankName.trim(),
        bankAccount: wdForm.bankAccount.trim(),
        bankOwner: wdForm.bankOwner.trim(),
        note: wdForm.note.trim() || undefined,
      });
      toast.success("Yêu cầu rút tiền đã được gửi! Quản trị viên sẽ xử lý trong 1-3 ngày làm việc.");
      setWdForm({ amount: "", bankName: "", bankAccount: "", bankOwner: "", note: "" });
      setWdSubTab("history");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Không thể tạo yêu cầu rút tiền.");
    } finally {
      setWdSubmitting(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="info-box warning" style={{ marginBottom: 20 }}>
        💡 Yêu cầu quy đổi xu sang tiền mặt. Quản trị viên sẽ xử lý trong vòng <strong>1-3 ngày làm việc</strong>.
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {(
          [
            { k: "form", l: "Tạo yêu cầu" },
            { k: "history", l: "Lịch sử" },
          ] as const
        ).map(({ k, l }) => (
          <button
            key={k}
            className={`tab-btn${wdSubTab === k ? " active" : ""}`}
            onClick={() => setWdSubTab(k)}
          >
            {l}
          </button>
        ))}
      </div>

      {wdSubTab === "form" && (
        <form
          onSubmit={handleWithdraw}
          style={{ background: "#fdfaf7", border: "1.5px solid #ece6dc", borderRadius: 14, padding: "24px" }}
        >
          {/* Tài khoản đã lưu */}
          {savedAccounts.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#9e8e82", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                🏦 Tài khoản của bạn
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {savedAccounts.map((acc) => {
                  const isActive =
                    wdForm.bankName === acc.bankName &&
                    wdForm.bankAccount === acc.bankAccount &&
                    wdForm.bankOwner === acc.bankOwner;
                  return (
                    <div
                      key={acc.bankAccount}
                      onClick={() => handleSelectAccount(acc)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: `1.5px solid ${isActive ? "#c23d3f" : "#e8e0d6"}`,
                        background: isActive ? "#fef3f3" : "#fff",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) (e.currentTarget as HTMLElement).style.background = "#fdfaf7";
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) (e.currentTarget as HTMLElement).style.background = "#fff";
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1c1512" }}>
                          {acc.bankName}
                        </div>
                        <div style={{ fontSize: 12, color: "#9e8e82", marginTop: 2 }}>
                          {acc.bankAccount} · {acc.bankOwner}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Nút xóa */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAccount(acc.bankAccount);
                          }}
                          title="Xóa tài khoản này"
                          className="w-[22px] h-[22px] rounded-full border border-[#e8e0d6] bg-white flex items-center justify-center cursor-pointer flex-shrink-0 transition-all duration-150 text-[#9e8e82] text-xs hover:bg-[#fef2f2] hover:border-[#fca5a5] hover:text-[#c23d3f]"
                        >
                          ✕
                        </div>

                        {/* Radio indicator */}
                        <div
                          className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${isActive ? "border-[#c23d3f] bg-[#c23d3f]" : "border-[#d1c9bf] bg-transparent"
                            }`}
                        >
                          {isActive && (
                            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                              <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
                <div style={{ flex: 1, height: 1, background: "#ece6dc" }} />
                <span style={{ fontSize: 11, color: "#b8aca0", whiteSpace: "nowrap" }}>hoặc nhập tài khoản mới</span>
                <div style={{ flex: 1, height: 1, background: "#ece6dc" }} />
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#1c1512", display: "block", marginBottom: 6 }}>
                Số xu muốn rút <span style={{ color: "#c23d3f" }}>*</span>
              </label>
              <input
                type="number"
                min={1}
                value={wdForm.amount}
                onChange={(e) => setWdForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="VD: 50000"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #e8e0d6",
                  background: "#fff",
                  fontSize: 14,
                  color: "#1c1512",
                  boxSizing: "border-box",
                }}
              />
              {wdForm.amount && Number(wdForm.amount) > 0 && (
                <div style={{ fontSize: 12, color: "#9e8e82", marginTop: 4 }}>
                  ≈ {formatVnd(Number(wdForm.amount))} (tỉ giá 1 xu = 1đ)
                </div>
              )}
            </div>
            <div ref={bankRef} style={{ position: "relative" }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#1c1512", display: "block", marginBottom: 6 }}>
                Ngân hàng <span style={{ color: "#c23d3f" }}>*</span>
              </label>

              {/* Trigger button */}
              <div
                onClick={() => { setBankOpen((o) => !o); setBankSearch(""); }}
                style={{
                  width: "100%",
                  padding: "10px 36px 10px 14px",
                  borderRadius: 10,
                  border: `1.5px solid ${wdForm.bankName ? "#c23d3f" : "#e8e0d6"}`,
                  background: "#fff",
                  fontSize: 14,
                  color: wdForm.bankName ? "#1c1512" : "#9e8e82",
                  boxSizing: "border-box" as const,
                  cursor: "pointer",
                  userSelect: "none" as const,
                  position: "relative" as const,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {wdForm.bankName || "Chọn ngân hàng…"}
                </span>
                <span style={{ marginLeft: 8, fontSize: 10, color: "#9e8e82" }}>
                  {bankOpen ? "▲" : "▼"}
                </span>
              </div>

              {/* Dropdown panel */}
              {bankOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: "1.5px solid #e8e0d6",
                    borderRadius: 10,
                    zIndex: 999,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                    overflow: "hidden",
                  }}
                >
                  {/* Search input */}
                  <div style={{ padding: "8px 10px", borderBottom: "1px solid #f0ece4" }}>
                    <input
                      autoFocus
                      type="text"
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                      placeholder="🔍 Tìm ngân hàng…"
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        borderRadius: 8,
                        border: "1.5px solid #e8e0d6",
                        fontSize: 13,
                        color: "#1c1512",
                        outline: "none",
                        boxSizing: "border-box" as const,
                      }}
                    />
                  </div>

                  {/* List */}
                  <div style={{ maxHeight: 220, overflowY: "auto" as const }}>
                    {filteredBanks.length === 0 ? (
                      <div style={{ padding: "12px 14px", fontSize: 13, color: "#9e8e82" }}>
                        Không tìm thấy.
                      </div>
                    ) : (
                      filteredBanks.map((bank) => {
                        const [short, ...rest] = bank.split(" – ");
                        const full = rest.join(" – ");
                        const isSelected = wdForm.bankName === bank;
                        return (
                          <div
                            key={bank}
                            onClick={() => {
                              setWdForm((f) => ({ ...f, bankName: bank }));
                              setBankOpen(false);
                            }}
                            style={{
                              padding: "9px 14px",
                              cursor: "pointer",
                              background: isSelected ? "#fef3f3" : "transparent",
                              borderLeft: isSelected ? "3px solid #c23d3f" : "3px solid transparent",
                              display: "flex",
                              flexDirection: "column" as const,
                              gap: 1,
                              transition: "background 0.12s",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) (e.currentTarget as HTMLElement).style.background = "#fdfaf7";
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent";
                            }}
                          >
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#1c1512" }}>{short}</span>
                            {full && <span style={{ fontSize: 11, color: "#9e8e82" }}>{full}</span>}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#1c1512", display: "block", marginBottom: 6 }}>
                Số tài khoản <span style={{ color: "#c23d3f" }}>*</span>
              </label>
              <input
                type="text"
                value={wdForm.bankAccount}
                onChange={(e) => setWdForm((f) => ({ ...f, bankAccount: e.target.value }))}
                placeholder="VD: 1234567890"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #e8e0d6",
                  background: "#fff",
                  fontSize: 14,
                  color: "#1c1512",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#1c1512", display: "block", marginBottom: 6 }}>
                Chủ tài khoản <span style={{ color: "#c23d3f" }}>*</span>
              </label>
              <input
                type="text"
                value={wdForm.bankOwner}
                onChange={(e) => setWdForm((f) => ({ ...f, bankOwner: e.target.value }))}
                placeholder="VD: NGUYEN VAN A"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #e8e0d6",
                  background: "#fff",
                  fontSize: 14,
                  color: "#1c1512",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#1c1512", display: "block", marginBottom: 6 }}>
              Ghi chú (tuỳ chọn)
            </label>
            <input
              type="text"
              value={wdForm.note}
              onChange={(e) => setWdForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Thông tin thêm cho quản trị viên…"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: "1.5px solid #e8e0d6",
                background: "#fff",
                fontSize: 14,
                color: "#1c1512",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={wdSubmitting}
              className="btn-full btn-red-full"
              style={{ padding: "10px 32px", fontSize: 14, maxWidth: 220, opacity: wdSubmitting ? 0.7 : 1 }}
            >
              {wdSubmitting ? "⏳ Đang gửi…" : "💸 Gửi yêu cầu rút tiền"}
            </button>
          </div>
        </form>
      )}

      {wdSubTab === "history" && (
        <div>
          {wdHistoryLoading ? (
            <div className="empty-state">⏳ Đang tải lịch sử…</div>
          ) : wdHistory.length === 0 ? (
            <div className="empty-state">Chưa có yêu cầu rút tiền nào.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {wdHistory.map((wr: any) => {
                const isPending = wr.status === "PENDING";
                const isApproved = wr.status === "APPROVED";
                const st = isApproved
                  ? { label: "✅ Đã duyệt", color: "#14532d", bg: "#f0fdf4", border: "#86efac" }
                  : !isPending
                    ? { label: "❌ Từ chối", color: "#991b1b", bg: "#fef2f2", border: "#fca5a5" }
                    : { label: "⏳ Chờ duyệt", color: "#92400e", bg: "#fffbeb", border: "#fcd34d" };
                return (
                  <div
                    key={wr.id}
                    style={{
                      background: "#fdfaf7",
                      border: "1.5px solid #ece6dc",
                      borderRadius: 14,
                      padding: "14px 18px",
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#1c1512" }}>
                        🪙 {(wr.amount ?? 0).toLocaleString("vi-VN")} xu
                      </div>
                      <div style={{ fontSize: 12, color: "#9e8e82", marginTop: 2 }}>
                        {wr.bankName} · {wr.bankAccount} · {wr.bankOwner}
                      </div>
                      {wr.note && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>📝 {wr.note}</div>}
                      {wr.rejectedReason && (
                        <div style={{ fontSize: 12, color: "#c23d3f", marginTop: 2 }}>
                          Lý do từ chối: {wr.rejectedReason}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: st.color,
                          background: st.bg,
                          border: `1px solid ${st.border}`,
                          borderRadius: 20,
                          padding: "3px 12px",
                          marginBottom: 4,
                        }}
                      >
                        {st.label}
                      </div>
                      <div style={{ fontSize: 11, color: "#9e8e82" }}>{formatDate(wr.createdAt)}</div>
                      {wr.processedAt && (
                        <div style={{ fontSize: 11, color: "#9e8e82" }}>Xử lý: {formatDate(wr.processedAt)}</div>
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
}
