# Offline Survey Integration - Quick Start Guide

## For Developers

### Starting an Interview from a Spot

When a Field Interviewer clicks "Start Interview" on an interview slot card, the system navigates to:

```
/survey/forms?questionnaireId=2024-001-001&cycleId=1&spotId=1
```

**Parameters:**
- `questionnaireId`: Unique identifier for the interview (e.g., "2024-001-001")
- `cycleId`: Survey cycle ID
- `spotId`: Spot ID where the interview is located

### How It Works

1. **New Interview (Pending Status)**
   - User clicks "Start Interview"
   - System navigates to survey form with parameters
   - Survey form checks IndexedDB for existing record
   - No record found → Creates new record with status "In Progress"
   - User completes survey sections
   - Data is saved to IndexedDB after each section

2. **Callback Interview (In Progress Status)**
   - User clicks "Log Visit Status"
   - User selects "Interview Started"
   - System navigates to survey form with questionnaireId
   - Survey form loads existing record from IndexedDB
   - User continues from where they left off
   - Data is updated in IndexedDB

3. **Offline Workflow**
   - User goes offline
   - Continues completing survey sections
   - Data is saved to IndexedDB (works offline)
   - User submits survey
   - Record is marked as "Completed (Pending Sync)"
   - When online, AutoSync automatically syncs to server

### Using the useSurveyRecord Hook

```typescript
import { useSurveyRecord } from '@/hooks/useSurveyRecord';

function MyComponent() {
  const {
    record,           // Current survey record
    loading,          // Loading state
    error,            // Error state
    exists,           // Whether record exists
    loadRecord,       // Load record from IndexedDB
    createRecord,     // Create new record
    updateData,       // Update survey data
    logVisit,         // Log a visit
    markCompleted,    // Mark as completed
    refresh,          // Refresh from IndexedDB
  } = useSurveyRecord({
    questionnaireId: '2024-001-001',
    cycleId: 1,
    spotId: 1,
    autoLoad: true,   // Auto-load on mount
  });

  // Use the hook methods...
}
```

### IndexedDB Schema

```typescript
interface SurveyRecord {
  id: string;                    // `${questionnaireId}_${cycleId}`
  questionnaireId: string;       // e.g., "2024-001-001"
  cycleId: number;               // Survey cycle ID
  spotId: number;                // Spot ID
  status: SurveyRecordStatus;    // 'Pending' | 'In Progress' | 'Completed' | 'Completed (Pending Sync)'
  visits: Visit[];               // Array of visit attempts
  surveyData: SurveyData;        // Survey form data
  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date;
}
```

### Auto-Sync Component

The `AutoSync` component is mounted at the app level and automatically:
1. Monitors online/offline status
2. Detects when connection is restored
3. Checks for pending sync records
4. Syncs records to server
5. Shows toast notifications

**Usage:**
```typescript
import { AutoSync } from '@/components/AutoSync';

function App() {
  return (
    <>
      <AutoSync />
      {/* Rest of your app */}
    </>
  );
}
```

### Manual Sync

To manually trigger sync:

```typescript
import { syncPendingRecords } from '@/lib/syncService';

async function handleManualSync() {
  const result = await syncPendingRecords((progress) => {
    console.log(`Syncing: ${progress.synced}/${progress.total}`);
  });
  
  console.log(`Synced ${result.synced} records`);
}
```

### Checking Pending Sync Count

```typescript
import { getPendingSyncCount } from '@/lib/syncService';

const count = await getPendingSyncCount();
console.log(`${count} records pending sync`);
```

## For Testers

### Testing Offline Workflow

1. **Start Interview**
   - Go to "My Spots" tab
   - Click on a spot with pending interviews
   - Click "Start Interview" on a pending slot
   - Verify you're redirected to survey form

2. **Complete Sections Offline**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Select "Offline" from throttling dropdown
   - Complete survey sections
   - Verify data is saved (check Application → IndexedDB)

3. **Submit Survey**
   - Submit the survey while offline
   - Verify success message
   - Check IndexedDB → status should be "Completed (Pending Sync)"

4. **Test Auto-Sync**
   - Go back online (disable offline mode)
   - Wait a few seconds
   - Verify toast notification appears: "Syncing Data..."
   - Verify success notification: "Sync Complete"
   - Check IndexedDB → status should be "Completed"

### Testing Callback Scenario

1. **Start Interview**
   - Start a new interview
   - Complete initialization section
   - Close the browser tab

2. **Log Callback**
   - Go back to the spot
   - Click "Log Visit Status" on the in-progress slot
   - Select "Callback Needed"
   - Add notes
   - Submit

3. **Resume Interview**
   - Click "Log Visit Status" again
   - Select "Interview Started"
   - Verify you're redirected to survey form
   - Verify existing data is loaded
   - Complete the survey

### Checking IndexedDB

**Chrome DevTools:**
1. Press F12
2. Go to "Application" tab
3. Expand "IndexedDB"
4. Click "pulse-survey-db"
5. Click "survey-records"
6. View stored records

## Common Issues

### Record Not Loading
- Check URL parameters are present
- Check IndexedDB in DevTools
- Check browser console for errors

### Auto-Sync Not Triggering
- Verify you went from offline to online
- Check browser console for sync logs
- Verify there are pending records

### Data Not Saving
- Check browser console for errors
- Verify IndexedDB is supported
- Check storage quota

## API Endpoints Used

- `POST /api/visits` - Log visit attempts
- `POST /api/survey-responses` - Submit survey
- `POST /api/sync` - Bulk sync records
- `GET /api/questionnaires/:id` - Get questionnaire details

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

## Storage Limits

- IndexedDB: ~50MB minimum (varies by browser)
- Recommended: Monitor storage usage
- Clear old synced records periodically

