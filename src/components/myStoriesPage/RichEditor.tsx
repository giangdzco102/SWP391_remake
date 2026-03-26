import React, { useEffect, useRef } from "react";
import { T } from "@/utils/myStoriesPage.constants";
import { toHtml } from "@/utils/myStoriesPage.utils";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export function RichEditor({ value, onChange }: RichEditorProps) {
  const ref = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = toHtml(value);
  }, []);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    ref.current?.focus();
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const tb = (
    lbl: string,
    cmd: string,
    title: string,
    val?: string,
    extra?: React.CSSProperties
  ) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        exec(cmd, val);
      }}
      style={{
        minWidth: 28,
        padding: "4px 8px",
        borderRadius: 6,
        border: `1px solid ${T.border}`,
        background: T.card,
        cursor: "pointer",
        fontSize: 12,
        color: T.text,
        fontFamily: T.font,
        ...extra,
      }}
    >
      {lbl}
    </button>
  );

  const sep = (
    <div
      style={{
        width: 1,
        alignSelf: "stretch",
        background: T.border,
        margin: "0 2px",
      }}
    />
  );

  return (
    <div
      style={{
        border: `1.5px solid ${T.border}`,
        borderRadius: T.radius,
        overflow: "hidden",
        background: T.card,
        boxShadow: "inset 0 1px 4px rgba(0,0,0,0.03)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          padding: "8px 10px",
          background: T.grayBg,
          borderBottom: `1px solid ${T.border}`,
          alignItems: "center",
        }}
      >
        {tb("B", "bold", "In đậm", undefined, { fontWeight: 800 })}
        {tb("I", "italic", "In nghiêng", undefined, { fontStyle: "italic" })}
        {tb("U", "underline", "Gạch chân", undefined, { textDecoration: "underline" })}
        {sep}
        {tb("H1", "formatBlock", "Heading 1", "h1", { fontWeight: 800 })}
        {tb("H2", "formatBlock", "Heading 2", "h2", { fontWeight: 700 })}
        {tb("¶", "formatBlock", "Paragraph", "p")}
        {sep}
        {tb("❝", "formatBlock", "Quote", "blockquote")}
        {tb("•", "insertUnorderedList", "Danh sách")}
        {tb("1.", "insertOrderedList", "Đánh số")}
        {sep}
        {tb("↺", "undo", "Undo")}
        {tb("↻", "redo", "Redo")}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => {
          if (ref.current) onChange(ref.current.innerHTML);
        }}
        style={{
          minHeight: 280,
          maxHeight: 500,
          overflowY: "auto",
          padding: "16px 20px",
          fontSize: 15,
          color: T.text,
          fontFamily: "'Lora', Georgia, serif",
          lineHeight: 1.85,
          outline: "none",
        }}
      />
    </div>
  );
}
