/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SettingsModal,
  BecomeAuthorModal,
  BecomeReviewerModal,
  BecomeEditorModal,
} from "./modals/SettingsModal";
import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

import { Toast } from "./ui";
import {
  MOCK_STORIES,
  MOCK_CHAPTERS,
  CHAPTER_TEXTS,
  MOCK_REVIEWS,
  MOCK_PENDING,
  MOCK_EDITOR_TASKS,
  MOCK_NOTIFICATIONS,
  COIN_TRANSACTIONS,
} from "../utils/mockData";
import { RankingsPage } from "./pages/RankingsPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { StoryDetailPage } from "./pages/StoryDetailPage";
import { ReaderPage } from "./pages/ReaderPage";
import { ProfilePage } from "../../app/profilePage/page";
import { NotificationsPage } from "./pages/NotificationsPage";
import { CoinShopPage } from "./pages/CoinShopPage";
import { MyStoriesPage } from "./pages/MyStoriesPage";
import { ReviewerDashboard } from "./pages/ReviewerDashboard";
import { EditorDashboard } from "./pages/EditorDashboard";
import { SearchResultsPage } from "./pages/SearchResultsPage";
import { SubmitStoryModal } from "./modals/SubmitStoryModal";
import { AddChapterModal } from "./modals/AddChapterModal";
import { RejectModal } from "./modals/RejectModal";
import { useAuthStore } from "@/stores";

export function StoryPlatform() {
  const router = useRouter();
  const [page, setPage] = useState("home");
  const { user } = useAuthStore();
  const [modal, setModal] = useState<any>(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);
  // Data state
  const [stories, setStories] = useState(MOCK_STORIES);
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [likedStories, setLikedStories] = useState([]);
  const [activeGenre, setActiveGenre] = useState("all");
  const [fontSize, setFontSize] = useState(18);
  const [readProgress, setReadProgress] = useState({});
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [coinTxs, setCoinTxs] = useState(COIN_TRANSACTIONS);
  const [unlockedChapters, setUnlockedChapters] = useState(new Set());
  // Reviewer state
  const [pending, setPending] = useState(MOCK_PENDING);
  const [dashTab, setDashTab] = useState("pending");
  const [reviewNotes, setReviewNotes] = useState({});
  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [rejectTarget, setRejectTarget] = useState(null);
  // Editor state
  const [editorTasks, setEditorTasks] = useState(MOCK_EDITOR_TASKS);
  const [editorTab, setEditorTab] = useState("open");
  // My stories chapters
  const [myChapters, setMyChapters] = useState({});
  // Search
  const [searchQ, setSearchQ] = useState("");
  const unreadCount = notifications.filter((n) => !n.read).length;
  const show = useCallback((msg, type = "info") => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ msg, type });
    toastRef.current = setTimeout(() => setToast(null), 3200);
  }, []);
  const gotoStory = (story) => {
    setSelectedStory(story);
    setPage("story");
    window.scrollTo(0, 0);
  };
  const gotoRead = (chIdx = 0) => {
    setSelectedChapter(chIdx);
    setPage("read");
    window.scrollTo(0, 0);
  };
  const openModal = (m: any) => {
    if (!user) router.push("?login");
    else setModal(m);
  };
  const closeModal = () => setModal(null);
  const requireAuth = (cb: any) => {
    if (!user) {
      router.push("?login");
      return;
    }
    cb();
  };
  const navTo = (p) => {
    setPage(p);
    window.scrollTo(0, 0);
  };
  // Like toggle
  toggleLike: (id, showFn) =>
    set((state) => {
      const isLiked = state.likedStories.includes(id);
      showFn?.(
        isLiked ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích ❤",
        isLiked ? "info" : "success",
      );
      return {
        likedStories: isLiked
          ? state.likedStories.filter((x) => x !== id)
          : [...state.likedStories, id],
      };
    });
  // Reviewer actions
  const handleApprove = (id) => {
    const item = pending.find((p) => p.id === id);
    if (!item) return;
    setApproved((a) => [
      ...a,
      { ...item, approvedAt: new Date().toLocaleDateString("vi-VN") },
    ]);
    setPending((p) => p.filter((x) => x.id !== id));
    setStories((s) => [
      {
        id: item.id,
        title: item.title,
        author: item.author,
        penName: item.penName,
        cover: item.cover,
        genre: item.genre,
        tags: [item.genre],
        rating: 0,
        reviewCount: 0,
        reads: "0",
        views: 0,
        favorites: 0,
        chapters: item.chapters,
        description: item.excerpt,
        status: "ongoing",
        featured: false,
        excerpt: item.excerpt,
      },
      ...s,
    ]);
    if (user)
      setUser((u) =>
        u
          ? {
              ...u,
              coins: (u.coins || 0) + 20,
              stats: { ...u.stats, coins_earned: u.stats.coins_earned + 20 },
            }
          : u,
      );
    setNotifications((n) => [
      {
        id: Date.now(),
        type: "coin",
        title: "Nhận coin thưởng",
        body: `+20🪙 cho duyệt "${item.title}"`,
        time: "Vừa xong",
        read: false,
      },
      ...n,
    ]);
    show(`✓ Đã duyệt "${item.title}" — +20🪙 coin!`, "success");
  };
  const handleReject = (id) => {
    setRejectTarget(id);
    openModal("reject");
  };
  const confirmReject = (note) => {
    const item = pending.find((p) => p.id === rejectTarget);
    if (item) {
      setRejected((r) => [
        ...r,
        { ...item, note, rejectedAt: new Date().toLocaleDateString("vi-VN") },
      ]);
      setPending((p) => p.filter((x) => x.id !== rejectTarget));
      if (user)
        setUser((u) =>
          u
            ? {
                ...u,
                coins: (u.coins || 0) + 10,
                stats: { ...u.stats, coins_earned: u.stats.coins_earned + 10 },
              }
            : u,
        );
      show(`Từ chối "${item.title}" — +10🪙 coin`, "info");
    }
    setRejectTarget(null);
    closeModal();
  };
  // Editor actions
  const claimTask = (id) => {
    if (!user) return;
    setEditorTasks((t) =>
      t.map((x) =>
        x.id === id
          ? { ...x, status: "claimed", claimedBy: (user as any).fullName }
          : x,
      ),
    );
    const task = editorTasks.find((t) => t.id === id);
    show(`Đã nhận nhiệm vụ — hoàn thành để nhận ${task?.reward}🪙`, "success");
  };
  const completeTask = (id) => {
    const task = editorTasks.find((t) => t.id === id);
    setEditorTasks((t) =>
      t.map((x) =>
        x.id === id
          ? {
              ...x,
              status: "done",
              completedAt: new Date().toLocaleDateString("vi-VN"),
            }
          : x,
      ),
    );
    if (user && task) {
      setUser((u) =>
        u
          ? {
              ...u,
              coins: (u.coins || 0) + task.reward,
              stats: {
                ...u.stats,
                coins_earned: u.stats.coins_earned + task.reward,
              },
            }
          : u,
      );
      setNotifications((n) => [
        {
          id: Date.now(),
          type: "coin",
          title: "Nhận coin thưởng",
          body: `+${task.reward}🪙 hoàn thành: "${task.title}"`,
          time: "Vừa xong",
          read: false,
        },
        ...n,
      ]);
    }
    show(`🎉 Hoàn thành! Nhận ${task?.reward}🪙 coin!`, "success");
  };
  // Submit story
  const unlockChapter = (chapterId: any, price: any) => {
    if (!user) {
      router.push("?login");
      return;
    }
    // if (user.coins < price) {
    //   show("Số dư xu không đủ! Hãy nạp thêm coin.", "error");
    //   return;
    // }
    setUnlockedChapters((s) => new Set([...s, chapterId]));
    setCoinTxs((txs) => [
      {
        id: Date.now(),
        type: "spend",
        amount: price,
        reason: "Mở khóa chương VIP",
        date: new Date().toLocaleDateString("vi-VN"),
      },
      ...txs,
    ]);
    show(`🔓 Mở khóa thành công! Trừ ${price}🪙 từ ví.`, "success");
  };
  const submitStory = (data) => {
    setPending((p) => [
      {
        id: Date.now(),
        title: data.title,
        author: (user as any).fullName,
        penName: (user as any).penName || "Bút danh",
        genre: data.genre,
        submitted: new Date().toLocaleDateString("vi-VN"),
        cover: `linear-gradient(145deg,hsl(${Math.random() * 360},60%,40%),hsl(${Math.random() * 360},50%,55%))`,
        excerpt: data.excerpt,
        chapters: 1,
        words: data.content.split(" ").length,
        content: data.content,
      },
      ...p,
    ]);
    closeModal();
    show("Tác phẩm đã gửi — đang chờ Reviewer kiểm duyệt", "success");
  };
  // Add chapter
  const addChapter = (storyId, data) => {
    const newCh = {
      id: Date.now(),
      title: data.title,
      words: data.content.split(" ").length,
      readTime: `${Math.ceil(data.content.split(" ").length / 200)} phút`,
      publishedAt: new Date().toLocaleDateString("vi-VN"),
    };
    setMyChapters((m) => ({
      ...m,
      [storyId]: [...(m[storyId] || MOCK_CHAPTERS), newCh],
    }));
    closeModal();
    show(`Đã thêm chương "${data.title}"`, "success");
  };
  // Delete chapter
  const deleteChapter = (storyId, chId) => {
    setMyChapters((m) => ({
      ...m,
      [storyId]: (m[storyId] || MOCK_CHAPTERS).filter((c) => c.id !== chId),
    }));
    show("Đã xóa chương", "info");
  };
  // Upgrade role
  const upgradeRole = (role, extra) => {
    setUser((u) =>
      u
        ? {
            ...u,
            role,
            ...(role === "author" ? { penName: extra?.penName } : {}),
          }
        : u,
    );
    closeModal();
    if (role === "author") show("Đăng ký Tác giả thành công!", "success");
    else if (role === "reviewer") {
      show("Đăng ký Reviewer thành công! Vào bảng kiểm duyệt", "success");
      navTo("reviewer-dash");
    } else if (role === "editor") {
      show("Đăng ký Editor thành công! Vào bảng nhiệm vụ", "success");
      navTo("editor-dash");
    }
  };
  // Search results
  const searchResults =
    searchQ.trim().length > 1
      ? stories.filter(
          (s) =>
            s.title.toLowerCase().includes(searchQ.toLowerCase()) ||
            s.penName.toLowerCase().includes(searchQ.toLowerCase()) ||
            s.genre.toLowerCase().includes(searchQ.toLowerCase()),
        )
      : [];
  const filteredStories =
    activeGenre === "all"
      ? stories
      : stories.filter((s) => s.genre === activeGenre);

  // Notification handlers (useCallback to avoid re-render)
  const handleMarkAllRead = useCallback(
    () => setNotifications((n) => n.map((x) => ({ ...x, read: true }))),
    [],
  );
  const handleMarkOneRead = useCallback(
    (id, storyId) => {
      setNotifications((ns) =>
        ns.map((x) => (x.id === id ? { ...x, read: true } : x)),
      );
      if (storyId) {
        const s = stories.find((x) => x.id === storyId);
        if (s) gotoStory(s);
      }
    },
    [stories],
  );
  return (
    <div className="platform">

      {/* ── PROMO BANNER ── */}
      {user?.roles.includes("reader") && (
        <div
          className="promo-banner"
          style={{ background: "#fff8e7", borderBottomColor: "#e8d080" }}
        >
          <div className="promo-inner">
            <span className="promo-text">
              💡 Bạn đang là Độc giả — Đăng ký để <strong>đăng tác phẩm</strong>
              , <strong>kiểm duyệt</strong> hoặc{" "}
              <strong>nhận nhiệm vụ editor</strong> kiếm coin!
            </span>
            <button
              className="btn-nav"
              style={{
                background: "#c23d3f",
                color: "#fff",
                borderRadius: 7,
                padding: "7px 16px",
                fontSize: 13,
                fontWeight: 600,
              }}
              onClick={() => openModal("become-author")}
            >
              ✒ Tác giả
            </button>
            <button
              className="btn-nav"
              style={{
                background: "#c69526",
                color: "#fff",
                borderRadius: 7,
                padding: "7px 16px",
                fontSize: 13,
                fontWeight: 600,
              }}
              onClick={() => openModal("become-reviewer")}
            >
              🛡 Reviewer
            </button>
            <button
              className="btn-nav"
              style={{
                background: "#1d6b3a",
                color: "#fff",
                borderRadius: 7,
                padding: "7px 16px",
                fontSize: 13,
                fontWeight: 600,
              }}
              onClick={() => openModal("become-editor")}
            >
              ✏ Editor
            </button>
          </div>
        </div>
      )}
      {!user && (
        <div
          className="promo-banner"
          style={{
            background: "linear-gradient(90deg,#fff8e7,#fef3f3)",
            borderBottomColor: "#f0e0c8",
          }}
        >
          <div className="promo-inner">
            <span className="promo-text">
              ✒ <strong>Tác giả</strong> đăng tác phẩm · 🛡{" "}
              <strong>Reviewer</strong> kiểm duyệt &amp; nhận coin · ✏{" "}
              <strong>Editor</strong> sửa bản thảo &amp; viết chapter mới
            </span>
            <button
              className="btn-nav btn-primary"
              onClick={() => openModal("auth")}
            >
              Bắt đầu ngay
            </button>
          </div>
        </div>
      )}

      {/* ── PAGES ── */}
      {page === "story" && selectedStory && (
        <StoryDetailPage
          story={selectedStory}
          user={user}
          chapters={MOCK_CHAPTERS}
          reviews={reviews}
          setReviews={setReviews}
          onBack={() => setPage("home")}
          onRead={gotoRead}
          openModal={openModal}
          show={show}
          requireAuth={requireAuth}
          likedStories={likedStories}
          toggleLike={toggleLike}
          stories={stories}
          navTo={navTo}
          unlockedChapters={unlockedChapters}
          unlockChapter={unlockChapter}
        />
      )}
      {page === "read" && selectedStory && (
        <ReaderPage
          story={selectedStory}
          chapter={selectedChapter}
          chapters={MOCK_CHAPTERS}
          content={CHAPTER_TEXTS[selectedChapter] || CHAPTER_TEXTS[0]}
          onBack={() => setPage("story")}
          onChange={setSelectedChapter}
          fontSize={fontSize}
          setFontSize={setFontSize}
          onProgress={(p) =>
            setReadProgress((r) => ({ ...r, [selectedChapter]: p }))
          }
          unlockedChapters={unlockedChapters}
          unlockChapter={unlockChapter}
        />
      )}
      {page === "rankings" && (
        <RankingsPage stories={stories} onStory={gotoStory} />
      )}
      {page === "categories" && (
        <CategoriesPage
          stories={stories}
          setActiveGenre={setActiveGenre}
          onStory={gotoStory}
          navTo={navTo}
        />
      )}
      {page === "favorites" && (
        <FavoritesPage
          stories={stories.filter((s) => likedStories.includes(s.id))}
          onStory={gotoStory}
          toggleLike={toggleLike}
          readProgress={readProgress}
          user={user}
          openModal={openModal}
        />
      )}
      {page === "profile" && user && <ProfilePage />}
      {page === "notifications" && (
        <NotificationsPage
          notifications={notifications}
          setNotifications={setNotifications}
          stories={stories}
          gotoStory={gotoStory}
        />
      )}
      {page === "coin-shop" && user && (
        <CoinShopPage user={user} coinTxs={coinTxs} show={show} />
      )}
      {page === "reviewer-dash" && user?.roles?.includes("REVIEWER") && (
        <ReviewerDashboard
          user={user}
          pending={pending}
          approved={approved}
          rejected={rejected}
          dashTab={dashTab}
          setDashTab={setDashTab}
          reviewNotes={reviewNotes}
          setReviewNotes={setReviewNotes}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
      {page === "editor-dash" && user?.roles?.includes("EDITOR") && (
        <EditorDashboard
          user={user}
          tasks={editorTasks}
          editorTab={editorTab}
          setEditorTab={setEditorTab}
          onClaim={claimTask}
          onComplete={completeTask}
        />
      )}
      {page === "my-stories" && user?.roles?.includes("AUTHOR") && (
        <MyStoriesPage
          user={user}
          stories={stories.filter((s) => s.author === user.fullName)}
          myChapters={myChapters}
          openModal={openModal}
          show={show}
          onStory={gotoStory}
          deleteChapter={deleteChapter}
        />
      )}
      {page === "search-results" && (
        <SearchResultsPage
          query={searchQ}
          results={searchResults}
          onStory={gotoStory}
        />
      )}

      {/* ── MODALS ── */}
      {modal === "become-author" && (
        <BecomeAuthorModal
          onClose={closeModal}
          onSuccess={(pn) => upgradeRole("author", { penName: pn })}
        />
      )}
      {modal === "become-reviewer" && (
        <BecomeReviewerModal
          onClose={closeModal}
          onSuccess={() => upgradeRole("reviewer", user.id)}
        />
      )}
      {modal === "become-editor" && (
        <BecomeEditorModal
          onClose={closeModal}
          onSuccess={() => upgradeRole("editor", user.id)}
        />
      )}
      {modal === "submit-story" && (
        <SubmitStoryModal
          user={user}
          onClose={closeModal}
          onSuccess={submitStory}
        />
      )}
      {modal === "add-chapter" && selectedStory && (
        <AddChapterModal
          storyId={selectedStory.id}
          onClose={closeModal}
          onSuccess={(d) => addChapter(selectedStory.id, d)}
        />
      )}
      {modal === "reject" && (
        <RejectModal
          onClose={() => {
            setRejectTarget(null);
            closeModal();
          }}
          onConfirm={confirmReject}
          story={pending.find((p) => p.id === rejectTarget) || null}
        />
      )}
      {modal === "settings" && (
        <SettingsModal user={user} onClose={closeModal} show={show} />
      )}

      <Toast toast={toast} />
    </div>
  );
}
