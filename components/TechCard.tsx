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
  const delay = Math.min(index * 40, 400);

  // Initial letter placeholder as logo
  const initial = label.substring(0, 2).toUpperCase();

  // Custom border color if it is Next.js for high premium feel
  const isSpecial = name.toLowerCase() === "nextjs";
  const borderClass = isSpecial ? "border-[#2563eb]/40 bg-[#20201f]/80" : "border-[#333333] bg-[#20201f]";

  return (
    <Link
      href={`/tech/${name}`}
      className="block group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`tech-card card-enter border p-5 rounded-xl transition-all flex items-start gap-5 relative overflow-hidden ${borderClass}`}>
        {version && (
          <div className="absolute top-0 right-0 bg-[#2563eb]/10 px-3 py-1 text-[10px] font-mono text-[#b4c5ff] border-b border-l border-[#2563eb]/20">
            v{version}
          </div>
        )}

        {/* Pseudo image/logo placeholder matching mockup premium visual */}
        <div className="w-14 h-14 bg-[#131313] rounded-lg flex items-center justify-center border border-[#333333] overflow-hidden shrink-0">
          <span className="font-headline font-bold text-lg text-[#b4c5ff]">{initial}</span>
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-headline text-lg font-bold text-[#e5e2e1] group-hover:text-[#b4c5ff] transition-colors">{label}</h4>
            <span className="bg-[#353535] text-[#b4c5ff] font-mono text-[10px] px-2 py-0.5 rounded border border-[#333333]">
              {githubStars ? `${githubStars} Stars` : "Terverifikasi"}
            </span>
          </div>
          <p className="text-[#c3c6d7] text-xs font-body mb-4 leading-relaxed line-clamp-2">
            {description || "Tidak ada deskripsi yang tersedia untuk teknologi ini."}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-[#1b1b1b] border border-[#333333] px-2 py-0.5 rounded text-[10px] font-mono text-[#c6c6c6]">
              #{typeLabel || type}
            </span>
            {website && (
              <span className="bg-[#1b1b1b] border border-[#333333] px-2 py-0.5 rounded text-[10px] font-mono text-[#838383]">
                {website.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
