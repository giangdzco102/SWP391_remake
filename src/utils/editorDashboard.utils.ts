export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d} ngày trước`;
  const h = Math.floor(diff / 3600000);
  if (h > 0) return `${h} giờ trước`;
  return `${Math.floor(diff / 60000)} phút trước`;
}

export function stripHtml(html: string): string {
  if (typeof document === "undefined") return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const d = document.createElement("div");
  d.innerHTML = html;
  return (d.textContent ?? d.innerText ?? "").trim();
}

export function toHtml(text: string): string {
  if (/<[a-z]/i.test(text)) return text;
  return text.split(/\n+/).filter(Boolean).map((p) => `<p>${p}</p>`).join("") || "<p><br></p>";
}
