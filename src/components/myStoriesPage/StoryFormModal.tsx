/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import useHttpClient from "@/api/useHttpClient";
import APP_CONFIG from "@/config/app-config";
import { useToast } from "@/hooks/use-toast";
import { StoryItem, CategoryItem } from "@/types/myStoriesPage";
import {
  T,
  btnPrimary,
  btnOutline,
  btnDisabled,
  fLabel,
  fInput,
} from "@/utils/myStoriesPage.constants";

interface StoryFormModalProps {
  story?: StoryItem | null;
  onClose: () => void;
  onSaved: () => void;
}

export function StoryFormModal({ story, onClose, onSaved }: StoryFormModalProps) {
  const httpClient = useHttpClient();
  const toast = useToast();
  const isEdit = !!story;

  const [title, setTitle] = useState(story?.title ?? "");
  const [description, setDescription] = useState(
    story?.summary ?? story?.description ?? ""
  );
  const [coverUrl, setCoverUrl] = useState(story?.coverUrl ?? "");
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    story?.categoryIds ?? story?.categories?.map((c) => c.id) ?? []
  );
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [saving, setSaving] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    httpClient
      .get(APP_CONFIG.CATEGORY.LIST)
      .then((res: any) => {
        const list = res?.data ?? res ?? [];
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoadingCats(false));
  }, []);

  const toggleCat = (id: number) =>
    setSelectedCategories((p) =>
      p.includes(id) ? p.filter((c) => c !== id) : [...p, id]
    );

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const body: any = {
        title: title.trim(),
        summary: description.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        categoryIds:
          selectedCategories.length > 0 ? selectedCategories : undefined,
      };
      if (isEdit) {
        await httpClient.put(APP_CONFIG.STORY.UPDATE(story!.id), body);
        toast.success("Đã cập nhật tác phẩm!");
      } else {
        await httpClient.post(APP_CONFIG.STORY.CREATE, body);
        toast.success("Đã tạo tác phẩm mới!");
      }
      onSaved();
      onClose();
    } catch {
      toast.error(isEdit ? "Không thể cập nhật." : "Không thể tạo tác phẩm.");
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
          maxWidth: 720,
          maxHeight: "95vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: T.shadowMd,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "22px 28px 16px",
            borderBottom: `1.5px solid ${T.borderLight}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: T.fontSerif,
                fontSize: 20,
                fontWeight: 800,
                color: T.text,
              }}
            >
              {isEdit ? "✏️ Sửa thông tin truyện" : "📖 Tạo tác phẩm mới"}
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
              {isEdit
                ? "Cập nhật thông tin truyện của bạn"
                : "Điền đầy đủ thông tin để tác phẩm nổi bật hơn"}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
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
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            {/* Cover */}
            <div style={{ flexShrink: 0, width: 120 }}>
              <label style={fLabel()}>Ảnh bìa</label>
              <div
                style={{
                  width: 120,
                  height: 164,
                  borderRadius: T.radiusSm,
                  border: `1.5px solid ${T.border}`,
                  overflow: "hidden",
                  background: coverUrl.trim() ? T.grayBg : T.headerGrad,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 32,
                  marginBottom: 8,
                }}
              >
                {coverUrl.trim() ? (
                  <img
                    src={coverUrl}
                    alt="cover"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  "📖"
                )}
              </div>
              <input
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="URL ảnh bìa…"
                style={{ ...fInput(), fontSize: 11, padding: "7px 10px" }}
              />
            </div>

            {/* Title + Description */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div>
                <label style={fLabel()}>Tên truyện *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tên truyện…"
                  style={fInput()}
                  autoFocus
                />
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <label style={{ ...fLabel(), margin: 0 }}>
                    Tóm tắt nội dung
                  </label>
                  <span style={{ fontSize: 11, color: T.textMuted }}>
                    {description.length}/2000
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value.slice(0, 2000))
                  }
                  placeholder="Mô tả hấp dẫn giúp độc giả muốn đọc ngay…"
                  rows={5}
                  style={{
                    ...fInput(),
                    resize: "vertical",
                    lineHeight: 1.6,
                    minHeight: 110,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <label style={fLabel()}>
              Thể loại{" "}
              {selectedCategories.length > 0 && (
                <span style={{ color: T.accent }}>
                  ({selectedCategories.length})
                </span>
              )}
            </label>
            {loadingCats ? (
              <div style={{ fontSize: 13, color: T.textMuted }}>Đang tải…</div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {categories.map((cat) => {
                  const sel = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCat(cat.id)}
                      style={{
                        padding: "6px 16px",
                        borderRadius: 20,
                        border: `1.5px solid ${sel ? T.accent : T.border}`,
                        background: sel ? T.accentLight : T.bg,
                        color: sel ? T.accent : T.textSec,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {sel ? "✓ " : ""}
                      {cat.name}
                    </button>
                  );
                })}
                {categories.length === 0 && (
                  <span
                    style={{
                      fontSize: 13,
                      color: T.textMuted,
                      fontStyle: "italic",
                    }}
                  >
                    Không có thể loại.
                  </span>
                )}
              </div>
            )}
          </div>

          {!isEdit && (
            <div
              style={{
                background: T.warnBg,
                border: `1.5px solid ${T.warnBorder}`,
                borderRadius: T.radiusSm,
                padding: "12px 16px",
                fontSize: 13,
                color: T.warn,
                lineHeight: 1.6,
              }}
            >
              💡 <strong>Mẹo:</strong> Tác phẩm vừa tạo sẽ ở trạng thái{" "}
              <strong>Bản nháp</strong>. Thêm chương xong rồi hãy nộp kiểm
              duyệt để xuất bản.
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 28px",
            borderTop: `1.5px solid ${T.borderLight}`,
            display: "flex",
            gap: 12,
            justifyContent: "flex-end",
            flexShrink: 0,
            background: T.bg,
          }}
        >
          <button onClick={onClose} style={btnOutline}>
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            style={!title.trim() || saving ? btnDisabled : btnPrimary}
          >
            {saving
              ? "Đang lưu…"
              : isEdit
              ? "💾 Cập nhật"
              : "🚀 Tạo tác phẩm"}
          </button>
        </div>
      </div>
    </div>
  );
}
