"use client";
// app/page.tsx
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import TechCard from "@/components/TechCard";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import SkeletonCard from "@/components/SkeletonCard";
import StatusBanner from "@/components/StatusBanner";
import type { Technology } from "@/lib/types";

export default function Home() {
  const [items, setItems] = useState<Technology[]>([]);
  const [filtered, setFiltered] = useState<Technology[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

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
        setFiltered(data);
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
    loadData(category);
  }, [category, loadData]);

  // Live search
  const handleSearch = useCallback(
    async (q: string) => {
      setSearchQuery(q);
      if (!q) {
        setFiltered(items);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data: Technology[] = await res.json();
        if (data && !("error" in data)) {
          setFiltered(data);
        }
      } catch {
        // fallback: client-side filter
        const lq = q.toLowerCase();
        setFiltered(
          items.filter(
            (t) =>
              t.label.toLowerCase().includes(lq) ||
              t.description?.toLowerCase().includes(lq) ||
              t.type.toLowerCase().includes(lq)
          )
        );
      } finally {
        setIsSearching(false);
      }
    },
    [items]
  );

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setSearchQuery("");
  };

  // Group by type
  const grouped = filtered.reduce<Record<string, Technology[]>>((acc, t) => {
    const key = t.typeLabel || t.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  const groupOrder = ["Framework", "Library", "CSS Framework", "ORM", "Database", "Language", "Runtime"];
  const sortedGroups = Object.keys(grouped).sort(
    (a, b) => groupOrder.indexOf(a) - groupOrder.indexOf(b)
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-bg">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-violet-400 text-xs mono">Semantic Web · RDF · SPARQL · Apache Jena</span>
          </div>

          <h1
            className="text-4xl font-bold text-[#e2e2f0] mb-3 leading-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            WebDev{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
              Semantic
            </span>{" "}
            Directory
          </h1>
          <p className="text-[#8888aa] text-sm leading-relaxed max-w-xl">
            Portal pencarian teknologi web development berbasis{" "}
            <span className="text-violet-400">Semantic Web</span>. Data disimpan sebagai
            RDF triples di{" "}
            <span className="text-orange-400">Apache Jena Fuseki</span> dan di-query
            menggunakan <span className="text-cyan-400">SPARQL</span>.
          </p>
        </div>

        {/* Connection status */}
        <StatusBanner isConnected={isConnected} />

        {/* Search */}
        <div className="mb-5">
          <SearchBar onSearch={handleSearch} isLoading={isSearching} />
        </div>

        {/* Category filter */}
        <div className="mb-8">
          <CategoryFilter
            active={category}
            onChange={handleCategoryChange}
            counts={counts}
          />
        </div>

        {/* Results info */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs text-[#8888aa] mono">
              {searchQuery
                ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${searchQuery}"`
                : `${filtered.length} technolog${filtered.length !== 1 ? "ies" : "y"} found`}
            </p>
            {isConnected === true && (
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Fuseki connected
              </span>
            )}
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && isConnected !== false && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4 opacity-30">◈</div>
            <p className="text-[#8888aa] text-sm">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : "No technologies found in this category."}
            </p>
          </div>
        )}

        {/* Technology list — grouped by type */}
        {!isLoading && filtered.length > 0 && (
          <div className="space-y-8">
            {(searchQuery || category !== "all" ? [null] : sortedGroups).map((group) => {
              const items = group ? grouped[group] : filtered;
              const groupLabel = group;

              return (
                <section key={group || "all"}>
                  {groupLabel && (
                    <div className="flex items-center gap-3 mb-3">
                      <h2
                        className="text-xs font-semibold text-[#8888aa] uppercase tracking-widest mono"
                      >
                        {groupLabel}
                      </h2>
                      <div className="flex-1 h-px bg-[#1e1e2e]" />
                      <span className="text-[10px] text-[#3f3f5e] mono">{items?.length}</span>
                    </div>
                  )}
                  <div className="space-y-3">
                    {items?.map((tech, idx) => (
                      <TechCard
                        key={tech.uri || tech.name}
                        {...tech}
                        index={idx}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* SPARQL hint */}
        {!isLoading && isConnected === true && (
          <div className="mt-12 border border-[#1e1e2e] rounded-xl p-4 bg-[#111118]">
            <p className="text-[10px] text-[#3f3f5e] mono mb-2">SPARQL Query Example</p>
            <pre className="text-xs text-[#8888aa] mono overflow-x-auto">
              <span className="text-pink-400">PREFIX</span>{" "}
              <span className="text-cyan-400">ex:</span>{" "}
              <span className="text-orange-300">&lt;http://webdev.id/ontology#&gt;</span>{"\n"}
              <span className="text-pink-400">SELECT</span>{" "}
              <span className="text-yellow-300">?orm</span>{"\n"}
              <span className="text-pink-400">WHERE</span> {"{"}{"\n"}
              {"  "}<span className="text-yellow-300">?orm</span>{" "}
              <span className="text-violet-400">a</span>{" "}
              <span className="text-cyan-400">ex:ORM</span> .{"\n"}
              {"}"}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
