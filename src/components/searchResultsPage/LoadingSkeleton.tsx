import React from "react";

export function LoadingSkeleton() {
  return (
    <div className="story-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 animate-pulse">
          <div className="aspect-[1/1.35] w-full rounded-xl bg-[#f0e8df]" />
          <div className="h-3.5 w-4/5 rounded bg-[#f0e8df]" />
          <div className="h-3 w-1/2 rounded bg-[#f0e8df]" />
        </div>
      ))}
    </div>
  );
}
