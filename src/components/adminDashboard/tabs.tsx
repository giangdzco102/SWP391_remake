/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { AdminIcon } from "../icons/AdminIcons";
import {
  sectionTitle,
  tableWrap,
  tableStyle,
  th,
  td,
  cardStyle,
  iconBtnStyle,
  inputStyle,
} from "./adminStyles";
import { EmptyState, ActionBtn, StatusBadge } from "./ui";
import { TYPE_COLOR, TYPE_LABEL, MISSION_TYPES } from "@/utils/adminConstants";

export function OverviewTab({ stats }: { stats: any }) {
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

export function UsersTab({
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
              <AdminIcon.Search />
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
            {(Array.isArray(ALL_ROLES) ? ALL_ROLES : []).map((r: string) => (
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
                {(Array.isArray(["ID", "Họ tên", "Email", "Roles", "Số dư", "Trạng thái", "Thao tác"]) ? ["ID", "Họ tên", "Email", "Roles", "Số dư", "Trạng thái", "Thao tác"] : []).map((h) => (
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
                        {(Array.isArray(ALL_ROLES) ? ALL_ROLES : []).map((r: string) => (
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
                          <AdminIcon.Check /> Lưu
                        </ActionBtn>
                        <ActionBtn color="#6b7280" onClick={onCancel}>
                          <AdminIcon.X /> Hủy
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
                          <AdminIcon.Edit /> Roles
                        </ActionBtn>
                        {!(u.roles ?? []).includes("ADMIN") && (
                          <ActionBtn
                            color={u.enabled !== false ? "#dc2626" : "#059669"}
                            onClick={() => onToggleStatus(u)}
                          >
                            {u.enabled !== false ? (
                              <>
                                <AdminIcon.Lock /> Khóa
                              </>
                            ) : (
                              <>
                                <AdminIcon.Unlock /> Mở khóa
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

export function StoriesTab({ stories, onReview }: any) {
  return (
    <div>
      <h2 style={sectionTitle}>📚 Truyện chờ duyệt ({stories.length})</h2>
      {stories.length === 0 ? (
        <EmptyState icon="📚" message="Không có truyện nào chờ duyệt!" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(Array.isArray(stories) ? stories : []).map((s: any) => (
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
                  <AdminIcon.Eye /> Xem & Duyệt
                </ActionBtn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ReportsTab({ reports, onResolve, onViewDetail }: any) {
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
                        <AdminIcon.Eye /> Chi tiết
                      </ActionBtn>
                      {r.status === "PENDING" && (
                        <ActionBtn color="#e64a19" onClick={() => onResolve(r)}>
                          <AdminIcon.Check /> Xử lý
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

export function RoleRequestsTab({ roleReqs, onApprove, onReject }: any) {
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
                          <AdminIcon.Check /> Duyệt
                        </ActionBtn>
                        <ActionBtn color="#dc2626" onClick={() => onReject(r)}>
                          <AdminIcon.X /> Từ chối
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

export function WithdrawsTab({ withdraws, onApprove, onReject }: any) {
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
              {(Array.isArray(withdraws) ? withdraws : []).map((w: any) => (
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
                          <AdminIcon.Check />
                        </ActionBtn>
                        <ActionBtn color="#dc2626" onClick={() => onReject(w)}>
                          <AdminIcon.X />
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

export function MissionsTab({ missions, onAdd, onEdit, onDelete }: any) {
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
          <AdminIcon.Plus /> Tạo nhiệm vụ
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
          {(Array.isArray(missions) ? missions : []).map((m: any) => {
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
                      <AdminIcon.Edit />
                    </button>
                    <button
                      onClick={() => onDelete(m)}
                      style={iconBtnStyle("#dc2626")}
                      title="Xóa"
                    >
                      <AdminIcon.Trash />
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

export function SystemOpsTab({
  stats,
  logs,
  alerts,
  onRunJob,
}: any) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ ...sectionTitle, marginBottom: 0 }}>⚙️ Vận hành hệ thống</h2>
        <button
          onClick={onRunJob}
          style={{
            padding: "8px 16px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          🚀 Chạy StatsAggregator (Batch)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "DAU/MAU Ratio", v: stats?.dauMauRatio ?? "0.0%", c: "#2563eb", bg: "#dbeafe" },
          { label: "Doanh thu (7 ngày)", v: (stats?.revenue7d ?? 0).toLocaleString() + " VND", c: "#059669", bg: "#d1fae5" },
          { label: "Lỗi thanh toán", v: (stats?.paymentErrorRate ?? 0) + "%", c: "#dc2626", bg: "#fee2e2" },
        ].map(k => (
          <div key={k.label} style={{ background: "#fff", padding: "16px 20px", borderRadius: 12, border: "1.5px solid #f0ebe3" }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.c }}>{k.v}</div>
          </div>
        ))}
      </div>

      {alerts?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#dc2626", marginBottom: 10 }}>⚠️ Cảnh báo bất thường</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(Array.isArray(alerts) ? alerts : []).map((a: any, i: number) => (
              <div key={i} style={{ background: "#fef2f2", padding: "10px 14px", borderRadius: 8, border: "1px solid #fee2e2", color: "#991b1b", fontSize: 13, fontWeight: 600 }}>
                • {a.message}
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1c1512", marginBottom: 10 }}>📜 Server Logs (Severity)</h3>
      <div style={tableWrap}>
        <table style={tableStyle}>
          <thead>
            <tr style={{ background: "#f8f7f4" }}>
              <th style={th}>Thời gian</th>
              <th style={th}>Mức độ</th>
              <th style={th}>Thành phần</th>
              <th style={th}>Nội dung</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(logs) ? logs : []).map((l: any, i: number) => (
              <tr key={i}>
                <td style={{ ...td, fontSize: 12, color: "#6b7280" }}>{l.timestamp ? new Date(l.timestamp).toLocaleString("vi-VN") : "—"}</td>
                <td style={td}>
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 4, color: "#fff",
                    background: l.severity === "ERROR" ? "#dc2626" : l.severity === "WARN" ? "#d97706" : "#6b7280"
                  }}>
                    {l.severity}
                  </span>
                </td>
                <td style={{ ...td, fontSize: 13, fontWeight: 600 }}>{l.component}</td>
                <td style={{ ...td, fontSize: 13, color: "#374151" }}>{l.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CoinMonitoringTab({
  stats,
  withdraws,
  onApprove,
  onReject,
  onRunJob,
}: any) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ ...sectionTitle, marginBottom: 0 }}>💰 Giám sát hệ thống Coin</h2>
        <button
          onClick={onRunJob}
          style={{
            padding: "8px 16px",
            background: "#d97706",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          💳 Chạy MonthlySettlement (Batch)
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        <div style={{ background: "#fff", padding: "20px", borderRadius: 14, border: "1.5px solid #f0ebe3" }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Tổng nạp hôm nay</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#059669" }}>+ {(stats?.totalDepositToday ?? 0).toLocaleString()} VND</div>
        </div>
        <div style={{ background: "#fff", padding: "20px", borderRadius: 14, border: "1.5px solid #f0ebe3" }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Tổng tiêu coin hôm nay</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#ff500a" }}>{(stats?.totalSpendToday ?? 0).toLocaleString()} 🪙</div>
        </div>
      </div>

      <WithdrawsTab withdraws={withdraws} onApprove={onApprove} onReject={onReject} />
    </div>
  );
}
