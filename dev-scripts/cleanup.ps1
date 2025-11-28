# Cleanup script to remove unnecessary files before deployment
Write-Host "Cleaning up codebase..." -ForegroundColor Green

# Remove test output folders
if (Test-Path "coverage") { Remove-Item -Recurse -Force "coverage"; Write-Host "✓ Removed coverage/" }
if (Test-Path "test-results") { Remove-Item -Recurse -Force "test-results"; Write-Host "✓ Removed test-results/" }
if (Test-Path "playwright-report") { Remove-Item -Recurse -Force "playwright-report"; Write-Host "✓ Removed playwright-report/" }

# Remove build artifacts
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next"; Write-Host "✓ Removed .next/" }
if (Test-Path "tsconfig.tsbuildinfo") { Remove-Item -Force "tsconfig.tsbuildinfo"; Write-Host "✓ Removed tsconfig.tsbuildinfo" }

# Remove node_modules (will be reinstalled)
if (Test-Path "node_modules") { 
    Write-Host "Removing node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✓ Removed node_modules/"
}

Write-Host "`nCleanup complete! Run 'pnpm install' to reinstall dependencies." -ForegroundColor Green
