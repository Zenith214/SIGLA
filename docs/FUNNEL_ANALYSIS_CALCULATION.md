# Funnel Analysis Calculation Explained

## Overview
The funnel analysis tracks citizen engagement through 3 stages: **Awareness → Availment → Satisfaction**, plus a **Need for Action** metric.

## Calculation Methodology

### 1. **Awareness Score**
**What it measures**: Do citizens know about the service?

**Calculation**:
```
Awareness Score = (Number of "Yes" responses / Total awareness questions) × 100
```

**Question Detection**:
- Looks for questions with "aware" in the field name
- Examples: `awarenessProjects`, `awarenessFinancial`, `awarenessDisasterInfo`

**Positive Responses**:
- `"Yes"`, `"Oo"`, `"1"`, `true`

**Example**:
- 80 people said "Yes" out of 100 awareness questions
- Awareness Score = (80 / 100) × 100 = **80%**

---

### 2. **Availment Score**
**What it measures**: Of those who are aware, how many actually used/accessed the service?

**Calculation**:
```
Availment Score = (Number of "Yes" responses / Total availment questions) × 100
```

**Question Detection**:
- Looks for questions with these keywords:
  - `avail`, `experience`, `benefited`, `participated`
  - `used`, `accessed`, `utilized`, `received`
- Examples: `benefitedProjects`, `usedFinancialInfo`, `participatedSocialPrograms`

**Positive Responses**:
- `"Yes"`, `"Oo"`, `"1"`, `true`

**Example**:
- 60 people said "Yes" out of 100 availment questions
- Availment Score = (60 / 100) × 100 = **60%**

---

### 3. **Satisfaction Score**

#### CORRECT Calculation (Service Areas):
**What it measures**: Of those who used/availed the service, how many are satisfied?

**Calculation**:
```
Satisfaction Score = (Number of satisfied respondents / Number who availed) × 100
```

**Important**: The denominator is the **number who availed**, NOT the total satisfaction questions!

**Question Detection**:
- Looks for questions with "satisf" in the field name
- Examples: `satisfactionProjects`, `satisfactionFinancial`, `satisfactionHealthServices`

**Binary Responses**:
- `"Yes"` or `"Oo"` = Satisfied
- `"No"` or `"Hindi"` = Not Satisfied

**Example**:
- 100 people were aware
- 60 people availed (used the service)
- Of those 60 who availed:
  - 45 said "Yes" (satisfied)
  - 15 said "No" (not satisfied)
- Satisfaction Score = (45 / 60) × 100 = **75%**

**Key Point**: If only 60 people availed, we only calculate satisfaction from those 60, not from all 100 respondents!

---

### 4. **Need for Action Score**
**What it measures**: What percentage of respondents believe the service needs improvement?

**Calculation**:
```
Need for Action Score = (Number of "Yes" responses / Total NFA questions) × 100
```

**Question Detection**:
- Looks for fields starting with:
  - `need_for_action_binary_` (database format)
  - `nfaBinary` (internal format)
- Examples: `nfaBinaryProjects`, `need_for_action_binary_financial`

**Responses**:
- `"Yes"` or `"Oo"` = Needs improvement
- `"No"` or `"Hindi"` = No improvement needed

**Example**:
- 30 people said "Yes" (needs improvement)
- 70 people said "No" (no improvement needed)
- Total: 100 responses
- Need for Action Score = (30 / 100) × 100 = **30%**

---

## Bottleneck Identification

The **bottleneck** is the stage with the **lowest score** in the funnel.

**Example Funnel**:
- Awareness: 80%
- Availment: 60%
- Satisfaction: 75%

**Bottleneck**: Availment (60%) ← Lowest score

**Interpretation**: People know about the service (80% awareness), but many aren't using it (only 60% availment). This suggests barriers to access.

---

## Overall Satisfaction Calculation

For the "Overall Evaluation" section (M1 question):

### CORRECT Calculation:
```
Overall Satisfaction % = (Number who answered "Satisfied" to M1 / Total Sample Size) × 100
```

**Field**: `overallSatisfaction` (M1 question)
- `"Yes"` or `"Oo"` → Satisfied
- `"No"` or `"Hindi"` → Not Satisfied

**Important**: The denominator is the **total sample size** (e.g., 150), NOT just those who answered!

**Example**:
- Total sample size: 150 respondents
- 105 people answered "Yes" (satisfied)
- 30 people answered "No" (not satisfied)
- 15 people didn't answer
- Overall Satisfaction = (105 / 150) × 100 = **70%**

### Overall Need for Action Calculation (M2 question):

```
Overall Need for Action % = (Number who answered "Needs Action" to M2 / Total Sample Size) × 100
```

**Field**: `overallNeedForAction` (M2 question)
- `"Yes"` or `"Oo"` → Needs Action
- `"No"` or `"Hindi"` → No Action Needed

**Example**:
- Total sample size: 150 respondents
- 45 people answered "Yes" (needs action)
- 90 people answered "No" (no action needed)
- 15 people didn't answer
- Overall Need for Action = (45 / 150) × 100 = **30%**

---

## Service Area Scores

Each service area (Financial, Disaster, Safety, Social, Business, Environmental) gets its own funnel analysis:

```
Service Area Score = {
  awareness_score: X%,
  availment_score: Y%,
  satisfaction_score: Z%,
  need_action_score: W%,
  bottleneck: "awareness" | "availment" | "satisfaction"
}
```

---

## Action Grid Classification

Services are classified into 4 quadrants based on satisfaction and need for action:

| Quadrant | Satisfaction | Need for Action | Meaning |
|----------|-------------|-----------------|---------|
| **MAINTAIN** | High (≥60%) | Low (<50%) | Service is good, keep it up |
| **IMPROVE** | Low (<60%) | High (≥50%) | Service needs urgent improvement |
| **MONITOR** | High (≥60%) | High (≥50%) | Service is good but people want more |
| **INVESTIGATE** | Low (<60%) | Low (<50%) | Low satisfaction but people don't see need for action (investigate why) |

---

## Example Complete Calculation

**Service**: Financial Administration (Projects subsection)

**Raw Data**:
- 100 total respondents
- Awareness: 85 said "Yes" → **85%** (85/100)
- Availment: 60 said "Yes" → **60%** (60/100)
- Of the 60 who availed:
  - Satisfaction: 45 said "Yes", 15 said "No" → **75%** (45/60)
  - Need for Action: 18 said "Yes", 42 said "No" → **30%** (18/60)

**Bottleneck**: Availment (60%) ← Lowest

**Action Grid**: MAINTAIN (75% satisfaction, 30% need for action)

**Interpretation**:
- Most people know about the projects (85%)
- But only 60% actually benefited from them (bottleneck)
- Those who did benefit are mostly satisfied (75%)
- Only 30% think improvements are needed

**Recommendation**: Focus on increasing access/participation in projects to address the availment bottleneck.

---

## Backward Compatibility

The system handles both formats seamlessly:

1. **New surveys**: Use binary Yes/No format
2. **Old surveys**: Use 1-5 Likert scale
3. **Mixed data**: System detects format automatically and calculates correctly

This ensures historical data remains valid while new data uses the simpler binary format.
