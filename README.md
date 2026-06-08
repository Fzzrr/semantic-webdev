![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Apache Jena](https://img.shields.io/badge/Apache%20Jena-Fuseki%204.10-orange)
![License](https://img.shields.io/badge/license-MIT-green)

# WebDev Semantic Directory

Portal pencarian teknologi web development berbasis Semantic Web menggunakan RDF Turtle, SPARQL, dan Apache Jena Fuseki.

## Daftar Isi

1. [Ringkasan](#ringkasan)
2. [Arsitektur](#arsitektur)
3. [Stack Teknologi](#stack-teknologi)
4. [Persyaratan](#persyaratan)
5. [Quick Start Windows](#quick-start-windows)
6. [Menjalankan Fuseki](#menjalankan-fuseki)
7. [Menjalankan Frontend](#menjalankan-frontend)
8. [Halaman Aplikasi](#halaman-aplikasi)
9. [Update TTL](#update-ttl)
10. [Validasi Hasil](#validasi-hasil)
11. [Struktur Folder](#struktur-folder)
12. [Ontologi](#ontologi)
13. [API Endpoints](#api-endpoints)
14. [Troubleshooting](#troubleshooting)
15. [Referensi](#referensi)

## Ringkasan

Data utama disimpan di [ontology/webdev.ttl](ontology/webdev.ttl), dimuat ke Fuseki, lalu di-query lewat API route Next.js.

Jika Fuseki tidak aktif, backend tetap bisa membaca data dari TTL lokal melalui parser n3 (fallback), sehingga aplikasi tetap berjalan tanpa triplestore.

## Arsitektur

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

## Stack Teknologi

| Komponen | Teknologi |
|---|---|
| Frontend | Next.js 14 (App Router), React 18 |
| Bahasa | TypeScript |
| Styling | Tailwind CSS |
| Triplestore | Apache Jena Fuseki 4.10.0 |
| Data Format | RDF Turtle (.ttl) |
| Query | SPARQL 1.1 |
| Local Parser | n3 |

## Persyaratan

| Tool | Minimum | Catatan |
|---|---|---|
| Node.js | v20+ | Menjalankan Next.js |
| npm | v9+ | Umumnya sudah ikut Node.js |
| Java | v17+ | Menjalankan Fuseki 4.10.0 |

## Quick Start Windows

Jalankan dari root project:

```bat
npm install
setup-fuseki.bat
npm run dev
```

Lalu buka:

- App: http://localhost:3000
- Fuseki UI: http://localhost:3030
- SPARQL endpoint: http://localhost:3030/webdev/sparql

## Menjalankan Fuseki

### Opsi A - Script otomatis (disarankan)

Script [setup-fuseki.bat](setup-fuseki.bat) akan:

- Mengecek instalasi Java.
- Mengunduh & mengekstrak Fuseki 4.10.0 jika belum ada.
- Menjalankan Fuseki dengan dataset in-memory `webdev` (`--update --mem /webdev`).
- Upload [ontology/webdev.ttl](ontology/webdev.ttl) via curl.

Perintah:

```bat
setup-fuseki.bat
```

> Catatan: dataset dijalankan secara in-memory, jadi data hilang saat Fuseki dimatikan. Jalankan ulang `setup-fuseki.bat` untuk menyalakan dan meng-upload ulang TTL.

### Opsi B - Manual dari Fuseki lokal di repo

Repo sudah menyertakan [apache-jena-fuseki-4.10.0](apache-jena-fuseki-4.10.0).

1. Jalankan Fuseki:

```bat
cd apache-jena-fuseki-4.10.0
java -jar fuseki-server.jar --update --mem /webdev
```

2. Upload TTL:

```powershell
Invoke-WebRequest -Uri "http://localhost:3030/webdev/data" `
  -Method POST `
  -ContentType "text/turtle" `
  -InFile "ontology\webdev.ttl"
```

## Menjalankan Frontend

Setelah Fuseki aktif, jalankan frontend dari root:

```bat
npm run dev
```

Mode production:

```bat
npm run build
npm start
```

Endpoint Fuseki dapat di-override lewat environment variable `FUSEKI_ENDPOINT` (default `http://localhost:3030/webdev/sparql`).

## Deployment

Cukup deploy ke **Vercel** — lihat [DEPLOY.md](DEPLOY.md). Query SPARQL dijalankan oleh engine bawaan (Comunica) di server atas `ontology/webdev.ttl`, jadi **tidak perlu meng-host Fuseki** dan **tidak ada env var wajib**. Fuseki tetap opsional via `FUSEKI_ENDPOINT`.

## Halaman Aplikasi

| Route | Deskripsi |
|---|---|
| `/` | Explorer - daftar & pencarian teknologi dengan filter kategori |
| `/tech/[name]` | Detail satu teknologi beserta relasinya |
| `/sparql` | SPARQL playground - tulis & jalankan query langsung ke endpoint |
| `/docs` | Dokumentasi ontologi: kategori, predikat/relasi, dan contoh query |

## Update TTL

Setiap kali [ontology/webdev.ttl](ontology/webdev.ttl) berubah:

1. Simpan file TTL.
2. Clear dataset atau restart Fuseki.
3. Upload ulang TTL.
4. Hard refresh browser (Ctrl+F5).

Contoh clear dan upload ulang:

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

## Validasi Hasil

Checklist cepat setelah run:

1. Buka app di http://localhost:3000.
2. Cek statistik kategori di http://localhost:3000/api/sparql?stats=true.
3. Pastikan kategori semantic web baru muncul, misalnya SemanticWebSpec dan Triplestore.
4. Cek detail node, misalnya /api/tech/Fuseki.
5. Coba jalankan query di halaman /sparql.

## Struktur Folder

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

## Ontologi

Ontology utama ada di [ontology/webdev.ttl](ontology/webdev.ttl) dengan fokus:

- Kelas teknologi web: Framework, Library, ORM, Database, Runtime, dan lainnya.
- Kelas semantic web: SemanticWebSpec, Triplestore.
- Relasi utama: isBuiltOn, compatibleWith, connectsTo, alternativeTo, implementsSpec, dan lainnya.

Contoh entitas semantic web yang sudah dimodelkan:

- RDF, RDFS, OWL2, SPARQL, TurtleSyntax, JSONLD, SHACL
- ApacheJena, Fuseki, GraphDB, Blazegraph, Virtuoso
- Comunica, N3JS, RDFJS

Daftar lengkap kategori dan predikat relasi dapat dilihat di halaman `/docs`.

## API Endpoints

### GET /api/sparql

Ambil list teknologi.

Query params:

- `category=<ClassName>` contoh `category=Triplestore`
- `q=<keyword>` contoh `q=sparql`
- `stats=true` untuk statistik per kategori

### GET /api/search?q=<keyword>

Pencarian cepat teknologi berdasarkan keyword.

### GET /api/tech/[name]

Detail satu teknologi beserta relasi.

Contoh:

- `/api/tech/Fuseki`
- `/api/tech/NextJS`

### GET /api/relations

Mengembalikan seluruh triple relasi dari ontologi lokal (digunakan untuk graph relasi).

### POST /api/sparql/run

Menjalankan query SPARQL bebas terhadap endpoint Fuseki.

Body (JSON):

```json
{ "query": "SELECT * WHERE { ?s ?p ?o } LIMIT 10" }
```

Respons berisi `vars` (daftar variabel) dan `bindings` (hasil baris).

## Troubleshooting

### Fuseki tidak terhubung

- Pastikan Java 17+ terinstall.
- Pastikan Fuseki berjalan di http://localhost:3030.
- Pastikan dataset webdev tersedia.

### Data belum berubah setelah update TTL

- Pastikan dataset sudah di-clear atau server Fuseki di-restart.
- Upload ulang TTL.
- Hard refresh browser.

### SPARQL 404

- Endpoint atau dataset salah.
- Cek endpoint di [lib/sparql.ts](lib/sparql.ts) atau set `FUSEKI_ENDPOINT`.

### UI kosong padahal API sudah ada data

- Buka tab baru atau hard refresh.
- Jika perlu, hapus folder `.next` lalu jalankan ulang `npm run dev`.

### Port 3030 dipakai proses lain

```bat
netstat -ano | findstr :3030
```

## Referensi

- Apache Jena Fuseki: https://jena.apache.org/documentation/fuseki2/
- SPARQL 1.1: https://www.w3.org/TR/sparql11-query/
- RDF Turtle: https://www.w3.org/TR/turtle/
- Next.js: https://nextjs.org/docs
