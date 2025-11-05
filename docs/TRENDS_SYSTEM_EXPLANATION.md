# Trends System - How It Works

## Current State (Baseline)

Your system currently shows **"baseline"** for all trends because:
- ✅ You have only ONE active survey cycle
- ❌ No historical data to compare against
- ℹ️ This is expected behavior for the first survey cycle

## How Trends Will Work

### Data Structure

The system tracks scores across multiple survey cycles:

```
survey_cycle table:
├── cycle_id: 1 (2025 Q1) - Completed
├── cycle_id: 2 (2025 Q2) - Active
└── cycle_id: 3 (2025 Q3) - Future
```

Each cycle has associated survey responses that generate funnel scores:
```
Barangay 17 - Financial Administration:
├── Cycle 1 (2025 Q1): Awareness 70%, Availment 65%, Satisfaction 75%
├── Cycle 2 (2025 Q2): Awareness 85%, Availment 80%, Satisfaction 82%
└── Trend: ↑ Awareness +15%, ↑ Availment +15%, ↑ Satisfaction +7%
```

### Trend Calculation Logic

When you have multiple cycles, the system will:

1. **Fetch Current Cycle Scores** (e.g., Cycle 2)
   - Awareness: 85%
   - Availment: 80%
   - Satisfaction: 82%

2. **Fetch Previous Cycle Scores** (e.g., Cycle 1)
   - Awareness: 70%
   - Availment: 65%
   - Satisfaction: 75%

3. **Calculate Change**
   ```typescript
   change = currentScore - previousScore
   direction = change >= 0 ? 'up' : 'down'
   ```

4. **Return Trend Data**
   ```typescript
   {
     change: 7,           // +7 percentage points
     direction: 'up',     // improvement
     available: true,     // historical data exists
     previousScore: 75,   // for reference
     currentScore: 82     // for reference
   }
   ```

### Visual Representation

The UI will show trends like this:

```
Financial Administration
┌─────────────────────────────────────┐
│ Satisfaction: 82%  ↑ +7%           │
│ Awareness: 85%     ↑ +15%          │
│ Availment: 80%     ↑ +15%          │
└─────────────────────────────────────┘
```

Or if scores decreased:
```
Financial Administration
┌─────────────────────────────────────┐
│ Satisfaction: 68%  ↓ -7%           │
│ Awareness: 55%     ↓ -15%          │
│ Availment: 50%     ↓ -15%          │
└─────────────────────────────────────┘
```

## Implementation Requirements

### 1. Database Storage

Currently, scores are calculated on-demand from survey responses. For trends to work efficiently, you need to:

**Option A: Calculate on-demand** (Current approach)
- Query previous cycle's survey responses
- Calculate scores for previous cycle
- Compare with current cycle
- ⚠️ Slower but no additional storage needed

**Option B: Store calculated scores** (Recommended)
- Create a `service_scores` table to store calculated scores per cycle
- Structure:
  ```sql
  CREATE TABLE service_scores (
    score_id SERIAL PRIMARY KEY,
    barangay_id INTEGER REFERENCES barangay(barangay_id),
    cycle_id INTEGER REFERENCES survey_cycle(cycle_id),
    service_area TEXT NOT NULL, -- 'financial', 'disaster', etc.
    awareness_score INTEGER,
    availment_score INTEGER,
    satisfaction_score INTEGER,
    need_action_score INTEGER,
    calculated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(barangay_id, cycle_id, service_area)
  );
  ```
- ✅ Faster queries
- ✅ Historical data preserved even if responses are deleted
- ✅ Can track score changes over time

### 2. Trend Calculation Function

Update the `calculateTrend()` function to:

```typescript
async function calculateTrend(
  barangayId: number, 
  serviceArea: string, 
  currentCycleId: number
): Promise<TrendData> {
  // Get previous completed cycle
  const previousCycle = await getPreviousCompletedCycle(currentCycleId);
  
  if (!previousCycle) {
    return {
      change: 0,
      direction: 'baseline',
      available: false,
      message: 'No historical data available for comparison'
    };
  }
  
  // Get scores for both cycles
  const currentScores = await getServiceScores(barangayId, currentCycleId, serviceArea);
  const previousScores = await getServiceScores(barangayId, previousCycle.cycle_id, serviceArea);
  
  // Calculate change
  const change = currentScores.satisfaction - previousScores.satisfaction;
  
  return {
    change: change,
    direction: change >= 0 ? 'up' : 'down',
    available: true,
    previousScore: previousScores.satisfaction,
    currentScore: currentScores.satisfaction,
    previousCycle: previousCycle.name,
    currentCycle: currentCycle.name
  };
}
```

### 3. Workflow for Multiple Cycles

**Cycle 1 (2025 Q1) - Baseline Survey**
1. Conduct surveys
2. Calculate scores
3. Store scores in database
4. Display: "Baseline - No previous data"

**Cycle 2 (2025 Q2) - First Comparison**
1. Conduct surveys
2. Calculate scores
3. Compare with Cycle 1 scores
4. Display: "↑ +7% vs Q1 2025"

**Cycle 3 (2025 Q3) - Ongoing Tracking**
1. Conduct surveys
2. Calculate scores
3. Compare with Cycle 2 scores
4. Display: "↓ -3% vs Q2 2025"
5. Also show: "Overall trend: ↑ +4% vs Q1 2025 (baseline)"

## When Will Trends Appear?

Trends will automatically appear when:
1. ✅ You complete the current survey cycle (mark it as "Completed")
2. ✅ You create a new survey cycle (e.g., "2025 Q2")
3. ✅ You start collecting data for the new cycle
4. ✅ The system detects a previous completed cycle exists

## Testing Trends (Without Waiting)

To test the trends feature now:

1. **Complete Current Cycle**
   - Go to Settings → Survey Cycles
   - Mark current cycle as "Completed"

2. **Create New Cycle**
   - Create "2025 Q2" cycle
   - Set it as Active

3. **Generate Mock Data for New Cycle**
   - Generate responses for the new cycle
   - Use different profiles (e.g., if Q1 was "high-performer", make Q2 "mixed")

4. **View Trends**
   - Open Report Card
   - You should now see trends comparing Q2 vs Q1

## Future Enhancements

### Multi-Cycle Trend Analysis
Show trends across multiple cycles:
```
Financial Administration - Satisfaction Trend
┌─────────────────────────────────────────────┐
│ Q1 2025: 75% (baseline)                     │
│ Q2 2025: 82% ↑ +7%                          │
│ Q3 2025: 79% ↓ -3%                          │
│ Q4 2025: 85% ↑ +6%                          │
│                                             │
│ Overall Trend: ↑ +10% (vs baseline)        │
└─────────────────────────────────────────────┘
```

### Trend Visualization
Add charts showing score changes over time:
- Line charts for each service area
- Bar charts comparing cycles
- Heatmaps showing improvement/decline patterns

### Predictive Analytics
Use ML to predict future trends:
- "Based on current trajectory, satisfaction is expected to reach 90% by Q4 2025"
- "Alert: Disaster preparedness scores declining for 2 consecutive cycles"

## Summary

**Current State**: Baseline (no trends)
- ✅ Expected behavior for first cycle
- ✅ System is working correctly

**Future State**: Trend tracking enabled
- ⏳ Requires completing current cycle
- ⏳ Requires creating new cycle
- ⏳ Requires collecting data for new cycle

**Implementation**: Ready to go
- ✅ Code structure supports trends
- ✅ Database supports multiple cycles
- ⚠️ May need `service_scores` table for efficiency
- ⚠️ Need to implement score comparison logic

The foundation is already in place - trends will automatically work once you have multiple completed survey cycles!
