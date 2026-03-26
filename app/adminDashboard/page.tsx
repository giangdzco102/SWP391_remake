/* eslint-disable @next/next/no-img-element */
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import useAdminService from "@/api/useAdmin.service";
import { useToast } from "@/hooks/use-toast";

import { AdminIcon } from "@/components/icons/AdminIcons";
import { TABS, ALL_ROLES } from "@/utils/adminConstants";
import {
  ConfirmDialog,
  ReviewModal,
  MissionModal,
  ReportDetailModal,
  ReportResolveModal,
} from "@/components/modals/AdminModals";
import {
  OverviewTab,
  UsersTab,
  StoriesTab,
  ReportsTab,
  RoleRequestsTab,
  WithdrawsTab,
  MissionsTab,
  SystemOpsTab,
  CoinMonitoringTab,
} from "@/components/adminDashboard/tabs";

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
  const [systemStats, setSystemStats] = useState<any>(null);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [jobHistory, setJobHistory] = useState<any[]>([]);
  const [coinStatsDaily, setCoinStatsDaily] = useState<any>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        if (t === "system-ops") {
          const [s, a, jh] = await Promise.all([
            admin.getSystemStats(),
            admin.getSystemAlerts(),
            admin.getJobHistory(),
          ]);
          setSystemStats(unwrap(s));
          setSystemAlerts(unwrap(a));
          setJobHistory(unwrap(jh));
        }
        if (t === "coins") {
          const cs = await admin.getCoinStatsDaily();
          setCoinStatsDaily(unwrap(cs));
        }
      } catch (e: any) {
        toast.error(e?.message ?? "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadStats],
  );

  useEffect(() => {
    loadTab(tab);
  }, [tab, loadTab]);

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

  const handleBanUser = (u: any, banDays: number) => {
    const label = banDays === -1 ? "vĩnh viễn" : `${banDays} ngày`;
    confirm(
      `Cấm tài khoản "${u.fullName}" trong ${label}?`,
      async () => {
        setConfirmDialog(null);
        try {
          await admin.banUser(u.id, banDays);
          toast.success(`Đã cấm tài khoản ${label}!`);
          loadTab("users");
        } catch (e: any) {
          toast.error(e?.message ?? "Thất bại");
        }
      },
    );
  };

  const handleUnbanUser = (u: any) => {
    confirm(
      `Bỏ cấm tài khoản "${u.fullName}"?`,
      async () => {
        setConfirmDialog(null);
        try {
          await admin.unbanUser(u.id);
          toast.success("Đã bỏ cấm tài khoản!");
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

  const handleAcknowledgeAlert = async (alertId: number | string) => {
    try {
      await admin.acknowledgeAlert(alertId);
      toast.success("Đã đánh dấu xử lý cảnh báo!");
      loadTab("system-ops");
    } catch (e: any) {
      toast.error(e?.message ?? "Thất bại");
    }
  };

  const handleRunStatsJob = async () => {
    try {
      await admin.runStatsJob();
      toast.success("Đã kích hoạt StatsAggregator!");
      loadTab("system-ops");
    } catch (e: any) {
      toast.error(e?.message ?? "Thất bại");
    }
  };

  const handleRunSettlementJob = async () => {
    try {
      await admin.runSettlementJob();
      toast.success("Đã kích hoạt MonthlySettlementCalculator!");
      loadTab("system-ops");
    } catch (e: any) {
      toast.error(e?.message ?? "Thất bại");
    }
  };

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
          onResolve={(r: any) => {
            setReportDetailModal(null);
            setReportResolveModal({ report: r });
          }}
          onClose={() => setReportDetailModal(null)}
        />
      )}
      {reportResolveModal && (
        <ReportResolveModal
          report={reportResolveModal.report}
          onSubmit={async (payload: any) => {
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
              <AdminIcon.Refresh /> Làm mới
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
            onBan={handleBanUser}
            onUnban={handleUnbanUser}
          />
        )}
        {!loading && tab === "stories" && (
          <StoriesTab stories={stories} onReview={handleReviewStory} />
        )}
        {!loading && tab === "reports" && (
          <ReportsTab
            reports={reports}
            onResolve={(r: any) => setReportResolveModal({ report: r })}
            onViewDetail={(r: any) => setReportDetailModal({ report: r })}
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
        {!loading && tab === "system-ops" && (
          <SystemOpsTab
            stats={systemStats}
            dashboardStats={stats}
            alerts={systemAlerts}
            jobHistory={jobHistory}
            onRunStatsJob={handleRunStatsJob}
            onRunSettlementJob={handleRunSettlementJob}
            onAcknowledgeAlert={handleAcknowledgeAlert}
          />
        )}
        {!loading && tab === "coins" && (
          <CoinMonitoringTab
            stats={coinStatsDaily}
            onSetTab={setTab}
          />
        )}
      </div>
    </div>
  );
}
