@echo off
REM ═══════════════════════════════════════════════════════
REM  GEO OS — Subir proyecto al VPS Hostinger desde Windows
REM  Ejecutar con doble clic ANTES del deploy
REM  Requiere tener instalado: Git Bash o WSL
REM ═══════════════════════════════════════════════════════

setlocal

REM ── CONFIGURAR AQUI ──────────────────────────────────────
REM Cambia TU_IP_VPS por la IP real de tu Hostinger VPS
REM La encuentras en hPanel > VPS > Información del servidor
SET VPS_IP=TU_IP_VPS
SET VPS_USER=root
SET LOCAL_GEO=C:\Users\conta\OneDrive\Desktop\Proyecto\Proyecto\Geotrouvetout
SET LOCAL_ECO=C:\Users\conta\OneDrive\Desktop\Proyecto\Proyecto\EcoOrigen_Web
SET LOCAL_VOREN=C:\Users\conta\OneDrive\Desktop\Proyecto\Proyecto\maester-app\packages\voren
REM ─────────────────────────────────────────────────────────

echo.
echo ═══════════════════════════════════════════════
echo   GEO OS — Subiendo archivos al VPS Hostinger
echo ═══════════════════════════════════════════════
echo.

REM Verificar que existe Git Bash o WSL
where bash >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: No encontre bash.exe
    echo Instala Git for Windows: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [1/4] Subiendo GeoCore ^(backend^)...
bash -c "rsync -avz --exclude='node_modules' --exclude='dist' --exclude='.env' --exclude='*.db' --exclude='temp_audio' '%LOCAL_GEO%/' %VPS_USER%@%VPS_IP%:/var/www/geoos/"

echo.
echo [2/4] Subiendo .env de GeoCore ^(privado^)...
bash -c "scp '%LOCAL_GEO%/.env' %VPS_USER%@%VPS_IP%:/var/www/geoos/.env"

echo.
echo [3/4] Construyendo y subiendo EcoOrigen Web...
cd /d %LOCAL_ECO%
call npm run build
bash -c "rsync -avz dist/ %VPS_USER%@%VPS_IP%:/var/www/ecoorigen_web/"

echo.
echo [4/4] Subiendo Voren Dashboard...
bash -c "rsync -avz '%LOCAL_VOREN%/' %VPS_USER%@%VPS_IP%:/var/www/voren/"

echo.
echo ═══════════════════════════════════════════════
echo   ✅ Archivos subidos al VPS
echo.
echo   Ahora ve al hPanel de Hostinger:
echo   VPS ^> Terminal SSH ^> pega este comando:
echo.
echo   bash /var/www/geoos/deploy_hostinger.sh
echo ═══════════════════════════════════════════════
echo.
pause
