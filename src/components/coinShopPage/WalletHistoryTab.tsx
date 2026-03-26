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
  const [txFilter, setTxFilter] = useState<string>("ALL");
  const [txPage, setTxPage] = useState(1);
  const TX_PER_PAGE = 10;

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
      .catch(() => { })
      .finally(() => setTxLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const txTypes = Array.from(new Set(txs.map((tx) => tx.type).filter(Boolean)));

  const filteredTxs = txFilter === "ALL"
    ? txs
    : txs.filter((tx) => tx.type === txFilter);

  const txTotalPages = Math.ceil(filteredTxs.length / TX_PER_PAGE);
  const pagedTxs = filteredTxs.slice((txPage - 1) * TX_PER_PAGE, txPage * TX_PER_PAGE);

  return (
    <div className="fade-in coin-history">
      {/* Filter bar */}
      {!txLoading && txs.length > 0 && (
        <div style={{ overflow: "hidden", margin: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "nowrap", overflowX: "auto", paddingBottom: 4 }}>
            {[{ type: "ALL", label: "Tất cả", count: txs.length }, ...txTypes.map((type) => ({
              type,
              label: (TX_TYPE_MAP[type] ?? { label: type }).label,
              count: txs.filter((tx) => tx.type === type).length,
            }))].map(({ type, label, count }) => {
              const isActive = txFilter === type;
              return (
                <button
                  key={type}
                  onClick={() => { setTxFilter(type); setTxPage(1); }}
                  className={`tab-btn${isActive ? " active" : ""}`}
                  style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  {label}
                  <span
                    style={{
                      padding: "1px 7px",
                      borderRadius: 20,
                      fontSize: 10,
                      fontWeight: 700,
                      background: isActive ? "rgba(255,255,255,0.25)" : "#f0ece4",
                      color: isActive ? "#fff" : "#9e8e82",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* List */}
      {txLoading ? (
        <div className="empty-state">⏳ Đang tải lịch sử giao dịch...</div>
      ) : txs.length === 0 ? (
        <div className="empty-state">Chưa có giao dịch</div>
      ) : filteredTxs.length === 0 ? (
        <div className="empty-state">Không có giao dịch nào trong mục này.</div>
      ) : (
        <>
          {pagedTxs.map((tx: any, i: number) => {
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
          })}
      {/* Phân trang */}
          {txTotalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 20, flexWrap: "wrap" }}>
              {/* Prev */}
              <button
                onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                disabled={txPage === 1}
                className="tab-btn"
                style={{ padding: "6px 14px", opacity: txPage === 1 ? 0.4 : 1 }}
              >
                ‹
              </button>

              {/* Pages */}
              {Array.from({ length: txTotalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === txTotalPages || Math.abs(p - txPage) <= 1)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} style={{ fontSize: 13, color: "#9e8e82", padding: "0 2px" }}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setTxPage(p as number)}
                      className={`tab-btn${txPage === p ? " active" : ""}`}
                      style={{ padding: "6px 12px", minWidth: 36 }}
                    >
                      {p}
                    </button>
                  )
                )}

              {/* Next */}
              <button
                onClick={() => setTxPage((p) => Math.min(txTotalPages, p + 1))}
                disabled={txPage === txTotalPages}
                className="tab-btn"
                style={{ padding: "6px 14px", opacity: txPage === txTotalPages ? 0.4 : 1 }}
              >
                ›
              </button>

              {/* Info */}
              <span style={{ fontSize: 12, color: "#9e8e82", marginLeft: 4 }}>
                {(txPage - 1) * TX_PER_PAGE + 1}–{Math.min(txPage * TX_PER_PAGE, filteredTxs.length)} / {filteredTxs.length}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
