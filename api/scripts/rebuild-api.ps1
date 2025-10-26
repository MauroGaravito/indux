Param(
  [switch]$NoCache
)

$ErrorActionPreference = 'Stop'
$root = (Get-Item $PSScriptRoot).Parent.Parent.FullName
Set-Location $root

Write-Host "[indux] Rebuilding API..." -ForegroundColor Cyan
if ($NoCache) {
  docker compose build --no-cache api
} else {
  docker compose build api
}

Write-Host "[indux] Starting API container..." -ForegroundColor Cyan
docker compose up -d api
Write-Host "[indux] API is up. View logs: docker compose logs -f api" -ForegroundColor Green

