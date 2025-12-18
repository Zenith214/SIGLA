# PULSE Android App Builder using Bubblewrap
# This script automates the process of building an Android APK from your PWA

Write-Host "🚀 PULSE Android App Builder" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if bubblewrap is installed
Write-Host "Checking for Bubblewrap..." -ForegroundColor Yellow
$bubblewrapInstalled = Get-Command bubblewrap -ErrorAction SilentlyContinue

if (-not $bubblewrapInstalled) {
    Write-Host "❌ Bubblewrap not found. Installing..." -ForegroundColor Red
    npm install -g @bubblewrap/cli
    Write-Host "✅ Bubblewrap installed!" -ForegroundColor Green
} else {
    Write-Host "✅ Bubblewrap is installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "📱 Building Android app from PWA..." -ForegroundColor Yellow
Write-Host ""

# Check if twa-manifest.json exists (project already initialized)
if (Test-Path "twa-manifest.json") {
    Write-Host "✅ Project already initialized" -ForegroundColor Green
    Write-Host "🔨 Building APK..." -ForegroundColor Yellow
    bubblewrap build
} else {
    Write-Host "⚙️  Initializing new project..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please answer the following prompts:" -ForegroundColor Cyan
    Write-Host "  - Domain: mlgrc-pulse.up.railway.app" -ForegroundColor Gray
    Write-Host "  - URL path: /login" -ForegroundColor Gray
    Write-Host "  - Application name: PULSE Field Interviewer" -ForegroundColor Gray
    Write-Host "  - Short name: PULSE FI" -ForegroundColor Gray
    Write-Host "  - Application ID: com.mlgrc.pulse.fi" -ForegroundColor Gray
    Write-Host "  - Display mode: standalone" -ForegroundColor Gray
    Write-Host "  - Orientation: portrait" -ForegroundColor Gray
    Write-Host "  - Status bar color: #667eea" -ForegroundColor Gray
    Write-Host "  - Splash screen color: #ffffff" -ForegroundColor Gray
    Write-Host "  - Icon URL: https://mlgrc-pulse.up.railway.app/android-chrome-512x512.png" -ForegroundColor Gray
    Write-Host "  - Maskable icon: https://mlgrc-pulse.up.railway.app/android-chrome-512x512.png" -ForegroundColor Gray
    Write-Host "  - Request geolocation: Yes" -ForegroundColor Gray
    Write-Host "  - Key store: android.keystore" -ForegroundColor Gray
    Write-Host "  - Key name: android" -ForegroundColor Gray
    Write-Host ""
    
    bubblewrap init --manifest https://mlgrc-pulse.up.railway.app/manifest.json
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Done!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Your APK is ready at:" -ForegroundColor Yellow
Write-Host "   app/build/outputs/apk/release/app-release-signed.apk" -ForegroundColor White
Write-Host ""
Write-Host "📲 To install on a connected device:" -ForegroundColor Yellow
Write-Host "   bubblewrap install" -ForegroundColor White
Write-Host ""
Write-Host "🔄 To update and rebuild:" -ForegroundColor Yellow
Write-Host "   bubblewrap update && bubblewrap build" -ForegroundColor White
Write-Host ""
