@echo off
setlocal
title GEO OS MASTER LAUNCHER - Eco Origen Pro

echo =======================================================
echo     G E O   O S   -   M A S T E R   L A U N C H E R
echo          Premium Engine: Gemini 1.5 Pro
echo =======================================================
echo.

:: 1. Lanzar el Cerebro (Backend) en una ventana nueva
echo [1/3] Despertando Cerebro Central...
start cmd /k "cd /d C:\Users\conta\OneDrive\Desktop\Geo\Proyectos\Geotrouvetout && npm run build && npm start"

timeout /t 3 /nobreak > nul

:: 2. Lanzar la App (Expo / QR / Emulador) en una ventana nueva
echo [2/3] Proyectando App Mobile (Expo)...
start cmd /k "cd /d C:\Users\conta\OneDrive\Desktop\Geo\Proyectos\Geotrouvetout\app_frontend && npm run android"

timeout /t 3 /nobreak > nul

:: 3. Lanzar la Tienda Eco Origen Web en una ventana nueva
echo [3/3] Abriendo Tienda Eco Origen Web...
start cmd /k "cd /d C:\Users\conta\OneDrive\Desktop\Geo\Proyectos\Vidrio-Renacido\EcoOrigen_Web && npm run dev"

echo.
echo =======================================================
echo    SISTEMA OPERATIVO GEO OS TOTALMENTE EN LINEA
echo =======================================================
echo.
echo No cierres las 3 ventanas de terminal que se abrieron.
echo.
pause
