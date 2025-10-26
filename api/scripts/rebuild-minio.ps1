$ErrorActionPreference = 'Stop'
$root = (Get-Item $PSScriptRoot).Parent.Parent.FullName
Set-Location $root

Write-Host "[indux] Ensuring MinIO is up (recreate if needed)..." -ForegroundColor Cyan
docker compose up -d minio
Write-Host "[indux] Restarting MinIO..." -ForegroundColor Cyan
docker compose restart minio
Write-Host "[indux] MinIO container restarted. Logs: docker compose logs -f minio" -ForegroundColor Green

