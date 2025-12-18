# Conversation Summary: Calculation Methodology Issues

## Initial Problem
User reported that Gemini AI executive summary was showing different satisfaction scores compared to the service cards displayed on the reportcard page:
- **Executive Summary**: 50-55% satisfaction across all service areas
- **Service Cards**: 65-68% satisfaction across all service areas

## Investigation Phase 1: The >100% Bug

### Discovery
While investigating the discrepancy, we found the system was producing **>100% metrics**:
- Financial services: 220% awareness, 0% availment
- Disaster: 147% awareness, 64% availment
- Safety: 216% awareness, 208% availment

### Root Cause
The calculation logic was flawed:
```typescript
// WRONG: Counts all "yes" answers across all questions and respondents
awarenessCount / totalAwarenessQuestions

// If 150 respondents × 3 questions = 450 total answers
// If all say "yes": 450/150 = 300% ❌
```

### Fix Applied
Changed to calculate percentage **per question first**, then average:
```typescript
// CORRECT: Calculate per question, then average
for each question:
  percentage = (yes_count / total_respondents) × 100
average all question percentages
```

### Files Fixed for >100% Bug
1. `src/app/api/ai/executive-summary/route.ts` - Executive summary calculations
2. `src/app/api/ml/funnel-analysis/route.ts` - Funnel analysis helper
3. `ml/sigla_ml/feature_engineering.py` - Python ML calculations

## Investigation Phase 2: Persistent Discrepancy

### Problem Persisted
After fixing the >100% bug:
- Executive summary still showed 50-55%
- Service cards showed 65-68%
- Both were now properly bounded 0-100%, but still different

### Cache Issues
- Had to clear ML cache multiple times
- Executive summary was serving stale cached data
- Python ML script needed separate fix for satisfaction calculation

### Additional Fixes
- Fixed Python `_calculate_satisfaction_score()` to use per-question averaging
- Cleared cache after each fix
- Regenerated executive summaries multiple times

## Investigation Phase 3: Fundamental Methodology Flaw

### Critical Discovery
User explained the system should use **funnel/cascading calculation methodology**:

**Funnel Logic:**
```
Stage 1: Awareness = aware_count / N
         ↓ (aware_count becomes denominator)
Stage 2: Availment = availed_count / aware_count
         ↓ (availed_count becomes denominator)
Stage 3: Satisfaction = satisfied_count / availed_count
```

**Current System:**
```
Awareness = aware_count / N ✓
Availment = availed_count / N ✗ (should use aware_count)
Satisfaction = satisfied_count / N ✗ (should use availed_count)
```

### Realization
The entire calculation system is **fundamentally flawed**. We fixed the >100% bug, but the underlying methodology doesn't follow funnel logic. Each metric uses total respondents (N) as the denominator instead of cascading through the funnel stages.

## Current Status

### What We Fixed
✅ >100% bug - Metrics now properly bounded 0-100%
✅ Per-question averaging - Consistent calculation across questions
✅ Cache clearing - Can regenerate with fresh data

### What Still Needs Fixing
❌ Funnel methodology - System doesn't use cascading denominators
❌ Respondent filtering - No tracking of who progressed through stages
❌ Data structure - Doesn't store counts, only percentages
❌ All three calculation systems need complete overhaul

## Files Requiring Complete Overhaul

1. **ml/sigla_ml/feature_engineering.py**
   - `_calculate_binary_score()` method
   - `_calculate_satisfaction_score()` method
   - Need to implement funnel logic with respondent tracking

2. **src/app/api/ai/executive-summary/route.ts**
   - `calculateServiceScores()` function
   - Need cascading denominator logic

3. **src/app/api/ml/funnel-analysis/route.ts**
   - `calculateScoresFromResponses()` function
   - Despite the name, doesn't implement funnel logic

## Next Steps

1. Review `CALCULATION_METHODOLOGY_OVERHAUL.md` for detailed implementation plan
2. Decide on approach: complete overhaul vs gradual migration
3. Answer key questions about historical data handling
4. Implement new funnel calculation logic
5. Test thoroughly with sample data
6. Deploy and regenerate all analytics

## Key Takeaway

We successfully fixed a symptom (>100% bug) but discovered the disease (wrong methodology). The system needs a fundamental overhaul to implement true funnel/cascading calculations where each stage filters the population and uses the previous stage's output as its denominator.
