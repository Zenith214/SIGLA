# Design Document

## Overview

This design document outlines the technical approach for making the BarangayDetailsCard component cycle-aware, enabling users to view historical satisfaction data for barangays across different survey cycles. The solution leverages the existing HistoricalCycleSelector in MapCard and extends the data flow to fetch and display cycle-specific satisfaction metrics.

## Architecture

### Component Hierarchy

```
MapView
├── MapCard
│   ├── HistoricalCycleSelector (existing)
│   └── InteractiveSVGMap (existing, already cycle-aware)
├── BarangayDetailsCard (to be enhanced)
└── SGLGBHistoryCard (existing)
```

### Data Flow

```
User selects cycle in HistoricalCycleSelector
    ↓
MapCard updates selectedCycleId state
    ↓
selectedCycleId passed to MapView
    ↓
MapView passes selectedCycleId to BarangayDetailsCard
    ↓
BarangayDetailsCard fetches satisfaction data for (barangayId, cycleId)
    ↓
Display updated satisfaction metrics
```

## Components and Interfaces

### 1. MapView Component (Modified)

**Purpose:** Manage cycle state and pass it to child components

**Changes:**
- Add `selectedCycleId` state (lifted from MapCard)
- Pass `selectedCycleId` to both MapCard and BarangayDetailsCard
- Handle cycle change events from MapCard

**Interface:**
```typescript
// MapView.tsx
const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);

const handleCycleChange = (cycleId: number | null) => {
  setSelectedCycleId(cycleId);
};
```

### 2. MapCard Component (Modified)

**Purpose:** Render map and cycle selector, emit cycle changes to parent

**Changes:**
- Remove local `selectedCycleId` state (lift to MapView)
- Accept `selectedCycleId` and `onCycleChange` as props
- Pass cycle change events to parent

**Interface:**
```typescript
interface MapCardProps {
  onBarangaySelect?: (barangay: ApiBarangayData) => void;
  selectedCycleId: number | null;
  onCycleChange: (cycleId: number | null) => void;
}
```

### 3. BarangayDetailsCard Component (Enhanced)

**Purpose:** Display barangay information and cycle-specific satisfaction data

**New Props:**
```typescript
interface BarangayDetailsCardProps {
  selectedBarangay?: ApiBarangayData | null;
  selectedCycleId: number | null;  // NEW
}
```

**State Management:**
```typescript
const [satisfactionData, setSatisfactionData] = useState<SatisfactionData | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Data Fetching:**
- Use `useEffect` to fetch satisfaction data when `selectedBarangay` or `selectedCycleId` changes
- Implement caching using a Map or React Query
- Handle loading and error states

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ Barangay Name Details               │
│ Survey Cycle 2025 (2025) [Badge]   │ ← Cycle indicator
├─────────────────────────────────────┤
│ Overall Satisfaction: 72% [●●●●○]   │ ← Visual indicator
├─────────────────────────────────────┤
│ Population: 1,234  | Households: 456│
│ Area: 2.5 km²      | Status: ✓      │
├─────────────────────────────────────┤
│ Service Areas:                      │
│ Financial:      68% [●●●○○]         │
│ Disaster:       75% [●●●●○]         │
│ Safety:         51% [●●○○○]         │
│ Social:         70% [●●●●○]         │
│ Business:       43% [●●○○○]         │
│ Environmental:  58% [●●●○○]         │
└─────────────────────────────────────┘
```

### 4. New API Endpoint (Optional)

**Purpose:** Fetch satisfaction summary for a specific barangay and cycle

**Endpoint:** `GET /api/barangay-satisfaction?barangayId={id}&cycleId={id}`

**Response:**
```typescript
interface BarangaySatisfactionResponse {
  barangayId: number;
  cycleId: number;
  cycleName: string;
  cycleYear: number;
  overallSatisfaction: number;
  surveyStatus: 'completed' | 'in_progress' | 'not_started';
  serviceScores: {
    financial: number;
    disaster: number;
    safety: number;
    social: number;
    business: number;
    environmental: number;
  };
  responseCount: number;
}
```

**Alternative:** Reuse existing `/api/survey-analytics` endpoint with cycle parameter

## Data Models

### SatisfactionData Interface

```typescript
interface SatisfactionData {
  barangayId: number;
  cycleId: number;
  cycleName: string;
  cycleYear: number;
  overallSatisfaction: number | null;
  surveyStatus: 'completed' | 'in_progress' | 'not_started';
  serviceScores: ServiceScores;
  responseCount: number;
  hasData: boolean;
}

interface ServiceScores {
  financial: number | null;
  disaster: number | null;
  safety: number | null;
  social: number | null;
  business: number | null;
  environmental: number | null;
}
```

### Cache Structure

```typescript
// Simple in-memory cache
const satisfactionCache = new Map<string, CachedData>();

interface CachedData {
  data: SatisfactionData;
  timestamp: number;
  expiresAt: number;
}

// Cache key format: `${barangayId}-${cycleId}`
```

## Error Handling

### Error Scenarios

1. **No Data Available**
   - Display: "No satisfaction data available for this cycle"
   - Show static barangay info only

2. **Network Error**
   - Display: "Failed to load satisfaction data. [Retry]"
   - Provide retry button
   - Show cached data if available

3. **Invalid Cycle**
   - Fallback to active cycle
   - Log warning

4. **API Timeout**
   - Display: "Loading is taking longer than expected..."
   - Show loading spinner for up to 10 seconds
   - Then show error with retry option

### Error State UI

```typescript
{error && (
  <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
    <p className="text-red-800 mb-2">{error}</p>
    <button 
      onClick={retryFetch}
      className="text-red-600 underline hover:text-red-800"
    >
      Retry
    </button>
  </div>
)}
```

## Testing Strategy

### Unit Tests

1. **BarangayDetailsCard Component**
   - Renders correctly with satisfaction data
   - Shows loading state while fetching
   - Displays error state on fetch failure
   - Shows "no data" message when appropriate
   - Updates when cycle changes
   - Updates when barangay changes

2. **Data Fetching Logic**
   - Fetches data with correct parameters
   - Caches data appropriately
   - Returns cached data when available
   - Handles cache expiration

3. **Cache Management**
   - Stores data correctly
   - Retrieves data by key
   - Expires old data
   - Limits cache size

### Integration Tests

1. **Cycle Selection Flow**
   - User selects cycle → BarangayDetailsCard updates
   - User selects barangay → Shows data for selected cycle
   - User changes cycle → Data updates for same barangay

2. **API Integration**
   - Fetches satisfaction data from correct endpoint
   - Handles API errors gracefully
   - Respects cache TTL

### Manual Testing Checklist

- [ ] Select different cycles and verify data updates
- [ ] Select different barangays and verify correct data
- [ ] Test with barangay that has no data for selected cycle
- [ ] Test network error handling (disconnect network)
- [ ] Test loading states (throttle network)
- [ ] Verify cache works (select cycle, change barangay, return to first cycle)
- [ ] Test on mobile viewport
- [ ] Verify accessibility (keyboard navigation, screen readers)

## Performance Considerations

### Caching Strategy

**Cache TTL:** 5 minutes (300 seconds)
- Satisfaction data doesn't change frequently
- Balance between freshness and performance

**Cache Size Limit:** 50 entries
- Prevents excessive memory usage
- LRU eviction when limit reached

**Cache Key:** `${barangayId}-${cycleId}`

### Optimization Techniques

1. **Debounce Cycle Changes**
   - Wait 100ms after cycle selection before fetching
   - Prevents rapid API calls if user scrolls through cycles

2. **Lazy Loading**
   - Only fetch satisfaction data when barangay is selected
   - Don't pre-fetch for all barangays

3. **Parallel Requests**
   - If needed, fetch static barangay info and satisfaction data in parallel
   - Currently not needed as static info is already available

4. **Memoization**
   - Memoize service score rendering components
   - Prevent unnecessary re-renders

## Visual Design

### Color Coding for Satisfaction Scores

- **Green (≥70%):** Good performance - `bg-green-100 text-green-800`
- **Yellow (50-69%):** Needs improvement - `bg-yellow-100 text-yellow-800`
- **Red (<50%):** Critical - `bg-red-100 text-red-800`
- **Gray (No data):** N/A - `bg-gray-100 text-gray-600`

### Visual Indicators

**Satisfaction Bar:**
```typescript
<div className="w-full bg-gray-200 rounded-full h-2">
  <div 
    className={`h-2 rounded-full ${getColorClass(score)}`}
    style={{ width: `${score}%` }}
  />
</div>
```

**Cycle Badge:**
```typescript
{isHistorical && (
  <Badge variant="outline" className="ml-2">
    Historical
  </Badge>
)}
```

## Implementation Phases

### Phase 1: State Management (Core)
- Lift `selectedCycleId` state to MapView
- Pass cycle ID to BarangayDetailsCard
- Update MapCard to use props instead of local state

### Phase 2: Data Fetching
- Create API endpoint or extend existing one
- Implement fetch logic in BarangayDetailsCard
- Add loading and error states

### Phase 3: UI Enhancement
- Design and implement satisfaction display
- Add service area breakdown
- Implement color coding and visual indicators

### Phase 4: Caching & Optimization
- Implement in-memory cache
- Add cache expiration logic
- Optimize re-renders

### Phase 5: Polish & Testing
- Add error handling
- Implement retry logic
- Write tests
- Handle edge cases

## Dependencies

### Existing Code to Leverage

1. **HistoricalCycleSelector** - Already implemented cycle dropdown
2. **InteractiveSVGMap** - Already accepts `selectedCycleId` prop
3. **useActiveCycle hook** - For getting active cycle info
4. **ML Funnel Analysis API** - Can be used to fetch satisfaction data

### New Dependencies

- None required (using existing libraries)

### API Dependencies

- `/api/survey-analytics` or `/api/ml/funnel-analysis` - For satisfaction data
- Ensure these APIs support cycle filtering (already implemented in recent fixes)

## Migration Strategy

### Backward Compatibility

- Existing functionality remains unchanged
- If `selectedCycleId` is null, use active cycle (current behavior)
- Static barangay info always displayed regardless of cycle

### Rollout Plan

1. Deploy backend changes (if any API modifications needed)
2. Deploy frontend changes
3. Monitor for errors in production
4. Gather user feedback
5. Iterate on UI/UX based on feedback

## Security Considerations

### Data Access

- Respect existing role-based access controls
- Viewers can see historical data (read-only)
- No new permissions required

### API Security

- Validate cycle ID parameter
- Ensure user has access to requested barangay data
- Rate limit API requests to prevent abuse

## Accessibility

### WCAG Compliance

- Color coding supplemented with text labels
- Keyboard navigation support
- Screen reader friendly labels
- Sufficient color contrast ratios

### Implementation

```typescript
<div 
  role="region" 
  aria-label={`Satisfaction data for ${barangay.name} in ${cycleName}`}
>
  {/* Content */}
</div>
```

## Future Enhancements

### Potential Additions (Out of Scope)

1. **Trend Visualization**
   - Show satisfaction trend graph across multiple cycles
   - Compare current vs previous cycle

2. **Export Functionality**
   - Export satisfaction data as PDF/CSV
   - Include historical comparison

3. **Notifications**
   - Alert when satisfaction drops significantly
   - Highlight improvements

4. **Drill-Down**
   - Click service area to see detailed breakdown
   - View specific survey responses

These enhancements can be considered for future iterations based on user feedback and priorities.
