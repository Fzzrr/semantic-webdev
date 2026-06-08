"use client";
// components/TechCard.tsx
import { getCategoryStyle } from "@/lib/sparql";
import TechLogo from "@/components/TechLogo";

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

  // Custom border color if it is Next.js for high premium feel
  const isSpecial = name.toLowerCase() === "nextjs";
  const borderClass = isSpecial ? "border-[#2563eb]/40 bg-[#20201f]/80" : "border-[#333333] bg-[#20201f]";

  return (
    <div className="block group h-full" style={{ animationDelay: `${delay}ms` }}>
      <div className={`tech-card card-enter border p-5 rounded-xl transition-all flex items-start gap-5 relative overflow-hidden h-full ${borderClass}`}>
        {version && (
          <div className="absolute top-0 right-0 bg-[#2563eb]/10 px-3 py-1 text-[10px] font-mono text-[#b4c5ff] border-b border-l border-[#2563eb]/20">
            v{version}
          </div>
        )}

        <TechLogo label={label} name={name} website={website} size="md" />

        <div className="flex-1 flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-headline text-lg font-bold text-[#e5e2e1] group-hover:text-[#b4c5ff] transition-colors">{label}</h4>
              <span className="bg-[#353535] text-[#b4c5ff] font-mono text-[10px] px-2 py-0.5 rounded border border-[#333333]">
                {githubStars ? `${githubStars} Stars` : "Verified"}
              </span>
            </div>

            <p className="text-[#c3c6d7] text-xs font-body mb-4 leading-relaxed line-clamp-3 flex-1">
              {description || "No description available for this technology."}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="bg-[#1b1b1b] border border-[#333333] px-2 py-0.5 rounded text-[10px] font-mono text-[#c6c6c6]">
              {typeLabel || type}
            </span>
            {website && (
              <span className="bg-[#1b1b1b] border border-[#333333] px-2 py-0.5 rounded text-[10px] font-mono text-[#838383]">
                {website.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
