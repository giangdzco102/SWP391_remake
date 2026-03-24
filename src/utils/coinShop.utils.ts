export function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export function formatCoin(n: number) {
  return n.toLocaleString("vi-VN");
}

export function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
