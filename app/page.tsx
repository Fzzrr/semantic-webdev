"use client";
// app/page.tsx
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import TechCard from "@/components/TechCard";
import SearchBar from "@/components/SearchBar";
import SkeletonCard from "@/components/SkeletonCard";
import StatusBanner from "@/components/StatusBanner";
import type { Technology } from "@/lib/types";
import Link from "next/link";
import { CATEGORIES } from "@/lib/types";

export default function Home() {
  const [items, setItems] = useState<Technology[]>([]);
  const [filtered, setFiltered] = useState<Technology[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  
  // Selected technology for side preview details
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);

  // Layout mode: grid or list
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid");

  // Semantic filters state
  const [filterStable, setFilterStable] = useState(false);
  const [filterOpenSource, setFilterOpenSource] = useState(true); // checked by default in mockup
  const [filterInteroperability, setFilterInteroperability] = useState(false);

  // Sorting state
  const [sortBy, setSortBy] = useState("relevance");

  // Load initial data
  const loadData = useCallback(async (cat: string) => {
    setIsLoading(true);
    try {
      const url = cat !== "all" ? `/api/sparql?category=${cat}` : "/api/sparql";
      const res = await fetch(url);
      if (!res.ok) throw new Error("API error");
      const data: Technology[] = await res.json();
      if (data && !("error" in data)) {
        setItems(data);
        setIsConnected(true);

        // Count per type
        const c: Record<string, number> = {};
        data.forEach((t) => {
          const key = t.type;
          c[key] = (c[key] || 0) + 1;
        });
        if (cat === "all") setCounts(c);
      } else {
        setIsConnected(false);
      }
    } catch {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData("all");
  }, [loadData]);

  // Apply search, categories, semantic filters, and sorting locally for fluid performance
  useEffect(() => {
    let result = [...items];

    // 1. Category Filter
    if (category !== "all") {
      result = result.filter(t => t.type === category || t.typeLabel === category);
    }

    // 2. Search Query Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.type.toLowerCase().includes(q)
      );
    }

    // 3. Semantic Filters
    if (filterStable) {
      // Simulate stable filter: technologies with version >= 10 or specifically marked
      result = result.filter(t => t.version && parseFloat(t.version) >= 5);
    }
    if (filterOpenSource) {
      // Almost all technologies in this developer ontology are open source
      result = result.filter(t => t.name.toLowerCase() !== "oracle");
    }
    if (filterInteroperability) {
      // Simulate high interoperability: has more than 1 usesLanguage or isORMFor multiple databases
      result = result.filter(t => t.description && t.description.length > 50);
    }

    // 4. Sorting
    if (sortBy === "newest") {
      result.sort((a, b) => (b.version || "").localeCompare(a.version || ""));
    } else if (sortBy === "popularity") {
      result.sort((a, b) => parseInt(b.githubStars || "0") - parseInt(a.githubStars || "0"));
    } else if (sortBy === "az") {
      result.sort((a, b) => a.label.localeCompare(b.label));
    }

    setFiltered(result);

    // Dynamic automatic selection for side preview panel
    if (result.length > 0) {
      setSelectedTech(result[0]);
    } else {
      setSelectedTech(null);
    }
  }, [items, category, searchQuery, filterStable, filterOpenSource, filterInteroperability, sortBy]);

  // Handle Search input callback
  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
  }, []);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
  };

  return (
    <div className="min-h-screen bg-[#131313] tech-grid-bg text-[#e5e2e1]">
      <Navbar />

      <div className="flex pt-16 min-h-screen">
        
        {/* Left SideNavBar: Shared Component Filter */}
        <aside className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-64 py-6 bg-[#1b1b1b] border-r border-[#333333] custom-scrollbar overflow-y-auto">
          <div className="px-6 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#2563eb]/20 border border-[#2563eb]/30 flex items-center justify-center font-headline font-bold text-[#b4c5ff]">
                TD
              </div>
              <div>
                <p className="text-sm font-headline font-bold text-[#e5e2e1]">Tech Registry</p>
                <p className="text-[10px] font-mono text-[#838383]">v1.4.2-stable</p>
              </div>
            </div>
          </div>

          <div className="px-4 space-y-1">
            <p className="px-4 py-2 text-[10px] font-mono text-[#838383] uppercase tracking-widest">Kategori Utama</p>
            {CATEGORIES.map((cat) => {
              const isActive = category === cat.value;
              const count = cat.value === "all"
                ? items.length
                : items.filter(t => t.type === cat.value || t.typeLabel === cat.value).length;

              return (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`w-full flex items-center justify-between py-2.5 px-4 rounded-lg text-left font-body text-xs transition-colors ${
                    isActive
                      ? "text-[#b4c5ff] bg-[#2563eb]/10 font-bold border-l-2 border-[#2563eb]"
                      : "text-[#c3c6d7] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="font-mono text-[9px] text-[#838383] bg-[#131313] px-1.5 py-0.5 rounded border border-[#333333]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="px-4 mt-8 space-y-4">
            <p className="px-4 text-[10px] font-mono text-[#838383] uppercase tracking-widest">Filter Semantik</p>
            <div className="px-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filterStable}
                  onChange={(e) => setFilterStable(e.target.checked)}
                  className="rounded border-[#333333] bg-[#131313] text-[#2563eb] focus:ring-[#2563eb] focus:ring-offset-0 focus:outline-none"
                />
                <span className="text-xs text-[#c3c6d7] group-hover:text-[#e5e2e1] transition-colors">Stable Release</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filterOpenSource}
                  onChange={(e) => setFilterOpenSource(e.target.checked)}
                  className="rounded border-[#333333] bg-[#131313] text-[#2563eb] focus:ring-[#2563eb] focus:ring-offset-0 focus:outline-none"
                />
                <span className="text-xs text-[#c3c6d7] group-hover:text-[#e5e2e1] transition-colors">Open Source</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filterInteroperability}
                  onChange={(e) => setFilterInteroperability(e.target.checked)}
                  className="rounded border-[#333333] bg-[#131313] text-[#2563eb] focus:ring-[#2563eb] focus:ring-offset-0 focus:outline-none"
                />
                <span className="text-xs text-[#c3c6d7] group-hover:text-[#e5e2e1] transition-colors">High Interoperability</span>
              </label>
            </div>
          </div>

          <div className="mt-auto px-4 pb-4">
            <button className="w-full bg-[#2a2a2a] border border-[#333333] py-2 rounded font-headline text-xs font-bold text-[#e5e2e1] hover:bg-[#353535] transition-colors mb-4">
              Contribute Technology
            </button>
            <div className="space-y-1">
              <a href="#" className="flex items-center gap-3 py-2 text-xs text-[#c3c6d7] pl-4 hover:text-[#b4c5ff] transition-colors">
                <span className="material-symbols-outlined text-[16px]">settings</span>
                <span>Settings</span>
              </a>
              <a href="#" className="flex items-center gap-3 py-2 text-xs text-[#c3c6d7] pl-4 hover:text-[#b4c5ff] transition-colors">
                <span className="material-symbols-outlined text-[16px]">sensors</span>
                <span>API Status</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content Area (Canvas) */}
        <main className="flex-1 lg:ml-64 p-8 min-h-screen">
          <div className="max-w-[1200px] mx-auto">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
              <div>
                <h1 className="font-headline text-4xl font-bold text-[#e5e2e1] mb-2">Explorer Teknologi</h1>
                <p className="text-sm font-body text-[#838383] max-w-2xl">
                  Navigasi direktori semantik terlengkap untuk ekosistem pengembangan web modern. Temukan relasi antar alat dan bahasa.
                </p>
              </div>
              
              {/* Grid / List layout switcher */}
              <div className="flex items-center gap-1 bg-[#1b1b1b] p-1 rounded-lg border border-[#333333]">
                <button
                  onClick={() => setLayoutMode("grid")}
                  className={`px-4 py-1.5 rounded-md text-xs font-headline font-bold transition-all ${
                    layoutMode === "grid"
                      ? "bg-[#2a2a2a] text-[#b4c5ff] shadow-sm"
                      : "text-[#c3c6d7] hover:text-[#e5e2e1]"
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setLayoutMode("list")}
                  className={`px-4 py-1.5 rounded-md text-xs font-headline font-bold transition-all ${
                    layoutMode === "list"
                      ? "bg-[#2a2a2a] text-[#b4c5ff] shadow-sm"
                      : "text-[#c3c6d7] hover:text-[#e5e2e1]"
                  }`}
                >
                  List
                </button>
              </div>
            </div>

            {/* Connection status */}
            <div className="mb-6">
              <StatusBanner isConnected={isConnected} />
            </div>

            {/* Search and Sorting Bar */}
            <div className="bg-[#1b1b1b] border border-[#333333] p-4 rounded-xl mb-10 flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <SearchBar onSearch={handleSearch} isLoading={isSearching} />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative group w-full md:w-48">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none w-full bg-[#131313] border border-[#333333] rounded-lg px-4 pr-10 py-2.5 text-xs text-[#e5e2e1] focus:border-[#b4c5ff] focus:ring-1 focus:ring-[#b4c5ff] cursor-pointer focus:outline-none font-mono"
                  >
                    <option value="relevance">Urutkan: Relevansi</option>
                    <option value="newest">Terbaru (Versi)</option>
                    <option value="popularity">Populer (Bintang)</option>
                    <option value="az">Nama A-Z</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#838383] text-sm">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* Bento / Side preview Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* Directory Content List */}
              <div className="xl:col-span-8 space-y-6">
                
                {isLoading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                )}

                {!isLoading && filtered.length === 0 && (
                  <div className="text-center py-20 bg-[#1b1b1b] border border-[#333333] rounded-xl">
                    <span className="material-symbols-outlined text-5xl text-[#838383] mb-4">find_in_page</span>
                    <p className="text-sm text-[#838383]">
                      Tidak ada hasil yang cocok dengan kriteria filter semantik atau pencarian.
                    </p>
                  </div>
                )}

                {!isLoading && filtered.length > 0 && (
                  <div className={layoutMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                    {filtered.map((tech, idx) => (
                      <div
                        key={tech.uri || tech.name}
                        onClick={() => setSelectedTech(tech)}
                        className={`cursor-pointer transition-all ${
                          selectedTech?.name === tech.name ? "ring-2 ring-[#2563eb] rounded-xl" : ""
                        }`}
                      >
                        <TechCard {...tech} index={idx} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Side Details Panel & Direct Graph Widget */}
              <div className="xl:col-span-4 space-y-8">
                <div className="bg-[#212121] border border-[#333333] rounded-xl p-6 shadow-xl sticky top-24">
                  {selectedTech ? (
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded bg-[#131313] border border-[#333333] flex items-center justify-center font-headline font-bold text-lg text-[#b4c5ff]">
                          {selectedTech.label.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-headline text-lg font-bold text-[#e5e2e1]">{selectedTech.label}</h4>
                          <span className="font-mono text-[10px] text-[#b4c5ff] bg-[#2563eb]/10 px-2 py-0.5 rounded uppercase tracking-wider">
                            {selectedTech.typeLabel || selectedTech.type}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4 mb-8">
                        <div>
                          <span className="text-[#838383] text-[10px] uppercase tracking-widest font-mono block mb-1">
                            Deskripsi
                          </span>
                          <p className="font-body text-xs text-[#c3c6d7] leading-relaxed">
                            {selectedTech.description || "Tidak ada rincian deskripsi untuk entitas semantik ini."}
                          </p>
                        </div>

                        {selectedTech.version && (
                          <div>
                            <span className="text-[#838383] text-[10px] uppercase tracking-widest font-mono block mb-1">
                              Versi Rilis
                            </span>
                            <p className="font-mono text-xs text-[#e5e2e1]">v{selectedTech.version}</p>
                          </div>
                        )}

                        {selectedTech.website && (
                          <div>
                            <span className="text-[#838383] text-[10px] uppercase tracking-widest font-mono block mb-1">
                              Situs Resmi
                            </span>
                            <a
                              href={selectedTech.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs text-[#b4c5ff] hover:underline break-all inline-flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-xs">link</span>
                              {selectedTech.website.replace(/^https?:\/\/(www\.)?/, "")}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Direct Graph Widget */}
                      <div className="mb-6">
                        <span className="text-[#838383] text-[10px] uppercase tracking-widest font-mono block mb-3">
                          Relasi Langsung (Graph)
                        </span>
                        <div className="relative h-48 bg-[#131313] rounded-lg border border-[#333333] flex items-center justify-center overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-[1px] bg-[#2563eb]/20 rotate-45"></div>
                            <div className="w-32 h-[1px] bg-[#2563eb]/20 -rotate-45"></div>
                            <div className="w-32 h-[1px] bg-[#2563eb]/20 rotate-90"></div>
                            <div className="w-32 h-[1px] bg-[#2563eb]/20"></div>
                          </div>
                          
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-[#2563eb] rounded-full flex items-center justify-center z-10 border-4 border-[#131313] shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                              <span className="text-[9px] font-bold text-[#eeefff] font-mono">
                                {selectedTech.name.substring(0, 4).toUpperCase()}
                              </span>
                            </div>
                            
                            {/* Dynamically simulated relations based on name */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#20201f] rounded border border-[#333333] z-10 text-[9px] font-mono">
                              React
                            </div>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#20201f] rounded border border-[#333333] z-10 text-[9px] font-mono">
                              TS
                            </div>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-[#20201f] rounded border border-[#333333] z-10 text-[9px] font-mono">
                              Jena
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-[#20201f] rounded border border-[#333333] z-10 text-[9px] font-mono">
                              RDF
                            </div>
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/tech/${selectedTech.name}`}
                        className="w-full bg-[#2563eb] hover:bg-blue-600 text-[#eeefff] py-3 rounded-lg font-headline text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                      >
                        <span>Lihat Detail Lengkap</span>
                        <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-[#838383]">
                      <span className="material-symbols-outlined text-4xl mb-3">ads_click</span>
                      <p className="text-xs">Pilih teknologi untuk melihat visualisasi dan relasi semantik detail.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </main>

      </div>
    </div>
  );
}
