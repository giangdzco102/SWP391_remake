"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores";
import useWalletService from "@/api/useWallet.service";
import { BuyCoinTab } from "@/components/coinShopPage/BuyCoinTab";
import { TopupHistoryTab } from "@/components/coinShopPage/TopupHistoryTab";
import { WalletHistoryTab } from "@/components/coinShopPage/WalletHistoryTab";
import { WithdrawTab } from "@/components/coinShopPage/WithdrawTab";

export function CoinShopPage() {
  const [tab, setTab] = useState<"buy" | "history" | "topup_history" | "withdraw">("buy");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [lockedBalance, setLockedBalance] = useState<number>(0);

  const { user } = useAuthStore();
  const { getWallet } = useWalletService();

  const loadWallet = useCallback(() => {
    if (!user) return;
    getWallet()
      .then((res: any) => {
        const d = res?.data ?? res;
        if (d?.balance != null) setWalletBalance(d.balance);
        if (d?.lockedBalance != null) setLockedBalance(d.lockedBalance);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  if (!user) {
    return (
      <div className="section fade-in">
        <div className="empty-state">
          🪙 Chưa đăng nhập
          <p>Vui lòng đăng nhập để vào Cửa hàng Coin.</p>
        </div>
      </div>
    );
  }

  const available = (walletBalance ?? user.walletBalance ?? 0) - lockedBalance;

  return (
    <div className="coin-shop-wrap fade-in">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="coin-hero">
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, marginBottom: 8, opacity: 0.8 }}>
          Coin của bạn
        </div>
        <div className="coin-balance">
          🪙 {(walletBalance ?? user.walletBalance ?? 0).toLocaleString("vi-VN")}
        </div>
        {lockedBalance > 0 && (
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4, color: "#fbbf24" }}>
            🔒 {lockedBalance.toLocaleString("vi-VN")} coin đang bị tạm giữ · Khả dụng: {available.toLocaleString("vi-VN")} coin
          </div>
        )}
        <div style={{ fontSize: 14, opacity: 0.6, marginTop: 8 }}>
          Dùng coin để mở khóa chương VIP, hỗ trợ tác giả và nhiều hơn nữa
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="coin-tabs">
        {(
          [
            { key: "buy", label: "💳 Nạp coin" },
            { key: "topup_history", label: "📋 Lịch sử nạp" },
            { key: "history", label: "📒 Giao dịch ví" },
            { key: "withdraw", label: "💸 Rút tiền" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            className={`coin-tab-btn${tab === key ? " active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="coin-tab-content">
        {tab === "buy" && <BuyCoinTab />}
        {tab === "topup_history" && <TopupHistoryTab onRecoverSuccess={loadWallet} />}
        {tab === "history" && <WalletHistoryTab />}
        {tab === "withdraw" && <WithdrawTab />}
      </div>
    </div>
  );
}

export default CoinShopPage;
