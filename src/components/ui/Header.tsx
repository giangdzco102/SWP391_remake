"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Ico } from "../Icons";
import { AvatarComp, NotificationPanel } from "../ui";
import { useAuthStore } from "@/stores";
import { useToast } from "@/hooks/use-toast";
import useAuthService from "@/api/useAuth.service";
import useStoryService from "@/api/useStory.service";
import useCategoryService, { CategoryItem } from "@/api/useCategory.service";
import useNotificationService from "@/api/useNotification.service";
import APP_CONFIG from "@/config/app-config";
import { useNavStore } from "@/stores/navStore";
import { useStoryStore } from "@/stores/storyStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useGotoStory } from "@/hooks/useGotoStory";
import {
  BecomeAuthorModal,
  BecomeReviewerModal,
  BecomeEditorModal,
  SettingsModal,
} from "@/components/popup/BecomeModal";
import { useModalStore } from "@/stores/modalStore";

// ── Constants ─────────────────────────────────────────────────────────────────
const SEARCH_COVER_FALLBACKS = [
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
];



// ── CategoryDropdown ──────────────────────────────────────────────────────────
function CategoryDropdown({
  visible, categories, onSelect, onViewAll,
}: {
  visible: boolean;
  categories: CategoryItem[];
  onSelect: (name: string) => void;
  onViewAll: () => void;
}) {
  const itemStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px 10px", borderRadius: 10, border: "none",
    background: "transparent", cursor: "pointer",
    fontSize: 13, color: "#3d2c1e", fontWeight: 500,
    textAlign: "left", transition: "background 0.12s",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  };
  const hover = (e: React.MouseEvent<HTMLButtonElement>, on: boolean) =>
    (e.currentTarget.style.background = on ? "#fdf7f5" : "transparent");

  return (
    <div style={{
      position: "absolute", top: "calc(100% + 12px)", left: "50%",
      transform: visible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(-8px)",
      opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none",
      transition: "opacity 0.18s ease, transform 0.18s ease",
      background: "#fff", borderRadius: 16, border: "1.5px solid #f0ebe3",
      boxShadow: "0 8px 32px rgba(0,0,0,0.10)", padding: "8px",
      minWidth: 260, maxWidth: 320, zIndex: 999,
    }}>
      {/* Arrow */}
      <div style={{
        position: "absolute", top: -7, left: "50%",
        transform: "translateX(-50%) rotate(45deg)",
        width: 12, height: 12, background: "#fff",
        border: "1.5px solid #f0ebe3", borderBottom: "none", borderRight: "none",
        borderRadius: "2px 0 0 0",
      }} />

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        {categories.map((cat) => (
          <button key={cat.id} style={itemStyle} onClick={() => onSelect(cat.name)}
            onMouseEnter={(e) => hover(e, true)} onMouseLeave={(e) => hover(e, false)}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{(cat as any).icon ?? "📖"}</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* View all */}
      <div style={{ borderTop: "1px solid #f0ebe3", margin: "6px 0 4px" }} />
      <button
        onClick={onViewAll}
        style={{ ...itemStyle, width: "100%", justifyContent: "center", color: "#c23d3f", fontWeight: 600 }}
        onMouseEnter={(e) => hover(e, true)} onMouseLeave={(e) => hover(e, false)}
      >
        Xem tất cả thể loại →
      </button>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
export function Header({ pending, darkMode, setDarkMode }: any) {
  const { openModal, closeModal } = useModalStore();
  const { user, setLoading } = useAuthStore();
  const { navTo, page } = useNavStore();
  const gotoStory = useGotoStory();
  const { setActiveGenre, searchQ, setSearchQ } = useStoryStore();
  const { notifications, unreadCount, markAllRead, markOneRead, setNotifications } = useNotificationStore();
  const router = useRouter();
  const toast = useToast();
  const { logout } = useAuthService();
  const { searchStories } = useStoryService();
  const { getCategories } = useCategoryService();
  const { getNotifications, markAllRead: apiMarkAll, markOneRead: apiMarkOne } = useNotificationService();

  // ── Load notifications when user logs in ─────────────────────────────────
  useEffect(() => {
    if (!user) return;
    getNotifications()
      .then((res: any) => {
        const list = res?.data?.content ?? res?.content ?? res?.data ?? (Array.isArray(res) ? res : null) ?? [];
        setNotifications(Array.isArray(list) ? list : []);
      })
      .catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleMarkAll = async () => {
    markAllRead();
    try { await apiMarkAll(); } catch { /* best-effort */ }
  };

  const handleMarkOne = async (id: number) => {
    markOneRead(id);
    try { await apiMarkOne(id); } catch { /* best-effort */ }
  };

  // ── Refs ──────────────────────────────────────────────────────────────────
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const catMenuRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── State ─────────────────────────────────────────────────────────────────
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearchDrop, setShowSearchDrop] = useState(false);
  const [dbCategories, setDbCategories] = useState<CategoryItem[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const primaryRole = user?.roles?.[0] ?? "READER";

  // ── Load categories ───────────────────────────────────────────────────────
  useEffect(() => {
    getCategories()
      .then((res: any) => setDbCategories(res?.data ?? res ?? []))
      .catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Click outside ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearchDrop(false);
      if (catMenuRef.current && !catMenuRef.current.contains(e.target as Node)) setShowCatMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Search ────────────────────────────────────────────────────────────────
  const runSearch = (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      try {
        const res: any = await searchStories({ keyword: q, size: 8 });
        const list: any[] = res?.data ?? res ?? [];
        setSearchResults(list.map((s: any, i: number) => ({
          id: s.id, title: s.title, penName: s.authorName ?? "",
          genre: s.categories?.[0]?.name ?? "",
          cover: s.coverUrl ? `url("${s.coverUrl}")` : SEARCH_COVER_FALLBACKS[i % 3],
          views: s.viewCount ?? 0, chapters: s.totalChapters ?? 0,
          status: s.status === "COMPLETED" ? "done" : "ongoing",
          rating: s.averageRating ?? 0,
          reads: s.viewCount >= 1000 ? `${(s.viewCount / 1000).toFixed(1)}K` : String(s.viewCount ?? 0),
          author: s.authorName ?? "", tags: [], reviewCount: 0,
          favorites: s.favoriteCount ?? 0, description: s.summary ?? "",
          featured: false, excerpt: s.summary ?? "",
        })));
      } catch { setSearchResults([]); }
    }, 300);
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout({ refreshToken: localStorage.getItem(APP_CONFIG.REFRESH_TOKEN) || "" });
      toast.success("Đăng xuất thành công!");
      router.push("/");
    } catch (err) {
      toast.error("Đăng xuất không thành công");
      console.error(err);
    } finally { setLoading(false); }
  };

  const navLinks = useMemo(
    () => [
      { label: "Trang chủ", page: "/homePage" },
      { label: "Bảng xếp hạng", page: "/rankingsPage" },
      { label: "Thể loại", page: "/categoriesPage", isCat: true },
      { label: "Yêu thích", page: "/favoritesPage" },
      ...(user?.roles.includes("REVIEWER")
        ? [
            {
              label: "Kiểm duyệt",
              page: "/reviewerDashboard",
              badge: pending?.length,
            },
          ]
        : []),
      ...(user?.roles.includes("EDITOR")
        ? [{ label: "Nhiệm vụ", page: "/editorDashboard" }]
        : []),
      ...(user?.roles.includes("AUTHOR")
        ? [{ label: "Tác phẩm của tôi", page: "/myStoriesPage" }]
        : []),
      ...(user?.roles.includes("ADMIN")
        ? [{ label: "⚙ Admin", page: "/adminDashboard" }]
        : []),
    ],
    [user?.roles, pending?.length],
  );

  const ROLE_LABEL: any = {
    reviewer: "Reviewer",
    author: "Tác giả",
    editor: "Editor",
    reader: "Độc giả",
  };
  const ROLE_CHIP_CLASS: any = {
    reviewer: "chip-role-reviewer",
    author: "chip-role-author",
    editor: "chip-role-editor",
    reader: "chip-role-reader",
  };
  const mobileAnd = (fn: () => void) => () => {
    setShowMobileMenu(false);
    fn();
  };

  return (
    <>
      {/* ── MOBILE SIDEBAR ──────────────────────────────────────────────── */}
      {showMobileMenu && (
        <>
          <div className="mobile-overlay" onClick={() => setShowMobileMenu(false)} />
          <div className="mobile-sidebar">

            {/* Logo + close */}
            <div className="mobile-nav-header">
              <div className="mr-2.5 flex shrink-0 cursor-pointer select-none items-center gap-2 font-['Playfair_Display',serif] text-[18px] font-black tracking-[-0.5px] text-[#c23d3f]">
                <div className="flex items-center justify-center rounded-lg bg-linear-to-br from-[#c23d3f] to-[#9e2d2f] font-black text-white" style={{ width: 30, height: 30, fontSize: 15 }}>T</div>
                Truyện<span className="text-[#1c1512]">Hay</span>
              </div>
              <button style={{ padding: 6, border: "none", background: "#f5ede4", borderRadius: 8, cursor: "pointer" }} onClick={() => setShowMobileMenu(false)}>
                <Ico.X />
              </button>
            </div>

            {/* User info */}
            {user && (
              <div className="mobile-user-card">
                <AvatarComp user={user} size={42} />
                <div className="mobile-user-info">
                  <div className="mobile-user-name">{user.fullName}</div>
                  <div className="mobile-user-email">{user.email}</div>
                  <span className={`dropdown-role-chip ${ROLE_CHIP_CLASS[primaryRole] ?? "chip-role-reader"}`}>
                    {ROLE_LABEL[primaryRole] ?? "Độc giả"}
                  </span>
                </div>
                {(primaryRole === "reviewer" || primaryRole === "editor") && (
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e", background: "#fffbeb", border: "1.5px solid #fcd34d", borderRadius: 20, padding: "4px 10px", whiteSpace: "nowrap" }}>
                    🪙 {user.walletBalance}
                  </div>
                )}
              </div>
            )}

            {/* Nav links */}
            {navLinks.map((l: any) => (
              <button key={l.label} className={`mobile-nav-link${page === l.page ? " active" : ""}`} onClick={() => l.page && router.push(l.page)}>
                {l.label}
                {l.badge ? <span style={{ marginLeft: "auto", background: "#c23d3f", color: "#fff", borderRadius: "50%", fontSize: 10, padding: "2px 6px", fontWeight: 700 }}>{l.badge}</span> : null}
              </button>
            ))}

            <div style={{ borderTop: "1.5px solid #f0ebe3", margin: "8px 0" }} />

            {/* Auth */}
            {!user ? (
              <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                <button className="btn-full btn-red-full" onClick={mobileAnd(() => router.push("?login"))}>Đăng nhập</button>
                <button className="btn-full btn-blue-full" onClick={mobileAnd(() => router.push("?register"))}>Đăng ký</button>
              </div>
            ) : (
              <>
                {user.roles.includes("READER") && (
                  <>
                    <button className="mobile-nav-link" onClick={mobileAnd(() => openModal(BecomeAuthorModal, { onSuccess: () => closeModal() }))}>✒ Trở thành Tác giả</button>
                    <button className="mobile-nav-link" onClick={mobileAnd(() => openModal(BecomeReviewerModal, { onSuccess: () => closeModal() }))}>🛡 Trở thành Reviewer</button>
                    <button className="mobile-nav-link" onClick={mobileAnd(() => openModal(BecomeEditorModal, { onSuccess: () => closeModal() }))}>✏ Trở thành Editor</button>
                  </>
                )}
                {user.roles.includes("ADMIN") && (
                  <button className="mobile-nav-link" style={{ color: "#7c3aed", fontWeight: 700 }} onClick={mobileAnd(() => router.push("/adminDashboard"))}>⚙ Quản trị Admin</button>
                )}
                <button className="mobile-nav-link" onClick={mobileAnd(() => router.push("/profilePage"))}>👤 Hồ sơ của tôi</button>
                <button className="mobile-nav-link" onClick={mobileAnd(() => router.push("/coinShopPage"))}>🪙 Coin Shop</button>
                <button className="mobile-nav-link" onClick={mobileAnd(() => navTo("notifications"))}>
                  🔔 Thông báo
                  {unreadCount > 0 && <span style={{ marginLeft: "auto", background: "#c23d3f", color: "#fff", borderRadius: "50%", fontSize: 10, padding: "2px 6px", fontWeight: 700 }}>{unreadCount}</span>}
                </button>
                <div style={{ borderTop: "1.5px solid #f0ebe3", margin: "8px 0" }} />
                <button className="mobile-nav-link" style={{ color: "#c23d3f" }} onClick={() => { handleLogout(); setShowMobileMenu(false); }}>
                  <Ico.LogOut /> Đăng xuất
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* ── DESKTOP NAV ─────────────────────────────────────────────────── */}
      <nav className="nav">
        {/* Logo */}
        <div className="logo" onClick={() => router.push("/homePage")}>
          <div className="logo-icon">T</div>
          Truyện<span className="logo-dot">Hay</span>
        </div>

        {/* Links */}
        <div className="nav-links">
          {navLinks.map((l: any) => {
            if (l.isCat) return (
              <div key={l.label} className="nav-cat-wrap" ref={catMenuRef} style={{ position: "relative" }}>
                <button
                  className={`nav-link${page === "/categoriesPage" ? " active" : ""}`}
                  onClick={() => setShowCatMenu((v) => !v)}
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  {l.label}
                  <span style={{ display: "inline-flex", transition: "transform 0.2s ease", transform: showCatMenu ? "rotate(180deg)" : "rotate(0deg)" }}>
                    <Ico.ChevronDown />
                  </span>
                </button>
                <CategoryDropdown
                  visible={showCatMenu}
                  categories={dbCategories}
                  onSelect={(name) => {
                    router.push(`/searchResultsPage?genre=${encodeURIComponent(name)}`);
                    setShowCatMenu(false);
                  }}
                  onViewAll={() => { router.push("/categoriesPage"); setShowCatMenu(false); }}
                />
              </div>
            );
            return (
              <button key={l.label} className={`nav-link${page === l.page ? " active" : ""}`} onClick={() => l.page && router.push(l.page)}>
                {l.label}
                {l.badge ? <span style={{ background: "#c23d3f", color: "#fff", borderRadius: "50%", fontSize: 10, padding: "1px 5px", marginLeft: 4, fontWeight: 700 }}>{l.badge}</span> : null}
              </button>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Search */}
          <div className="search-wrap" style={{ position: "relative" }} ref={searchRef}>
            <Ico.Search />
            <input
              placeholder="Tìm kiếm..."
              value={searchQ}
              onChange={(e) => { setSearchQ(e.target.value); setShowSearchDrop(true); runSearch(e.target.value); }}
              onFocus={() => setShowSearchDrop(true)}
              onKeyDown={(e) => { if (e.key === "Enter" && searchQ.trim()) { router.push("/searchResultsPage"); setShowSearchDrop(false); } }}
            />
            {showSearchDrop && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.slice(0, 5).map((s: any) => (
                  <div key={s.id} className="search-item" onClick={() => { gotoStory(s); setShowSearchDrop(false); setSearchQ(""); }}>
                    <div className="search-item-cover" style={{ background: s.cover }} />
                    <div>
                      <div className="search-item-title">{s.title}</div>
                      <div className="search-item-meta">{s.penName} · {s.genre}</div>
                    </div>
                  </div>
                ))}
                {searchResults.length > 5 && (
                  <div style={{ padding: "8px 14px", fontSize: 12, color: "#9e8e82", textAlign: "center", cursor: "pointer" }} onClick={() => { router.push("/searchResultsPage"); setShowSearchDrop(false); }}>
                    Xem tất cả {searchResults.length} kết quả →
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dark mode */}
          <button className={`dark-toggle${darkMode ? " on" : ""}`} onClick={() => setDarkMode((d: boolean) => !d)}>
            <div className="dark-toggle-thumb">{darkMode ? <Ico.Moon /> : <Ico.Sun />}</div>
          </button>

          {/* Guest */}
          {!user ? (
            <>
              <button className="btn-nav btn-primary" onClick={() => router.push("?login")}>Đăng nhập</button>
              <button className="btn-nav btn-secondary-nav" onClick={() => router.push("?register")}>Đăng ký</button>
              <button className="menu-icon-btn" onClick={() => setShowMobileMenu(true)}><Ico.Menu /></button>
            </>
          ) : (
            <>
              {/* Wallet */}
              {(user.roles.includes("reviewer") || user.roles.includes("editor")) && (
                <div className="inline-flex cursor-pointer items-center gap-1 rounded-full border-[1.5px] border-[#fcd34d] bg-[#fffbeb] px-2.5 py-1 text-[12px] font-bold text-[#92400e] transition-all duration-150 hover:bg-[#fef3c7]" onClick={() => navTo("coin-shop")}>
                  🪙 {user.walletBalance}
                </div>
              )}

              {/* Notifications */}
              <div className="notif-wrap" ref={notifRef}>
                <button
                  className="relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border-[1.5px] border-[#e8e0d6] bg-white transition-all duration-150 hover:border-[#c23d3f] hover:bg-[#fdf7f5]"
                  onClick={() => { setShowNotif((v) => !v); setShowUserMenu(false); }}
                >
                  <Ico.Bell />
                  {unreadCount > 0 && <span className="absolute right-1 top-1 h-2 w-2 animate-[pulse_2s_infinite] rounded-full border-2 border-white bg-[#c23d3f]" />}
                </button>
                {showNotif && (
                  <NotificationPanel notifications={notifications} unreadCount={unreadCount} onMarkAll={handleMarkAll} onMarkOne={handleMarkOne} onViewAll={() => navTo("notifications")} />
                )}
              </div>

              {/* User dropdown */}
              <div className="user-menu-wrap" ref={userMenuRef} onMouseDown={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => { setShowUserMenu((v) => !v); setShowNotif(false); }}>
                  <AvatarComp user={user} />
                  <Ico.ChevronDown />
                </div>

                {showUserMenu && (
                  <div className="user-dropdown">
                    {/* User info */}
                    <div className="dropdown-header">
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <AvatarComp user={user} size={38} />
                        <div>
                          <div className="dropdown-user-name">{user.fullName}</div>
                          <div className="dropdown-email">{user.email}</div>
                          <span className={`dropdown-role-chip ${ROLE_CHIP_CLASS[primaryRole] ?? "chip-role-reader"}`}>
                            {ROLE_LABEL[primaryRole] ?? "Độc giả"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Coin */}
                    <div className="coin-display">
                      <Ico.Coin /> 🪙 {user.walletBalance} coin ·{" "}
                      <span style={{ fontWeight: 400, fontSize: 12, color: "#b45309", cursor: "pointer", marginLeft: 4 }} onClick={() => { setShowUserMenu(false); router.push("/coinShopPage"); }}>
                        Coin Shop →
                      </span>
                    </div>

                    {/* Common */}
                    <button className="dropdown-item" onClick={() => { setShowUserMenu(false); router.push("/profilePage"); }}><Ico.User /> Hồ sơ của tôi</button>
                    <button className="dropdown-item" onClick={() => { setShowUserMenu(false); navTo("notifications"); }}>
                      <Ico.Bell /> Thông báo
                      {unreadCount > 0 && <span style={{ marginLeft: "auto", background: "#c23d3f", color: "#fff", borderRadius: 10, fontSize: 11, padding: "1px 6px" }}>{unreadCount}</span>}
                    </button>

                    {/* Role-based */}
                    {user.roles.includes("AUTHOR") && <button className="dropdown-item" onClick={() => { setShowUserMenu(false); navTo("my-stories"); }}><Ico.Pen /> Tác phẩm của tôi</button>}
                    {user.roles.includes("REVIEWER") && (
                      <button className="dropdown-item" onClick={() => { setShowUserMenu(false); navTo("reviewer-dash"); }}>
                        <Ico.Shield /> Bảng kiểm duyệt
                        {pending?.length > 0 && <span style={{ marginLeft: "auto", background: "#c23d3f", color: "#fff", borderRadius: 10, fontSize: 11, padding: "1px 6px" }}>{pending.length}</span>}
                      </button>
                    )}
                    {user.roles.includes("EDITOR") && <button className="dropdown-item" onClick={() => { setShowUserMenu(false); navTo("editor-dash"); }}><Ico.Edit /> Bảng nhiệm vụ</button>}
                    {user.roles.includes("ADMIN") && <button className="dropdown-item" style={{ color: "#7c3aed", fontWeight: 700 }} onClick={() => { setShowUserMenu(false); router.push("/adminDashboard"); }}><Ico.Shield /> Quản trị Admin</button>}

                    <div className="dropdown-divider" />

                    {/* Upgrade role */}
                    {user.roles.includes("READER") && (
                      <>
                        <button className="dropdown-item" onClick={() => { setShowUserMenu(false); openModal(BecomeAuthorModal, { onSuccess: () => closeModal() }); }}>✒ Trở thành Tác giả</button>
                        <button className="dropdown-item" onClick={() => { setShowUserMenu(false); openModal(BecomeReviewerModal, { onSuccess: () => closeModal() }); }}>🛡 Trở thành Reviewer</button>
                        <button className="dropdown-item" onClick={() => { setShowUserMenu(false); openModal(BecomeEditorModal, { onSuccess: () => closeModal() }); }}>✏ Trở thành Editor</button>
                        <div className="dropdown-divider" />
                      </>
                    )}

                    <button className="dropdown-item" onClick={() => { setShowUserMenu(false); openModal(SettingsModal); }}><Ico.Settings /> Cài đặt</button>
                    <button className="dropdown-item danger" onClick={handleLogout}><Ico.LogOut /> Đăng xuất</button>
                  </div>
                )}
              </div>

              <button className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-[#2563eb] text-white transition-colors duration-150 hover:bg-[#1d4ed8]" onClick={() => setShowMobileMenu(true)}>
                <Ico.Menu />
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

export default Header;