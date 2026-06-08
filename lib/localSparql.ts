// lib/localSparql.ts
// Menjalankan query SPARQL 1.1 langsung di server (tanpa Fuseki) menggunakan
// Comunica sebagai engine, atas N3.Store yang dimuat dari ontology/webdev.ttl.
import fs from "node:fs/promises";
import path from "node:path";
import { Parser, Store } from "n3";
import { QueryEngine } from "@comunica/query-sparql-rdfjs";

export interface LocalSparqlResult {
  vars: string[];
  bindings: Record<string, string>[];
}

let storePromise: Promise<Store> | null = null;

async function getStore(): Promise<Store> {
  if (!storePromise) {
    storePromise = (async () => {
      const ttl = await fs.readFile(
        path.join(process.cwd(), "ontology", "webdev.ttl"),
        "utf8"
      );
      const quads = new Parser().parse(ttl);
      return new Store(quads);
    })();
  }
  return storePromise;
}

// Satu engine bisa dipakai ulang antar request.
const engine = new QueryEngine();

export async function runLocalSparql(query: string): Promise<LocalSparqlResult> {
  const store = await getStore();
  const result = await engine.query(query, { sources: [store] });

  if (result.resultType === "bindings") {
    const stream = await result.execute();
    const rows = await stream.toArray();
    const metadata = await result.metadata();
    const vars = metadata.variables.map((v) => v.value);
    const bindings = rows.map((row) => {
      const obj: Record<string, string> = {};
      for (const variable of vars) {
        const term = row.get(variable);
        if (term) obj[variable] = term.value;
      }
      return obj;
    });
    return { vars, bindings };
  }

  if (result.resultType === "boolean") {
    const value = await result.execute();
    return { vars: ["result"], bindings: [{ result: String(value) }] };
  }

  if (result.resultType === "quads") {
    const stream = await result.execute();
    const quads = await stream.toArray();
    const vars = ["subject", "predicate", "object"];
    const bindings = quads.map((q) => ({
      subject: q.subject.value,
      predicate: q.predicate.value,
      object: q.object.value,
    }));
    return { vars, bindings };
  }

  // resultType "void" (mis. update) — tidak didukung di engine read-only.
  return { vars: [], bindings: [] };
}
