import React from "react";

export function Highlight({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword.trim()) return <>{text}</>;
  const safe = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${safe})`, "gi");
  return (
    <>
      {text.split(regex).map((part, i) =>
        regex.test(part)
          ? <mark key={i} style={{ background: "#fef3c7", color: "#92400e", borderRadius: 3, padding: "0 2px", fontWeight: 700 }}>{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}
