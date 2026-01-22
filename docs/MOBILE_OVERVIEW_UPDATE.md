# Mobile Overview Update - Barangay Details

## Summary
Updated the mobile version of the barangay overview to match the desktop version by replacing the hardcoded Action Grid with real data: Survey Progress, Overall Satisfaction, and Overall Need for Action (NFA).

**Date:** January 22, 2026

---

## Issue

The mobile version of the dashboard (BarangayListView) was showing a hardcoded Action Grid when selecting a barangay, while the desktop version showed:
- Survey Progress (with progress bar)
- Overall Satisfaction percentage
- Overall Need for Action (NFA) percentage

This inconsistency meant mobile users weren't seeing the actual data for their barangay.

---

## Solution

Updated `src/components/dashboard/BarangayListView.tsx` to:

1. **Fetch Real Data** - Added API call to `/api/ml/funnel-analysis` to get actual barangay metrics
2. **Display Survey Progress** - Shows completion percentage with color-coded progress bar
3. **Display Overall Satisfaction** - Shows actual satisfaction score with color coding
4. **Display Overall NFA** - Shows need for action percentage with appropriate colors
5. **Added Loading State** - Shows spinner while fetching data

---

## Changes Made

### Before (Hardcoded)
```tsx
// Mock satisfaction percentage
const satisfactionPercentage = 65; // Example value

// Hardcoded Action Grid with static service areas
<div className="border border-gray-200 rounded-xl p-4">
  <h2>Action Grid</h2>
  <div className="grid grid-cols-2 gap-3">
    <div>MAINTAIN - Safety, Peace & Order</div>
    <div>OPPORTUNITIES - Disaster Preparedness</div>
    <div>MONITOR - Environmental Management</div>
    <div>FIX NOW - Finance Administration</div>
  </div>
</div>
```

### After (Real Data)
```tsx
// Fetch real funnel data
const [funnelData, setFunnelData] = useState<any>(null);
const [loadingFunnel, setLoadingFunnel] = useState(true);

useEffect(() => {
  const fetchFunnelData = async () => {
    const response = await fetch(`/api/ml/funnel-analysis?barangayId=${selectedBarangay.id}&cycleId=${cycleId}`);
    const data = await response.json();
    setFunnelData(data);
  };
  fetchFunnelData();
}, [selectedBarangay, selectedCycleId]);

// Use real data
const satisfactionPercentage = funnelData?.overall_satisfaction || 0;
const needForActionPercentage = funnelData?.overall_need_action || 0;
const surveyProgress = selectedBarangay.progress || 0;

// Display real metrics
<div className="space-y-4">
  {/* Survey Progress */}
  <div className="border rounded-xl p-4">
    <span>Survey Progress: {surveyProgress}%</span>
    <div className="progress-bar" style={{ width: `${surveyProgress}%` }} />
  </div>

  {/* Overall Satisfaction & NFA */}
  <div className="grid grid-cols-2 gap-4">
    <div>Overall Satisfaction: {satisfactionPercentage}%</div>
    <div>Overall NFA: {needForActionPercentage}%</div>
  </div>
</div>
```

---

## New Mobile UI Components

### 1. Survey Progress Card
```
┌─────────────────────────────────┐
│ Survey Progress        85%      │
│ ████████████████░░░░░░░░░░░░░  │
│ 15% remaining                   │
└─────────────────────────────────┘
```

**Features:**
- Shows completion percentage
- Color-coded progress bar:
  - Green: 100% (completed)
  - Blue: 50%+ (in progress)
  - Gray: <50% (just started)
- Text indicator of remaining percentage

### 2. Overall Satisfaction Card
```
┌──────────────────┐
│       📊         │
│ Overall          │
│ Satisfaction     │
│                  │
│      85%         │
│                  │
│ Above cutoff     │
└──────────────────┘
```

**Features:**
- Large percentage display
- Color-coded:
  - Green: ≥58% (above cutoff)
  - Red: <58% (below cutoff)
- Status text indicator

### 3. Overall NFA Card
```
┌──────────────────┐
│       🎯         │
│ Overall NFA      │
│                  │
│      25%         │
│                  │
│ Low priority     │
└──────────────────┘
```

**Features:**
- Large percentage display
- Color-coded:
  - Orange: >30% (action needed)
  - Green: ≤30% (low priority)
- Status text indicator

---

## Data Flow

```
User selects barangay in mobile list
  ↓
BarangayListView component
  ↓
useEffect triggers on barangay selection
  ↓
Fetch /api/ml/funnel-analysis
  ↓
Extract metrics:
  - overall_satisfaction
  - overall_need_action
  - progress (from barangay data)
  ↓
Display in cards with color coding
```

---

## Color Coding Logic

### Survey Progress
- **Green** (`bg-green-500`): `progress === 100`
- **Blue** (`bg-blue-500`): `progress >= 50`
- **Gray** (`bg-gray-400`): `progress < 50`

### Overall Satisfaction
- **Green** (`text-green-600`): `satisfaction >= 58`
- **Red** (`text-red-600`): `satisfaction < 58`

### Overall NFA
- **Orange** (`text-orange-600`): `needForAction > 30`
- **Green** (`text-green-600`): `needForAction <= 30`

---

## Loading State

While fetching data, shows:
```
┌─────────────────────────────────┐
│                                 │
│         ⟳ (spinning)            │
│                                 │
│  Loading barangay data...       │
│                                 │
└─────────────────────────────────┘
```

---

## Updated "How to Read This Report" Section

Now includes explanations for all three metrics:

1. **Survey Progress**
   - Explains completion percentage
   - Color coding meaning

2. **Overall Satisfaction**
   - Explains 58% cutoff
   - Formula: `50% + (0.98 / √n)`
   - For n=150: `50% + 8% = 58%`

3. **Overall Need for Action (NFA)**
   - Explains action priority
   - 30% threshold meaning

---

## API Integration

### Endpoint Used
```
GET /api/ml/funnel-analysis?barangayId={id}&cycleId={cycleId}
```

### Response Structure
```json
{
  "overall_satisfaction": 85,
  "overall_need_action": 25,
  "service_scores": { ... },
  "action_grid": { ... }
}
```

### Error Handling
- Shows loading spinner during fetch
- Falls back to 0% if data unavailable
- Logs errors to console
- Continues to show UI with default values

---

## Responsive Design

### Mobile Layout (< 768px)
```
┌─────────────────────────────────┐
│ ← Back to List                  │
│ Barangay Name [Awardee]         │
├─────────────────────────────────┤
│                                 │
│ [Survey Progress Card]          │
│                                 │
│ ┌──────────┐  ┌──────────┐    │
│ │Satisfaction│ │   NFA    │    │
│ └──────────┘  └──────────┘    │
│                                 │
│ [BLGU Logo]  [MLGRC Logo]      │
│                                 │
│ [View Score Card Button]        │
│                                 │
│ [How to Read This Report]       │
│                                 │
└─────────────────────────────────┘
```

### Desktop Layout (≥ 768px)
Uses `BarangayDetailsCard` component instead, which already has the correct layout.

---

## Testing Checklist

- [x] Mobile view shows Survey Progress
- [x] Mobile view shows Overall Satisfaction
- [x] Mobile view shows Overall NFA
- [x] Loading state displays correctly
- [x] Color coding works for all metrics
- [x] Data fetches from correct API
- [x] Error handling works
- [x] "How to Read" section updated
- [x] No TypeScript errors
- [x] Responsive on various mobile sizes

---

## Comparison: Desktop vs Mobile

### Desktop (BarangayDetailsCard)
- Shows in right sidebar
- Larger cards with more spacing
- Includes additional details
- Always visible when barangay selected

### Mobile (BarangayListView)
- Full-screen view
- Compact card layout
- Essential metrics only
- Includes back button to list

**Both now show the same data:**
- ✅ Survey Progress
- ✅ Overall Satisfaction
- ✅ Overall NFA

---

## Benefits

1. **Consistency** - Mobile and desktop show same metrics
2. **Real Data** - No more hardcoded values
3. **Better UX** - Users see actual barangay performance
4. **Informed Decisions** - Officers can make decisions based on real data
5. **Professional** - Matches desktop experience

---

## Future Enhancements

1. **Service Area Breakdown**
   - Show individual service scores
   - Expandable sections for details

2. **Trend Indicators**
   - Show if metrics improving/declining
   - Compare with previous cycle

3. **Quick Actions**
   - Direct links to problem areas
   - Action recommendations

4. **Offline Support**
   - Cache funnel data
   - Show last known values when offline

---

## Related Files

- `src/components/dashboard/BarangayListView.tsx` - Mobile view component
- `src/components/dashboard/BarangayDetailsCard.tsx` - Desktop view component
- `src/app/api/ml/funnel-analysis/route.ts` - Data source API
- `docs/DETAILED_ANALYTICS_CONDITIONAL_INSIGHTS_UPDATE.md` - Related update

---

**Document Version:** 1.0  
**Last Updated:** January 22, 2026  
**Status:** ✅ Complete
