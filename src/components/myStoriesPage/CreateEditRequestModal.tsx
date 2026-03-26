/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import useHttpClient from "@/api/useHttpClient";
import APP_CONFIG from "@/config/app-config";
import { useToast } from "@/hooks/use-toast";
import { ChapterItem } from "@/types/myStoriesPage";
import {
  T,
  btnOutline,
  btnPurple,
  btnDisabled,
  fLabel,
  fInput,
} from "@/utils/myStoriesPage.constants";

interface CreateEditRequestModalProps {
  chapter: ChapterItem;
  walletBalance: number;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateEditRequestModal({
  chapter,
  walletBalance,
  onClose,
  onCreated,
}: CreateEditRequestModalProps) {
  const httpClient = useHttpClient();
  const toast = useToast();

  const [coinReward, setCoinReward] = useState(50);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (coinReward < 1) return;
    setSaving(true);
    try {
      await httpClient.post(APP_CONFIG.EDIT_REQUEST.CREATE, {
        chapterId: chapter.id,
        coinReward,
        description: description.trim() || undefined,
      });
      toast.success("Đã đăng yêu cầu chỉnh sửa!");
      onCreated();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Không thể tạo yêu cầu."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        style={{
          background: T.card,
          borderRadius: 20,
          width: "100%",
          maxWidth: 480,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: T.shadowMd,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 22px 14px",
            borderBottom: `1.5px solid ${T.borderLight}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: T.fontSerif,
                fontSize: 17,
                fontWeight: 800,
                color: T.text,
              }}
            >
              🎨 Đặt yêu cầu chỉnh sửa
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
              Chương: {chapter.title}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: `1.5px solid ${T.border}`,
              background: T.bg,
              cursor: "pointer",
              fontSize: 16,
              color: T.textSec,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              background: T.warnBg,
              border: `1.5px solid ${T.warnBorder}`,
              borderRadius: T.radiusSm,
              padding: "10px 14px",
              fontSize: 13,
              color: T.warn,
              lineHeight: 1.6,
            }}
          >
            ⚠️ Coin sẽ bị khoá cho đến khi bạn duyệt (approve) hoặc huỷ yêu
            cầu.
            <br />
            💰 Số dư hiện tại:{" "}
            <strong>{walletBalance.toLocaleString()} xu</strong>
          </div>

          <div>
            <label style={fLabel()}>Tiền thưởng (coin) *</label>
            <input
              type="number"
              min={1}
              value={coinReward}
              onChange={(e) =>
                setCoinReward(Math.max(1, Number(e.target.value)))
              }
              style={fInput()}
            />
          </div>

          <div>
            <label style={fLabel()}>Mô tả yêu cầu</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Lỗi chính tả, văn phong, cấu trúc cần chỉnh sửa…"
              rows={4}
              style={{ ...fInput(), resize: "none" }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={btnOutline}>
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={coinReward < 1 || saving}
              style={coinReward < 1 || saving ? btnDisabled : btnPurple}
            >
              {saving ? "Đang đăng…" : "🎨 Đăng yêu cầu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
