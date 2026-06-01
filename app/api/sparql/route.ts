// app/api/sparql/route.ts
import { NextRequest, NextResponse } from "next/server";
import { querySPARQL, localName } from "@/lib/sparql";
import {
  getAllTechnologiesQuery,
  getTechByCategoryQuery,
  getStatsQuery,
  searchTechnologiesByCategoryQuery,
} from "@/lib/queries";
import {
  getLocalStats,
  getLocalTechnologies,
  getLocalTechnologiesByCategory,
  searchLocalTechnologies,
} from "@/lib/localOntology";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const stats = searchParams.get("stats");
  const q = searchParams.get("q")?.trim();

  try {
    if (stats === "true") {
      let statsResults;

      try {
        const data = await querySPARQL(getStatsQuery());
        statsResults = data.results.bindings.length
          ? data.results.bindings.map((binding) => ({
              type: localName(binding.type?.value || "Technology"),
              typeLabel: binding.typeLabel?.value || localName(binding.type?.value || "Technology"),
              count: Number(binding.count?.value || 0),
            }))
          : await getLocalStats();
      } catch {
        statsResults = await getLocalStats();
      }

      return NextResponse.json(statsResults);
    }

    const query = q
      ? searchTechnologiesByCategoryQuery(q, category || undefined)
      : category && category !== "all"
        ? getTechByCategoryQuery(category)
        : getAllTechnologiesQuery();

    let technologies;

    try {
      const data = await querySPARQL(query);
      technologies = data.results.bindings.length
        ? data.results.bindings.map((b) => ({
            uri: b.tech?.value || "",
            name: localName(b.tech?.value || ""),
            label: b.label?.value || localName(b.tech?.value || ""),
            type: localName(b.type?.value || "Technology"),
            typeLabel: b.typeLabel?.value || localName(b.type?.value || "Technology"),
            description: b.description?.value || "",
            website: b.website?.value || "",
            version: b.version?.value || "",
            githubStars: b.githubStars?.value || "",
          }))
        : q
          ? await searchLocalTechnologies(q, category || undefined)
          : category && category !== "all"
            ? await getLocalTechnologiesByCategory(category)
            : await getLocalTechnologies();
    } catch {
      technologies = q
        ? await searchLocalTechnologies(q, category || undefined)
        : category && category !== "all"
          ? await getLocalTechnologiesByCategory(category)
          : await getLocalTechnologies();
    }

    return NextResponse.json(technologies);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[SPARQL API Error]", message);
    const technologies = q
      ? await searchLocalTechnologies(q, category || undefined)
      : category && category !== "all"
        ? await getLocalTechnologiesByCategory(category)
        : await getLocalTechnologies();

    return NextResponse.json(technologies);
  }
}
