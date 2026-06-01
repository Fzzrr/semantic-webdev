// app/api/tech/[name]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { querySPARQL, localName } from "@/lib/sparql";
import { getTechDetailQuery, getTechRelationsQuery } from "@/lib/queries";
import { getLocalTechDetail } from "@/lib/localOntology";

export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  const { name } = params;

  try {
    // Get basic info
    let detailData;

    try {
      detailData = await querySPARQL(getTechDetailQuery(name));
    } catch {
      detailData = null;
    }

    if (detailData?.results.bindings.length) {
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
        license: b.license?.value || "",
        firstRelease: b.firstRelease?.value || "",
        creator: b.creator?.value || "",
        npmPackage: b.npmPackage?.value || "",
        relations: {} as Record<string, { name: string; label: string; website?: string }[]>,
      };

      try {
        const relData = await querySPARQL(getTechRelationsQuery(name));
        for (const r of relData.results.bindings) {
          const prop = localName(r.property?.value || "");
          const relName = localName(r.relatedTech?.value || "");
          const relLabel = r.relatedLabel?.value || relName;
          const relWebsite = r.relatedWebsite?.value || "";

          if (!prop || prop === "type") continue;
          if (!tech.relations[prop]) tech.relations[prop] = [];

          if (!tech.relations[prop].some((x) => x.name === relName)) {
            tech.relations[prop].push({ name: relName, label: relLabel, website: relWebsite });
          }
        }
      } catch {
        // Fall back to the local TTL detail without extra relations from Fuseki.
      }

      return NextResponse.json(tech);
    }

    const localTech = await getLocalTechDetail(name);
    if (!localTech) {
      return NextResponse.json({ error: "Technology not found" }, { status: 404 });
    }

    return NextResponse.json(localTech);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Tech Detail API Error]", message);
    const localTech = await getLocalTechDetail(name);
    if (localTech) {
      return NextResponse.json(localTech);
    }

    return NextResponse.json(
      { error: "Failed to fetch technology detail.", detail: message },
      { status: 503 }
    );
  }
}
