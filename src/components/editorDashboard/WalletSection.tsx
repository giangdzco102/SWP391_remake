/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import usePaymentService, { CoinPackage } from "@/api/usePayment.service";
import { useToast } from "@/hooks/use-toast";
import { WalletInfo, WalletTx } from "@/types/editorDashboard";
import { T, EDITOR_FALLBACK_PKGS } from "@/utils/editorDashboard.constants";

export function WalletSection({ wallet, transactions, loadingTx }: { wallet: WalletInfo | null; transactions: WalletTx[]; loadingTx: boolean }) {
  const [packages, setPackages] = useState<CoinPackage[]>(EDITOR_FALLBACK_PKGS);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const paymentService = usePaymentService();
  const toastW = useToast();
  const txColor: Record<string, string> = { TOPUP: T.success, BUY: T.info, GIFT: T.purple, REWARD: T.accent, LOCK: T.warn, RELEASE: T.success };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    paymentService.getPackages().then((res: any) => {
      const list: CoinPackage[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (list.length > 0) setPackages(list);
    }).catch(() => { });
  }, []);

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
