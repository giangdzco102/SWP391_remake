/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import useHttpClient from "@/api/useHttpClient";
import APP_CONFIG from "@/config/app-config";
import { useToast } from "@/hooks/use-toast";
import { ChapterItem } from "@/types/myStoriesPage";
import {
  T,
  btnOutline,
  btnPrimary,
  btnDisabled,
  fLabel,
  fInput,
} from "@/utils/myStoriesPage.constants";
import { stripHtml } from "@/utils/myStoriesPage.utils";
import { RichEditor } from "./RichEditor";

interface ChapterFormModalProps {
  storyId: number;
  chapter?: ChapterItem | null;
  nextOrder?: number;
  onClose: () => void;
  onSaved: () => void;
}

export function ChapterFormModal({
  storyId,
  chapter,
  nextOrder,
  onClose,
  onSaved,
}: ChapterFormModalProps) {
  const httpClient = useHttpClient();
  const toast = useToast();
  const isEdit = !!chapter;

  // Tách subtitle từ title hiện tại (nếu có định dạng "Chương X: ...")
  const getSubTitle = (fullTitle: string) => fullTitle.replace(/^Chương\s+\d+:\s*/, "");

  const [subTitle, setSubTitle] = useState(chapter?.title ? getSubTitle(chapter.title) : "");
  const [content, setContent] = useState(chapter?.content ?? "");
  const [chapterOrder, setChapterOrder] = useState(
    chapter?.chapterOrder ?? nextOrder ?? 1
  );
  const [coinPrice, setCoinPrice] = useState(chapter?.coinPrice ?? 0);
  const [publishAt, setPublishAt] = useState(chapter?.publishAt ?? "");
  const [saving, setSaving] = useState(false);
  const [loadingContent, setLoadingContent] = useState(
    isEdit && !chapter?.content
  );

  // Chapter list API doesn't return content — fetch full chapter when editing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isEdit || chapter!.content) return;
    setLoadingContent(true);
    httpClient
      .get(APP_CONFIG.CHAPTER.GET(chapter!.id))
      .then((res: any) => {
        const data = res?.data ?? res ?? {};
        setContent(data.content ?? "");
        if (data.title) setSubTitle(getSubTitle(data.title));
        if (data.chapterOrder !== undefined) setChapterOrder(data.chapterOrder);
        if (data.coinPrice !== undefined) setCoinPrice(data.coinPrice);
        if (data.publishAt) setPublishAt(data.publishAt);
      })
      .catch(() => toast.error("Không tải được nội dung chương."))
      .finally(() => setLoadingContent(false));
  }, []);

  const wordCount = stripHtml(content).split(/\s+/).filter(Boolean).length;
  const hasContent = stripHtml(content).trim().length > 0;

  const handleSave = async () => {
    const plainText = stripHtml(content).trim();
    if (!plainText) return;
    setSaving(true);
    try {
      const finalTitle = `Chương ${chapterOrder}${subTitle.trim() ? ': ' + subTitle.trim() : ''}`;
      const body: any = { title: finalTitle, content, coinPrice, chapterOrder };
      if (publishAt) body.publishAt = publishAt;
      if (isEdit) {
        await httpClient.put(APP_CONFIG.CHAPTER.UPDATE(chapter!.id), body);
        toast.success("Đã cập nhật chương!");
      } else {
        await httpClient.post(APP_CONFIG.CHAPTER.CREATE(storyId), body);
        toast.success("Đã thêm chương mới!");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Không thể lưu chương. Thử lại sau."
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
        zIndex: 1000,
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
          maxWidth: 860,
          maxHeight: "94vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: T.shadowMd,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: `1.5px solid ${T.borderLight}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: T.fontSerif,
              fontSize: 18,
              fontWeight: 800,
              color: T.text,
            }}
          >
            {isEdit ? "✏️ Chỉnh sửa chương" : "📝 Thêm chương mới"}
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
            overflowY: "auto",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div>
            <label style={fLabel()}>Tiêu đề chương *</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: T.text,
                  whiteSpace: "nowrap",
                  padding: "0 4px",
                }}
              >
                Chương {chapterOrder}:
              </span>
              <input
                value={subTitle}
                onChange={(e) => setSubTitle(e.target.value)}
                placeholder="Tên chương bổ sung (không bắt buộc)"
                style={{ ...fInput(), flex: 1 }}
              />
            </div>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <label style={{ ...fLabel(), margin: 0 }}>Nội dung *</label>
              <span style={{ fontSize: 11, color: T.textMuted }}>
                {wordCount.toLocaleString()} chữ
              </span>
            </div>
            {loadingContent ? (
              <div
                style={{
                  padding: "40px 0",
                  textAlign: "center",
                  fontSize: 13,
                  color: T.textMuted,
                  border: `1.5px solid ${T.border}`,
                  borderRadius: T.radius,
                }}
              >
                ⏳ Đang tải nội dung chương…
              </div>
            ) : (
              <RichEditor value={content} onChange={setContent} />
            )}
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={fLabel()}>Số thứ tự chương *</label>
              <input
                type="number"
                min={1}
                value={chapterOrder}
                onChange={(e) =>
                  setChapterOrder(Math.max(1, Number(e.target.value)))
                }
                style={fInput()}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={fLabel()}>Giá xu (0 = miễn phí)</label>
              <input
                type="number"
                min={0}
                value={coinPrice}
                onChange={(e) =>
                  setCoinPrice(Math.max(0, Number(e.target.value)))
                }
                style={fInput()}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={fLabel()}>Lên lịch phát hành (tuỳ chọn)</label>
              <input
                type="datetime-local"
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
                style={fInput()}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={btnOutline}>
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={!hasContent || saving}
              style={!hasContent || saving ? btnDisabled : btnPrimary}
            >
              {saving
                ? "Đang lưu…"
                : isEdit
                ? "💾 Lưu thay đổi"
                : "📝 Đăng chương"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
