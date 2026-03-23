import React, { useEffect, useRef } from "react";
import { FONT_OPTIONS, LINE_HEIGHT_OPTIONS } from "@/utils/constants";

interface ReadingSettingsProps {
  fontSize: number;
  setFontSize: (v: number) => void;
  fontFamily: string;
  setFontFamily: (v: string) => void;
  lineHeight: number;
  setLineHeight: (v: number) => void;
  onClose: () => void;
}

const btnStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 8,
  border: "1.5px solid #e8e0d6",
  background: "#fdfaf7",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 700,
  color: "#3d2f28",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

export function ReadingSettingsPanel({
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  lineHeight,
  setLineHeight,
  onClose,
}: ReadingSettingsProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const sectionTitle = (text: string) => (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#b0a096",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: 10,
      }}
    >
      {text}
    </div>
  );

  return (
    <div
      ref={panelRef}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        zIndex: 200,
        background: "#fff",
        border: "1.5px solid #e8e0d6",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(60,30,20,0.13)",
        padding: "20px 20px 16px",
        minWidth: 280,
        fontFamily: "inherit",
      }}
    >
      {/* Arrow pointer */}
      <div
        style={{
          position: "absolute",
          top: -8,
          right: 20,
          width: 14,
          height: 14,
          background: "#fff",
          border: "1.5px solid #e8e0d6",
          borderBottom: "none",
          borderRight: "none",
          transform: "rotate(45deg)",
        }}
      />

      {/* ── Font size ── */}
      {sectionTitle("Cỡ chữ")}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <button
          onClick={() => setFontSize(Math.max(12, fontSize - 1))}
          style={btnStyle}
        >
          A−
        </button>

        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}
        >
          <input
            type="range"
            min={12}
            max={28}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#c23d3f", cursor: "pointer" }}
          />
          <div style={{ textAlign: "center", fontSize: 12, color: "#9e8e82" }}>
            {fontSize}px
          </div>
        </div>

        <button
          onClick={() => setFontSize(Math.min(28, fontSize + 1))}
          style={btnStyle}
        >
          A+
        </button>
      </div>

      {/* ── Font family ── */}
      {sectionTitle("Font chữ")}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 6,
          marginBottom: 20,
        }}
      >
        {FONT_OPTIONS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFontFamily(f.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border:
                fontFamily === f.value
                  ? "2px solid #c23d3f"
                  : "1.5px solid #e8e0d6",
              background: fontFamily === f.value ? "#fde8e8" : "#fdfaf7",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: f.value,
              color: fontFamily === f.value ? "#c23d3f" : "#3d2f28",
              fontWeight: fontFamily === f.value ? 700 : 400,
              transition: "all 0.15s",
              textAlign: "center",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Line height ── */}
      {sectionTitle("Khoảng cách dòng")}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 6,
        }}
      >
        {LINE_HEIGHT_OPTIONS.map((lh) => (
          <button
            key={lh.value}
            onClick={() => setLineHeight(lh.value)}
            style={{
              padding: "8px 4px",
              borderRadius: 8,
              border:
                lineHeight === lh.value
                  ? "2px solid #c23d3f"
                  : "1.5px solid #e8e0d6",
              background: lineHeight === lh.value ? "#fde8e8" : "#fdfaf7",
              cursor: "pointer",
              fontSize: 12,
              color: lineHeight === lh.value ? "#c23d3f" : "#3d2f28",
              fontWeight: lineHeight === lh.value ? 700 : 400,
              textAlign: "center",
              transition: "all 0.15s",
            }}
          >
            <div
              style={{
                fontSize: 16,
                marginBottom: 2,
                lineHeight: lh.value,
                letterSpacing: "-0.5px",
              }}
            >
              ≡
            </div>
            {lh.label}
          </button>
        ))}
      </div>
    </div>
  );
}
