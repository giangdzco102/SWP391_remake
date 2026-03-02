"use client";
import { useAuthStore } from "@/stores";

export function ProfilePage() {
  const { user } = useAuthStore();
  return (
    <div className="profile-wrap fade-in">
      <div className="profile-header">
        <div className="avatar-upload-wrap" title="Đổi ảnh đại diện">
          <div className="profile-avatar-big" style={{ width: 80, height: 80 }}>
            <span style={{ fontSize: 28, fontWeight: 900 }}>AV</span>
          </div>

          <div className="avatar-upload-overlay">
            <span style={{ fontSize: 20 }}>📷</span>
            <span>Đổi ảnh</span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 26,
              fontWeight: 900,
              marginBottom: 4,
            }}
          >
            {user?.fullName || "Người dùng"}
          </div>

          <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 12 }}>
            {user?.email}· Tham gia 01/01/2026
          </div>

          <div
            style={{
              fontSize: 14,
              opacity: 0.75,
              maxWidth: 500,
              lineHeight: 1.6,
              marginBottom: 12,
            }}
          >
            Giới thiệu bản thân...
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="role-chip chip-reader">👤 Độc giả</span>

            <button className="tab-btn">Sửa hồ sơ</button>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div className="coin-badge">🪙 0</div>
          <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>
            coin tích lũy
          </div>
        </div>
      </div>

      <div className="profile-stats-grid">
        <div className="profile-stat-card">
          <div className="profile-stat-num">0</div>
          <div className="profile-stat-label">Lượt đọc</div>
        </div>

        <div className="profile-stat-card">
          <div className="profile-stat-num">0</div>
          <div className="profile-stat-label">Tác phẩm</div>
        </div>

        <div className="profile-stat-card">
          <div className="profile-stat-num">0</div>
          <div className="profile-stat-label">Đánh giá</div>
        </div>

        <div className="profile-stat-card">
          <div className="profile-stat-num">0</div>
          <div className="profile-stat-label">Coin đã kiếm</div>
        </div>
      </div>

      <div className="profile-tabs">
        <button className="profile-tab active">Thông tin</button>
        <button className="profile-tab">Tác phẩm</button>
        <button className="profile-tab">Đánh giá</button>
        <button className="profile-tab">Lịch sử coin</button>
      </div>

      <div className="sidebar-card fade-in">
        <div style={{ padding: "16px 0" }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Tên người dùng</div>
        </div>

        <div className="profile-info-row">
          <span>Vai trò</span>
          <span>Độc giả</span>
        </div>

        <div className="profile-info-row">
          <span>Email</span>
          <span>email@example.com</span>
        </div>

        <div className="profile-info-row">
          <span>Tham gia</span>
          <span>01/01/2026</span>
        </div>

        <div className="profile-info-row">
          <span>Coin hiện tại</span>
          <span>0 coin</span>
        </div>
      </div>

      <div className="fade-in">
        <div className="empty-state">Nội dung sẽ hiển thị tại đây</div>
      </div>
    </div>
  );
}

export default ProfilePage;
