"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Ico } from "../Icons";
import { AvatarComp, NotificationPanel } from "../ui";
import { GENRES, GENRE_META } from "../../utils/mockData";
import { useAuthStore } from "@/stores";
import { useToast } from "@/hooks/use-toast";
import useAuthService from "@/api/useAuth.service";
import useStoryService from "@/api/useStory.service";
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

export function Header({ pending, darkMode, setDarkMode }: any) {
  const { openModal, closeModal } = useModalStore();
  const { user } = useAuthStore();
  const { navTo, page } = useNavStore();
  const gotoStory = useGotoStory();
  const { setActiveGenre, searchQ, setSearchQ, stories } = useStoryStore();
  const { notifications, unreadCount, markAllRead, markOneRead } =
    useNotificationStore();

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const catMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [showCatMenu, setShowCatMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearchDrop, setShowSearchDrop] = useState(false);

  const primaryRole = user?.roles?.[0] || "READER";
  const { setLoading } = useAuthStore();
  const { logout } = useAuthService();
  const toast = useToast();

  const { searchStories } = useStoryService();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = (q: string) => {
    if (q.trim().length < 2) { setSearchResults([]); return; }
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      searchStories({ keyword: q, size: 8 })
        .then((res: any) => {
          const list: any[] = res?.data ?? res ?? [];
          setSearchResults(list.map((s: any, idx: number) => ({
            id: s.id,
            title: s.title,
            penName: s.authorName ?? "",
            genre: s.categories?.[0]?.name ?? "",
            cover: s.coverUrl
              ? `url("${s.coverUrl}")`
              : ["linear-gradient(135deg,#f093fb,#f5576c)","linear-gradient(135deg,#4facfe,#00f2fe)","linear-gradient(135deg,#43e97b,#38f9d7)"][idx % 3],
            views: s.viewCount ?? 0,
            chapters: s.totalChapters ?? 0,
            status: s.status === "COMPLETED" ? "done" : "ongoing",
            rating: s.averageRating ?? 0,
            reads: s.viewCount >= 1000 ? `${(s.viewCount/1000).toFixed(1)}K` : String(s.viewCount ?? 0),
            author: s.authorName ?? "",
            tags: [],
            reviewCount: 0,
            favorites: s.favoriteCount ?? 0,
            description: s.summary ?? "",
            featured: false,
            excerpt: s.summary ?? "",
          })));
        })
        .catch(() => setSearchResults([]));
    }, 300);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      )
        setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setShowNotif(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowSearchDrop(false);
      if (catMenuRef.current && !catMenuRef.current.contains(e.target as Node))
        setShowCatMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      logout({
        refreshToken: localStorage.getItem(APP_CONFIG.REFRESH_TOKEN) || "",
      });
      toast.success("Đăng xuất thành công!");
      router.push("/");
    } catch (error) {
      toast.error("Đăng xuất không thành công");
      console.error("Lỗi đăng xuất:", error);
    } finally {
      setLoading(false);
    }
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
              page: "reviewer-dash",
              badge: pending?.length,
            },
          ]
        : []),
      ...(user?.roles.includes("EDITOR")
        ? [{ label: "Nhiệm vụ", page: "editor-dash" }]
        : []),
      ...(user?.roles.includes("AUTHOR")
        ? [{ label: "Tác phẩm của tôi", page: "my-stories" }]
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

  return (
    <>
      {/* ── MOBILE MENU ── */}
      {showMobileMenu && (
        <>
          <div
            className="mobile-overlay"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="mobile-sidebar">
            <div className="mobile-nav-header">
              <div
                className="mr-2.5 flex shrink-0 cursor-pointer select-none items-center gap-2 font-['Playfair_Display',serif] text-[22px] font-black tracking-[-0.5px] text-[#c23d3f]"
                style={{ fontSize: 18 }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-[#c23d3f] to-[#9e2d2f] font-['Playfair_Display',serif] text-[18px] font-black text-white"
                  style={{ width: 30, height: 30, fontSize: 15 }}
                >
                  T
                </div>
                Truyện<span className="text-[#1c1512]">Hay</span>
              </div>
              <button
                style={{
                  padding: 6,
                  border: "none",
                  background: "#f5ede4",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
                onClick={() => setShowMobileMenu(false)}
              >
                <Ico.X />
              </button>
            </div>

            {user && (
              <div className="mobile-user-card">
                <AvatarComp user={user} size={42} />
                <div className="mobile-user-info">
                  <div className="mobile-user-name">{user.fullName}</div>
                  <div className="mobile-user-email">{user.email}</div>
                  <span
                    className={`dropdown-role-chip ${ROLE_CHIP_CLASS[primaryRole] || "chip-role-reader"}`}
                  >
                    {ROLE_LABEL[primaryRole] || "Độc giả"}
                  </span>
                </div>
                {(primaryRole === "reviewer" || primaryRole === "editor") && (
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#92400e",
                      background: "#fffbeb",
                      border: "1.5px solid #fcd34d",
                      borderRadius: 20,
                      padding: "4px 10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    🪙 {user.walletBalance}
                  </div>
                )}
              </div>
            )}

            {navLinks.map((l: any) => (
              <button
                key={l.label}
                className={`mobile-nav-link${page === l.page ? " active" : ""}`}
                onClick={() => l.page && router.push(l.page)}
              >
                {l.label}
                {l.badge ? (
                  <span
                    style={{
                      marginLeft: "auto",
                      background: "#c23d3f",
                      color: "#fff",
                      borderRadius: "50%",
                      fontSize: 10,
                      padding: "2px 6px",
                      fontWeight: 700,
                    }}
                  >
                    {l.badge}
                  </span>
                ) : null}
              </button>
            ))}

            <div
              style={{ borderTop: "1.5px solid #f0ebe3", margin: "8px 0" }}
            />

            {!user ? (
              <div
                style={{
                  padding: "12px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <button
                  className="btn-full btn-red-full"
                  onClick={() => {
                    setShowMobileMenu(false);
                    router.push("?login");
                  }}
                >
                  Đăng nhập
                </button>
                <button
                  className="btn-full btn-blue-full"
                  onClick={() => {
                    setShowMobileMenu(false);
                    router.push("?register");
                  }}
                >
                  Đăng ký
                </button>
              </div>
            ) : (
              <>
                {user.roles.includes("READER") && (
                  <>
                    <button
                      className="mobile-nav-link"
                      onClick={() => {
                        setShowMobileMenu(false);
                        openModal(BecomeAuthorModal, {
                          onSuccess: (penName: string) => {
                            closeModal();
                          },
                        });
                      }}
                    >
                      ✒ Trở thành Tác giả
                    </button>
                    <button
                      className="mobile-nav-link"
                      onClick={() => {
                        setShowMobileMenu(false);
                        openModal(BecomeReviewerModal);
                      }}
                    >
                      🛡 Trở thành Reviewer
                    </button>
                    <button
                      className="mobile-nav-link"
                      onClick={() => {
                        setShowMobileMenu(false);
                        openModal(BecomeEditorModal);
                      }}
                    >
                      ✏ Trở thành Editor
                    </button>
                  </>
                )}
                {user.roles.includes("ADMIN") && (
                  <button
                    className="mobile-nav-link"
                    onClick={() => {
                      setShowMobileMenu(false);
                      router.push("/adminDashboard");
                    }}
                    style={{ color: "#7c3aed", fontWeight: 700 }}
                  >
                    ⚙ Quản trị Admin
                  </button>
                )}
                <button
                  className="mobile-nav-link"
                  onClick={() => {
                    setShowMobileMenu(false);
                    router.push("/profilePage");
                  }}
                >
                  👤 Hồ sơ của tôi
                </button>
                <button
                  className="mobile-nav-link"
                  onClick={() => {
                    setShowMobileMenu(false);
                    router.push("/coinShopPage");
                  }}
                >
                  🪙 Coin Shop
                </button>
                <button
                  className="mobile-nav-link"
                  onClick={() => {
                    setShowMobileMenu(false);
                    navTo("notifications");
                  }}
                >
                  🔔 Thông báo{" "}
                  {unreadCount > 0 && (
                    <span
                      style={{
                        marginLeft: "auto",
                        background: "#c23d3f",
                        color: "#fff",
                        borderRadius: "50%",
                        fontSize: 10,
                        padding: "2px 6px",
                        fontWeight: 700,
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
                <div
                  style={{ borderTop: "1.5px solid #f0ebe3", margin: "8px 0" }}
                />
                <button
                  className="mobile-nav-link"
                  style={{ color: "#c23d3f" }}
                  onClick={() => {
                    handleLogout();
                    setShowMobileMenu(false);
                  }}
                >
                  <Ico.LogOut /> Đăng xuất
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="logo" onClick={() => router.push("/homePage")}>
          <div className="logo-icon">T</div>
          Truyện<span className="logo-dot">Hay</span>
        </div>

        <div className="nav-links">
          {navLinks.map((l: any) => {
            if (l.isCat)
              return (
                <div key={l.label} className="nav-cat-wrap" ref={catMenuRef}>
                  <button
                    className={`nav-link${page === "categories" || page === "search-results" ? " active" : ""}`}
                    onClick={() => setShowCatMenu((v) => !v)}
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    {l.label}
                    <Ico.ChevronDown />
                  </button>
                  {showCatMenu && (
                    <div className="nav-cat-menu">
                      {GENRES.map((g) => (
                        <button
                          key={g}
                          className="nav-cat-item"
                          onClick={() => {
                            setActiveGenre(g);
                            router.push("/homePage");
                            setShowCatMenu(false);
                          }}
                        >
                          {(GENRE_META as any)[g]?.icon} {g}
                        </button>
                      ))}
                      <button
                        className="nav-cat-item"
                        style={{
                          gridColumn: "1/-1",
                          textAlign: "center",
                          color: "#c23d3f",
                          fontWeight: 600,
                        }}
                        onClick={() => {
                          setActiveGenre("all");
                          router.push("/categoriesPage");
                          setShowCatMenu(false);
                        }}
                      >
                        Xem tất cả thể loại →
                      </button>
                    </div>
                  )}
                </div>
              );
            return (
              <button
                key={l.label}
                className={`nav-link${page === l.page ? " active" : ""}`}
                onClick={() => l.page && router.push(l.page)}
              >
                {l.label}
                {l.badge ? (
                  <span
                    style={{
                      background: "#c23d3f",
                      color: "#fff",
                      borderRadius: "50%",
                      fontSize: 10,
                      padding: "1px 5px",
                      marginLeft: 4,
                      fontWeight: 700,
                    }}
                  >
                    {l.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Search */}
          <div
            className="search-wrap"
            style={{ position: "relative" }}
            ref={searchRef}
          >
            <Ico.Search />
            <input
              placeholder="Tìm kiếm..."
              value={searchQ}
              onChange={(e) => {
                setSearchQ(e.target.value);
                setShowSearchDrop(true);
                runSearch(e.target.value);
              }}
              onFocus={() => setShowSearchDrop(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQ.trim()) {
                  router.push("/searchResultsPage");
                  setShowSearchDrop(false);
                }
              }}
            />
            {showSearchDrop && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.slice(0, 5).map((s: any) => (
                  <div
                    key={s.id}
                    className="search-item"
                    onClick={() => {
                      gotoStory(s);
                      setShowSearchDrop(false);
                      setSearchQ("");
                    }}
                  >
                    <div
                      className="search-item-cover"
                      style={{ background: s.cover }}
                    />
                    <div>
                      <div className="search-item-title">{s.title}</div>
                      <div className="search-item-meta">
                        {s.penName} · {s.genre}
                      </div>
                    </div>
                  </div>
                ))}
                {searchResults.length > 5 && (
                  <div
                    style={{
                      padding: "8px 14px",
                      fontSize: 12,
                      color: "#9e8e82",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      router.push("/searchResultsPage");
                      setShowSearchDrop(false);
                    }}
                  >
                    Xem tất cả {searchResults.length} kết quả →
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dark mode */}
          <button
            className={`dark-toggle${darkMode ? " on" : ""}`}
            onClick={() => setDarkMode((d: boolean) => !d)}
          >
            <div className="dark-toggle-thumb">
              {darkMode ? <Ico.Moon /> : <Ico.Sun />}
            </div>
          </button>

          {/* Auth */}
          {!user ? (
            <>
              <button
                className="btn-nav btn-primary"
                onClick={() => router.push("?login")}
              >
                Đăng nhập
              </button>
              <button
                className="btn-nav btn-secondary-nav"
                onClick={() => router.push("?register")}
              >
                Đăng ký
              </button>
              <button
                className="menu-icon-btn"
                onClick={() => setShowMobileMenu(true)}
              >
                <Ico.Menu />
              </button>
            </>
          ) : (
            <>
              {(user.roles.includes("reviewer") ||
                user.roles.includes("editor")) && (
                <div
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border-[1.5px] border-[#fcd34d] bg-[#fffbeb] px-2.5 py-1 text-[12px] font-bold text-[#92400e] transition-all duration-150 hover:bg-[#fef3c7]"
                  onClick={() => navTo("coin-shop")}
                >
                  🪙 {user.walletBalance}
                </div>
              )}

              <div className="notif-wrap" ref={notifRef}>
                <button
                  className="relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border-[1.5px] border-[#e8e0d6] bg-white transition-all duration-150 hover:border-[#c23d3f] hover:bg-[#fdf7f5]"
                  onClick={() => {
                    setShowNotif((v) => !v);
                    setShowUserMenu(false);
                  }}
                >
                  <Ico.Bell />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 h-2 w-2 animate-[pulse_2s_infinite] rounded-full border-2 border-white bg-[#c23d3f]" />
                  )}
                </button>
                {showNotif && (
                  <NotificationPanel
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onMarkAll={markAllRead}
                    onMarkOne={markOneRead}
                    onViewAll={() => navTo("notifications")}
                  />
                )}
              </div>

              <div
                className="user-menu-wrap"
                ref={userMenuRef}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setShowUserMenu((v) => !v);
                    setShowNotif(false);
                  }}
                >
                  <AvatarComp user={user} />
                  <Ico.ChevronDown />
                </div>
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <AvatarComp user={user} size={38} />
                        <div>
                          <div className="dropdown-user-name">
                            {user.fullName}
                          </div>
                          <div className="dropdown-email">{user.email}</div>
                          <span
                            className={`dropdown-role-chip ${ROLE_CHIP_CLASS[primaryRole] || "chip-role-reader"}`}
                          >
                            {ROLE_LABEL[primaryRole] || "Độc giả"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="coin-display">
                      <Ico.Coin />
                      🪙 {user.walletBalance} coin ·{" "}
                      <span
                        style={{
                          fontWeight: 400,
                          fontSize: 12,
                          color: "#b45309",
                          cursor: "pointer",
                          marginLeft: 4,
                        }}
                        onClick={() => {
                          setShowUserMenu(false);
                          router.push("/coinShopPage");
                        }}
                      >
                        Coin Shop →
                      </span>
                    </div>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push("/profilePage");
                      }}
                    >
                      <Ico.User /> Hồ sơ của tôi
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setShowUserMenu(false);
                        navTo("notifications");
                      }}
                    >
                      <Ico.Bell /> Thông báo
                      {unreadCount > 0 && (
                        <span
                          style={{
                            marginLeft: "auto",
                            background: "#c23d3f",
                            color: "#fff",
                            borderRadius: 10,
                            fontSize: 11,
                            padding: "1px 6px",
                          }}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    {user.roles.includes("AUTHOR") && (
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setShowUserMenu(false);
                          navTo("my-stories");
                        }}
                      >
                        <Ico.Pen /> Tác phẩm của tôi
                      </button>
                    )}
                    {user.roles.includes("REVIEWER") && (
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setShowUserMenu(false);
                          navTo("reviewer-dash");
                        }}
                      >
                        <Ico.Shield /> Bảng kiểm duyệt{" "}
                        {pending?.length > 0 && (
                          <span
                            style={{
                              marginLeft: "auto",
                              background: "#c23d3f",
                              color: "#fff",
                              borderRadius: 10,
                              fontSize: 11,
                              padding: "1px 6px",
                            }}
                          >
                            {pending.length}
                          </span>
                        )}
                      </button>
                    )}
                    {user.roles.includes("EDITOR") && (
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setShowUserMenu(false);
                          navTo("editor-dash");
                        }}
                      >
                        <Ico.Edit /> Bảng nhiệm vụ
                      </button>
                    )}
                    {user.roles.includes("ADMIN") && (
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setShowUserMenu(false);
                          router.push("/adminDashboard");
                        }}
                        style={{ color: "#7c3aed", fontWeight: 700 }}
                      >
                        <Ico.Shield /> Quản trị Admin
                      </button>
                    )}
                    <div className="dropdown-divider" />
                    {user.roles.includes("READER") && (
                      <>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            setShowUserMenu(false);
                            openModal(BecomeAuthorModal, {
                              onSuccess: (penName: string) => {
                                closeModal();
                                // xử lý thêm: gọi API, toast...
                              },
                            });
                          }}
                        >
                          ✒ Trở thành Tác giả
                        </button>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            setShowUserMenu(false);
                            openModal(BecomeReviewerModal, {
                              onSuccess: (reviewerInfo: any) => {
                                closeModal();
                                // xử lý thêm: gọi API, toast...
                              },
                            });
                          }}
                        >
                          🛡 Trở thành Reviewer
                        </button>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            setShowUserMenu(false);
                            openModal(BecomeEditorModal, {
                              onSuccess: (editorInfo: any) => {
                                closeModal();
                                // xử lý thêm: gọi API, toast...
                              },
                            });
                          }}
                        >
                          ✏ Trở thành Editor
                        </button>
                        <div className="dropdown-divider" />
                      </>
                    )}
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setShowUserMenu(false);
                        openModal(SettingsModal);
                      }}
                    >
                      <Ico.Settings /> Cài đặt
                    </button>
                    <button
                      className="dropdown-item danger"
                      onClick={handleLogout}
                    >
                      <Ico.LogOut /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>

              <button
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-[#2563eb] text-white transition-colors duration-150 hover:bg-[#1d4ed8]"
                onClick={() => setShowMobileMenu(true)}
              >
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