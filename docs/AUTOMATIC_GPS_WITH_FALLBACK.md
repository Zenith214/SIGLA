# Automatic GPS Capture with Fallback Options

## Overview
Implemented automatic GPS capture on page load with multiple fallback options to ensure location data is always captured, even in challenging conditions.

## User Flow

### 1. Automatic Capture (Default)
```
Page Loads
    ↓
🌍 Auto-capturing GPS...
    ↓
✅ Success → Location Captured
    OR
❌ Failed → Show Fallback Options
```

### 2. Fallback Options (If Auto-Capture Fails)
```
Automatic GPS Failed
    ↓
User has 3 options:
    1. Retry Automatic GPS
    2. Pin Location on Map (Manual)
    3. Continue Without GPS (Flagged)
```

## Implementation Details

### A. Automatic Capture on Mount
```typescript
// Auto-capture GPS when component loads
useEffect(() => {
  console.log('🌍 Auto-capturing GPS location on mount...')
  captureGPSLocation(true) // true = automatic
}, [])
```

### B. Enhanced Capture Function
```typescript
const captureGPSLocation = async (isAutomatic = false) => {
  setGpsStatus('capturing')
  setGpsError('')
  try {
    const locationData = await getLocation({
      enableHighAccuracy: true,
      timeout: 15000,
      requireAddress: false
    })
    
    const gpsCoords: GPSCoordinates = {
      lat: locationData.latitude,
      lng: locationData.longitude,
      accuracy: locationData.accuracy,
      timestamp: locationData.timestamp
    }
    
    setGpsLocation(gpsCoords)
    setGpsStatus('success')
    onUpdate("verificationLocation", gpsCoords)
    
    console.log(`✅ GPS captured ${isAutomatic ? 'automatically' : 'manually'}`)
  } catch (error) {
    setGpsStatus('error')
    setGpsError(getGPSCaptureErrorMessage(parseGPSCaptureError(error)))
    console.error('GPS capture failed:', error)
  }
}
```

### C. Manual Map Picker Component
Created `ManualLocationPicker.tsx` with:
- Interactive Leaflet map
- Click-to-pin functionality
- Coordinate display
- Confirm/Cancel actions

```typescript
<ManualLocationPicker
  onLocationSelected={(location) => {
    setGpsLocation(location)
    setGpsStatus('success')
    onUpdate("verificationLocation", location)
  }}
  onCancel={() => setShowManualMap(false)}
  initialLocation={gpsLocation || undefined}
/>
```

## UI States

### 1. Capturing (Automatic)
```
┌────────────────────────────────────────┐
│ 🌍 GPS Verification                    │
│ ⏳ Capturing location automatically... │
└────────────────────────────────────────┘
```

### 2. Success
```
┌────────────────────────────────────────┐
│ 🌍 GPS Verification              ✓     │
│ ✅ Location Captured Successfully      │
│ Latitude: 14.123456                    │
│ Longitude: 121.234567                  │
│ Accuracy: ±15m                         │
│ [Recapture Location]                   │
└────────────────────────────────────────┘
```

### 3. Failed (With Fallback Options)
```
┌────────────────────────────────────────┐
│ ⚠️ Automatic GPS Capture Failed        │
│ Error: Location services disabled      │
│                                        │
│ You can:                               │
│ [Retry Automatic GPS]                  │
│ [Pin Location on Map]                  │
│ [Continue Without GPS (Flagged)]       │
└────────────────────────────────────────┘
```

### 4. Manual Map Picker
```
┌────────────────────────────────────────┐
│ 📍 Select Location Manually       [X]  │
├────────────────────────────────────────┤
│ Instructions: Click on the map to pin  │
│ your current location.                 │
├────────────────────────────────────────┤
│                                        │
│         [INTERACTIVE MAP]              │
│                                        │
├────────────────────────────────────────┤
│ Selected Coordinates:                  │
│ Latitude: 14.123456                    │
│ Longitude: 121.234567                  │
│                                        │
│ [Cancel]  [Confirm Location]           │
└────────────────────────────────────────┘
```

## Benefits

### 1. Automatic Capture
- ✅ No user action required
- ✅ Faster data collection
- ✅ Reduces user error
- ✅ Captures immediately on page load

### 2. Retry Option
- ✅ Handles transient GPS errors
- ✅ Allows multiple attempts
- ✅ User-friendly error messages

### 3. Manual Map Picker
- ✅ Works when GPS is disabled/unavailable
- ✅ Works indoors or in poor GPS conditions
- ✅ Visual confirmation of location
- ✅ Accurate pinning on map

### 4. Continue Without GPS
- ✅ Doesn't block survey completion
- ✅ Automatically flagged for review
- ✅ Supervisor can verify later

## Error Handling

### Common GPS Errors
1. **Permission Denied** → Show retry + manual map
2. **Position Unavailable** → Show retry + manual map
3. **Timeout** → Show retry + manual map
4. **Unknown Error** → Show retry + manual map

### Error Messages
- Clear, user-friendly language
- Explains what went wrong
- Suggests next steps
- Doesn't use technical jargon

## Data Quality

### GPS Verification Status
```typescript
gpsVerificationStatus: 'verified' | 'flagged' | 'pending'
```

- **verified**: GPS captured successfully (auto or manual)
- **flagged**: No GPS captured, flagged for review
- **pending**: GPS capture in progress

### Accuracy Tracking
```typescript
{
  lat: number,
  lng: number,
  accuracy: number, // meters (0 for manual)
  timestamp: number
}
```

- Automatic GPS: Includes device accuracy
- Manual map: accuracy = 0 (user-selected)
- No GPS: null

## Files Modified

### 1. `respondent-selection.tsx`
- Added auto-capture on mount
- Enhanced GPS capture function
- Added manual map picker integration
- Updated UI for 3 fallback options

### 2. `ManualLocationPicker.tsx` (New)
- Interactive Leaflet map
- Click-to-pin functionality
- Coordinate display
- Modal interface

### 3. `MapComponent.tsx` (New)
- Reusable map component
- Handles Leaflet initialization
- Marker placement
- Map event handling

## Testing Checklist

- [ ] GPS auto-captures on page load
- [ ] Success state shows coordinates
- [ ] Retry button works after failure
- [ ] Manual map picker opens
- [ ] Can click map to pin location
- [ ] Coordinates update when clicking map
- [ ] Confirm button saves location
- [ ] Cancel button closes map
- [ ] Continue without GPS shows warning
- [ ] GPS data saved to survey
- [ ] Flagged status set when no GPS

## Browser Compatibility

### GPS API Support
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile)
- ✅ Opera

### Map Support
- ✅ All modern browsers
- ✅ Mobile responsive
- ✅ Touch-friendly

## Performance

### Automatic Capture
- Timeout: 15 seconds
- High accuracy mode enabled
- Non-blocking (async)

### Manual Map
- Lazy-loaded (only when needed)
- Lightweight Leaflet library
- CDN-hosted map tiles

## Future Enhancements

1. **Offline Maps**: Cache map tiles for offline use
2. **GPS History**: Show previous capture attempts
3. **Location Validation**: Verify location is within expected area
4. **Distance Calculation**: Calculate distance from assigned spot
5. **Compass Integration**: Show device orientation
