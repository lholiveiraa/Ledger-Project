# Cleanup Script (Windows PowerShell)
# Remove artefatos gerados pela execução do WorkOps

Write-Host "Cleaning up WorkOps artifacts..." -ForegroundColor Yellow

# 1. Remove Databases
if (Test-Path "workops.db") {
    Remove-Item "workops.db" -Force
    Write-Host "- Removed: workops.db (SQLite)" -ForegroundColor Green
}
if (Test-Path "workops.db-shm") { Remove-Item "workops.db-shm" -Force }
if (Test-Path "workops.db-wal") { Remove-Item "workops.db-wal" -Force }

# 2. Remove Binaries
$binaries = @("cp.exe", "workops.exe", "agent.exe")
foreach ($bin in $binaries) {
    if (Test-Path $bin) {
        Remove-Item $bin -Force
        Write-Host "- Removed: $bin" -ForegroundColor Green
    }
}

# 3. Remove Logs
if (Test-Path "*.log") {
    Remove-Item "*.log" -Force
    Write-Host "- Removed: Log files" -ForegroundColor Green
}

Write-Host "Cleanup complete." -ForegroundColor Cyan
