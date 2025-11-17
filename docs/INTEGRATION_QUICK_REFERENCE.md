# CSIS Workflow Integration - Quick Reference

## API Endpoints Reference

### FS Dashboard Endpoints

| Endpoint | Method | Purpose | Request Body | Response |
|----------|--------|---------|--------------|----------|
| `/api/spots` | GET | Get spots for cycle | Query: `cycleId` | `{ spots: Spot[] }` |
| `/api/spots` | POST | Create new spot | `{ cycleId, barangayId, spotName, startingPoint, randomStart }` | `{ spotId, questionnaires[] }` |
| `/api/spots/:id` | DELETE | Delete spot | - | `{ success: boolean }` |
| `/api/spots/:id/assign` | PUT | Assign spot to FI | `{ fiId }` | `{ success, assignedTo }` |
| `/api/fs/monitoring` | GET | Get monitoring data | Query: `cycleId` | `{ spots[], fieldInterviewers[], summary }` |
| `/api/assignments` | GET | Get all assignments | - | `Assignment[]` |
| `/api/assignments` | POST | Create assignment | `{ userId, barangayId, cycleId }` | `Assignment` |
| `/api/assignments/:id` | DELETE | Delete assignment | - | `{ success: boolean }` |

### FI Dashboard Endpoints

| Endpoint | Method | Purpose | Request Body | Response |
|----------|--------|---------|--------------|----------|
| `/api/fi/assignments` | GET | Get FI's spots | Query: `cycleId` | `{ assignments: Spot[] }` |
| `/api/questionnaires/:id` | GET | Get questionnaire details | - | `{ questionnaireId, status, visits[] }` |
| `/api/visits` | POST | Log visit attempt | `{ questionnaireId, outcome, notes, location }` | `{ visitId, visitNumber, questionnaireStatus }` |
| `/api/survey-responses` | POST | Submit survey | `{ questionnaireId, spotId, surveyData... }` | `{ responseId, status }` |
| `/api/sync` | POST | Bulk sync responses | `{ responses: [] }` | `{ synced, failed, total, results[] }` |

## Component Integration Map

### FS Dashboard Components

```
FSDashboard (page.tsx)
├── SpotAllocation
│   ├── SpotAllocationMap → GET /api/spots
│   ├── SpotCreationModal → POST /api/spots
│   └── SpotAssignmentPanel → PUT /api/spots/:id/assign
├── AssignmentManagement
│   ├── InterviewerAssignmentTable → GET /api/assignments
│   └── BarangayAssignmentModal → POST /api/assignments
└── FieldworkMonitoring
    ├── ProgressMap → GET /api/fs/monitoring
    └── FIPerformanceTable → GET /api/fs/monitoring
```

### FI Dashboard Components

```
FIDashboard (survey/page.tsx)
├── MySpotAssignments → GET /api/fi/assignments
│   └── SpotCard
└── SpotWorkflowScreen
    ├── InterviewSlotCard
    │   ├── VisitStatusModal → POST /api/visits
    │   └── VisitHistoryDisplay → GET /api/questionnaires/:id
    └── Map (Leaflet)
```

### Offline Sync Components

```
Survey App
├── IndexedDB (local storage)
├── SyncButton → POST /api/sync
├── AutoSync → POST /api/sync (on reconnect)
└── SyncStatus (display queue)
```

## Common Integration Patterns

### 1. Fetching Data with Loading State

```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch('/api/endpoint');
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    setData(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### 2. Submitting Data with Toast Notification

```typescript
const { toast } = useToast();

const handleSubmit = async (formData) => {
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed');
    }
    
    toast({
      title: 'Success',
      description: 'Operation completed successfully',
    });
    
    onSuccess();
  } catch (error) {
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    });
  }
};
```

### 3. Offline Data Storage

```typescript
import { createSurveyRecord, updateSurveyRecord } from '@/lib/indexedDB';

// Create record
await createSurveyRecord({
  questionnaireId,
  cycleId,
  spotId,
  status: 'In Progress',
  visits: [],
  surveyData: {},
});

// Update record
await updateSurveyRecord(questionnaireId, cycleId, {
  status: 'Completed (Pending Sync)',
  surveyData: completedData,
});
```

### 4. Syncing Data

```typescript
import { syncPendingRecords } from '@/lib/syncService';

const handleSync = async () => {
  const result = await syncPendingRecords((progress) => {
    console.log(`Syncing ${progress.current}/${progress.total}`);
  });
  
  if (result.success) {
    console.log(`Synced ${result.synced} records`);
  } else {
    console.log(`Failed: ${result.failed} records`);
  }
};
```

## Error Handling Patterns

### API Error Response Format

```typescript
// Success
{
  success: true,
  data: { ... }
}

// Error
{
  error: "Error message",
  details: [
    { field: "fieldName", message: "Validation error" }
  ]
}
```

### Client-Side Error Handling

```typescript
try {
  const response = await fetch('/api/endpoint');
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Unknown error');
  }
  
  // Success handling
} catch (error) {
  // Network error or API error
  console.error('Error:', error);
  
  // Show user feedback
  toast({
    title: 'Error',
    description: error.message,
    variant: 'destructive',
  });
}
```

## State Management Patterns

### Loading States

```typescript
const [loading, setLoading] = useState(false);

// During operation
setLoading(true);

// After completion
setLoading(false);

// In UI
{loading ? <Spinner /> : <Content />}
```

### Error States

```typescript
const [error, setError] = useState(null);

// On error
setError(error.message);

// Clear error
setError(null);

// In UI
{error && <ErrorMessage>{error}</ErrorMessage>}
```

### Data States

```typescript
const [data, setData] = useState([]);

// Update data
setData(newData);

// Append to data
setData([...data, newItem]);

// Update item
setData(data.map(item => 
  item.id === id ? { ...item, ...updates } : item
));
```

## Authentication Patterns

### Protected API Calls

```typescript
// Cookies are automatically sent with fetch
const response = await fetch('/api/protected-endpoint', {
  credentials: 'include', // Include cookies
});
```

### Role-Based Access

```typescript
// Middleware checks role
if (userRole !== 'FS' && userRole !== 'Admin') {
  return NextResponse.json(
    { error: 'Insufficient permissions' },
    { status: 403 }
  );
}
```

## Testing Patterns

### Component Testing

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { MyComponent } from './MyComponent';

test('fetches and displays data', async () => {
  render(<MyComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### API Testing

```typescript
const response = await fetch('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(testData),
});

expect(response.ok).toBe(true);
const data = await response.json();
expect(data.success).toBe(true);
```

## Debugging Tips

### Check API Calls

```typescript
// Add logging
console.log('Request:', { url, method, body });
console.log('Response:', { status, data });
```

### Check IndexedDB

```typescript
// In browser console
const db = await indexedDB.open('pulse-survey-db');
// Inspect stores in DevTools → Application → IndexedDB
```

### Check Service Worker

```typescript
// In browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

### Check Network

```typescript
// In DevTools → Network tab
// Filter by XHR/Fetch
// Check request/response headers and body
```

## Performance Tips

### Optimize Queries

```typescript
// Use select to fetch only needed fields
const spots = await prisma.spot.findMany({
  select: {
    spot_id: true,
    spot_name: true,
    status: true,
  },
});
```

### Implement Pagination

```typescript
const page = parseInt(searchParams.get('page') || '1');
const limit = 50;
const skip = (page - 1) * limit;

const spots = await prisma.spot.findMany({
  skip,
  take: limit,
});
```

### Cache Data

```typescript
// Client-side caching
const [cachedData, setCachedData] = useState(null);

if (cachedData) {
  return cachedData;
}

const data = await fetchData();
setCachedData(data);
```

## Common Issues and Solutions

### Issue: CORS Errors
**Solution**: Ensure API routes are in `/api` directory and use same origin

### Issue: Authentication Fails
**Solution**: Check cookie settings, ensure `credentials: 'include'` in fetch

### Issue: IndexedDB Not Working
**Solution**: Check browser support, ensure HTTPS in production

### Issue: Sync Fails
**Solution**: Check network connection, verify API endpoint, check error logs

### Issue: Map Not Loading
**Solution**: Ensure Leaflet CSS is imported, check dynamic import settings

## Quick Commands

```bash
# Run development server
npm run dev

# Run integration tests
node scripts/test-complete-integration.js

# Verify code integration
node scripts/verify-integration-code.js

# Build for production
npm run build

# Run production server
npm start
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# API
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Auth
JWT_SECRET="your-secret-key"

# Feature Flags
NEXT_PUBLIC_ENABLE_CSIS="true"
```

## Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**Last Updated**: November 16, 2025
**Version**: 1.0.0
