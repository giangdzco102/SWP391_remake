import React, { useState } from "react";
import { createPortal } from "react-dom";
import useChapterService from "@/api/useChapter.service";
import { useStoryStore } from "@/stores/storyStore";
import { useToast } from "@/hooks/use-toast";

interface Props {
  confirmPurchase: { id: number; title: string; price: number } | null;
  onClose: () => void;
}

export function PurchaseChapterModal({ confirmPurchase, onClose }: Props) {
  const { purchaseChapter } = useChapterService();
  const { unlockChapter, chapters, setChapters } = useStoryStore();
  const toast = useToast();
  const [purchasingChapterId, setPurchasingChapterId] = useState<number | null>(null);

  if (!confirmPurchase) return null;

  return createPortal(
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
      onClick={() => !purchasingChapterId && onClose()}
    >
      <div
        style={{
          background: "#fff", borderRadius: 20, padding: "32px 28px",
          maxWidth: 400, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>🪙</div>
        <h3 style={{ margin: "0 0 6px", fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, color: "#1c1512" }}>
          Xác nhận mua chương
        </h3>
        <p style={{ margin: "0 0 20px", fontSize: 14, color: "#6b5a4e", lineHeight: 1.6 }}>
          Bạn sắp mua{" "}
          <strong style={{ color: "#1c1512" }}>&ldquo;{confirmPurchase.title}&rdquo;</strong>
          {" "}với giá
        </p>
        <div style={{
          background: "#fffbeb", border: "1.5px solid #fcd34d",
          borderRadius: 12, padding: "14px 20px", marginBottom: 24, display: "inline-block",
        }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: "#c69526" }}>
            🪙 {confirmPurchase.price} xu
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            disabled={!!purchasingChapterId}
            onClick={onClose}
            style={{
              flex: 1, padding: "11px 20px", borderRadius: 10,
              border: "1.5px solid #e8e0d6", background: "#fff",
              color: "#6b5a4e", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}
          >
            Hủy
          </button>
          <button
            disabled={!!purchasingChapterId}
            onClick={async () => {
              const { id, title, price } = confirmPurchase;
              setPurchasingChapterId(id);
              try {
                await purchaseChapter(id);
                unlockChapter(id, price);
                setChapters(
                  chapters.map(c =>
                    c.id === id ? { ...c, locked: false, isPurchased: true } : c
                  )
                );
                toast.success(`Chương "${title}" đã được mở khóa.`, "Mở khóa thành công!");
                onClose();
              } catch (err: any) {
                toast.error(err?.response?.data?.message ?? "Không đủ xu hoặc lỗi hệ thống.", "Mở khóa thất bại");
              } finally {
                setPurchasingChapterId(null);
              }
            }}
            style={{
              flex: 1, padding: "11px 20px", borderRadius: 10,
              border: "none",
              background: purchasingChapterId ? "#a0a0a0" : "linear-gradient(135deg,#c69526,#9a7020)",
              color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: purchasingChapterId ? "not-allowed" : "pointer",
              boxShadow: purchasingChapterId ? "none" : "0 2px 8px rgba(194,149,38,.3)",
            }}
          >
            {purchasingChapterId ? "⏳ Đang mua..." : "✅ Xác nhận mua"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
