"use client";

import TechLogo from "@/components/TechLogo";
import { useState } from "react";

interface NodeItem {
  prop: string;
  target: { name: string; label: string; website?: string };
}

interface RelationGraphProps {
  center: { name: string; label: string; website?: string };
  nodes: NodeItem[];
  size?: number;
}

export default function RelationGraph({ center, nodes, size = 200 }: RelationGraphProps) {
  const radius = Math.min(80, Math.floor(size / 2) - 40);
  const cx = size / 2;
  const cy = size / 2;

  const positioned = nodes.map((n, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    return { ...n, x, y };
  });

  const [hovered, setHovered] = useState<number | null>(null);

  function formatPropLabel(prop: string) {
    // convert camelCase or snake_case to Title Case
    const spaced = prop.replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ");
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  }

  return (
    <div className="w-full flex items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="absolute inset-0" width={size} height={size}>
          {positioned.map((p, idx) => (
            <line
              key={idx}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke={hovered === idx ? "#2563eb" : "#2a2a2a"}
              strokeWidth={hovered === idx ? 3 : 2}
              strokeLinecap="round"
            />
          ))}
        </svg>

        {/* center */}
        <div style={{ position: "absolute", left: cx - 28, top: cy - 28 }}>
          <div className="flex items-center justify-center">
            <div className="w-14 h-14 rounded-md bg-[#131313] flex items-center justify-center">
              <TechLogo label={center.label} name={center.name} website={center.website} size="sm" />
            </div>
          </div>
        </div>

        {/* surrounding nodes */}
        {positioned.map((p, idx) => (
          <div
            key={idx}
            style={{ position: "absolute", left: p.x - 24, top: p.y - 24 }}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className={`w-12 h-12 rounded-md bg-[#131313] ${hovered === idx ? "ring-2 ring-[#2563eb]/40" : ""} flex items-center justify-center`}>
              <TechLogo label={p.target.label} name={p.target.name} website={p.target.website} size="sm" />
            </div>

            {/* tooltip */}
            {hovered === idx && (
              <div className="absolute left-12 top-0 ml-2 bg-[#111111] border border-[#333333] text-xs text-[#e5e2e1] px-2 py-1 rounded shadow-md w-40">
                <div className="font-headline text-sm font-bold">{p.target.label}</div>
                <div className="text-[11px] text-[#838383]">{formatPropLabel(p.prop)}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
