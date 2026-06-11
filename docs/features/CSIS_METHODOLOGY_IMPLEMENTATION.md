# CSIS Methodology Implementation

## Overview

This document describes the implementation of the official CSIS (Citizen Satisfaction Index System) calculation methodology across the SIGLA platform, including the Dynamic Cut-Off Rule and Action Grid Quadrant classification.

## CSIS Calculation Manual Compliance

The implementation follows the DILG CSIS Manual for Philippine Local Government Units, specifically:

### 1. Dynamic Cut-Off Rule

Instead of using fixed percentage thresholds (e.g., 50%), the CSIS methodology uses a dynamic cut-off that adjusts based on the Margin of Error (MoE).

**Formula:**
```
MoE = 0.98 / sqrt(n)
Cut-off = 0.50 + MoE
```

**Classification:**
- If score >= cut-off → "High"
- If score < cut-off → "Low"

**Example:**
- Sample size (n) = 40
- MoE = 0.98 / sqrt(40) = 0.155 (15.5%)
- Cut-off = 0.50 + 0.155 = 0.655 (65.5%)
- A score of 75% would be classified as "High"
- A score of 60% would be classified as "Low"

### 2. Action Grid Quadrants

Services are classified into four quadrants based on their Satisfaction and Need for Action ratings:

| Satisfaction | Need for Action | Quadrant | Priority |
|--------------|----------------|----------|----------|
| Low | High | **Opportunities for Improvement** | Highest Priority |
| High | High | **Continued Emphasis** | High Importance |
| High | Low | **Exceeded Expectations** | Key Strength |
| Low | Low | **Secondary Priority** | Lowest Priority |

## Implementation Components

### 1. Python ML Module (`ml/sigla_ml/csis_calculations.py`)

Core CSIS calculation functions:
- `calculate_margin_of_error(sample_size)` - Calculate MoE
- `calculate_dynamic_cutoff(moe)` - Calculate cut-off threshold
- `classify_score(score, moe)` - Classify as "High" or "Low"
- `determine_action_grid_quadrant()` - Determine quadrant and priority
- `calculate_service_metrics_with_moe()` - Complete metrics with CSIS classification

### 2. Python Feature Engineering (`ml/sigla_ml/feature_engineering.py`)

Updated to integrate CSIS calculations:
- `_calculate_funnel_metrics()` - Now includes MoE and Action Grid classification
- `_calculate_need_for_action_from_responses()` - Calculate need for action metrics
- Service scores now include:
  - `satisfaction` with MoE, cutoff, and rating
  - `need_for_action` with MoE, cutoff, and rating
  - `action_grid` with quadrant and priority

### 3. Python ML API (`ml/sigla_ml/api.py`)

Updated action grid calculation:
- `_calculate_action_grid()` - Uses CSIS methodology when available
- Falls back to legacy calculation if CSIS data not present
- Returns official quadrant names and priorities

### 4. TypeScript Funnel Calculations (`src/lib/funnel-calculations.ts`)

Added CSIS functions:
- `calculateMarginOfError()` - Calculate MoE
- `calculateDynamicCutoff()` - Calculate cut-off
- `classifyScore()` - Classify score
- `determineActionGridQuadrant()` - Determine quadrant
- `calculateNeedForActionMetrics()` - Calculate need for action
- Updated `calculateServiceFunnelMetrics()` to include Action Grid classification

### 5. Gemini AI Executive Summary (`src/app/api/ai/executive-summary/route.ts`)

Updated prompt to follow CSIS methodology:
- Instructs AI to use Dynamic Cut-Off Rule
- Provides MoE for each score
- Requires classification into official Action Grid Quadrants
- Emphasizes "Opportunities for Improvement" as critical priorities
- Structures output for CPAP creation

## Data Flow

```
Survey Responses
    ↓
Funnel Calculations (Awareness → Availment → Satisfaction)
    ↓
Calculate MoE for each metric
    ↓
Apply Dynamic Cut-Off Rule
    ↓
Classify as "High" or "Low"
    ↓
Determine Action Grid Quadrant
    ↓
Generate Executive Summary with CPAP recommendations
```

## Usage Examples

### Python

```python
from sigla_ml.csis_calculations import (
    calculate_margin_of_error,
    determine_action_grid_quadrant
)

# Calculate MoE for 40 respondents
moe = calculate_margin_of_error(40)  # Returns 0.155

# Determine quadrant
satisfaction_score = 0.75  # 75%
need_for_action_score = 0.375  # 37.5%

quadrant, priority, details = determine_action_grid_quadrant(
    satisfaction_score, moe,
    need_for_action_score, moe
)

print(f"Quadrant: {quadrant}")  # "Exceeded Expectations"
print(f"Priority: {priority}")  # "Key Strength"
```

### TypeScript

```typescript
import {
  calculateMarginOfError,
  determineActionGridQuadrant,
  calculateServiceFunnelMetrics
} from '@/lib/funnel-calculations';

// Calculate funnel metrics with CSIS classification
const metrics = calculateServiceFunnelMetrics(responses, 'financial');

console.log(metrics.actionGrid?.quadrant);  // "Exceeded Expectations"
console.log(metrics.actionGrid?.priority);  // "Key Strength"
```

## Executive Summary Structure

The AI-generated executive summary now follows this structure:

1. **Overview** - Brief performance summary
2. **Key Strengths** - Services in "Exceeded Expectations" quadrant
3. **Critical Priorities** - Services in "Opportunities for Improvement" quadrant
4. **Action Plan** - Immediate, short-term, and long-term actions
5. **CPAP Recommendation** - Focus areas for Citizen Priority Action Plan

## Benefits

1. **Statistical Rigor** - Accounts for sample size variability
2. **Consistency** - Standardized methodology across all LGUs
3. **Actionable Insights** - Clear prioritization for resource allocation
4. **CPAP Alignment** - Direct support for action plan creation
5. **Compliance** - Follows official DILG CSIS guidelines

## Testing

To test the CSIS calculations:

```bash
# Python
cd ml
python -m sigla_ml.csis_calculations

# TypeScript (via API)
curl -X POST http://localhost:3000/api/ml/funnel-analysis?barangayId=1&cycleId=1
```

## Migration Notes

- **Backward Compatibility**: Legacy calculations are preserved for comparison
- **Gradual Rollout**: CSIS methodology is used when sufficient data is available
- **Fallback**: System falls back to fixed thresholds if sample size is too small
- **Data Requirements**: Need for Action questions must be present in survey forms

## Future Enhancements

1. Confidence intervals for all metrics
2. Trend analysis using CSIS methodology
3. Comparative analysis across barangays
4. Automated CPAP generation based on Action Grid
5. Real-time CSIS dashboard updates

## References

- DILG CSIS Manual for Philippine Local Government Units
- CSIS Calculation Methodology Guide
- Action Grid Framework Documentation

---

**Last Updated:** November 28, 2025
**Version:** 1.0.0
**Status:** ✅ Implemented and Tested
