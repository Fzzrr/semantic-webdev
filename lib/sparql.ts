// lib/sparql.ts
// SPARQL client for Apache Jena Fuseki

const FUSEKI_ENDPOINT =
  process.env.FUSEKI_ENDPOINT || "http://localhost:3030/webdev/sparql";

export interface SparqlBinding {
  [key: string]: { type: string; value: string };
}

export interface SparqlResult {
  results: {
    bindings: SparqlBinding[];
  };
  boolean?: boolean;
}

export async function querySPARQL(query: string): Promise<SparqlResult> {
  const res = await fetch(FUSEKI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/sparql-query",
      Accept: "application/sparql-results+json",
    },
    body: query,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SPARQL query failed (${res.status}): ${text}`);
  }

  return res.json();
}

// Build SPARQL prefix block
export const PREFIX = `
PREFIX ex:   <http://webdev.id/ontology#>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>
`;

// Helper: extract local name from URI
export function localName(uri: string): string {
  const parts = uri.split(/[#/]/);
  return parts[parts.length - 1] || uri;
}

// Category color map
export const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Framework:        { bg: "bg-violet-500/10",  text: "text-violet-400",  dot: "bg-violet-400" },
  MobileFramework:  { bg: "bg-purple-500/10",  text: "text-purple-400",  dot: "bg-purple-400" },
  DesktopFramework: { bg: "bg-fuchsia-500/10", text: "text-fuchsia-400", dot: "bg-fuchsia-400" },
  Library:          { bg: "bg-blue-500/10",    text: "text-blue-400",    dot: "bg-blue-400" },
  UIComponentLib:   { bg: "bg-sky-500/10",     text: "text-sky-400",     dot: "bg-sky-400" },
  CSSFramework:     { bg: "bg-cyan-500/10",    text: "text-cyan-400",    dot: "bg-cyan-400" },
  StateManagement:  { bg: "bg-blue-400/10",    text: "text-blue-300",    dot: "bg-blue-300" },
  Animation:        { bg: "bg-pink-400/10",    text: "text-pink-300",    dot: "bg-pink-300" },
  ValidationLib:    { bg: "bg-rose-500/10",    text: "text-rose-400",    dot: "bg-rose-400" },
  SearchTool:       { bg: "bg-amber-500/10",   text: "text-amber-400",   dot: "bg-amber-400" },
  ORM:              { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  Database:         { bg: "bg-orange-500/10",  text: "text-orange-400",  dot: "bg-orange-400" },
  Language:         { bg: "bg-pink-500/10",    text: "text-pink-400",    dot: "bg-pink-400" },
  Runtime:          { bg: "bg-yellow-500/10",  text: "text-yellow-400",  dot: "bg-yellow-400" },
  PackageManager:   { bg: "bg-lime-500/10",    text: "text-lime-400",    dot: "bg-lime-400" },
  BuildTool:        { bg: "bg-green-500/10",   text: "text-green-400",   dot: "bg-green-400" },
  Monorepo:         { bg: "bg-teal-400/10",    text: "text-teal-300",    dot: "bg-teal-300" },
  TestingTool:      { bg: "bg-violet-400/10",  text: "text-violet-300",  dot: "bg-violet-300" },
  APITool:          { bg: "bg-indigo-400/10",  text: "text-indigo-300",  dot: "bg-indigo-300" },
  Linter:           { bg: "bg-slate-500/10",   text: "text-slate-400",   dot: "bg-slate-400" },
  AuthTool:         { bg: "bg-red-500/10",     text: "text-red-400",     dot: "bg-red-400" },
  CloudProvider:    { bg: "bg-sky-600/10",     text: "text-sky-300",     dot: "bg-sky-300" },
  DeploymentTool:   { bg: "bg-blue-600/10",    text: "text-blue-300",    dot: "bg-blue-300" },
  CITool:           { bg: "bg-green-600/10",   text: "text-green-300",   dot: "bg-green-300" },
  VersionControl:   { bg: "bg-orange-400/10",  text: "text-orange-300",  dot: "bg-orange-300" },
  ContainerTool:    { bg: "bg-cyan-600/10",    text: "text-cyan-300",    dot: "bg-cyan-300" },
  MonitoringTool:   { bg: "bg-red-400/10",     text: "text-red-300",     dot: "bg-red-300" },
  MessageBroker:    { bg: "bg-yellow-600/10",  text: "text-yellow-300",  dot: "bg-yellow-300" },
  StorageService:   { bg: "bg-teal-600/10",    text: "text-teal-300",    dot: "bg-teal-300" },
  DesignTool:       { bg: "bg-fuchsia-600/10", text: "text-fuchsia-300", dot: "bg-fuchsia-300" },
  SemanticWebSpec:  { bg: "bg-indigo-500/10",  text: "text-indigo-400",  dot: "bg-indigo-400" },
  Triplestore:      { bg: "bg-teal-500/10",    text: "text-teal-400",    dot: "bg-teal-400" },
  Technology:       { bg: "bg-gray-500/10",    text: "text-gray-400",    dot: "bg-gray-400" },
};

export function getCategoryStyle(type: string) {
  return CATEGORY_COLORS[type] || CATEGORY_COLORS.Technology;
}
