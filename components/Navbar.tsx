"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/",          label: "Explorer",     icon: "explore" },
    { href: "/relations", label: "Relation Map", icon: "hub" },
    { href: "/sparql",    label: "SPARQL",       icon: "terminal" },
    { href: "/docs",      label: "Docs",         icon: "description" },
  ];

  const isActiveHref = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Tutup menu mobile setiap kali pindah halaman.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#131313]/90 backdrop-blur-xl border-b border-[#ffffff0d]">
      <div className="flex items-center gap-3 md:gap-5 w-full px-4 sm:px-6 lg:px-8 h-16 max-w-[1440px] mx-auto">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563eb] to-[#4f7bff] flex items-center justify-center shadow-lg shadow-[#2563eb]/20 transition-transform group-hover:scale-105 group-active:scale-95">
            <span className="material-symbols-outlined text-white text-[16px]">schema</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-headline text-[13px] font-bold text-[#e5e2e1] tracking-tight">WebDev</span>
            <span className="font-mono text-[9px] text-[#b4c5ff] tracking-widest uppercase">Semantic</span>
          </div>
        </Link>

        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-[#2a2a2a]" />

        {/* Nav Links (desktop) — rata kiri, interaktif */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map(({ href, label, icon }) => {
            const isActive = isActiveHref(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all duration-150 active:scale-95 ${
                  isActive
                    ? "bg-[#2563eb]/15 text-[#b4c5ff] ring-1 ring-inset ring-[#2563eb]/30"
                    : "text-[#838383] hover:text-[#e5e2e1] hover:bg-[#ffffff0a]"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[15px] transition-colors ${
                    isActive ? "text-[#b4c5ff]" : "text-[#6f6f6f] group-hover:text-[#b4c5ff]"
                  }`}
                >
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Hamburger (mobile) — pinned right */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          className="md:hidden ml-auto flex items-center justify-center w-9 h-9 rounded-lg border border-[#2a2a2a] text-[#c3c6d7] hover:border-[#2563eb]/40 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">{menuOpen ? "close" : "menu"}</span>
        </button>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <nav className="md:hidden border-t border-[#ffffff0d] bg-[#131313]/95 backdrop-blur-xl px-4 py-3 space-y-1">
          {navLinks.map(({ href, label, icon }) => {
            const isActive = isActiveHref(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-all ${
                  isActive
                    ? "bg-[#2563eb]/15 text-[#b4c5ff] ring-1 ring-inset ring-[#2563eb]/30"
                    : "text-[#c3c6d7] hover:text-[#e5e2e1] hover:bg-[#ffffff0a]"
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${isActive ? "text-[#b4c5ff]" : "text-[#6f6f6f]"}`}>
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
