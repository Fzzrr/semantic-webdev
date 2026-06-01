"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/",       label: "Explorer" },
    { href: "/sparql", label: "SPARQL" },
    { href: "/docs",   label: "Docs" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#131313]/80 backdrop-blur-md border-b border-[#333333]">
      <div className="flex justify-between items-center w-full px-8 h-16 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-headline text-lg font-bold text-[#b4c5ff] tracking-tight">
              WebDev <span className="text-[#e5e2e1]">Semantic</span>
            </span>
          </Link>
          <nav className="hidden md:flex gap-6 ml-6">
            {navLinks.map(({ href, label }) => {
              const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`font-body text-sm transition-colors ${
                    isActive
                      ? "text-[#b4c5ff] border-b-2 border-[#b4c5ff] pb-1 font-semibold"
                      : "text-[#c3c6d7] hover:text-[#b4c5ff]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-[#2a2a2a] px-3 py-1.5 rounded-lg border border-[#333333] group focus-within:border-[#b4c5ff] transition-all">
            <span className="material-symbols-outlined text-[#c3c6d7] group-focus-within:text-[#b4c5ff] mr-2 text-[18px]">
              search
            </span>
            <input
              className="bg-transparent border-none outline-none text-xs font-mono w-40 text-[#e5e2e1] placeholder:text-[#838383] focus:ring-0 focus:outline-none"
              placeholder="Shortcut (Ctrl + K)"
              type="text"
            />
          </div>

        </div>
      </div>
    </header>
  );
}
