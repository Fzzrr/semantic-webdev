// app/api/tech/[name]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { querySPARQL, localName } from "@/lib/sparql";
import { getTechDetailQuery, getTechRelationsQuery } from "@/lib/queries";

export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  const { name } = params;

  try {
    // Get basic info
    const detailData = await querySPARQL(getTechDetailQuery(name));
    if (!detailData.results.bindings.length) {
      return NextResponse.json({ error: "Technology not found" }, { status: 404 });
    }

    const b = detailData.results.bindings[0];
    const tech = {
      uri: `http://webdev.id/ontology#${name}`,
      name,
      label: b.label?.value || name,
      type: localName(b.type?.value || "Technology"),
      typeLabel: b.typeLabel?.value || "",
      description: b.description?.value || "",
      website: b.website?.value || "",
      version: b.version?.value || "",
      githubStars: b.githubStars?.value || "",
      relations: {} as Record<string, { name: string; label: string }[]>,
    };

    // Get all relations
    const relData = await querySPARQL(getTechRelationsQuery(name));
    for (const r of relData.results.bindings) {
      const prop = localName(r.property?.value || "");
      const relName = localName(r.relatedTech?.value || "");
      const relLabel = r.relatedLabel?.value || relName;

      if (!prop || prop === "type") continue;
      if (!tech.relations[prop]) tech.relations[prop] = [];

      // Avoid duplicates
      if (!tech.relations[prop].some((x) => x.name === relName)) {
        tech.relations[prop].push({ name: relName, label: relLabel });
      }
    }

    return NextResponse.json(tech);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Tech Detail API Error]", message);
    return NextResponse.json(
      { error: "Failed to fetch technology detail.", detail: message },
      { status: 503 }
    );
  }
}
