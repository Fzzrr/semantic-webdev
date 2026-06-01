"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getCategoryStyle, CATEGORY_COLORS } from "@/lib/sparql";
import TechLogo from "@/components/TechLogo";

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

const RELATION_META: Record<string, { label: string; icon: string; color: string }> = {
  isFrameworkOf:       { label: "Framework of",        icon: "layers",          color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
  isORMFor:            { label: "Supports Database",    icon: "storage",         color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  isBuiltOn:           { label: "Built on",             icon: "terminal",        color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  implementsSpec:      { label: "Implements Spec",      icon: "rule_settings",   color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  usesLanguage:        { label: "Uses Language",        icon: "code",            color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
  compatibleWith:      { label: "Compatible with",      icon: "swap_horiz",      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  alternativeTo:       { label: "Alternative to",       icon: "compare_arrows",  color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  connectsTo:          { label: "Connects to",          icon: "hub",             color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  integratesWith:      { label: "Integrates with",      icon: "extension",       color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  testedWith:          { label: "Tested with",          icon: "check_circle",    color: "text-green-400 bg-green-500/10 border-green-500/20" },
  deployedOn:          { label: "Deployed on",          icon: "cloud",           color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
  managedBy:           { label: "Managed by",           icon: "manage_accounts", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
  hostedBy:            { label: "Hosted on",            icon: "cloud_upload",    color: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
  monitoredBy:         { label: "Monitored by",         icon: "monitor_heart",   color: "text-red-400 bg-red-500/10 border-red-500/20" },
  ciWith:              { label: "CI/CD with",           icon: "loop",            color: "text-lime-400 bg-lime-500/10 border-lime-500/20" },
  usesBroker:          { label: "Uses broker",          icon: "message",         color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  searchedWith:        { label: "Search via",           icon: "search",          color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  storedWith:          { label: "Storage",              icon: "save",            color: "text-orange-300 bg-orange-400/10 border-orange-400/20" },
  designedWith:        { label: "Designed with",        icon: "design_services", color: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20" },
  versionControlledBy: { label: "Version control",      icon: "source_control",  color: "text-gray-400 bg-gray-500/10 border-gray-500/20" },
};

function formatStars(val: string) {
  const n = parseInt(val);
  if (isNaN(n)) return val;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function TechDetailPage() {
  const params = useParams();
  const router = useRouter();
  const name = params?.name as string;

  const [tech, setTech] = useState<TechDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) return;
    setIsLoading(true);
    fetch(`/api/tech/${name}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setTech(data);
      })
      .catch(() => setError("Gagal memuat detail teknologi."))
      .finally(() => setIsLoading(false));
  }, [name]);

  const style = tech ? getCategoryStyle(tech.type) : getCategoryStyle("Technology");
  const totalRelations = tech
    ? Object.values(tech.relations).reduce((s, arr) => s + arr.length, 0)
    : 0;

  return (
    <div className="min-h-screen bg-[#131313] tech-grid-bg text-[#e5e2e1]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-20 pb-16">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[#838383] hover:text-[#b4c5ff] text-xs font-mono mt-6 mb-8 transition-colors group"
        >
          <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">arrow_back</span>
          Kembali ke Direktori
        </button>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            <div className="skeleton h-52 w-full rounded-2xl" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
            </div>
            <div className="skeleton h-48 w-full rounded-2xl" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-[#1b1b1b] border border-[#333333] rounded-2xl p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-[#838383] block mb-4">search_off</span>
            <p className="text-[#e5e2e1] font-headline font-bold text-lg mb-2">Teknologi tidak ditemukan</p>
            <p className="text-[#838383] text-xs mb-6">{error}</p>
            <Link href="/" className="bg-[#2563eb] text-white px-5 py-2 rounded-lg font-mono text-xs font-bold hover:bg-blue-600 transition-colors">
              ← Kembali ke Explorer
            </Link>
          </div>
        )}

        {tech && !isLoading && (
          <div className="space-y-4 animate-fade-in">

            {/* ── Hero Card ── */}
            <div className="relative rounded-2xl border border-[#333333] bg-[#1b1b1b] overflow-hidden">
              {/* Accent glow */}
              <div className={`absolute inset-0 opacity-[0.04] pointer-events-none`}
                style={{ background: `radial-gradient(ellipse 60% 50% at 80% 0%, #2563eb 0%, transparent 70%)` }} />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2563eb]/40 to-transparent" />

              <div className="p-8">
                <div className="flex items-start gap-6">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl border border-[#333333] bg-[#131313] flex items-center justify-center overflow-hidden shadow-lg">
                      <TechLogo label={tech.label} name={tech.name} website={tech.website} size="lg" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-1 rounded-full border ${style.bg} ${style.text} border-current/20`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {tech.typeLabel || tech.type}
                      </span>
                      {tech.version && (
                        <span className="text-[10px] font-mono text-[#838383] bg-[#2a2a2a] border border-[#333333] px-2 py-0.5 rounded-full">
                          v{tech.version}
                        </span>
                      )}
                      {tech.license && (
                        <span className="text-[10px] font-mono text-[#838383] bg-[#2a2a2a] border border-[#333333] px-2 py-0.5 rounded-full">
                          {tech.license}
                        </span>
                      )}
                    </div>

                    <h1 className="text-4xl font-headline font-bold text-[#e5e2e1] leading-tight mb-3">
                      {tech.label}
                    </h1>

                    {tech.description && (
                      <p className="text-sm text-[#8a8a9a] leading-relaxed max-w-2xl">
                        {tech.description}
                      </p>
                    )}
                  </div>

                  {/* Stars badge */}
                  {tech.githubStars && (
                    <div className="flex-shrink-0 flex flex-col items-center justify-center bg-[#131313] border border-[#333333] rounded-xl px-4 py-3 gap-1">
                      <span className="material-symbols-outlined text-yellow-400 text-xl">star</span>
                      <span className="font-headline font-bold text-sm text-yellow-400">{formatStars(tech.githubStars)}</span>
                      <span className="text-[9px] font-mono text-[#838383] uppercase tracking-wider">Stars</span>
                    </div>
                  )}
                </div>

                {/* Bottom strip */}
                <div className="mt-6 pt-5 border-t border-[#2a2a2a] flex flex-wrap items-center gap-3">
                  {tech.website && (
                    <a
                      href={tech.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-[#b4c5ff] bg-[#2563eb]/8 hover:bg-[#2563eb]/15 border border-[#2563eb]/25 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <span className="material-symbols-outlined text-[14px]">language</span>
                      {tech.website.replace(/^https?:\/\/(www\.)?/, "")}
                      <span className="material-symbols-outlined text-[11px] opacity-60">open_in_new</span>
                    </a>
                  )}
                  {tech.npmPackage && (
                    <a
                      href={`https://www.npmjs.com/package/${tech.npmPackage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-[#cb3837] bg-red-500/8 hover:bg-red-500/15 border border-red-500/20 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <span className="material-symbols-outlined text-[14px]">package_2</span>
                      {tech.npmPackage}
                    </a>
                  )}
                  {tech.creator && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#838383] px-3 py-1.5">
                      <span className="material-symbols-outlined text-[14px]">person</span>
                      {tech.creator}
                    </span>
                  )}
                  {tech.firstRelease && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#838383] px-3 py-1.5">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      Since {tech.firstRelease}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Quick Stats Row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: "account_tree", label: "Relasi", value: String(totalRelations), color: "text-[#b4c5ff]" },
                { icon: "category",     label: "Kategori", value: tech.typeLabel || tech.type, color: "text-violet-400" },
                { icon: "code_blocks",  label: "Tipe Data", value: "OWL Individual", color: "text-emerald-400" },
                { icon: "link",         label: "Namespace", value: "webdev.id", color: "text-orange-400" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#1b1b1b] border border-[#333333] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`material-symbols-outlined text-[16px] ${stat.color}`}>{stat.icon}</span>
                    <span className="text-[9px] font-mono text-[#838383] uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <p className={`text-sm font-mono font-bold ${stat.color} truncate`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* ── Semantic Relations ── */}
            {Object.keys(tech.relations).length > 0 && (
              <div className="bg-[#1b1b1b] border border-[#333333] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#333333]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#b4c5ff] text-lg">hub</span>
                    <h2 className="font-headline font-bold text-[#e5e2e1]">Semantic Relations</h2>
                    <span className="text-[10px] font-mono text-[#838383] bg-[#2a2a2a] px-2 py-0.5 rounded-full border border-[#333333]">
                      RDF Triples
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#838383]">{totalRelations} relasi</span>
                </div>

                <div className="divide-y divide-[#222222]">
                  {Object.entries(tech.relations).map(([prop, targets]) => {
                    const meta = RELATION_META[prop] || { label: prop, icon: "link", color: "text-[#838383] bg-[#2a2a2a] border-[#333333]" };
                    return (
                      <div key={prop} className="px-6 py-5">
                        {/* Predicate header */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full border ${meta.color}`}>
                            <span className="material-symbols-outlined text-[12px]">{meta.icon}</span>
                            {meta.label}
                          </span>
                          <span className="text-[10px] font-mono text-[#555555]">ex:{prop}</span>
                          <span className="ml-auto text-[10px] font-mono text-[#555555]">{targets.length} objek</span>
                        </div>

                        {/* Target cards */}
                        <div className="flex flex-wrap gap-2">
                          {targets.map((t) => (
                            <Link
                              key={t.name}
                              href={`/tech/${t.name}`}
                              className="group flex items-center gap-2.5 bg-[#131313] hover:bg-[#2563eb]/8 border border-[#333333] hover:border-[#2563eb]/40 px-3 py-2 rounded-xl transition-all"
                            >
                              <TechLogo label={t.label} name={t.name} website={t.website} size="sm" className="w-7 h-7 flex-shrink-0" />
                              <span className="text-xs font-mono text-[#c3c6d7] group-hover:text-[#b4c5ff] transition-colors">
                                {t.label}
                              </span>
                              <span className="material-symbols-outlined text-[11px] text-[#444444] group-hover:text-[#b4c5ff] transition-colors">
                                arrow_forward
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── RDF URI + SPARQL ── */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* RDF URI */}
              <div className="bg-[#1b1b1b] border border-[#333333] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[14px] text-[#b4c5ff]">link</span>
                  <p className="text-[10px] text-[#838383] font-mono uppercase tracking-widest">RDF Subject URI</p>
                </div>
                <div className="bg-[#0e0e0e] border border-[#333333] rounded-lg p-3">
                  <p className="text-[9px] font-mono text-[#555555] mb-1 uppercase tracking-wider">Named Node</p>
                  <code className="text-xs text-[#ffb596] font-mono break-all leading-relaxed">
                    &lt;{tech.uri}&gt;
                  </code>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-[#555555]">OWL Individual · webdev ontology</span>
                </div>
              </div>

              {/* SPARQL query */}
              <div className="bg-[#1b1b1b] border border-[#333333] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-[#b4c5ff]">terminal</span>
                    <p className="text-[10px] text-[#838383] font-mono uppercase tracking-widest">SPARQL Query</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff5f57]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#febc2e]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#28c840]" />
                  </div>
                </div>
                <div className="bg-[#0e0e0e] border border-[#333333] rounded-lg p-3 overflow-x-auto">
                  <pre className="text-[11px] font-mono leading-relaxed">
                    <span className="text-pink-400">PREFIX</span>{" "}
                    <span className="text-cyan-400">ex:</span>{" "}
                    <span className="text-orange-300">&lt;...ontology#&gt;</span>{"\n"}
                    <span className="text-pink-400">SELECT</span>{" "}
                    <span className="text-yellow-300">?label ?type</span>{"\n"}
                    {"       "}
                    <span className="text-yellow-300">?description</span>{"\n"}
                    <span className="text-pink-400">WHERE</span>{" {"}{"\n"}
                    {"  "}<span className="text-cyan-400">ex:{tech.name}</span>{" "}
                    <span className="text-violet-400">a</span>{" "}
                    <span className="text-yellow-300">?type</span> .{"\n"}
                    {"  "}<span className="text-green-400">OPTIONAL</span>{" { "}<span className="text-cyan-400">ex:{tech.name}</span>{"\n"}
                    {"    "}<span className="text-violet-400">rdfs:label</span>{" "}<span className="text-yellow-300">?label</span>{" }"}{"\n"}
                    {"}"}
                  </pre>
                </div>
                <Link
                  href="/sparql"
                  className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-[#b4c5ff] hover:underline"
                >
                  <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                  Jalankan di SPARQL Lab
                </Link>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
