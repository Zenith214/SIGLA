# Calculation Methodology Overhaul Required

## Executive Summary

The current system uses a **fundamentally flawed calculation methodology** that treats awareness, availment, and satisfaction as independent metrics. The system needs to be overhauled to implement a **true funnel/cascading calculation** where each stage filters the population and uses the previous stage's output as its denominator.

## Problem Discovery Timeline

### Initial Issue
- **Reported Problem**: Gemini AI executive summary showing different satisfaction scores (50-55%) compared to service cards (65-68%)
- **Root Cause Investigation**: Led to discovery of >100% metrics bug
- **First Fix Attempt**: Fixed the >100% bug by calculating percentages per question, then averaging

### Deeper Issue Uncovered
After fixing the >100% bug, we discovered the calculation methodology itself is incorrect. The system doesn't follow funnel logic.

## Current (Incorrect) Methodology

### How It Works Now
All metrics use **total respondents (N)** as the base denominator:

```
For each service area:

1. Awareness Score:
   - For each awareness question: (yes_count / N) × 100
   - Average all awareness question percentages
   - Example: Q1=80%, Q2=75%, Q3=70% → 75%

2. Availment Score:
   - For each availment question: (yes_count / N) × 100
   - Average all availment question percentages
   - Uses N (total respondents), NOT aware_count

3. Satisfaction Score:
   - For each satisfaction question: (avg_rating / 5) × 100
   - Average all satisfaction question percentages
   - Uses all respondents who answered, NOT availed_count
```

### Why This Is Wrong
- Treats each metric as **independent**
- No logical progression from awareness → availment → satisfaction
- Satisfaction is calculated from people who may not have even availed the service
- Availment percentage doesn't account for whether people were aware first

## Required (Correct) Methodology: Cascading Funnel

### How It Should Work

The funnel methodology ensures logical integrity by **sequentially filtering** the respondent base:

```
Stage 1: AWARENESS
├─ Denominator: N (total respondents)
├─ Calculation: aware_count / N
└─ Output: aware_count (becomes next denominator)

Stage 2: AVAILMENT
├─ Denominator: aware_count (from Stage 1)
├─ Calculation: availed_count / aware_count
└─ Output: availed_count (becomes next denominator)

Stage 3: SATISFACTION & NEED FOR ACTION
├─ Denominator: availed_count (from Stage 2)
├─ Satisfaction: satisfied_count / availed_count
└─ Need Action: need_action_count / availed_count
```

### Example Calculation

Given:
- N = 150 respondents
- 120 are aware (80%)
- 90 availed (75% of aware, not 60% of total)
- 70 satisfied (78% of availed, not 47% of total)

**Correct Funnel:**
- Awareness: 120/150 = 80%
- Availment: 90/120 = 75%
- Satisfaction: 70/90 = 78%

**Current (Wrong) System:**
- Awareness: 80% ✓ (correct)
- Availment: 90/150 = 60% ✗ (should be 75%)
- Satisfaction: 70/150 = 47% ✗ (should be 78%)

## Files That Need Overhaul

### 1. Python ML Scripts
**Location**: `ml/sigla_ml/feature_engineering.py`

**Current Issues**:
- `_calculate_binary_score()` - Uses N for all calculations
- `_calculate_satisfaction_score()` - Doesn't filter by availed respondents
- No funnel logic implementation

**Required Changes**:
- Implement cascading denominator logic
- Track respondent IDs through each funnel stage
- Filter satisfaction calculations to only availed respondents
- Return both percentages AND counts for each stage

### 2. Executive Summary API
**Location**: `src/app/api/ai/executive-summary/route.ts`

**Current Issues**:
- `calculateServiceScores()` function uses independent calculations
- No respondent filtering between stages
- Treats all metrics as parallel, not sequential

**Required Changes**:
- Implement funnel logic with cascading denominators
- Track which respondents are aware, availed, satisfied
- Calculate each stage based on previous stage's filtered population

### 3. Funnel Analysis API
**Location**: `src/app/api/ml/funnel-analysis/route.ts`

**Current Issues**:
- `calculateScoresFromResponses()` helper function uses N for all metrics
- Despite being named "funnel analysis", doesn't implement funnel logic

**Required Changes**:
- Complete rewrite of calculation logic
- Implement true funnel methodology
- Track respondent progression through stages

### 4. Data Structure Changes

**Current**: Each metric is independent
```typescript
{
  awareness: 75,      // percentage only
  availment: 60,      // percentage only
  satisfaction: 47    // percentage only
}
```

**Required**: Track counts and denominators
```typescript
{
  awareness: {
    count: 120,           // who are aware
    total: 150,           // total respondents
    percentage: 80
  },
  availment: {
    count: 90,            // who availed
    total: 120,           // aware respondents (denominator)
    percentage: 75
  },
  satisfaction: {
    count: 70,            // who are satisfied
    total: 90,            // availed respondents (denominator)
    percentage: 78
  }
}
```

## Implementation Strategy

### Phase 1: Core Calculation Logic
1. Create new funnel calculation functions in Python
2. Create new funnel calculation functions in TypeScript
3. Implement respondent ID tracking through stages
4. Add unit tests for funnel logic

### Phase 2: API Updates
1. Update executive summary API to use new funnel logic
2. Update funnel analysis API to use new funnel logic
3. Update ML insights API integration

### Phase 3: Data Migration
1. Clear all existing ML cache (calculations are wrong)
2. Update database schemas if needed to store counts
3. Regenerate all cached analytics with correct methodology

### Phase 4: UI Updates
1. Update service cards to display funnel metrics correctly
2. Update tooltips to explain funnel methodology
3. Add visual funnel diagrams showing progression

### Phase 5: Validation
1. Compare old vs new calculations
2. Validate with sample data
3. Document expected differences
4. Update all documentation

## Impact Assessment

### What Will Change
- **All satisfaction scores will increase** (calculated from smaller, relevant population)
- **Availment scores will change** (calculated from aware population, not total)
- **Executive summaries will be regenerated** with correct insights
- **Historical comparisons may be affected** (old data used wrong methodology)

### Breaking Changes
- API response structure changes (adding counts)
- Cached data becomes invalid
- Historical trend calculations need recalculation

## Next Steps

1. **Approve methodology change** - Confirm funnel approach is correct for your use case
2. **Create implementation plan** - Detailed task breakdown
3. **Develop new calculation functions** - Start with Python, then TypeScript
4. **Test with sample data** - Validate calculations before deployment
5. **Deploy and migrate** - Clear cache, regenerate all analytics

## Questions to Answer Before Implementation

1. Should we preserve old calculations for historical comparison?
2. How should we handle partial funnel data (e.g., no availment questions)?
3. Should we recalculate all historical cycles or only new ones?
4. Do we need to support both methodologies during transition?

---

**Status**: Awaiting approval to proceed with overhaul
**Priority**: High - Current calculations are fundamentally incorrect
**Estimated Effort**: 2-3 days for full implementation and testing
