"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/",          label: "Explorer",    icon: "explore" },
    { href: "/relations", label: "Relation Map", icon: "hub" },
    { href: "/sparql",    label: "SPARQL",       icon: "terminal" },
    { href: "/docs",      label: "Docs",         icon: "description" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#131313]/90 backdrop-blur-xl border-b border-[#ffffff08]">
      <div className="flex justify-between items-center w-full px-8 h-16 max-w-[1440px] mx-auto">

        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563eb] to-[#4f7bff] flex items-center justify-center shadow-lg shadow-[#2563eb]/20">
              <span className="material-symbols-outlined text-white text-[16px]">schema</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-headline text-[13px] font-bold text-[#e5e2e1] tracking-tight">WebDev</span>
              <span className="font-mono text-[9px] text-[#b4c5ff] tracking-widest uppercase">Semantic</span>
            </div>
          </Link>

          {/* Divider */}
          <div className="hidden md:block w-px h-5 bg-[#333333]" />

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon }) => {
              const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all ${
                    isActive
                      ? "bg-[#2563eb]/15 text-[#b4c5ff]"
                      : "text-[#838383] hover:text-[#c3c6d7] hover:bg-[#ffffff06]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">{icon}</span>
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-[#1b1b1b] border border-[#2a2a2a] hover:border-[#333333] px-3 py-2 rounded-lg transition-colors group focus-within:border-[#2563eb]/50 focus-within:bg-[#1b1b1b]">
            <span className="material-symbols-outlined text-[#555555] group-focus-within:text-[#b4c5ff] text-[16px] transition-colors">
              search
            </span>
            <input
              className="bg-transparent border-none outline-none text-xs font-mono w-36 text-[#e5e2e1] placeholder:text-[#555555] focus:ring-0"
              placeholder="Search..."
              type="text"
            />
            <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 rounded border border-[#333333] text-[9px] font-mono text-[#555555] bg-[#131313]">
              ⌘K
            </kbd>
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#2a2a2a] text-[#555555] hover:text-[#c3c6d7] hover:border-[#333333] transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">code</span>
          </a>
        </div>

      </div>
    </header>
  );
}
