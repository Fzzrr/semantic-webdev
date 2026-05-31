"use client";
// components/SearchBar.tsx
import { useState, useCallback, useRef, useEffect } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [value, setValue] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setValue(v);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearch(v.trim());
      }, 300);
    },
    [onSearch]
  );

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto group">
      {/* Search icon */}
      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#b4c5ff] text-2xl transition-colors duration-200">
        {isLoading ? "sync" : "search"}
      </span>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Cari teknologi, framework, atau dependensi..."
        className="w-full bg-[#212121] border border-[#333333] rounded-xl py-5 px-14 font-headline text-lg focus:ring-1 focus:ring-[#b4c5ff] focus:border-[#b4c5ff] outline-none text-[#e5e2e1] transition-all shadow-2xl focus:outline-none"
        aria-label="Cari teknologi"
      />

      {/* Shortcuts or Clear button */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {value ? (
          <button
            onClick={handleClear}
            className="text-[#838383] hover:text-[#e5e2e1] transition-colors p-1"
            aria-label="Hapus pencarian"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        ) : (
          <>
            <span className="bg-[#20201f] px-2 py-1 rounded text-[10px] font-bold text-[#838383] border border-[#333333] font-mono">
              CTRL
            </span>
            <span className="bg-[#20201f] px-2 py-1 rounded text-[10px] font-bold text-[#838383] border border-[#333333] font-mono">
              K
            </span>
          </>
        )}
      </div>

      {/* Bottom glow on focus */}
      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-[#b4c5ff] to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
