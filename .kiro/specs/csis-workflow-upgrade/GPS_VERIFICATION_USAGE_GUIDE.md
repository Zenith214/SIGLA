# GPS Verification Usage Guide

## For Field Interviewer Components

### Capturing GPS Verification Location

When the FI confirms arrival at the household (before Kish Grid selection):

```typescript
import { GPSCoordinates } from '@/lib/indexedDB';

// Capture GPS location
const verificationLocation: GPSCoordinates = {
  lat: position.coords.latitude,
  lng: position.coords.longitude,
  accuracy: position.coords.accuracy,
  timestamp: position.timestamp
};

// Store in survey data
onUpdate("verificationLocation", verificationLocation);
```

### Creating Survey Record with GPS

```typescript
import { createSurveyRecord, GPSCoordinates } from '@/lib/indexedDB';

const verificationLocation: GPSCoordinates = {
  lat: 10.1234,
  lng: 123.4567,
  accuracy: 15,
  timestamp: Date.now()
};

const record = await createSurveyRecord(
  questionnaireId,
  cycleId,
  spotId,
  { /* initial data */ },
  verificationLocation  // Optional GPS verification
);
```

### Updating GPS Verification Data

```typescript
import { updateSurveyData, GPSCoordinates } from '@/lib/indexedDB';

const verificationLocation: GPSCoordinates = {
  lat: 10.1234,
  lng: 123.4567,
  accuracy: 15,
  timestamp: Date.now()
};

await updateSurveyData(questionnaireId, cycleId, {
  verificationLocation
});
```

## For Sync Components

### Automatic GPS Verification Sync

The sync service automatically includes GPS verification data:

```typescript
import { syncPendingRecords } from '@/lib/syncService';

// GPS verification data is automatically included in sync payload
const result = await syncPendingRecords((progress) => {
  console.log(`Syncing: ${progress.synced}/${progress.total}`);
});

// Check results
if (result.success) {
  console.log(`✅ Synced ${result.synced} records with GPS verification`);
}
```

## For Supervisor Components

### Querying GPS Verification Data

```typescript
// Get survey record with GPS verification
const record = await getSurveyRecord(questionnaireId, cycleId);

if (record?.surveyData.verificationLocation) {
  const { lat, lng, accuracy, timestamp } = record.surveyData.verificationLocation;
  console.log(`GPS captured at: ${lat}, ${lng} (±${accuracy}m)`);
}
```

### Database Queries

```sql
-- Get all flagged interviews
SELECT 
  survey_number,
  questionnaire_id,
  gps_distance_meters,
  gps_verification_status,
  verification_location
FROM survey_response
WHERE gps_verification_status = 'flagged'
ORDER BY gps_distance_meters DESC;

-- Get verification statistics
SELECT 
  gps_verification_status,
  COUNT(*) as count,
  AVG(gps_distance_meters) as avg_distance,
  MAX(gps_distance_meters) as max_distance
FROM survey_response
WHERE verification_location IS NOT NULL
GROUP BY gps_verification_status;
```

## GPS Verification Status Values

- **`pending`**: GPS verification not yet calculated (default)
- **`verified`**: Distance within threshold (≤200m by default)
- **`flagged`**: Distance exceeds threshold (>200m by default)
- **`reviewed`**: Manually reviewed by supervisor

## Threshold Configuration

Default threshold: **200 meters**

To adjust threshold, modify the GPS verification settings in the supervisor dashboard or update the environment variable:

```env
GPS_VERIFICATION_THRESHOLD_METERS=200
```

## Error Handling

### Missing GPS Data

```typescript
// GPS verification is optional
const record = await createSurveyRecord(
  questionnaireId,
  cycleId,
  spotId,
  initialData
  // No GPS verification - will be undefined
);

// Sync will work without GPS verification
// Status will remain 'pending' in database
```

### GPS Capture Failure

```typescript
try {
  const location = await captureGPS();
  onUpdate("verificationLocation", location);
} catch (error) {
  console.warn('GPS capture failed:', error);
  // Continue without GPS - interview can still be completed
  // Will be flagged for manual review
}
```

## Backward Compatibility

### Existing Code

All existing code continues to work without modifications:

```typescript
// Old code - still works
const record = await createSurveyRecord(
  questionnaireId,
  cycleId,
  spotId,
  initialData
);

// New code - with GPS verification
const record = await createSurveyRecord(
  questionnaireId,
  cycleId,
  spotId,
  initialData,
  verificationLocation
);
```

### Existing Records

- Existing offline records have `verificationLocation: undefined`
- Sync works normally for records without GPS verification
- Database fields are nullable and default to `pending` status

## Best Practices

1. **Capture GPS Early**: Capture GPS when FI confirms arrival at household
2. **Handle Failures Gracefully**: Allow survey to continue if GPS fails
3. **Log GPS Status**: Log GPS capture success/failure for debugging
4. **Validate Coordinates**: Use `validateGPSCoordinates()` before storing
5. **Monitor Accuracy**: Check GPS accuracy before accepting coordinates

## Example: Complete GPS Verification Flow

```typescript
import { GPSCoordinates, updateSurveyData } from '@/lib/indexedDB';
import { validateGPSCoordinates } from '@/app/survey/forms/utils/gpsVerification';

// 1. Capture GPS when FI arrives at household
async function captureGPSVerification() {
  try {
    const position = await navigator.geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    });
    
    const verificationLocation: GPSCoordinates = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp
    };
    
    // 2. Validate coordinates
    if (!validateGPSCoordinates(verificationLocation)) {
      throw new Error('Invalid GPS coordinates');
    }
    
    // 3. Store in IndexedDB
    await updateSurveyData(questionnaireId, cycleId, {
      verificationLocation
    });
    
    console.log('✅ GPS verification captured successfully');
    return verificationLocation;
    
  } catch (error) {
    console.warn('⚠️ GPS capture failed:', error);
    // Allow survey to continue without GPS
    return null;
  }
}

// 4. Sync will automatically include GPS verification
// 5. Server will calculate distance and flag if needed
```

## Troubleshooting

### GPS Not Syncing

1. Check that `verificationLocation` is set in survey data
2. Verify sync service includes GPS in payload
3. Check server logs for GPS verification calculation
4. Verify database columns exist (run migration)

### GPS Always Flagged

1. Check threshold configuration (default: 200m)
2. Verify assigned spot location is correct
3. Check GPS accuracy (low accuracy = larger error)
4. Review distance calculation in server logs

### Migration Issues

1. Ensure database migration was applied
2. Check IndexedDB version (should be 2)
3. Clear browser cache if needed
4. Verify no TypeScript errors in console

## Support

For issues or questions:
1. Check implementation summary: `TASK_8_IMPLEMENTATION_SUMMARY.md`
2. Review design document: `design.md`
3. Check requirements: `requirements.md`
4. Review GPS verification utility: `src/app/survey/forms/utils/gpsVerification.ts`
