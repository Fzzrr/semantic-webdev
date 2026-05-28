"use client";
// components/Navbar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <nav className="sticky top-0 z-50 border-b border-[#1e1e2e] bg-[#0a0a0f]/80 backdrop-blur-md">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-6 h-6 rounded-md bg-violet-500/20 border border-violet-500/30 flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
            <span className="text-violet-400 text-xs">⬡</span>
          </div>
          <span className="text-sm font-semibold text-[#e2e2f0]" style={{ fontFamily: "'Syne', sans-serif" }}>
            WebDev<span className="text-violet-400">Semantic</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className={`text-xs transition-colors ${isHome ? "text-violet-400" : "text-[#8888aa] hover:text-[#e2e2f0]"}`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            /explore
          </Link>
          <a
            href="https://jena.apache.org/documentation/fuseki2/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#8888aa] hover:text-[#e2e2f0] transition-colors"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Fuseki↗
          </a>
        </div>
      </div>
    </nav>
  );
}
