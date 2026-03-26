import React from "react";
import { CategoryItem } from "@/api/useCategory.service";
import { FilterState } from "@/types/homePage";
import {
  YEAR_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
} from "@/utils/homePage.constants";
import { toggleItem, countActiveFilters } from "@/utils/homePage.utils";

interface FilterBarProps {
  categories: CategoryItem[];
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onReset: () => void;
}

export function FilterBar({
  categories,
  filters,
  onChange,
  onReset,
}: FilterBarProps) {
  const pill = (
    active: boolean,
    color = "#c23d3f"
  ): React.CSSProperties => ({
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    border: "1.5px solid",
    cursor: "pointer",
    transition: "all 0.15s",
    fontWeight: active ? 700 : 500,
    background: active ? color : "#fdf7f0",
    color: active ? "#fff" : "#6b5a4e",
    borderColor: active ? color : "#e8d8c8",
  });

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #f0e4d8",
        borderRadius: 14,
        padding: "14px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
      }}
    >
      {/* Genre */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#6b5a4e",
            minWidth: 80,
            paddingTop: 4,
            flexShrink: 0,
          }}
        >
          📚 Thể loại
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <button
            onClick={() => onChange({ ...filters, genres: [] })}
            style={pill(filters.genres.length === 0)}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                onChange({
                  ...filters,
                  genres: toggleItem(filters.genres, cat.name),
                })
              }
              style={pill(filters.genres.includes(cat.name))}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: "#f5ede4" }} />

      {/* Year + Status + Sort row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        {/* Year */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#6b5a4e",
              whiteSpace: "nowrap",
            }}
          >
            📅 Năm
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {YEAR_OPTIONS.map((yr) => (
              <button
                key={yr}
                onClick={() =>
                  onChange({
                    ...filters,
                    years: toggleItem(filters.years, yr),
                  })
                }
                style={{
                  ...pill(filters.years.includes(yr), "#1c1512"),
                  padding: "3px 10px",
                  borderRadius: 6,
                }}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#6b5a4e",
              whiteSpace: "nowrap",
            }}
          >
            🔖 Tình trạng
          </span>
          <div style={{ display: "flex", gap: 5 }}>
            {STATUS_OPTIONS.map((opt) => {
              const c =
                opt.value === "done"
                  ? "#16a34a"
                  : opt.value === "ongoing"
                  ? "#d97706"
                  : "#6b5a4e";
              return (
                <button
                  key={opt.value}
                  onClick={() =>
                    onChange({
                      ...filters,
                      status: opt.value as FilterState["status"],
                    })
                  }
                  style={{
                    ...pill(filters.status === opt.value, c),
                    padding: "3px 12px",
                    borderRadius: 6,
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginLeft: "auto",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#6b5a4e",
              whiteSpace: "nowrap",
            }}
          >
            ↕ Sắp xếp
          </span>
          <div style={{ display: "flex", gap: 5 }}>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange({ ...filters, sort: opt.value })}
                style={{
                  ...pill(filters.sort === opt.value, "#3b82f6"),
                  padding: "3px 12px",
                  borderRadius: 6,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {countActiveFilters(filters) > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 11, color: "#9e8e82" }}>Đang lọc:</span>
          {filters.genres.map((g) => (
            <span
              key={g}
              style={{
                fontSize: 11,
                background: "#fde8e8",
                color: "#c23d3f",
                border: "1px solid #f5c0c0",
                borderRadius: 20,
                padding: "1px 8px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {g}
              <button
                onClick={() =>
                  onChange({
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
          {filters.years.map((y) => (
            <span
              key={y}
              style={{
                fontSize: 11,
                background: "#f0f0f0",
                color: "#1c1512",
                border: "1px solid #ddd",
                borderRadius: 20,
                padding: "1px 8px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {y}
              <button
                onClick={() =>
                  onChange({
                    ...filters,
                    years: filters.years.filter((x) => x !== y),
                  })
                }
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#555",
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
                padding: "1px 8px",
                fontWeight: 600,
              }}
            >
              {STATUS_OPTIONS.find((o) => o.value === filters.status)?.label}
            </span>
          )}
          <button
            onClick={onReset}
            style={{
              fontSize: 11,
              color: "#9e8e82",
              background: "none",
              border: "1px solid #e8d8c8",
              borderRadius: 20,
              padding: "1px 10px",
              cursor: "pointer",
            }}
          >
            Xoá tất cả
          </button>
        </div>
      )}
    </div>
  );
}
