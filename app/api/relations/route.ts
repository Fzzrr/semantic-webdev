import { NextResponse } from "next/server";
import { getLocalAllRelations } from "@/lib/localOntology";

export async function GET() {
  const triples = await getLocalAllRelations();
  return NextResponse.json(triples);
}
