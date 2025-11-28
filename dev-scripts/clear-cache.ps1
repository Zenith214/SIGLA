# Simple cache clearing script
# Run this before starting dev server

Write-Host "Clearing caches..." -ForegroundColor Cyan

# Clear Next.js cache
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "Cleared .next folder" -ForegroundColor Green
}

# Clear node_modules cache
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force node_modules\.cache
    Write-Host "Cleared node_modules cache" -ForegroundColor Green
}

Write-Host ""
Write-Host "Done! Now run: npm run dev" -ForegroundColor Green
Write-Host "Then press Ctrl+Shift+R in your browser" -ForegroundColor Yellow
