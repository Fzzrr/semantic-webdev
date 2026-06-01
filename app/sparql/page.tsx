"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const RELATION_META: Record<string, { label: string; icon: string; color: string }> = {
  isFrameworkOf:       { label: "Framework of",        icon: "layers",          color: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
  isORMFor:            { label: "ORM for",              icon: "storage",         color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  isBuiltOn:           { label: "Built on",             icon: "terminal",        color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  implementsSpec:      { label: "Implements Spec",      icon: "rule_settings",   color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
  usesLanguage:        { label: "Uses Language",        icon: "code",            color: "bg-pink-500/15 text-pink-300 border-pink-500/30" },
  compatibleWith:      { label: "Compatible with",      icon: "swap_horiz",      color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
  alternativeTo:       { label: "Alternative to",       icon: "compare_arrows",  color: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  connectsTo:          { label: "Connects to",          icon: "hub",             color: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
  integratesWith:      { label: "Integrates with",      icon: "extension",       color: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  testedWith:          { label: "Tested with",          icon: "check_circle",    color: "bg-green-500/15 text-green-300 border-green-500/30" },
  deployedOn:          { label: "Deployed on",          icon: "cloud",           color: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  managedBy:           { label: "Managed by",           icon: "manage_accounts", color: "bg-slate-500/15 text-slate-300 border-slate-500/30" },
  hostedBy:            { label: "Hosted on",            icon: "cloud_upload",    color: "bg-teal-500/15 text-teal-300 border-teal-500/30" },
  monitoredBy:         { label: "Monitored by",         icon: "monitor_heart",   color: "bg-red-500/15 text-red-300 border-red-500/30" },
  ciWith:              { label: "CI/CD with",           icon: "loop",            color: "bg-lime-500/15 text-lime-300 border-lime-500/30" },
  usesBroker:          { label: "Uses message broker",  icon: "message",         color: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
  searchedWith:        { label: "Search via",           icon: "search",          color: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  storedWith:          { label: "Storage",              icon: "save",            color: "bg-orange-400/15 text-orange-200 border-orange-400/30" },
  designedWith:        { label: "Designed with",        icon: "design_services", color: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30" },
  versionControlledBy: { label: "Version control",      icon: "source_control",  color: "bg-gray-500/15 text-gray-300 border-gray-500/30" },
};

const EXAMPLE_QUERIES = [
  {
    title: "All Technologies",
    icon: "category",
    query: `PREFIX ex:   <http://webdev.id/ontology#>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?label ?typeLabel
WHERE {
  ?tech a ?type .
  ?type rdfs:subClassOf* ex:Technology .
  OPTIONAL { ?tech rdfs:label ?label }
  OPTIONAL { ?type rdfs:label ?typeLabel }
  FILTER(?type != ex:Technology)
}
ORDER BY ?typeLabel ?label
LIMIT 50`,
  },
  {
    title: "All Relations",
    icon: "hub",
    query: `PREFIX ex:   <http://webdev.id/ontology#>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?subjectLabel ?property ?objectLabel
WHERE {
  ?subject a ?sType .
  ?sType rdfs:subClassOf* ex:Technology .
  ?subject ?property ?object .
  ?object a ?oType .
  ?oType rdfs:subClassOf* ex:Technology .
  OPTIONAL { ?subject rdfs:label ?subjectLabel }
  OPTIONAL { ?object rdfs:label ?objectLabel }
  FILTER(?property != rdf:type)
}
ORDER BY ?subjectLabel`,
  },
  {
    title: "ORM → Database",
    icon: "storage",
    query: `PREFIX ex:   <http://webdev.id/ontology#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?ormLabel ?dbLabel
WHERE {
  ?orm a ex:ORM ;
       ex:isORMFor ?db .
  OPTIONAL { ?orm rdfs:label ?ormLabel }
  OPTIONAL { ?db rdfs:label ?dbLabel }
}
ORDER BY ?ormLabel`,
  },
  {
    title: "Language Usage",
    icon: "code",
    query: `PREFIX ex:   <http://webdev.id/ontology#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?techLabel ?langLabel
WHERE {
  ?tech ex:usesLanguage ?lang .
  OPTIONAL { ?tech rdfs:label ?techLabel }
  OPTIONAL { ?lang rdfs:label ?langLabel }
}
ORDER BY ?langLabel ?techLabel`,
  },
  {
    title: "Framework → Runtime",
    icon: "layers",
    query: `PREFIX ex:   <http://webdev.id/ontology#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?fwLabel ?runtimeLabel
WHERE {
  ?fw a ex:Framework ;
      ex:isBuiltOn ?runtime .
  ?runtime a ex:Runtime .
  OPTIONAL { ?fw rdfs:label ?fwLabel }
  OPTIONAL { ?runtime rdfs:label ?runtimeLabel }
}
ORDER BY ?fwLabel`,
  },
  {
    title: "Count by Category",
    icon: "bar_chart",
    query: `PREFIX ex:   <http://webdev.id/ontology#>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?typeLabel (COUNT(?tech) AS ?count)
WHERE {
  ?tech a ?type .
  ?type rdfs:subClassOf* ex:Technology .
  FILTER(?type != ex:Technology)
  OPTIONAL { ?type rdfs:label ?typeLabel }
}
GROUP BY ?type ?typeLabel
ORDER BY DESC(?count)`,
  },
];

interface RelationTriple {
  subject: string;
  subjectLabel: string;
  subjectType: string;
  predicate: string;
  object: string;
  objectLabel: string;
  objectType: string;
}

interface QueryResult {
  vars: string[];
  bindings: Record<string, string>[];
  error?: string;
}

const TYPE_COLOR: Record<string, string> = {
  Framework: "text-violet-400",
  Library: "text-blue-400",
  ORM: "text-emerald-400",
  Database: "text-orange-400",
  Language: "text-pink-400",
  Runtime: "text-yellow-400",
  BuildTool: "text-green-400",
  TestingTool: "text-violet-300",
  CSSFramework: "text-cyan-400",
  CloudProvider: "text-sky-300",
  DeploymentTool: "text-blue-300",
};

function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLOR[type] || "text-gray-400";
  return (
    <span className={`text-[10px] font-mono ${color} opacity-70`}>{type}</span>
  );
}

function RelationBadge({ predicate }: { predicate: string }) {
  const meta = RELATION_META[predicate];
  if (!meta) return <span className="text-xs font-mono text-[#838383]">{predicate}</span>;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${meta.color}`}>
      <span className="material-symbols-outlined text-[11px]">{meta.icon}</span>
      {meta.label}
    </span>
  );
}

export default function SPARQLPage() {
  const [activeTab, setActiveTab] = useState<"relations" | "editor">("relations");
  const [relations, setRelations] = useState<RelationTriple[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPredicate, setFilterPredicate] = useState("all");

  const [query, setQuery] = useState(EXAMPLE_QUERIES[0].query);
  const [selectedExample, setSelectedExample] = useState(0);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    fetch("/api/relations")
      .then((r) => r.json())
      .then((data) => {
        setRelations(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return relations.filter((t) => {
      const matchPredicate = filterPredicate === "all" || t.predicate === filterPredicate;
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        t.subjectLabel.toLowerCase().includes(term) ||
        t.objectLabel.toLowerCase().includes(term) ||
        t.predicate.toLowerCase().includes(term);
      return matchPredicate && matchSearch;
    });
  }, [relations, searchTerm, filterPredicate]);

  const predicateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of relations) counts[t.predicate] = (counts[t.predicate] || 0) + 1;
    return counts;
  }, [relations]);

  const sortedPredicates = useMemo(
    () => Object.entries(predicateCounts).sort((a, b) => b[1] - a[1]),
    [predicateCounts]
  );

  const runQuery = async () => {
    setIsRunning(true);
    setQueryResult(null);
    try {
      const res = await fetch("/api/sparql/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setQueryResult(data);
    } catch (e) {
      setQueryResult({ vars: [], bindings: [], error: String(e) });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] tech-grid-bg text-[#e5e2e1]">
      <Navbar />

      <div className="pt-16">
        {/* Hero */}
        <div className="bg-[#1b1b1b] border-b border-[#333333]">
          <div className="max-w-[1440px] mx-auto px-8 py-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[#b4c5ff] text-2xl">hub</span>
                  <span className="text-xs font-mono text-[#838383] uppercase tracking-widest">Ontology Explorer</span>
                </div>
                <h1 className="text-3xl font-headline font-bold text-[#e5e2e1] mb-2">
                  SPARQL <span className="text-[#b4c5ff]">Lab</span>
                </h1>
                <p className="text-sm text-[#838383] font-body max-w-xl">
                  Jelajahi semua relasi dalam ontologi WebDev Semantic. Visualisasikan hubungan antar teknologi atau jalankan query SPARQL kustom.
                </p>
              </div>
              <div className="hidden md:flex gap-4">
                <div className="bg-[#131313] border border-[#333333] rounded-xl px-5 py-3 text-center">
                  <p className="text-2xl font-headline font-bold text-[#b4c5ff]">{relations.length}</p>
                  <p className="text-[10px] font-mono text-[#838383] uppercase tracking-wider">Total Relasi</p>
                </div>
                <div className="bg-[#131313] border border-[#333333] rounded-xl px-5 py-3 text-center">
                  <p className="text-2xl font-headline font-bold text-[#b4c5ff]">{sortedPredicates.length}</p>
                  <p className="text-[10px] font-mono text-[#838383] uppercase tracking-wider">Tipe Predikat</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-8 border-b border-[#333333]">
              {(["relations", "editor"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 text-sm font-mono transition-all border-b-2 -mb-px ${
                    activeTab === tab
                      ? "border-[#b4c5ff] text-[#b4c5ff]"
                      : "border-transparent text-[#838383] hover:text-[#c3c6d7]"
                  }`}
                >
                  {tab === "relations" ? (
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">account_tree</span>
                      Semua Relasi
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">terminal</span>
                      Query Editor
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Relations Tab */}
        {activeTab === "relations" && (
          <div className="max-w-[1440px] mx-auto px-8 py-8">
            {/* Predicate chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setFilterPredicate("all")}
                className={`text-[10px] font-mono px-3 py-1 rounded-full border transition-all ${
                  filterPredicate === "all"
                    ? "bg-[#b4c5ff]/10 text-[#b4c5ff] border-[#b4c5ff]/40"
                    : "text-[#838383] border-[#333333] hover:border-[#555555]"
                }`}
              >
                Semua ({relations.length})
              </button>
              {sortedPredicates.map(([pred, count]) => {
                const meta = RELATION_META[pred];
                return (
                  <button
                    key={pred}
                    onClick={() => setFilterPredicate(pred === filterPredicate ? "all" : pred)}
                    className={`inline-flex items-center gap-1 text-[10px] font-mono px-3 py-1 rounded-full border transition-all ${
                      filterPredicate === pred
                        ? (meta?.color || "bg-gray-500/15 text-gray-300 border-gray-500/30")
                        : "text-[#838383] border-[#333333] hover:border-[#555555]"
                    }`}
                  >
                    {meta && (
                      <span className="material-symbols-outlined text-[11px]">{meta.icon}</span>
                    )}
                    {meta?.label || pred} <span className="opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center bg-[#1b1b1b] border border-[#333333] rounded-lg px-3 py-2 gap-2 flex-1 max-w-sm focus-within:border-[#b4c5ff] transition-all">
                <span className="material-symbols-outlined text-[#838383] text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Cari teknologi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent outline-none text-xs font-mono text-[#e5e2e1] placeholder:text-[#838383] w-full"
                />
              </div>
              <span className="text-xs font-mono text-[#838383]">
                {filtered.length} relasi
              </span>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20 gap-3">
                <div className="w-5 h-5 border-2 border-[#b4c5ff] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-[#838383] font-mono">Memuat relasi...</span>
              </div>
            ) : (
              <div className="bg-[#1b1b1b] border border-[#333333] rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_1fr] text-[10px] font-mono text-[#838383] uppercase tracking-widest px-6 py-3 border-b border-[#333333] bg-[#131313]">
                  <span>Subject</span>
                  <span className="text-center px-8">Predikat</span>
                  <span className="text-right">Object</span>
                </div>
                <div className="divide-y divide-[#222222]">
                  {filtered.slice(0, 200).map((triple, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-3 hover:bg-[#222222] transition-colors"
                    >
                      <div>
                        <Link
                          href={`/tech/${triple.subject}`}
                          className="text-sm font-mono text-[#e5e2e1] hover:text-[#b4c5ff] transition-colors"
                        >
                          {triple.subjectLabel}
                        </Link>
                        <div>
                          <TypeBadge type={triple.subjectType} />
                        </div>
                      </div>
                      <div className="px-4 flex justify-center">
                        <RelationBadge predicate={triple.predicate} />
                      </div>
                      <div className="text-right">
                        <Link
                          href={`/tech/${triple.object}`}
                          className="text-sm font-mono text-[#e5e2e1] hover:text-[#b4c5ff] transition-colors"
                        >
                          {triple.objectLabel}
                        </Link>
                        <div>
                          <TypeBadge type={triple.objectType} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {filtered.length > 200 && (
                    <div className="px-6 py-4 text-center text-xs font-mono text-[#838383]">
                      Menampilkan 200 dari {filtered.length} relasi. Gunakan filter untuk mempersempit hasil.
                    </div>
                  )}
                  {filtered.length === 0 && (
                    <div className="px-6 py-16 text-center text-sm font-mono text-[#838383]">
                      Tidak ada relasi ditemukan.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Query Editor Tab */}
        {activeTab === "editor" && (
          <div className="max-w-[1440px] mx-auto px-8 py-8">
            <div className="flex gap-6">
              {/* Sidebar: examples */}
              <aside className="hidden lg:block w-60 flex-shrink-0">
                <p className="text-[10px] font-mono text-[#838383] uppercase tracking-widest mb-3">Contoh Query</p>
                <div className="space-y-1">
                  {EXAMPLE_QUERIES.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => { setQuery(ex.query); setSelectedExample(i); setQueryResult(null); }}
                      className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-mono transition-all ${
                        selectedExample === i
                          ? "bg-[#b4c5ff]/10 text-[#b4c5ff] border border-[#b4c5ff]/20"
                          : "text-[#c3c6d7] hover:bg-[#2a2a2a] border border-transparent"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">{ex.icon}</span>
                      {ex.title}
                    </button>
                  ))}
                </div>

                <div className="mt-6 p-3 bg-[#1b1b1b] border border-[#333333] rounded-xl">
                  <p className="text-[9px] font-mono text-[#838383] uppercase tracking-wider mb-2">Endpoint</p>
                  <p className="text-[10px] font-mono text-[#b4c5ff] break-all">localhost:3030/webdev/sparql</p>
                  <p className="text-[9px] text-[#838383] mt-2">Butuh Apache Jena Fuseki berjalan secara lokal.</p>
                </div>
              </aside>

              {/* Editor */}
              <div className="flex-1 min-w-0">
                <div className="bg-[#1b1b1b] border border-[#333333] rounded-xl overflow-hidden mb-4">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#333333] bg-[#131313]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#b4c5ff] text-[16px]">terminal</span>
                      <span className="text-xs font-mono text-[#838383]">SPARQL Query</span>
                    </div>
                    <button
                      onClick={runQuery}
                      disabled={isRunning}
                      className="flex items-center gap-2 bg-[#b4c5ff] hover:bg-blue-300 text-[#131313] font-mono text-xs font-bold px-4 py-1.5 rounded-lg transition-all disabled:opacity-50"
                    >
                      {isRunning ? (
                        <>
                          <div className="w-3 h-3 border border-[#131313] border-t-transparent rounded-full animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                          Jalankan
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    spellCheck={false}
                    rows={12}
                    className="w-full bg-[#0e0e0e] text-[#e5e2e1] font-mono text-sm p-4 outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Results */}
                {queryResult && (
                  <div className="bg-[#1b1b1b] border border-[#333333] rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#333333] bg-[#131313]">
                      <span className="text-xs font-mono text-[#838383]">
                        {queryResult.error ? "Error" : `${queryResult.bindings.length} baris ditemukan`}
                      </span>
                    </div>
                    {queryResult.error ? (
                      <div className="p-6">
                        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                          <span className="material-symbols-outlined text-red-400 text-lg mt-0.5">error</span>
                          <div>
                            <p className="text-xs font-mono font-bold text-red-400 mb-1">Query gagal dijalankan</p>
                            <p className="text-xs font-mono text-[#838383] whitespace-pre-wrap">{queryResult.error}</p>
                            <p className="text-[10px] text-[#555555] mt-2">Pastikan Apache Jena Fuseki berjalan di localhost:3030</p>
                          </div>
                        </div>
                      </div>
                    ) : queryResult.bindings.length === 0 ? (
                      <div className="p-8 text-center text-sm font-mono text-[#838383]">
                        Query berhasil, tidak ada hasil.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs font-mono">
                          <thead>
                            <tr className="border-b border-[#333333]">
                              {queryResult.vars.map((v) => (
                                <th key={v} className="text-left px-4 py-2.5 text-[#838383] font-normal uppercase tracking-wider text-[10px]">
                                  ?{v}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#222222]">
                            {queryResult.bindings.slice(0, 100).map((row, i) => (
                              <tr key={i} className="hover:bg-[#222222] transition-colors">
                                {queryResult.vars.map((v) => (
                                  <td key={v} className="px-4 py-2.5 text-[#c3c6d7]">
                                    {row[v] ?? <span className="text-[#444444]">—</span>}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {queryResult.bindings.length > 100 && (
                          <div className="px-4 py-3 text-center text-[10px] font-mono text-[#838383] border-t border-[#333333]">
                            Menampilkan 100 dari {queryResult.bindings.length} baris.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
