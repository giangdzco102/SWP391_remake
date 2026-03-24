"use client";
import React, { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/stores";
import useStoryService from "@/api/useStory.service";
import useWalletService from "@/api/useWallet.service";
import { useToast } from "@/hooks/use-toast";
import { Ico } from "@/components/Icons";
import { useRouter } from "next/navigation";

// --- Components ---

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1.px solid #f5ede4" }}>
      <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "#9e8e82", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, color: "#1c1512", fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  );
}

const TX_TYPE_MAP: Record<string, { label: string; type: "earn" | "spend" }> = {
  DEPOSIT: { label: "Nạp coin", type: "earn" },
  PURCHASE: { label: "Mua chương", type: "spend" },
  GIFT: { label: "Tặng quà", type: "spend" },
  WITHDRAW: { label: "Rút tiền", type: "spend" },
  REFUND: { label: "Hoàn tiền", type: "earn" },
};

function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { getStoriesByAuthorId } = useStoryService();
  const { getTransactions } = useWalletService();
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("info");
  const [myStories, setMyStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [coinTxs, setCoinTxs] = useState([]);
  const [coinLoading, setCoinLoading] = useState(false);

  const quickAvatarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      router.push("/homePage");
      return;
    }
  }, [user, router]);

  const fetchStories = async () => {
    if (!user) return;
    setStoriesLoading(true);
    try {
      const res = await getStoriesByAuthorId(user.id);
      setMyStories(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch {
      toast.error("Không thể tải danh sách truyện");
    } finally {
      setStoriesLoading(false);
    }
  };

  const fetchTxs = async () => {
    setCoinLoading(true);
    try {
      const res = await getTransactions();
      setCoinTxs(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch {
      toast.error("Không thể tải lịch sử giao dịch");
    } finally {
      setCoinLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "stories") fetchStories();
    if (activeTab === "coins") fetchTxs();
  }, [activeTab]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/homePage");
  };

  const formatDate = (d?: string) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch { return d; }
  };

  const handleQuickAvatar = () => {
    toast.info("Tính năng đổi ảnh đại diện đang được bảo trì");
  };

  // Roles formatting
  const primaryRole = user?.roles?.[0] || "READER";
  const roleLabel = primaryRole === "AUTHOR" ? "Tác giả" : primaryRole === "REVIEWER" ? "Reviewer" : primaryRole === "EDITOR" ? "Editor" : primaryRole === "ADMIN" ? "Quản trị viên" : "Độc giả";
  const roleIcon = primaryRole === "AUTHOR" ? "✒" : primaryRole === "REVIEWER" ? "🛡" : primaryRole === "EDITOR" ? "✏" : primaryRole === "ADMIN" ? "👑" : "📖";
  const roleChipClass = primaryRole === "AUTHOR" ? "chip-role-author" : primaryRole === "REVIEWER" ? "chip-role-reviewer" : primaryRole === "EDITOR" ? "chip-role-editor" : primaryRole === "ADMIN" ? "chip-role-admin" : "chip-role-reader";

  const tabs = [
    { key: "info",    label: "Thông tin" },
    { key: "stories", label: "Tác phẩm" },
    { key: "reviews", label: "Đánh giá" },
    { key: "coins",   label: "Ví coin" },
  ];

  if (!user) return null;

  return (
    <div className="profile-container fade-in">
      {/* ── Header ── */}
      <div className="profile-hero-card">
        <div className="profile-avatar-wrap" onClick={() => quickAvatarRef.current?.click()}>
          <div className="profile-avatar">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">{user?.fullName?.charAt(0) || "U"}</div>
            )}
            <div className="avatar-edit-overlay">📷</div>
          </div>
          <input ref={quickAvatarRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleQuickAvatar} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, marginBottom: 4 }}>
            {user?.fullName || "Người dùng"}
          </div>
          <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 12 }}>
            {user?.email && <>{user.email} · </>}
            Tham gia {formatDate(user?.createdAt)}
          </div>
          <div style={{ fontSize: 14, opacity: 0.75, maxWidth: 500, lineHeight: 1.6, marginBottom: 14 }}>
            {user?.bio || "Giới thiệu bản thân..."}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span className={`role-chip ${roleChipClass}`}>{roleIcon} {roleLabel}</span>
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div className="coin-badge">🪙 {user?.walletBalance ?? 0}</div>
          <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>coin tích lũy</div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="profile-stats-grid">
        {[
          { num: user?.totalFollowedStories ?? 0, label: "Lượt đọc",   icon: "📖" },
          { num: 0,                               label: "Tác phẩm",   icon: "✍️"  },
          { num: 0,                               label: "Đánh giá",   icon: "⭐"  },
          { num: user?.walletBalance ?? 0,        label: "Coin đã kiếm", icon: "🪙" },
        ].map(({ num, label, icon }) => (
          <div className="profile-stat-card" key={label}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
            <div className="profile-stat-num">{num}</div>
            <div className="profile-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="profile-tabs">
        {tabs.map((t) => (
          <button key={t.key} className={`profile-tab${activeTab === t.key ? " active" : ""}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Thông tin ── */}
      {activeTab === "info" && (
        <div className="fade-in" style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #ece6dc", padding: "8px 24px 4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 0 12px", borderBottom: "2px solid #f5ede4", marginBottom: 4 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#c23d3f,#9e2d2f)", display: "center", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: "#1c1512" }}>{user?.fullName || "—"}</div>
              <div style={{ fontSize: 12, color: "#9e8e82" }}>Thông tin cá nhân</div>
            </div>
            <span className={`role-chip ${roleChipClass}`} style={{ marginLeft: "auto", fontSize: 12 }}>{roleIcon} {roleLabel}</span>
          </div>
          <InfoRow icon="📧" label="Email"         value={user?.email || "—"} />
          <InfoRow icon="📱" label="Số điện thoại" value={user?.phone || "—"} />
          <InfoRow icon="⚧"  label="Giới tính"     value={user?.gender === "MALE" ? "Nam" : user?.gender === "FEMALE" ? "Nữ" : "—"} />
          <InfoRow icon="🎂" label="Ngày sinh"      value={formatDate(user?.dateOfBirth)} />
          <InfoRow icon="📍" label="Địa chỉ"        value={user?.location || "—"} />
          <InfoRow icon="📅" label="Tham gia"       value={formatDate(user?.createdAt)} />
        </div>
      )}

      {activeTab === "stories" && (
        <div className="fade-in">
          {storiesLoading ? <div className="empty-state">⏳ Đang tải tác phẩm...</div> : myStories.length === 0 ? <div className="empty-state">Chưa có tác phẩm nào</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {myStories.map((s: any) => (
                <div key={s.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #ece6dc", padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                  {s.coverUrl && !s.coverUrl.includes("placeholder") ? <img src={s.coverUrl} alt={s.title} style={{ width: 48, height: 68, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} /> : <div style={{ width: 48, height: 68, borderRadius: 8, background: "linear-gradient(135deg,#f093fb,#f5576c)", flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#1c1512", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: "#9e8e82" }}>{s.categories?.[0]?.name ?? ""} · {s.publishedChapterCount ?? s.totalChapterCount ?? 0} chương</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "reviews" && <div className="fade-in"><div className="empty-state">Chưa có đánh giá nào</div></div>}

      {activeTab === "coins" && (
        <div className="fade-in">
          {coinLoading ? <div className="empty-state">⏳ Đang tải lịch sử coin...</div> : coinTxs.length === 0 ? <div className="empty-state">Chưa có lịch sử coin</div> : (
            <div className="coin-history">
              {coinTxs.map((tx: any, i: number) => {
                const mapped = TX_TYPE_MAP[tx.type] ?? { label: tx.type ?? "Giao dịch", type: "earn" as const };
                return (
                  <div key={tx.id ?? i} className="coin-tx">
                    <div className="coin-tx-info">
                      <div className={`coin-tx-icon ${mapped.type === "earn" ? "coin-tx-earn" : "coin-tx-spend"}`}>{mapped.type === "earn" ? "🪙" : "💸"}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#1c1512" }}>{tx.description ?? mapped.label}</div>
                        <div style={{ fontSize: 12, color: "#9e8e82" }}>{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("vi-VN") : ""}</div>
                      </div>
                    </div>
                    <div className={`coin-tx-amount ${mapped.type === "earn" ? "coin-earn-color" : "coin-spend-color"}`}>{mapped.type === "earn" ? "+" : "-"}{tx.amount}🪙</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      <div style={{ marginTop: 24, textAlign: "center" }}>
        <button className="btn-logout" onClick={handleLogout}><Ico.LogOut /> Đăng xuất</button>
      </div>
    </div>
  );
}

export default ProfilePage;
