"use client";
// app/tech/[name]/page.tsx
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getCategoryStyle } from "@/lib/sparql";

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
  relations: Record<string, { name: string; label: string }[]>;
}

const RELATION_LABELS: Record<string, { label: string; emoji: string }> = {
  isFrameworkOf: { label: "Framework of", emoji: "layers" },
  isORMFor: { label: "Supports Database", emoji: "database" },
  isBuiltOn: { label: "Built on", emoji: "terminal" },
  usesLanguage: { label: "Uses Language", emoji: "code" },
  compatibleWith: { label: "Compatible with", emoji: "swap_horiz" },
  alternativeTo: { label: "Alternative to", emoji: "compare_arrows" },
  connectsTo: { label: "Connects to", emoji: "hub" },
};

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
        if (data.error) {
          setError(data.error);
        } else {
          setTech(data);
        }
      })
      .catch(() => setError("Gagal memuat detail teknologi semantik."))
      .finally(() => setIsLoading(false));
  }, [name]);

  const style = tech ? getCategoryStyle(tech.type) : getCategoryStyle("Technology");

  return (
    <div className="min-h-screen bg-[#131313] tech-grid-bg text-[#e5e2e1]">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-24">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#838383] hover:text-[#b4c5ff] text-xs font-mono mb-8 transition-colors group"
        >
          <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">
            arrow_back
          </span>
          Kembali ke Direktori
        </button>

        {isLoading && (
          <div className="space-y-6">
            <div className="skeleton w-48 h-10 rounded-lg" />
            <div className="skeleton w-32 h-6 rounded-full" />
            <div className="skeleton w-full h-32 rounded-xl" />
            <div className="skeleton w-full h-48 rounded-xl" />
          </div>
        )}

        {error && (
          <div className="bg-[#2563eb]/5 border border-[#2563eb]/20 rounded-xl p-8 text-center max-w-md mx-auto">
            <span className="material-symbols-outlined text-4xl text-[#b4c5ff] mb-3">error</span>
            <p className="text-[#e5e2e1] font-headline font-bold mb-2">Teknologi tidak ditemukan</p>
            <p className="text-[#838383] text-xs mb-6">{error}</p>
            <Link
              href="/"
              className="bg-[#2563eb] text-[#eeefff] px-4 py-2 rounded-lg font-mono text-xs font-bold hover:bg-blue-600 transition-colors"
            >
              ← Kembali ke Explorer
            </Link>
          </div>
        )}

        {tech && !isLoading && (
          <div className="animate-fade-in space-y-6">
            
            {/* Main Header Card */}
            <div className="border border-[#333333] bg-[#20201f] rounded-xl p-6 relative overflow-hidden">
              {/* Soft visual blue backdrop glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#2563eb]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="bg-[#2563eb]/10 border border-[#2563eb]/20 text-[#b4c5ff] px-3 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider">
                      {tech.typeLabel || tech.type}
                    </span>
                    {tech.version && (
                      <span className="mono text-[10px] text-[#c6c6c6] bg-[#1b1b1b] border border-[#333333] px-2 py-0.5 rounded">
                        v{tech.version}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-headline font-bold text-[#e5e2e1] mt-2">
                    {tech.label}
                  </h1>
                </div>

                {tech.githubStars && (
                  <div className="flex-shrink-0 flex items-center gap-1.5 bg-[#1b1b1b] border border-[#333333] px-3 py-1.5 rounded-lg">
                    <span className="material-symbols-outlined text-yellow-400 text-sm">star</span>
                    <span className="font-mono text-xs text-yellow-400 font-bold">{tech.githubStars} Stars</span>
                  </div>
                )}
              </div>

              {tech.description && (
                <p className="text-[#c3c6d7] font-body text-sm leading-relaxed mb-6">
                  {tech.description}
                </p>
              )}

              {tech.website && (
                <a
                  href={tech.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-[#b4c5ff] hover:text-[#e5e2e1] border border-[#2563eb]/20 bg-[#2563eb]/5 hover:bg-[#2563eb]/10 px-3.5 py-2 rounded-lg transition-all"
                >
                  <span className="material-symbols-outlined text-sm">language</span>
                  {tech.website.replace(/^https?:\/\/(www\.)?/, "")}
                </a>
              )}
            </div>

            {/* RDF Subject Subject URI box */}
            <div className="border border-[#333333] bg-[#20201f] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-xs text-[#b4c5ff]">database</span>
                <p className="text-[10px] text-[#838383] font-mono uppercase tracking-widest">RDF Subject URI</p>
              </div>
              <code className="text-xs text-[#ffb596] font-mono break-all bg-[#131313] px-3 py-2 rounded border border-[#333333] block">
                &lt;{tech.uri}&gt;
              </code>
            </div>

            {/* Semantic Relations */}
            {Object.keys(tech.relations).length > 0 && (
              <div className="border border-[#333333] bg-[#20201f] rounded-xl p-6">
                <h2 className="font-headline text-lg font-bold text-[#e5e2e1] mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#2563eb]">hub</span>
                  Semantic Relations (RDF Triples)
                </h2>
                <div className="space-y-6">
                  {Object.entries(tech.relations).map(([prop, targets]) => {
                    const rel = RELATION_LABELS[prop] || { label: prop, emoji: "link" };
                    return (
                      <div key={prop} className="border-b border-[#333333]/50 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="material-symbols-outlined text-[#b4c5ff] text-sm">{rel.emoji}</span>
                          <span className="text-xs text-[#e5e2e1] font-mono">{prop}</span>
                          <span className="text-[10px] text-[#838383] font-mono">({rel.label})</span>
                        </div>
                        <div className="flex flex-wrap gap-2 pl-6">
                          {targets.map((t) => (
                            <Link
                              key={t.name}
                              href={`/tech/${t.name}`}
                              className="inline-flex items-center gap-1.5 bg-[#1b1b1b] hover:bg-[#2563eb]/10 border border-[#333333] hover:border-[#2563eb] text-[#c3c6d7] hover:text-[#b4c5ff] px-3 py-1.5 rounded-lg text-xs transition-all font-mono active:scale-95"
                            >
                              <span>{t.label}</span>
                              <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SPARQL Query box */}
            <div className="border border-[#333333] bg-[#20201f] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] text-[#838383] font-mono uppercase tracking-widest">SPARQL Query used for this page</p>
                <span className="bg-[#2563eb]/10 text-[#b4c5ff] font-mono text-[9px] px-2 py-0.5 rounded border border-[#2563eb]/20">SELECT</span>
              </div>
              <pre className="text-xs text-[#c3c6d7] font-mono overflow-x-auto leading-relaxed bg-[#131313] p-4 rounded-lg border border-[#333333]">
                <span className="text-pink-400">PREFIX</span>{" "}
                <span className="text-cyan-400">ex:</span>{" "}
                <span className="text-orange-300">&lt;http://webdev.id/ontology#&gt;</span>{"\n"}
                <span className="text-pink-400">SELECT</span>{" "}
                <span className="text-yellow-300">?label ?type ?description ?website</span>{"\n"}
                <span className="text-pink-400">WHERE</span> {"{"}{"\n"}
                {"  "}<span className="text-cyan-400">ex:{tech.name}</span>{" "}
                <span className="text-violet-400">a</span>{" "}
                <span className="text-yellow-300">?type</span> .{"\n"}
                {"  "}<span className="text-pink-400">OPTIONAL</span>{" {"} <span className="text-cyan-400">ex:{tech.name}</span>{" "}
                <span className="text-violet-400">rdfs:label</span>{" "}
                <span className="text-yellow-300">?label</span> {"}"}{"\n"}
                {"  "}<span className="text-pink-400">OPTIONAL</span>{" {"} <span className="text-cyan-400">ex:{tech.name}</span>{" "}
                <span className="text-violet-400">ex:description</span>{" "}
                <span className="text-yellow-300">?description</span> {"}"}{"\n"}
                {"}"}
              </pre>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
