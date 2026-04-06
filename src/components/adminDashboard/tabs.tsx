/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
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
import useAdminService from "@/api/useAdmin.service";
import { useToast } from "@/hooks/use-toast";
import { formatVNDate, formatVNDateTime } from "@/utils/time";

function PaginationBar({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages: number[] = [];
  const rangeStart = Math.max(1, page - 2);
  const rangeEnd = Math.min(totalPages, page + 2);
  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      <button
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        style={{
          padding: "4px 10px",
          borderRadius: 6,
          border: "1px solid #e5e7eb",
          background: "#fff",
          cursor: page === 1 ? "not-allowed" : "pointer",
          color: page === 1 ? "#9ca3af" : "#374151",
          fontSize: 13,
        }}
      >
        ‹
      </button>
      {rangeStart > 1 && (
        <span style={{ fontSize: 13, color: "#9ca3af" }}>…</span>
      )}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid",
            fontSize: 13,
            fontWeight: p === page ? 700 : 400,
            background: p === page ? "#ff500a" : "#fff",
            color: p === page ? "#fff" : "#374151",
            borderColor: p === page ? "#ff500a" : "#e5e7eb",
            cursor: "pointer",
            minWidth: 32,
          }}
        >
          {p}
        </button>
      ))}
      {rangeEnd < totalPages && (
        <span style={{ fontSize: 13, color: "#9ca3af" }}>…</span>
      )}
      <button
        disabled={page === totalPages}
        onClick={() => onPage(page + 1)}
        style={{
          padding: "4px 10px",
          borderRadius: 6,
          border: "1px solid #e5e7eb",
          background: "#fff",
          cursor: page === totalPages ? "not-allowed" : "pointer",
          color: page === totalPages ? "#9ca3af" : "#374151",
          fontSize: 13,
        }}
      >
        ›
      </button>
    </div>
  );
}

const ROLE_BADGE: Record<string, { bg: string; color: string; icon: string }> =
  {
    AUTHOR: { bg: "#d1fae5", color: "#059669", icon: "✍️" },
    EDITOR: { bg: "#dbeafe", color: "#2563eb", icon: "✏️" },
    REVIEWER: { bg: "#f5f3ff", color: "#7c3aed", icon: "🔍" },
    ADMIN: { bg: "#fff0ea", color: "#ff500a", icon: "🛡" },
    READER: { bg: "#f3f4f6", color: "#6b7280", icon: "📖" },
  };

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

  const revenueCards = [
    {
      label: "Tổng doanh thu (VND)",
      value: `${(stats.totalRevenueVnd ?? 0).toLocaleString("vi-VN")} ₫`,
      icon: "💰",
      bg: "#dcfce7",
      color: "#15803d",
    },
    {
      label: "Đơn nạp coin thành công",
      value: stats.totalPaidOrders ?? "—",
      icon: "🧾",
      bg: "#dbeafe",
      color: "#2563eb",
    },
    {
      label: "Tổng coin đã tiêu",
      value: `${(stats.totalCoinSpend ?? 0).toLocaleString()} 🪙`,
      icon: "💸",
      bg: "#fff7ed",
      color: "#ea580c",
    },
    {
      label: "Hoa hồng hệ thống (20%)",
      value: `${(stats.systemEarningCoin ?? 0).toLocaleString()} 🪙`,
      icon: "🏦",
      bg: "#f5f3ff",
      color: "#7c3aed",
    },
    {
      label: "Tổng lượt mua chương",
      value: (stats.totalChapterPurchases ?? 0).toLocaleString(),
      icon: "📄",
      bg: "#fce7f3",
      color: "#db2777",
    },
    {
      label: "Tỉ lệ hoa hồng hiện tại",
      value: `${((stats.commissionRate ?? 0) * 100).toFixed(0)}%`,
      icon: "⚙️",
      bg: "#fef3c7",
      color: "#d97706",
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

      {/* Revenue / Commission section */}
      <h2 style={{ ...sectionTitle, marginTop: 32 }}>
        💹 Doanh thu &amp; Hoa hồng
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        {revenueCards.map((c) => (
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
                  fontSize: 22,
                  fontWeight: 800,
                  color: c.color,
                  lineHeight: 1.1,
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
  onBan,
  onUnban,
}: any) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [banDialog, setBanDialog] = useState<{
    user: any;
    days: string;
  } | null>(null);
  const PAGE_SIZE = 15;

  const filtered = [...users]
    .filter((u: any) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q);
      const matchRole =
        roleFilter === "ALL" || (u.roles ?? []).includes(roleFilter);
      return matchSearch && matchRole;
    })
    .sort((a: any, b: any) => {
      const da = new Date(a.createdAt ?? 0).getTime() || a.id;
      const db = new Date(b.createdAt ?? 0).getTime() || b.id;
      return sort === "newest" ? db - da : da - db;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const handleRoleFilter = (v: string) => {
    setRoleFilter(v);
    setPage(1);
  };
  const handleSort = (v: "newest" | "oldest") => {
    setSort(v);
    setPage(1);
  };

  return (
    <div>
      {banDialog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 28,
              width: 340,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
              🔒 Cấm người dùng
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
              Cấm <strong>{banDialog.user.fullName}</strong> trong bao nhiêu
              ngày?
              <br />
              <span style={{ fontSize: 12, color: "#9ca3af" }}>
                Nhập -1 để cấm vĩnh viễn.
              </span>
            </div>
            <input
              type="number"
              value={banDialog.days}
              onChange={(e) =>
                setBanDialog((d) => (d ? { ...d, days: e.target.value } : null))
              }
              style={{
                ...inputStyle,
                width: "100%",
                marginBottom: 16,
                fontSize: 15,
                textAlign: "center",
              }}
              min={-1}
              placeholder="Số ngày (ví dụ: 7)"
            />
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => setBanDialog(null)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#6b7280",
                }}
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  const days = parseInt(banDialog.days);
                  if (isNaN(days)) return;
                  onBan(banDialog.user, days);
                  setBanDialog(null);
                }}
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: "#dc2626",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Xác nhận cấm
              </button>
            </div>
          </div>
        </div>
      )}
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
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
              onChange={(e) => handleSearch(e.target.value)}
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
            onChange={(e) => handleRoleFilter(e.target.value)}
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
          <div
            style={{
              display: "flex",
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid #e5e7eb",
            }}
          >
            {(["newest", "oldest"] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleSort(s)}
                style={{
                  padding: "7px 14px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  background: sort === s ? "#ff500a" : "#fff",
                  color: sort === s ? "#fff" : "#6b7280",
                }}
              >
                {s === "newest" ? "Mới nhất" : "Cũ nhất"}
              </button>
            ))}
          </div>
        </div>
      </div>
      {paged.length === 0 ? (
        <EmptyState icon="👥" message="Không tìm thấy người dùng nào." />
      ) : (
        <div style={tableWrap}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: "#f8f7f4" }}>
                {(Array.isArray([
                  "ID",
                  "Họ tên",
                  "Email",
                  "Roles",
                  "Số dư",
                  "Trạng thái",
                  "Thao tác",
                ])
                  ? [
                      "ID",
                      "Họ tên",
                      "Email",
                      "Roles",
                      "Số dư",
                      "Trạng thái",
                      "Thao tác",
                    ]
                  : []
                ).map((h) => (
                  <th key={h} style={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((u: any) => (
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
                        {(Array.isArray(ALL_ROLES) ? ALL_ROLES : []).map(
                          (r: string) => (
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
                                color: editRoles.includes(r)
                                  ? "#fff"
                                  : "#6b7280",
                                borderColor: editRoles.includes(r)
                                  ? "#ff500a"
                                  : "#e5e7eb",
                              }}
                            >
                              {r}
                            </button>
                          ),
                        )}
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
                          <>
                            {u.banUntil == null && (
                              <ActionBtn
                                color="#92400e"
                                onClick={() =>
                                  setBanDialog({ user: u, days: "7" })
                                }
                              >
                                🔒 Cấm
                              </ActionBtn>
                            )}

                            {u.banUntil !== null && (
                              <ActionBtn
                                color="#7c3aed"
                                onClick={() => onUnban(u)}
                              >
                                🔓 Bỏ cấm
                              </ActionBtn>
                            )}
                          </>
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
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderTop: "1px solid #f0ebe3",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              Hiển thị {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}{" "}
              người dùng
            </span>
            <PaginationBar
              page={page}
              totalPages={totalPages}
              onPage={setPage}
            />
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
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const pendingCount = reports.filter(
    (r: any) => r.status === "PENDING",
  ).length;

  const filtered = [...reports]
    .filter((r: any) => {
      const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.reporterName?.toLowerCase().includes(q) ||
        String(r.targetId ?? "").includes(q) ||
        r.content?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    })
    .sort((a: any, b: any) => {
      const da = new Date(a.createdAt ?? 0).getTime();
      const db = new Date(b.createdAt ?? 0).getTime();
      return sort === "newest" ? db - da : da - db;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const handleStatus = (v: string) => {
    setStatusFilter(v);
    setPage(1);
  };
  const handleSort = (v: "newest" | "oldest") => {
    setSort(v);
    setPage(1);
  };

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
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
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
              placeholder="Tìm người báo cáo, nội dung..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                ...inputStyle,
                paddingLeft: 32,
                width: 220,
                fontSize: 13,
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { v: "ALL", l: "Tất cả" },
              { v: "PENDING", l: "Chờ xử lý" },
              { v: "RESOLVED", l: "Đã xử lý" },
            ].map((s) => (
              <button
                key={s.v}
                onClick={() => handleStatus(s.v)}
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
          <div
            style={{
              display: "flex",
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid #e5e7eb",
            }}
          >
            {(["newest", "oldest"] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleSort(s)}
                style={{
                  padding: "7px 14px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  background: sort === s ? "#e64a19" : "#fff",
                  color: sort === s ? "#fff" : "#6b7280",
                }}
              >
                {s === "newest" ? "Mới nhất" : "Cũ nhất"}
              </button>
            ))}
          </div>
        </div>
      </div>
      {paged.length === 0 ? (
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
              {paged.map((r: any) => (
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
                    {formatVNDate(r.createdAt)}
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
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderTop: "1px solid #f0ebe3",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              Hiển thị {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}{" "}
              báo cáo
            </span>
            <PaginationBar
              page={page}
              totalPages={totalPages}
              onPage={setPage}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function RoleRequestsTab({ roleReqs, onApprove, onReject }: any) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const pendingCount = roleReqs.filter(
    (r: any) => r.status === "PENDING",
  ).length;

  const filtered = [...roleReqs]
    .filter((r: any) => {
      const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
      const name =
        r.requesterName ??
        r.userName ??
        r.userFullName ??
        r.user?.fullName ??
        "";
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        name.toLowerCase().includes(q) ||
        r.requestedRole?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    })
    .sort((a: any, b: any) => {
      const da = new Date(a.createdAt ?? 0).getTime();
      const db = new Date(b.createdAt ?? 0).getTime();
      return sort === "newest" ? db - da : da - db;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const handleStatus = (v: string) => {
    setStatusFilter(v);
    setPage(1);
  };
  const handleSort = (v: "newest" | "oldest") => {
    setSort(v);
    setPage(1);
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ ...sectionTitle, marginBottom: 2 }}>
            🛡 Yêu cầu thay đổi Role
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>
            {roleReqs.length} yêu cầu tổng •{" "}
            {pendingCount > 0 ? (
              <span style={{ color: "#d97706", fontWeight: 600 }}>
                {pendingCount} đang chờ duyệt
              </span>
            ) : (
              <span style={{ color: "#059669" }}>Không có yêu cầu chờ</span>
            )}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
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
              placeholder="Tìm theo tên, role..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                ...inputStyle,
                paddingLeft: 32,
                width: 200,
                fontSize: 13,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid #e5e7eb",
            }}
          >
            {(["newest", "oldest"] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleSort(s)}
                style={{
                  padding: "7px 14px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  background: sort === s ? "#7c3aed" : "#fff",
                  color: sort === s ? "#fff" : "#6b7280",
                }}
              >
                {s === "newest" ? "Mới nhất" : "Cũ nhất"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div
        style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}
      >
        {[
          {
            v: "ALL",
            l: "Tất cả",
            count: roleReqs.length,
            color: "#6b7280",
            bg: "#f3f4f6",
          },
          {
            v: "PENDING",
            l: "Chờ duyệt",
            count: roleReqs.filter((r: any) => r.status === "PENDING").length,
            color: "#d97706",
            bg: "#fef3c7",
          },
          {
            v: "APPROVED",
            l: "Đã duyệt",
            count: roleReqs.filter((r: any) => r.status === "APPROVED").length,
            color: "#059669",
            bg: "#d1fae5",
          },
          {
            v: "REJECTED",
            l: "Từ chối",
            count: roleReqs.filter((r: any) => r.status === "REJECTED").length,
            color: "#dc2626",
            bg: "#fee2e2",
          },
        ].map((s) => (
          <button
            key={s.v}
            onClick={() => handleStatus(s.v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              borderRadius: 20,
              border: "1.5px solid",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              background: statusFilter === s.v ? s.color : "#fff",
              color: statusFilter === s.v ? "#fff" : s.color,
              borderColor: statusFilter === s.v ? s.color : "#e5e7eb",
              transition: "all 0.15s",
            }}
          >
            {s.l}
            <span
              style={{
                fontSize: 11,
                background:
                  statusFilter === s.v ? "rgba(255,255,255,0.25)" : s.bg,
                color: statusFilter === s.v ? "#fff" : s.color,
                borderRadius: 20,
                padding: "1px 7px",
                fontWeight: 700,
              }}
            >
              {s.count}
            </span>
          </button>
        ))}
      </div>

      {paged.length === 0 ? (
        <EmptyState icon="✅" message="Không có yêu cầu nào!" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {paged.map((r: any) => {
            const name =
              r.requesterName ??
              r.userName ??
              r.userFullName ??
              r.user?.fullName ??
              "Không rõ";
            const roleBadge = ROLE_BADGE[r.requestedRole] ?? {
              bg: "#f3f4f6",
              color: "#6b7280",
              icon: "❓",
            };
            const statusConfig: Record<
              string,
              { bg: string; color: string; label: string }
            > = {
              PENDING: { bg: "#fef3c7", color: "#d97706", label: "Chờ duyệt" },
              APPROVED: { bg: "#d1fae5", color: "#059669", label: "Đã duyệt" },
              REJECTED: { bg: "#fee2e2", color: "#dc2626", label: "Từ chối" },
            };
            const stConf = statusConfig[r.status] ?? {
              bg: "#f3f4f6",
              color: "#6b7280",
              label: r.status,
            };
            return (
              <div
                key={r.id}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1.5px solid #f0ebe3",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: roleBadge.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 800,
                    color: roleBadge.color,
                    flexShrink: 0,
                    border: `2px solid ${roleBadge.color}33`,
                  }}
                >
                  {name[0]?.toUpperCase() ?? "?"}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: "#1c1512",
                      }}
                    >
                      {name}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "3px 10px",
                        borderRadius: 20,
                        background: roleBadge.bg,
                        color: roleBadge.color,
                        fontSize: 12,
                        fontWeight: 700,
                        border: `1px solid ${roleBadge.color}33`,
                      }}
                    >
                      {roleBadge.icon} {r.requestedRole}
                    </span>
                  </div>
                  {r.reason && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "#374151",
                        background: "#f8f7f4",
                        borderRadius: 8,
                        padding: "6px 12px",
                        borderLeft: `3px solid ${roleBadge.color}`,
                        maxWidth: 480,
                        fontStyle: "italic",
                      }}
                    >
                      &quot;{r.reason}&quot;
                    </div>
                  )}
                </div>
                {/* Meta + Actions */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 8,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: 20,
                      background: stConf.bg,
                      color: stConf.color,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {stConf.label}
                  </span>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>
                    {formatVNDate(r.createdAt)}
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
            );
          })}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 4px",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              Hiển thị {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}{" "}
              yêu cầu
            </span>
            <PaginationBar
              page={page}
              totalPages={totalPages}
              onPage={setPage}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function WithdrawsTab({ withdraws, onApprove, onReject }: any) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const filtered = [...withdraws]
    .filter((w: any) => {
      const matchStatus = statusFilter === "ALL" || w.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        w.requesterName?.toLowerCase().includes(q) ||
        w.bankName?.toLowerCase().includes(q) ||
        w.bankAccount?.includes(q);
      return matchStatus && matchSearch;
    })
    .sort((a: any, b: any) => {
      const da = new Date(a.createdAt ?? 0).getTime();
      const db = new Date(b.createdAt ?? 0).getTime();
      return sort === "newest" ? db - da : da - db;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const handleStatus = (v: string) => {
    setStatusFilter(v);
    setPage(1);
  };
  const handleSort = (v: "newest" | "oldest") => {
    setSort(v);
    setPage(1);
  };

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
          💸 Yêu cầu rút tiền ({withdraws.length})
        </h2>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
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
              placeholder="Tìm tên, ngân hàng..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                ...inputStyle,
                paddingLeft: 32,
                width: 200,
                fontSize: 13,
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { v: "ALL", l: "Tất cả" },
              { v: "PENDING", l: "Chờ duyệt" },
              { v: "APPROVED", l: "Đã duyệt" },
              { v: "REJECTED", l: "Từ chối" },
            ].map((s) => (
              <button
                key={s.v}
                onClick={() => handleStatus(s.v)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: "1.5px solid",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  background: statusFilter === s.v ? "#db2777" : "#fff",
                  color: statusFilter === s.v ? "#fff" : "#6b7280",
                  borderColor: statusFilter === s.v ? "#db2777" : "#e5e7eb",
                }}
              >
                {s.l}
              </button>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid #e5e7eb",
            }}
          >
            {(["newest", "oldest"] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleSort(s)}
                style={{
                  padding: "7px 14px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  background: sort === s ? "#db2777" : "#fff",
                  color: sort === s ? "#fff" : "#6b7280",
                }}
              >
                {s === "newest" ? "Mới nhất" : "Cũ nhất"}
              </button>
            ))}
          </div>
        </div>
      </div>
      {paged.length === 0 ? (
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
                    {formatVNDate(w.createdAt)}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderTop: "1px solid #f0ebe3",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              Hiển thị {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}{" "}
              yêu cầu
            </span>
            <PaginationBar
              page={page}
              totalPages={totalPages}
              onPage={setPage}
            />
          </div>
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
  dashboardStats,
  alerts,
  jobHistory,
  onRunStatsJob,
  onRunSettlementJob,
  onAcknowledgeAlert,
}: any) {
  const admin = useAdminService();
  const [logSeverity, setLogSeverity] = useState("");
  const [logComponent, setLogComponent] = useState("");
  const [logPage, setLogPage] = useState(0);
  const [logData, setLogData] = useState<any>(null);
  const [logLoading, setLogLoading] = useState(false);

  useEffect(() => {
    setLogLoading(true);
    admin
      .getSystemLogs({
        severity: logSeverity || undefined,
        component: logComponent || undefined,
        page: logPage,
        size: 20,
      })
      .then((res: any) => setLogData(res?.data ?? res))
      .catch(() => {})
      .finally(() => setLogLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logSeverity, logComponent, logPage]);

  const logs: any[] =
    logData?.content ?? (Array.isArray(logData) ? logData : []);
  const totalLogPages: number = logData?.totalPages ?? 1;

  const errRate = Number(stats?.paymentErrorRate ?? 0);
  const errColor =
    errRate > 5 ? "#dc2626" : errRate > 1 ? "#d97706" : "#059669";
  const errBg = errRate > 5 ? "#fee2e2" : errRate > 1 ? "#fef3c7" : "#d1fae5";
  const errBorder =
    errRate > 5 ? "#fecaca" : errRate > 1 ? "#fde68a" : "#a7f3d0";

  const getLastRun = (name: string) =>
    (jobHistory ?? [])
      .filter((j: any) => j.jobName === name)
      .sort(
        (a: any, b: any) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      )[0] ?? null;

  const jobStatusColor = (s: string) =>
    s === "SUCCESS"
      ? "#059669"
      : s === "FAILED"
        ? "#dc2626"
        : s === "RUNNING"
          ? "#d97706"
          : "#6b7280";

  return (
    <div>
      <h2 style={{ ...sectionTitle, marginBottom: 20 }}>
        ⚙️ Vận hành hệ thống
      </h2>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "16px 20px",
            borderRadius: 12,
            border: "1.5px solid #f0ebe3",
          }}
        >
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
            DAU/MAU Ratio
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#2563eb" }}>
            {stats?.dauMauRatio != null
              ? `${parseFloat(stats.dauMauRatio).toFixed(4)}%`
              : "0.0000%"}
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            padding: "16px 20px",
            borderRadius: 12,
            border: "1.5px solid #f0ebe3",
          }}
        >
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>
            📅 Doanh thu 7 ngày gần nhất
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6 }}>
            Chỉ tính trong 7 ngày qua
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#059669" }}>
            +{(stats?.revenue7d ?? 0).toLocaleString()} VND
          </div>
        </div>
        <div
          style={{
            background: "#dcfce7",
            padding: "16px 20px",
            borderRadius: 12,
            border: "1.5px solid #a7f3d0",
          }}
        >
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>
            💰 Tổng doanh thu (toàn thời gian)
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6 }}>
            Tích lũy từ PayOS — bao gồm cả 7 ngày trên
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#15803d" }}>
            {(dashboardStats?.totalRevenueVnd ?? 0).toLocaleString("vi-VN")} ₫
          </div>
        </div>
        <div
          style={{
            background: "#f5f3ff",
            padding: "16px 20px",
            borderRadius: 12,
            border: "1.5px solid #ddd6fe",
          }}
        >
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
            Hoa hồng HT · Lượt mua chương
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#7c3aed" }}>
            {(dashboardStats?.systemEarningCoin ?? 0).toLocaleString()} 🪙
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "#9ca3af",
                marginLeft: 8,
              }}
            >
              ({(dashboardStats?.totalChapterPurchases ?? 0).toLocaleString()}{" "}
              lượt · {((dashboardStats?.commissionRate ?? 0) * 100).toFixed(0)}
              %)
            </span>
          </div>
        </div>
        <div
          style={{
            background: errBg,
            padding: "16px 20px",
            borderRadius: 12,
            border: `1.5px solid ${errBorder}`,
          }}
        >
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
            Lỗi thanh toán
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: errColor }}>
            {(errRate * 100).toFixed(2)}%
          </div>
          {errRate > 5 && (
            <div style={{ fontSize: 11, color: errColor, marginTop: 4 }}>
              ⚠ Vượt ngưỡng báo động!
            </div>
          )}
          {errRate > 1 && errRate <= 5 && (
            <div style={{ fontSize: 11, color: errColor, marginTop: 4 }}>
              ⚡ Cần theo dõi
            </div>
          )}
        </div>
      </div>

      {/* Batch Jobs */}
      <div style={{ marginBottom: 24 }}>
        <h3
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#1c1512",
            marginBottom: 12,
          }}
        >
          🚀 Batch Jobs
        </h3>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          {[
            {
              name: "StatsAggregator",
              label: "Stats Aggregator",
              icon: "📊",
              color: "#2563eb",
              bg: "#dbeafe",
              onClick: onRunStatsJob,
            },
            {
              name: "MonthlySettlementCalculator",
              label: "Monthly Settlement",
              icon: "💳",
              color: "#d97706",
              bg: "#fef3c7",
              onClick: onRunSettlementJob,
            },
          ].map((job) => {
            const last = getLastRun(job.name);
            return (
              <div
                key={job.name}
                style={{
                  background: "#fff",
                  padding: "16px 20px",
                  borderRadius: 12,
                  border: "1.5px solid #f0ebe3",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span style={{ fontSize: 20 }}>{job.icon}</span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#1c1512",
                      }}
                    >
                      {job.label}
                    </span>
                  </div>
                  <button
                    onClick={job.onClick}
                    style={{
                      padding: "6px 14px",
                      background: job.bg,
                      color: job.color,
                      border: "none",
                      borderRadius: 7,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    ▶ Chạy
                  </button>
                </div>
                {last ? (
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: jobStatusColor(last.status),
                      }}
                    >
                      {last.status}
                    </span>
                    {" · "}
                    {formatVNDateTime(last.startedAt)}
                    {last.durationMs != null &&
                      ` · ${(last.durationMs / 1000).toFixed(1)}s`}
                    {last.note && (
                      <div
                        style={{
                          marginTop: 4,
                          color: "#9ca3af",
                          fontStyle: "italic",
                        }}
                      >
                        {last.note}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>
                    Chưa có lịch sử chạy
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts */}
      {(alerts?.length ?? 0) > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#1c1512",
              marginBottom: 10,
            }}
          >
            ⚠️ Cảnh báo hệ thống
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {alerts.map((a: any, i: number) => {
              const sv =
                a.severity === "CRITICAL"
                  ? {
                      bg: "#fef2f2",
                      border: "#fecaca",
                      txt: "#991b1b",
                      badge: "#dc2626",
                    }
                  : a.severity === "WARNING"
                    ? {
                        bg: "#fffbeb",
                        border: "#fde68a",
                        txt: "#92400e",
                        badge: "#d97706",
                      }
                    : {
                        bg: "#eff6ff",
                        border: "#bfdbfe",
                        txt: "#1e40af",
                        badge: "#3b82f6",
                      };
              return (
                <div
                  key={i}
                  style={{
                    background: sv.bg,
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: `1px solid ${sv.border}`,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: 4,
                        color: "#fff",
                        background: sv.badge,
                        marginRight: 8,
                      }}
                    >
                      {a.severity ?? "INFO"}
                    </span>
                    <span
                      style={{ fontSize: 13, fontWeight: 600, color: sv.txt }}
                    >
                      {a.message}
                    </span>
                    {a.source && (
                      <div
                        style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}
                      >
                        Nguồn: {a.source}
                      </div>
                    )}
                    {a.isAcknowledged && (
                      <div
                        style={{ fontSize: 11, color: "#059669", marginTop: 3 }}
                      >
                        ✓ Đã xử lý bởi {a.acknowledgedBy}
                      </div>
                    )}
                  </div>
                  {!a.isAcknowledged && (
                    <button
                      onClick={() => onAcknowledgeAlert?.(a.id)}
                      style={{
                        padding: "4px 10px",
                        background: "#fff",
                        border: "1px solid #d1d5db",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#374151",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      ✓ Xử lý
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Logs */}
      <div>
        <h3
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#1c1512",
            marginBottom: 10,
          }}
        >
          📜 Server Logs
        </h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["", "DEBUG", "INFO", "WARN", "ERROR"].map((sev) => (
              <button
                key={sev}
                onClick={() => {
                  setLogSeverity(sev);
                  setLogPage(0);
                }}
                style={{
                  padding: "5px 12px",
                  borderRadius: 20,
                  border: "1.5px solid",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  background:
                    logSeverity === sev
                      ? sev === "ERROR"
                        ? "#dc2626"
                        : sev === "WARN"
                          ? "#d97706"
                          : sev === "INFO"
                            ? "#2563eb"
                            : sev === "DEBUG"
                              ? "#6b7280"
                              : "#ff500a"
                      : "#fff",
                  color: logSeverity === sev ? "#fff" : "#6b7280",
                  borderColor: logSeverity === sev ? "transparent" : "#e5e7eb",
                }}
              >
                {sev || "Tất cả"}
              </button>
            ))}
          </div>
          <input
            placeholder="Lọc theo component..."
            value={logComponent}
            onChange={(e) => {
              setLogComponent(e.target.value);
              setLogPage(0);
            }}
            style={{
              ...inputStyle,
              width: 200,
              padding: "6px 12px",
              fontSize: 13,
            }}
          />
        </div>
        {logLoading ? (
          <div style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>
            Đang tải logs...
          </div>
        ) : (
          <>
            <div style={tableWrap}>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: "#f8f7f4" }}>
                    <th style={th}>Thời gian</th>
                    <th style={th}>Mức độ</th>
                    <th style={th}>Thành phần</th>
                    <th style={th}>Nội dung</th>
                    <th style={th}>Trace ID</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          ...td,
                          textAlign: "center",
                          color: "#9ca3af",
                          padding: "32px 0",
                        }}
                      >
                        Không có log
                      </td>
                    </tr>
                  ) : (
                    logs.map((l: any, i: number) => (
                      <tr key={l.id ?? i}>
                        <td
                          style={{
                            ...td,
                            fontSize: 12,
                            color: "#6b7280",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {l.timestamp ? formatVNDateTime(l.timestamp) : "—"}
                        </td>
                        <td style={td}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              padding: "2px 6px",
                              borderRadius: 4,
                              color: "#fff",
                              background:
                                l.severity === "ERROR"
                                  ? "#dc2626"
                                  : l.severity === "WARN"
                                    ? "#d97706"
                                    : l.severity === "INFO"
                                      ? "#2563eb"
                                      : "#6b7280",
                            }}
                          >
                            {l.severity}
                          </span>
                        </td>
                        <td style={{ ...td, fontSize: 13, fontWeight: 600 }}>
                          {l.component}
                        </td>
                        <td style={{ ...td, fontSize: 13, color: "#374151" }}>
                          {l.message}
                        </td>
                        <td
                          style={{
                            ...td,
                            fontSize: 11,
                            color: "#9ca3af",
                            fontFamily: "monospace",
                          }}
                        >
                          {l.traceId ?? "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 12,
              }}
            >
              <span style={{ fontSize: 12, color: "#9ca3af" }}>
                Trang {logPage + 1} / {totalLogPages}
              </span>
              <PaginationBar
                page={logPage + 1}
                totalPages={totalLogPages}
                onPage={(p) => setLogPage(p - 1)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function CoinMonitoringTab({ stats, onSetTab }: any) {
  const admin = useAdminService();
  const toast = useToast();

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustUserId, setAdjustUserId] = useState("");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);

  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [bTitle, setBTitle] = useState("");
  const [bMessage, setBMessage] = useState("");
  const [bRole, setBRole] = useState("ALL");
  const [bLoading, setBLoading] = useState(false);

  // totalSpendToday từ backend đã là số âm → cộng thẳng
  const netFlow =
    (stats?.totalDepositToday ?? 0) + (stats?.totalSpendToday ?? 0);

  const handleAdjust = async () => {
    const uid = parseInt(adjustUserId);
    const amt = parseInt(adjustAmount);
    if (isNaN(uid) || uid <= 0 || isNaN(amt) || !adjustReason.trim()) {
      toast.warning("Vui lòng nhập đầy đủ thông tin hợp lệ!");
      return;
    }
    setAdjustLoading(true);
    try {
      await admin.adjustUserCoin(uid, { amount: amt, reason: adjustReason });
      toast.success(
        `Đã điều chỉnh ${amt > 0 ? "+" : ""}${amt} coin cho user #${uid}!`,
      );
      setAdjustOpen(false);
      setAdjustUserId("");
      setAdjustAmount("");
      setAdjustReason("");
    } catch (e: any) {
      toast.error(e?.message ?? "Điều chỉnh coin thất bại!");
    } finally {
      setAdjustLoading(false);
    }
  };

  const handleBroadcast = async () => {
    if (!bTitle.trim() || !bMessage.trim()) {
      toast.warning("Vui lòng nhập tiêu đề và nội dung!");
      return;
    }
    setBLoading(true);
    try {
      const res: any = await admin.broadcastNotification({
        title: bTitle,
        message: bMessage,
        targetRole: bRole,
      });
      const sentTo = res?.data?.sentTo ?? res?.sentTo ?? "?";
      toast.success(`Đã gửi thông báo tới ${sentTo} người dùng!`);
      setBroadcastOpen(false);
      setBTitle("");
      setBMessage("");
      setBRole("ALL");
    } catch (e: any) {
      toast.error(e?.message ?? "Gửi thông báo thất bại!");
    } finally {
      setBLoading(false);
    }
  };

  const kpis = [
    {
      label: "Coin nạp hôm nay",
      value: `+${(stats?.totalDepositToday ?? 0).toLocaleString()} 🪙`,
      color: "#059669",
      bg: "#d1fae5",
      border: "#a7f3d0",
    },
    {
      label: "Coin tiêu hôm nay",
      value: `${(stats?.totalSpendToday ?? 0).toLocaleString()} 🪙`,
      color: "#ff500a",
      bg: "#fff7ed",
      border: "#fed7aa",
    },
    {
      label: "Coin rút được duyệt HN",
      value: `${(stats?.totalWithdrawApprovedToday ?? 0).toLocaleString()} 🪙`,
      color: "#7c3aed",
      bg: "#f5f3ff",
      border: "#ddd6fe",
    },
    {
      label: "Nợ nền tảng (VND)",
      value: `${(stats?.pendingWithdrawAmountVnd ?? 0).toLocaleString()} ₫`,
      color: "#dc2626",
      bg: "#fef2f2",
      border: "#fecaca",
    },
    {
      label: "Coin lưu thông toàn hệ thống",
      value: `${(stats?.totalCoinInCirculation ?? 0).toLocaleString()} 🪙`,
      color: "#2563eb",
      bg: "#dbeafe",
      border: "#bfdbfe",
    },
    {
      label: "Yêu cầu rút đang chờ",
      value: `${stats?.pendingWithdrawCount ?? 0} request`,
      color: "#d97706",
      bg: "#fef3c7",
      border: "#fde68a",
    },
  ];

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const panelStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 14,
    padding: "28px 32px",
    width: 420,
    maxWidth: "95vw",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2 style={{ ...sectionTitle, marginBottom: 0 }}>
          💰 Giám sát hệ thống Coin
        </h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setAdjustOpen(true)}
            style={{
              padding: "8px 16px",
              background: "#dbeafe",
              color: "#1d4ed8",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            🔧 Điều chỉnh Coin
          </button>
          <button
            onClick={() => setBroadcastOpen(true)}
            style={{
              padding: "8px 16px",
              background: "#fef3c7",
              color: "#92400e",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            📢 Broadcast thông báo
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {kpis.map((k) => (
          <div
            key={k.label}
            style={{
              background: k.bg,
              padding: "16px 20px",
              borderRadius: 12,
              border: `1.5px solid ${k.border}`,
            }}
          >
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
              {k.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Net Flow */}
      <div
        style={{
          background: "#fff",
          padding: "16px 20px",
          borderRadius: 12,
          border: "1.5px solid #f0ebe3",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#1c1512",
            marginBottom: 6,
          }}
        >
          📈 Net Flow hôm nay
        </div>

        {/* Phần con số tổng: Tự động đổi màu Xanh nếu dương, Đỏ nếu âm */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: netFlow >= 0 ? "#059669" : "#dc2626",
          }}
        >
          {netFlow > 0 ? "+" : ""}
          {netFlow.toLocaleString()} 🪙
        </div>

        {/* Phần giải thích: totalSpendToday là số âm nên dùng Math.abs để hiện dễ đọc */}
        <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
          Nạp − Tiêu = {(stats?.totalDepositToday ?? 0).toLocaleString()} −{" "}
          {Math.abs(stats?.totalSpendToday ?? 0).toLocaleString()}
        </div>
      </div>

      {/* Pending Withdraws Link */}
      {(stats?.pendingWithdrawCount ?? 0) > 0 && (
        <div
          style={{
            background: "#fffbeb",
            border: "1.5px solid #fde68a",
            borderRadius: 12,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#92400e" }}>
              ⏳ {stats?.pendingWithdrawCount} yêu cầu rút tiền đang chờ duyệt
            </div>
            <div style={{ fontSize: 12, color: "#a16207", marginTop: 3 }}>
              Tổng:{" "}
              {(
                stats?.pendingWithdrawAmountVnd ??
                stats?.pendingWithdrawAmount ??
                0
              ).toLocaleString()}{" "}
              VND
            </div>
          </div>
          <button
            onClick={() => onSetTab?.("withdraws")}
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
            → Xem tab Rút tiền
          </button>
        </div>
      )}

      {/* Adjust Coin Modal */}
      {adjustOpen && (
        <div style={overlayStyle} onClick={() => setAdjustOpen(false)}>
          <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
            <h3
              style={{
                margin: "0 0 20px",
                fontSize: 17,
                fontWeight: 800,
                color: "#1c1512",
              }}
            >
              🔧 Điều chỉnh Coin thủ công
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  User ID *
                </label>
                <input
                  value={adjustUserId}
                  onChange={(e) => setAdjustUserId(e.target.value)}
                  placeholder="Nhập ID người dùng"
                  type="number"
                  style={{ ...inputStyle, width: "100%" }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Số coin *{" "}
                  <span style={{ fontWeight: 400, color: "#9ca3af" }}>
                    (dương = cộng, âm = trừ)
                  </span>
                </label>
                <input
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="VD: 500 hoặc -100"
                  type="number"
                  style={{ ...inputStyle, width: "100%" }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Lý do *
                </label>
                <textarea
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="VD: Bồi thường lỗi payment #12345"
                  rows={3}
                  style={{
                    ...inputStyle,
                    width: "100%",
                    resize: "vertical" as const,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                  marginTop: 4,
                }}
              >
                <button
                  onClick={() => setAdjustOpen(false)}
                  style={{
                    padding: "9px 18px",
                    background: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleAdjust}
                  disabled={adjustLoading}
                  style={{
                    padding: "9px 18px",
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: "pointer",
                    opacity: adjustLoading ? 0.7 : 1,
                  }}
                >
                  {adjustLoading ? "Đang xử lý..." : "✓ Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {broadcastOpen && (
        <div style={overlayStyle} onClick={() => setBroadcastOpen(false)}>
          <div
            style={{ ...panelStyle, width: 480 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: "0 0 20px",
                fontSize: 17,
                fontWeight: 800,
                color: "#1c1512",
              }}
            >
              📢 Gửi thông báo toàn hệ thống
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Đối tượng nhận
                </label>
                <select
                  value={bRole}
                  onChange={(e) => setBRole(e.target.value)}
                  style={{ ...inputStyle, width: "100%" }}
                >
                  {["ALL", "READER", "AUTHOR", "EDITOR", "REVIEWER"].map(
                    (r) => (
                      <option key={r} value={r}>
                        {r === "ALL" ? "Tất cả người dùng" : r}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Tiêu đề *
                </label>
                <input
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                  placeholder="VD: Thông báo bảo trì hệ thống"
                  style={{ ...inputStyle, width: "100%" }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Nội dung *
                </label>
                <textarea
                  value={bMessage}
                  onChange={(e) => setBMessage(e.target.value)}
                  placeholder="Nhập nội dung thông báo..."
                  rows={4}
                  style={{
                    ...inputStyle,
                    width: "100%",
                    resize: "vertical" as const,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                  marginTop: 4,
                }}
              >
                <button
                  onClick={() => setBroadcastOpen(false)}
                  style={{
                    padding: "9px 18px",
                    background: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleBroadcast}
                  disabled={bLoading}
                  style={{
                    padding: "9px 18px",
                    background: "#d97706",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: "pointer",
                    opacity: bLoading ? 0.7 : 1,
                  }}
                >
                  {bLoading ? "Đang gửi..." : "📤 Gửi ngay"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
