# CSIS Methodology - Quick Reference Guide

## Dynamic Cut-Off Rule

### Formula
```
MoE = 0.98 / sqrt(n)
Cut-off = 0.50 + MoE
```

### Classification
- Score >= Cut-off → **"High"**
- Score < Cut-off → **"Low"**

### Examples

| Sample Size (n) | MoE | Cut-off | 60% Score | 70% Score |
|----------------|-----|---------|-----------|-----------|
| 25 | 0.196 | 69.6% | Low | High |
| 40 | 0.155 | 65.5% | Low | High |
| 100 | 0.098 | 59.8% | High | High |
| 400 | 0.049 | 54.9% | High | High |

## Action Grid Quadrants

### Matrix

```
                Need for Action
                Low         High
           ┌─────────────┬─────────────┐
Satisfaction│             │             │
    High   │  Exceeded   │ Continued   │
           │ Expectations│  Emphasis   │
           ├─────────────┼─────────────┤
           │             │             │
    Low    │  Secondary  │Opportunities│
           │  Priority   │for Improve. │
           └─────────────┴─────────────┘
```

### Quadrant Details

#### 1. Opportunities for Improvement
- **Condition:** Low Satisfaction + High Need for Action
- **Priority:** Highest Priority
- **Action:** Immediate intervention required
- **CPAP Focus:** Primary target for action plans

#### 2. Continued Emphasis
- **Condition:** High Satisfaction + High Need for Action
- **Priority:** High Importance
- **Action:** Maintain quality while addressing needs
- **CPAP Focus:** Sustain and enhance

#### 3. Exceeded Expectations
- **Condition:** High Satisfaction + Low Need for Action
- **Priority:** Key Strength
- **Action:** Maintain current performance
- **CPAP Focus:** Showcase as best practice

#### 4. Secondary Priority
- **Condition:** Low Satisfaction + Low Need for Action
- **Priority:** Lowest Priority
- **Action:** Monitor and improve when resources available
- **CPAP Focus:** Long-term improvement

## Code Examples

### Python

```python
from sigla_ml.csis_calculations import (
    calculate_margin_of_error,
    determine_action_grid_quadrant
)

# Example: 40 respondents
n = 40
moe = calculate_margin_of_error(n)  # 0.155

# Service scores (as decimals 0-1)
satisfaction = 0.75  # 75%
need_for_action = 0.375  # 37.5%

quadrant, priority, details = determine_action_grid_quadrant(
    satisfaction, moe,
    need_for_action, moe
)

print(f"Quadrant: {quadrant}")
# Output: "Exceeded Expectations"
```

### TypeScript

```typescript
import {
  calculateMarginOfError,
  determineActionGridQuadrant
} from '@/lib/funnel-calculations';

// Example: 40 respondents
const n = 40;
const moe = calculateMarginOfError(n);  // 0.155

// Service scores (as decimals 0-1)
const satisfaction = 0.75;  // 75%
const needForAction = 0.375;  // 37.5%

const actionGrid = determineActionGridQuadrant(
  satisfaction, moe,
  needForAction, moe
);

console.log(actionGrid.quadrant);
// Output: "Exceeded Expectations"
```

## Interpretation Guide

### Reading MoE
- **Small MoE (< 0.10):** Large sample, more confident
- **Medium MoE (0.10-0.20):** Moderate sample, reasonably confident
- **Large MoE (> 0.20):** Small sample, less confident

### Reading Cut-offs
- **Low Cut-off (< 60%):** Large sample, easier to achieve "High"
- **Medium Cut-off (60-70%):** Moderate sample, balanced threshold
- **High Cut-off (> 70%):** Small sample, harder to achieve "High"

### Action Priority

1. **Highest Priority** (Opportunities for Improvement)
   - Allocate resources immediately
   - Develop detailed action plans
   - Set measurable targets
   - Monitor progress closely

2. **High Importance** (Continued Emphasis)
   - Maintain current efforts
   - Address emerging needs
   - Prevent decline in satisfaction
   - Enhance service delivery

3. **Key Strength** (Exceeded Expectations)
   - Document best practices
   - Share with other services
   - Maintain standards
   - Use as benchmark

4. **Lowest Priority** (Secondary Priority)
   - Monitor periodically
   - Plan for future improvement
   - Allocate resources when available
   - Focus on quick wins

## Common Scenarios

### Scenario 1: Small Sample, High Satisfaction
- n = 25, Satisfaction = 80%
- MoE = 0.196, Cut-off = 69.6%
- Rating: **High** (80% > 69.6%)
- Note: High cut-off due to small sample

### Scenario 2: Large Sample, Moderate Satisfaction
- n = 100, Satisfaction = 65%
- MoE = 0.098, Cut-off = 59.8%
- Rating: **High** (65% > 59.8%)
- Note: Lower cut-off due to large sample

### Scenario 3: Borderline Case
- n = 40, Satisfaction = 64%
- MoE = 0.155, Cut-off = 65.5%
- Rating: **Low** (64% < 65.5%)
- Note: Just below cut-off, consider increasing sample

## Best Practices

1. **Sample Size**
   - Aim for n >= 30 for reliable results
   - Larger samples provide more confidence
   - Document sample size in reports

2. **Data Quality**
   - Ensure complete responses
   - Validate data entry
   - Check for outliers

3. **Interpretation**
   - Consider MoE when making decisions
   - Don't over-interpret small differences
   - Look at trends over time

4. **Communication**
   - Explain methodology to stakeholders
   - Show MoE and cut-offs in reports
   - Use visual aids (Action Grid matrix)

5. **CPAP Development**
   - Focus on "Opportunities for Improvement"
   - Set SMART goals for each priority
   - Allocate resources based on quadrants
   - Monitor progress quarterly

## Troubleshooting

### Issue: All services show "Low"
- **Cause:** Small sample size → High cut-off
- **Solution:** Increase sample size or accept higher threshold

### Issue: Inconsistent classifications
- **Cause:** Varying sample sizes across services
- **Solution:** Normalize sample sizes or report MoE

### Issue: No "Opportunities for Improvement"
- **Cause:** High satisfaction or low need for action
- **Solution:** Review survey questions, may indicate good performance

### Issue: All services in one quadrant
- **Cause:** Uniform performance or survey bias
- **Solution:** Review survey design and data collection

## Resources

- **Full Documentation:** `docs/CSIS_METHODOLOGY_IMPLEMENTATION.md`
- **Update Summary:** `docs/CSIS_UPDATE_SUMMARY.md`
- **Python Module:** `ml/sigla_ml/csis_calculations.py`
- **TypeScript Library:** `src/lib/funnel-calculations.ts`
- **DILG CSIS Manual:** Official government documentation

---

**Quick Reference Version:** 1.0.0
**Last Updated:** November 28, 2025
