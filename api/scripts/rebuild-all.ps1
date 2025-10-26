Param(
  [switch]$NoCache
)

$ErrorActionPreference = 'Stop'
$root = (Get-Item $PSScriptRoot).Parent.Parent.FullName
Set-Location $root

Write-Host "[indux] Rebuilding all services..." -ForegroundColor Cyan
if ($NoCache) {
  docker compose build --no-cache
} else {
  docker compose build
}

Write-Host "[indux] Starting stack..." -ForegroundColor Cyan
docker compose up -d
Write-Host "[indux] Stack is up. View logs: docker compose ps" -ForegroundColor Green

