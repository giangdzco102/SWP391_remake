"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import usePaymentService, { CoinPackage } from "@/api/usePayment.service";
import { formatCoin, formatVnd } from "@/utils/coinShop.utils";
import { FALLBACK_PACKAGES } from "@/utils/coinShop.constants";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores";

export function BuyCoinTab() {
  const [packages, setPackages] = useState<CoinPackage[]>(FALLBACK_PACKAGES);
  const [pkgLoading, setPkgLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const { getPackages, createPaymentLink } = usePaymentService();
  const { user } = useAuthStore();
  const toast = useToast();

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

  const handleBuy = async (packageId: string) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để nạp coin.");
      return;
    }
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

  return (
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
  );
}
