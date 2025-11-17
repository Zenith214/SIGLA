# Cycle-Awareness Quick Reference

## Overview
This document provides a quick reference for working with cycle-scoped data in the PULSE CSIS workflow system.

## Key Concepts

### What is Cycle-Awareness?
All survey data (spots, questionnaires, visits, responses) is associated with a specific survey cycle. This allows:
- Multiple survey periods to coexist
- Historical data analysis by cycle
- Clean data separation between time periods
- Safe deletion of old cycles

### Active Cycle
- Only ONE cycle can be active at a time
- The active cycle is displayed prominently in all dashboards
- Most operations default to the active cycle
- FIs see only their assignments for the active cycle

## API Endpoints

### Cycle Management

#### List All Cycles
```typescript
GET /api/survey-cycles
Response: { success: true, data: SurveyCycle[] }
```

#### Create Cycle
```typescript
POST /api/survey-cycles
Body: { name: string, year: number, start_date?: string, end_date?: string }
Response: { success: true, data: SurveyCycle }
```

#### Update Cycle
```typescript
PUT /api/survey-cycles
Body: { cycle_id: number, name?: string, year?: number, is_active?: boolean }
Response: { success: true, data: SurveyCycle }
```

#### Delete Cycle (Protected)
```typescript
DELETE /api/survey-cycles
Body: { cycle_id: number, force?: boolean }

// Success (no data)
Response: { success: true, message: "Cycle deleted" }

// Failure (has data)
Response: { 
  error: "Cannot delete survey cycle",
  message: "It has 5 spots, 25 responses...",
  data: { spotsCount: 5, responsesCount: 25, assignmentsCount: 3 }
}
Status: 409 Conflict
```

### Spot Operations (Cycle-Scoped)

#### Get Spots
```typescript
GET /api/spots?cycleId={id}&barangayId={id}&assignedFiId={id}
// cycleId is strongly recommended for performance
Response: { spots: Spot[] }
```

#### Create Spot
```typescript
POST /api/spots
Body: {
  cycleId: number,        // Required - must be valid cycle
  barangayId: number,
  spotName: string,
  startingPoint: { lat: number, lng: number },
  randomStart: number     // 1-999
}
Response: { 
  spotId: number, 
  questionnaires: string[] // 5 auto-generated IDs
}
```

#### Assign Spot
```typescript
PUT /api/spots/:spotId/assign
Body: { fiId: number }
Response: { success: true, assignedTo: string }
```

#### Delete Spot
```typescript
DELETE /api/spots/:spotId
// Only unassigned spots can be deleted
// Cascade deletes questionnaires and visits
Response: { success: true }
```

### FI Operations (Cycle-Scoped)

#### Get FI Assignments
```typescript
GET /api/fi/assignments?cycleId={id}
// Defaults to active cycle if cycleId not provided
Response: { 
  cycleId: number,
  assignments: SpotAssignment[] 
}
```

#### Get Questionnaire Details
```typescript
GET /api/questionnaires/:questionnaireId
Response: {
  questionnaireId: string,
  spotId: number,
  status: string,
  visitCount: number,
  visits: Visit[]
}
```

#### Log Visit
```typescript
POST /api/visits
Body: {
  questionnaireId: string,
  outcome: "Callback_Needed" | "Refused" | "Household_Moved",
  notes?: string,
  location?: { lat: number, lng: number }
}
Response: { 
  visitId: number, 
  visitNumber: number,
  questionnaireStatus: string 
}
```

### FS Operations (Cycle-Scoped)

#### Get Monitoring Data
```typescript
GET /api/fs/monitoring?cycleId={id}
// cycleId is required
Response: {
  cycleId: number,
  cycleName: string,
  spots: SpotData[],
  fieldInterviewers: FIPerformance[],
  summary: {
    totalSpots: number,
    assignedSpots: number,
    completedSpots: number,
    totalInterviews: number,
    completedInterviews: number
  }
}
```

## UI Components

### Displaying Active Cycle

```typescript
import { useActiveCycle } from "@/hooks/useSurveyCycle";

function MyComponent() {
  const { activeCycle, hasActiveCycle, loading } = useActiveCycle();
  
  if (loading) return <div>Loading...</div>;
  if (!hasActiveCycle) return <div>No active cycle</div>;
  
  return (
    <div>
      <h1>{activeCycle.name}</h1>
      <p>Year: {activeCycle.year}</p>
    </div>
  );
}
```

### Using CycleDisplay Component

```typescript
import { CycleDisplay } from "@/components/survey-cycle";

function Header() {
  return (
    <header>
      <CycleDisplay className="text-white" />
    </header>
  );
}
```

### Filtering Data by Cycle

```typescript
// In your component
const [spots, setSpots] = useState([]);
const { activeCycle } = useActiveCycle();

useEffect(() => {
  if (activeCycle?.cycle_id) {
    fetch(`/api/spots?cycleId=${activeCycle.cycle_id}`)
      .then(res => res.json())
      .then(data => setSpots(data.spots));
  }
}, [activeCycle?.cycle_id]);
```

## Database Queries

### Filtering by Cycle (Supabase)

```typescript
// Get spots for a specific cycle
const { data: spots } = await supabase
  .from('spots')
  .select('*')
  .eq('cycle_id', cycleId);

// Get active cycle
const { data: activeCycle } = await supabase
  .from('survey_cycle')
  .select('*')
  .eq('is_active', true)
  .single();

// Get survey responses for a cycle
const { data: responses } = await supabase
  .from('survey_response')
  .select('*')
  .eq('survey_cycle_id', cycleId);
```

### Checking for Associated Data

```typescript
// Check if cycle has spots
const { count: spotCount } = await supabase
  .from('spots')
  .select('spot_id', { count: 'exact', head: true })
  .eq('cycle_id', cycleId);

// Check if cycle has responses
const { count: responseCount } = await supabase
  .from('survey_response')
  .select('response_id', { count: 'exact', head: true })
  .eq('survey_cycle_id', cycleId);
```

## Helper Functions

### Get Active Cycle

```typescript
import { getActiveCycle } from '@/utils/surveyCycleHelpers';

const activeCycle = await getActiveCycle();
if (activeCycle) {
  console.log(`Active cycle: ${activeCycle.name}`);
}
```

### Set Active Cycle

```typescript
import { setActiveCycle } from '@/utils/surveyCycleHelpers';

await setActiveCycle(cycleId);
```

### Delete Cycle (with protection)

```typescript
import { deleteSurveyCycle } from '@/utils/surveyCycleHelpers';

// Try to delete (will fail if has data)
const result = await deleteSurveyCycle(cycleId, false);

if (!result.success) {
  console.log(result.message);
  console.log('Associated data:', result.deletedData);
}

// Force delete (admin only)
const forceResult = await deleteSurveyCycle(cycleId, true);
```

## Common Patterns

### Pattern 1: Load Data for Active Cycle

```typescript
const { activeCycle } = useActiveCycle();
const [data, setData] = useState([]);

useEffect(() => {
  if (activeCycle?.cycle_id) {
    loadData(activeCycle.cycle_id);
  }
}, [activeCycle?.cycle_id]);

async function loadData(cycleId: number) {
  const response = await fetch(`/api/spots?cycleId=${cycleId}`);
  const result = await response.json();
  setData(result.spots);
}
```

### Pattern 2: Create Cycle-Scoped Record

```typescript
async function createSpot(data: SpotData) {
  const { activeCycle } = useActiveCycle();
  
  if (!activeCycle) {
    throw new Error('No active cycle');
  }
  
  const response = await fetch('/api/spots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      cycleId: activeCycle.cycle_id
    })
  });
  
  return response.json();
}
```

### Pattern 3: Handle Cycle Deletion

```typescript
async function handleDeleteCycle(cycleId: number) {
  try {
    const response = await fetch('/api/survey-cycles', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cycle_id: cycleId })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 409) {
        // Has associated data
        const { spotsCount, responsesCount } = data.data;
        alert(`Cannot delete: ${spotsCount} spots, ${responsesCount} responses`);
      } else {
        throw new Error(data.message);
      }
      return;
    }
    
    // Success
    alert('Cycle deleted successfully');
    
  } catch (error) {
    console.error('Delete failed:', error);
  }
}
```

## Best Practices

### 1. Always Validate Cycle ID
```typescript
// ✅ Good
if (cycleId) {
  const cycle = await getCycleById(cycleId);
  if (!cycle) {
    return { error: 'Cycle not found' };
  }
}

// ❌ Bad
// Assuming cycleId is valid without checking
```

### 2. Use Active Cycle as Default
```typescript
// ✅ Good
const cycleId = params.cycleId || (await getActiveCycleId());

// ❌ Bad
// Requiring cycleId when active cycle could be used
```

### 3. Show Cycle Information in UI
```typescript
// ✅ Good
<div>
  <CycleDisplay />
  <SpotList cycleId={activeCycle.cycle_id} />
</div>

// ❌ Bad
// Not showing which cycle the data belongs to
```

### 4. Handle Missing Active Cycle
```typescript
// ✅ Good
if (!hasActiveCycle) {
  return <div>No active cycle. Please contact admin.</div>;
}

// ❌ Bad
// Assuming there's always an active cycle
```

### 5. Protect Against Accidental Deletion
```typescript
// ✅ Good
const result = await deleteSurveyCycle(cycleId, false);
if (!result.success) {
  showWarning(result.message);
  return;
}

// ❌ Bad
// Force deleting without checking
await deleteSurveyCycle(cycleId, true);
```

## Troubleshooting

### Issue: "No active cycle found"
**Solution**: Set a cycle as active in the admin panel

### Issue: "Cycle not found" error
**Solution**: Verify the cycle_id exists in the database

### Issue: "Cannot delete survey cycle"
**Solution**: Delete associated data first, or use force delete (admin only)

### Issue: Spots not showing up
**Solution**: Ensure you're filtering by the correct cycle_id

### Issue: FI sees no assignments
**Solution**: Check if spots are assigned to the FI for the active cycle

## Related Documentation

- [CSIS Workflow Migration](../database/README-CSIS-WORKFLOW-MIGRATION.md)
- [Survey Cycle Helpers](../src/utils/surveyCycleHelpers.ts)
- [Task 19 Completion Summary](./TASK_19_COMPLETION_SUMMARY.md)

---

**Last Updated**: 2024
**Version**: 1.0
