import React from "react";
import { YEARS, SortOption, SORT_OPTIONS } from "@/utils/favoritesPage.constants";
import { getPillStyle } from "@/utils/favoritesPage.utils";

interface FavFiltersProps {
  genres: string[];
  filterGenre: string;
  onGenreChange: (genre: string) => void;
  filterYear: string;
  onYearChange: (year: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function FavFilters({
  genres,
  filterGenre,
  onGenreChange,
  filterYear,
  onYearChange,
  sortBy,
  onSortChange,
}: FavFiltersProps) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8e0d6",
        borderRadius: 12,
        padding: "24px",
        marginBottom: 32,
        boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
      }}
    >
      {/* Row 1: Genre */}
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontWeight: 600,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 6,
            minWidth: 90,
            paddingTop: 6,
            color: "#3d2f28",
          }}
        >
          📚 Thể loại
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <button
            style={getPillStyle(filterGenre === "all", "#c23d3f")}
            onClick={() => onGenreChange("all")}
          >
            Tất cả
          </button>
          {genres.map((g) => (
            <button
              key={g}
              style={getPillStyle(filterGenre === g, "#c23d3f")}
              onClick={() => onGenreChange(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: "#f0ebe4", marginBottom: 20 }} />

      {/* Row 2: Year */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 6,
            minWidth: 50,
            paddingTop: 6,
            color: "#3d2f28",
          }}
        >
          📅 Năm
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {YEARS.map((y) => (
            <button
              key={y}
              style={getPillStyle(filterYear === y, "#c23d3f")}
              onClick={() => onYearChange(filterYear === y ? "" : y)}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Row 3: Sort (right-aligned) */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginTop: 16,
        }}
      >
        <div
          style={{
            fontWeight: 600,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginRight: 16,
            color: "#3d2f28",
          }}
        >
          ↕ Sắp xếp
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              style={getPillStyle(sortBy === opt.value, "#3b82f6")}
              onClick={() => onSortChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
