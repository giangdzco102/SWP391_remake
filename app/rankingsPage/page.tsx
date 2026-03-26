"use client";
import { useState, useEffect } from "react";
import {
  TrophyOutlined,
  CrownOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import useStoryService from "@/api/useStory.service";
import { useGotoStory } from "@/hooks/useGotoStory";
import { RankedStory } from "@/types/rankingsPage";
import { PAGE_SIZE } from "@/utils/rankingsPage.constants";
import { toStoryShape, getRankStyle } from "@/utils/rankingsPage.utils";
import { Pagination } from "@/components/rankingsPage/Pagination";

export function RankingsPage() {
  const { getAllStories } = useStoryService();
  const gotoStory = useGotoStory();
  const [tab, setTab] = useState("reads");
  const [page, setPage] = useState(1);
  const [allStories, setAllStories] = useState<RankedStory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAllStories({ size: 200 })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((res: any) => {
        const list: any[] = Array.isArray(res?.data?.content) ? res.data.content
          : Array.isArray(res?.data) ? res.data
          : Array.isArray(res) ? res : [];
        setAllStories(list.map(toStoryShape));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sorted = [...allStories].sort((a, b) => {
    if (tab === "reads") return (b.views || 0) - (a.views || 0);
    if (tab === "rating") return (b.rating || 0) - (a.rating || 0);
    return (b.favorites || 0) - (a.favorites || 0);
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const rankOffset = (page - 1) * PAGE_SIZE;

  const handleTabChange = (t: string) => { setTab(t); setPage(1); };
  const handlePageChange = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  if (loading) return (
    <div className="w-screen flex justify-center !mt-[20px]">
      <div className="flex flex-col py-12 px-4 font-sans w-full gap-7 mx-auto max-w-7xl items-center pt-[120px]">
        <div style={{ fontSize: 14, color: "#9e8e82" }}>⏳ Đang tải bảng xếp hạng...</div>
      </div>
    </div>
  );

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
              onClick={() => handleTabChange(k)}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Danh sách */}
        <div className="bg-white w-full rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-10! md:gap-3 py-9! px-5!">
          {paged.map((s, i) => {
            const rank = rankOffset + i + 1;
            return (
              <div
                key={s.id}
                className="flex items-center gap-5 p-4 md:p-6 hover:bg-slate-50 transition-colors group cursor-pointer"
                onClick={() => gotoStory(s)}
              >
                {/* Hạng */}
                <span
                  className={`w-12 md:w-16 shrink-0 flex justify-center items-center font-serif transition-transform group-hover:scale-110 ${getRankStyle(rank)}`}
                >
                  {rank}
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
                    {rank === 1 && (
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
                    className={`font-serif text-lg md:text-2xl font-bold ${rank < 4 ? "text-rose-600" : "text-slate-700"}`}
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
            );
          })}

          {/* Pagination */}
          <div className="px-4 md:px-6 pb-2">
            <Pagination current={page} total={totalPages} onChange={handlePageChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RankingsPage;