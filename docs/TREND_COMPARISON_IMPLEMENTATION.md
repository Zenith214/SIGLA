# Trend Comparison Implementation

## Overview

Implemented the trend comparison feature that compares the current survey cycle's scores with the immediately previous completed cycle.

## What Was Implemented

### 1. Updated ML Funnel Analysis Route (`src/app/api/ml/funnel-analysis/route.ts`)

**Added Cycle-Aware Trend Calculation**:
- Accepts `cycleId` parameter
- Fetches previous completed cycle from database
- Retrieves previous cycle's survey responses
- Calculates scores from previous cycle
- Compares current vs previous scores
- Returns trend data with change percentage and direction

### 2. New `calculateTrend()` Function

**Features**:
- ✅ Finds the most recent completed cycle before current cycle
- ✅ Fetches survey responses from previous cycle
- ✅ Calculates awareness, availment, and satisfaction scores
- ✅ Compares satisfaction scores (primary metric)
- ✅ Returns change percentage and direction (up/down/stable)
- ✅ Handles edge cases (no previous cycle, no data, errors)

### 3. New `calculateScoresFromResponses()` Helper

**Purpose**: Calculate funnel scores from raw survey response data

**Logic**:
- Counts awareness questions (keys containing 'aware')
- Counts availment questions (keys containing 'avail', 'experience', 'benefited', etc.)
- Counts satisfaction questions (keys containing 'satisf')
- Calculates percentages using same logic as current cycle
- Returns scores object with awareness, availment, satisfaction

## How It Works

### Step-by-Step Flow

1. **User views Report Card** for Barangay in 2026 cycle

2. **System fetches current cycle data**:
   ```
   2026 Cycle - Financial Administration:
   - Awareness: 85%
   - Availment: 80%
   - Satisfaction: 82%
   ```

3. **System finds previous cycle**:
   ```sql
   SELECT * FROM survey_cycle 
   WHERE is_active = false 
   AND cycle_id < 2 
   ORDER BY cycle_id DESC 
   LIMIT 1
   
   Result: 2025 Cycle (cycle_id: 1)
   ```

4. **System fetches previous cycle responses**:
   ```sql
   SELECT * FROM survey_response 
   WHERE barangay_id = 17 
   AND survey_cycle_id = 1 
   AND section_key = 'financial'
   ```

5. **System calculates previous scores**:
   ```
   2025 Cycle - Financial Administration:
   - Awareness: 70%
   - Availment: 65%
   - Satisfaction: 75%
   ```

6. **System calculates trend**:
   ```
   Change = 82% - 75% = +7%
   Direction = 'up' (positive change)
   ```

7. **System returns trend data**:
   ```json
   {
     "change": 7,
     "direction": "up",
     "available": true,
     "previousScore": 75,
     "currentScore": 82,
     "previousCycle": "2025 Q1",
     "previousCycleYear": 2025
   }
   ```

8. **UI displays trend**:
   ```
   Financial Administration
   Satisfaction: 82% ↑ +7% vs 2025 Q1
   ```

## Edge Cases Handled

### Case 1: No Previous Cycle (Baseline)
```json
{
  "change": 0,
  "direction": "baseline",
  "available": false,
  "message": "No historical data available for comparison"
}
```

### Case 2: Previous Cycle Has No Data
```json
{
  "change": 0,
  "direction": "baseline",
  "available": false,
  "message": "No data from previous cycle (2025 Q1)"
}
```

### Case 3: Score Decreased
```json
{
  "change": -5,
  "direction": "down",
  "available": true,
  "previousScore": 80,
  "currentScore": 75
}
```

### Case 4: Score Unchanged
```json
{
  "change": 0,
  "direction": "stable",
  "available": true,
  "previousScore": 80,
  "currentScore": 80
}
```

## Testing Instructions

### 1. Prepare Baseline Data (2025 Cycle)

```bash
# You should already have this
- Barangay 17: 150 responses (high-performer profile)
- Barangay 18: 150 responses (high-performer profile)
- Cycle: 2025 Q1 (Active)
```

### 2. Complete 2025 Cycle

```
1. Go to Settings → Survey Cycles
2. Find "2025 Q1" (Active)
3. Click "Complete" button
4. Confirm completion
5. Verify: Shows "Inactive" badge
```

### 3. Create 2026 Cycle

```
1. Settings → Survey Cycles
2. Click "Create New Survey Cycle"
3. Name: "2026 Q1"
4. Year: 2026
5. Start Date: Jan 1, 2026
6. End Date: Mar 31, 2026
7. Click "Create"
```

### 4. Set 2026 as Active

```
1. Find "2026 Q1" in list
2. Click Power icon (⚡)
3. Confirm activation
4. Verify: Shows "Active" badge
```

### 5. Generate Data for 2026

```
1. Go to Tools → Generate Mock Survey Data
2. Select Barangay 17
3. Profile: "mixed" (to see different scores)
4. Response Count: 150
5. Click "Generate"
6. Repeat for Barangay 18
```

### 6. View Trends

```
1. Go to Report Card
2. Select Barangay 17
3. Click on any service area (e.g., Financial Administration)
4. Look for trend indicator:
   - Should show: "↑ +X% vs 2025 Q1" or "↓ -X% vs 2025 Q1"
   - No longer shows "baseline"
```

## Expected Results

### If 2026 Scores Are Higher (Mixed Profile vs High-Performer)

```
Financial Administration - 2026 Q1
┌─────────────────────────────────────┐
│ Satisfaction: 75%  ↓ -7% vs 2025 Q1│
│ (Previous: 82%)                     │
└─────────────────────────────────────┘
```

### If 2026 Scores Are Lower

```
Financial Administration - 2026 Q1
┌─────────────────────────────────────┐
│ Satisfaction: 88%  ↑ +6% vs 2025 Q1│
│ (Previous: 82%)                     │
└─────────────────────────────────────┘
```

## Database Queries Used

### Find Previous Cycle
```sql
SELECT cycle_id, name, year 
FROM survey_cycle 
WHERE is_active = false 
  AND cycle_id < $currentCycleId 
ORDER BY cycle_id DESC 
LIMIT 1
```

### Get Previous Cycle Responses
```sql
SELECT 
  sr.response_id,
  ss.section_key,
  ss.data
FROM survey_response sr
JOIN survey_section ss ON sr.response_id = ss.response_id
WHERE sr.barangay_id = $barangayId
  AND sr.survey_cycle_id = $previousCycleId
  AND ss.section_key = $serviceArea
  AND sr.status IN ('completed', 'submitted')
```

## Performance Considerations

### Current Implementation
- ✅ Calculates scores on-demand from raw responses
- ⚠️ Requires parsing JSON data for each comparison
- ⚠️ Slower for large datasets

### Future Optimization (Recommended)
Create a `service_scores` table to cache calculated scores:

```sql
CREATE TABLE service_scores (
  score_id SERIAL PRIMARY KEY,
  barangay_id INTEGER REFERENCES barangay(barangay_id),
  cycle_id INTEGER REFERENCES survey_cycle(cycle_id),
  service_area TEXT NOT NULL,
  awareness_score INTEGER,
  availment_score INTEGER,
  satisfaction_score INTEGER,
  need_action_score INTEGER,
  calculated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(barangay_id, cycle_id, service_area)
);
```

**Benefits**:
- ✅ Instant trend lookups (no recalculation)
- ✅ Historical data preserved even if responses deleted
- ✅ Can track score changes over multiple cycles
- ✅ Enables advanced analytics and visualizations

## Limitations

### Current Implementation
- Only compares with immediately previous cycle
- Only tracks satisfaction score changes
- Doesn't show multi-cycle trends (e.g., 2024 → 2025 → 2026)
- Doesn't track awareness/availment trends separately

### Future Enhancements
1. **Multi-Cycle Trends**: Show trend across all cycles
2. **All Metrics**: Track trends for awareness, availment, satisfaction
3. **Trend Charts**: Visualize score changes over time
4. **Predictive Analytics**: Forecast future scores based on trends
5. **Alerts**: Notify when scores decline for 2+ consecutive cycles

## Files Modified

1. **src/app/api/ml/funnel-analysis/route.ts**
   - Added `cycleId` parameter handling
   - Made `transformMLToFunnelFormat()` async
   - Rewrote `calculateTrend()` to fetch and compare previous cycle
   - Added `calculateScoresFromResponses()` helper function
   - Changed forEach to for...of loop for async operations

## Summary

The trend comparison feature is now **fully implemented**! 

Once you:
1. ✅ Complete your current 2025 cycle
2. ✅ Create a new 2026 cycle
3. ✅ Generate data for 2026
4. ✅ View the Report Card

You will see **actual trend comparisons** like:
- "↑ +7% vs 2025 Q1" (improvement)
- "↓ -5% vs 2025 Q1" (decline)
- "→ 0% vs 2025 Q1" (stable)

No more "baseline" for cycles with historical data! 🎉
