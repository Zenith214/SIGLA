# Debugging Trends Comparison Issue

## Problem
Trends comparison showing "↓ -80% vs Survey Cycle 2025" for all service areas, even after clearing cache.

## Root Cause Analysis

### Where Trends Come From
1. **Report Card Page** (`src/app/reportcard/page.tsx`)
   - Fetches data from `/api/ml/funnel-analysis?barangayId=X&cycleId=Y`
   - Processes trends from `funnelData.action_grid[serviceKey].trend`
   - Validates trends (rejects if > ±100%)
   - Displays: `{trend.change}% vs {trend.previousCycle}`

2. **ML Funnel Analysis API** (`src/app/api/ml/funnel-analysis/route.ts`)
   - Uses `getCachedOrCompute()` with 12-hour TTL
   - Calls `calculateTrend()` for each service area
   - Returns trend object with: `{ change, direction, previousCycle, previousScore, currentScore }`

3. **Calculate Trend Function**
   - Queries database for previous cycle:
     ```sql
     SELECT * FROM survey_cycle
     WHERE is_active = false
     AND cycle_id < currentCycleId
     ORDER BY cycle_id DESC
     LIMIT 1
     ```
   - Fetches previous cycle responses for the barangay/service
   - Calculates previous scores using `calculateScoresFromResponses()`
   - Compares: `change = currentSatisfaction - previousSatisfaction`

## Why Clearing Cache Doesn't Fix It

When you click "Clear All Cache" in Tools:
1. ✅ Server ML cache is cleared (database `ml_cache` table)
2. ✅ Client report card cache is cleared (browser memory)
3. ❌ **But the underlying data hasn't changed!**

The trend calculation will:
- Query the same previous cycle from database
- Calculate the same previous scores
- Compare against the same current scores
- Return the same "-80%" result

## Possible Issues

### Issue 1: Wrong Previous Cycle Selected
The query might be selecting the wrong cycle as "previous":
- Current viewing: Survey Cycle 2025 (cycle_id = 18?)
- Previous found: Survey Cycle 2025 (cycle_id = 17?)
- This would explain "vs Survey Cycle 2025" text

**Check**: Are there multiple cycles with the same name?

### Issue 2: Incorrect Previous Cycle Data
The previous cycle might have:
- Very high satisfaction scores (e.g., 90%)
- Current cycle has lower scores (e.g., 10%)
- Result: -80% change

**Check**: What are the actual scores in the previous cycle?

### Issue 3: Calculation Bug
The `calculateScoresFromResponses()` function might be:
- Calculating scores incorrectly
- Using wrong formula
- Missing data validation

**Check**: Are the calculated scores realistic?

### Issue 4: Mock Data Issue
If you generated mock data:
- Current cycle has realistic scores (50-60%)
- Previous cycle might have different mock data
- Or previous cycle has no data (defaults to 0% or 100%)

**Check**: Does the previous cycle have real data?

## How to Debug

### Step 1: Check Survey Cycles
```sql
SELECT cycle_id, name, year, is_active, start_date, end_date
FROM survey_cycle
ORDER BY cycle_id DESC;
```

Look for:
- Multiple cycles with same name
- Which cycle is active
- Which cycle should be "previous"

### Step 2: Check Previous Cycle Responses
```sql
SELECT 
  sr.survey_cycle_id,
  sc.name as cycle_name,
  ss.section_key,
  COUNT(*) as response_count
FROM survey_response sr
JOIN survey_cycle sc ON sr.survey_cycle_id = sc.cycle_id
JOIN survey_section ss ON sr.response_id = ss.response_id
WHERE sr.barangay_id = 17  -- Your barangay
AND ss.section_key IN ('financial', 'disaster', 'safety', 'social', 'business', 'environmental')
GROUP BY sr.survey_cycle_id, sc.name, ss.section_key
ORDER BY sr.survey_cycle_id DESC, ss.section_key;
```

Look for:
- How many responses in previous cycle
- Are there responses for all service areas
- Is the data realistic

### Step 3: Check Calculated Scores
Add console logging to see:
- What previous cycle is selected
- What previous scores are calculated
- What current scores are
- What the change calculation is

### Step 4: Check ML Cache
```sql
SELECT 
  endpoint,
  barangay_id,
  cycle_id,
  computed_at,
  expires_at,
  is_stale,
  result_data->'action_grid'->'financial'->'trend' as financial_trend
FROM ml_cache
WHERE endpoint = 'ml-funnel-analysis'
AND barangay_id = 17
ORDER BY computed_at DESC;
```

## Recommended Fixes

### Fix 1: Add Better Validation
In `calculateTrend()`, add validation:
```typescript
// Validate scores are realistic
if (previousSatisfaction < 0 || previousSatisfaction > 100) {
  console.warn('Invalid previous satisfaction score:', previousSatisfaction);
  return { change: 0, direction: 'baseline', available: false };
}

if (currentSatisfaction < 0 || currentSatisfaction > 100) {
  console.warn('Invalid current satisfaction score:', currentSatisfaction);
  return { change: 0, direction: 'baseline', available: false };
}

// Validate change is realistic
if (Math.abs(change) > 50) {
  console.warn('Unrealistic trend change:', change);
  // Maybe still show but with warning?
}
```

### Fix 2: Add Debugging Endpoint
Create `/api/debug/trends?barangayId=X&cycleId=Y` that returns:
- Current cycle info
- Previous cycle info
- Current scores
- Previous scores
- Calculated change
- All intermediate values

### Fix 3: Handle Missing Previous Data
If previous cycle has no data or insufficient data:
```typescript
if (!previousResponses || previousResponses.length < 5) {
  return {
    change: 0,
    direction: 'baseline',
    available: false,
    message: 'Insufficient data in previous cycle for comparison'
  };
}
```

### Fix 4: Show Baseline for First Cycle
If this is truly the first cycle with data:
```typescript
// In report card display
{trend.available && trend.direction !== 'baseline' ? (
  <span>↑/↓ {trend.change}% vs {trend.previousCycle}</span>
) : (
  <span>📊 Baseline Survey</span>
)}
```

## Next Steps

1. **Check the database** to see what cycles exist and what data they have
2. **Add console logging** to see what's being calculated
3. **Verify the previous cycle** is the correct one
4. **Check if previous cycle has realistic data**
5. **Consider if this is actually the baseline** (first cycle with data)

## Questions to Answer

1. What cycles exist in the database?
2. Which cycle is currently active?
3. Which cycle is being used as "previous"?
4. Does the previous cycle have response data?
5. What are the actual calculated scores for previous vs current?
6. Is "-80%" actually correct based on the data?
7. Or is there a bug in the calculation?

