"use client";

export function Footer() {
  return (
    // footer phải nằm NGOÀI container của layout để tự căn giữa đúng
    <footer style={{ background: "#fdf7f0", borderTop: "1px solid #ece6dc", marginTop: 48, width: "100%" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 32px 24px" }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }}>

          {/* Cột trái — mô tả */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span>📖</span>
              <span style={{ color: "#1c1512", fontWeight: 800, fontSize: 15 }}>TruyệnHay</span>
            </div>
            <p style={{ fontSize: 13, color: "#9e8e82", lineHeight: 1.8, margin: 0 }}>
              Nền tảng đọc truyện online miễn phí với kho tàng phong phú thuộc
              nhiều thể loại. Cập nhật liên tục, không quảng cáo, đọc mọi lúc mọi nơi.
            </p>
          </div>

          {/* Cột phải — liên hệ */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, color: "#1c1512", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
              Liên hệ & Hỗ trợ
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              <li style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#9e8e82" }}>
                <span>📧</span> giangxauzai0303@gmail.com
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#9e8e82" }}>
                <span>📋</span> Điều khoản & Bảo mật
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div style={{ borderTop: "1px solid #ece6dc", marginTop: 32, paddingTop: 16, textAlign: "center" }}>
          <span style={{ fontSize: 12, color: "#c8b8ae" }}>
            © {new Date().getFullYear()} TruyệnHay. All rights reserved.
          </span>
        </div>

      </div>
    </footer>
  );
}

export default Footer;