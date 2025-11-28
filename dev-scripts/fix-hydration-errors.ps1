# PowerShell script to fix hydration errors completely
# Run this whenever you see hydration or service worker errors

Write-Host "Fixing Hydration and Service Worker Errors..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop any running dev servers
Write-Host "1. Stopping any running processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*next*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "   Done: Processes stopped" -ForegroundColor Green

# Step 2: Clear Next.js cache
Write-Host "2. Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "   Done: Removed .next folder" -ForegroundColor Green
} else {
    Write-Host "   Info: .next folder does not exist" -ForegroundColor Gray
}

# Step 3: Clear node_modules cache
Write-Host "3. Clearing node_modules cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
    Write-Host "   Done: Removed node_modules cache" -ForegroundColor Green
} else {
    Write-Host "   Info: node_modules cache does not exist" -ForegroundColor Gray
}

# Step 4: Verify .env.local exists and has correct settings
Write-Host "4. Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_ENABLE_SW=false") {
        Write-Host "   Done: Service worker is disabled" -ForegroundColor Green
    } else {
        Write-Host "   Warning: Adding service worker disable flag" -ForegroundColor Yellow
        Add-Content ".env.local" "`nNEXT_PUBLIC_ENABLE_SW=false"
        Write-Host "   Done: Service worker disabled" -ForegroundColor Green
    }
} else {
    Write-Host "   Warning: Creating .env.local file" -ForegroundColor Yellow
    "# Disable service worker in development to prevent errors`nNEXT_PUBLIC_ENABLE_SW=false" | Out-File ".env.local" -Encoding UTF8
    Write-Host "   Done: .env.local created" -ForegroundColor Green
}

# Step 5: Clear browser cache instructions
Write-Host ""
Write-Host "5. Browser Cache Cleanup Required:" -ForegroundColor Yellow
Write-Host "   Please do ONE of the following:" -ForegroundColor White
Write-Host "   A) Press Ctrl+Shift+R to hard refresh" -ForegroundColor Cyan
Write-Host "   B) Open DevTools (F12) > Right-click refresh > Empty Cache and Hard Reload" -ForegroundColor Cyan
Write-Host "   C) Use Incognito/Private browsing mode" -ForegroundColor Cyan
Write-Host ""

# Step 6: Start dev server
Write-Host "6. Starting development server..." -ForegroundColor Yellow
Write-Host "   Server will start now" -ForegroundColor Gray
Write-Host "   Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

Start-Sleep -Seconds 2

# Start the dev server
npm run dev
