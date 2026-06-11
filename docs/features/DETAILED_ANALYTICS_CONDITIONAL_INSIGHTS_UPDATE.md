# Detailed Analytics - Conditional Insights Update

## Summary
Updated the Detailed Analytics view to properly display **unawareness reasons** and **non-availment reasons** from survey responses, making these critical conditional insights more visible and accessible.

**Date:** January 22, 2026

---

## What Changed

### 1. Enhanced Response Cards
Each survey response now shows badges indicating:
- **Unawareness Count**: Number of services the respondent is unaware of
- **Non-Availment Count**: Number of services the respondent didn't use

**Example:**
```
Survey #10-2025-0001  [100% Complete]  [85% Satisfied]  [2 Unawareness]  [1 Non-Availment]
```

### 2. Highlighted Conditional Insights in Expanded View
When expanding a response, unawareness and non-availment reasons are now:
- **Separated from regular questions**
- **Highlighted with colored backgrounds**:
  - 🔵 Blue for Unawareness Reasons
  - 🟠 Orange for Non-Availment Reasons
- **Displayed with icons** for quick visual identification

### 3. Section Summary Badges
Each section now shows a count of conditional insights:
```
Financial Administration  [2 Unawareness]  [1 Non-Availment]
```

### 4. Enhanced Detail Modal
The full-screen detail modal now prominently displays:
- Unawareness reasons in blue-highlighted boxes
- Non-availment reasons in orange-highlighted boxes
- Clear separation from regular survey questions

---

## Visual Structure

### Before
```
Section: Financial Administration
  - awarenessFinancial: Hindi
  - financial_unawareness_reason: Walang impormasyon
  - usedFinancialInfo: Hindi
  - financial_non_availment_reason: Walang oras
  - satisfactionFinancial: 3
```

### After
```
Section: Financial Administration  [1 Unawareness]  [1 Non-Availment]

Regular Questions:
  - awarenessFinancial: Hindi
  - usedFinancialInfo: Hindi
  - satisfactionFinancial: 3

🔵 Unawareness Reasons:
  - Why unaware of financial services: Walang impormasyon

🟠 Non-Availment Reasons:
  - Why didn't use financial services: Walang oras
```

---

## Technical Implementation

### File Modified
- `src/components/analytics/DetailedResponsesView.tsx`

### Key Changes

#### 1. Data Categorization
```typescript
// Extract and categorize questions
const unawarenessReasons: Array<{key: string, value: any}> = []
const nonAvailmentReasons: Array<{key: string, value: any}> = []
const regularData: Array<{key: string, value: any}> = []

Object.entries(section.data).forEach(([key, value]) => {
  if (key.includes('unawareness_reason')) {
    unawarenessReasons.push({key, value})
  } else if (key.includes('non_availment_reason')) {
    nonAvailmentReasons.push({key, value})
  } else {
    regularData.push({key, value})
  }
})
```

#### 2. Badge Counters
```typescript
// Count conditional insights
let unawarenessCount = 0
let nonAvailmentCount = 0
response.sections?.forEach(section => {
  if (section.data && typeof section.data === 'object') {
    Object.keys(section.data).forEach(key => {
      if (key.includes('unawareness_reason')) unawarenessCount++
      if (key.includes('non_availment_reason')) nonAvailmentCount++
    })
  }
})
```

#### 3. Styled Display Components
```tsx
{/* Unawareness Reasons */}
{unawarenessReasons.length > 0 && (
  <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
    <div className="flex items-center gap-2 mb-2">
      <AlertCircle className="w-4 h-4 text-blue-600" />
      <span className="font-semibold text-blue-800 text-sm">
        Unawareness Reasons
      </span>
    </div>
    {/* Display reasons */}
  </div>
)}
```

---

## Use Cases

### For Field Supervisors
**Quickly identify problematic responses:**
- Scan response list for high unawareness/non-availment counts
- Identify patterns in specific barangays
- Follow up with interviewers on data quality

### For Administrators
**Understand service gaps:**
- Export responses with high conditional insight counts
- Analyze common reasons for unawareness
- Identify barriers to service availment

### For Policy Makers
**Data-driven decisions:**
- See exactly why residents don't know about services
- Understand why residents don't use available services
- Target interventions based on specific reasons

---

## Example Scenarios

### Scenario 1: High Unawareness
**Response shows:**
- 4 Unawareness badges
- Reasons: "Walang impormasyon", "Hindi alam kung saan", etc.

**Action:** Improve information dissemination campaigns

### Scenario 2: High Non-Availment
**Response shows:**
- 3 Non-Availment badges
- Reasons: "Masyadong malayo", "Walang oras", "Mahirap ang proseso"

**Action:** Address accessibility and process barriers

### Scenario 3: Mixed Issues
**Response shows:**
- 2 Unawareness + 2 Non-Availment
- Indicates both awareness and accessibility problems

**Action:** Comprehensive intervention needed

---

## Benefits

### 1. Improved Visibility
- Conditional insights no longer buried in section data
- Quick visual identification with color coding
- Badge counts for at-a-glance assessment

### 2. Better Data Quality
- Easier to spot missing or incomplete conditional data
- Supervisors can quickly verify interviewer compliance
- Identify responses needing follow-up

### 3. Enhanced Analysis
- Export filtered by conditional insight counts
- Compare unawareness vs non-availment patterns
- Track trends over time

### 4. User Experience
- Cleaner, more organized display
- Logical grouping of related information
- Consistent with other analytics views

---

## Related Features

### Service Area Deep Dive
Shows aggregated unawareness and non-availment reasons across all barangays for each service area.

**Location:** Dashboard → Analytics → Service Area Deep Dive

### Conditional Insights Chart
Provides system-wide analytics on unawareness and non-availment patterns.

**Location:** Dashboard → Analytics → Conditional Insights

### Report Card
Displays barangay-specific conditional insights in the comprehensive print view.

**Location:** Report Card → Service Area Details

---

## Testing Checklist

- [x] Unawareness reasons display correctly
- [x] Non-availment reasons display correctly
- [x] Badge counts are accurate
- [x] Color coding is consistent
- [x] Expanded view shows categorized data
- [x] Detail modal displays highlighted sections
- [x] No TypeScript errors
- [x] Responsive on mobile devices
- [x] Export includes conditional data

---

## Future Enhancements

### Planned Features:
1. **Filter by Conditional Insights**
   - Filter responses with unawareness > X
   - Filter responses with non-availment > X
   - Combined filters

2. **Conditional Insight Analytics**
   - Most common unawareness reasons
   - Most common non-availment reasons
   - Trend analysis over cycles

3. **Bulk Actions**
   - Flag responses for follow-up
   - Assign to supervisors for review
   - Export conditional insights only

4. **Visualization**
   - Charts showing reason distribution
   - Heatmap of conditional insights by barangay
   - Timeline of conditional insight trends

---

## Support

For questions or issues:
- Check the main analytics documentation: `ANALYTICS_DASHBOARD_DOCUMENTATION.md`
- Review aggregated view explanation: `AGGREGATED_VIEW_EXPLANATION.md`
- Contact system administrator

---

**Document Version:** 1.0  
**Last Updated:** January 22, 2026  
**Related Files:**
- `src/components/analytics/DetailedResponsesView.tsx`
- `docs/ANALYTICS_DASHBOARD_DOCUMENTATION.md`
- `docs/AGGREGATED_VIEW_EXPLANATION.md`
