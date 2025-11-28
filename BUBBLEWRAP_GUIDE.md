# Bubblewrap Android App Guide

## Your App Details

- **URL**: https://mlgrc-pulse.up.railway.app
- **Start Page**: /login (for Field Interviewers)
- **Manifest**: https://mlgrc-pulse.up.railway.app/manifest.json

## Quick Setup (Easiest Method)

### Option 1: PWABuilder (No Code Required)

1. Go to **https://www.pwabuilder.com/**
2. Enter: `https://mlgrc-pulse.up.railway.app`
3. Click **"Start"**
4. Click **"Package For Stores"** → **"Android"**
5. Download the APK
6. Install on Android devices

**Done!** No coding needed.

---

## Option 2: Bubblewrap CLI (More Control)

### Step 1: Install Bubblewrap

```bash
npm install -g @bubblewrap/cli
```

### Step 2: Initialize Project

```bash
bubblewrap init --manifest https://mlgrc-pulse.up.railway.app/manifest.json
```

**Answer the prompts:**
- Domain: `mlgrc-pulse.up.railway.app`
- Package name: `com.mlgrc.pulse`
- App name: `PULSE`
- Start URL: `/login`
- Display mode: `standalone`
- Orientation: `portrait`
- Theme color: `#667eea`
- Background color: `#ffffff`

### Step 3: Build APK

```bash
bubblewrap build
```

This creates: `app-release-signed.apk`

### Step 4: Install on Device

**Via USB:**
```bash
bubblewrap install
```

**Or manually:**
- Copy `app-release-signed.apk` to your phone
- Open and install

---

## What You Get

✅ **Native Android app** that opens directly to login
✅ **Full performance** (uses Chrome's engine, not WebView)
✅ **Offline support** (your IndexedDB already works)
✅ **App icon** on home screen
✅ **No browser UI** (looks like a real app)
✅ **Can publish to Google Play Store**

---

## For Google Play Store

### 1. Generate Signing Key

```bash
bubblewrap build --skipPwaValidation
```

### 2. Update App Details

Edit `twa-manifest.json`:
```json
{
  "packageId": "com.mlgrc.pulse",
  "name": "PULSE Survey System",
  "launcherName": "PULSE",
  "startUrl": "/login",
  "iconUrl": "https://mlgrc-pulse.up.railway.app/icon-512.png",
  "themeColor": "#667eea",
  "backgroundColor": "#ffffff"
}
```

### 3. Build Release APK

```bash
bubblewrap build --skipPwaValidation
```

### 4. Upload to Play Console

- Go to Google Play Console
- Create new app
- Upload `app-release-signed.apk`
- Fill in store listing
- Submit for review

---

## Testing

### Test on Android:

1. Install the APK
2. Open the app
3. Should go directly to login page
4. Test offline mode (turn off WiFi)
5. Test GPS features
6. Test camera (if used)

### Required Permissions:

Add to `AndroidManifest.xml` if needed:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
```

Bubblewrap adds these automatically based on your PWA features.

---

## Troubleshooting

**App won't install:**
- Enable "Install from unknown sources" in Android settings

**App crashes on open:**
- Check Railway logs for errors
- Verify manifest.json is accessible
- Test the URL in Chrome first

**GPS not working:**
- Ensure HTTPS (Railway provides this)
- Grant location permissions when prompted

**Offline mode not working:**
- Check service worker is registered
- Test PWA in Chrome first

---

## Quick Command Reference

```bash
# Install Bubblewrap
npm install -g @bubblewrap/cli

# Initialize
bubblewrap init --manifest https://mlgrc-pulse.up.railway.app/manifest.json

# Build
bubblewrap build

# Install on connected device
bubblewrap install

# Update app
bubblewrap update

# Validate
bubblewrap validate
```

---

## Distribution

**For Field Interviewers:**
1. Build the APK
2. Upload to Google Drive or Dropbox
3. Share link with FIs
4. They download and install
5. Done!

**Or use Google Play Store** for easier updates and distribution.

---

## Your App is Ready!

The manifest is already configured to start at `/login` for mobile users. Just run Bubblewrap and you'll have an Android app!
