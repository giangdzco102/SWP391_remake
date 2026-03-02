import React, { useState } from 'react';
import { StoryCard } from './StoryCard';
import { Ico } from '../Icons';
import { AvatarComp } from '../ui';
import { AvatarCropModal } from './AvatarCropModal';

export function ProfilePage({ user, setUser, stories, likedStories, reviews, coinTxs, navTo, show }) {
    const [tab, setTab] = useState("info");
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState(user.name);
    const [editBio, setEditBio] = useState(user.bio || "");
    const [editPen, setEditPen] = useState(user.penName || "");
    const [showAvatarModal, setShowAvatarModal] = useState(false);

    const saveProfile = () => {
        setUser((u) => ({ ...u, name: editName, bio: editBio, penName: editPen }));
        setEditMode(false);
        show("Đã cập nhật hồ sơ", "success");
    };

    const roleBg = user.role === "reviewer" ? "linear-gradient(135deg,#c69526,#9a7020)" : user.role === "author" ? "linear-gradient(135deg,#1a6fa3,#0e4f7a)" : user.role === "editor" ? "linear-gradient(135deg,#1d6b3a,#15522c)" : "linear-gradient(135deg,#c23d3f,#9e2d2f)";

    return (
        <div className="profile-wrap fade-in">
            {showAvatarModal && (
                <AvatarCropModal 
                    user={user} 
                    setUser={setUser} 
                    show={show} 
                    onClose={() => setShowAvatarModal(false)}
                />
            )}

            <div className="profile-header">
                <div className="avatar-upload-wrap" onClick={() => setShowAvatarModal(true)} title="Đổi ảnh đại diện">
                    <div className="profile-avatar-big" style={{ background: roleBg, width: 80, height: 80, cursor: "pointer" }}>
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block" }}/>
                        ) : (
                            <span style={{ fontSize: 28, fontWeight: 900 }}>{user.name.slice(0, 2).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="avatar-upload-overlay">
                        <span style={{ fontSize: 20 }}>📷</span>
                        <span>Đổi ảnh</span>
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    {editMode ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <input className="form-input" style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", maxWidth: 280 }} value={editName} onChange={e => setEditName(e.target.value)} placeholder="Tên hiển thị"/>
                            {user.role === "author" && (
                                <input className="form-input" style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", maxWidth: 280 }} value={editPen} onChange={e => setEditPen(e.target.value)} placeholder="Bút danh"/>
                            )}
                            <textarea className="form-textarea" style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", maxWidth: 400, minHeight: 60 }} value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Giới thiệu bản thân..."/>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button className="btn-nav" style={{ padding: "7px 16px", borderRadius: 8, background: "#fff", color: "#1c1512", fontSize: 13, fontWeight: 600 }} onClick={saveProfile}>Lưu</button>
                                <button className="btn-nav btn-ghost" style={{ padding: "7px 16px", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600 }} onClick={() => setEditMode(false)}>Hủy</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, marginBottom: 4 }}>{user.name}</div>
                            {user.penName && <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 4 }}>✒ Bút danh: {user.penName}</div>}
                            <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 12 }}>{user.email} · Tham gia {user.joinDate}</div>
                            {user.bio && <div style={{ fontSize: 14, opacity: 0.75, maxWidth: 500, lineHeight: 1.6, marginBottom: 12 }}>{user.bio}</div>}
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <span className={`role-chip ${user.role === "reviewer" ? "chip-reviewer" : user.role === "author" ? "chip-author" : user.role === "editor" ? "chip-editor" : "chip-reader"}`}>
                                    {user.role === "reviewer" ? "🛡 Reviewer" : user.role === "author" ? "✒ Tác giả" : user.role === "editor" ? "✏ Editor" : "👤 Độc giả"}
                                </span>
                                <button className="tab-btn" style={{ padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", borderColor: "rgba(255,255,255,0.3)", background: "transparent" }} onClick={() => setEditMode(true)}>
                                    <Ico.Edit /> Sửa hồ sơ
                                </button>
                            </div>
                        </>
                    )}
                </div>
                <div style={{ textAlign: "right" }}>
                    <div className="coin-badge" style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fcd34d", fontSize: 16, padding: "8px 16px" }}>🪙 {user.coins}</div>
                    <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>coin tích lũy</div>
                </div>
            </div>

            <div className="profile-stats-grid">
                <div className="profile-stat-card"><div className="profile-stat-num">{user.stats.reads.toLocaleString()}</div><div className="profile-stat-label">Lượt đọc</div></div>
                <div className="profile-stat-card"><div className="profile-stat-num">{user.stats.stories}</div><div className="profile-stat-label">Tác phẩm</div></div>
                <div className="profile-stat-card"><div className="profile-stat-num">{user.stats.reviews}</div><div className="profile-stat-label">Đánh giá</div></div>
                <div className="profile-stat-card"><div className="profile-stat-num">{user.stats.coins_earned}</div><div className="profile-stat-label">Coin đã kiếm</div></div>
            </div>

            <div className="profile-tabs">
                {[["info", "Thông tin"], ["stories", "Tác phẩm"], ["reviews", "Đánh giá"], ["coins", "Lịch sử coin"]].map(([k, l]) => (
                    <button key={k} className={`profile-tab${tab === k ? " active" : ""}`} onClick={() => setTab(k)}>{l}</button>
                ))}
            </div>

            {tab === "info" && (
                <div className="sidebar-card fade-in">
                    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: "1px solid #f5ede4", marginBottom: 4 }}>
                        <div className="avatar-upload-wrap" onClick={() => setShowAvatarModal(true)} title="Đổi ảnh đại diện" style={{ cursor: "pointer" }}>
                            <div style={{ width: 56, height: 56, borderRadius: "50%", background: roleBg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "2px solid #e8e0d6" }}>
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                                ) : (
                                    <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{user.name.slice(0, 2).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="avatar-upload-overlay" style={{ borderRadius: "50%" }}>
                                <span style={{ fontSize: 16 }}>📷</span>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#1c1512" }}>{user.name}</div>
                            <button onClick={() => setShowAvatarModal(true)} className="btn-nav btn-ghost" style={{ marginTop: 4, padding: "4px 12px", borderRadius: 8, color: "#c23d3f", fontSize: 12, fontWeight: 600 }}>
                                📷 {user.avatarUrl ? "Đổi ảnh đại diện" : "Thêm ảnh đại diện"}
                            </button>
                        </div>
                    </div>
                    {[
                        ["Vai trò", user.role === "reviewer" ? "Reviewer" : user.role === "author" ? "Tác giả" : user.role === "editor" ? "Editor" : "Độc giả"],
                        ["Email", user.email],
                        ["Tham gia", user.joinDate],
                        ["Coin hiện tại", `${user.coins} coin`],
                        ...(user.penName ? [["Bút danh", user.penName]] : [])
                    ].map(([k, v]) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f5ede4", fontSize: 14 }}>
                            <span style={{ color: "#9e8e82" }}>{k}</span><span style={{ fontWeight: 600, color: "#1c1512" }}>{v}</span>
                        </div>
                    ))}
                </div>
            )}

            {tab === "stories" && (
                <div className="fade-in">
                    {stories.length === 0 ? (
                        <div className="empty-state">Chưa có tác phẩm<p>Bắt đầu viết và đăng tác phẩm!</p></div>
                    ) : (
                        <div className="story-grid">
                            {stories.map((s) => <StoryCard key={s.id} story={s} onStory={() => navTo("story", s)} liked={likedStories.includes(s.id)} onLike={() => {}}/>)}
                        </div>
                    )}
                </div>
            )}

            {tab === "reviews" && (
                <div className="fade-in">
                    {reviews.length === 0 ? (
                        <div className="empty-state">Chưa viết đánh giá nào</div>
                    ) : (
                        reviews.map((r) => (
                            <div key={r.id} className="review-card">
                                <div style={{ fontSize: 12, color: "#9e8e82", marginBottom: 8 }}>⭐ {r.rating}/5 · {r.date}</div>
                                <p className="review-text">{r.content}</p>
                            </div>
                        ))
                    )}
                </div>
            )}

            {tab === "coins" && (
                <div className="fade-in coin-history">
                    {coinTxs.length === 0 ? (
                        <div className="empty-state">Chưa có lịch sử giao dịch</div>
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