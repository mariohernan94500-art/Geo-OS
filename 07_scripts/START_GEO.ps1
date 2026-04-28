# GEO Security - Iniciar Servidor Local (PowerShell)

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║    GEO SECURITY - SERVIDOR LOCAL       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Green

# Cambiar a directorio actual
Set-Location $PSScriptRoot

# Verificar Node.js
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Node.js no instalado" -ForegroundColor Red
    Write-Host "Descarga desde: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit
}

Write-Host "✅ Node.js detectado: $nodeVersion`n" -ForegroundColor Green

# Instalar dependencias
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Cyan
    npm install
    Write-Host ""
}

# Iniciar servidor
Write-Host "🚀 Iniciando GEO SERVER...`n" -ForegroundColor Yellow
npm start
