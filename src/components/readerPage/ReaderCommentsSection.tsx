import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import useCommentService from "@/api/useComment.service";
import useGiftService from "@/api/useGift.service";
import { useToast } from "@/hooks/use-toast";
import { ReaderCommentItem as CommentItem } from "@/types/story";
import { CommentNode } from "@/components/readerPage/CommentNode";

interface Props {
  chapterId: number;
  storyId: number;
  storyTitle: string;
  storyAuthorId: number | null;
  onOpenReport: (targetType: string, targetId: number, label: string) => void;
}

export function ReaderCommentsSection({
  chapterId,
  storyId,
  storyTitle,
  storyAuthorId,
  onOpenReport,
}: Props) {
  const router = useRouter();
  const { user, updateBalance } = useAuthStore();
  const commentService = useCommentService();
  const commentServiceRef = useRef(commentService);
  commentServiceRef.current = commentService;
  const { sendGift } = useGiftService();
  const toast = useToast();

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [giftAmount, setGiftAmount] = useState<number | null>(null);
  const [showGiftOptions, setShowGiftOptions] = useState(false);

  // Load comments
  const loadComments = useCallback(async (id: number) => {
    try {
      const res: any = await commentServiceRef.current.getCommentsByChapter(id, { page: 0, size: 100 });
      const data: CommentItem[] = (res?.data?.content ?? res?.data ?? res?.content ?? res) as CommentItem[];
      if (Array.isArray(data)) setComments(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadComments(chapterId);
  }, [chapterId, loadComments]);

  // Post new root comment
  const handlePostComment = async () => {
    if (!user) {
      router.push("?login");
      return;
    }
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      // 1. Send gift if selected
      if (giftAmount && giftAmount > 0) {
        try {
          await sendGift(storyId, giftAmount);
          updateBalance(giftAmount);
        } catch (err: any) {
          toast.error(err?.response?.data?.message ?? "Không đủ xu để tặng quà.");
          setSubmitting(false);
          return;
        }
      }

      // 2. Post comment
      let content = commentText.trim();
      if (giftAmount && giftAmount > 0) {
        content += `\n\n[DONATE:${giftAmount}]`;
      }

      await commentServiceRef.current.createComment({
        chapterId,
        content,
      });

      setCommentText("");
      setGiftAmount(null);
      setShowGiftOptions(false);
      await loadComments(chapterId);
      toast.success(giftAmount ? "Đã tặng quà và đăng bình luận!" : "Đã đăng bình luận!");
    } catch {
      toast.error("Không thể đăng bình luận. Thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  // Post reply (passed down to CommentNode) — throws on error so CommentNode can handle
  const handleSubmitReply = async (parentId: number, content: string) => {
    await commentServiceRef.current.createComment({
      chapterId: chapterId,
      content,
      parentId,
    });
    await loadComments(chapterId);
  };

  // Delete own comment
  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("Xóa bình luận này?")) return;
    try {
      await commentServiceRef.current.deleteComment(commentId);
      await loadComments(chapterId);
      toast.success("Đã xóa bình luận.");
    } catch {
      toast.error("Không thể xóa bình luận.");
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: "48px auto 80px", padding: "0 16px" }}>
      {/* Section header + report chapter button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 20,
            fontWeight: 700,
            color: "#1c1512",
          }}
        >
          💬 Bình luận ({comments.length})
        </div>
        <button
          onClick={() => onOpenReport("CHAPTER", chapterId, storyTitle)}
          style={{
            fontSize: 12,
            color: "#9ca3af",
            background: "none",
            border: "1px solid #e8e0d6",
            borderRadius: 8,
            padding: "5px 12px",
            cursor: "pointer",
          }}
        >
          🚩 Báo cáo chương
        </button>
      </div>

      {/* Comment input — root comments only */}
      <div
        style={{
          background: "#fdfaf7",
          border: "1.5px solid #e8e0d6",
          borderRadius: 14,
          padding: "14px 16px",
          marginBottom: 24,
        }}
      >
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
              handlePostComment();
          }}
          placeholder={
            user
              ? "Viết bình luận của bạn... (Ctrl+Enter để gửi)"
              : "Đăng nhập để bình luận"
          }
          disabled={!user}
          rows={3}
          style={{
            width: "100%",
            border: "none",
            background: "transparent",
            resize: "none",
            fontSize: 14,
            color: "#3d2f28",
            fontFamily: "inherit",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 12,
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {user && (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowGiftOptions(!showGiftOptions)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    color: giftAmount ? "#c69526" : "#9e8e82",
                    background: giftAmount ? "#fef9ee" : "none",
                    border: giftAmount ? "1px solid #fcd34d" : "1px solid #e8e0d6",
                    borderRadius: 20,
                    padding: "5px 12px",
                    cursor: "pointer",
                    fontWeight: 600,
                    transition: "all 0.15s",
                  }}
                >
                  <span>🎁</span>
                  <span>{giftAmount ? `${giftAmount} xu` : "Tặng quà"}</span>
                </button>

                {showGiftOptions && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "100%",
                      left: 0,
                      marginBottom: 10,
                      background: "#fff",
                      border: "1.5px solid #e8e0d6",
                      borderRadius: 12,
                      padding: "12px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      zIndex: 100,
                      width: 240,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1c1512", marginBottom: 8 }}>Chọn mức tặng:</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                      {[10, 50, 100, 200, 500].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => {
                            setGiftAmount(amt);
                            setShowGiftOptions(false);
                          }}
                          style={{
                            fontSize: 11,
                            padding: "4px 10px",
                            borderRadius: 15,
                            border: giftAmount === amt ? "1.5px solid #c69526" : "1.5px solid #e8e0d6",
                            background: giftAmount === amt ? "#fef9ee" : "#fff",
                            color: giftAmount === amt ? "#c69526" : "#6b5a4e",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {amt}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => {
                          setGiftAmount(null);
                          setShowGiftOptions(false);
                        }}
                        style={{
                          flex: 1,
                          fontSize: 11,
                          color: "#9ca3af",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        Xóa chọn
                      </button>
                      <button
                        onClick={() => setShowGiftOptions(false)}
                        style={{
                          fontSize: 11,
                          color: "#c23d3f",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {!user && (
              <button
                onClick={() => router.push("?login")}
                style={{
                  fontSize: 13,
                  color: "#c23d3f",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Đăng nhập để bình luận →
              </button>
            )}
            {user && (
              <button
                onClick={handlePostComment}
                disabled={!commentText.trim() || submitting}
                style={{
                  padding: "8px 24px",
                  borderRadius: 9,
                  border: "none",
                  background:
                    !commentText.trim() || submitting ? "#f3f4f6" : "#c23d3f",
                  color: !commentText.trim() || submitting ? "#9ca3af" : "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor:
                    !commentText.trim() || submitting
                      ? "not-allowed"
                      : "pointer",
                  boxShadow: !commentText.trim() || submitting ? "none" : "0 2px 8px rgba(194,61,63,0.2)",
                }}
              >
                {submitting ? "⏳ Đang gửi..." : giftAmount ? "🎁 Tặng & Gửi" : "Gửi bình luận"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Comment list */}
      {comments.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "32px 0",
            fontSize: 14,
            color: "#b0a096",
          }}
        >
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận! 🌸
        </div>
      ) : (
        comments.map((c) => (
          <CommentNode
            key={c.id}
            comment={c}
            currentUserId={user?.id}
            isLoggedIn={!!user}
            storyAuthorId={storyAuthorId}
            onSubmitReply={handleSubmitReply}
            onDelete={handleDeleteComment}
            onReport={(id) =>
              onOpenReport("COMMENT", id, `Bình luận #${id}`)
            }
            onRequireAuth={() => router.push("?login")}
          />
        ))
      )}
    </div>
  );
}
