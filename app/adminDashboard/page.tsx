/* eslint-disable @next/next/no-img-element */
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import useAdminService from "@/api/useAdmin.service";
import useHttpClient from "@/api/useHttpClient";
import { useToast } from "@/hooks/use-toast";

// ─── Icons ───────────────────────────────────────────────────────────────────
const Icon = {
  Dashboard: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  Users: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Book: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Flag: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  ),
  Shield: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Wallet: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
      <path d="M16 3v4M8 3v4" />
      <circle cx="17" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
  Target: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Check: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Edit: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  Plus: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Search: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Eye: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
    </svg>
  ),
  Lock: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Unlock: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  ),
  Refresh: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
};

// ─── Shared styles ─────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 8,
  border: "1.5px solid #e5e7eb",
  padding: "9px 12px",
  fontSize: 14,
  boxSizing: "border-box",
  outline: "none",
  background: "#fff",
  color: "#1c1512",
  transition: "border-color 0.15s",
};
const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#6b7280",
  display: "block",
  marginBottom: 4,
};
const sectionTitle: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 700,
  color: "#1c1512",
  marginBottom: 18,
  marginTop: 0,
};
const tableWrap: React.CSSProperties = {
  overflowX: "auto",
  borderRadius: 12,
  border: "1.5px solid #f0ebe3",
  background: "#fff",
};
const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};
const th: React.CSSProperties = {
  padding: "11px 14px",
  textAlign: "left",
  fontWeight: 700,
  fontSize: 11,
  color: "#9ca3af",
  whiteSpace: "nowrap",
  borderBottom: "1.5px solid #f0ebe3",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};
const td: React.CSSProperties = {
  padding: "11px 14px",
  verticalAlign: "middle",
  borderBottom: "1px solid #f5f1ee",
};
const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 18,
  border: "1.5px solid #f0ebe3",
};
const iconBtnStyle = (color: string): React.CSSProperties => ({
  width: 30,
  height: 30,
  borderRadius: 7,
  border: "none",
  background: color + "18",
  color,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.15s",
});
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};
const modalStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 0,
  maxWidth: 520,
  width: "100%",
  boxShadow: "0 24px 64px rgba(0,0,0,.25)",
  maxHeight: "90vh",
  overflowY: "auto",
};

const TABS = [
  { id: "overview", label: "Tổng quan", icon: Icon.Dashboard },
  { id: "users", label: "Người dùng", icon: Icon.Users },
  { id: "stories", label: "Truyện chờ", icon: Icon.Book },
  { id: "reports", label: "Báo cáo", icon: Icon.Flag },
  { id: "roles", label: "Yêu cầu role", icon: Icon.Shield },
  { id: "withdraws", label: "Rút tiền", icon: Icon.Wallet },
  { id: "missions", label: "Nhiệm vụ", icon: Icon.Target },
];

const MISSION_TYPES: Record<string, string> = {
  DAILY: "Hàng ngày",
  READ: "Đọc truyện",
  READ_CHAPTER: "Đọc chapter",
  COMMENT: "Bình luận",
  FOLLOW_STORY: "Theo dõi truyện",
  PURCHASE_CHAPTER: "Mua chapter",
  WRITE_CHAPTER: "Viết chapter",
};

const TYPE_COLOR: Record<string, string> = {
  STORY: "#ff500a",
  CHAPTER: "#2563eb",
  COMMENT: "#d97706",
};
const TYPE_LABEL: Record<string, string> = {
  STORY: "Truyện",
  CHAPTER: "Chương",
  COMMENT: "Bình luận",
};

// ─── StatusBadge ──────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { bg: string; color: string; label: string }> =
  {
    PENDING: { bg: "#fef3c7", color: "#92400e", label: "Chờ duyệt" },
    APPROVED: { bg: "#d1fae5", color: "#065f46", label: "Đã duyệt" },
    REJECTED: { bg: "#fee2e2", color: "#991b1b", label: "Từ chối" },
    RESOLVED: { bg: "#dbeafe", color: "#1e40af", label: "Đã xử lý" },
    PUBLISHED: { bg: "#d1fae5", color: "#065f46", label: "Đã xuất bản" },
    DRAFT: { bg: "#f3f4f6", color: "#374151", label: "Bản nháp" },
    true: { bg: "#d1fae5", color: "#065f46", label: "Hoạt động" },
    false: { bg: "#fee2e2", color: "#991b1b", label: "Bị khóa" },
  };

const StatusBadge = ({ status }: { status: string }) => {
  const s = STATUS_MAP[status] ?? {
    bg: "#f3f4f6",
    color: "#374151",
    label: status,
  };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        borderRadius: 20,
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
};

// ─── ActionBtn ────────────────────────────────────────────────────────────────
function ActionBtn({
  color,
  onClick,
  children,
}: {
  color: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "6px 12px",
        borderRadius: 7,
        border: "none",
        background: color,
        color: "#fff",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div
      style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}
    >
      <div style={{ fontSize: 44, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 15 }}>{message}</div>
    </div>
  );
}

// ─── ModalHeader ─────────────────────────────────────────────────────────────
function ModalHeader({
  title,
  onClose,
}: {
  title: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        padding: "20px 24px 16px",
        borderBottom: "1px solid #f0ebe3",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <h3
        style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1c1512" }}
      >
        {title}
      </h3>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 20,
          color: "#9ca3af",
          lineHeight: 1,
          padding: 4,
        }}
      >
        ✕
      </button>
    </div>
  );
}

// ─── ConfirmDialog ────────────────────────────────────────────────────────────
function ConfirmDialog({
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

// ─── ReviewModal ──────────────────────────────────────────────────────────────
function ReviewModal({
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

// ─── MissionModal ─────────────────────────────────────────────────────────────
function MissionModal({
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

// ─── ReportDetailModal ────────────────────────────────────────────────────────
function ReportDetailModal({
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
          {/* Meta grid */}
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
                  ? new Date(report.createdAt).toLocaleString("vi-VN")
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

          {/* Reason */}
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

          {/* Target content */}
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

// ─── ReportResolveModal ───────────────────────────────────────────────────────
const ALL_RESOLVE_ACTIONS = [
  {
    value: "WARN_ONLY",
    label: "⚠️ Cảnh báo",
    desc: "Đánh dấu đã xử lý, gửi cảnh báo đến người vi phạm",
    targets: ["STORY", "CHAPTER", "COMMENT"],
  },
  {
    value: "HIDE_CONTENT",
    label: "🙈 Ẩn nội dung",
    desc: "Ẩn nội dung vi phạm khỏi người dùng",
    targets: ["STORY", "CHAPTER", "COMMENT"],
  },
  {
    value: "DELETE_CONTENT",
    label: "🗑 Xóa nội dung",
    desc: "Xóa vĩnh viễn nội dung vi phạm",
    targets: ["STORY", "CHAPTER", "COMMENT"],
  },
  {
    value: "BAN_USER",
    label: "🔒 Khóa tài khoản",
    desc: "Khóa tài khoản tác giả, không ẩn nội dung",
    targets: ["STORY", "CHAPTER", "COMMENT"],
  },
  {
    value: "HIDE_AND_BAN",
    label: "🙈🔒 Ẩn + Khóa TK",
    desc: "Ẩn nội dung vi phạm và khóa tài khoản tác giả",
    targets: ["STORY", "CHAPTER"],
  },
  {
    value: "DELETE_AND_BAN",
    label: "🗑🔒 Xóa + Khóa TK",
    desc: "Xóa nội dung vi phạm và khóa tài khoản tác giả",
    targets: ["STORY", "CHAPTER", "COMMENT"],
  },
];
const BAN_OPTIONS = [
  { v: 1, l: "1 ngày" },
  { v: 3, l: "3 ngày" },
  { v: 7, l: "7 ngày" },
  { v: 30, l: "30 ngày" },
  { v: -1, l: "Vĩnh viễn" },
];

function ReportResolveModal({
  report,
  onSubmit,
  onClose,
}: {
  report: any;
  onSubmit: (payload: any) => void;
  onClose: () => void;
}) {
  const targetType: string = report?.targetType ?? "COMMENT";
  const availableActions = ALL_RESOLVE_ACTIONS.filter((a) => a.targets.includes(targetType));
  const [action, setAction] = useState(availableActions[0]?.value ?? "WARN_ONLY");
  const [banDays, setBanDays] = useState(7);
  const [adminNote, setAdminNote] = useState("");
  const requiresBan = ["BAN_USER", "HIDE_AND_BAN", "DELETE_AND_BAN"].includes(action);

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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const toast = useToast();
  const admin = useAdminService();

  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [roleReqs, setRoleReqs] = useState<any[]>([]);
  const [withdraws, setWithdraws] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);

  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    onYes: () => void;
  } | null>(null);
  const [reviewModal, setReviewModal] = useState<{
    title: string;
    onSubmit: (note: string, approved: boolean) => void;
  } | null>(null);
  const [missionModal, setMissionModal] = useState<{
    initial?: any;
    onSubmit: (data: any) => void;
  } | null>(null);
  const [reportResolveModal, setReportResolveModal] = useState<{
    report: any;
  } | null>(null);
  const [reportDetailModal, setReportDetailModal] = useState<{
    report: any;
  } | null>(null);

  const [editRoleRow, setEditRoleRow] = useState<number | null>(null);
  const [editRoles, setEditRoles] = useState<string[]>([]);

  useEffect(() => {
    if (user && !user.roles.includes("ADMIN")) router.push("/homePage");
  }, [user, router]);

  const unwrap = (r: any) => r?.data ?? r ?? [];

  const loadStats = useCallback(async () => {
    try {
      const r: any = await admin.getDashboard();
      const statsData = { ...(r?.data ?? r) };
      if (statsData.pendingRoleRequests == null) {
        try {
          const roleR: any = await admin.getAllRoleRequests();
          const roleList: any[] = roleR?.data ?? roleR ?? [];
          statsData.pendingRoleRequests = Array.isArray(roleList)
            ? roleList.filter((req: any) => req.status === "PENDING").length
            : 0;
        } catch {
          /* keep as undefined */
        }
      }
      setStats(statsData);
    } catch (e: any) {
      toast.error(e?.message ?? "Lỗi tải thống kê");
    }
  }, []);

  const loadTab = useCallback(
    async (t: string) => {
      setLoading(true);
      try {
        if (t === "overview") {
          await loadStats();
        }
        if (t === "users") {
          const r = await admin.getAllUsers();
          setUsers(unwrap(r));
        }
        if (t === "stories") {
          const r = await admin.getPendingStories();
          setStories(unwrap(r));
        }
        if (t === "reports") {
          const r = await admin.getAllReports();
          setReports(unwrap(r));
        }
        if (t === "roles") {
          const r = await admin.getAllRoleRequests();
          setRoleReqs(unwrap(r));
        }
        if (t === "withdraws") {
          const r = await admin.getAllWithdrawRequests();
          setWithdraws(unwrap(r));
        }
        if (t === "missions") {
          const r = await admin.getMissions();
          setMissions(unwrap(r));
        }
      } catch (e: any) {
        toast.error(e?.message ?? "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    },
    [loadStats],
  );

  useEffect(() => {
    loadTab(tab);
  }, [tab]);

  if (!user || !user.roles.includes("ADMIN")) return null;

  const confirm = (message: string, onYes: () => void) =>
    setConfirmDialog({ message, onYes });

  const handleReviewStory = (story: any) => {
    setReviewModal({
      title: `Duyệt truyện: ${story.title}`,
      onSubmit: async (note, approved) => {
        setReviewModal(null);
        try {
          await admin.reviewStory(story.id, {
            status: approved ? "APPROVED" : "REJECTED",
            reviewNote: note,
          });
          toast.success(approved ? "Đã duyệt truyện!" : "Đã từ chối truyện!");
          loadTab("stories");
        } catch (e: any) {
          toast.error(e?.message ?? "Thất bại");
        }
      },
    });
  };

  const handleRoleRequest = async (req: any, approved: boolean) => {
    try {
      await admin.reviewRoleRequest({
        requestId: req.id,
        action: approved ? "APPROVE" : "REJECT",
      });
      toast.success(approved ? "Đã phê duyệt!" : "Đã từ chối!");
      loadTab("roles");
    } catch (e: any) {
      toast.error(e?.message ?? "Thất bại");
    }
  };

  const handleWithdraw = (withdraw: any, approve: boolean) => {
    confirm(
      approve
        ? `Duyệt rút tiền ${withdraw.amount?.toLocaleString()} VND?`
        : "Từ chối yêu cầu rút tiền?",
      async () => {
        setConfirmDialog(null);
        try {
          if (approve) await admin.approveWithdraw(withdraw.id);
          else await admin.rejectWithdraw(withdraw.id);
          toast.success(approve ? "Đã duyệt rút tiền!" : "Đã từ chối!");
          loadTab("withdraws");
        } catch (e: any) {
          toast.error(e?.message ?? "Thất bại");
        }
      },
    );
  };

  const handleSaveRoles = async (userId: number) => {
    try {
      await admin.updateUserRoles(userId, editRoles);
      toast.success("Đã cập nhật role!");
      setEditRoleRow(null);
      loadTab("users");
    } catch (e: any) {
      toast.error(e?.message ?? "Thất bại");
    }
  };

  const handleToggleUserStatus = (u: any) => {
    const isLocking = u.enabled !== false;
    confirm(
      isLocking
        ? `Khóa tài khoản "${u.fullName}"?`
        : `Mở khóa tài khoản "${u.fullName}"?`,
      async () => {
        setConfirmDialog(null);
        try {
          await admin.toggleUserStatus(u.id);
          toast.success(isLocking ? "Đã khóa tài khoản!" : "Đã mở khóa!");
          loadTab("users");
        } catch (e: any) {
          toast.error(e?.message ?? "Thất bại");
        }
      },
    );
  };

  const handleDeleteMission = (m: any) => {
    confirm(`Xóa nhiệm vụ "${m.name ?? m.title}"?`, async () => {
      setConfirmDialog(null);
      try {
        await admin.deleteMission(m.id);
        toast.success("Đã xóa nhiệm vụ!");
        setMissions((prev) => prev.filter((x) => x.id !== m.id));
      } catch (e: any) {
        toast.error(e?.message ?? "Thất bại");
      }
    });
  };

  const handleOpenMissionModal = (initial?: any) => {
    setMissionModal({
      initial,
      onSubmit: async (data: any) => {
        setMissionModal(null);
        try {
          if (initial) await admin.updateMission(initial.id, data);
          else await admin.createMission(data);
          toast.success(initial ? "Đã cập nhật!" : "Đã tạo nhiệm vụ!");
          loadTab("missions");
        } catch (e: any) {
          toast.error(e?.message ?? "Thất bại");
        }
      },
    });
  };

  const ALL_ROLES = ["READER", "AUTHOR", "REVIEWER", "EDITOR", "ADMIN"];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f7f4",
        fontFamily: "inherit",
      }}
    >
      {/* Modals */}
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onYes={confirmDialog.onYes}
          onNo={() => setConfirmDialog(null)}
        />
      )}
      {reviewModal && (
        <ReviewModal
          title={reviewModal.title}
          onSubmit={reviewModal.onSubmit}
          onClose={() => setReviewModal(null)}
        />
      )}
      {missionModal && (
        <MissionModal
          initial={missionModal.initial}
          onSubmit={missionModal.onSubmit}
          onClose={() => setMissionModal(null)}
        />
      )}
      {reportDetailModal && (
        <ReportDetailModal
          report={reportDetailModal.report}
          onResolve={(r) => {
            setReportDetailModal(null);
            setReportResolveModal({ report: r });
          }}
          onClose={() => setReportDetailModal(null)}
        />
      )}
      {reportResolveModal && (
        <ReportResolveModal
          report={reportResolveModal.report}
          onSubmit={async (payload) => {
            const id = reportResolveModal.report.id;
            setReportResolveModal(null);
            try {
              await admin.resolveReport(id, payload);
              toast.success("Đã xử lý báo cáo!");
              loadTab("reports");
            } catch (e: any) {
              toast.error(e?.message ?? "Thất bại");
            }
          }}
          onClose={() => setReportResolveModal(null)}
        />
      )}

      {/* Header */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #ff7043 0%, #ff500a 60%, #e64a19 100%)",
          padding: "28px 32px 0",
          color: "#fff",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 11,
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              🛡
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: -0.5,
                }}
              >
                Admin Dashboard
              </h1>
              <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>
                Quản trị hệ thống · {user.fullName}
              </p>
            </div>
            <button
              onClick={() => loadTab(tab)}
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 8,
                border: "1.5px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Icon.Refresh /> Làm mới
            </button>
          </div>
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 2,
              marginTop: 20,
              overflowX: "auto",
            }}
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "10px 18px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: "8px 8px 0 0",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                  background: tab === t.id ? "#fff" : "transparent",
                  color: tab === t.id ? "#e64a19" : "rgba(255,255,255,0.8)",
                }}
              >
                <t.icon /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 32px" }}>
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: 80,
              color: "#9e8e82",
              fontSize: 15,
            }}
          >
            Đang tải...
          </div>
        )}
        {!loading && tab === "overview" && <OverviewTab stats={stats} />}
        {!loading && tab === "users" && (
          <UsersTab
            users={users}
            editRoleRow={editRoleRow}
            editRoles={editRoles}
            ALL_ROLES={ALL_ROLES}
            onStartEdit={(u: any) => {
              setEditRoleRow(u.id);
              setEditRoles([...u.roles]);
            }}
            onToggleRole={(r: string) =>
              setEditRoles((prev) =>
                prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
              )
            }
            onSave={handleSaveRoles}
            onCancel={() => setEditRoleRow(null)}
            onToggleStatus={handleToggleUserStatus}
          />
        )}
        {!loading && tab === "stories" && (
          <StoriesTab stories={stories} onReview={handleReviewStory} />
        )}
        {!loading && tab === "reports" && (
          <ReportsTab
            reports={reports}
            onResolve={(r) => setReportResolveModal({ report: r })}
            onViewDetail={(r) => setReportDetailModal({ report: r })}
          />
        )}
        {!loading && tab === "roles" && (
          <RoleRequestsTab
            roleReqs={roleReqs}
            onApprove={(r: any) => handleRoleRequest(r, true)}
            onReject={(r: any) => handleRoleRequest(r, false)}
          />
        )}
        {!loading && tab === "withdraws" && (
          <WithdrawsTab
            withdraws={withdraws}
            onApprove={(w: any) => handleWithdraw(w, true)}
            onReject={(w: any) => handleWithdraw(w, false)}
          />
        )}
        {!loading && tab === "missions" && (
          <MissionsTab
            missions={missions}
            onAdd={() => handleOpenMissionModal()}
            onEdit={handleOpenMissionModal}
            onDelete={handleDeleteMission}
          />
        )}
      </div>
    </div>
  );
}

// ─── OverviewTab ──────────────────────────────────────────────────────────────
function OverviewTab({ stats }: { stats: any }) {
  if (!stats)
    return <EmptyState icon="📊" message="Không có dữ liệu thống kê." />;
  const cards = [
    {
      label: "Tổng người dùng",
      value: stats.totalUsers ?? "—",
      icon: "👥",
      bg: "#fff0ea",
      color: "#ff500a",
    },
    {
      label: "Tổng truyện",
      value: stats.totalStories ?? "—",
      icon: "📚",
      bg: "#dbeafe",
      color: "#2563eb",
    },
    {
      label: "Truyện chờ duyệt",
      value: stats.pendingStories ?? "—",
      icon: "⏳",
      bg: "#fef3c7",
      color: "#d97706",
    },
    {
      label: "Báo cáo chờ",
      value: stats.pendingReports ?? "—",
      icon: "🚩",
      bg: "#fee2e2",
      color: "#dc2626",
    },
    {
      label: "Yêu cầu role",
      value: stats.pendingRoleRequests ?? "—",
      icon: "🛡",
      bg: "#d1fae5",
      color: "#059669",
    },
    {
      label: "Yêu cầu rút tiền",
      value: stats.pendingWithdrawRequests ?? "—",
      icon: "💸",
      bg: "#fce7f3",
      color: "#db2777",
    },
    {
      label: "Tổng chapter",
      value: stats.totalChapters ?? "—",
      icon: "📖",
      bg: "#fff0ea",
      color: "#16a34a",
    },
    {
      label: "Tổng báo cáo",
      value: stats.totalReports ?? "—",
      icon: "📋",
      bg: "#f5f3ff",
      color: "#7c3aed",
    },
  ];
  return (
    <div>
      <h2 style={sectionTitle}>📊 Thống kê hệ thống</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: "20px 22px",
              border: "1.5px solid #f0ebe3",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: c.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              {c.icon}
            </div>
            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: c.color,
                  lineHeight: 1,
                }}
              >
                {c.value}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
                {c.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── UsersTab ─────────────────────────────────────────────────────────────────
function UsersTab({
  users,
  editRoleRow,
  editRoles,
  ALL_ROLES,
  onStartEdit,
  onToggleRole,
  onSave,
  onCancel,
  onToggleStatus,
}: any) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const filtered = users.filter((u: any) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q);
    const matchRole =
      roleFilter === "ALL" || (u.roles ?? []).includes(roleFilter);
    return matchSearch && matchRole;
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <h2 style={{ ...sectionTitle, marginBottom: 0 }}>
          👥 Quản lý người dùng ({users.length})
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 9,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
                pointerEvents: "none",
                display: "flex",
              }}
            >
              <Icon.Search />
            </span>
            <input
              placeholder="Tìm theo tên, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                ...inputStyle,
                paddingLeft: 32,
                width: 220,
                fontSize: 13,
              }}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              ...inputStyle,
              width: 140,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <option value="ALL">Tất cả role</option>
            {ALL_ROLES.map((r: string) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon="👥" message="Không tìm thấy người dùng nào." />
      ) : (
        <div style={tableWrap}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: "#f8f7f4" }}>
                {[
                  "ID",
                  "Họ tên",
                  "Email",
                  "Roles",
                  "Số dư",
                  "Trạng thái",
                  "Thao tác",
                ].map((h) => (
                  <th key={h} style={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: any) => (
                <tr
                  key={u.id}
                  style={{ opacity: u.enabled === false ? 0.65 : 1 }}
                >
                  <td style={{ ...td, color: "#9ca3af", fontSize: 13 }}>
                    {u.id}
                  </td>
                  <td style={td}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background:
                            u.enabled === false ? "#f3f4f6" : "#fff0ea",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          color: u.enabled === false ? "#9ca3af" : "#ff500a",
                          flexShrink: 0,
                        }}
                      >
                        {u.fullName?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          {u.fullName}
                        </div>
                        {u.enabled === false && (
                          <div
                            style={{
                              fontSize: 10,
                              color: "#dc2626",
                              fontWeight: 700,
                            }}
                          >
                            Đã khóa
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ ...td, color: "#6b7280", fontSize: 13 }}>
                    {u.email}
                  </td>
                  <td style={td}>
                    {editRoleRow === u.id ? (
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 4 }}
                      >
                        {ALL_ROLES.map((r: string) => (
                          <button
                            key={r}
                            onClick={() => onToggleRole(r)}
                            style={{
                              padding: "2px 8px",
                              borderRadius: 20,
                              border: "1.5px solid",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                              background: editRoles.includes(r)
                                ? "#ff500a"
                                : "#fff",
                              color: editRoles.includes(r) ? "#fff" : "#6b7280",
                              borderColor: editRoles.includes(r)
                                ? "#ff500a"
                                : "#e5e7eb",
                            }}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 4 }}
                      >
                        {(u.roles ?? []).map((r: string) => (
                          <span
                            key={r}
                            style={{
                              padding: "2px 8px",
                              borderRadius: 20,
                              background: "#fff0ea",
                              color: "#ff500a",
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td style={{ ...td, fontSize: 13 }}>
                    {(u.walletBalance ?? 0).toLocaleString()} 🪙
                  </td>
                  <td style={td}>
                    <StatusBadge status={String(u.enabled !== false)} />
                  </td>
                  <td style={td}>
                    {editRoleRow === u.id ? (
                      <div style={{ display: "flex", gap: 5 }}>
                        <ActionBtn color="#ff500a" onClick={() => onSave(u.id)}>
                          <Icon.Check /> Lưu
                        </ActionBtn>
                        <ActionBtn color="#6b7280" onClick={onCancel}>
                          <Icon.X /> Hủy
                        </ActionBtn>
                      </div>
                    ) : (
                      <div
                        style={{ display: "flex", gap: 5, flexWrap: "wrap" }}
                      >
                        <ActionBtn
                          color="#2563eb"
                          onClick={() => onStartEdit(u)}
                        >
                          <Icon.Edit /> Roles
                        </ActionBtn>
                        {!(u.roles ?? []).includes("ADMIN") && (
                          <ActionBtn
                            color={u.enabled !== false ? "#dc2626" : "#059669"}
                            onClick={() => onToggleStatus(u)}
                          >
                            {u.enabled !== false ? (
                              <>
                                <Icon.Lock /> Khóa
                              </>
                            ) : (
                              <>
                                <Icon.Unlock /> Mở khóa
                              </>
                            )}
                          </ActionBtn>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            style={{
              padding: "10px 14px",
              fontSize: 12,
              color: "#9ca3af",
              borderTop: "1px solid #f0ebe3",
            }}
          >
            Hiển thị {filtered.length} / {users.length} người dùng
          </div>
        </div>
      )}
    </div>
  );
}

// ─── StoriesTab ───────────────────────────────────────────────────────────────
function StoriesTab({ stories, onReview }: any) {
  return (
    <div>
      <h2 style={sectionTitle}>📚 Truyện chờ duyệt ({stories.length})</h2>
      {stories.length === 0 ? (
        <EmptyState icon="📚" message="Không có truyện nào chờ duyệt!" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {stories.map((s: any) => (
            <div key={s.id} style={cardStyle}>
              <div
                style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
              >
                {s.coverUrl ? (
                  <img
                    src={s.coverUrl}
                    alt=""
                    style={{
                      width: 64,
                      height: 88,
                      borderRadius: 8,
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 64,
                      height: 88,
                      borderRadius: 8,
                      background: "linear-gradient(135deg, #ff7043, #e64a19)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      flexShrink: 0,
                    }}
                  >
                    📚
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: "#1c1512",
                      marginBottom: 3,
                    }}
                  >
                    {s.title}
                  </div>
                  <div
                    style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}
                  >
                    Tác giả: <strong>{s.authorName}</strong>
                    {(s.totalChapters != null || s.chapterCount != null) && (
                      <span style={{ marginLeft: 10 }}>
                        · 📖{" "}
                        <strong>{s.totalChapters ?? s.chapterCount}</strong>{" "}
                        chương
                      </span>
                    )}
                    <span style={{ marginLeft: 10 }}>
                      ·{" "}
                      {new Date(
                        s.submittedAt ?? s.createdAt,
                      ).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  {s.description && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "#374151",
                        background: "#f8f7f4",
                        borderRadius: 6,
                        padding: "6px 10px",
                        marginBottom: 6,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {s.description}
                    </div>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {(s.categories ?? []).map((c: any) => (
                      <span
                        key={c.id}
                        style={{
                          padding: "2px 8px",
                          background: "#fef3c7",
                          color: "#92400e",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
                <ActionBtn color="#ff500a" onClick={() => onReview(s)}>
                  <Icon.Eye /> Xem & Duyệt
                </ActionBtn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ReportsTab ───────────────────────────────────────────────────────────────
function ReportsTab({ reports, onResolve, onViewDetail }: any) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const filtered =
    statusFilter === "ALL"
      ? reports
      : reports.filter((r: any) => r.status === statusFilter);
  const pendingCount = reports.filter(
    (r: any) => r.status === "PENDING",
  ).length;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <h2 style={{ ...sectionTitle, marginBottom: 0 }}>
          🚩 Báo cáo ({reports.length})
          {pendingCount > 0 && (
            <span
              style={{
                marginLeft: 8,
                fontSize: 11,
                background: "#fee2e2",
                color: "#dc2626",
                borderRadius: 20,
                padding: "2px 8px",
                fontWeight: 700,
                verticalAlign: "middle",
              }}
            >
              {pendingCount} chờ xử lý
            </span>
          )}
        </h2>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { v: "ALL", l: "Tất cả" },
            { v: "PENDING", l: "Chờ xử lý" },
            { v: "RESOLVED", l: "Đã xử lý" },
          ].map((s) => (
            <button
              key={s.v}
              onClick={() => setStatusFilter(s.v)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: "1.5px solid",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                background: statusFilter === s.v ? "#e64a19" : "#fff",
                color: statusFilter === s.v ? "#fff" : "#6b7280",
                borderColor: statusFilter === s.v ? "#e64a19" : "#e5e7eb",
              }}
            >
              {s.l}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon="🎉" message="Không có báo cáo nào!" />
      ) : (
        <div style={tableWrap}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: "#f8f7f4" }}>
                {[
                  "ID",
                  "Người báo cáo",
                  "Đối tượng",
                  "Lý do",
                  "Trạng thái",
                  "Ngày",
                  "Thao tác",
                ].map((h) => (
                  <th key={h} style={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: any) => (
                <tr key={r.id}>
                  <td style={{ ...td, color: "#9ca3af", fontSize: 13 }}>
                    {r.id}
                  </td>
                  <td style={{ ...td, fontSize: 13 }}>{r.reporterName}</td>
                  <td style={td}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#fff",
                        background: TYPE_COLOR[r.targetType] ?? "#6b7280",
                        borderRadius: 4,
                        padding: "2px 7px",
                      }}
                    >
                      {r.targetType}
                    </span>
                    <span
                      style={{ marginLeft: 5, fontSize: 12, color: "#6b7280" }}
                    >
                      #{r.targetId}
                    </span>
                  </td>
                  <td style={{ ...td, maxWidth: 200 }}>
                    <span
                      style={{
                        fontSize: 13,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {r.content}
                    </span>
                  </td>
                  <td style={td}>
                    <StatusBadge status={r.status} />
                  </td>
                  <td
                    style={{
                      ...td,
                      fontSize: 12,
                      color: "#6b7280",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <ActionBtn
                        color="#6b7280"
                        onClick={() => onViewDetail(r)}
                      >
                        <Icon.Eye /> Chi tiết
                      </ActionBtn>
                      {r.status === "PENDING" && (
                        <ActionBtn color="#e64a19" onClick={() => onResolve(r)}>
                          <Icon.Check /> Xử lý
                        </ActionBtn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            style={{
              padding: "10px 14px",
              fontSize: 12,
              color: "#9ca3af",
              borderTop: "1px solid #f0ebe3",
            }}
          >
            Hiển thị {filtered.length} / {reports.length} báo cáo
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RoleRequestsTab ──────────────────────────────────────────────────────────
function RoleRequestsTab({ roleReqs, onApprove, onReject }: any) {
  return (
    <div>
      <h2 style={sectionTitle}>🛡 Yêu cầu thay đổi role ({roleReqs.length})</h2>
      {roleReqs.length === 0 ? (
        <EmptyState icon="✅" message="Không có yêu cầu nào!" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {roleReqs.map((r: any) => {
            const name =
              r.requesterName ??
              r.userName ??
              r.userFullName ??
              r.user?.fullName ??
              "Không rõ";
            return (
              <div key={r.id} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "#fff0ea",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#ff500a",
                        }}
                      >
                        {name[0]?.toUpperCase() ?? "?"}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>
                        {name}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#6b7280",
                        marginBottom: r.reason ? 4 : 0,
                      }}
                    >
                      Yêu cầu role:{" "}
                      <span style={{ fontWeight: 700, color: "#ff500a" }}>
                        {r.requestedRole}
                      </span>
                    </div>
                    {r.reason && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#374151",
                          background: "#f8f7f4",
                          border: "1px solid #e5e7eb",
                          borderRadius: 6,
                          padding: "6px 10px",
                          marginTop: 6,
                          fontStyle: "italic",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            color: "#6b7280",
                            fontStyle: "normal",
                          }}
                        >
                          Lý do:{" "}
                        </span>
                        {r.reason}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 8,
                      flexShrink: 0,
                    }}
                  >
                    <StatusBadge status={r.status} />
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                    {r.status === "PENDING" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <ActionBtn color="#059669" onClick={() => onApprove(r)}>
                          <Icon.Check /> Duyệt
                        </ActionBtn>
                        <ActionBtn color="#dc2626" onClick={() => onReject(r)}>
                          <Icon.X /> Từ chối
                        </ActionBtn>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── WithdrawsTab ─────────────────────────────────────────────────────────────
function WithdrawsTab({ withdraws, onApprove, onReject }: any) {
  return (
    <div>
      <h2 style={sectionTitle}>💸 Yêu cầu rút tiền ({withdraws.length})</h2>
      {withdraws.length === 0 ? (
        <EmptyState icon="💰" message="Không có yêu cầu rút tiền!" />
      ) : (
        <div style={tableWrap}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: "#f8f7f4" }}>
                {[
                  "ID",
                  "Người yêu cầu",
                  "Số tiền",
                  "Ngân hàng",
                  "Số tài khoản",
                  "Trạng thái",
                  "Ngày",
                  "Thao tác",
                ].map((h) => (
                  <th key={h} style={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {withdraws.map((w: any) => (
                <tr key={w.id}>
                  <td style={{ ...td, color: "#9ca3af", fontSize: 13 }}>
                    {w.id}
                  </td>
                  <td style={{ ...td, fontSize: 13 }}>{w.requesterName}</td>
                  <td style={{ ...td, fontWeight: 700, color: "#ff500a" }}>
                    {w.amount?.toLocaleString()} VND
                  </td>
                  <td style={{ ...td, fontSize: 13 }}>{w.bankName}</td>
                  <td style={{ ...td, fontFamily: "monospace", fontSize: 13 }}>
                    {w.bankAccount}
                  </td>
                  <td style={td}>
                    <StatusBadge status={w.status} />
                  </td>
                  <td
                    style={{
                      ...td,
                      fontSize: 12,
                      color: "#9ca3af",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {new Date(w.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td style={td}>
                    {w.status === "PENDING" && (
                      <div style={{ display: "flex", gap: 5 }}>
                        <ActionBtn color="#059669" onClick={() => onApprove(w)}>
                          <Icon.Check />
                        </ActionBtn>
                        <ActionBtn color="#dc2626" onClick={() => onReject(w)}>
                          <Icon.X />
                        </ActionBtn>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── MissionsTab ──────────────────────────────────────────────────────────────
function MissionsTab({ missions, onAdd, onEdit, onDelete }: any) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <h2 style={{ ...sectionTitle, marginBottom: 0 }}>
          🎯 Quản lý nhiệm vụ ({missions.length})
        </h2>
        <button
          onClick={onAdd}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 18px",
            borderRadius: 8,
            border: "none",
            background: "#ff500a",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          <Icon.Plus /> Tạo nhiệm vụ
        </button>
      </div>
      {missions.length === 0 ? (
        <EmptyState icon="🎯" message="Chưa có nhiệm vụ nào. Hãy tạo mới!" />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {missions.map((m: any) => {
            const typeKey = m.type ?? m.missionType;
            const coinVal = m.rewardCoin ?? m.coinReward;
            return (
              <div
                key={m.id}
                style={{
                  ...cardStyle,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#ff500a",
                      background: "#fff0ea",
                      padding: "3px 9px",
                      borderRadius: 20,
                    }}
                  >
                    {MISSION_TYPES[typeKey] ?? typeKey}
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      onClick={() => onEdit(m)}
                      style={iconBtnStyle("#2563eb")}
                      title="Sửa"
                    >
                      <Icon.Edit />
                    </button>
                    <button
                      onClick={() => onDelete(m)}
                      style={iconBtnStyle("#dc2626")}
                      title="Xóa"
                    >
                      <Icon.Trash />
                    </button>
                  </div>
                </div>
                <div
                  style={{ fontWeight: 700, fontSize: 15, color: "#1c1512" }}
                >
                  {m.name ?? m.title ?? "(Không có tên)"}
                </div>
                {m.description && (
                  <div
                    style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}
                  >
                    {m.description}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    fontSize: 13,
                    marginTop: "auto",
                  }}
                >
                  <span>
                    🪙 <strong>{coinVal}</strong> coin
                  </span>
                  {m.requiredCount != null && (
                    <span>
                      ✅ <strong>{m.requiredCount}</strong> lần
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
