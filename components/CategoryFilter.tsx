"use client";
// components/CategoryFilter.tsx
import { CATEGORIES } from "@/lib/types";

interface CategoryFilterProps {
  active: string;
  onChange: (cat: string) => void;
  counts?: Record<string, number>;
}

const CATEGORY_DOTS: Record<string, string> = {
  all: "bg-[#8888aa]",
  Framework: "bg-violet-400",
  Library: "bg-blue-400",
  ORM: "bg-emerald-400",
  Database: "bg-orange-400",
  Language: "bg-pink-400",
  Runtime: "bg-yellow-400",
  CSSFramework: "bg-cyan-400",
};

export default function CategoryFilter({ active, onChange, counts }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat.value;
        const dot = CATEGORY_DOTS[cat.value] || "bg-[#8888aa]";
        const count = cat.value === "all"
          ? Object.values(counts || {}).reduce((a, b) => a + b, 0)
          : counts?.[cat.value];

        return (
          <button
            key={cat.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border
              ${isActive
                ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                : "bg-[#111118] border-[#1e1e2e] text-[#8888aa] hover:text-[#e2e2f0] hover:border-[#3f3f5e]"
              }`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dot} ${isActive ? "opacity-100" : "opacity-50"}`} />
            {cat.label}
            {count !== undefined && (
              <span className={`text-[10px] ${isActive ? "text-violet-400" : "text-[#3f3f5e]"}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
