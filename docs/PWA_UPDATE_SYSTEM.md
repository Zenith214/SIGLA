# PWA Update System

## Overview
The PULSE PWA now has an enhanced automatic update system that ensures field interviewers always have the latest version of the app.

## How It Works

### 1. Automatic Update Detection
- The service worker checks for updates every 30 seconds
- Updates are also checked when the app becomes visible (user switches back to the app)
- When a new version is deployed, the service worker detects it automatically

### 2. User-Friendly Update Prompt
- When an update is available, a blue notification appears at the bottom of the screen
- Users can choose to:
  - **Update Now**: Immediately reload and get the latest version
  - **Later**: Dismiss the prompt and update later
  - **Close (X)**: Dismiss the notification

### 3. Cache Versioning
- Service worker cache version: `v4`
- Manifest version: `1.1.0`
- Old caches are automatically cleaned up when new versions are activated

## For Developers

### Deploying Updates
When you deploy updates to production:

1. The service worker will automatically detect the new version
2. Users will see the update prompt on their next app interaction
3. No manual intervention required

### Force Update (if needed)
To force all users to update immediately:

1. Increment the cache version in `public/sw.js`:
   ```javascript
   const CACHE_NAME = 'pulse-fi-pwa-v5'; // Increment version
   const RUNTIME_CACHE = 'pulse-fi-runtime-v5';
   ```

2. Update the manifest version in `public/manifest.json`:
   ```json
   "version": "1.2.0"
   ```

3. Deploy the changes

### Testing Updates Locally
1. Build and run the production version:
   ```bash
   npm run build
   npm start
   ```

2. Make a change to any file
3. Rebuild and restart
4. Refresh the app - you should see the update prompt

## Update Flow

```
User opens app
    ↓
Service worker checks for updates (every 30s)
    ↓
New version detected?
    ↓ Yes
Service worker downloads new files
    ↓
Update prompt appears
    ↓
User clicks "Update Now"
    ↓
New service worker activates
    ↓
App reloads with new version
```

## Benefits

1. **Automatic**: No manual app store updates required
2. **Fast**: Updates deploy instantly when you push to production
3. **User Control**: Users can choose when to update
4. **Reliable**: Old caches are cleaned up automatically
5. **Offline Support**: App continues to work offline even during updates

## Monitoring

Check browser console for service worker logs:
- `[SW] Service Worker registered`
- `[SW] New content available`
- `[SW] Controller changed, reloading page`

## Troubleshooting

If updates aren't working:

1. **Clear browser cache**: Settings → Clear browsing data
2. **Unregister service worker**: 
   - Chrome DevTools → Application → Service Workers → Unregister
3. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. **Check console**: Look for service worker errors

## Version History

- **v4 (Current)**: Enhanced update system with user-friendly prompts
- **v3**: Basic update detection
- **v2**: Initial offline support
- **v1**: Basic PWA setup
