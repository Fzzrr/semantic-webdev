"use client";
// app/page.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "@/components/Navbar";
import TechCard from "@/components/TechCard";
import SearchBar from "@/components/SearchBar";
import SkeletonCard from "@/components/SkeletonCard";
import StatusBanner from "@/components/StatusBanner";
import TechLogo from "@/components/TechLogo";
import RelationGraph from "@/components/RelationGraph";
import type { Technology } from "@/lib/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORIES } from "@/lib/types";

interface TechDetail extends Technology {
  relations: Record<string, { name: string; label: string; website?: string }[]>;
}

const RELATION_LABELS: Record<string, { label: string; emoji: string }> = {
  isFrameworkOf:       { label: "Framework of",       emoji: "layers" },
  isORMFor:            { label: "Supports Database",   emoji: "database" },
  isBuiltOn:           { label: "Built on",            emoji: "terminal" },
  implementsSpec:      { label: "Implements Spec",     emoji: "rule_settings" },
  usesLanguage:        { label: "Uses Language",       emoji: "code" },
  compatibleWith:      { label: "Compatible with",     emoji: "swap_horiz" },
  alternativeTo:       { label: "Alternative to",      emoji: "compare_arrows" },
  connectsTo:          { label: "Connects to",         emoji: "hub" },
  integratesWith:      { label: "Integrates with",     emoji: "extension" },
  testedWith:          { label: "Tested with",         emoji: "check_circle" },
  deployedOn:          { label: "Deployed on",         emoji: "cloud" },
  managedBy:           { label: "Managed by",          emoji: "settings" },
  hostedBy:            { label: "Hosted on",           emoji: "cloud_upload" },
  monitoredBy:         { label: "Monitored by",        emoji: "monitor_heart" },
  ciWith:              { label: "CI/CD with",          emoji: "loop" },
  usesBroker:          { label: "Uses message broker", emoji: "message" },
  searchedWith:        { label: "Search via",          emoji: "search" },
  storedWith:          { label: "Storage",             emoji: "storage" },
  designedWith:        { label: "Designed with",       emoji: "design_services" },
  versionControlledBy: { label: "Version control",     emoji: "source_control" },
};

function sortTechnologies(items: Technology[], sortBy: string) {
  const next = [...items];

  if (sortBy === "newest") {
    next.sort((a, b) => (b.version || "").localeCompare(a.version || ""));
  } else if (sortBy === "popularity") {
    next.sort((a, b) => parseInt(b.githubStars || "0") - parseInt(a.githubStars || "0"));
  } else if (sortBy === "az") {
    next.sort((a, b) => a.label.localeCompare(b.label));
  }

  return next;
}

export default function Home() {
  const [items, setItems] = useState<Technology[]>([]);
  const [filtered, setFiltered] = useState<Technology[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching] = useState(false);
  const [category, setCategory] = useState("all");
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  
  // Selected technology for side preview details
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
  const [selectedTechDetail, setSelectedTechDetail] = useState<TechDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Layout mode: grid or list
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid");

  // Sorting state
  const [sortBy, setSortBy] = useState("relevance");

  // Load initial data
  const loadData = useCallback(async (cat: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (cat !== "all") params.set("category", cat);

      const url = params.toString() ? `/api/sparql?${params.toString()}` : "/api/sparql";
      const res = await fetch(url);
      if (!res.ok) throw new Error("API error");
      const data: Technology[] = await res.json();
      if (data && !("error" in data)) {
        setItems(data);
        setIsConnected(true);
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
    const controller = new AbortController();
    loadData(category);
    return () => controller.abort();
  }, [category, loadData]);

  useEffect(() => {
    fetch("/api/sparql?stats=true", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: Array<{ type: string; count: number }>) => {
        const nextCounts: Record<string, number> = {};
        data.forEach((row) => {
          nextCounts[row.type] = row.count;
        });
        setCategoryCounts(nextCounts);
      })
      .catch(() => setCategoryCounts({}));
  }, [loadData]);

  useEffect(() => {
    const filteredItems = items.filter((tech) => {
      const matchesCategory = category === "all" || tech.type === category || tech.typeLabel === category;
      return matchesCategory;
    });

    const result = sortTechnologies(filteredItems, sortBy);
    setFiltered(result);

    setSelectedTech((current) => {
      if (current && result.some((tech) => tech.name === current.name)) {
        return current;
      }

      return result[0] || null;
    });
  }, [items, category, sortBy]);

  useEffect(() => {
    if (!selectedTech) {
      setSelectedTechDetail(null);
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    setIsDetailLoading(true);
    fetch(`/api/tech/${selectedTech.name}`, { cache: "no-store", signal: controller.signal })
      .then((res) => res.json())
      .then((data: TechDetail) => {
        if (!isActive) return;
        setSelectedTechDetail(data && !("error" in data) ? data : null);
      })
      .catch(() => {
        if (isActive) setSelectedTechDetail(null);
      })
      .finally(() => {
        if (isActive) setIsDetailLoading(false);
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [selectedTech]);

  // Handle Search input callback
  const handleSearch = useCallback((_q: string) => {}, []);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
  };

  const router = useRouter();

  const handleCardClick = (tech: Technology) => () => {
    setSelectedTech(tech);
  };

  const handleCardDoubleClick = (tech: Technology) => {
    // navigate to detail page on double click
    router.push(`/tech/${tech.name}`);
  };

  return (
    <div className="min-h-screen bg-[#131313] tech-grid-bg text-[#e5e2e1]">
      <Navbar />

      <div className="flex pt-16 min-h-screen">
        
        {/* Left SideNavBar: Shared Component Filter */}
        <aside className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-64 py-6 bg-[#1b1b1b] border-r border-[#333333] custom-scrollbar overflow-y-auto">
<div className="px-4 space-y-1">
            <p className="px-4 py-2 text-[10px] font-mono text-[#838383] uppercase tracking-widest">Kategori Utama</p>
            {CATEGORIES.map((cat) => {
              const isActive = category === cat.value;

              const totalFromCounts = Object.values(categoryCounts).reduce((s, v) => s + (v || 0), 0);

              const count = (() => {
                if (cat.value === "all") {
                  return totalFromCounts || items.length;
                }

                // Prefer server-provided counts when available
                if (categoryCounts && typeof categoryCounts[cat.value] === "number") {
                  return categoryCounts[cat.value];
                }

                // Fallback: compute from the unfiltered item set (note: items may be filtered by category when selected)
                return items.filter(t => t.type === cat.value || t.typeLabel === cat.value).length;
              })();

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
                  <span className="font-mono text-[9px] text-[#838383] px-1">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="px-4 mt-8 space-y-4">
            <p className="px-4 text-[10px] font-mono text-[#838383] uppercase tracking-widest">Ontologi TTL</p>
            <div className="px-4 space-y-3">
              <div className="rounded-lg border border-[#333333] bg-[#131313] p-4 space-y-2">
                <p className="text-xs text-[#c3c6d7] leading-relaxed">
                  Kategori dan relasi diambil dari kelas RDFS pada <span className="text-[#b4c5ff]">ontology/webdev.ttl</span>.
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#838383] uppercase tracking-widest">
                  <span>Kelas terbaca</span>
                  <span>{Object.keys(categoryCounts).length || CATEGORIES.length - 1}</span>
                </div>
              </div>
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
            <div className="bg-transparent p-4 mb-10 grid grid-cols-1 xl:grid-cols-12 gap-4 items-center">
              <div className="xl:col-span-8 w-full">
                <SearchBar onSearch={handleSearch} isLoading={isSearching} />
              </div>
              <div className="xl:col-span-4 flex items-center gap-3 w-full xl:justify-start xl:pl-6">
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
                  <div className={layoutMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch" : "space-y-4"}>
                    {filtered.map((tech, idx) => (
                      <div
                        key={tech.uri || tech.name}
                        onClick={handleCardClick(tech)}
                        onDoubleClick={() => handleCardDoubleClick(tech)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleCardClick(tech)();
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className={`cursor-pointer transition-all ${
                          selectedTech?.name === tech.name ? "selected-outline rounded-xl" : ""
                        } h-full`}
                      >
                        <TechCard {...tech} index={idx} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Side Details Panel & Direct Graph Widget */}
              <div className="xl:col-span-4 space-y-8">
                <div className="bg-transparent rounded-xl p-6 sticky top-24">
                  {selectedTech ? (
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <TechLogo label={selectedTech.label} name={selectedTech.name} website={selectedTech.website} size="sm" />
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
                            {selectedTechDetail?.description || selectedTech.description || "Tidak ada rincian deskripsi untuk entitas semantik ini."}
                          </p>
                        </div>

                        {(selectedTechDetail?.version || selectedTech.version) && (
                          <div>
                            <span className="text-[#838383] text-[10px] uppercase tracking-widest font-mono block mb-1">
                              Versi Rilis
                            </span>
                            <p className="font-mono text-xs text-[#e5e2e1]">v{selectedTechDetail?.version || selectedTech.version}</p>
                          </div>
                        )}

                        {(selectedTechDetail?.website || selectedTech.website) && (
                          <div>
                            <span className="text-[#838383] text-[10px] uppercase tracking-widest font-mono block mb-1">
                              Situs Resmi
                            </span>
                            <a
                              href={selectedTechDetail?.website || selectedTech.website || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs text-[#b4c5ff] no-underline  break-all inline-flex items-center gap-1 "
                            >
                              <span className="material-symbols-outlined text-xs">link</span>
                              {(selectedTechDetail?.website || selectedTech.website || "").replace(/^https?:\/\/(www\.)?/, "")}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Direct Graph Widget */}
                      <div className="mb-6">
                        <span className="text-[#838383] text-[10px] uppercase tracking-widest font-mono block mb-3">
                          Relasi Langsung (Ontology)
                        </span>
                        <div className="min-h-48 bg-[#131313] rounded-lg border border-[#333333] p-4">
                          {isDetailLoading ? (
                            <div className="space-y-3">
                              <div className="skeleton w-40 h-4 rounded" />
                              <div className="skeleton w-full h-10 rounded" />
                              <div className="skeleton w-5/6 h-10 rounded" />
                              <div className="skeleton w-2/3 h-10 rounded" />
                            </div>
                          ) : (() => {
                            const relationEntries = selectedTechDetail
                              ? Object.entries(selectedTechDetail.relations).flatMap(([prop, targets]) =>
                                  targets.map((target) => ({ prop, target }))
                                )
                              : [];

                            if (relationEntries.length === 0) {
                              return (
                                <div className="h-full flex items-center justify-center text-center text-[#838383] text-xs leading-relaxed">
                                  Ontologi belum mengembalikan relasi langsung untuk entitas ini.
                                </div>
                              );
                            }

                            return (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-mono text-[#838383] uppercase tracking-widest">
                                  <span>Relasi Langsung</span>
                                  <span>{relationEntries.length}</span>
                                </div>
                                <RelationGraph
                                  center={{ name: selectedTech.name, label: selectedTech.label, website: selectedTech.website }}
                                  nodes={relationEntries.slice(0, 8).map((entry) => ({
                                    prop: entry.prop,
                                    target: {
                                      ...entry.target,
                                      website: entry.target.website || items.find((i) => i.name === entry.target.name)?.website,
                                    },
                                  }))}
                                  size={220}
                                />
                              </div>
                            );
                          })()}
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
