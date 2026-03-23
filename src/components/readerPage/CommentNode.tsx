import React, { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { ReaderCommentItem as CommentItem } from "@/types/story";
import { timeAgo, getAvatarColor } from "@/utils/utils";

export function CommentNode({
  comment,
  depth = 0,
  currentUserId,
  isLoggedIn,
  onSubmitReply,
  onDelete,
  onReport,
  onRequireAuth,
}: {
  comment: CommentItem;
  depth?: number;
  currentUserId?: number;
  isLoggedIn: boolean;
  onSubmitReply: (parentId: number, content: string) => Promise<void>;
  onDelete: (id: number) => void;
  onReport: (id: number) => void;
  onRequireAuth: () => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);
  const nodeToast = useToast();

  const name =
    comment.userName ||
    comment.user?.fullName ||
    comment.user?.name ||
    "Người dùng";
  const initials = name
    .split(" ")
    .slice(-2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();
  const color = getAvatarColor(name);
  const isOwn =
    currentUserId != null &&
    (comment.userId === currentUserId || comment.user?.id === currentUserId);

  const openReply = () => {
    if (!isLoggedIn) {
      onRequireAuth();
      return;
    }
    setReplyOpen(true);
    setReplyText(`@${name} `);
    setTimeout(() => {
      replyInputRef.current?.focus();
      replyInputRef.current?.setSelectionRange(999, 999);
    }, 50);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    try {
      await onSubmitReply(comment.id, replyText.trim());
      setReplyText("");
      setReplyOpen(false);
      setShowReplies(true);
    } catch {
      nodeToast.error("Không thể gửi trả lời. Thử lại sau.");
    } finally {
      setReplySubmitting(false);
    }
  };

  return (
    <div style={{ marginBottom: depth > 0 ? 8 : 12 }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "12px 16px",
          background: "#fdfaf7",
          borderRadius: 12,
          border: "1px solid #ede6dd",
          ...(depth > 0
            ? { borderLeft: "3px solid #e8a0a1", borderRadius: "0 12px 12px 0" }
            : {}),
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 13, color: "#1c1512" }}>
              {name}
            </span>
            <span style={{ fontSize: 11, color: "#b0a096" }}>
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Content */}
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: "#3d2f28",
              lineHeight: 1.65,
              wordBreak: "break-word",
            }}
          >
            {comment.content}
          </p>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 8,
            }}
          >
            <button
              onClick={openReply}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                color: "#c23d3f",
                fontWeight: 600,
                padding: 0,
              }}
            >
              ↩ Trả lời
            </button>
            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#c23d3f",
                  fontWeight: 600,
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {showReplies ? (
                  `▲ Ẩn ${comment.replies.length} phản hồi`
                ) : (
                  <>
                    <span
                      style={{
                        background: "#fde8e8",
                        color: "#c23d3f",
                        borderRadius: 20,
                        padding: "1px 8px",
                        fontWeight: 700,
                        fontSize: 11,
                      }}
                    >
                      {comment.replies.length}
                    </span>
                    &nbsp;phản hồi ▼
                  </>
                )}
              </button>
            )}

            {/* Three-dot menu */}
            <div style={{ position: "relative", marginLeft: "auto" }}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 18,
                  color: "#b0a096",
                  padding: "0 4px",
                  lineHeight: 1,
                }}
              >
                ···
              </button>
              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 4px)",
                    background: "#fff",
                    border: "1px solid #e8e0d6",
                    borderRadius: 10,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                    zIndex: 50,
                    minWidth: 120,
                    overflow: "hidden",
                  }}
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onReport(comment.id);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "10px 16px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      color: "#6b5a4e",
                      textAlign: "left",
                      fontFamily: "inherit",
                    }}
                  >
                    🚩 Báo cáo
                  </button>
                  {isOwn && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(comment.id);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 16px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 13,
                        color: "#dc2626",
                        textAlign: "left",
                        fontFamily: "inherit",
                      }}
                    >
                      🗑 Xóa
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inline reply input */}
      {replyOpen && (
        <div style={{ marginLeft: 44, marginTop: 6, marginBottom: 6 }}>
          <div style={{ fontSize: 11, color: "#b0a096", marginBottom: 4 }}>
            Trả lời <strong style={{ color: "#6b5a4e" }}>{name}</strong>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-end",
              background: "#fdfaf7",
              border: "1.5px solid #e8e0d6",
              borderRadius: 12,
              padding: "8px 12px",
            }}
          >
            <textarea
              ref={replyInputRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                  handleSubmitReply();
              }}
              rows={2}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                resize: "none",
                fontSize: 13,
                color: "#3d2f28",
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <button
                onClick={handleSubmitReply}
                disabled={!replyText.trim() || replySubmitting}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "none",
                  background:
                    !replyText.trim() || replySubmitting ? "#f3f4f6" : "#c23d3f",
                  color:
                    !replyText.trim() || replySubmitting ? "#9ca3af" : "#fff",
                  fontSize: 14,
                  cursor:
                    !replyText.trim() || replySubmitting
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ➤
              </button>
              <button
                onClick={() => setReplyOpen(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "1px solid #e8e0d6",
                  background: "#fff",
                  color: "#9ca3af",
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div
          style={{
            marginLeft: 24,
            marginTop: 6,
            borderLeft: "2px solid #f5d0d0",
            paddingLeft: 8,
          }}
        >
          {comment.replies.map((r) => (
            <CommentNode
              key={r.id}
              comment={r}
              depth={depth + 1}
              currentUserId={currentUserId}
              isLoggedIn={isLoggedIn}
              onSubmitReply={onSubmitReply}
              onDelete={onDelete}
              onReport={onReport}
              onRequireAuth={onRequireAuth}
            />
          ))}
        </div>
      )}
    </div>
  );
}
