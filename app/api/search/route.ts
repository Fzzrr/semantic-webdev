// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { querySPARQL, localName } from "@/lib/sparql";
import { searchTechnologiesQuery } from "@/lib/queries";
import { searchLocalTechnologies } from "@/lib/localOntology";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json([]);
  }

  try {
    const data = await querySPARQL(searchTechnologiesQuery(q));
    const results = data.results.bindings.length
      ? data.results.bindings.map((b) => ({
          uri: b.tech?.value || "",
          name: localName(b.tech?.value || ""),
          label: b.label?.value || localName(b.tech?.value || ""),
          type: localName(b.type?.value || "Technology"),
          typeLabel: b.typeLabel?.value || localName(b.type?.value || "Technology"),
          description: b.description?.value || "",
          website: b.website?.value || "",
          version: b.version?.value || "",
        }))
      : await searchLocalTechnologies(q);

    return NextResponse.json(results);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Search API Error]", message);
    return NextResponse.json(
      { error: "Search failed. Is Apache Jena Fuseki running?", detail: message },
      { status: 503 }
    );
  }
}
