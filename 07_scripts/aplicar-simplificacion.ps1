# Simplification Script for Geo OS v2.0
$geoPath = "C:\Users\conta\OneDrive\Desktop\Geo"
$geotrouvePath = "$geoPath\Proyectos\Geotrouvetout"
$backupDir = "$geoPath\08_backups\simplificacion_$(Get-Date -Format 'yyyyMMdd_HHmm')"

Write-Host "Starting simplification..."

# 1. Backup directory
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force
}

# 2. Backup Core
$corePath = "$geotrouvePath\src\agent\core\GeoCore.ts"
if (Test-Path $corePath) {
    Copy-Item $corePath "$backupDir\GeoCore.ts.bak"
}

# 3. Archive Agents
$agentesDir = "$geotrouvePath\src\agent\agents"
if (Test-Path $agentesDir) {
    Move-Item "$agentesDir\*" "$backupDir\" -ErrorAction SilentlyContinue
}

$searchPaths = @("$geotrouvePath\*Agent*.ts", "$geotrouvePath\AGENTES_*.ts", "$geotrouvePath\Agentes*_IMPL.ts")
foreach ($path in $searchPaths) {
    Get-ChildItem $path | ForEach-Object { Move-Item $_.FullName "$backupDir\" }
}

# 4. Apply New Core
$newCorePath = "$geotrouvePath\src\agent\core\GeoCore_NEW.ts"
if (Test-Path $newCorePath) {
    Move-Item $newCorePath $corePath -Force
}

# 5. Verify Nucleus
Write-Host "Simplification finished."
Write-Host "Next step: npm run build"
