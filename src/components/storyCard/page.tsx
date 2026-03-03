"use client";
import { Ico } from "@/components/Icons";
export function StoryCard({ story, onStory, liked, onLike }) {
  return (
    <div
      className="group flex cursor-pointer flex-col gap-3 transition-transform duration-200 hover:-translate-y-1"
      onClick={onStory}
    >
      {/* Cover Image Section */}
      <div className="relative aspect-[1/1.35] w-full overflow-hidden rounded-xl">
        <div
          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
          style={{
            background: story.cover,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Like Button */}
        <button
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border-none bg-black/35 transition-transform active:scale-90"
          style={{ color: liked ? "#c23d3f" : "white" }}
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
        >
          <Ico.Heart f={liked} />
        </button>
      </div>

      {/* Info Section */}
      <div className="flex flex-col">
        <div className="line-clamp-2 min-h-[2em] font-playfair text-sm font-bold leading-tight text-[#1c1512] transition-colors group-hover:text-[#c23d3f]">
          {story.title}
        </div>

        <div className="mt-1 text-[12px] text-[#9e8e82]">
          bởi{" "}
          <span className="font-medium text-[#c23d3f]">{story.penName}</span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[12px] text-[#b8921e]">
            <Ico.Star f s={12} />
            {story.rating > 0 ? story.rating.toFixed(1) : "Mới"}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#b0a096]">
            <Ico.Eye />
            {story.reads}
          </div>
        </div>

        <div className="mt-2">
          <span className="inline-flex items-center justify-center rounded-full bg-[#f4ebe1] px-3 py-1 text-[12px] font-medium leading-none text-[#8b6a54]">
            {story.genre}
          </span>
        </div>
      </div>
    </div>
  );
}
