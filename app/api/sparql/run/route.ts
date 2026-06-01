import { NextRequest, NextResponse } from "next/server";
import { querySPARQL } from "@/lib/sparql";

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const result = await querySPARQL(query);
    const vars = result.results.bindings.length > 0
      ? Object.keys(result.results.bindings[0])
      : [];
    const bindings = result.results.bindings.map((row) =>
      Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v.value]))
    );
    return NextResponse.json({ vars, bindings });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
