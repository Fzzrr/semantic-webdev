/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "/s2/favicons",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  // FUSEKI_* are read server-side only (see lib/sparql.ts). They are intentionally
  // NOT exposed to the client bundle so the backend endpoint URL stays private.
  experimental: {
    // Sertakan file ontologi ke serverless function (dibaca runtime via fs di
    // lib/localOntology.ts & lib/localSparql.ts). Tanpa ini, di Vercel file tidak
    // ikut ter-bundle → "file not found".
    outputFileTracingIncludes: {
      "/api/**": ["./ontology/**"],
    },
  },
};

module.exports = nextConfig;
