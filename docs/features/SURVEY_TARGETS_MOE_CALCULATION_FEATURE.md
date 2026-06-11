# Survey Targets - Margin of Error Calculation Feature

**Date:** December 19, 2024  
**Feature:** Enhanced Statistical Precision Reminder with Interactive Calculation Display

---

## Overview

Enhanced the Survey Targets UI to provide technical transparency for the Margin of Error (MoE) calculation without cluttering the interface for non-technical users. This feature adds an interactive "Show Calculation" button that displays the underlying formula, explains its components, and shows the current calculation.

---

## Implementation Details

### 1. New Component: `MoECalculationPopover`

Created a reusable popover component that displays:

- **Formula Display**: `MoE = 0.98 / √n`
- **Component Explanations**:
  - `MoE` = Margin of Error (as a percentage)
  - `0.98` = Z-score constant for 95% confidence level
  - `n` = Sample size (number of respondents)
- **Current Calculation**: Step-by-step calculation with actual values
- **Interpretation**: Plain language explanation of what the result means

### 2. UI Integration

The "Show Calculation" button is integrated into the Statistical Precision Reminder section in both:
- **Add Target Modal**: When creating new survey targets
- **Edit Target Modal**: When modifying existing targets

### 3. User Experience

**For Non-Technical Users:**
- Clean, uncluttered interface showing only the MoE percentage
- Optional access to technical details via the "Show Calculation" link

**For Technical Users:**
- Full transparency into the calculation methodology
- Formula breakdown with component explanations
- Step-by-step calculation display
- Real-time updates as sample size changes

---

## Formula Details

### Margin of Error Formula

```
MoE = 0.98 / √n
```

Where:
- **MoE**: Margin of Error (expressed as a percentage)
- **0.98**: Z-score constant for 95% confidence level (simplified from 1.96/2)
- **n**: Sample size (number of survey respondents)

### Confidence Level

The formula uses a **95% confidence level**, which is the standard in survey research. This means:
- Results will be accurate within ±MoE% of the true population value
- 95% of the time, the true value falls within this range

### Example Calculations

| Sample Size (n) | Calculation | Margin of Error |
|----------------|-------------|-----------------|
| 100 | 0.98 / √100 = 0.98 / 10 | ±9.8% |
| 150 | 0.98 / √150 = 0.98 / 12.25 | ±8.0% |
| 200 | 0.98 / √200 = 0.98 / 14.14 | ±6.9% |
| 300 | 0.98 / √300 = 0.98 / 17.32 | ±5.7% |

---

## Visual Design

### Popover Layout

```
┌─────────────────────────────────────────┐
│ 🧮 Margin of Error Calculation         │
├─────────────────────────────────────────┤
│                                         │
│ Formula:                                │
│ ┌─────────────────────────────────────┐ │
│ │ MoE = 0.98 / √n                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Where:                                  │
│   MoE    = Margin of Error (%)         │
│   0.98   = Z-score for 95% confidence  │
│   n      = Sample size                 │
│                                         │
│ Current Calculation:                    │
│ ┌─────────────────────────────────────┐ │
│ │ MoE = 0.98 / √150                   │ │
│ │ MoE = 0.98 / 12.25                  │ │
│ │ MoE = ±8.0%                         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ What this means: If you survey 150     │
│ people, your results will be accurate  │
│ within ±8.0% of the true population    │
│ value, 95% of the time.                │
└─────────────────────────────────────────┘
```

### Trigger Button

- **Icon**: Calculator icon (from lucide-react)
- **Text**: "Show Calculation"
- **Style**: Blue text with dotted underline
- **Hover**: Darker blue color
- **Position**: Next to the MoE percentage display

---

## Technical Implementation

### Dependencies

```typescript
import { Calculator } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
```

### Component Props

```typescript
interface MoECalculationPopoverProps {
  sampleSize: number;
}
```

### Calculation Logic

```typescript
const n = sampleSize || 150;
const moe = (0.98 / Math.sqrt(n)) * 100;
```

---

## Benefits

### 1. Educational Value
- Helps users understand the statistical basis for sample size decisions
- Provides transparency into survey methodology
- Builds trust in the system's calculations

### 2. Decision Support
- Users can see how changing sample size affects precision
- Enables informed trade-offs between precision and resources
- Real-time feedback on statistical implications

### 3. Professional Standards
- Demonstrates adherence to statistical best practices
- Provides documentation for audit purposes
- Supports academic and research requirements

### 4. User Experience
- Non-intrusive design keeps interface clean
- Optional detail for those who need it
- Consistent with modern UI/UX patterns

---

## Usage Examples

### Scenario 1: Planning a Survey
A field supervisor is setting up a new survey target:
1. Opens "Add Target" modal
2. Enters target of 200 respondents
3. Sees MoE of ±6.9%
4. Clicks "Show Calculation" to understand why
5. Reviews formula and decides if precision is adequate

### Scenario 2: Budget Constraints
An administrator needs to reduce survey costs:
1. Opens "Edit Target" modal for a barangay
2. Reduces target from 150 to 100
3. Sees MoE increase from ±8.0% to ±9.8%
4. Clicks "Show Calculation" to verify the impact
5. Makes informed decision about acceptable precision

### Scenario 3: Academic Review
A researcher is validating the survey methodology:
1. Reviews survey targets in the system
2. Clicks "Show Calculation" for any target
3. Verifies the formula matches statistical standards
4. Confirms 95% confidence level is appropriate
5. Documents the methodology for publication

---

## Future Enhancements

### Potential Additions
1. **Confidence Level Selector**: Allow users to choose 90%, 95%, or 99% confidence
2. **Population Size Adjustment**: Include finite population correction for small populations
3. **Interactive Calculator**: Standalone tool to explore different sample sizes
4. **Historical Comparison**: Show how MoE has changed across survey cycles
5. **Export Documentation**: Generate PDF with calculation details for reports

### Advanced Features
1. **Design Effect Adjustment**: Account for clustering in multi-stage sampling
2. **Stratification Support**: Calculate MoE for stratified samples
3. **Power Analysis**: Estimate sample size needed to detect specific effect sizes
4. **Cost-Benefit Analysis**: Compare precision gains vs. resource requirements

---

## Testing Checklist

- [x] Popover opens on click
- [x] Popover closes on outside click
- [x] Formula displays correctly
- [x] Component explanations are clear
- [x] Current calculation updates with sample size
- [x] Step-by-step calculation is accurate
- [x] Interpretation text is helpful
- [x] Works in Add Target modal
- [x] Works in Edit Target modal
- [x] Responsive design on mobile
- [x] Accessible keyboard navigation
- [x] No console errors

---

## Related Files

- `src/app/settings/ui/sections/survey-targets.tsx` - Main implementation
- `src/components/ui/popover.tsx` - Popover component
- `docs/SURVEY_TARGETS_MOE_CALCULATION_FEATURE.md` - This documentation

---

## References

### Statistical Resources
- **Margin of Error**: [Wikipedia - Margin of Error](https://en.wikipedia.org/wiki/Margin_of_error)
- **Confidence Intervals**: [Statistics How To - Confidence Intervals](https://www.statisticshowto.com/probability-and-statistics/confidence-interval/)
- **Sample Size Calculation**: [Survey Monkey - Sample Size Calculator](https://www.surveymonkey.com/mp/sample-size-calculator/)

### Z-Score Values
- 90% Confidence: Z = 1.645
- 95% Confidence: Z = 1.96 (simplified to 0.98 in formula)
- 99% Confidence: Z = 2.576

---

**Status**: ✅ Complete and Deployed
