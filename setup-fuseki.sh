#!/bin/bash
# setup-fuseki.sh
# Script to automatically set up Apache Jena Fuseki with the webdev dataset

set -e

FUSEKI_VERSION="4.10.0"
FUSEKI_DIR="apache-jena-fuseki-${FUSEKI_VERSION}"
FUSEKI_ZIP="${FUSEKI_DIR}.zip"
FUSEKI_URL="https://archive.apache.org/dist/jena/binaries/${FUSEKI_ZIP}"
DATASET_NAME="webdev"
TTL_FILE="ontology/webdev.ttl"

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║     Apache Jena Fuseki Setup - WebDev Semantic     ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Check Java
if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Please install Java 17+ first."
    echo "   https://adoptium.net/"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -1 | awk -F '"' '{print $2}' | cut -d'.' -f1)
echo "✓ Java found (version: $JAVA_VERSION)"

if [ "$JAVA_VERSION" -lt 11 ] 2>/dev/null; then
    echo "❌ Java 11+ is required. Current: $JAVA_VERSION"
    exit 1
fi

# Download Fuseki if not present
if [ ! -d "$FUSEKI_DIR" ]; then
    echo ""
    echo "📦 Downloading Apache Jena Fuseki ${FUSEKI_VERSION}..."
    if command -v curl &> /dev/null; then
        curl -L "$FUSEKI_URL" -o "$FUSEKI_ZIP"
    elif command -v wget &> /dev/null; then
        wget "$FUSEKI_URL" -O "$FUSEKI_ZIP"
    else
        echo "❌ Neither curl nor wget found. Please download manually:"
        echo "   $FUSEKI_URL"
        exit 1
    fi
    echo "📂 Extracting..."
    unzip -q "$FUSEKI_ZIP"
    rm "$FUSEKI_ZIP"
    echo "✓ Fuseki extracted to ./$FUSEKI_DIR"
else
    echo "✓ Fuseki already downloaded: ./$FUSEKI_DIR"
fi

# Check TTL file
if [ ! -f "$TTL_FILE" ]; then
    echo "❌ Ontology file not found: $TTL_FILE"
    exit 1
fi
echo "✓ Ontology file found: $TTL_FILE"

# Check if Fuseki is already running
if curl -s http://localhost:3030 > /dev/null 2>&1; then
    echo "✓ Fuseki is already running on port 3030"
    FUSEKI_ALREADY_RUNNING=true
else
    FUSEKI_ALREADY_RUNNING=false
fi

if [ "$FUSEKI_ALREADY_RUNNING" = false ]; then
    echo ""
    echo "🚀 Starting Fuseki in background..."
    mkdir -p "${FUSEKI_DIR}/run"
    cd "$FUSEKI_DIR"
    nohup java -jar fuseki-server.jar --update --mem "/$DATASET_NAME" > ../fuseki.log 2>&1 &
    FUSEKI_PID=$!
    cd ..

    echo "   Waiting for Fuseki to start..."
    for i in {1..20}; do
        if curl -s http://localhost:3030 > /dev/null 2>&1; then
            break
        fi
        sleep 1
        echo -n "."
    done
    echo ""

    if ! curl -s http://localhost:3030 > /dev/null 2>&1; then
        echo "❌ Fuseki failed to start. Check fuseki.log for details."
        exit 1
    fi
    echo "✓ Fuseki started (PID: $FUSEKI_PID)"
fi

# Upload TTL to Fuseki
echo ""
echo "📤 Uploading ontology to Fuseki dataset '$DATASET_NAME'..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "Content-Type: text/turtle" \
    --data-binary "@${TTL_FILE}" \
    "http://localhost:3030/${DATASET_NAME}/data")

if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 201 ] || [ "$HTTP_STATUS" -eq 204 ]; then
    echo "✓ Ontology uploaded successfully (HTTP $HTTP_STATUS)"
else
    echo "❌ Upload failed (HTTP $HTTP_STATUS). The dataset may not exist."
    echo "   Please create the dataset '$DATASET_NAME' manually at http://localhost:3030"
fi

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║                   Setup Complete!                  ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""
echo "  Fuseki SPARQL endpoint: http://localhost:3030/${DATASET_NAME}/sparql"
echo "  Fuseki Web UI:          http://localhost:3030"
echo ""
echo "  Now start the Next.js app:"
echo "  $ npm install && npm run dev"
echo ""
echo "  App will be available at: http://localhost:3000"
echo ""
