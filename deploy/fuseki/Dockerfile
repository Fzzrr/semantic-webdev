# Apache Jena Fuseki — image mandiri untuk hosting eksternal (mis. Render free tier).
# Memuat ontology/webdev.ttl sebagai dataset read-only in-memory /webdev saat startup,
# jadi TIDAK butuh disk persisten. Build context harus = root repo.
FROM eclipse-temurin:17-jre

ENV FUSEKI_VERSION=4.10.0
# Heap kecil agar muat di free tier 512MB RAM (dataset hanya ~2.4k triples).
ENV JVM_ARGS="-Xmx400m -Xms128m"
# Render mengisi $PORT otomatis; default 3030 untuk run lokal.
ENV PORT=3030

WORKDIR /opt
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && \
    curl -L -o fuseki.tar.gz "https://archive.apache.org/dist/jena/binaries/apache-jena-fuseki-${FUSEKI_VERSION}.tar.gz" && \
    tar xzf fuseki.tar.gz && mv "apache-jena-fuseki-${FUSEKI_VERSION}" fuseki && \
    rm fuseki.tar.gz && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY ontology/webdev.ttl /data/webdev.ttl

EXPOSE 3030

# Tanpa flag --update => endpoint query bersifat read-only (aman walau publik).
# Endpoint query yang dihasilkan: /webdev/sparql
CMD ["sh", "-c", "/opt/fuseki/fuseki-server --port ${PORT} --file=/data/webdev.ttl /webdev"]
