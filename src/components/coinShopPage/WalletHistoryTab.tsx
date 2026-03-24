"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import useWalletService from "@/api/useWallet.service";
import { formatDate } from "@/utils/coinShop.utils";
import { TX_TYPE_MAP } from "@/utils/coinShop.constants";
import { useAuthStore } from "@/stores";

export function WalletHistoryTab() {
  const [txs, setTxs] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  const { getTransactions } = useWalletService();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;
    setTxLoading(true);
    getTransactions()
      .then((res: any) => {
        const list: any[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setTxs(list);
      })
      .catch(() => {})
      .finally(() => setTxLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="fade-in coin-history">
      {txLoading ? (
        <div className="empty-state">⏳ Đang tải lịch sử giao dịch...</div>
      ) : txs.length === 0 ? (
        <div className="empty-state">Chưa có giao dịch</div>
      ) : (
        txs.map((tx: any, i: number) => {
          const mapped = TX_TYPE_MAP[tx.type] ?? {
            label: tx.type ?? "Giao dịch",
            type: (tx.amount >= 0 ? "earn" : "spend") as "earn" | "spend",
          };
          const isEarn = (tx.amount ?? 0) > 0;
          return (
            <div key={tx.id ?? i} className="coin-tx">
              <div className="coin-tx-info">
                <div className={`coin-tx-icon ${isEarn ? "coin-tx-earn" : "coin-tx-spend"}`}>
                  {isEarn ? "🪙" : "💸"}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1c1512" }}>
                    {tx.description ?? mapped.label}
                  </div>
                  <div style={{ fontSize: 12, color: "#9e8e82" }}>
                    {formatDate(tx.createdAt)}
                  </div>
                </div>
              </div>
              <div className={`coin-tx-amount ${isEarn ? "coin-earn-color" : "coin-spend-color"}`}>
                {isEarn ? "+" : ""}
                {tx.amount?.toLocaleString("vi-VN")}🪙
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
