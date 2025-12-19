# Service Deep Dive - Conditional Insights Integration

## Date: December 19, 2025

---

## Overview

Added unawareness and non-availment reason analytics to the Service Area Deep Dive API to provide deeper insights into barriers to service awareness and usage.

---

## What Was Added

### New Data Fields in API Response

Each barangay ranking now includes:

```typescript
{
  barangayId: number,
  barangayName: string,
  awareness: number,
  availment: number,
  satisfaction: number,
  needForAction: number,
  responseCount: number,
  trend: 'up' | 'down' | 'stable',
  // ✅ NEW FIELDS
  unawarenessReasons: Array<{ reason: string, count: number }>,
  nonAvailmentReasons: Array<{ reason: string, count: number }>
}
```

### Unawareness Reasons

**Purpose:** Understand why residents are not aware of a service

**Data Structure:**
```typescript
unawarenessReasons: [
  { reason: "No information campaigns", count: 15 },
  { reason: "Not interested", count: 8 },
  { reason: "Language barrier", count: 5 }
]
```

**Top 3 Reasons:** Only the top 3 most common reasons are returned per barangay

### Non-Availment Reasons

**Purpose:** Understand why aware residents did not use the service

**Data Structure:**
```typescript
nonAvailmentReasons: [
  { reason: "Too expensive", count: 12 },
  { reason: "Long waiting time", count: 10 },
  { reason: "Inconvenient location", count: 7 }
]
```

**Top 3 Reasons:** Only the top 3 most common reasons are returned per barangay

---

## Implementation Details

### File Modified

**`src/app/api/analytics/service-area-deep-dive/route.ts`**

### Query Added

```typescript
const conditionalQuery = `
  SELECT 
    sr.unawareness_reasons,
    sr.non_availment_reasons
  FROM survey_response sr
  WHERE sr.barangay_id = $1
    AND sr.survey_cycle_id = $2
    AND sr.status IN ('completed', 'submitted')
    ${demographicFilter}
`
```

### Processing Logic

1. **Fetch conditional data** for each barangay
2. **Filter by service area** - only count reasons for the current service
3. **Aggregate counts** - count occurrences of each reason
4. **Sort and limit** - get top 3 most common reasons
5. **Include in response** - add to barangay ranking object

### Service Filtering

```typescript
// Only count reasons for the current service area
if (serviceId.toLowerCase().includes(field.toLowerCase())) {
  const reasonStr = String(reason)
  unawarenessReasons[reasonStr] = (unawarenessReasons[reasonStr] || 0) + 1
}
```

This ensures that when viewing "Financial Administration" deep dive, only unawareness/non-availment reasons related to financial services are shown.

---

## Use Cases

### 1. Identify Communication Gaps

**Scenario:** High unawareness in a barangay

**Insight:** Top unawareness reasons show:
- "No information campaigns" (20 responses)
- "Not interested" (15 responses)
- "Language barrier" (10 responses)

**Action:** Launch targeted information campaigns in local language

### 2. Address Service Barriers

**Scenario:** High awareness but low availment

**Insight:** Top non-availment reasons show:
- "Too expensive" (18 responses)
- "Long waiting time" (12 responses)
- "Inconvenient location" (8 responses)

**Action:** Review pricing, improve efficiency, consider mobile services

### 3. Compare Barangays

**Scenario:** Two barangays with similar awareness but different availment

**Barangay A:**
- Awareness: 85%
- Availment: 60%
- Top reason: "Too expensive"

**Barangay B:**
- Awareness: 85%
- Availment: 40%
- Top reason: "Inconvenient location"

**Action:** Different interventions needed for each barangay

---

## Example API Response

```json
{
  "rankings": [
    {
      "barangayId": 1,
      "barangayName": "Poblacion",
      "awareness": 85,
      "availment": 60,
      "satisfaction": 65,
      "needForAction": 35,
      "responseCount": 150,
      "trend": "stable",
      "unawarenessReasons": [
        { "reason": "No information campaigns", "count": 15 },
        { "reason": "Not interested", "count": 8 },
        { "reason": "Language barrier", "count": 5 }
      ],
      "nonAvailmentReasons": [
        { "reason": "Too expensive", "count": 12 },
        { "reason": "Long waiting time", "count": 10 },
        { "reason": "Inconvenient location", "count": 7 }
      ]
    }
  ]
}
```

---

## Frontend Integration

### Display in Service Deep Dive Table

Add columns or expandable rows to show:

1. **Unawareness Reasons Column:**
   - Show top 3 reasons with counts
   - Use badges or chips for visual clarity
   - Tooltip for full reason text

2. **Non-Availment Reasons Column:**
   - Show top 3 reasons with counts
   - Color-code by severity
   - Click to see full details

### Example UI Component

```tsx
<TableCell>
  <div className="space-y-1">
    {barangay.unawarenessReasons.map((item, idx) => (
      <Badge key={idx} variant="outline" className="text-xs">
        {item.reason} ({item.count})
      </Badge>
    ))}
  </div>
</TableCell>
```

---

## Data Source

### Database Fields

- **`survey_response.unawareness_reasons`** - JSONB field storing reasons by service
- **`survey_response.non_availment_reasons`** - JSONB field storing reasons by service

### Format

```json
{
  "unawareness_reasons": {
    "financial_admin": "No information campaigns",
    "disaster_prep": "Not interested",
    "safety": "Language barrier"
  },
  "non_availment_reasons": {
    "financial_admin": "Too expensive",
    "social_protection": "Long waiting time"
  }
}
```

---

## Benefits

1. **Actionable Insights:** Understand specific barriers to awareness and usage
2. **Targeted Interventions:** Design solutions based on actual reasons
3. **Comparative Analysis:** Compare barriers across barangays
4. **Resource Allocation:** Prioritize interventions where they're most needed
5. **Evidence-Based:** Data-driven decision making

---

## Future Enhancements

### 1. Trend Analysis
Track how reasons change over time:
- Are information campaigns reducing unawareness?
- Are service improvements reducing non-availment?

### 2. Demographic Breakdown
Show reasons by demographic groups:
- Age groups
- Gender
- Income levels
- Education levels

### 3. Correlation Analysis
Identify patterns:
- Which reasons correlate with low satisfaction?
- Which barriers are most impactful?

### 4. Recommendation Engine
Auto-generate recommendations based on top reasons:
- "Launch information campaign" for high unawareness
- "Review pricing" for "too expensive" feedback

---

## Testing

### To Verify the Integration

1. **Call the API:**
   ```
   GET /api/analytics/service-area-deep-dive?serviceArea=financial&cycleId=1
   ```

2. **Check Response:**
   - Each barangay should have `unawarenessReasons` array
   - Each barangay should have `nonAvailmentReasons` array
   - Arrays should contain top 3 reasons with counts

3. **Verify Filtering:**
   - Reasons should be specific to the selected service area
   - Counts should be accurate

---

## Summary

The Service Area Deep Dive now includes unawareness and non-availment reason analytics, providing deeper insights into barriers to service awareness and usage. This enables more targeted and effective interventions to improve service delivery.

---

## Sign-off

**Implemented by:** Kiro AI Assistant  
**Date:** December 19, 2025  
**Status:** ✅ CONDITIONAL INSIGHTS INTEGRATED INTO SERVICE DEEP DIVE
