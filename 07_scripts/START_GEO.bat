@echo off
REM GEO Security - Iniciar Servidor Local
REM Requiere Node.js instalado

color 0A
cls

echo.
echo ╔════════════════════════════════════════╗
echo ║    GEO SECURITY - SERVIDOR LOCAL       ║
echo ╚════════════════════════════════════════╝
echo.

REM Cambiar a directorio actual
cd /d %~dp0

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo ❌ ERROR: Node.js no está instalado
    echo Ve a https://nodejs.org/ e instala la versión LTS
    pause
    exit /b 1
)

echo ✅ Node.js detectado
echo.

REM Instalar dependencias si no existen
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    call npm install
    echo.
)

REM Iniciar servidor
echo 🚀 Iniciando servidor...
echo.
call npm start

pause
