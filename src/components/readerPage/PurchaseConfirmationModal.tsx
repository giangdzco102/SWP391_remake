import React, { useState } from "react";
import { useAuthStore } from "@/stores";
import useChapterService from "@/api/useChapter.service";
import { useToast } from "@/hooks/use-toast";
import { ReaderChapterData as ChapterData } from "@/types/story";
import { useReaderTheme } from "@/hooks/useReaderTheme";

interface Props {
  chapterData: ChapterData;
  onClose: () => void;
  onSuccess: (updatedChapter: ChapterData) => void;
}

export function PurchaseConfirmationModal({
  chapterData,
  onClose,
  onSuccess,
}: Props) {
  const { purchaseChapter, getChapter } = useChapterService();
  const { updateBalance } = useAuthStore();
  const { dk } = useReaderTheme();
  const toast = useToast();

  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      await purchaseChapter(chapterData.id);
      updateBalance(chapterData.coinPrice);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await getChapter(chapterData.id);
      const data = res?.data ?? res;
      toast.success(
        `Chương "${chapterData.title}" đã được mở khóa.`,
        "Mở khóa thành công!",
      );
      onSuccess(data);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Không đủ xu hoặc lỗi hệ thống.",
        "Mở khóa thất bại",
      );
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={() => !purchasing && onClose()}
    >
      <div
        style={{
          background: dk.modalBg,
          borderRadius: 20,
          padding: "32px 28px",
          maxWidth: 400,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          textAlign: "center",
          border: `1px solid ${dk.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>🪙</div>
        <h3
          style={{
            margin: "0 0 6px",
            fontFamily: "'Playfair Display',serif",
            fontSize: 20,
            fontWeight: 800,
            color: dk.text,
          }}
        >
          Xác nhận mua chương
        </h3>
        <p
          style={{
            margin: "0 0 16px",
            fontSize: 14,
            color: dk.navBtnText,
            lineHeight: 1.6,
          }}
        >
          Bạn sắp mua{" "}
          <strong style={{ color: dk.text }}>
            &ldquo;{chapterData.title}&rdquo;
          </strong>{" "}
          với giá
        </p>
        <div
          style={{
            background: dk.lockedCoin,
            border: `1.5px solid ${dk.lockedCoinBdr}`,
            borderRadius: 12,
            padding: "14px 20px",
            marginBottom: 24,
            display: "inline-block",
          }}
        >
          <span style={{ fontSize: 28, fontWeight: 800, color: "#c69526" }}>
            🪙 {chapterData.coinPrice} xu
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            disabled={purchasing}
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px 20px",
              borderRadius: 10,
              border: `1.5px solid ${dk.border}`,
              background: dk.surface,
              color: dk.navBtnText,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Hủy
          </button>
          <button
            disabled={purchasing}
            onClick={handlePurchase}
            style={{
              flex: 1,
              padding: "11px 20px",
              borderRadius: 10,
              border: "none",
              background: purchasing
                ? "#a0a0a0"
                : "linear-gradient(135deg,#c69526,#9a7020)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: purchasing ? "not-allowed" : "pointer",
              boxShadow: purchasing
                ? "none"
                : "0 2px 8px rgba(194,149,38,.3)",
            }}
          >
            {purchasing ? "⏳ Đang mua..." : "✅ Xác nhận mua"}
          </button>
        </div>
      </div>
    </div>
  );
}
