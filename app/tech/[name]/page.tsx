"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import TechLogo from "@/components/TechLogo";
import FilterTab from "@/components/FilterTab";
import { CATEGORIES } from "@/lib/types";

interface TechDetail {
  uri: string;
  name: string;
  label: string;
  type: string;
  typeLabel: string;
  description?: string;
  website?: string;
  version?: string;
  githubStars?: string;
  license?: string;
  firstRelease?: string;
  creator?: string;
  npmPackage?: string;
  relations: Record<string, { name: string; label: string; website?: string }[]>;
}

const RELATION_META: Record<string, { label: string; icon: string; color: string; textColor: string }> = {
  isFrameworkOf:       { label: "Framework of",     icon: "layers",          color: "bg-violet-500/10 border-violet-500/20",  textColor: "text-violet-400" },
  isORMFor:            { label: "Works with DB",     icon: "database",        color: "bg-emerald-500/10 border-emerald-500/20", textColor: "text-emerald-400" },
  isBuiltOn:           { label: "Built on",          icon: "terminal",        color: "bg-blue-500/10 border-blue-500/20",       textColor: "text-blue-400" },
  implementsSpec:      { label: "Follows standard",  icon: "rule_settings",   color: "bg-indigo-500/10 border-indigo-500/20",   textColor: "text-indigo-400" },
  usesLanguage:        { label: "Written in",        icon: "code",            color: "bg-pink-500/10 border-pink-500/20",       textColor: "text-pink-400" },
  compatibleWith:      { label: "Works with",        icon: "swap_horiz",      color: "bg-cyan-500/10 border-cyan-500/20",       textColor: "text-cyan-400" },
  alternativeTo:       { label: "Alternative to",    icon: "compare_arrows",  color: "bg-amber-500/10 border-amber-500/20",     textColor: "text-amber-400" },
  connectsTo:          { label: "Connects to",       icon: "hub",             color: "bg-orange-500/10 border-orange-500/20",   textColor: "text-orange-400" },
  integratesWith:      { label: "Integrates with",   icon: "extension",       color: "bg-purple-500/10 border-purple-500/20",   textColor: "text-purple-400" },
  testedWith:          { label: "Tested with",       icon: "check_circle",    color: "bg-green-500/10 border-green-500/20",     textColor: "text-green-400" },
  deployedOn:          { label: "Runs on",           icon: "cloud",           color: "bg-sky-500/10 border-sky-500/20",         textColor: "text-sky-400" },
  managedBy:           { label: "Managed by",        icon: "settings",        color: "bg-slate-500/10 border-slate-500/20",     textColor: "text-slate-400" },
  hostedBy:            { label: "Hosted on",         icon: "cloud_upload",    color: "bg-teal-500/10 border-teal-500/20",       textColor: "text-teal-400" },
  monitoredBy:         { label: "Monitored by",      icon: "monitor_heart",   color: "bg-red-500/10 border-red-500/20",         textColor: "text-red-400" },
  ciWith:              { label: "CI/CD with",        icon: "loop",            color: "bg-lime-500/10 border-lime-500/20",       textColor: "text-lime-400" },
  usesBroker:          { label: "Sends messages via",icon: "message",         color: "bg-yellow-500/10 border-yellow-500/20",   textColor: "text-yellow-400" },
  searchedWith:        { label: "Search powered by", icon: "search",          color: "bg-rose-500/10 border-rose-500/20",       textColor: "text-rose-400" },
  storedWith:          { label: "Stores data with",  icon: "save",            color: "bg-orange-400/10 border-orange-400/20",   textColor: "text-orange-300" },
  designedWith:        { label: "Designed with",     icon: "design_services", color: "bg-fuchsia-500/10 border-fuchsia-500/20", textColor: "text-fuchsia-400" },
  versionControlledBy: { label: "Version control",   icon: "source_control",  color: "bg-gray-500/10 border-gray-500/20",       textColor: "text-gray-400" },
};

export default function TechDetailPage() {
  const params = useParams();
  const router = useRouter();
  const name = params?.name as string;

  const [tech, setTech] = useState<TechDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Mobile: open/close the category filter drawer
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!name) return;
    setIsLoading(true);
    fetch(`/api/tech/${name}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setTech(data);
      })
      .catch(() => setError("Failed to load technology data."))
      .finally(() => setIsLoading(false));
  }, [name]);

  // Group relations by type, only use real data
  const groupedRelations = tech
    ? Object.entries(tech.relations).filter(([, targets]) => targets.length > 0)
    : [];

  const totalRelations = groupedRelations.reduce((sum, [, targets]) => sum + targets.length, 0);

  return (
    <div className="min-h-screen bg-[#131313] tech-grid-bg text-[#e5e2e1] font-body">
      <Navbar />

      <div className="flex pt-16 min-h-screen">

        {/* Mobile: filter pull-tab (pinned to the left edge) */}
        {!filtersOpen && <FilterTab onClick={() => setFiltersOpen(true)} />}

        {/* Backdrop drawer (mobile) — fade */}
        <div
          className={`md:hidden fixed inset-0 top-16 z-30 bg-black/60 transition-opacity duration-300 ${
            filtersOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setFiltersOpen(false)}
          aria-hidden="true"
        />

        {/* Sidebar — slide */}
        <aside className={`flex flex-col fixed left-0 top-16 bottom-0 w-64 bg-[#1b1b1b] border-r border-[#333333] py-6 overflow-y-auto custom-scrollbar z-40 transition-transform duration-300 ease-out ${
          filtersOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}>
          <div className="px-4 mb-4">
            <p className="px-4 py-2 text-[10px] font-mono text-[#838383] uppercase tracking-widest">Categories</p>
          </div>
          <div className="px-4 space-y-1">
            {CATEGORIES.map((cat) => {
              const isCurrentType = tech && (tech.type === cat.value || tech.typeLabel === cat.value);
              return (
                <button
                  key={cat.value}
                  onClick={() => { setFiltersOpen(false); router.push(cat.value === "all" ? "/" : `/?category=${cat.value}`); }}
                  className={`w-full flex items-center justify-between py-2.5 px-4 rounded-lg text-left font-body text-xs transition-colors ${
                    isCurrentType
                      ? "text-[#b4c5ff] bg-[#2563eb]/10 font-bold border-l-2 border-[#2563eb]"
                      : "text-[#c3c6d7] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 min-h-screen">
          <div className="max-w-[1100px] mx-auto w-full">

            {/* Back */}
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-1.5 text-[#838383] hover:text-[#b4c5ff] text-xs font-mono mb-8 transition-colors group"
            >
              <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">arrow_back</span>
              Back to Explorer
            </button>

            {/* Loading */}
            {isLoading && (
              <div className="space-y-6">
                <div className="skeleton h-52 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="skeleton h-40 rounded-2xl" />
                  <div className="skeleton h-40 md:col-span-2 rounded-2xl" />
                </div>
                <div className="skeleton h-64 w-full rounded-2xl" />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-[#1b1b1b] border border-[#333333] rounded-2xl p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-[#838383] block mb-4">search_off</span>
                <p className="text-[#e5e2e1] font-headline font-bold text-lg mb-2">Technology not found</p>
                <p className="text-[#838383] text-xs mb-6">{error}</p>
                <Link href="/" className="bg-[#2563eb] text-white px-5 py-2.5 rounded-lg font-mono text-xs hover:opacity-90 transition-opacity">
                  Back to Explorer
                </Link>
              </div>
            )}

            {tech && !isLoading && (
              <div className="space-y-8">

                {/* ── Hero Card ── */}
                <section className="bg-[#1b1b1b] border border-[#2a2a2a] rounded-2xl p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="w-16 h-16 bg-[#0e0e0e] border border-[#2a2a2a] rounded-xl flex items-center justify-center p-2.5 shadow-sm shrink-0 overflow-hidden">
                      <TechLogo label={tech.label} name={tech.name} website={tech.website} size="lg" framed={false} className="!w-full !h-full" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h1 className="font-headline text-3xl font-bold text-[#e5e2e1]">{tech.label}</h1>
                        <span className="px-2.5 py-1 bg-[#2563eb]/15 text-[#b4c5ff] text-[10px] font-mono rounded-full uppercase tracking-wider border border-[#2563eb]/20">
                          {tech.typeLabel || tech.type}
                        </span>
                        {tech.version && (
                          <span className="px-2.5 py-1 bg-[#2a2a2a] text-[#838383] text-[10px] font-mono rounded-full border border-[#333333]">
                            v{tech.version}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-[#838383] leading-relaxed mb-4 max-w-2xl">
                        {tech.description || "No description available for this technology yet."}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {tech.website && (
                          <a
                            href={tech.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                            Visit Website
                          </a>
                        )}
                        <Link
                          href="/sparql"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-[#c3c6d7] text-xs font-bold rounded-lg border border-[#333333] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">terminal</span>
                          Open SPARQL Lab
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ── Info Grid ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { icon: "star", label: "GitHub Stars", value: tech.githubStars || "—" },
                    { icon: "balance", label: "License", value: tech.license || "—" },
                    { icon: "calendar_today", label: "First Release", value: tech.firstRelease || "—" },
                    { icon: "person", label: "Creator", value: tech.creator || "—" },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="bg-[#1b1b1b] border border-[#2a2a2a] rounded-xl p-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="material-symbols-outlined text-[#555555] text-[14px]">{icon}</span>
                        <span className="text-[10px] font-mono text-[#555555] uppercase tracking-wider">{label}</span>
                      </div>
                      <p className="text-sm font-bold text-[#e5e2e1] truncate">{value}</p>
                    </div>
                  ))}
                </div>

                {/* ── Relations ── */}
                <section className="bg-[#1b1b1b] border border-[#2a2a2a] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#b4c5ff] text-[20px]">hub</span>
                      <h2 className="font-headline text-lg font-bold text-[#e5e2e1]">Related Technologies</h2>
                    </div>
                    {totalRelations > 0 && (
                      <span className="text-[10px] font-mono text-[#555555] bg-[#2a2a2a] px-2.5 py-1 rounded-full border border-[#333333]">
                        {totalRelations} relations
                      </span>
                    )}
                  </div>

                  {groupedRelations.length === 0 ? (
                    <div className="text-center py-12 text-[#555555]">
                      <span className="material-symbols-outlined text-4xl block mb-3">device_hub</span>
                      <p className="text-sm">No relations recorded in the ontology for this technology yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {groupedRelations.map(([relationKey, targets]) => {
                        const meta = RELATION_META[relationKey] || {
                          label: relationKey,
                          icon: "link",
                          color: "bg-[#2a2a2a] border-[#333333]",
                          textColor: "text-[#838383]",
                        };
                        return (
                          <div key={relationKey}>
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`material-symbols-outlined text-[14px] ${meta.textColor}`}>{meta.icon}</span>
                              <span className="text-[10px] font-mono text-[#838383] uppercase tracking-widest">{meta.label}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {targets.map((target) => (
                                <button
                                  key={target.name}
                                  onClick={() => router.push(`/tech/${target.name}`)}
                                  className={`inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl border text-xs font-medium transition-all hover:scale-105 active:scale-95 ${meta.color} ${meta.textColor}`}
                                >
                                  <span className="w-5 h-5 flex items-center justify-center overflow-hidden shrink-0">
                                    <TechLogo label={target.label} name={target.name} website={target.website} size="sm" framed={false} className="!w-full !h-full" />
                                  </span>
                                  {target.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* ── SPARQL Query ── */}
                <section className="bg-[#1b1b1b] border border-[#2a2a2a] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#b4c5ff] text-[18px]">terminal</span>
                      <h2 className="font-headline text-base font-bold text-[#e5e2e1]">Query This Technology</h2>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                    </div>
                  </div>

                  <div className="bg-[#0e0e0e] border border-[#333333] rounded-xl p-4 overflow-x-auto mb-4">
                    <pre className="text-[12px] font-mono leading-relaxed">
                      <span className="text-pink-400">PREFIX</span>{" "}
                      <span className="text-cyan-400">ex:</span>{" "}
                      <span className="text-orange-300">&lt;http://example.org/webdev#&gt;</span>{"\n"}
                      <span className="text-pink-400">PREFIX</span>{" "}
                      <span className="text-cyan-400">rdfs:</span>{" "}
                      <span className="text-orange-300">&lt;http://www.w3.org/2000/01/rdf-schema#&gt;</span>{"\n\n"}
                      <span className="text-pink-400">SELECT</span>{" "}
                      <span className="text-yellow-300">*</span>{"\n"}
                      <span className="text-pink-400">WHERE</span>{" {"}{"\n"}
                      {"  "}<span className="text-cyan-400">ex:{tech.name}</span>{" "}
                      <span className="text-[#838383]">?relation</span>{" "}
                      <span className="text-[#838383]">?value</span>{" ."}{"\n"}
                      {"}"}
                    </pre>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-mono text-[#555555]">
                      URI: <span className="text-[#ffb596]">&lt;{tech.uri}&gt;</span>
                    </p>
                    <Link
                      href="/sparql"
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#b4c5ff] hover:underline"
                    >
                      <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                      Run in SPARQL Lab
                    </Link>
                  </div>
                </section>

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
