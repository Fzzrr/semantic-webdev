@echo off
REM setup-fuseki.bat
REM Script to set up Apache Jena Fuseki on Windows

echo.
echo ============================================
echo   Apache Jena Fuseki Setup - WebDev Semantic
echo ============================================
echo.

REM Check Java
java -version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java not found. Please install Java 17+ first:
    echo         https://adoptium.net/
    pause
    exit /b 1
)
echo [OK] Java found.

SET FUSEKI_VERSION=4.10.0
SET FUSEKI_DIR=apache-jena-fuseki-%FUSEKI_VERSION%
SET DATASET=webdev
SET TTL_FILE=ontology\webdev.ttl

REM Download if not present
IF NOT EXIST "%FUSEKI_DIR%" (
    echo.
    echo Downloading Apache Jena Fuseki %FUSEKI_VERSION%...
    powershell -Command "Invoke-WebRequest -Uri 'https://archive.apache.org/dist/jena/binaries/apache-jena-fuseki-%FUSEKI_VERSION%.zip' -OutFile 'fuseki.zip'"
    echo Extracting...
    powershell -Command "Expand-Archive -Path fuseki.zip -DestinationPath . -Force"
    del fuseki.zip
    echo [OK] Fuseki extracted successfully.
) ELSE (
    echo [OK] Fuseki already exists at ./%FUSEKI_DIR%
)

IF NOT EXIST "%TTL_FILE%" (
    echo [ERROR] Ontology file not found: %TTL_FILE%
    pause
    exit /b 1
)
echo [OK] Ontology file found: %TTL_FILE%

echo.
echo Starting Fuseki...
cd %FUSEKI_DIR%
start "Fuseki Server" java -jar fuseki-server.jar --update --mem /%DATASET%
cd ..

echo Waiting for Fuseki to be ready...
timeout /t 5 /nobreak > nul

echo.
echo Uploading ontology to dataset '%DATASET%'...
curl -X POST -H "Content-Type: text/turtle" --data-binary @%TTL_FILE% http://localhost:3030/%DATASET%/data
echo.

echo.
echo ============================================
echo   Setup Complete!
echo ============================================
echo.
echo   Fuseki SPARQL:  http://localhost:3030/%DATASET%/sparql
echo   Fuseki Web UI:  http://localhost:3030
echo.
echo   Start Next.js:
echo     npm install
echo     npm run dev
echo.
echo   Open browser:   http://localhost:3000
echo.
pause
