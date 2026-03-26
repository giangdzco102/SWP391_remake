/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import useHttpClient from "@/api/useHttpClient";
import { formatVNDateTime } from "@/utils/time";
import { ModalHeader, StatusBadge } from "@/components/adminDashboard/ui";
import {
  MISSION_TYPES,
  TYPE_COLOR,
  TYPE_LABEL,
  ALL_RESOLVE_ACTIONS,
  BAN_OPTIONS,
} from "@/utils/adminConstants";
import {
  inputStyle,
  labelStyle,
  overlayStyle,
  modalStyle,
} from "@/components/adminDashboard/adminStyles";

export function ConfirmDialog({
  message,
  onYes,
  onNo,
}: {
  message: string;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <div style={overlayStyle}>
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 28,
          maxWidth: 400,
          width: "90%",
          boxShadow: "0 20px 60px rgba(0,0,0,.25)",
        }}
      >
        <p
          style={{
            margin: "0 0 20px",
            fontSize: 15,
            lineHeight: 1.6,
            color: "#1c1512",
          }}
        >
          {message}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onNo}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Hủy
          </button>
          <button
            onClick={onYes}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              background: "#ff500a",
              color: "#fff",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReviewModal({
  title,
  onSubmit,
  onClose,
}: {
  title: string;
  onSubmit: (note: string, approved: boolean) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, padding: 28 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>
          {title}
        </h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú (tuỳ chọn)..."
          style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
        />
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            marginTop: 16,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Hủy
          </button>
          <button
            onClick={() => onSubmit(note, false)}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              background: "#dc2626",
              color: "#fff",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Từ chối
          </button>
          <button
            onClick={() => onSubmit(note, true)}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              background: "#ff500a",
              color: "#fff",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Duyệt
          </button>
        </div>
      </div>
    </div>
  );
}

export function MissionModal({
  initial,
  onSubmit,
  onClose,
}: {
  initial?: any;
  onSubmit: (data: any) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    rewardCoin: 10,
    requiredCount: 1,
    type: "DAILY",
    ...initial,
  });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <ModalHeader
          title={initial ? "Cập nhật nhiệm vụ" : "Tạo nhiệm vụ mới"}
          onClose={onClose}
        />
        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <span style={labelStyle}>Tên nhiệm vụ</span>
              <input
                placeholder="Tên nhiệm vụ"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <span style={labelStyle}>Mô tả</span>
              <textarea
                placeholder="Mô tả"
                value={form.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
                style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <span style={labelStyle}>Coin thưởng</span>
                <input
                  type="number"
                  value={form.rewardCoin}
                  onChange={(e) => set("rewardCoin", Number(e.target.value))}
                  style={inputStyle}
                />
              </div>
              <div>
                <span style={labelStyle}>Số lần yêu cầu</span>
                <input
                  type="number"
                  value={form.requiredCount ?? 1}
                  onChange={(e) => set("requiredCount", Number(e.target.value))}
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <span style={labelStyle}>Loại nhiệm vụ</span>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {Object.entries(MISSION_TYPES).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              marginTop: 20,
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "9px 20px",
                borderRadius: 8,
                border: "1.5px solid #e5e7eb",
                background: "#fff",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Hủy
            </button>
            <button
              onClick={() => onSubmit(form)}
              style={{
                padding: "9px 20px",
                borderRadius: 8,
                border: "none",
                background: "#ff500a",
                color: "#fff",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportDetailModal({
  report,
  onResolve,
  onClose,
}: {
  report: any;
  onResolve: (r: any) => void;
  onClose: () => void;
}) {
  const httpClient = useHttpClient();
  const [target, setTarget] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  function findCommentById(list: any[], id: number): any {
    for (const c of list) {
      if (c.id === id) return c;
      if (c.replies?.length) {
        const found = findCommentById(c.replies, id);
        if (found) return found;
      }
    }
    return null;
  }

  useEffect(() => {
    let cancelled = false;
    const fetchTarget = async () => {
      setFetching(true);
      try {
        let res: any = null;
        if (report.targetType === "STORY") {
          res = await httpClient.get(`/stories/${report.targetId}`);
          if (!cancelled) setTarget(res?.data ?? res);
        } else if (report.targetType === "CHAPTER") {
          res = await httpClient.get(`/chapters/${report.targetId}`);
          if (!cancelled) setTarget(res?.data ?? res);
        } else if (report.targetType === "COMMENT") {
          try {
            res = await httpClient.get(`/comments/${report.targetId}`);
            const direct = res?.data ?? res;
            if (direct && (direct.content || direct.id)) {
              if (!cancelled) setTarget(direct);
              return;
            }
          } catch {
            /* fall through */
          }
          const chapterId =
            report.chapterId ??
            report.targetChapterId ??
            report.comment?.chapterId;
          if (chapterId) {
            const listRes: any = await httpClient.get(
              `/comments/chapter/${chapterId}?page=0&size=200`,
            );
            const list: any[] =
              listRes?.data?.content ??
              listRes?.data ??
              listRes?.content ??
              listRes ??
              [];
            if (!cancelled)
              setTarget(findCommentById(list, report.targetId) ?? null);
          } else {
            if (!cancelled) setTarget(null);
          }
        }
      } catch {
        if (!cancelled) setTarget(null);
      } finally {
        if (!cancelled) setFetching(false);
      }
    };
    fetchTarget();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.targetId, report.targetType]);

  const renderTarget = () => {
    if (fetching)
      return (
        <div
          style={{
            textAlign: "center",
            padding: "20px 0",
            color: "#9ca3af",
            fontSize: 13,
          }}
        >
          ⏳ Đang tải thông tin nội dung...
        </div>
      );
    if (report.targetType === "COMMENT") {
      const name =
        target?.userName ??
        target?.user?.fullName ??
        report.targetUserName ??
        "—";
      const content = target?.content ?? report.targetContent ?? null;
      return (
        <div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: "#d97706",
              }}
            >
              {name !== "—" ? name[0]?.toUpperCase() : "?"}
            </div>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{name}</span>
          </div>
          {content && (
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "#374151",
                lineHeight: 1.6,
              }}
            >
              {content}
            </p>
          )}
          {report.resolveNote && (
            <div
              style={{
                marginTop: 10,
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#065f46",
                fontSize: 13,
              }}
            >
              <strong>Ghi chú xử lý:</strong> {report.resolveNote}
            </div>
          )}
        </div>
      );
    }
    if (!target)
      return (
        <div
          style={{
            textAlign: "center",
            padding: "12px 0",
            color: "#6b7280",
            fontSize: 13,
          }}
        >
          Không thể tải thông tin nội dung (ID: {report.targetId})
        </div>
      );
    if (report.targetType === "STORY")
      return (
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          {target.coverUrl && (
            <img
              src={target.coverUrl}
              alt="cover"
              style={{
                width: 64,
                height: 90,
                objectFit: "cover",
                borderRadius: 6,
                flexShrink: 0,
                border: "1px solid #e5e7eb",
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: "#1c1512",
                marginBottom: 4,
              }}
            >
              {target.title ?? `Truyện #${report.targetId}`}
            </div>
            {target.authorName && (
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                ✍️ {target.authorName}
              </div>
            )}
            {target.description && (
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: 13,
                  color: "#374151",
                  lineHeight: 1.55,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {target.description}
              </p>
            )}
          </div>
        </div>
      );
    if (report.targetType === "CHAPTER")
      return (
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: "#1c1512",
              marginBottom: 4,
            }}
          >
            {target.title ?? `Chương #${report.targetId}`}
          </div>
          {target.content && (
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "#374151",
                lineHeight: 1.6,
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {target.content}
            </p>
          )}
        </div>
      );
    return null;
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <ModalHeader
          title={
            <>
              Chi tiết báo cáo{" "}
              <span style={{ color: "#ff500a" }}>#{report.id}</span>
            </>
          }
          onClose={onClose}
        />
        <div style={{ padding: "20px 24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {[
              { label: "Người báo cáo", value: report.reporterName ?? "—" },
              {
                label: "Ngày báo cáo",
                value: report.createdAt
                  ? formatVNDateTime(report.createdAt)
                  : "—",
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: "#f9fafb",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#9ca3af",
                    marginBottom: 3,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: "#1c1512" }}
                >
                  {value}
                </div>
              </div>
            ))}
            <div
              style={{
                background: "#f9fafb",
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#9ca3af",
                  marginBottom: 3,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Loại đối tượng
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                  background: TYPE_COLOR[report.targetType] ?? "#6b7280",
                  borderRadius: 4,
                  padding: "2px 8px",
                }}
              >
                {TYPE_LABEL[report.targetType] ?? report.targetType}
              </span>
            </div>
            <div
              style={{
                background: "#f9fafb",
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#9ca3af",
                  marginBottom: 3,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Trạng thái
              </div>
              <StatusBadge status={report.status} />
            </div>
          </div>

          {report.content && (
            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#374151",
                  marginBottom: 6,
                }}
              >
                📝 Lý do báo cáo
              </div>
              <div
                style={{
                  background: "#fef3c7",
                  border: "1px solid #fde68a",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#92400e",
                }}
              >
                {report.content}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#374151",
                marginBottom: 8,
              }}
            >
              🎯 Nội dung bị báo cáo —{" "}
              {TYPE_LABEL[report.targetType] ?? report.targetType} #
              {report.targetId}
            </div>
            <div
              style={{
                background: "#f9fafb",
                border: "1.5px solid #e5e7eb",
                borderRadius: 10,
                padding: "14px 16px",
              }}
            >
              {renderTarget()}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={onClose}
              style={{
                padding: "9px 20px",
                borderRadius: 8,
                border: "1.5px solid #e5e7eb",
                background: "#fff",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Đóng
            </button>
            {report.status === "PENDING" && (
              <button
                onClick={() => {
                  onClose();
                  onResolve(report);
                }}
                style={{
                  padding: "9px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "#e64a19",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                ⚡ Xử lý báo cáo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportResolveModal({
  report,
  onSubmit,
  onClose,
}: {
  report: any;
  onSubmit: (payload: any) => void;
  onClose: () => void;
}) {
  const targetType: string = report?.targetType ?? "COMMENT";
  const availableActions = ALL_RESOLVE_ACTIONS.filter((a) =>
    a.targets.includes(targetType),
  );
  const [action, setAction] = useState(
    availableActions[0]?.value ?? "WARN_ONLY",
  );
  const [banDays, setBanDays] = useState(7);
  const [adminNote, setAdminNote] = useState("");
  const requiresBan = ["BAN_USER", "HIDE_AND_BAN", "DELETE_AND_BAN"].includes(
    action,
  );

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <ModalHeader
          title={
            <>
              Xử lý báo cáo{" "}
              <span style={{ color: "#ff500a" }}>#{report.id}</span>
            </>
          }
          onClose={onClose}
        />
        <div style={{ padding: "20px 24px" }}>
          {/* Action selection */}
          <div style={{ marginBottom: 16 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#374151",
                display: "block",
                marginBottom: 8,
              }}
            >
              Chọn hành động xử lý:
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {availableActions.map((a) => (
                <label
                  key={a.value}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: `1.5px solid ${action === a.value ? "#ff500a" : "#e5e7eb"}`,
                    cursor: "pointer",
                    background: action === a.value ? "#fff8f5" : "#fff",
                    transition: "all 0.15s",
                  }}
                >
                  <input
                    type="radio"
                    name="resolve_action"
                    value={a.value}
                    checked={action === a.value}
                    onChange={() => setAction(a.value)}
                    style={{ marginTop: 3, cursor: "pointer" }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {a.label}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>
                      {a.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Ban duration */}
          {requiresBan && (
            <div style={{ marginBottom: 16 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#374151",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Thời gian khóa tài khoản:
              </span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {BAN_OPTIONS.map((opt) => (
                  <button
                    key={opt.v}
                    onClick={() => setBanDays(opt.v)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: 20,
                      border: "1.5px solid",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      background: banDays === opt.v ? "#dc2626" : "#fff",
                      color: banDays === opt.v ? "#fff" : "#6b7280",
                      borderColor: banDays === opt.v ? "#dc2626" : "#e5e7eb",
                    }}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Admin note */}
          <div style={{ marginBottom: 20 }}>
            <span style={labelStyle}>Ghi chú (tuỳ chọn)</span>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Ghi chú cho quyết định này..."
              style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={onClose}
              style={{
                padding: "9px 20px",
                borderRadius: 8,
                border: "1.5px solid #e5e7eb",
                background: "#fff",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Hủy
            </button>
            <button
              onClick={() =>
                onSubmit({
                  action,
                  ...(requiresBan ? { banDays } : {}),
                  adminNote: adminNote || undefined,
                })
              }
              style={{
                padding: "9px 20px",
                borderRadius: 8,
                border: "none",
                background: "#e64a19",
                color: "#fff",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Xác nhận xử lý
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
