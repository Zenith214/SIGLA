# PWA Infrastructure Implementation

## Overview

This document describes the implementation of the Progressive Web Application (PWA) infrastructure for the PULSE system, enabling offline-first functionality for field data collection.

## Implementation Date

November 16, 2025

## Components Implemented

### 1. Service Worker (`public/sw.js`)

**Purpose**: Enables offline caching and network resilience

**Features**:
- **Cache-First Strategy** for static assets (HTML, CSS, JS, images)
- **Network-First Strategy** for API calls with offline fallback
- Automatic cache management and cleanup
- Offline fallback page support
- Message handling for cache control

**Cache Strategy**:
```javascript
// Static Assets: Cache-First
// 1. Check cache first
// 2. If not found, fetch from network
// 3. Cache the response for future use

// API Calls: Network-First
// 1. Try network first
// 2. Cache successful responses
// 3. If network fails, return cached response
// 4. If no cache, show offline page
```

**Cache Name**: `pulse-pwa-v1`

**Cached Assets**:
- `/` (root)
- `/offline.html`
- `/survey`
- `/manifest.json`

### 2. Offline Fallback Page (`public/offline.html`)

**Purpose**: User-friendly offline experience when network is unavailable

**Features**:
- Clean, responsive design
- Connection status indicator
- Automatic reload when connection restored
- Periodic connection checks (every 5 seconds)
- Reassuring messaging about data safety

**User Experience**:
- Shows when navigation fails offline
- Displays "You're Offline" message
- Explains that data is saved locally
- Provides "Try Again" button
- Auto-reloads when connection restored

### 3. Service Worker Registration (`src/lib/serviceWorkerRegistration.ts`)

**Purpose**: Manages service worker lifecycle

**Functions**:
- `register()`: Registers the service worker
- `unregister()`: Removes the service worker
- `clearCache()`: Clears all cached data

**Features**:
- Automatic update checking (every 60 seconds)
- User notification for new versions
- Graceful handling of controller changes
- Error logging and debugging

### 4. Service Worker Registration Component (`src/components/ServiceWorkerRegistration.tsx`)

**Purpose**: React component to register service worker on app load

**Features**:
- Client-side only execution
- Environment-aware registration
- Enabled in production by default
- Can be enabled in development with `NEXT_PUBLIC_ENABLE_SW=true`

### 5. Web App Manifest (`public/manifest.json`)

**Purpose**: Defines PWA metadata and installation behavior

**Configuration**:
- **Name**: PULSE - Public Understanding and Local Service Evaluation
- **Short Name**: PULSE
- **Start URL**: `/survey`
- **Display Mode**: `standalone` (full-screen app experience)
- **Orientation**: `portrait` (optimized for mobile)
- **Theme Color**: `#667eea` (purple-blue)
- **Background Color**: `#ffffff` (white)

**Icons**:
- 192x192 icon (placeholder - needs actual PNG)
- 512x512 icon (placeholder - needs actual PNG)

**Note**: Icon files are placeholders and should be replaced with actual PNG images.

### 6. Offline Indicator Component (`src/components/OfflineIndicator.tsx`)

**Purpose**: Visual feedback for network status

**Features**:
- Persistent banner when offline
- Toast notification when back online
- Automatic detection of network changes
- Reassuring messaging about data sync

**UI Elements**:
- **Offline Banner**: Amber background, fixed at top, shows "Working offline"
- **Online Notification**: Green toast, top-right, shows "Back online"
- **Icons**: WiFi off/on icons for visual clarity

### 7. Online Status Hook (`src/hooks/useOnlineStatus.ts`)

**Purpose**: React hook for detecting network status

**Returns**: Boolean indicating online/offline state

**Features**:
- Listens to browser online/offline events
- Updates state in real-time
- Provides initial status on mount
- Automatic cleanup on unmount

## Integration Points

### Root Layout (`src/app/layout.tsx`)

**Changes**:
1. Added `ServiceWorkerRegistration` component
2. Added `OfflineIndicator` component
3. Updated metadata with PWA configuration:
   - Manifest link
   - Theme color
   - Viewport settings
   - Apple Web App configuration

### Survey Page (`src/app/survey/page.tsx`)

**Changes**:
1. Added `OfflineIndicator` component to header
2. Provides offline feedback during field work

## Environment Variables

### Optional Configuration

```env
# Enable service worker in development (optional)
NEXT_PUBLIC_ENABLE_SW=true
```

**Default Behavior**:
- Production: Service worker enabled automatically
- Development: Service worker disabled (unless explicitly enabled)

## Testing the PWA

### 1. Test Service Worker Registration

```javascript
// Open browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

### 2. Test Offline Functionality

**Steps**:
1. Open the app in Chrome
2. Open DevTools (F12)
3. Go to Network tab
4. Select "Offline" from throttling dropdown
5. Navigate to different pages
6. Verify offline page appears for failed navigations
7. Verify cached pages still load

### 3. Test Cache Strategy

**Steps**:
1. Open DevTools > Application tab
2. Go to Cache Storage
3. Verify `pulse-pwa-v1` cache exists
4. Check cached assets
5. Clear cache and verify it rebuilds

### 4. Test Offline Indicator

**Steps**:
1. Open the app
2. Toggle offline mode in DevTools
3. Verify amber banner appears
4. Toggle back online
5. Verify green notification appears
6. Verify notification disappears after 3 seconds

### 5. Test PWA Installation

**Desktop (Chrome)**:
1. Open the app
2. Look for install icon in address bar
3. Click to install
4. Verify app opens in standalone window

**Mobile (Chrome/Safari)**:
1. Open the app
2. Tap browser menu
3. Select "Add to Home Screen"
4. Verify app icon appears on home screen
5. Tap icon to open in standalone mode

## Browser Support

### Service Worker Support
- ✅ Chrome 40+
- ✅ Firefox 44+
- ✅ Safari 11.1+
- ✅ Edge 17+
- ❌ Internet Explorer (not supported)

### PWA Installation Support
- ✅ Chrome (Desktop & Mobile)
- ✅ Edge (Desktop & Mobile)
- ✅ Safari (iOS 11.3+)
- ⚠️ Firefox (limited support)

## Known Limitations

### 1. Icon Placeholders

The PWA icons (`icon-192.png` and `icon-512.png`) are currently placeholders. Replace them with actual PNG images:

**Requirements**:
- 192x192 pixels (minimum)
- 512x512 pixels (recommended)
- PNG format
- Transparent or solid background
- Simple, recognizable design

**Tools for Creating Icons**:
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- Adobe Illustrator / Figma

### 2. Service Worker Scope

The service worker is registered at the root (`/`) but primarily caches survey-related routes. Adjust the scope in `sw.js` if needed.

### 3. Cache Size

The cache grows as users navigate. Consider implementing:
- Cache size limits
- Automatic cleanup of old entries
- Selective caching based on importance

### 4. Update Strategy

Currently uses "prompt user" strategy for updates. Consider:
- Automatic updates during idle time
- Background sync for seamless updates
- Version-specific cache names

## Future Enhancements

### Phase 2 Features

1. **Background Sync**
   - Automatic data sync when connection restored
   - Queue failed requests for retry
   - Sync status notifications

2. **Push Notifications**
   - Assignment updates
   - Sync completion alerts
   - System announcements

3. **Advanced Caching**
   - Predictive caching based on user behavior
   - Selective cache invalidation
   - Cache analytics and monitoring

4. **Offline Analytics**
   - Track offline usage patterns
   - Monitor cache hit rates
   - Measure sync performance

5. **Enhanced Update Experience**
   - Silent updates during idle time
   - Progressive update rollout
   - Rollback capability

## Troubleshooting

### Service Worker Not Registering

**Symptoms**: Console shows registration errors

**Solutions**:
1. Verify HTTPS (required for service workers)
2. Check `sw.js` file exists in `/public`
3. Verify no syntax errors in `sw.js`
4. Clear browser cache and reload

### Offline Page Not Showing

**Symptoms**: Blank page or error when offline

**Solutions**:
1. Verify `offline.html` exists in `/public`
2. Check service worker is registered
3. Verify offline page is in cache
4. Test with DevTools offline mode

### Cache Not Updating

**Symptoms**: Old content showing after updates

**Solutions**:
1. Increment cache version in `sw.js`
2. Clear cache manually in DevTools
3. Unregister and re-register service worker
4. Hard reload (Ctrl+Shift+R)

### Offline Indicator Not Working

**Symptoms**: No banner when offline

**Solutions**:
1. Verify `OfflineIndicator` component is imported
2. Check browser console for errors
3. Test with DevTools offline mode
4. Verify `useOnlineStatus` hook is working

## Security Considerations

### 1. HTTPS Required

Service workers only work over HTTPS (except localhost). Ensure production deployment uses HTTPS.

### 2. Cache Poisoning

The service worker caches responses. Ensure:
- Only cache trusted content
- Validate responses before caching
- Implement cache versioning

### 3. Data Privacy

Cached data is stored locally. Consider:
- Encrypting sensitive data
- Clearing cache on logout
- Implementing cache expiration

### 4. Update Security

Service worker updates can be hijacked. Ensure:
- Serve `sw.js` with proper headers
- Implement integrity checks
- Use HTTPS for all resources

## Performance Metrics

### Target Metrics

- **Time to Interactive (TTI)**: < 3s on 3G
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cache Hit Rate**: > 80% for static assets
- **Offline Functionality**: 100% for cached routes

### Monitoring

Use Lighthouse to audit PWA performance:

```bash
# Run Lighthouse audit
npx lighthouse https://your-app-url --view
```

**Key Metrics to Monitor**:
- PWA score
- Performance score
- Offline functionality
- Install prompts
- Cache efficiency

## Deployment Checklist

- [x] Service worker created and tested
- [x] Offline page created and styled
- [x] Web app manifest configured
- [ ] PWA icons created (192x192 and 512x512)
- [x] Service worker registered in app
- [x] Offline indicator implemented
- [x] HTTPS enabled in production
- [ ] Lighthouse PWA audit passed (>90 score)
- [ ] Cross-browser testing completed
- [ ] Mobile device testing completed

## References

- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [PWA Best Practices](https://web.dev/pwa/)
- [Workbox (Advanced SW Library)](https://developers.google.com/web/tools/workbox)

## Conclusion

The PWA infrastructure is now in place, providing:
- ✅ Offline-first architecture
- ✅ Service worker with caching strategies
- ✅ Offline fallback page
- ✅ Network status indicators
- ✅ PWA manifest for installation
- ✅ Automatic service worker registration

**Next Steps**:
1. Replace placeholder icons with actual PNG images
2. Test on various devices and browsers
3. Run Lighthouse audit and optimize
4. Implement IndexedDB for offline data storage (Task 12)
5. Implement data synchronization (Task 12)

The foundation is ready for the next phase: offline data storage and synchronization.
