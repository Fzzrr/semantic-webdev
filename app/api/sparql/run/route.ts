import { NextRequest, NextResponse } from "next/server";
import { querySPARQL } from "@/lib/sparql";
import { runLocalSparql } from "@/lib/localSparql";

// Comunica + n3 butuh runtime Node (bukan Edge).
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const fusekiEndpoint = process.env.FUSEKI_ENDPOINT?.trim();

  try {
    // Pakai Fuseki hanya jika endpoint di-set secara eksplisit (mis. dev lokal).
    // Bila gagal/tidak di-set, jalankan engine SPARQL bawaan (Comunica) atas TTL lokal.
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
        // Fuseki tidak terjangkau → fallback ke engine bawaan.
      }
    }

    const local = await runLocalSparql(query);
    return NextResponse.json(local);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
