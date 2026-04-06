/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import useStoryService from "@/api/useStory.service";
import useChapterService from "@/api/useChapter.service";
import useHttpClient from "@/api/useHttpClient";
import APP_CONFIG from "@/config/app-config";
import { useToast } from "@/hooks/use-toast";

// Types
import { EditRequest, StoryItem, ChapterItem, WalletInfo, WalletTx } from "@/types/myStoriesPage";

// Constants
import { T, btnBase, btnPrimary, btnOutline, btnSuccess, btnWarn, btnPurple, fInput } from "@/utils/myStoriesPage.constants";

// Utils
import { timeAgo } from "@/utils/myStoriesPage.utils";

// Components
import { StatusBadge } from "@/components/myStoriesPage/StatusBadge";
import { EditReqBadge } from "@/components/myStoriesPage/EditReqBadge";
import { StoryFormModal } from "@/components/myStoriesPage/StoryFormModal";
import { ChapterFormModal } from "@/components/myStoriesPage/ChapterFormModal";
import { CreateEditRequestModal } from "@/components/myStoriesPage/CreateEditRequestModal";
import { AuthorReviewEditModal } from "@/components/myStoriesPage/AuthorReviewEditModal";
import { WalletSection } from "@/components/myStoriesPage/WalletSection";
import { ScheduleDateInput } from "@/components/myStoriesPage/ScheduleDateInput";

type Tab = "stories" | "editRequests" | "wallet" | "missions" | "reports";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "stories",      label: "Tác phẩm",        icon: "📖" },
  { id: "editRequests", label: "Yêu cầu biên tập", icon: "🎨" },
  { id: "wallet",       label: "Ví của tôi",       icon: "💰" },
  { id: "missions",     label: "Nhiệm vụ",         icon: "🎯" },
  { id: "reports",      label: "Báo cáo của tôi",  icon: "📢" },
];

export default function MyStoriesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const storyService = useStoryService();
  const chapterService = useChapterService();
  const httpClient = useHttpClient();
  const toast = useToast();

  const [tab, setTab] = useState<Tab>("stories");
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [editRequests, setEditRequests] = useState<EditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [reviewEditModal, setReviewEditModal] = useState<EditRequest | null>(null);
  const [originalContentForReview, setOriginalContentForReview] = useState("");
  const [loadingOriginalReview, setLoadingOriginalReview] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [chaptersMap, setChaptersMap] = useState<Record<number, ChapterItem[]>>({});
  const [chapterTotalMap, setChapterTotalMap] = useState<Record<number, number>>({});
  const [loadingChapters, setLoadingChapters] = useState<Record<number, boolean>>({});
  const [showStoryForm, setShowStoryForm] = useState<StoryItem | null | false>(false);
  const [chapterModal, setChapterModal] = useState<{ storyId: number; chapter?: ChapterItem | null; nextOrder?: number } | null>(null);
  const [deletingChapter, setDeletingChapter] = useState<number | null>(null);
  const [submittingStory, setSubmittingStory] = useState<number | null>(null);
  const [togglingComplete, setTogglingComplete] = useState<number | null>(null);
  const [submittingChapter, setSubmittingChapter] = useState<number | null>(null);
  const [publishingChapter, setPublishingChapter] = useState<number | null>(null);
  const [editRequestModal, setEditRequestModal] = useState<ChapterItem | null>(null);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [walletTxs, setWalletTxs] = useState<WalletTx[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [erFilter, setErFilter] = useState("ALL");
  const [storyFilter, setStoryFilter] = useState("ALL");
  const [storySearch, setStorySearch] = useState("");
  const [storySort, setStorySort] = useState<"newest" | "oldest">("newest");
  const [deletingStory, setDeletingStory] = useState<number | null>(null);
  const [confirmDeleteStory, setConfirmDeleteStory] = useState<{ id: number; title: string } | null>(null);
  const [scheduleModal, setScheduleModal] = useState<{ chapterId: number; title: string; storyId: number } | null>(null);
  const [schedulingChapter, setSchedulingChapter] = useState<number | null>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [streakStatus, setStreakStatus] = useState<{ hasClaimedToday: boolean; currentStreak: number } | null>(null);
  const [loadingMissions, setLoadingMissions] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [claimingMission, setClaimingMission] = useState<number | null>(null);
  const [myReports, setMyReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  /* ── Data loading ── */
  const loadStories = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await storyService.getMyStories({ page: 0, size: 100 });
      const list: StoryItem[] = res?.data?.content ?? res?.data ?? res?.content ?? res ?? [];
      setStories(Array.isArray(list) ? list : []);
    } catch { setStories([]); } finally { setLoading(false); }
  }, [storyService]);

  const loadEditRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const res: any = await httpClient.get(APP_CONFIG.EDIT_REQUEST.MY);
      const list = res?.data?.content ?? res?.data ?? res?.content ?? res ?? [];
      setEditRequests(Array.isArray(list) ? list : []);
    } catch { setEditRequests([]); } finally { setLoadingRequests(false); }
  }, [httpClient]);

  const loadWallet = useCallback(async () => {
    try { const res: any = await httpClient.get(APP_CONFIG.WALLET.GET); setWallet(res?.data ?? res ?? null); } catch { /* ignore */ }
  }, [httpClient]);

  const loadWalletTxs = useCallback(async () => {
    setLoadingTx(true);
    try {
      const res: any = await httpClient.get(APP_CONFIG.WALLET.TRANSACTIONS);
      const list = res?.data?.content ?? res?.data ?? res?.content ?? res ?? [];
      setWalletTxs(Array.isArray(list) ? list : []);
    } catch { setWalletTxs([]); } finally { setLoadingTx(false); }
  }, [httpClient]);

  const loadMissionsAndStreak = async () => {
    setLoadingMissions(true);
    try {
      const [mRes, sRes]: any[] = await Promise.all([httpClient.get(APP_CONFIG.MISSION.MY), httpClient.get(APP_CONFIG.STREAK.STATUS)]);
      setMissions(Array.isArray(mRes?.data) ? mRes.data : Array.isArray(mRes) ? mRes : []);
      setStreakStatus(sRes?.data ?? sRes ?? null);
    } catch { /* silent */ } finally { setLoadingMissions(false); }
  };

  const loadMyReports = async () => {
    setLoadingReports(true);
    try {
      const res: any = await httpClient.get(APP_CONFIG.REPORT.MY);
      setMyReports(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch { /* silent */ } finally { setLoadingReports(false); }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.push("/?login"); return; }
    loadStories(); loadWallet();
  }, [user, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tab === "editRequests" && editRequests.length === 0) loadEditRequests();
    if (tab === "wallet" && walletTxs.length === 0) loadWalletTxs();
    if (tab === "missions") loadMissionsAndStreak();
    if (tab === "reports") loadMyReports();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Chapter helpers ── */
  const loadChapters = async (storyId: number) => {
    setLoadingChapters((p) => ({ ...p, [storyId]: true }));
    try {
      const res: any = await chapterService.getChaptersByStory(storyId, { page: 0, size: 200 });
      const list: ChapterItem[] = res?.data?.content ?? res?.data ?? res?.content ?? res ?? [];
      const total: number = res?.data?.totalElements ?? res?.totalElements ?? (Array.isArray(list) ? list.length : 0);
      setChaptersMap((p) => ({ ...p, [storyId]: Array.isArray(list) ? list : [] }));
      setChapterTotalMap((p) => ({ ...p, [storyId]: total }));
    } catch { setChaptersMap((p) => ({ ...p, [storyId]: [] })); }
    finally { setLoadingChapters((p) => ({ ...p, [storyId]: false })); }
  };

  const toggleExpand = (id: number) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (!chaptersMap[id]) loadChapters(id);
  };

  const getChapterWordCount = (ch: ChapterItem) =>
    ch.wordCount ?? (ch.content ? ch.content.trim().split(/\s+/).filter(Boolean).length : 0);

  /* ── Actions ── */
  const handleDeleteChapter = async (cId: number, sId: number) => {
    if (!window.confirm("Xoá chương này?")) return;
    setDeletingChapter(cId);
    try { await httpClient.delete(APP_CONFIG.CHAPTER.DELETE(cId), {}); toast.success("Đã xoá chương."); loadChapters(sId); }
    catch { toast.error("Không thể xoá chương."); } finally { setDeletingChapter(null); }
  };

  const handleSubmitStory = async (sId: number) => {
    if (!window.confirm("Nộp truyện này để kiểm duyệt?")) return;
    setSubmittingStory(sId);
    try { await httpClient.post(APP_CONFIG.STORY.SUBMIT(sId), {}); toast.success("Truyện đã được gửi lên Reviewer!"); loadStories(); }
    catch { toast.error("Không thể nộp truyện."); } finally { setSubmittingStory(null); }
  };

  const handleSubmitChapter = async (cId: number, sId: number) => {
    if (!window.confirm("Nộp chương này lên Reviewer duyệt?")) return;
    setSubmittingChapter(cId);
    try { await httpClient.post(APP_CONFIG.CHAPTER.SUBMIT(cId), {}); toast.success("Đã nộp chương — chờ kiểm duyệt!"); loadChapters(sId); }
    catch (err: any) { toast.error(err?.response?.data?.message ?? "Không thể nộp chương."); } finally { setSubmittingChapter(null); }
  };

  const handlePublishChapter = async (cId: number, sId: number) => {
    if (!window.confirm("Xuất bản chương này cho độc giả?")) return;
    setPublishingChapter(cId);
    try { await httpClient.post(APP_CONFIG.CHAPTER.PUBLISH(cId), {}); toast.success("Chương đã được phát hành! 🎉"); loadChapters(sId); }
    catch { toast.error("Không thể phát hành chương."); } finally { setPublishingChapter(null); }
  };

  const handleDeleteStory = async (sId: number) => {
    setDeletingStory(sId);
    try { await httpClient.delete(APP_CONFIG.STORY.DELETE(sId), {}); toast.success("Đã xóa truyện."); loadStories(); if (expandedId === sId) setExpandedId(null); }
    catch (err: any) { toast.error(err?.response?.data?.message ?? "Không thể xóa truyện này."); } finally { setDeletingStory(null); }
  };

  const handleToggleComplete = async (sId: number, current: boolean) => {
    setTogglingComplete(sId);
    try {
      await httpClient.patch(APP_CONFIG.STORY.SET_COMPLETION(sId) + `?completed=${!current}`, {});
      setStories((prev) => prev.map((s) => s.id === sId ? { ...s, isCompleted: !current } : s));
      toast.success(current ? "Đã đổi sang Đang viết." : "Đã đánh dấu Hoàn thành! 🎉");
    } catch { toast.error("Không thể cập nhật trạng thái."); } finally { setTogglingComplete(null); }
  };

  const handleScheduleChapter = async (chapterId: number, storyId: number, publishAt: string) => {
    setSchedulingChapter(chapterId);
    try { await httpClient.post(APP_CONFIG.CHAPTER.SCHEDULE(chapterId), { publishAt }); toast.success("Đã hẹn lịch xuất bản chương! ⏰"); setScheduleModal(null); loadChapters(storyId); }
    catch { toast.error("Không thể hẹn lịch xuất bản."); } finally { setSchedulingChapter(null); }
  };

  const handleActionEditReq = async (reqId: number, isApprove: boolean, note: string) => {
    try {
      const ep = isApprove ? APP_CONFIG.EDIT_REQUEST.APPROVE(reqId) : APP_CONFIG.EDIT_REQUEST.REJECT(reqId);
      await httpClient.post(ep, isApprove ? {} : { authorNote: note || undefined });
      toast.success(isApprove ? "Đã duyệt bản chỉnh sửa!" : "Đã từ chối, gửi lại cho Editor!");
      setReviewEditModal(null); loadEditRequests();
      if (isApprove) loadWallet();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Lỗi cập nhật yêu cầu"); }
  };

  const openReviewModal = async (req: EditRequest) => {
    setReviewEditModal(req);
    setOriginalContentForReview("");
    setLoadingOriginalReview(true);
    try {
      const res: any = await httpClient.get(APP_CONFIG.CHAPTER.GET(req.chapterId));
      setOriginalContentForReview(res?.data?.content ?? res?.content ?? "");
    } catch { /* silent */ } finally { setLoadingOriginalReview(false); }
  };

  const handleCancelEditReq = async (reqId: number) => {
    if (!window.confirm("Huỷ yêu cầu? Coin sẽ được hoàn lại.")) return;
    try { await httpClient.delete(APP_CONFIG.EDIT_REQUEST.CANCEL(reqId), {}); toast.success("Đã huỷ yêu cầu!"); loadEditRequests(); loadWallet(); }
    catch (err: any) { toast.error(err?.response?.data?.message || "Không thể huỷ yêu cầu lúc này."); }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const res: any = await httpClient.post(APP_CONFIG.STREAK.CHECK_IN, {});
      const earned = res?.data?.coinEarned ?? res?.coinEarned ?? 0;
      toast.success(`🎉 Điểm danh thành công! Nhận được ${earned.toLocaleString()} xu!`);
      setStreakStatus((prev) => prev ? { ...prev, hasClaimedToday: true, currentStreak: prev.currentStreak + 1 } : prev);
    } catch (err: any) { toast.error(err?.response?.data?.message ?? "Không thể điểm danh."); }
    finally { setCheckingIn(false); }
  };

  const handleClaimMission = async (missionId: number) => {
    setClaimingMission(missionId);
    try {
      await httpClient.post(APP_CONFIG.MISSION.CLAIM(missionId), {});
      toast.success("🎁 Đã nhận thưởng! Xu đã được cộng vào ví.");
      setMissions((prev) => prev.map((m) => m.id === missionId ? { ...m, status: "COMPLETED", canClaim: false, completed: true } : m));
      loadWallet();
    } catch (err: any) { toast.error(err?.response?.data?.message ?? "Không thể nhận phần thưởng."); }
    finally { setClaimingMission(null); }
  };

  /* ── Derived data ── */
  const totalViews = stories.reduce((s, st) => s + (st.viewCount ?? 0), 0);
  const totalChapters = stories.reduce((s, st) => s + (st.totalChapters ?? st.totalChapterCount ?? 0), 0);
  const publishedCount = stories.filter((s) => s.status === "APPROVED").length;

  const filteredStories = stories
    .filter((s) => !s.isDeleted)
    .filter((s) => storyFilter === "ALL" || s.status === storyFilter)
    .filter((s) => !storySearch.trim() || s.title.toLowerCase().includes(storySearch.trim().toLowerCase()))
    .sort((a, b) => storySort === "newest"
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  const filteredEditReqs = erFilter === "ALL" ? editRequests : editRequests.filter((r) => r.status === erFilter);

  if (loading) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", fontSize: 14, color: T.textMuted }}>⏳ Đang tải tác phẩm…</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      {/* ── HEADER ── */}
      <div style={{ background: T.headerGrad, padding: "32px 40px 0", color: "#fff" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>✍️</div>
              <div>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: -0.5, fontFamily: T.fontSerif }}>Tác phẩm của tôi</h1>
                <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>Xin chào, {user?.fullName} — quản lý toàn bộ truyện tại đây</p>
              </div>
            </div>
            <button onClick={() => setShowStoryForm(null)} style={{ ...btnBase, background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: 14, fontWeight: 700, backdropFilter: "blur(4px)", padding: "10px 22px" }}>
              + Tạo tác phẩm mới
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { icon: "📖", label: "Tổng tác phẩm", value: stories.length },
              { icon: "✅", label: "Đã duyệt/xuất bản", value: publishedCount },
              { icon: "👁", label: "Lượt đọc", value: totalViews.toLocaleString() },
              { icon: "📄", label: "Tổng chương", value: totalChapters.toLocaleString() },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.12)" }}>
                <div style={{ fontSize: 20 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{s.value}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 2 }}>
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "12px 18px", borderRadius: "10px 10px 0 0", border: "none", background: tab === t.id ? T.bg : "transparent", color: tab === t.id ? T.accent : "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "28px 40px 80px" }}>

        {/* TAB: STORIES */}
        {tab === "stories" && (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              <input type="text" placeholder="🔍 Tìm theo tên truyện…" value={storySearch} onChange={(e) => setStorySearch(e.target.value)} style={{ ...fInput(), maxWidth: 260, padding: "7px 14px", fontSize: 13 }} />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["ALL", "DRAFT", "PENDING", "APPROVED", "REJECTED"].map((f) => (
                  <button key={f} onClick={() => setStoryFilter(f)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${storyFilter === f ? T.accent : T.border}`, background: storyFilter === f ? T.accentLight : T.card, color: storyFilter === f ? T.accent : T.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {f === "ALL" ? "Tất cả" : f === "DRAFT" ? "Bản nháp" : f === "PENDING" ? "Chờ duyệt" : f === "APPROVED" ? "Đã duyệt" : "Từ chối"}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                {(["newest", "oldest"] as const).map((s) => (
                  <button key={s} onClick={() => setStorySort(s)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${storySort === s ? T.accent : T.border}`, background: storySort === s ? T.accentLight : T.card, color: storySort === s ? T.accent : T.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {s === "newest" ? "🔽 Mới nhất" : "🔼 Cũ nhất"}
                  </button>
                ))}
              </div>
            </div>

            {filteredStories.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 24px", background: T.card, borderRadius: 18, border: `1.5px dashed ${T.border}` }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>Chưa có tác phẩm nào</div>
                <div style={{ fontSize: 14, color: T.textMuted, marginBottom: 20 }}>Bắt đầu sáng tác tác phẩm đầu tiên!</div>
                <button onClick={() => setShowStoryForm(null)} style={btnPrimary}>+ Tạo tác phẩm</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {filteredStories.map((story) => {
                  const isExpanded = expandedId === story.id;
                  const chapters = chaptersMap[story.id] ?? [];
                  const isLoadingCh = loadingChapters[story.id];
                  const allChaptersCount = chapterTotalMap[story.id] ?? story.totalChapters ?? story.totalChapterCount;
                  const totalWords = chapters.reduce((s, ch) => s + getChapterWordCount(ch), 0);
                  const canEdit = story.status !== "PENDING" && story.status !== "APPROVED";

                  return (
                    <div key={story.id} style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: T.shadow }}>
                      <div onClick={() => toggleExpand(story.id)} style={{ padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 16 }}>
                        <div style={{ width: 56, height: 76, borderRadius: 10, background: story.coverUrl ? `url(${story.coverUrl}) center/cover` : T.headerGrad, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22 }}>
                          {!story.coverUrl && "📖"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                            <span style={{ fontFamily: T.fontSerif, fontSize: 16, fontWeight: 700, color: T.text }}>{story.title}</span>
                            <StatusBadge status={story.status} />
                          </div>
                          {(story.summary ?? story.description) && (
                            <div style={{ fontSize: 13, color: T.textSec, marginBottom: 8, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{story.summary ?? story.description}</div>
                          )}
                          {story.status === "REJECTED" && story.reviewNote && (
                            <div style={{ fontSize: 12, color: T.danger, background: T.dangerBg, borderRadius: 8, padding: "6px 10px", marginBottom: 8, border: `1px solid ${T.dangerBorder}` }}>⚠️ Reviewer: {story.reviewNote}</div>
                          )}
                          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: T.textMuted }}>
                            <span>👁 {(story.viewCount ?? 0).toLocaleString()}</span>
                            <span>📄 {allChaptersCount ?? 0} chương</span>
                            {(story.avgRating ?? 0) > 0 && <span>⭐ {Number(story.avgRating).toFixed(1)} ({story.ratingCount ?? 0})</span>}
                            <span>{(story.categoryNames?.join(", ") || story.categories?.map((c) => c.name).join(", ")) || "Chưa phân loại"}</span>
                            <span>{timeAgo(story.createdAt)}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, alignItems: "flex-end" }}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {canEdit && (
                              <button onClick={(e) => { e.stopPropagation(); setShowStoryForm(story); }} style={{ ...btnOutline, fontSize: 11, padding: "5px 10px" }}>✏️ Sửa</button>
                            )}
                            {story.status === "APPROVED" && (
                              <button onClick={(e) => { e.stopPropagation(); handleToggleComplete(story.id, story.isCompleted ?? false); }} disabled={togglingComplete === story.id}
                                style={story.isCompleted ? { ...btnSuccess, fontSize: 11, padding: "5px 10px" } : { ...btnOutline, fontSize: 11, padding: "5px 10px" }}>
                                {togglingComplete === story.id ? "…" : story.isCompleted ? "✅ Hoàn thành" : "📝 Đang viết"}
                              </button>
                            )}
                            {(story.status === "DRAFT" || story.status === "REJECTED") && (
                              <button onClick={(e) => { e.stopPropagation(); handleSubmitStory(story.id); }} disabled={submittingStory === story.id} style={{ ...btnWarn, fontSize: 11, padding: "5px 10px" }}>
                                {submittingStory === story.id ? "…" : "📤 Nộp duyệt"}
                              </button>
                            )}
                            {(story.status === "DRAFT" || story.status === "REJECTED") && (
                              <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteStory({ id: story.id, title: story.title }); }} disabled={deletingStory === story.id} style={{ ...btnOutline, fontSize: 11, padding: "5px 10px", color: T.danger, border: `1.5px solid ${T.dangerBorder}` }}>
                                {deletingStory === story.id ? "…" : "🗑 Xóa"}
                              </button>
                            )}
                          </div>
                          <span style={{ fontSize: 16, color: T.textMuted, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ borderTop: `1.5px solid ${T.borderLight}`, padding: "16px 20px", background: T.bg }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                              Chương ({isLoadingCh ? "…" : (allChaptersCount ?? chapters.length)})
                              {chapters.length > 0 && <span style={{ fontSize: 12, fontWeight: 400, color: T.textMuted, marginLeft: 8 }}>· {totalWords.toLocaleString()} chữ</span>}
                            </div>
                            <button onClick={() => setChapterModal({ storyId: story.id, chapter: null, nextOrder: (chaptersMap[story.id]?.length ?? 0) + 1 })} disabled={story.isCompleted} title={story.isCompleted ? "Truyện đã hoàn thành, không thể thêm chương mới" : undefined} style={{ ...btnPrimary, fontSize: 12, opacity: story.isCompleted ? 0.5 : 1, cursor: story.isCompleted ? "not-allowed" : "pointer" }}>+ Thêm chương</button>
                          </div>
                          {isLoadingCh ? (
                            <div style={{ textAlign: "center", padding: "20px 0", fontSize: 13, color: T.textMuted }}>Đang tải…</div>
                          ) : chapters.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "24px 0", fontSize: 13, color: T.textMuted }}>Chưa có chương nào.</div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {chapters.map((ch) => {
                                const words = getChapterWordCount(ch);
                                const readMins = Math.max(1, Math.ceil(words / 200));
                                return (
                                  <div key={ch.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: T.card, borderRadius: T.radiusSm, border: `1.5px solid ${T.border}` }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 8, background: T.grayBg, color: T.textSec, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ch.chapterOrder}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ch.title}</span>
                                        <StatusBadge status={ch.status} />
                                      </div>
                                      <div style={{ fontSize: 11, color: T.textMuted, display: "flex", gap: 10 }}>
                                        <span>📝 {words.toLocaleString()} chữ</span>
                                        <span>⏱ ~{readMins} phút</span>
                                        {(ch.coinPrice ?? 0) > 0 && <span>🪙 {ch.coinPrice} xu</span>}
                                      </div>
                                      {ch.reviewNote && (ch.status === "DRAFT" || ch.status === "REJECTED") && (
                                        <div style={{ fontSize: 11, color: T.danger, background: T.dangerBg, borderRadius: 6, padding: "3px 8px", marginTop: 4, border: `1px solid ${T.dangerBorder}` }}>⚠️ {ch.reviewNote}</div>
                                      )}
                                    </div>
                                    <div style={{ display: "flex", gap: 5, flexShrink: 0, flexWrap: "wrap" }}>
                                      {(ch.status === "DRAFT" || ch.status === "EDITED" || ch.status === "REJECTED") && (
                                        <button onClick={() => handleSubmitChapter(ch.id, story.id)} disabled={submittingChapter === ch.id} style={{ ...btnWarn, fontSize: 11, padding: "4px 8px" }}>
                                          {submittingChapter === ch.id ? "…" : "📤 Nộp"}
                                        </button>
                                      )}
                                      {ch.status === "APPROVED" && (
                                        <>
                                          <button onClick={() => handlePublishChapter(ch.id, story.id)} disabled={publishingChapter === ch.id} style={{ ...btnSuccess, fontSize: 11, padding: "4px 8px" }}>
                                            {publishingChapter === ch.id ? "…" : "🚀 Phát hành"}
                                          </button>
                                          <button onClick={() => setScheduleModal({ chapterId: ch.id, title: ch.title, storyId: story.id })} style={{ ...btnOutline, fontSize: 11, padding: "4px 8px", color: T.info, borderColor: T.infoBorder }}>📅</button>
                                        </>
                                      )}
                                      {ch.status !== "PUBLISHED" && (
                                        <button onClick={() => setChapterModal({ storyId: story.id, chapter: ch })} style={{ ...btnOutline, fontSize: 11, padding: "4px 8px" }}>✏️</button>
                                      )}
                                      {(ch.status === "DRAFT" || ch.status === "REJECTED") && (
                                        <button onClick={() => handleDeleteChapter(ch.id, story.id)} disabled={deletingChapter === ch.id} style={{ ...btnOutline, fontSize: 11, padding: "4px 8px", color: T.danger }}>
                                          {deletingChapter === ch.id ? "…" : "🗑"}
                                        </button>
                                      )}
                                      {(ch.status === "DRAFT" || ch.status === "EDITED" || ch.status === "PUBLISHED") && (
                                        <button onClick={() => setEditRequestModal(ch)} style={{ ...btnPurple, fontSize: 11, padding: "4px 8px" }}>🎨 Edit</button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* TAB: EDIT REQUESTS */}
        {tab === "editRequests" && (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {["ALL", "OPEN", "IN_PROGRESS", "SUBMITTED", "APPROVED", "CANCELLED"].map((f) => (
                <button key={f} onClick={() => setErFilter(f)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${erFilter === f ? T.accent : T.border}`, background: erFilter === f ? T.accentLight : T.card, color: erFilter === f ? T.accent : T.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  {f === "ALL" ? "Tất cả" : f === "OPEN" ? "Đang chờ" : f === "IN_PROGRESS" ? "Đang làm" : f === "SUBMITTED" ? "Chờ duyệt" : f === "APPROVED" ? "Hoàn thành" : "Đã huỷ"}
                </button>
              ))}
            </div>
            {loadingRequests ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: T.textMuted }}>⏳ Đang tải…</div>
            ) : filteredEditReqs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", background: T.card, borderRadius: 18, border: `1.5px dashed ${T.border}` }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎨</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Chưa có yêu cầu biên tập</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filteredEditReqs.map((req) => (
                  <div key={req.id} style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: "16px 20px", boxShadow: T.shadow }}>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: T.fontSerif, fontSize: 15, fontWeight: 700, color: T.text }}>{req.chapterTitle}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, background: T.warnBg, color: T.warn, padding: "2px 8px", borderRadius: 12, border: `1px solid ${T.warnBorder}` }}>🪙 {req.coinReward} xu</span>
                          <EditReqBadge status={req.status} />
                        </div>
                        <div style={{ fontSize: 12, color: T.textMuted }}>📖 {req.storyTitle} · Editor: <strong>{req.editorName || "Chưa có"}</strong> · {timeAgo(req.createdAt)}{req.attemptCount > 1 && <span style={{ color: T.warn }}> · Lần {req.attemptCount}</span>}</div>
                        {req.description && <div style={{ fontSize: 13, color: T.textSec, marginTop: 6 }}>📋 {req.description}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {req.status === "OPEN" && <button onClick={() => handleCancelEditReq(req.id)} style={btnOutline}>Huỷ yêu cầu</button>}
                        {req.status === "SUBMITTED" && <button onClick={() => openReviewModal(req)} style={btnPrimary}>👁 Duyệt bản chỉnh sửa</button>}
                        {req.status === "APPROVED" && <span style={{ fontSize: 13, color: T.success, fontWeight: 700 }}>✅ Hoàn thành</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: WALLET */}
        {tab === "wallet" && <WalletSection wallet={wallet} transactions={walletTxs} loadingTx={loadingTx} />}

        {/* TAB: REPORTS */}
        {tab === "reports" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {loadingReports ? (
              <div style={{ padding: 40, textAlign: "center", color: T.textMuted }}>⏳ Đang tải…</div>
            ) : myReports.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: T.textMuted }}>📢 Bạn chưa gửi báo cáo vi phạm nào.</div>
            ) : myReports.map((r: any) => {
              const isResolved = r.status === "RESOLVED";
              return (
                <div key={r.id} style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: T.radius, padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 10, padding: "2px 8px", background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe" }}>{r.targetType}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 10, padding: "2px 8px", background: isResolved ? "#dcfce7" : "#fef3c7", color: isResolved ? "#166534" : "#92400e", border: `1px solid ${isResolved ? "#bbf7d0" : "#fde68a"}` }}>
                          {isResolved ? "✅ Đã xử lý" : "⏳ Chờ xử lý"}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: T.text, marginBottom: 4 }}>{r.reason}</div>
                      {r.adminNote && <div style={{ fontSize: 12, color: T.textSec }}>📝 {r.adminNote}</div>}
                    </div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{new Date(r.createdAt).toLocaleDateString("vi-VN")}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB: MISSIONS */}
        {tab === "missions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {loadingMissions ? (
              <div style={{ padding: 40, textAlign: "center", color: T.textMuted }}>⏳ Đang tải nhiệm vụ…</div>
            ) : (
              <>
                <div style={{ background: "linear-gradient(135deg, #ff6600 0%, #ff9900 100%)", borderRadius: T.radius, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, color: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ fontSize: 40 }}>🔥</div>
                    <div>
                      <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{streakStatus?.currentStreak ?? 0} ngày</div>
                      <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>Chuỗi đăng nhập liên tiếp</div>
                    </div>
                  </div>
                  <button onClick={handleCheckIn} disabled={!!streakStatus?.hasClaimedToday || checkingIn}
                    style={{ padding: "10px 24px", borderRadius: T.radiusSm, border: "2px solid rgba(255,255,255,0.5)", background: streakStatus?.hasClaimedToday ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.25)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: streakStatus?.hasClaimedToday ? "default" : "pointer", backdropFilter: "blur(4px)" }}>
                    {checkingIn ? "⏳ Đang điểm danh…" : streakStatus?.hasClaimedToday ? "✅ Đã điểm danh hôm nay" : "🎁 Điểm danh nhận xu"}
                  </button>
                </div>

                <div style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.borderLight}`, fontWeight: 700, fontSize: 14, color: T.text }}>🎯 Nhiệm vụ</div>
                  {missions.length === 0 ? (
                    <div style={{ padding: 24, textAlign: "center", color: T.textMuted }}>Chưa có nhiệm vụ nào.</div>
                  ) : missions.map((m: any) => {
                    const status: string = m.status ?? (m.completed ? "COMPLETED" : "NOT_STARTED");
                    const progress: number = m.progress ?? 0;
                    const target: number = m.targetCount ?? 1;
                    const pct = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;
                    const isCompleted = status === "COMPLETED";
                    const isClaimable = status === "CLAIMABLE";
                    const isInProgress = status === "IN_PROGRESS";
                    const reward = m.rewardCoin ?? m.rewardCoins ?? m.coin ?? 0;
                    const isDaily = (m.type ?? "").toString().toUpperCase().includes("DAILY");
                    return (
                      <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: `1px solid ${T.borderLight}`, opacity: isCompleted ? 0.75 : 1 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{m.title ?? m.name ?? `Nhiệm vụ #${m.id}`}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 7px", background: isDaily ? "#fef3c7" : "#eff6ff", color: isDaily ? "#92400e" : "#1e40af", border: `1px solid ${isDaily ? "#fde68a" : "#bfdbfe"}` }}>
                              {isDaily ? "🔄 Hàng ngày" : "📚 Tích lũy"}
                            </span>
                            {isClaimable && <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 7px", background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" }}>🎁 Sẵn sàng nhận!</span>}
                            {isCompleted && <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 7px", background: T.successBg, color: T.success, border: `1px solid ${T.successBorder}` }}>✅ Đã hoàn thành</span>}
                          </div>
                          {m.description && <div style={{ fontSize: 12, color: T.textSec, marginBottom: 6 }}>{m.description}</div>}
                          {(isInProgress || isClaimable) && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1, height: 8, borderRadius: 999, background: T.grayBg, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${pct}%`, background: isClaimable ? "#22c55e" : T.accent, borderRadius: 999 }} />
                              </div>
                              <span style={{ fontSize: 11, color: T.textMuted, whiteSpace: "nowrap", fontWeight: 600 }}>{progress}/{target}</span>
                            </div>
                          )}
                        </div>
                        {reward > 0 && <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, whiteSpace: "nowrap" }}>🪙 {reward.toLocaleString()}</div>}
                        <div style={{ minWidth: 130, flexShrink: 0 }}>
                          {isCompleted ? (
                            <div style={{ padding: "7px 12px", borderRadius: T.radiusSm, background: T.successBg, color: T.success, fontSize: 12, fontWeight: 700, textAlign: "center", border: `1px solid ${T.successBorder}` }}>✅ Đã hoàn thành</div>
                          ) : isClaimable ? (
                            <button onClick={() => handleClaimMission(m.id)} disabled={claimingMission === m.id}
                              style={{ width: "100%", padding: "7px 12px", borderRadius: T.radiusSm, border: "none", background: claimingMission === m.id ? T.grayBg : "#f97316", color: claimingMission === m.id ? T.textMuted : "#fff", fontSize: 12, fontWeight: 700, cursor: claimingMission === m.id ? "default" : "pointer" }}>
                              {claimingMission === m.id ? "⏳…" : "🪙 Nhận thưởng"}
                            </button>
                          ) : (
                            <div style={{ padding: "7px 12px", borderRadius: T.radiusSm, background: T.grayBg, color: T.textMuted, fontSize: 12, fontWeight: 600, textAlign: "center" }}>
                              {isInProgress ? `${pct}%` : "Chưa bắt đầu"}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      {showStoryForm !== false && <StoryFormModal story={showStoryForm} onClose={() => setShowStoryForm(false)} onSaved={loadStories} />}
      {chapterModal && <ChapterFormModal storyId={chapterModal.storyId} chapter={chapterModal.chapter} nextOrder={chapterModal.nextOrder} onClose={() => setChapterModal(null)} onSaved={() => loadChapters(chapterModal.storyId)} />}
      {editRequestModal && <CreateEditRequestModal chapter={editRequestModal} walletBalance={wallet?.balance ?? 0} onClose={() => setEditRequestModal(null)} onCreated={() => { loadEditRequests(); loadWallet(); }} />}
      {reviewEditModal && <AuthorReviewEditModal request={reviewEditModal} originalContent={loadingOriginalReview ? undefined : originalContentForReview} onClose={() => setReviewEditModal(null)} onAction={handleActionEditReq} />}

      {scheduleModal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setScheduleModal(null); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)" }}>
          <div style={{ background: T.card, borderRadius: 20, width: "100%", maxWidth: 400, padding: "28px 28px 24px", boxShadow: T.shadowMd }}>
            <div style={{ fontFamily: T.fontSerif, fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 6 }}>📅 Hẹn lịch xuất bản</div>
            <div style={{ fontSize: 13, color: T.textSec, marginBottom: 20 }}>{scheduleModal.title}</div>
            <ScheduleDateInput onConfirm={(publishAt) => handleScheduleChapter(scheduleModal.chapterId, scheduleModal.storyId, publishAt)} onClose={() => setScheduleModal(null)} loading={schedulingChapter === scheduleModal.chapterId} />
          </div>
        </div>
      )}

      {confirmDeleteStory && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => !deletingStory && setConfirmDeleteStory(null)}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "32px 28px", maxWidth: 420, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ margin: "0 0 8px", fontFamily: T.fontSerif, fontSize: 20, fontWeight: 800, color: "#1c1512" }}>Xóa truyện này?</h3>
            <p style={{ margin: "0 0 6px", fontSize: 14, color: "#6b5a4e" }}>Bạn sắp xóa vĩnh viễn:</p>
            <p style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700, color: "#1c1512" }}>&ldquo;{confirmDeleteStory.title}&rdquo;</p>
            <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "10px 16px", marginBottom: 24, fontSize: 13, color: "#991b1b" }}>
              ⚠️ Hành động này không thể hoàn tác. Toàn bộ chương sẽ bị xóa.
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button disabled={!!deletingStory} onClick={() => setConfirmDeleteStory(null)} style={{ flex: 1, padding: "11px 20px", borderRadius: 10, border: `1.5px solid ${T.border}`, background: "#fff", color: T.textSec, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Hủy</button>
              <button disabled={!!deletingStory} onClick={async () => { await handleDeleteStory(confirmDeleteStory.id); setConfirmDeleteStory(null); }}
                style={{ flex: 1, padding: "11px 20px", borderRadius: 10, border: "none", background: deletingStory ? "#a0a0a0" : T.danger, color: "#fff", fontSize: 14, fontWeight: 700, cursor: deletingStory ? "not-allowed" : "pointer" }}>
                {deletingStory ? "⏳ Đang xóa..." : "🗑️ Xóa truyện"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
