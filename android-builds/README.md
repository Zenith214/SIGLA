# Android Builds

This folder contains Android app builds and signing keys.

## Contents

- **android.keystore**: Signing key for Android app (keep secure!)
- **app-release-bundle.aab**: Android App Bundle for Play Store
- **app-release-signed.apk.idsig**: APK signature file
- **app-release-unsigned-aligned.apk**: Unsigned aligned APK
- **Pulse-FI-V0.1.1.apk**: Signed release APK (latest version)
- **PULSE-FieldInterviewer.apk**: Previous version

## Security Note

⚠️ **IMPORTANT**: The `android.keystore` file should be kept secure and backed up. Never commit it to version control without encryption.

## Installing APK

To install the APK on an Android device:
1. Enable "Install from Unknown Sources" in device settings
2. Transfer the APK to the device
3. Open and install the APK file
