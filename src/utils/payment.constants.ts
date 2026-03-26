/** Inline styles dùng chung cho trang payment (cancel / success). */

export const PAYMENT_PAGE_WRAPPER_STYLE: React.CSSProperties = {
  minHeight: "80vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "32px 16px",
};

export const PAYMENT_CARD_BASE_STYLE: React.CSSProperties = {
  background: "#fdfaf7",
  borderRadius: 20,
  padding: "40px 36px",
  maxWidth: 480,
  width: "100%",
  textAlign: "center",
  boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
};

/** Border màu theo trạng thái */
export const PAYMENT_BORDER = {
  cancel: "2px solid #fca5a5",
  paid: "2px solid #d1fae5",
  pending: "2px solid #fcd34d",
} as const;

export const PAYMENT_FALLBACK_ORDER_CODE = "—";
