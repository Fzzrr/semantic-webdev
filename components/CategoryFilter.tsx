"use client";
// components/CategoryFilter.tsx
import { CATEGORIES } from "@/lib/types";

interface CategoryFilterProps {
  active: string;
  onChange: (cat: string) => void;
  counts?: Record<string, number>;
}

const CATEGORY_ICONS: Record<string, string> = {
  all: "grid_view",
  Framework: "layers",
  Library: "inventory_2",
  ORM: "schema",
  Database: "database",
  Language: "code",
  Runtime: "terminal",
  CSSFramework: "css",
};

export default function CategoryFilter({ active, onChange, counts }: CategoryFilterProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4" role="tablist" aria-label="Filter berdasarkan kategori">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat.value;
        const icon = CATEGORY_ICONS[cat.value] || "widgets";
        const count = cat.value === "all"
          ? Object.values(counts || {}).reduce((a, b) => a + b, 0)
          : counts?.[cat.value];

        return (
          <button
            key={cat.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat.value)}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col items-center text-center group ${
              isActive
                ? "bg-[#2563eb]/10 border-[#2563eb] text-[#b4c5ff] shadow-[0_0_15px_rgba(37,99,235,0.1)] scale-[1.02]"
                : "bg-[#20201f] border-[#333333] text-[#c3c6d7] hover:bg-[#2a2a2a] hover:border-[#b4c5ff] active:scale-95"
            }`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-all ${
              isActive
                ? "bg-[#2563eb] text-[#eeefff]"
                : "bg-[#2563eb]/10 text-[#b4c5ff] group-hover:bg-[#2563eb] group-hover:text-[#eeefff]"
            }`}>
              <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            <span className="font-headline text-xs font-bold tracking-tight block mb-1">{cat.label}</span>
            {count !== undefined && (
              <span className="font-mono text-[10px] text-[#838383]">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
