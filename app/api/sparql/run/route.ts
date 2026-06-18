import { NextRequest, NextResponse } from "next/server";
import { querySPARQL } from "@/lib/sparql";
import { runLocalSparql } from "@/lib/localSparql";

// Comunica + n3 need the Node runtime (not Edge). Always dynamic (never prerendered).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const fusekiEndpoint = process.env.FUSEKI_ENDPOINT?.trim();

  try {
    // Use Fuseki only if the endpoint is set explicitly (e.g. local dev).
    // If it fails/is not set, run the built-in SPARQL engine (Comunica) over the local TTL.
    if (fusekiEndpoint) {
      try {
        const result = await querySPARQL(query);
        const vars =
          result.results.bindings.length > 0
            ? Object.keys(result.results.bindings[0])
            : [];
        const bindings = result.results.bindings.map((row) =>
          Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v.value]))
        );
        return NextResponse.json({ vars, bindings });
      } catch {
        // Fuseki unreachable → fall back to the built-in engine.
      }
    }

    const local = await runLocalSparql(query);
    return NextResponse.json(local);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
