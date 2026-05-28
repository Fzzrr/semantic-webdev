// app/api/sparql/route.ts
import { NextRequest, NextResponse } from "next/server";
import { querySPARQL, localName } from "@/lib/sparql";
import { getAllTechnologiesQuery, getTechByCategoryQuery, getStatsQuery } from "@/lib/queries";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const stats = searchParams.get("stats");

  try {
    if (stats === "true") {
      const data = await querySPARQL(getStatsQuery());
      return NextResponse.json(data.results.bindings);
    }

    const query = category && category !== "all"
      ? getTechByCategoryQuery(category)
      : getAllTechnologiesQuery();

    const data = await querySPARQL(query);
    const technologies = data.results.bindings.map((b) => ({
      uri: b.tech?.value || "",
      name: localName(b.tech?.value || ""),
      label: b.label?.value || localName(b.tech?.value || ""),
      type: localName(b.type?.value || "Technology"),
      typeLabel: b.typeLabel?.value || localName(b.type?.value || "Technology"),
      description: b.description?.value || "",
      website: b.website?.value || "",
      version: b.version?.value || "",
      githubStars: b.githubStars?.value || "",
    }));

    return NextResponse.json(technologies);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[SPARQL API Error]", message);
    return NextResponse.json(
      { error: "Failed to query SPARQL endpoint. Is Apache Jena Fuseki running?", detail: message },
      { status: 503 }
    );
  }
}
