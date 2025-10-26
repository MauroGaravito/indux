$ErrorActionPreference = 'Stop'
$root = (Get-Item $PSScriptRoot).Parent.Parent.FullName
Set-Location $root

Write-Host "[indux] Ensuring Mongo is up (recreate if needed)..." -ForegroundColor Cyan
docker compose up -d mongo
Write-Host "[indux] Restarting Mongo..." -ForegroundColor Cyan
docker compose restart mongo
Write-Host "[indux] Mongo container restarted. Logs: docker compose logs -f mongo" -ForegroundColor Green

