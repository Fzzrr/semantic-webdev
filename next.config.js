/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "/s2/favicons",
      },
    ],
  },
  env: {
    FUSEKI_ENDPOINT: process.env.FUSEKI_ENDPOINT || "http://localhost:3030/webdev/sparql",
    FUSEKI_UPDATE: process.env.FUSEKI_UPDATE || "http://localhost:3030/webdev/update",
    FUSEKI_DATA: process.env.FUSEKI_DATA || "http://localhost:3030/webdev/data",
  },
};

module.exports = nextConfig;
