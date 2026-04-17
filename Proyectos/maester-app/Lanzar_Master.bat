@echo off
setlocal
title GEO OS MASTER HUB - Mario Ovalle

echo =======================================================
echo          G E O   O S   -   M A S T E R   H U B
echo =======================================================
echo.

:: 1. Backend GeoCore
echo [1/3] Iniciando Nucleo Geotrouvetout (Puerto 3000)...
:: Si la carpeta está fuera (sibling), usamos ..\, si está dentro usamos packages\
if exist "packages\geo-trouvetout" (
    start cmd /k "cd /d packages\geo-trouvetout && npm start"
) else (
    start cmd /k "cd /d ..\Geotrouvetout && npm start"
)

timeout /t 5 /nobreak > nul

:: 2. Voren Frontend
echo [2/3] Iniciando Dashboard Voren (Puerto 8080)...
start cmd /k "npx -y http-server packages/voren -p 8080"

timeout /t 3 /nobreak > nul

:: 3. EcoOrigen Web
echo [3/3] Iniciando Tienda EcoOrigen...
if exist "packages\ecoorigen-web" (
    start cmd /k "cd /d packages\ecoorigen-web && npm run dev"
) else (
    start cmd /k "cd /d ..\EcoOrigen_Web && npm run dev"
)

echo.
echo =======================================================
echo    SISTEMA MAESTRO GEO OS TOTALMENTE EN LINEA
echo =======================================================
echo.
echo Dashboard disponible en: http://localhost:8080
echo API disponible en: http://localhost:3000
echo.
pause
