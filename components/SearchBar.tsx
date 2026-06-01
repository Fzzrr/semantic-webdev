"use client";
// components/SearchBar.tsx
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import TechLogo from "@/components/TechLogo";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{ name: string; label: string; type?: string; description?: string; website?: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setValue(v);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearch(v.trim());
        // fetch suggestions
        if (v.trim()) {
          fetch(`/api/sparql?q=${encodeURIComponent(v.trim())}`)
            .then((r) => r.ok ? r.json() : [])
            .then((data: any[]) => {
              const items = Array.isArray(data)
                ? data.slice(0, 8).map((i) => ({ name: i.name, label: i.label, type: i.type, description: i.description, website: i.website }))
                : [];
              setSuggestions(items);
              setShowSuggestions(true);
            })
            .catch(() => {
              setSuggestions([]);
              setShowSuggestions(false);
            });
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }, 300);
    },
    [onSearch]
  );

  const handleClear = () => {
    setValue("");
    onSearch("");
    setSuggestions([]);
    setShowSuggestions(false);
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
    <div className="relative w-full group">
      {/* Search icon */}
      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#b4c5ff] text-xl transition-colors duration-200">
        {isLoading ? "sync" : "search"}
      </span>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Cari teknologi, framework, atau dependensi..."
        className="w-full bg-[#212121] border border-[#333333] rounded-xl py-3 px-12 font-headline text-base focus:ring-1 focus:ring-[#b4c5ff] focus:border-[#b4c5ff] outline-none text-[#e5e2e1] transition-all shadow-sm focus:outline-none"
        aria-label="Cari teknologi"
        onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
        onBlur={() => { setTimeout(() => setShowSuggestions(false), 150); }}
      />

      {/* Shortcuts or Clear button */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
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

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-[#1b1b1b] border border-[#333333] rounded-lg shadow-xl z-20 overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s.name}
              onMouseDown={(e) => { e.preventDefault(); }}
              onClick={() => {
                setValue(s.label);
                onSearch(s.label);
                setShowSuggestions(false);
                router.push(`/tech/${encodeURIComponent(s.name)}`);
              }}
              className="w-full text-left px-3 py-2 hover:bg-[#2a2a2a] transition-colors flex items-start gap-3"
            >
              <TechLogo label={s.label} name={s.name} website={s.website} size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-headline text-sm text-[#e5e2e1]">{s.label}</span>
                  <span className="text-[11px] text-[#838383] font-mono">{s.type}</span>
                </div>
                {s.description && (
                  <p className="text-[12px] text-[#bfc3d6] mt-1 line-clamp-2">{s.description}</p>
                )}
                {s.website && (
                  <div className="text-[11px] text-[#838383] font-mono mt-1">{s.website.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Bottom glow on focus */}
      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-[#b4c5ff] to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
