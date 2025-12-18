# Android Configuration

This folder contains all Android TWA (Trusted Web Activity) configuration files and build artifacts.

## Contents

- **android-app/**: Android app source code and build files
- **gradle/**: Gradle wrapper files
- **build.gradle**, **settings.gradle**: Gradle build configuration
- **gradlew**, **gradlew.bat**: Gradle wrapper scripts
- **.bubblewrap.json**: Bubblewrap configuration for TWA
- **twa-manifest.json**: TWA manifest configuration
- **BUBBLEWRAP_GUIDE.md**: Guide for building Android app with Bubblewrap
- **gradle.properties**: Gradle properties
- **manifest-checksum.txt**: Manifest checksum for verification
- **store_icon.png**: App store icon

## Building the Android App

See `BUBBLEWRAP_GUIDE.md` for detailed instructions on building the Android app.

Quick build command (from project root):
```bash
./dev-scripts/build-android-app.ps1
```
