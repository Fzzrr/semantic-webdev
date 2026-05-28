"use client";
// components/TechCard.tsx
import Link from "next/link";
import { getCategoryStyle } from "@/lib/sparql";

interface TechCardProps {
  name: string;
  label: string;
  type: string;
  typeLabel: string;
  description?: string;
  website?: string;
  version?: string;
  githubStars?: string;
  index?: number;
}

const TYPE_ICONS: Record<string, string> = {
  Framework: "⬡",
  Library: "◈",
  ORM: "⬖",
  Database: "⬕",
  Language: "◉",
  Runtime: "◎",
  CSSFramework: "◈",
  Technology: "◇",
};

export default function TechCard({
  name,
  label,
  type,
  typeLabel,
  description,
  website,
  version,
  githubStars,
  index = 0,
}: TechCardProps) {
  const style = getCategoryStyle(type);
  const icon = TYPE_ICONS[type] || "◇";
  const delay = Math.min(index * 40, 400);

  return (
    <Link
      href={`/tech/${name}`}
      className="block group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="tech-card card-enter border border-[#1e1e2e] bg-[#111118] rounded-xl p-5 hover:border-violet-500/40 cursor-pointer relative overflow-hidden">
        {/* Subtle gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-transparent group-hover:from-violet-500/5 transition-all duration-300 pointer-events-none" />

        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-lg ${style.text}`}>{icon}</span>
            <h3 className="font-semibold text-[#e2e2f0] text-base leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              {label}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {version && (
              <span className="mono text-[10px] text-[#8888aa] bg-[#1e1e2e] px-2 py-0.5 rounded">
                v{version}
              </span>
            )}
            <span className={`pill ${style.bg} ${style.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot} inline-block`} />
              {typeLabel || type}
            </span>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-[#8888aa] text-sm leading-relaxed line-clamp-2 mb-3">
            {description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          {githubStars && (
            <span className="flex items-center gap-1 text-[#8888aa] text-xs mono">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {githubStars}
            </span>
          )}
          <span className={`text-xs ${style.text} group-hover:underline ml-auto flex items-center gap-1`}>
            View details
            <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
