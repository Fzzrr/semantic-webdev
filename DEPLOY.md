# Panduan Deploy

Deploy aplikasi ke **Vercel** dan Apache Jena Fuseki ke **Render** (gratis).

## Arsitektur produksi

```
Browser ──▶ Next.js (Vercel) ──▶ /api/* (server-side)
                                   │
                                   ├─▶ Fuseki (Render)  ── query SPARQL
                                   └─▶ Fallback parser N3.js (ontology/webdev.ttl)
```

- Query SPARQL diproksi **server-side**, jadi browser tidak pernah mengakses Fuseki langsung (tanpa masalah CORS, URL backend tidak bocor ke client).
- Halaman Explorer, detail, dan relasi tetap jalan lewat **fallback parser lokal** walau Fuseki tidur/mati. Hanya tab **Query Editor** di `/sparql` yang butuh Fuseki hidup.
- **Satu-satunya env var produksi yang diperlukan: `FUSEKI_ENDPOINT`.** (NextAuth/Google tidak aktif di kode, jadi env auth tidak perlu di-set.)

---

## Langkah 0 — Push ke GitHub

Render dan Vercel mengimpor dari GitHub.

```bash
git add .
git commit -m "chore: siapkan deploy (Dockerfile Fuseki + panduan)"
git push origin main      # atau branch yang kamu pakai
```

---

## Langkah 1 — Deploy Fuseki ke Render (gratis)

Data ontologi sudah di-bake ke dalam image Docker (`deploy/fuseki/Dockerfile`) dan dimuat sebagai dataset **read-only** saat startup — tidak butuh disk persisten.

1. Buka [render.com](https://render.com) → **New +** → **Web Service**.
2. Hubungkan akun GitHub → pilih repo ini.
3. Konfigurasi:
   - **Language / Runtime**: `Docker`
   - **Root Directory**: *(kosongkan — pakai root repo)*
   - **Dockerfile Path**: `deploy/fuseki/Dockerfile`
   - **Instance Type**: **Free**
4. Klik **Create Web Service**. Render build image (mengunduh Fuseki + bake TTL) lalu deploy.
   - Render mengisi `PORT` otomatis; Dockerfile sudah listen di `$PORT`.
5. Setelah live, catat URL-nya, misal: `https://webdev-fuseki.onrender.com`.
6. **Uji endpoint** (buka di browser):
   ```
   https://<host-render>/webdev/sparql?query=SELECT%20*%20WHERE%7B%3Fs%20%3Fp%20%3Fo%7D%20LIMIT%201
   ```
   Jika muncul hasil JSON/tabel → Fuseki siap. (Buka root URL untuk UI Fuseki.)

> Catatan free tier: service **tidur** setelah ~15 menit idle. Permintaan pertama setelah idle butuh ~30–60 detik (cold start). Tidak masalah — Explorer tetap instan via fallback lokal, hanya Query Editor yang menunggu Fuseki bangun.

---

## Langkah 2 — Deploy app ke Vercel

1. Buka [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Impor repo ini (Vercel auto-detect Next.js — tidak perlu ubah build settings).
3. Buka **Environment Variables**, tambahkan:

   | Key | Value | Environment |
   |---|---|---|
   | `FUSEKI_ENDPOINT` | `https://<host-render>/webdev/sparql` | Production, Preview, Development |

4. Klik **Deploy**. Selesai → dapat domain `https://<app>.vercel.app`.

> Kalau nanti mengaktifkan login (NextAuth/Google), baru tambahkan `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Saat ini tidak diperlukan.

---

## Langkah 3 — Verifikasi

1. Buka `https://<app>.vercel.app/` → daftar teknologi tampil.
2. `/sparql` → tab **Query Editor** → klik **Jalankan** pada contoh query → muncul hasil
   (bukti Vercel → Fuseki Render tersambung). Jika cold start, ulangi setelah beberapa detik.
3. `/relations` dan `/tech/<nama>` tampil normal.
4. `/docs` dan chip endpoint di `/sparql` → tidak ada lagi tulisan `localhost`.

---

## Operasional

- **Update data ontologi**: ubah `ontology/webdev.ttl` → `git push`. Render otomatis rebuild image (data ter-bake ulang). Vercel juga otomatis redeploy app. Tidak perlu upload manual.
- **Ganti penyedia Fuseki** (Fly.io / Railway / VPS): cukup ubah nilai `FUSEKI_ENDPOINT` di Vercel, tanpa ubah kode.
- **Uji image Fuseki secara lokal** (opsional, butuh Docker):
  ```bash
  docker build -f deploy/fuseki/Dockerfile -t webdev-fuseki .
  docker run --rm -p 3030:3030 webdev-fuseki
  # lalu uji: http://localhost:3030/webdev/sparql
  ```

## Keamanan

- Endpoint Fuseki dijalankan **tanpa `--update`** → read-only, aman walau publik.
- Query diproksi server-side via `/api/sparql/run`; pertimbangkan menambah rate-limit/timeout bila perlu mencegah query mahal dari publik.
