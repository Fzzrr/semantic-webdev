![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Apache Jena](https://img.shields.io/badge/Apache%20Jena-Fuseki%204.10-orange)
![License](https://img.shields.io/badge/license-MIT-green)

# WebDev Semantic Directory

A Semantic Web–based search portal for web development technologies, using RDF Turtle, SPARQL, and Apache Jena Fuseki.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Requirements](#requirements)
5. [Quick Start (Windows)](#quick-start-windows)
6. [Running Fuseki](#running-fuseki)
7. [Running the Frontend](#running-the-frontend)
8. [Application Pages](#application-pages)
9. [Updating the TTL](#updating-the-ttl)
10. [Validating the Results](#validating-the-results)
11. [Folder Structure](#folder-structure)
12. [Ontology](#ontology)
13. [API Endpoints](#api-endpoints)
14. [Troubleshooting](#troubleshooting)
15. [References](#references)

## Overview

The main data lives in [ontology/webdev.ttl](ontology/webdev.ttl), is loaded into Fuseki, and is then queried through Next.js API routes.

If Fuseki is not running, the backend can still read the data from the local TTL via the n3 parser (fallback), so the app keeps working without a triplestore.

## Architecture

```text
Browser (Next.js Frontend)
  |
  v
API Route (app/api/*)
  |
  v
SPARQL Query Builder (lib/queries.ts)
  |
  +--> Apache Jena Fuseki (localhost:3030)
  |
  +--> Local TTL Fallback (lib/localOntology.ts)
```

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Triplestore | Apache Jena Fuseki 4.10.0 |
| Data Format | RDF Turtle (.ttl) |
| Query | SPARQL 1.1 |
| Local Parser | n3 |

## Requirements

| Tool | Minimum | Notes |
|---|---|---|
| Node.js | v20+ | Runs Next.js |
| npm | v9+ | Usually bundled with Node.js |
| Java | v17+ | Runs Fuseki 4.10.0 |

## Quick Start (Windows)

Run from the project root:

```bat
npm install
setup-fuseki.bat
npm run dev
```

Then open:

- App: http://localhost:3000
- Fuseki UI: http://localhost:3030
- SPARQL endpoint: http://localhost:3030/webdev/sparql

## Running Fuseki

### Option A - Automated script (recommended)

The [setup-fuseki.bat](setup-fuseki.bat) script will:

- Check the Java installation.
- Download & extract Fuseki 4.10.0 if it is not present.
- Run Fuseki with an in-memory dataset `webdev` (`--update --mem /webdev`).
- Upload [ontology/webdev.ttl](ontology/webdev.ttl) via curl.

Command:

```bat
setup-fuseki.bat
```

> Note: the dataset runs in-memory, so the data is lost when Fuseki is stopped. Re-run `setup-fuseki.bat` to start it again and re-upload the TTL.

### Option B - Manual, from the local Fuseki in the repo

The repo already includes [apache-jena-fuseki-4.10.0](apache-jena-fuseki-4.10.0).

1. Start Fuseki:

```bat
cd apache-jena-fuseki-4.10.0
java -jar fuseki-server.jar --update --mem /webdev
```

2. Upload the TTL:

```powershell
Invoke-WebRequest -Uri "http://localhost:3030/webdev/data" `
  -Method POST `
  -ContentType "text/turtle" `
  -InFile "ontology\webdev.ttl"
```

## Running the Frontend

Once Fuseki is running, start the frontend from the root:

```bat
npm run dev
```

Production mode:

```bat
npm run build
npm start
```

The Fuseki endpoint can be overridden via the `FUSEKI_ENDPOINT` environment variable (default `http://localhost:3030/webdev/sparql`).

## Deployment

Just deploy to **Vercel** — see [DEPLOY.md](DEPLOY.md). SPARQL queries are executed by the built-in engine (Comunica) on the server over `ontology/webdev.ttl`, so you **do not need to host Fuseki** and there are **no required env vars**. Fuseki remains optional via `FUSEKI_ENDPOINT`.

## Application Pages

| Route | Description |
|---|---|
| `/` | Explorer - list & search technologies with category filters |
| `/tech/[name]` | Detail page for a single technology and its relations |
| `/sparql` | SPARQL playground - write & run queries directly against the endpoint |
| `/docs` | Ontology documentation: categories, predicates/relations, and example queries |

## Updating the TTL

Every time [ontology/webdev.ttl](ontology/webdev.ttl) changes:

1. Save the TTL file.
2. Clear the dataset or restart Fuseki.
3. Re-upload the TTL.
4. Hard refresh the browser (Ctrl+F5).

Example clear and re-upload:

```powershell
Invoke-WebRequest -Uri "http://localhost:3030/webdev/update" `
  -Method POST `
  -ContentType "application/sparql-update" `
  -Body "CLEAR DEFAULT"

Invoke-WebRequest -Uri "http://localhost:3030/webdev/data" `
  -Method POST `
  -ContentType "text/turtle" `
  -InFile "ontology\webdev.ttl"
```

## Validating the Results

Quick checklist after a run:

1. Open the app at http://localhost:3000.
2. Check the category stats at http://localhost:3000/api/sparql?stats=true.
3. Make sure the new semantic web categories show up, e.g. SemanticWebSpec and Triplestore.
4. Check a node's detail, e.g. /api/tech/Fuseki.
5. Try running a query on the /sparql page.

## Folder Structure

```text
semantic-webdev/
|- app/
|  |- api/
|  |  |- relations/route.ts
|  |  |- search/route.ts
|  |  |- sparql/route.ts
|  |  |- sparql/run/route.ts
|  |  |- tech/[name]/route.ts
|  |- docs/page.tsx
|  |- sparql/page.tsx
|  |- tech/[name]/page.tsx
|  |- globals.css
|  |- layout.tsx
|  |- page.tsx
|- components/
|  |- CategoryFilter.tsx
|  |- Navbar.tsx
|  |- RelationGraph.tsx
|  |- SearchBar.tsx
|  |- SkeletonCard.tsx
|  |- StatusBanner.tsx
|  |- TechCard.tsx
|  |- TechLogo.tsx
|- lib/
|  |- localOntology.ts
|  |- queries.ts
|  |- sparql.ts
|  |- types.ts
|- ontology/
|  |- webdev.ttl
|- apache-jena-fuseki-4.10.0/
|- setup-fuseki.bat
|- setup-fuseki.sh
|- package.json
|- README.md
```

## Ontology

The main ontology lives in [ontology/webdev.ttl](ontology/webdev.ttl) and focuses on:

- Web technology classes: Framework, Library, ORM, Database, Runtime, and more.
- Semantic web classes: SemanticWebSpec, Triplestore.
- Key relations: isBuiltOn, compatibleWith, connectsTo, alternativeTo, implementsSpec, and more.

Example semantic web entities already modeled:

- RDF, RDFS, OWL2, SPARQL, TurtleSyntax, JSONLD, SHACL
- ApacheJena, Fuseki, GraphDB, Blazegraph, Virtuoso
- Comunica, N3JS, RDFJS

The full list of categories and relation predicates can be seen on the `/docs` page.

## API Endpoints

### GET /api/sparql

Fetch the technology list.

Query params:

- `category=<ClassName>` e.g. `category=Triplestore`
- `q=<keyword>` e.g. `q=sparql`
- `stats=true` for per-category statistics

### GET /api/search?q=<keyword>

Quick technology search by keyword.

### GET /api/tech/[name]

Detail for a single technology and its relations.

Examples:

- `/api/tech/Fuseki`
- `/api/tech/NextJS`

### GET /api/relations

Returns all relation triples from the local ontology (used for the relation graph).

### POST /api/sparql/run

Runs an arbitrary SPARQL query against the Fuseki endpoint.

Body (JSON):

```json
{ "query": "SELECT * WHERE { ?s ?p ?o } LIMIT 10" }
```

The response contains `vars` (the list of variables) and `bindings` (the result rows).

## Troubleshooting

### Fuseki not connected

- Make sure Java 17+ is installed.
- Make sure Fuseki is running at http://localhost:3030.
- Make sure the webdev dataset is available.

### Data has not changed after updating the TTL

- Make sure the dataset has been cleared or the Fuseki server has been restarted.
- Re-upload the TTL.
- Hard refresh the browser.

### SPARQL 404

- Wrong endpoint or dataset.
- Check the endpoint in [lib/sparql.ts](lib/sparql.ts) or set `FUSEKI_ENDPOINT`.

### UI is empty even though the API has data

- Open a new tab or hard refresh.
- If needed, delete the `.next` folder and re-run `npm run dev`.

### Port 3030 is used by another process

```bat
netstat -ano | findstr :3030
```

## References

- Apache Jena Fuseki: https://jena.apache.org/documentation/fuseki2/
- SPARQL 1.1: https://www.w3.org/TR/sparql11-query/
- RDF Turtle: https://www.w3.org/TR/turtle/
- Next.js: https://nextjs.org/docs
