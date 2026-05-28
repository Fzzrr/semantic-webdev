![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Apache Jena](https://img.shields.io/badge/Apache%20Jena-Fuseki%206-orange)
![License](https://img.shields.io/badge/license-MIT-green)


# 🌐 WebDev Semantic Directory

> Portal pencarian teknologi web development berbasis **Semantic Web**, ditenagai oleh **Apache Jena Fuseki**, **RDF**, dan **SPARQL**.

---

## 📋 Daftar Isi

1. [Deskripsi Project](#deskripsi-project)
2. [Arsitektur Sistem](#arsitektur-sistem)
3. [Teknologi yang Digunakan](#teknologi-yang-digunakan)
4. [Persyaratan Sistem](#persyaratan-sistem)
5. [Instalasi & Setup](#instalasi--setup)
6. [Cara Menjalankan](#cara-menjalankan)
7. [Fitur Aplikasi](#fitur-aplikasi)
8. [Struktur Folder](#struktur-folder)
9. [Ontologi RDF](#ontologi-rdf)
10. [Contoh SPARQL Query](#contoh-sparql-query)
11. [API Endpoints](#api-endpoints)
12. [Menambah Data Baru](#menambah-data-baru)
13. [Troubleshooting](#troubleshooting)

---

## Deskripsi Project

WebDev Semantic Directory adalah portal berbasis **Semantic Web** yang memungkinkan pengguna mencari dan menjelajahi ekosistem teknologi web development.

Data disimpan sebagai **RDF triples** dalam format Turtle (`.ttl`) dan dimuat ke **Apache Jena Fuseki** sebagai triplestore. Semua data diambil menggunakan **SPARQL queries**, bukan hardcoded.

### Contoh use case:
- Cari semua **ORM** yang support PostgreSQL
- Lihat framework apa saja yang berbasis React
- Cari teknologi yang kompatibel dengan Next.js
- Lihat relasi antar teknologi (ontologi)

---

## Arsitektur Sistem

```
Browser (Next.js Frontend)
        ↓
  API Route (Next.js)
        ↓
  SPARQL Query Builder
        ↓
  Apache Jena Fuseki
  (localhost:3030)
        ↓
  RDF Triplestore
  (ontology/webdev.ttl)
```

---

## Teknologi yang Digunakan

| Komponen         | Teknologi                     |
|------------------|-------------------------------|
| Frontend         | Next.js 14 (App Router)       |
| Styling          | Tailwind CSS                  |
| Language         | TypeScript                    |
| Triplestore      | Apache Jena Fuseki 4.x        |
| Data Format      | RDF Turtle (.ttl)             |
| Query Language   | SPARQL 1.1                    |
| Ontology         | RDFS + OWL                    |

---

## Persyaratan Sistem

### Wajib

| Tools    | Versi Minimum | Download                              |
|----------|---------------|---------------------------------------|
| Node.js  | v20+          | https://nodejs.org                    |
| Java JDK | v11+          | https://adoptium.net/                 |
| npm      | v9+           | (sudah termasuk di Node.js)           |

### Opsional
- **Git** — untuk clone repository
- **VS Code** — editor yang disarankan
- **Turtle Syntax Highlight** extension (VS Code)

---

## Instalasi & Setup

### Langkah 1: Clone / Download Project

```bash
# Jika menggunakan Git
git clone <repo-url>
cd semantic-webdev

# Atau ekstrak ZIP lalu masuk folder
cd semantic-webdev
```

### Langkah 2: Install Node.js Dependencies

```bash
npm install
```

### Langkah 3: Setup Apache Jena Fuseki

**Cara otomatis (Linux/Mac):**

```bash
chmod +x setup-fuseki.sh
./setup-fuseki.sh
```

**Cara otomatis (Windows):**

```bat
setup-fuseki.bat
```

**Cara manual:**

#### 3a. Download Apache Jena Fuseki

Unduh dari: https://jena.apache.org/download/

Pilih: `apache-jena-fuseki-4.x.x.zip`

Ekstrak ke dalam folder project.

#### 3b. Jalankan Fuseki

**Linux/Mac:**
```bash
cd apache-jena-fuseki-4.10.0
java -jar fuseki-server.jar --update --mem /webdev
```

**Windows:**
```bat
cd apache-jena-fuseki-4.10.0
java -jar fuseki-server.jar --update --mem /webdev
```

Biarkan terminal ini tetap terbuka. Fuseki berjalan di `http://localhost:3030`

#### 3c. Upload Data Ontologi

**Via terminal (Linux/Mac):**
```bash
curl -X POST \
  -H "Content-Type: text/turtle" \
  --data-binary @ontology/webdev.ttl \
  http://localhost:3030/webdev/data
```

**Via terminal (Windows PowerShell):**
```powershell
Invoke-WebRequest -Uri "http://localhost:3030/webdev/data" `
  -Method POST `
  -ContentType "text/turtle" `
  -InFile "ontology\webdev.ttl"
```

**Via Web UI (cara termudah):**
1. Buka browser → http://localhost:3030
2. Klik menu **"datasets"**
3. Pilih dataset **"webdev"**
4. Klik tab **"upload data"**
5. Upload file `ontology/webdev.ttl`
6. Klik **"upload now"**

### Langkah 4: Konfigurasi Environment (Opsional)

Jika Fuseki berjalan di port berbeda, edit `.env.local`:

```env
FUSEKI_ENDPOINT=http://localhost:3030/webdev/sparql
FUSEKI_UPDATE=http://localhost:3030/webdev/update
FUSEKI_DATA=http://localhost:3030/webdev/data
```

---

## Cara Menjalankan

Pastikan Fuseki sudah berjalan, lalu:

```bash
# Mode development
npm run dev

# Mode production
npm run build
npm start
```

Buka browser: **http://localhost:3000**

---

## Fitur Aplikasi

### FR1 — Search Technology (Real-time)
Ketik di search box, hasil muncul otomatis menggunakan SPARQL `FILTER(CONTAINS(...))`.

```
ORM       → tampilkan Prisma, Sequelize, TypeORM, Drizzle
React     → tampilkan React, Next.js, Remix, Nuxt.js
database  → tampilkan PostgreSQL, MySQL, MongoDB, SQLite, Redis
```

### FR2 — View Detail Technology
Klik salah satu teknologi untuk melihat detail lengkap:
- Tipe (Framework / ORM / Database / dll)
- Deskripsi
- Versi terbaru
- GitHub stars
- Website resmi
- **Semua relasi semantik** (isORMFor, isBuiltOn, compatibleWith, dll)
- RDF Subject URI
- SPARQL query yang digunakan

### FR3 — Filter by Category
Klik tab category di atas untuk filter:
`All` / `Framework` / `Library` / `ORM` / `Database` / `Language` / `Runtime` / `CSS Framework`

### FR4 — SPARQL-based Retrieval
Semua data 100% dari SPARQL query ke Fuseki, tidak ada data hardcoded.

### FR5 — Single-column Layout
Layout vertikal bersih dengan grouping per kategori.

---

## Struktur Folder

```
semantic-webdev/
├── app/
│   ├── api/
│   │   ├── sparql/
│   │   │   └── route.ts          ← API: list semua / per kategori
│   │   ├── search/
│   │   │   └── route.ts          ← API: full-text search
│   │   └── tech/
│   │       └── [name]/
│   │           └── route.ts      ← API: detail satu teknologi
│   ├── tech/
│   │   └── [name]/
│   │       └── page.tsx          ← Halaman detail teknologi
│   ├── globals.css               ← Global styles
│   ├── layout.tsx                ← Root layout
│   └── page.tsx                  ← Halaman utama (homepage)
│
├── components/
│   ├── CategoryFilter.tsx        ← Filter tab per kategori
│   ├── Navbar.tsx                ← Navigasi atas
│   ├── SearchBar.tsx             ← Input pencarian
│   ├── SkeletonCard.tsx          ← Loading placeholder
│   ├── StatusBanner.tsx          ← Indikator koneksi Fuseki
│   └── TechCard.tsx              ← Card satu teknologi
│
├── lib/
│   ├── queries.ts                ← Semua SPARQL query strings
│   ├── sparql.ts                 ← SPARQL HTTP client + helpers
│   └── types.ts                  ← TypeScript types
│
├── ontology/
│   └── webdev.ttl                ← RDF dataset (Turtle format)
│
├── .env.local                    ← Environment variables
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── setup-fuseki.sh               ← Auto-setup Linux/Mac
├── setup-fuseki.bat              ← Auto-setup Windows
└── README.md                     ← Dokumentasi ini
```

---

## Ontologi RDF

### Classes (Hierarki)

```
ex:Technology
  ├── ex:Framework
  ├── ex:Library
  │     └── ex:CSSFramework
  ├── ex:ORM
  ├── ex:Database
  ├── ex:Language
  └── ex:Runtime
```

### Object Properties

| Property         | Domain      | Range       | Makna                              |
|------------------|-------------|-------------|------------------------------------|
| `isFrameworkOf`  | Framework   | Library     | Framework ini berbasis library apa |
| `isBuiltOn`      | Technology  | Technology  | Dibangun di atas teknologi apa     |
| `isORMFor`       | ORM         | Database    | ORM ini support database apa       |
| `usesLanguage`   | Technology  | Language    | Bahasa pemrograman yang digunakan  |
| `compatibleWith` | Technology  | Technology  | Kompatibel dengan apa              |
| `alternativeTo`  | Technology  | Technology  | Alternatif dari                    |
| `connectsTo`     | Technology  | Technology  | Dapat terkoneksi dengan            |

### Data Properties

| Property       | Tipe         | Keterangan                |
|----------------|--------------|---------------------------|
| `description`  | xsd:string   | Deskripsi singkat         |
| `website`      | xsd:anyURI   | URL website resmi         |
| `version`      | xsd:string   | Versi stabil terbaru      |
| `githubStars`  | xsd:string   | Estimasi GitHub stars     |

### Individuals (Data)

Dataset berisi teknologi berikut:

**Frameworks:** Next.js, Nuxt.js, Laravel, Django, Remix  
**Libraries:** React, Vue.js, Svelte, Express.js  
**CSS:** Tailwind CSS  
**ORMs:** Prisma, Sequelize, TypeORM, Drizzle  
**Databases:** PostgreSQL, MySQL, MongoDB, SQLite, Redis  
**Languages:** JavaScript, TypeScript, PHP, Python  
**Runtimes:** Node.js, Bun  

---

## Contoh SPARQL Query

### Cari semua ORM

```sparql
PREFIX ex: <http://webdev.id/ontology#>
SELECT ?orm ?label
WHERE {
  ?orm a ex:ORM .
  OPTIONAL { ?orm rdfs:label ?label }
}
```

### Cari ORM untuk PostgreSQL

```sparql
PREFIX ex: <http://webdev.id/ontology#>
SELECT ?orm ?label
WHERE {
  ?orm ex:isORMFor ex:PostgreSQL .
  OPTIONAL { ?orm rdfs:label ?label }
}
```

### Cari teknologi yang kompatibel dengan Next.js

```sparql
PREFIX ex: <http://webdev.id/ontology#>
SELECT ?tech ?label
WHERE {
  ?tech ex:compatibleWith ex:NextJS .
  OPTIONAL { ?tech rdfs:label ?label }
}
```

### Cari framework berbasis React

```sparql
PREFIX ex: <http://webdev.id/ontology#>
SELECT ?framework ?label
WHERE {
  ?framework a ex:Framework ;
             ex:isFrameworkOf ex:React .
  OPTIONAL { ?framework rdfs:label ?label }
}
```

### Cari semua teknologi beserta tipe dan bahasanya

```sparql
PREFIX ex: <http://webdev.id/ontology#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?tech ?label ?type ?lang
WHERE {
  ?tech a ?type .
  ?type rdfs:subClassOf* ex:Technology .
  OPTIONAL { ?tech rdfs:label ?label }
  OPTIONAL { ?tech ex:usesLanguage ?lang }
  FILTER(?type != ex:Technology)
}
ORDER BY ?type ?label
```

Jalankan query langsung di Fuseki: http://localhost:3030/webdev/sparql

---

## API Endpoints

### GET `/api/sparql`
List semua teknologi.

Query params:
- `?category=ORM` — filter per kategori
- `?stats=true` — hitung per kategori

### GET `/api/search?q=<keyword>`
Cari teknologi berdasarkan keyword.

Contoh: `/api/search?q=postgresql`

### GET `/api/tech/[name]`
Detail satu teknologi beserta semua relasi.

Contoh: `/api/tech/Prisma`

---

## Menambah Data Baru

Edit file `ontology/webdev.ttl`, tambahkan individual baru:

```turtle
ex:Fastify a ex:Library ;
  rdfs:label "Fastify" ;
  ex:description "Fast and low overhead web framework for Node.js." ;
  ex:website "https://fastify.dev"^^xsd:anyURI ;
  ex:usesLanguage ex:JavaScript ;
  ex:isBuiltOn ex:NodeJS ;
  ex:alternativeTo ex:Express .
```

Kemudian upload ulang ke Fuseki:

```bash
# Hapus data lama (opsional)
curl -X POST http://localhost:3030/webdev/update \
  -H "Content-Type: application/sparql-update" \
  -d "CLEAR DEFAULT"

# Upload data baru
curl -X POST \
  -H "Content-Type: text/turtle" \
  --data-binary @ontology/webdev.ttl \
  http://localhost:3030/webdev/data
```

---

## Troubleshooting

### ❌ "Apache Jena Fuseki not connected"

1. Pastikan Fuseki sudah dijalankan:
   ```bash
   java -jar fuseki-server.jar --update --mem /webdev
   ```
2. Cek `http://localhost:3030` di browser
3. Pastikan dataset `webdev` sudah dibuat dan TTL sudah diupload

### ❌ "SPARQL query failed (404)"

Dataset `webdev` belum dibuat. Buat manual di Fuseki Web UI:
- Buka http://localhost:3030
- Klik "manage datasets" → "add new dataset"
- Nama: `webdev`, Tipe: `In-memory`

### ❌ "SPARQL query failed (400)"

Query SPARQL error. Cek format PREFIX atau nama class di `lib/queries.ts`.

### ❌ Port 3030 sudah dipakai

```bash
# Linux/Mac: cari proses di port 3030
lsof -i :3030
# Windows
netstat -ano | findstr :3030
```

Atau jalankan Fuseki di port lain:
```bash
java -jar fuseki-server.jar --update --mem /webdev --port=3031
```
Dan update `.env.local`:
```env
FUSEKI_ENDPOINT=http://localhost:3031/webdev/sparql
```

### ❌ npm install error

```bash
# Hapus node_modules dan reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Referensi

- [Apache Jena Fuseki Documentation](https://jena.apache.org/documentation/fuseki2/)
- [SPARQL 1.1 Query Language](https://www.w3.org/TR/sparql11-query/)
- [RDF 1.1 Turtle](https://www.w3.org/TR/turtle/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

*Built with ❤️ using Semantic Web technologies*
