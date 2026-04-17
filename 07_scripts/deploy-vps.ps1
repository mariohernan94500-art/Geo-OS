# =============================================================
#   GEO OS v2.0 - Deploy al VPS (76.13.166.221)
#   Ejecutar desde PowerShell en la carpeta Geotrouvetout
# =============================================================

$VPS_IP    = "76.13.166.221"
$VPS_USER  = "root"
$VPS_DIR   = "/var/www/geo-core"
$SRC       = "C:\Users\conta\OneDrive\Desktop\Geo\Proyectos\Geotrouvetout"

# --- Paso 1: Crear estructura en VPS ---
Write-Host "[1/4] Creando estructura en VPS..." -ForegroundColor Cyan
ssh "${VPS_USER}@${VPS_IP}" "mkdir -p ${VPS_DIR}/src && mkdir -p /data/geo"

# --- Paso 2: Subir archivos ---
Write-Host "[2/4] Subiendo archivos al VPS..." -ForegroundColor Cyan
scp "$SRC\package.json"      "${VPS_USER}@${VPS_IP}:${VPS_DIR}/"
scp "$SRC\package-lock.json" "${VPS_USER}@${VPS_IP}:${VPS_DIR}/"
scp "$SRC\tsconfig.json"     "${VPS_USER}@${VPS_IP}:${VPS_DIR}/"
scp "$SRC\Dockerfile"        "${VPS_USER}@${VPS_IP}:${VPS_DIR}/"
scp "$SRC\docker-compose.yml" "${VPS_USER}@${VPS_IP}:${VPS_DIR}/"
scp "$SRC\.env"              "${VPS_USER}@${VPS_IP}:${VPS_DIR}/"

Write-Host "[2/4] Subiendo codigo fuente (src/)..." -ForegroundColor Yellow
scp -r "$SRC\src" "${VPS_USER}@${VPS_IP}:${VPS_DIR}/"

# --- Paso 3: Build y run en VPS ---
Write-Host "[3/4] Construyendo imagen Docker en VPS..." -ForegroundColor Cyan
ssh "${VPS_USER}@${VPS_IP}" @"
cd ${VPS_DIR}
docker compose down --remove-orphans 2>/dev/null || true
docker compose build --no-cache
docker compose up -d
"@

# --- Paso 4: Verificar ---
Write-Host "[4/4] Verificando estado..." -ForegroundColor Cyan
ssh "${VPS_USER}@${VPS_IP}" "docker ps | grep geo-core && docker logs geo-core --tail 20"

Write-Host ""
Write-Host "=== DEPLOY COMPLETADO ===" -ForegroundColor Green
Write-Host "API:      https://agent.ecoorigenchile.com"
Write-Host "Logs:     ssh root@76.13.166.221 -t 'docker logs geo-core -f'"
Write-Host "Restart:  ssh root@76.13.166.221 -t 'docker restart geo-core'"
