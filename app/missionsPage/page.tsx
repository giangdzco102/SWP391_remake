"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores";
import useMissionService, { UserMission } from "@/api/useMission.service";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function MissionsPage() {
  const { user } = useAuthStore();
  const { getMyMissions, completeMission } = useMissionService();
  const toast = useToast();
  const router = useRouter();

  const [missions, setMissions] = useState<UserMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("?login");
      return;
    }
    fetchMissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const res = await getMyMissions();
      setMissions(res?.data ?? res ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (mId: number) => {
    setClaimingId(mId);
    try {
      await completeMission(mId);
      toast.success("🏆 Đã nhận thưởng thành công!");
      fetchMissions(); // Refresh status
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể nhận thưởng.");
    } finally {
      setClaimingId(null);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "100px 0", color: "#9e8e82" }}>
      ⏳ Đang tải nhiệm vụ...
    </div>
  );

  return (
    <div className="fade-in" style={{ maxWidth: 800, margin: "40px auto", padding: "0 20px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 900, color: "#1c1512", marginBottom: 8 }}>
          🎯 Nhiệm vụ hàng ngày
        </h1>
        <p style={{ fontSize: 15, color: "#6b5a4e" }}>Hoàn thành nhiệm vụ để nhận thêm Coin!</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {missions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", background: "#fff", borderRadius: 20, border: "1.5px solid #ece6dc", color: "#9e8e82" }}>
            Hiện không có nhiệm vụ nào khả dụng.
          </div>
        ) : (
          missions.map((um) => {
            const m = um.mission;
            const isReady = um.progress >= m.targetCount && !um.completed;
            return (
              <div key={um.id} style={{
                background: "#fff",
                borderRadius: 20,
                border: "1.5px solid #ece6dc",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: 20,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                opacity: um.completed ? 0.7 : 1
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: um.completed ? "#f3f4f6" : "linear-gradient(135deg,#c23d3f,#9e2d2f)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, flexShrink: 0, color: "#fff"
                }}>
                  {m.icon || "🎯"}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1c1512", margin: 0 }}>{m.name}</h3>
                    {um.completed && <span style={{ fontSize: 12, color: "#166534", background: "#dcfce7", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>Đã xong</span>}
                  </div>
                  <p style={{ fontSize: 13, color: "#6b5a4e", marginBottom: 10 }}>{m.description}</p>
                  
                  {/* Progress bar */}
                  {!um.completed && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1, height: 6, background: "#f5ede4", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          width: `${Math.min(100, (um.progress / m.targetCount) * 100)}%`,
                          height: "100%",
                          background: "#c23d3f",
                          transition: "width 0.4s ease"
                        }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#c23d3f", minWidth: 40 }}>
                        {um.progress}/{m.targetCount}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "#b45309", marginBottom: 8 }}>
                    + {m.rewardCoin} 🪙
                  </div>
                  <button
                    disabled={!isReady || claimingId === m.id}
                    onClick={() => handleClaim(m.id)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 12,
                      border: "none",
                      background: um.completed ? "#f3f4f6" : isReady ? "#c23d3f" : "#f5ede4",
                      color: um.completed ? "#9ca3af" : isReady ? "#fff" : "#9e8e82",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: isReady ? "pointer" : "not-allowed",
                      transition: "all 0.2s"
                    }}
                  >
                    {um.completed ? "Đã nhận" : claimingId === m.id ? "⏳..." : "Nhận thưởng"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Benefits info */}
      <div style={{ marginTop: 40, padding: 24, borderRadius: 20, background: "linear-gradient(135deg,#fffbeb,#fef3c7)", border: "1.5px solid #fcd34d" }}>
        <h4 style={{ margin: "0 0 8px 0", color: "#92400e", fontSize: 15, fontWeight: 700 }}>💡 Mẹo nhỏ cho bạn</h4>
        <p style={{ margin: 0, color: "#b45309", fontSize: 13, lineHeight: 1.6 }}>
          Hoàn thành tất cả nhiệm vụ hàng ngày để tích lũy đủ Coin mua các chương VIP hoặc tặng quà cho tác giả yêu thích của bạn nhé!
        </p>
      </div>
    </div>
  );
}
