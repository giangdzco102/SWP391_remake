"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useAuthStore } from "@/stores";
import useAuthService from "@/api/useAuth.service";
import useStoryService from "@/api/useStory.service";
import useWalletService from "@/api/useWallet.service";
import useWithdrawService from "@/api/useWithdraw.service";
import { WithdrawResponse } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";

import { InfoRow } from "@/components/profilePage/InfoRow";
import { ChangePasswordModal } from "@/components/profilePage/ChangePasswordModal";
import { WithdrawModal } from "@/components/profilePage/WithdrawModal";
import { EditProfileModal } from "@/components/profilePage/EditProfileModal";

import { TabKey } from "@/types/profilePage";
import {
  ROLE_LABEL,
  ROLE_CHIP_CLASS,
  ROLE_ICON,
  COIN_PER_PAGE,
  TX_TYPE_MAP,
  PROFILE_TABS,
} from "@/utils/profilePage.constants";
import { formatDate } from "@/utils/profilePage.utils";

export function ProfilePage() {
  const { user } = useAuthStore();
  const { uploadAvatar, updateProfile } = useAuthService();
  const { getMyStories } = useStoryService();
  const { getTransactions } = useWalletService();
  const { getMyWithdrawRequests } = useWithdrawService();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const [showEdit, setShowEdit] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const quickAvatarRef = useRef<HTMLInputElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [myStories, setMyStories] = useState<any[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [coinTxs, setCoinTxs] = useState<any[]>([]);
  const [coinLoading, setCoinLoading] = useState(false);
  const [coinPage, setCoinPage] = useState(1);
  const [coinFilter, setCoinFilter] = useState<string>("ALL");
  const [withdrawReqs, setWithdrawReqs] = useState<WithdrawResponse[]>([]);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const coinTypes = Array.from(new Set(coinTxs.map((tx) => tx.type).filter(Boolean)));

  const filteredCoinTxs = coinFilter === "ALL"
    ? coinTxs
    : coinTxs.filter((tx) => tx.type === coinFilter);

  const coinTotalPages = Math.ceil(filteredCoinTxs.length / COIN_PER_PAGE);
  const pagedCoinTxs = filteredCoinTxs.slice((coinPage - 1) * COIN_PER_PAGE, coinPage * COIN_PER_PAGE);

  const fetchWithdraws = useCallback(() => {
    setWithdrawLoading(true);
    getMyWithdrawRequests()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((res: any) => setWithdrawReqs(res?.data ?? res ?? []))
      .catch(() => {})
      .finally(() => setWithdrawLoading(false));
  }, [getMyWithdrawRequests]);

  useEffect(() => {
    if (!user || activeTab !== "withdraw") return;
    fetchWithdraws();
  }, [activeTab, user, fetchWithdraws]);

  useEffect(() => {
    if (!user || activeTab !== "coins") return;
    setCoinLoading(true);
    getTransactions()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((res: any) => {
        const list: any[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setCoinTxs(list);
      })
      .catch(() => {})
      .finally(() => setCoinLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user]);

  const primaryRole   = user?.roles?.[0] ?? "READER";
  const roleLabel     = ROLE_LABEL[primaryRole]     ?? "Độc giả";
  const roleChipClass = ROLE_CHIP_CLASS[primaryRole] ?? "chip-role-reader";
  const roleIcon      = ROLE_ICON[primaryRole]      ?? "👤";

  const avatarInitials = user?.fullName
    ? user.fullName.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase()
    : "AV";

  const handleQuickAvatar = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Vui lòng chọn file ảnh!"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Ảnh quá lớn! Tối đa 5MB."); return; }
    setAvatarUploading(true);
    try {
      const avatarUrl = await uploadAvatar!(file);
      await updateProfile!({ avatarUrl });
      toast.success("✅ Cập nhật ảnh đại diện thành công!");
    } catch (err: any) {
      toast.error(err?.message || "Cập nhật ảnh thất bại");
    } finally {
      setAvatarUploading(false);
    }
  }, [uploadAvatar, updateProfile, toast]);

  return (
    <div className="profile-wrap fade-in">
      {showEdit && <EditProfileModal onClose={() => setShowEdit(false)} />}
      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}

      {/* ── Header card ── */}
      <div className="profile-header">
        <div
          className="avatar-upload-wrap"
          title="Đổi ảnh đại diện"
          onClick={() => !avatarUploading && quickAvatarRef.current?.click()}
          style={{ cursor: avatarUploading ? "wait" : "pointer" }}
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="avatar"
              className="profile-avatar-big"
              style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "50%", opacity: avatarUploading ? 0.5 : 1 }}
            />
          ) : (
            <div className="profile-avatar-big" style={{ width: 80, height: 80, opacity: avatarUploading ? 0.5 : 1 }}>
              <span style={{ fontSize: 28, fontWeight: 900 }}>{avatarInitials}</span>
            </div>
          )}
          <div className="avatar-upload-overlay">
            <span style={{ fontSize: 20 }}>{avatarUploading ? "⏳" : "📷"}</span>
            <span>{avatarUploading ? "Đang tải..." : "Đổi ảnh"}</span>
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
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#fdf7f0", padding: "4px 12px", borderRadius: "10px", border: "1.5px solid #ece6dc",
            }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#2563eb" }}>LV.{user?.level ?? 1}</span>
              <div style={{ width: 100, height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  width: `${Math.min(100, ((user?.experience ?? 0) / ((user?.level ?? 1) * ((user?.level ?? 1) + 1) * 50)) * 100)}%`,
                  height: "100%", background: "linear-gradient(90deg, #3b82f6, #2563eb)", borderRadius: 3,
                }} />
              </div>
              <span style={{ fontSize: 11, color: "#9e8e82", fontWeight: 500 }}>
                {user?.experience ?? 0} / {(user?.level ?? 1) * ((user?.level ?? 1) + 1) * 50} EXP
              </span>
            </div>
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
        {PROFILE_TABS.map((t) => (
          <button
            key={t.key}
            className={`profile-tab${activeTab === t.key ? " active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Thông tin ── */}
      {activeTab === "info" && (
        <div className="fade-in" style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #ece6dc", padding: "8px 24px 4px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "16px 0 12px", borderBottom: "2px solid #f5ede4", marginBottom: 4,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg,#c23d3f,#9e2d2f)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            }}>👤</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: "#1c1512" }}>
                {user?.fullName || "—"}
              </div>
              <div style={{ fontSize: 12, color: "#9e8e82" }}>Thông tin cá nhân</div>
            </div>
            <span className={`role-chip ${roleChipClass}`} style={{ marginLeft: "auto", fontSize: 12 }}>
              {roleIcon} {roleLabel}
            </span>
          </div>

          <InfoRow icon="📧" label="Email"         value={user?.email                 || "—"} />
          <InfoRow icon="📱" label="Số điện thoại" value={user?.phone                 || "—"} />
          <InfoRow icon="⚧"  label="Giới tính"     value={user?.gender === "MALE" ? "Nam" : user?.gender === "FEMALE" ? "Nữ" : "—"} />
          <InfoRow icon="🎂" label="Ngày sinh"      value={formatDate(user?.dateOfBirth)} />
          <InfoRow icon="📍" label="Địa chỉ"        value={user?.location              || "—"} />
          <InfoRow icon="📅" label="Tham gia"       value={formatDate(user?.createdAt)} />

          <div style={{
            display: "flex", alignItems: "center", gap: 12, margin: "12px 0",
            padding: "14px 16px", background: "linear-gradient(135deg,#fffbeb,#fef3c7)",
            borderRadius: 12, border: "1.5px solid #fcd34d",
          }}>
            <span style={{ fontSize: 24 }}>🪙</span>
            <div>
              <div style={{ fontSize: 11, color: "#92400e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Coin hiện tại
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#92400e", fontFamily: "'Playfair Display',serif" }}>
                {user?.walletBalance ?? 0} <span style={{ fontSize: 13, fontWeight: 500 }}>coin</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "stories" && (
        <div className="fade-in">
          {storiesLoading ? (
            <div className="empty-state">⏳ Đang tải tác phẩm...</div>
          ) : myStories.length === 0 ? (
            <div className="empty-state">Chưa có tác phẩm nào</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {myStories.map((s: any) => (
                <div key={s.id} style={{
                  background: "#fff", borderRadius: 14, border: "1.5px solid #ece6dc",
                  padding: "14px 18px", display: "flex", alignItems: "center", gap: 14,
                }}>
                  {s.coverUrl && !s.coverUrl.includes("placeholder") ? (
                    <img src={s.coverUrl} alt={s.title} style={{ width: 48, height: 68, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 48, height: 68, borderRadius: 8, background: "linear-gradient(135deg,#f093fb,#f5576c)", flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#1c1512", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: "#9e8e82" }}>
                      {s.categories?.[0]?.name ?? ""} · {s.publishedChapterCount ?? s.totalChapterCount ?? 0} chương
                    </div>
                    <div style={{ fontSize: 11, marginTop: 4 }}>
                      <span style={{
                        padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700,
                        background: s.status === "PUBLISHED" ? "#dcfce7" : s.status === "PENDING_REVIEW" ? "#fef3c7" : "#f5f5f5",
                        color: s.status === "PUBLISHED" ? "#166534" : s.status === "PENDING_REVIEW" ? "#92400e" : "#6b5a4e",
                      }}>
                        {s.status === "PUBLISHED" ? "Đã xuất bản" : s.status === "PENDING_REVIEW" ? "Chờ duyệt" : s.status === "DRAFT" ? "Nháp" : s.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="fade-in">
          <div className="empty-state">Chưa có đánh giá nào</div>
        </div>
      )}

      {/* ── Tab: Lịch sử coin ── */}
      {activeTab === "coins" && (
        <div className="fade-in max-w-[680px] mx-auto">
          {/* Filter bar */}
          {!coinLoading && coinTxs.length > 0 && (
            <div style={{ overflow: "hidden", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "nowrap", overflowX: "auto", paddingBottom: 4 }}>
                {[
                  { type: "ALL", label: "Tất cả", count: coinTxs.length },
                  ...coinTypes.map((type) => ({
                    type,
                    label: (TX_TYPE_MAP[type] ?? { label: type }).label,
                    count: coinTxs.filter((tx) => tx.type === type).length,
                  })),
                ].map(({ type, label, count }) => {
                  const isActive = coinFilter === type;
                  return (
                    <button
                      key={type}
                      className={`profile-tab${isActive ? " active" : ""}`}
                      onClick={() => { setCoinFilter(type); setCoinPage(1); }}
                      style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0 }}
                    >
                      {label}
                      <span style={{
                        padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 700,
                        background: isActive ? "rgba(255,255,255,0.25)" : "#f0ece4",
                        color: isActive ? "#fff" : "#9e8e82",
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {coinLoading ? (
            <div className="empty-state">⏳ Đang tải lịch sử coin...</div>
          ) : coinTxs.length === 0 ? (
            <div className="empty-state">Chưa có lịch sử coin</div>
          ) : filteredCoinTxs.length === 0 ? (
            <div className="empty-state">Không có giao dịch nào trong mục này.</div>
          ) : (
            <>
              <div className="coin-history">
                {pagedCoinTxs.map((tx: any, i: number) => {
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
                            {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("vi-VN") : ""}
                          </div>
                        </div>
                      </div>
                      <div className={`coin-tx-amount ${mapped.type === "earn" ? "coin-earn-color" : "coin-spend-color"}`}>
                        {mapped.type === "earn" ? "+" : "-"}{tx.amount}🪙
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Phân trang */}
              {coinTotalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 20, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setCoinPage((p) => Math.max(1, p - 1))}
                    disabled={coinPage === 1}
                    className="profile-tab"
                    style={{ padding: "6px 14px", opacity: coinPage === 1 ? 0.4 : 1 }}
                  >‹</button>

                  {Array.from({ length: coinTotalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === coinTotalPages || Math.abs(p - coinPage) <= 1)
                    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p === "..." ? (
                        <span key={`e-${idx}`} style={{ fontSize: 13, color: "#9e8e82", padding: "0 2px" }}>…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCoinPage(p as number)}
                          className={`profile-tab${coinPage === p ? " active" : ""}`}
                          style={{ padding: "6px 12px", minWidth: 36 }}
                        >{p}</button>
                      )
                    )}

                  <button
                    onClick={() => setCoinPage((p) => Math.min(coinTotalPages, p + 1))}
                    disabled={coinPage === coinTotalPages}
                    className="profile-tab"
                    style={{ padding: "6px 14px", opacity: coinPage === coinTotalPages ? 0.4 : 1 }}
                  >›</button>

                  <span style={{ fontSize: 12, color: "#9e8e82", marginLeft: 4 }}>
                    {(coinPage - 1) * COIN_PER_PAGE + 1}–{Math.min(coinPage * COIN_PER_PAGE, filteredCoinTxs.length)} / {filteredCoinTxs.length}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Tab: Rút tiền ── */}
      {activeTab === "withdraw" && (
        <div className="fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1c1512" }}>Yêu cầu rút tiền</div>
            <button
              onClick={() => setShowWithdraw(true)}
              style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "#c23d3f", color: "#fff", fontWeight: 700, cursor: "pointer" }}
            >
              + Tạo yêu cầu mới
            </button>
          </div>

          {withdrawLoading ? (
            <div className="empty-state">⏳ Đang tải...</div>
          ) : withdrawReqs.length === 0 ? (
            <div className="empty-state">Chưa có yêu cầu rút tiền nào</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {withdrawReqs.map((req) => (
                <div key={req.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #ece6dc", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#1c1512" }}>-{req.amount} coin</div>
                    <div style={{ fontSize: 12, color: "#9e8e82" }}>Yêu cầu rút tiền</div>
                    <div style={{ fontSize: 11, color: "#bfad9e", marginTop: 2 }}>{new Date(req.createdAt).toLocaleString("vi-VN")}</div>
                  </div>
                  <div style={{
                    padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: req.status === "APPROVED" ? "#dcfce7" : req.status === "REJECTED" ? "#fde8e8" : "#fef3c7",
                    color: req.status === "APPROVED" ? "#166534" : req.status === "REJECTED" ? "#c23d3f" : "#92400e",
                  }}>
                    {req.status === "PENDING" ? "Đang chờ" : req.status === "APPROVED" ? "Đã duyệt" : "Bị từ chối"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showWithdraw && <WithdrawModal onClose={() => setShowWithdraw(false)} onSuccess={fetchWithdraws} />}
    </div>
  );
}

export default ProfilePage;