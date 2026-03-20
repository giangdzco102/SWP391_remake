/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores";
import useWalletService from "@/api/useWallet.service";
import usePaymentService, { CoinPackage, PaymentHistoryItem } from "@/api/usePayment.service";
import { useToast } from "@/hooks/use-toast";

// ── Helpers ────────────────────────────────────────────────────────────────
function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}
function formatCoin(n: number) {
  return n.toLocaleString("vi-VN");
}
function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PENDING:   { label: "Đang xử lý", color: "#92400e", bg: "#fffbeb", border: "#fcd34d" },
  PAID:      { label: "Thành công",  color: "#14532d", bg: "#f0fdf4", border: "#86efac" },
  CANCELLED: { label: "Đã hủy",     color: "#991b1b", bg: "#fef2f2", border: "#fca5a5" },
};

const TX_TYPE_MAP: Record<string, { label: string; type: "earn" | "spend" }> = {
  TOPUP:        { label: "Nạp coin",         type: "earn"  },
  BUY:          { label: "Mua chương VIP",   type: "spend" },
  GIFT_SENT:    { label: "Tặng quà",         type: "spend" },
  GIFT_RECEIVED:{ label: "Nhận quà",         type: "earn"  },
  REWARD:       { label: "Thưởng duyệt bài", type: "earn"  },
  EDIT_REWARD:  { label: "Thưởng biên tập",  type: "earn"  },
};

// Default packages shown while the API loads
const FALLBACK_PACKAGES: CoinPackage[] = [
  { id: "BASIC",    displayName: "Gói Cơ Bản",       amountVnd: 10000,  coinAmount: 10000,  bonusPercent: 0  },
  { id: "SAVING",   displayName: "Gói Tiết Kiệm",    amountVnd: 50000,  coinAmount: 56000,  bonusPercent: 12 },
  { id: "POPULAR",  displayName: "Gói Phổ Biến ⭐",  amountVnd: 100000, coinAmount: 118000, bonusPercent: 18 },
  { id: "ADVANCED", displayName: "Gói Nâng Cao",     amountVnd: 200000, coinAmount: 244000, bonusPercent: 22 },
  { id: "VIP",      displayName: "Gói VIP",           amountVnd: 500000, coinAmount: 650000, bonusPercent: 30 },
];

// ── Component ─────────────────────────────────────────────────────────────
export function CoinShopPage() {
  const [tab, setTab] = useState<"buy" | "history" | "topup_history">("buy");
  const [packages, setPackages] = useState<CoinPackage[]>(FALLBACK_PACKAGES);
  const [pkgLoading, setPkgLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [txs, setTxs] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [payHistory, setPayHistory] = useState<PaymentHistoryItem[]>([]);
  const [payHistoryLoading, setPayHistoryLoading] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [lockedBalance, setLockedBalance] = useState<number>(0);

  const { user } = useAuthStore();
  const { getWallet, getTransactions } = useWalletService();
  const { getPackages, createPaymentLink, getPaymentHistory, recoverPayments } = usePaymentService();
  const toast = useToast();

  // Load packages (public endpoint)
  useEffect(() => {
    setPkgLoading(true);
    getPackages()
      .then((res: any) => {
        const list: CoinPackage[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (list.length > 0) setPackages(list);
      })
      .catch(() => { /* keep fallback */ })
      .finally(() => setPkgLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load wallet balance
  const loadWallet = useCallback(() => {
    if (!user) return;
    getWallet().then((res: any) => {
      const d = res?.data ?? res;
      if (d?.balance != null) setWalletBalance(d.balance);
      if (d?.lockedBalance != null) setLockedBalance(d.lockedBalance);
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => { loadWallet(); }, [loadWallet]);

  // Load wallet transaction history
  useEffect(() => {
    if (!user || tab !== "history") return;
    setTxLoading(true);
    getTransactions()
      .then((res: any) => {
        const list: any[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setTxs(list);
      })
      .catch(() => {})
      .finally(() => setTxLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, user]);

  // Load PayOS top-up history
  useEffect(() => {
    if (!user || tab !== "topup_history") return;
    setPayHistoryLoading(true);
    getPaymentHistory()
      .then((res: any) => {
        const list: PaymentHistoryItem[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setPayHistory(list);
      })
      .catch(() => {})
      .finally(() => setPayHistoryLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, user]);

  const handleBuy = async (packageId: string) => {
    if (!user) { toast.error("Vui lòng đăng nhập để nạp coin."); return; }
    setBuyingId(packageId);
    try {
      const res: any = await createPaymentLink(packageId);
      const d = res?.data ?? res;
      const url: string = d?.checkoutUrl ?? d?.checkout_url ?? "";
      if (url) {
        window.location.href = url;
      } else {
        toast.error("Không lấy được link thanh toán. Thử lại sau.");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "";
      toast.error(msg || "Không thể tạo đơn thanh toán. Thử lại sau.");
    } finally {
      setBuyingId(null);
    }
  };

  const handleRecover = async () => {
    if (!user) return;
    setRecovering(true);
    try {
      const res: any = await recoverPayments();
      const list: PaymentHistoryItem[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const recovered = list.filter((i) => i.status === "PAID").length;
      if (recovered > 0) {
        toast.success(`Đã cộng coin cho ${recovered} đơn thành công!`);
        // Refresh wallet + history
        getWallet().then((r: any) => {
          const d = r?.data ?? r;
          if (d?.balance != null) setWalletBalance(d.balance);
        }).catch(() => {});
        setPayHistory(list);
      } else {
        toast.error("Không tìm thấy đơn nào cần xử lý.");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "";
      toast.error(msg || "Không thể recover. Thử lại sau.");
    } finally {
      setRecovering(false);
    }
  };

  // ── Unauthorized view ───────────────────────────────────────────────────
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
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {([
          { key: "buy", label: "💳 Nạp coin" },
          { key: "topup_history", label: "📋 Lịch sử nạp" },
          { key: "history", label: "📒 Giao dịch ví" },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            className={`tab-btn${tab === key ? " active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Nạp coin ─────────────────────────────────────────────── */}
      {tab === "buy" && (
        <div className="fade-in">
          <div className="info-box warning" style={{ marginBottom: 20 }}>
            💡 <strong>Tip:</strong> Reviewer kiếm 20🪙/duyệt · Editor kiếm coin theo nhiệm vụ.
          </div>

          {pkgLoading ? (
            <div className="empty-state">⏳ Đang tải gói coin...</div>
          ) : (
            <div className="coin-packages">
              {packages.map((pkg) => {
                const isBest = pkg.id === "POPULAR";
                const isLoading = buyingId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    className={`coin-pkg flex flex-col h-full justify-between${isBest ? " best" : ""}`}
                    style={{ cursor: isLoading ? "wait" : "pointer", opacity: buyingId && !isLoading ? 0.6 : 1, transition: "opacity 0.2s" }}
                    onClick={() => !buyingId && handleBuy(pkg.id)}
                  >
                    {isBest && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#c23d3f", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                        🔥 Phổ biến nhất
                      </div>
                    )}
                    {pkg.bonusPercent > 0 && (
                      <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", borderRadius: 20, padding: "2px 9px", marginBottom: 6 }}>
                        +{pkg.bonusPercent}% BONUS
                      </div>
                    )}
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: "#1c1512", marginBottom: 4 }}>
                      {pkg.displayName}
                    </div>
                    <div className="coin-pkg-amount" style={{ fontSize: 26 }}>
                      🪙 {formatCoin(pkg.coinAmount)}
                    </div>
                    {pkg.bonusPercent > 0 && (
                      <div style={{ fontSize: 12, color: "#9e8e82", marginBottom: 4 }}>
                        Gốc: {formatCoin(pkg.amountVnd / 10)} + Bonus: {formatCoin(pkg.coinAmount - pkg.amountVnd / 10)}
                      </div>
                    )}
                    <div className="coin-pkg-price">{formatVnd(pkg.amountVnd)}</div>
                    <button
                      className="btn-full btn-red-full"
                      style={{ padding: "9px", marginTop: 12, fontSize: 13, opacity: isLoading ? 0.7 : 1 }}
                      disabled={!!buyingId}
                      onClick={(e) => { e.stopPropagation(); if (!buyingId) handleBuy(pkg.id); }}
                    >
                      {isLoading ? "⏳ Đang tạo đơn..." : "💳 Nạp ngay"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* PayOS notice */}
          <div style={{ marginTop: 24, padding: "14px 18px", background: "#f8fafc", border: "1.5px solid #e8e0d6", borderRadius: 12, fontSize: 13, color: "#6b7280", display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🔒</span>
            <div>
              Thanh toán an toàn qua <strong style={{ color: "#1c1512" }}>PayOS</strong>.
              Coin sẽ được cộng tự động sau khi thanh toán thành công — thường trong vài giây.
              <br />
              <span style={{ color: "#9e8e82" }}>Hỗ trợ: chuyển khoản ngân hàng, ví điện tử, QR code.</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Lịch sử nạp PayOS ───────────────────────────────────────── */}
      {tab === "topup_history" && (
        <div className="fade-in">
          {/* Recover banner */}
          <div className="info-box warning" style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <span>💡 Coin chưa vào sau khi thanh toán? Nhấn <strong>Recover</strong> để kiểm tra lại.</span>
            <button
              className="btn-full btn-red-full"
              style={{ padding: "7px 18px", fontSize: 13, maxWidth: 140, opacity: recovering ? 0.7 : 1 }}
              disabled={recovering}
              onClick={handleRecover}
            >
              {recovering ? "⏳ Đang xử lý..." : "🔄 Recover coin"}
            </button>
          </div>

          {payHistoryLoading ? (
            <div className="empty-state">⏳ Đang tải lịch sử...</div>
          ) : payHistory.length === 0 ? (
            <div className="empty-state">Chưa có đơn nạp coin nào</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {payHistory.map((item) => {
                const st = STATUS_MAP[item.status] ?? STATUS_MAP.PENDING;
                return (
                  <div
                    key={item.id}
                    style={{ background: "#fdfaf7", border: "1.5px solid #ece6dc", borderRadius: 14, padding: "14px 18px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}
                  >
                    {/* Date + order */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#1c1512" }}>{item.packageName}</div>
                      <div style={{ fontSize: 12, color: "#9e8e82", marginTop: 2 }}>
                        #{item.orderCode} · {formatDate(item.createdAt)}
                      </div>
                      {item.status === "PAID" && item.paidAt && (
                        <div style={{ fontSize: 12, color: "#16a34a", marginTop: 1 }}>✓ Hoàn thành: {formatDate(item.paidAt)}</div>
                      )}
                    </div>

                    {/* Amount */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#c23d3f" }}>+🪙 {formatCoin(item.coinAmount)}</div>
                      <div style={{ fontSize: 12, color: "#9e8e82" }}>{formatVnd(item.amountVnd)}</div>
                    </div>

                    {/* Status badge */}
                    <div style={{ fontSize: 12, fontWeight: 700, color: st.color, background: st.bg, border: `1px solid ${st.border}`, borderRadius: 20, padding: "3px 10px", flexShrink: 0 }}>
                      {st.label}
                    </div>

                    {/* Re-open payment link for PENDING */}
                    {item.status === "PENDING" && item.checkoutUrl && (
                      <a
                        href={item.checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 12, fontWeight: 600, color: "#c23d3f", textDecoration: "underline", flexShrink: 0 }}
                      >
                        Mở lại trang thanh toán →
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Lịch sử giao dịch ví ────────────────────────────────────── */}
      {tab === "history" && (
        <div className="fade-in coin-history">
          {txLoading ? (
            <div className="empty-state">⏳ Đang tải lịch sử giao dịch...</div>
          ) : txs.length === 0 ? (
            <div className="empty-state">Chưa có giao dịch</div>
          ) : (
            txs.map((tx: any, i: number) => {
              const mapped = TX_TYPE_MAP[tx.type] ?? { label: tx.type ?? "Giao dịch", type: "earn" as const };
              return (
                <div key={tx.id ?? i} className="coin-tx">
                  <div className="coin-tx-info">
                    <div className={`coin-tx-icon ${mapped.type === "earn" ? "coin-tx-earn" : "coin-tx-spend"}`}>
                      {mapped.type === "earn" ? "🪙" : "💸"}
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
                  <div className={`coin-tx-amount ${mapped.type === "earn" ? "coin-earn-color" : "coin-spend-color"}`}>
                    {mapped.type === "earn" ? "+" : "-"}{tx.amount?.toLocaleString("vi-VN")}🪙
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default CoinShopPage;


