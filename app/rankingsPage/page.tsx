"use client";
import { useState } from "react";
import {
  TrophyOutlined,
  CrownOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { useStoryStore } from "@/stores/storyStore";
import { useGotoStory } from "@/hooks/useGotoStory";

export function RankingsPage() {
  const { allStories } = useStoryStore();
  const gotoStory = useGotoStory();
  const [tab, setTab] = useState("reads");

  const sorted = [...allStories].sort((a, b) => {
    if (tab === "reads") return parseFloat(b.reads) - parseFloat(a.reads);
    if (tab === "rating") return (b.rating || 0) - (a.rating || 0);
    return (b.favorites || 0) - (a.favorites || 0);
  });

  const getRankStyle = (rank) => {
    if (rank === 1) return "text-yellow-500 font-black text-4xl drop-shadow-sm";
    if (rank === 2) return "text-slate-400 font-bold text-3xl drop-shadow-sm";
    if (rank === 3) return "text-amber-700 font-bold text-3xl drop-shadow-sm";
    return "text-slate-300 font-semibold text-2xl";
  };

  return (
    <div className="w-screen flex justify-center !mt-[20px]">
      <div className="flex flex-col py-12 px-4 md:px-8 font-sans w-full gap-7 mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-3 justify-center pt-[90px]">
          <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-lg shadow-yellow-500/20">
            <TrophyOutlined className="w-15 h-15 flex mx-auto items-center text-white justify-center" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
              Bảng Xếp Hạng
            </h1>
            <div className="text-slate-500 text-sm mt-1">
              Top truyện được yêu thích nhất trên nền tảng
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 h-9 justify-center w-full ">
          {[
            ["reads", "Lượt đọc"],
            ["rating", "Đánh giá"],
            ["favorites", "Yêu thích"],
          ].map(([k, l]) => (
            <button
              key={k}
              className={`w-[120px] px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                tab === k
                  ? "bg-[#1e293b] text-white shadow-sm"
                  : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
              }`}
              onClick={() => setTab(k)}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Danh sách */}
        <div className="bg-white w-full rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-10! md:gap-3 py-9! px-5!">
          {sorted.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center gap-5 p-4 md:p-6 hover:bg-slate-50 transition-colors group cursor-pointer"
              onClick={() => gotoStory(s)}
            >
              {/* Hạng */}
              <span
                className={`w-12 md:w-16 shrink-0 flex justify-center items-center font-serif transition-transform group-hover:scale-110 ${getRankStyle(i + 1)}`}
              >
                {i + 1}
              </span>

              {/* Cover */}
              <div
                className="w-14 h-20 md:w-16 md:h-24 rounded-lg shadow-md shrink-0 overflow-hidden"
                style={{
                  background: s.cover,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              {/* Thông tin */}
              <div className="flex-1 min-w-0 pr-4 flex flex-col gap-1 md:gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-lg md:text-xl font-bold text-slate-800 truncate group-hover:text-rose-600 transition-colors">
                    {s.title}
                  </div>
                  {i === 0 && (
                    <CrownOutlined className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2 truncate">
                  <span className="font-medium text-slate-700">
                    {s.penName}
                  </span>{" "}
                  · {s.genre}
                </div>
                <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs font-medium text-slate-500">
                  <span>{s.rating} ⭐</span>
                  <span>{s.reads || s.views} lượt đọc</span>
                  <span className="hidden sm:flex">{s.chapters} chương</span>
                  {tab === "favorites" && (
                    <span className="flex items-center gap-1.5 text-rose-500">
                      <HeartOutlined /> {(s.favorites || 0).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Điểm số */}
              <div className="text-left shrink-0 pl-2 md:pl-4 border-l border-slate-100 min-w-[80px]">
                <div
                  className={`font-serif text-lg md:text-2xl font-bold ${i < 3 ? "text-rose-600" : "text-slate-700"}`}
                >
                  {tab === "reads"
                    ? s.reads || s.views
                    : tab === "rating"
                      ? (s.rating || 0).toFixed(1)
                      : (s.favorites || 0).toLocaleString()}
                </div>
                <div className="text-[10px] md:text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                  {tab === "reads"
                    ? "lượt đọc"
                    : tab === "rating"
                      ? "/ 5 sao"
                      : "yêu thích"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RankingsPage;
