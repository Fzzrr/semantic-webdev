# Panduan Deploy (Vercel)

Aplikasi ini cukup di-deploy ke **Vercel saja**. Query SPARQL dijalankan oleh
**engine bawaan (Comunica)** di server, langsung atas `ontology/webdev.ttl` — **tidak
perlu meng-host Apache Jena Fuseki**. Semua fitur tetap utuh (Explorer, detail,
relation map, dan tab **Query Editor** di `/sparql`).

## Arsitektur produksi

```
Browser ──▶ Next.js (Vercel)
              ├─ /api/sparql, /api/tech, /api/relations  ─▶ parser lokal (n3) atas webdev.ttl
              └─ /api/sparql/run (Query Editor)          ─▶ engine SPARQL bawaan (Comunica) atas webdev.ttl
```

- Tidak ada server eksternal. Tidak ada env var wajib.
- Fuseki **opsional**: bila `FUSEKI_ENDPOINT` di-set, `/api/sparql/run` memakai Fuseki
  (dan otomatis fallback ke engine bawaan jika Fuseki tak terjangkau).

---

## Langkah 1 — Push ke GitHub

```bash
git add .
git commit -m "feat: SPARQL engine bawaan (Comunica) untuk deploy tanpa Fuseki"
git push origin main      # atau branch yang kamu pakai
```

## Langkah 2 — Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Impor repo ini (Vercel auto-detect Next.js — tidak perlu ubah build settings).
3. **Tidak ada Environment Variable yang wajib di-set.** Langsung **Deploy**.
4. Selesai → dapat domain `https://<app>.vercel.app`.

## Langkah 3 — Verifikasi

1. Buka `https://<app>.vercel.app/` → daftar teknologi tampil.
2. `/sparql` → tab **Query Editor** → klik **Jalankan** pada contoh query → muncul hasil
   (bukti engine SPARQL bawaan bekerja, tanpa Fuseki).
3. `/relations` dan `/tech/<nama>` tampil normal.

---

## Opsional — memakai Apache Jena Fuseki

Engine bawaan sudah cukup untuk semua fitur. Pakai Fuseki hanya jika butuh triplestore
penuh (mis. SPARQL Update atau dataset sangat besar):

- **Lokal**: jalankan `setup-fuseki.bat`, lalu set `FUSEKI_ENDPOINT=http://localhost:3030/webdev/sparql` di `.env.local`.
- **Production**: host Fuseki sendiri, lalu set env `FUSEKI_ENDPOINT=https://<host>/webdev/sparql` di Vercel.

## Operasional

- **Update data ontologi**: ubah `ontology/webdev.ttl` → `git push`. Vercel redeploy otomatis;
  engine bawaan langsung memakai data terbaru.
