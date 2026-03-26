"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IMPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStoryStore } from "@/stores/storyStore";
import { useToast } from "@/hooks/use-toast";
import { useGotoStory } from "@/hooks/useGotoStory";
import useFollowService from "@/api/useFollow.service";
import { useAuthStore } from "@/stores";
import { BannerHomepage } from "@/components/ui/Bannerhomepage";

// Types
import { FilterState, StoryShape } from "@/types/homePage";

// Constants
import {
  DEFAULT_FILTERS,
  TOP5_LIMIT,
} from "@/utils/homePage.constants";

// Utils
import {
  toggleItem,
  countActiveFilters,
} from "@/utils/homePage.utils";

// Hooks
import {
  useCategories,
  useHotStories,
  useNewStories,
} from "@/hooks/useHomeData";

// Components
import { FilterBar } from "@/components/homePage/FilterBar";
import { HotSection, NewUpdatesSection } from "@/components/homePage/HomeSections";
import { Sidebar } from "@/components/homePage/Sidebar";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN PAGE  (state + handlers only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function HomePage() {
  const { likedStories, toggleLike } = useStoryStore();
  const gotoStory = useGotoStory();
  const router = useRouter();
  const toast = useToast();
  const { toggleFollow } = useFollowService();
  const { user } = useAuthStore();

  // Filter + pagination state
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [newPage, setNewPage] = useState(1);

  // Data hooks
  const categories = useCategories();
  const { stories: rawHot, loading: loadingHot } = useHotStories();
  const {
    stories: newStories,
    totalPages,
    loading: loadingNew,
  } = useNewStories(newPage, filters);

  // Apply client-side filters to hot stories
  const hotStories = (() => {
    let list = rawHot;
    if (filters.genres.length > 0)
      list = list.filter((s) => filters.genres.includes(s.genre));
    if (filters.status !== "all")
      list = list.filter((s) => s.status === filters.status);
    if (filters.years.length > 0)
      list = list.filter((s) =>
        filters.years.includes(new Date(s.updatedAt).getFullYear())
      );
    if (filters.sort === "views_asc")
      list = [...list].sort((a, b) => a.views - b.views);
    if (filters.sort === "views_desc")
      list = [...list].sort((a, b) => b.views - a.views);
    return list;
  })();

  const top5 = [...hotStories]
    .sort((a, b) => b.views - a.views)
    .slice(0, TOP5_LIMIT);

  /* ── Handlers ── */
  const handleFilterChange = (f: FilterState) => {
    setFilters(f);
    setNewPage(1);
  };

  const handleFilterReset = () => {
    setFilters(DEFAULT_FILTERS);
    setNewPage(1);
  };

  const handlePageChange = (p: number) => {
    setNewPage(p);
    document
      .getElementById("new-updates-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleLike = async (id: number, wasLiked: boolean) => {
    if (!user) { router.push("?login"); return; }
    toggleLike(id); // optimistic update
    try {
      await toggleFollow(id);
      toast.success(wasLiked ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích ❤");
    } catch {
      toggleLike(id); // rollback on error
      toast.error("Không thể thực hiện. Thử lại sau.");
    }
  };

  const handleGenreToggle = (name: string) => {
    setFilters((f) => ({ ...f, genres: toggleItem(f.genres, name) }));
    setNewPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeCount = countActiveFilters(filters);

  /* ── Render ── */
  return (
    <div className="fade-in">

      {/* 1. Banner */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <BannerHomepage />
      </div>

      {/* 2. Filter toggle button */}
      <div className="section" style={{ paddingBottom: 0, paddingTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setFilterOpen((o) => !o)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "7px 16px",
              borderRadius: 20,
              border: "1.5px solid",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.18s",
              background: filterOpen ? "#c23d3f" : "#fff",
              color: filterOpen ? "#fff" : "#6b5a4e",
              borderColor: filterOpen ? "#c23d3f" : "#e8d8c8",
              boxShadow: filterOpen
                ? "0 2px 10px rgba(194,61,63,0.25)"
                : "none",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 3h12M3 7h8M5 11h4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            Bộ lọc
            {activeCount > 0 && (
              <span
                style={{
                  background: filterOpen
                    ? "rgba(255,255,255,0.3)"
                    : "#c23d3f",
                  color: "#fff",
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "1px 6px",
                }}
              >
                {activeCount}
              </span>
            )}
            <span style={{ fontSize: 11, opacity: 0.7 }}>
              {filterOpen ? "▲" : "▼"}
            </span>
          </button>

          {/* Active filter preview pills (when panel closed) */}
          {!filterOpen &&
            (filters.genres.length > 0 || filters.status !== "all") && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {filters.genres.map((g) => (
                  <span
                    key={g}
                    style={{
                      fontSize: 11,
                      background: "#fde8e8",
                      color: "#c23d3f",
                      border: "1px solid #f5c0c0",
                      borderRadius: 20,
                      padding: "2px 10px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {g}
                    <button
                      onClick={() =>
                        handleFilterChange({
                          ...filters,
                          genres: filters.genres.filter((x) => x !== g),
                        })
                      }
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#c23d3f",
                        fontSize: 11,
                        padding: 0,
                      }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
                {filters.status !== "all" && (
                  <span
                    style={{
                      fontSize: 11,
                      background: "#f0fdf4",
                      color: "#16a34a",
                      border: "1px solid #bbf7d0",
                      borderRadius: 20,
                      padding: "2px 10px",
                      fontWeight: 600,
                    }}
                  >
                    {filters.status === "done" ? "Hoàn thành" : "Đang ra"}
                  </span>
                )}
              </div>
            )}
        </div>

        {filterOpen && (
          <div style={{ marginTop: 10, animation: "slideDown 0.2s ease" }}>
            <FilterBar
              categories={categories}
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleFilterReset}
            />
          </div>
        )}
      </div>

      {/* 3. Main grid: content left | sidebar right */}
      <div
        className="section"
        style={{
          paddingTop: 20,
          display: "flex",
          flexWrap: "wrap",
          gap: 28,
          alignItems: "start",
        }}
      >
        <div style={{ flex: "1 1 0%", minWidth: 280 }}>
          <HotSection
            stories={hotStories}
            loading={loadingHot}
            filters={filters}
            onStory={gotoStory}
            likedStories={likedStories}
            onLike={handleLike}
          />
          <NewUpdatesSection
            stories={newStories}
            loading={loadingNew}
            page={newPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onStory={gotoStory}
          />
        </div>
        <div style={{ width: 300, flexShrink: 0, maxWidth: "100%" }}>
          <Sidebar
            top5={top5}
            categories={categories}
            filters={filters}
            onStory={gotoStory}
            onGenreToggle={handleGenreToggle}
          />
        </div>
      </div>
    </div>
  );
}

export default HomePage;