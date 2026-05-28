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
  isFrameworkOf: { label: "Framework of", emoji: "⬡" },
  isORMFor: { label: "Supports Database", emoji: "⬕" },
  isBuiltOn: { label: "Built on", emoji: "◎" },
  usesLanguage: { label: "Uses Language", emoji: "◉" },
  compatibleWith: { label: "Compatible with", emoji: "◈" },
  alternativeTo: { label: "Alternative to", emoji: "⇄" },
  connectsTo: { label: "Connects to", emoji: "→" },
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
      .catch(() => setError("Failed to load technology details."))
      .finally(() => setIsLoading(false));
  }, [name]);

  const style = tech ? getCategoryStyle(tech.type) : getCategoryStyle("Technology");

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-bg">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#8888aa] hover:text-[#e2e2f0] text-sm mb-8 transition-colors group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to directory
        </button>

        {isLoading && (
          <div className="space-y-4">
            <div className="skeleton w-48 h-8 rounded" />
            <div className="skeleton w-32 h-5 rounded" />
            <div className="skeleton w-full h-24 rounded-xl" />
            <div className="skeleton w-full h-40 rounded-xl" />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <p className="text-red-400 font-semibold mb-2">Technology not found</p>
            <p className="text-[#8888aa] text-sm">{error}</p>
            <Link href="/" className="mt-4 inline-block text-violet-400 text-sm hover:underline">
              ← Go back to directory
            </Link>
          </div>
        )}

        {tech && !isLoading && (
          <div className="animate-fade-in space-y-5">
            {/* Header */}
            <div className="border border-[#1e1e2e] bg-[#111118] rounded-xl p-6 relative overflow-hidden">
              {/* Accent glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`pill ${style.bg} ${style.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {tech.typeLabel || tech.type}
                    </span>
                    {tech.version && (
                      <span className="mono text-[10px] text-[#8888aa] bg-[#1e1e2e] px-2 py-0.5 rounded">
                        v{tech.version}
                      </span>
                    )}
                  </div>
                  <h1
                    className="text-3xl font-bold text-[#e2e2f0] mt-2"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {tech.label}
                  </h1>
                </div>

                {tech.githubStars && (
                  <div className="flex-shrink-0 flex items-center gap-1 bg-[#1e1e2e] px-3 py-1.5 rounded-lg">
                    <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="mono text-xs text-yellow-400">{tech.githubStars}</span>
                  </div>
                )}
              </div>

              {tech.description && (
                <p className="text-[#8888aa] text-sm leading-relaxed mb-4">
                  {tech.description}
                </p>
              )}

              {tech.website && (
                <a
                  href={tech.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 border border-violet-500/20 bg-violet-500/5 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {tech.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>

            {/* RDF URI */}
            <div className="border border-[#1e1e2e] bg-[#111118] rounded-xl p-4">
              <p className="text-[10px] text-[#3f3f5e] mono mb-1.5">RDF Subject URI</p>
              <code className="text-xs text-orange-300 mono break-all">
                &lt;{tech.uri}&gt;
              </code>
            </div>

            {/* Relations */}
            {Object.keys(tech.relations).length > 0 && (
              <div className="border border-[#1e1e2e] bg-[#111118] rounded-xl p-5">
                <h2
                  className="text-sm font-semibold text-[#e2e2f0] mb-4"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Semantic Relations
                </h2>
                <div className="space-y-4">
                  {Object.entries(tech.relations).map(([prop, targets]) => {
                    const rel = RELATION_LABELS[prop] || { label: prop, emoji: "→" };
                    return (
                      <div key={prop}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-violet-400 text-xs">{rel.emoji}</span>
                          <span className="text-xs text-[#8888aa] mono">{prop}</span>
                          <span className="text-[10px] text-[#3f3f5e] hidden sm:block">({rel.label})</span>
                        </div>
                        <div className="flex flex-wrap gap-2 pl-5">
                          {targets.map((t) => (
                            <Link
                              key={t.name}
                              href={`/tech/${t.name}`}
                              className="inline-flex items-center gap-1.5 bg-[#1e1e2e] hover:bg-[#2a2a3e] border border-[#3f3f5e]/50 hover:border-violet-500/40 text-[#e2e2f0] hover:text-violet-300 px-3 py-1.5 rounded-lg text-xs transition-all"
                            >
                              {t.label}
                              <svg className="w-2.5 h-2.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SPARQL Query used */}
            <div className="border border-[#1e1e2e] bg-[#111118] rounded-xl p-5">
              <p className="text-[10px] text-[#3f3f5e] mono mb-3">SPARQL Query used for this page</p>
              <pre className="text-xs text-[#8888aa] mono overflow-x-auto leading-relaxed">
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
