"use client";
// components/SearchBar.tsx
import { useState, useCallback, useRef } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [value, setValue] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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

  return (
    <div className="relative w-full group">
      {/* Search icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8888aa] group-focus-within:text-violet-400 transition-colors duration-200">
        {isLoading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </div>

      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search technologies... (e.g. ORM, React, PostgreSQL)"
        className="w-full bg-[#111118] border border-[#1e1e2e] rounded-xl pl-11 pr-12 py-3.5 text-[#e2e2f0] placeholder-[#8888aa] text-sm focus:border-violet-500/60 focus:bg-[#111118] transition-all duration-200 focus:outline-none"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
        aria-label="Search technologies"
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8888aa] hover:text-[#e2e2f0] transition-colors"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Bottom glow on focus */}
      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
