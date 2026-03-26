/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import useHttpClient from "@/api/useHttpClient";
import APP_CONFIG from "@/config/app-config";
import { useToast } from "@/hooks/use-toast";
import usePaymentService from "@/api/usePayment.service";
import { CoinPackage } from "@/api/usePayment.service";
import { WalletInfo, WalletTx } from "@/types/myStoriesPage";
import { T, WALLET_FALLBACK_PKGS } from "@/utils/myStoriesPage.constants";
import { formatVNDate } from "@/utils/time";

const TX_COLOR_MAP: Record<string, string> = {
  TOPUP: T.success,
  BUY: T.info,
  GIFT: T.purple,
  REWARD: T.accent,
  LOCK: T.warn,
  RELEASE: T.success,
};

function wdStatusStyle(status: string): React.CSSProperties {
  if (status === "APPROVED")
    return { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" };
  if (status === "REJECTED")
    return { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" };
  return { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" };
}

interface WalletSectionProps {
  wallet: WalletInfo | null;
  transactions: WalletTx[];
  loadingTx: boolean;
}

export function WalletSection({
  wallet,
  transactions,
  loadingTx,
}: WalletSectionProps) {
  const [packages, setPackages] = useState<CoinPackage[]>(WALLET_FALLBACK_PKGS);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const paymentService = usePaymentService();
  const toastW = useToast();
  const httpClient = useHttpClient();

  const [withdrawTab, setWithdrawTab] = useState<"form" | "history">("form");
  const [withdrawHistory, setWithdrawHistory] = useState<any[]>([]);
  const [loadingWH, setLoadingWH] = useState(false);
  const [submittingWD, setSubmittingWD] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    bankName: "",
    bankAccount: "",
    bankOwner: "",
    note: "",
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    paymentService
      .getPackages()
      .then((res: any) => {
        const list: CoinPackage[] = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        if (list.length > 0) setPackages(list);
      })
      .catch(() => {});
  }, []);

  const loadWithdrawHistory = async () => {
    setLoadingWH(true);
    try {
      const res: any = await httpClient.get(APP_CONFIG.WITHDRAW.MY);
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      setWithdrawHistory(list);
    } finally {
      setLoadingWH(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (withdrawTab === "history") loadWithdrawHistory();
  }, [withdrawTab]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(withdrawForm.amount, 10);
    if (!amount || amount <= 0) {
      toastW.error("Số xu phải lớn hơn 0.");
      return;
    }
    if (!withdrawForm.bankName.trim()) {
      toastW.error("Vui lòng nhập tên ngân hàng.");
      return;
    }
    if (!withdrawForm.bankAccount.trim()) {
      toastW.error("Vui lòng nhập số tài khoản.");
      return;
    }
    if (!withdrawForm.bankOwner.trim()) {
      toastW.error("Vui lòng nhập tên chủ tài khoản.");
      return;
    }
    setSubmittingWD(true);
    try {
      await httpClient.post(APP_CONFIG.WITHDRAW.CREATE, {
        amount,
        bankName: withdrawForm.bankName.trim(),
        bankAccount: withdrawForm.bankAccount.trim(),
        bankOwner: withdrawForm.bankOwner.trim(),
        note: withdrawForm.note.trim() || undefined,
      });
      toastW.success("Yêu cầu rút tiền đã được gửi!");
      setWithdrawForm({
        amount: "",
        bankName: "",
        bankAccount: "",
        bankOwner: "",
        note: "",
      });
      setWithdrawTab("history");
    } catch (err: any) {
      toastW.error(
        err?.response?.data?.message ?? "Không thể tạo yêu cầu rút tiền."
      );
    } finally {
      setSubmittingWD(false);
    }
  };

  const handleBuy = async (pkgId: string) => {
    setBuyingId(pkgId);
    try {
      const res: any = await paymentService.createPaymentLink(pkgId);
      const d = res?.data ?? res;
      const url: string = d?.checkoutUrl ?? d?.checkout_url ?? "";
      if (url) window.location.href = url;
      else toastW.error("Không lấy được link thanh toán.");
    } catch (err: any) {
      toastW.error(
        err?.response?.data?.message ?? "Không thể tạo đơn thanh toán."
      );
    } finally {
      setBuyingId(null);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: T.radiusSm,
    border: `1.5px solid ${T.border}`,
    background: T.bg,
    color: T.text,
    fontSize: 13,
    boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Balance row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div
          style={{
            background: T.successBg,
            border: `1.5px solid ${T.successBorder}`,
            borderRadius: T.radius,
            padding: "18px 20px",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: T.success,
              fontWeight: 700,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Số dư khả dụng
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: T.success }}>
            {(wallet?.balance ?? 0).toLocaleString()}{" "}
            <span style={{ fontSize: 14 }}>xu</span>
          </div>
        </div>
        <div
          style={{
            background: T.warnBg,
            border: `1.5px solid ${T.warnBorder}`,
            borderRadius: T.radius,
            padding: "18px 20px",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: T.warn,
              fontWeight: 700,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Đang khoá
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: T.warn }}>
            {(wallet?.lockedBalance ?? 0).toLocaleString()}{" "}
            <span style={{ fontSize: 14 }}>xu</span>
          </div>
        </div>
      </div>

      {/* PayOS packages */}
      <div
        style={{
          background: T.card,
          border: `1.5px solid ${T.border}`,
          borderRadius: T.radius,
          padding: "18px 20px",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: T.text,
            marginBottom: 4,
          }}
        >
          💳 Nạp coin qua PayOS
        </div>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 14 }}>
          Thanh toán an toàn · Coin vào ngay sau khi thanh toán thành công
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 10,
          }}
        >
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => !buyingId && handleBuy(pkg.id)}
              disabled={!!buyingId}
              style={{
                padding: "12px 8px",
                borderRadius: T.radiusSm,
                border: `1.5px solid ${
                  buyingId === pkg.id ? T.accent : T.border
                }`,
                background: buyingId === pkg.id ? T.accentLight : T.card,
                cursor: buyingId ? "wait" : "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                transition: "all 0.15s",
                opacity: buyingId && buyingId !== pkg.id ? 0.55 : 1,
                fontFamily: T.font,
              }}
            >
              {pkg.bonusPercent > 0 && (
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    background: T.warnBg,
                    color: T.warn,
                    border: `1px solid ${T.warnBorder}`,
                    borderRadius: 10,
                    padding: "1px 6px",
                  }}
                >
                  +{pkg.bonusPercent}%
                </span>
              )}
              <span style={{ fontSize: 11, fontWeight: 700, color: T.text }}>
                {pkg.displayName}
              </span>
              <span style={{ fontSize: 15, fontWeight: 800, color: T.accent }}>
                🪙 {pkg.coinAmount.toLocaleString()}
              </span>
              <span style={{ fontSize: 11, color: T.textMuted }}>
                {pkg.amountVnd.toLocaleString()}đ
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#fff",
                  background: buyingId === pkg.id ? T.textMuted : T.accent,
                  borderRadius: 6,
                  padding: "3px 10px",
                  marginTop: 2,
                }}
              >
                {buyingId === pkg.id ? "⏳" : "Nạp"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Withdraw section */}
      <div
        style={{
          background: T.card,
          border: `1.5px solid ${T.border}`,
          borderRadius: T.radius,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: `1px solid ${T.borderLight}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>
            💸 Rút tiền
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {(["form", "history"] as const).map((wt) => (
              <button
                key={wt}
                onClick={() => setWithdrawTab(wt)}
                style={{
                  padding: "4px 14px",
                  borderRadius: 20,
                  border: `1.5px solid ${
                    withdrawTab === wt ? T.accent : T.border
                  }`,
                  background:
                    withdrawTab === wt ? T.accentLight : "transparent",
                  color: withdrawTab === wt ? T.accent : T.textSec,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {wt === "form" ? "Tạo yêu cầu" : "Lịch sử"}
              </button>
            ))}
          </div>
        </div>

        {withdrawTab === "form" && (
          <form
            onSubmit={handleWithdraw}
            style={{
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 12, color: T.textMuted }}>
              Yêu cầu quy đổi xu sang tiền mặt. Quản trị viên sẽ xử lý trong
              vòng 1-3 ngày làm việc.
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {[
                {
                  key: "amount",
                  label: "Số xu muốn rút",
                  type: "number",
                  placeholder: "VD: 50000",
                  required: true,
                },
                {
                  key: "bankName",
                  label: "Ngân hàng",
                  type: "text",
                  placeholder: "VD: Vietcombank",
                  required: true,
                },
                {
                  key: "bankAccount",
                  label: "Số tài khoản",
                  type: "text",
                  placeholder: "VD: 1234567890",
                  required: true,
                },
                {
                  key: "bankOwner",
                  label: "Chủ tài khoản",
                  type: "text",
                  placeholder: "VD: NGUYEN VAN A",
                  required: true,
                },
              ].map(({ key, label, type, placeholder, required }) => (
                <div key={key}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: T.text,
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    {label}{" "}
                    {required && <span style={{ color: T.danger }}>*</span>}
                  </label>
                  <input
                    type={type}
                    min={type === "number" ? 1 : undefined}
                    value={(withdrawForm as any)[key]}
                    onChange={(e) =>
                      setWithdrawForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    placeholder={placeholder}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: T.text,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Ghi chú (tuỳ chọn)
              </label>
              <input
                type="text"
                value={withdrawForm.note}
                onChange={(e) =>
                  setWithdrawForm((f) => ({ ...f, note: e.target.value }))
                }
                placeholder="Thông tin thêm cho quản trị viên…"
                style={inputStyle}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={submittingWD}
                style={{
                  padding: "9px 24px",
                  borderRadius: T.radiusSm,
                  border: "none",
                  background: T.accent,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: submittingWD ? "wait" : "pointer",
                  opacity: submittingWD ? 0.7 : 1,
                }}
              >
                {submittingWD ? "⏳ Đang gửi…" : "💸 Gửi yêu cầu rút tiền"}
              </button>
            </div>
          </form>
        )}

        {withdrawTab === "history" && (
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {loadingWH ? (
              <div
                style={{ padding: 20, textAlign: "center", color: T.textMuted }}
              >
                Đang tải…
              </div>
            ) : withdrawHistory.length === 0 ? (
              <div
                style={{ padding: 20, textAlign: "center", color: T.textMuted }}
              >
                Chưa có yêu cầu rút tiền nào.
              </div>
            ) : (
              withdrawHistory.map((wr: any) => (
                <div
                  key={wr.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 18px",
                    borderBottom: `1px solid ${T.borderLight}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 6,
                      padding: "2px 8px",
                      whiteSpace: "nowrap",
                      ...wdStatusStyle(wr.status),
                    }}
                  >
                    {wr.status === "APPROVED"
                      ? "✅ Đã duyệt"
                      : wr.status === "REJECTED"
                        ? "❌ Từ chối"
                        : "⏳ Chờ duyệt"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{ fontSize: 13, fontWeight: 700, color: T.text }}
                    >
                      {(wr.amount ?? 0).toLocaleString()} xu
                    </div>
                    <div style={{ fontSize: 12, color: T.textSec }}>
                      {wr.bankName} · {wr.bankAccount} · {wr.bankOwner}
                    </div>
                    {wr.rejectedReason && (
                      <div
                        style={{
                          fontSize: 11,
                          color: T.danger,
                          marginTop: 2,
                        }}
                      >
                        Lý do từ chối: {wr.rejectedReason}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: T.textMuted,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatVNDate(wr.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Transaction history */}
      <div
        style={{
          background: T.card,
          border: `1.5px solid ${T.border}`,
          borderRadius: T.radius,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: `1px solid ${T.borderLight}`,
            fontWeight: 700,
            fontSize: 14,
            color: T.text,
          }}
        >
          📜 Lịch sử giao dịch
        </div>
        <div style={{ maxHeight: 320, overflowY: "auto" }}>
          {loadingTx ? (
            <div
              style={{ padding: 20, textAlign: "center", color: T.textMuted }}
            >
              Đang tải…
            </div>
          ) : transactions.length === 0 ? (
            <div
              style={{ padding: 20, textAlign: "center", color: T.textMuted }}
            >
              Chưa có giao dịch.
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 18px",
                  borderBottom: `1px solid ${T.borderLight}`,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: TX_COLOR_MAP[tx.type] ?? T.gray,
                    background: T.grayBg,
                    borderRadius: 6,
                    padding: "2px 8px",
                    minWidth: 60,
                    textAlign: "center",
                  }}
                >
                  {tx.type}
                </span>
                <div style={{ flex: 1, fontSize: 13, color: T.text }}>
                  {tx.description || "—"}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: tx.amount >= 0 ? T.success : T.danger,
                  }}
                >
                  {tx.amount >= 0 ? "+" : ""}
                  {tx.amount.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: T.textMuted }}>
                  {formatVNDate(tx.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
