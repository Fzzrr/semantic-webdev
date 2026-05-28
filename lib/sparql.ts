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

// Helper: format local name with spaces (e.g. "NextJS" -> "Next.js")
const DISPLAY_NAMES: Record<string, string> = {
  NextJS: "Next.js",
  NuxtJS: "Nuxt.js",
  NodeJS: "Node.js",
  TailwindCSS: "Tailwind CSS",
  TypeORM: "TypeORM",
  PostgreSQL: "PostgreSQL",
  MySQL: "MySQL",
  MongoDB: "MongoDB",
  SQLite: "SQLite",
  Redis: "Redis",
  JavaScript: "JavaScript",
  TypeScript: "TypeScript",
  Python: "Python",
  PHP: "PHP",
};

export function displayName(uri: string): string {
  const local = localName(uri);
  return DISPLAY_NAMES[local] || local.replace(/([A-Z])/g, " $1").trim();
}

// Category color map
export const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Framework: { bg: "bg-violet-500/10", text: "text-violet-400", dot: "bg-violet-400" },
  Library: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
  CSSFramework: { bg: "bg-cyan-500/10", text: "text-cyan-400", dot: "bg-cyan-400" },
  ORM: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  Database: { bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-400" },
  Language: { bg: "bg-pink-500/10", text: "text-pink-400", dot: "bg-pink-400" },
  Runtime: { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-400" },
  Technology: { bg: "bg-gray-500/10", text: "text-gray-400", dot: "bg-gray-400" },
};

export function getCategoryStyle(type: string) {
  return CATEGORY_COLORS[type] || CATEGORY_COLORS.Technology;
}
