# PowerShell script to run full diagnostics for Geotrouvetout
# Install dependencies
npm ci
# Compile TypeScript
npm run build
# Execute diagnostic runner (compiled JS)
if (Test-Path "dist/diagnostic_runner.js") {
  node dist/diagnostic_runner.js
} else {
  Write-Host "⚠️ diagnostic_runner.js not found, attempting to run TS directly..."
  npx tsx diagnostic_runner.ts
}
# Build Docker image (optional, skip if Docker not available)
if (Get-Command docker -ErrorAction SilentlyContinue) {
  try {
    docker build . -t geotrouvetout:diagnostic
  } catch {
    Write-Host "⚠️ Docker build failed: $_"
  }
} else {
  Write-Host "Docker not found, skipping Docker build."
}
# Show diagnostic report if it exists
if (Test-Path "diagnostic_report.json") {
  Get-Content "diagnostic_report.json" | Out-String
} else {
  Write-Host "⚠️ diagnostic_report.json not found."
}
