import React, { useState } from 'react';
import { Ico } from '../Icons';

export function CoinShopPage({ user, setUser, coinTxs = [], show }) {
    const [tab, setTab] = useState("buy");
    const packages = [
        { id: 1, coins: 100, price: "10.000đ", bonus: 0 },
        { id: 2, coins: 500, price: "45.000đ", bonus: 50, best: false },
        { id: 3, coins: 1000, price: "80.000đ", bonus: 200, best: true },
        { id: 4, coins: 3000, price: "200.000đ", bonus: 750, best: false },
    ];

    const buy = (pkg) => {
        if (!user) {
            show("Vui lòng đăng nhập để nạp coin.", "error");
            return;
        }
        setUser((u) => ({ ...u, coins: (u.coins || 0) + pkg.coins + pkg.bonus }));
        show(`🎉 Nạp thành công ${pkg.coins + pkg.bonus}🪙!`, "success");
    };

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

    return (
        <div className="coin-shop-wrap fade-in">
            <div className="coin-hero">
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, marginBottom: 8, opacity: .8 }}>Coin của bạn</div>
                <div className="coin-balance">🪙 {user.coins.toLocaleString()}</div>
                <div style={{ fontSize: 14, opacity: .6, marginTop: 8 }}>Dùng coin để mở khóa chương VIP, hỗ trợ tác giả và nhiều hơn nữa</div>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                <button 
                  className={`tab-btn${tab === "buy" ? " active" : ""}`} 
                  onClick={() => setTab("buy")}
                >
                  Nạp coin
                </button>
                <button 
                  className={`tab-btn${tab === "history" ? " active" : ""}`} 
                  onClick={() => setTab("history")}
                >
                  Lịch sử giao dịch
                </button>
            </div>

            {tab === "buy" && (
                <div className="fade-in">
                    <div className="info-box warning" style={{ marginBottom: 20 }}>
                        💡 <strong>Tip:</strong> Reviewer kiếm 20🪙/duyệt · Editor kiếm coin theo nhiệm vụ. 
                        <a href="#" style={{ color: "#c23d3f", fontWeight: 600, marginLeft: 6 }}>Đăng ký làm Reviewer hoặc Editor →</a>
                    </div>
                    <div className="coin-packages">
                        {packages.map(pkg => (
                            <div 
                              key={pkg.id} 
                              className={`coin-pkg${pkg.best ? " best" : ""}`} 
                              onClick={() => buy(pkg)}
                            >
                                {pkg.best && (
                                  <div style={{ fontSize: 11, fontWeight: 700, color: "#c23d3f", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                                    🔥 Phổ biến nhất
                                  </div>
                                )}
                                <div className="coin-pkg-amount">🪙 {pkg.coins.toLocaleString()}</div>
                                {pkg.bonus > 0 && <div className="coin-pkg-bonus">+{pkg.bonus} bonus</div>}
                                <div style={{ fontSize: 13, color: "#9e8e82", marginBottom: 8 }}>
                                  Tổng: {(pkg.coins + pkg.bonus).toLocaleString()}🪙
                                </div>
                                <div className="coin-pkg-price">{pkg.price}</div>
                                <button className="btn-full btn-red-full" style={{ padding: "8px", marginTop: 12, fontSize: 13 }}>
                                  Nạp ngay
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === "history" && (
                <div className="fade-in coin-history">
                    {!coinTxs || coinTxs.length === 0 ? (
                        <div className="empty-state">Chưa có giao dịch</div>
                    ) : (
                        coinTxs.map((tx) => (
                            <div key={tx.id} className="coin-tx">
                                <div className="coin-tx-info">
                                    <div className={`coin-tx-icon ${tx.type === "earn" ? "coin-tx-earn" : "coin-tx-spend"}`}>
                                        {tx.type === "earn" ? "🪙" : "💸"}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: "#1c1512" }}>{tx.reason}</div>
                                        <div style={{ fontSize: 12, color: "#9e8e82" }}>{tx.date}</div>
                                    </div>
                                </div>
                                <div className={`coin-tx-amount ${tx.type === "earn" ? "coin-earn-color" : "coin-spend-color"}`}>
                                    {tx.type === "earn" ? "+" : "-"}{tx.amount}🪙
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}