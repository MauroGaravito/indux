Param(
  [switch]$NoCache
)

$ErrorActionPreference = 'Stop'
$root = (Get-Item $PSScriptRoot).Parent.Parent.FullName
Set-Location $root

Write-Host "[indux] Rebuilding Frontend..." -ForegroundColor Cyan
if ($NoCache) {
  docker compose build --no-cache frontend
} else {
  docker compose build frontend
}

Write-Host "[indux] Starting Frontend container..." -ForegroundColor Cyan
docker compose up -d frontend
Write-Host "[indux] Frontend is up. View logs: docker compose logs -f frontend" -ForegroundColor Green

