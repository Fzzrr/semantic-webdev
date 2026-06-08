# Deployment Guide (Vercel)

This app can simply be deployed to **Vercel alone**. SPARQL queries are executed by the
**built-in engine (Comunica)** on the server, directly over `ontology/webdev.ttl` — **there is no
need to host Apache Jena Fuseki**. All features remain intact (Explorer, detail pages,
relation map, and the **Query Editor** tab at `/sparql`).

## Production architecture

```
Browser ──▶ Next.js (Vercel)
              ├─ /api/sparql, /api/tech, /api/relations  ─▶ local parser (n3) over webdev.ttl
              └─ /api/sparql/run (Query Editor)          ─▶ built-in SPARQL engine (Comunica) over webdev.ttl
```

- No external server. No required env vars.
- Fuseki is **optional**: when `FUSEKI_ENDPOINT` is set, `/api/sparql/run` uses Fuseki
  (and automatically falls back to the built-in engine if Fuseki is unreachable).

---

## Step 1 — Push to GitHub

```bash
git add .
git commit -m "feat: built-in SPARQL engine (Comunica) for deploying without Fuseki"
git push origin main      # or whichever branch you use
```

## Step 2 — Deploy to Vercel

1. Open [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Import this repo (Vercel auto-detects Next.js — no need to change build settings).
3. **No Environment Variable is required.** Just hit **Deploy**.
4. Done → you get a `https://<app>.vercel.app` domain.

## Step 3 — Verify

1. Open `https://<app>.vercel.app/` → the technology list appears.
2. `/sparql` → **Query Editor** tab → click **Run** on the example query → results appear
   (proof the built-in SPARQL engine works, without Fuseki).
3. `/relations` and `/tech/<name>` render normally.

---

## Optional — using Apache Jena Fuseki

The built-in engine is enough for all features. Use Fuseki only if you need a full
triplestore (e.g. SPARQL Update or a very large dataset):

- **Local**: run `setup-fuseki.bat`, then set `FUSEKI_ENDPOINT=http://localhost:3030/webdev/sparql` in `.env.local`.
- **Production**: host Fuseki yourself, then set the `FUSEKI_ENDPOINT=https://<host>/webdev/sparql` env on Vercel.

## Operations

- **Update ontology data**: edit `ontology/webdev.ttl` → `git push`. Vercel redeploys automatically;
  the built-in engine immediately uses the latest data.
