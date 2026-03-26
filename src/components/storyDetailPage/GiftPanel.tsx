import React, { useState } from "react";
import useGiftService from "@/api/useGift.service";
import { useToast } from "@/hooks/use-toast";

interface Props {
  isOpen: boolean;
  storyId: number;
  author: string;
  onClose: () => void;
}

export function GiftPanel({ isOpen, storyId, author, onClose }: Props) {
  const { sendGift } = useGiftService();
  const toast = useToast();
  const [giftAmount, setGiftAmount] = useState(100);
  const [giftSending, setGiftSending] = useState(false);

  if (!isOpen) return null;

  const handleSendGift = async () => {
    if (giftAmount < 1 || giftSending) return;
    setGiftSending(true);
    try {
      await sendGift(storyId, giftAmount);
      toast.success(`Đã tặng ${giftAmount} xu cho tác giả!`);
      onClose();
      setGiftAmount(100);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Không thể tặng quà. Thử lại sau.");
    } finally {
      setGiftSending(false);
    }
  };

  return (
    <div
      style={{
        background: "#fef9ee",
        border: "1.5px solid #f0daa8",
        borderRadius: 14,
        padding: "16px 18px",
        marginBottom: 16,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 14, color: "#1c1512", marginBottom: 4 }}>
        🎁 Tặng xu cho tác giả: <em>{author}</em>
      </div>
      <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>
        Xu sẽ được chuyển thẳng vào ví tác giả ngay sau khi bạn xác nhận.
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {[10, 50, 100, 200, 500].map((preset) => (
          <button
            key={preset}
            onClick={() => setGiftAmount(preset)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: `1.5px solid ${giftAmount === preset ? "#b08430" : "#e8e0d6"}`,
              background: giftAmount === preset ? "#fef9ee" : "#fff",
              color: giftAmount === preset ? "#b08430" : "#6b5a4e",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            🪙 {preset} xu
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <input
          type="number"
          min={1}
          value={giftAmount}
          onChange={(e) => setGiftAmount(Math.max(1, Number(e.target.value)))}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1.5px solid #e8e0d6",
            fontSize: 13,
            color: "#3d2f28",
            fontFamily: "inherit",
            outline: "none",
            width: 120,
          }}
        />
        <span style={{ fontSize: 12, color: "#9ca3af" }}>xu (tùy chỉnh)</span>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          onClick={() => { onClose(); setGiftAmount(100); }}
          style={{
            padding: "8px 18px",
            borderRadius: 9,
            border: "1.5px solid #e8e0d6",
            background: "#fff",
            color: "#6b5a4e",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Hủy
        </button>
        <button
          onClick={handleSendGift}
          disabled={giftAmount < 1 || giftSending}
          style={{
            padding: "8px 18px",
            borderRadius: 9,
            border: "none",
            background: giftAmount < 1 || giftSending ? "#f3f4f6" : "#b08430",
            color: giftAmount < 1 || giftSending ? "#9ca3af" : "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: giftAmount < 1 || giftSending ? "not-allowed" : "pointer",
          }}
        >
          {giftSending ? "⏳ Đang gửi…" : `🎁 Tặng ${giftAmount} xu`}
        </button>
      </div>
    </div>
  );
}
