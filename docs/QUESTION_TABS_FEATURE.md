# Question Response Analysis - Tabbed Interface

## Overview

Added a tabbed interface to the Question Response Analysis section in the Aggregated View, making it easier to browse questions by service area instead of loading all questions at once.

**Location:** Dashboard → Analytics → Detailed Analytics → Aggregated Format

---

## Features

### 1. Service Area Tabs

Questions are now organized into 7 tabs:

1. **All** - Shows all questions from all sections
2. **Financial** - Financial Administration questions
3. **Disaster** - Disaster Preparedness questions
4. **Safety** - Safety & Peace Order questions
5. **Social** - Social Protection questions
6. **Business** - Business Friendliness questions
7. **Environment** - Environmental Management questions

### 2. Improved Display

Each question card now shows:
- ✅ **Human-readable label** (e.g., "Availment: Received Business Support")
- ✅ **Section name** (e.g., "Business Friendliness")
- ✅ **Question type badge** (awareness, availment, satisfaction, nfa, suggestion)
- ✅ **Description** (full question text if available)
- ✅ **Response count**
- ✅ **Statistics** (for numeric questions: mean, median, min, max)
- ✅ **Value distribution** (sorted by count, descending)

### 3. Better Statistics Display

Statistics are now shown in a formatted grid:
```
Statistics:
Mean: 4.12    Median: 4.00
Min: 1        Max: 5
```

### 4. Sorted Value Distribution

Answer counts are now sorted from most common to least common:
```
Yes: 119  No: 32  (instead of random order)
```

---

## Before vs After

### Before
- All 80+ questions loaded at once
- Hard to find specific questions
- Technical field names (e.g., `business_receivedBusinessSupport`)
- "Show All" button to load everything
- No organization by section

### After
- Questions organized by service area tabs
- Easy navigation between sections
- Human-readable labels (e.g., "Availment: Received Business Support")
- Each tab loads only relevant questions
- Clear section organization

---

## Usage

### Navigate by Service Area

1. Go to **Dashboard → Analytics → Detailed Analytics**
2. Select **"Aggregated"** format
3. Scroll to **"Question Response Analysis"** card
4. Click on any tab to view questions for that service area:
   - **All** - See all questions (default)
   - **Financial** - Financial administration questions only
   - **Disaster** - Disaster preparedness questions only
   - **Safety** - Safety & peace order questions only
   - **Social** - Social protection questions only
   - **Business** - Business friendliness questions only
   - **Environment** - Environmental management questions only

### Question Count

Each tab shows how many questions are displayed:
```
Showing 10 questions
```

---

## Technical Implementation

### Component Changes

**File:** `src/components/analytics/SurveyAnalyticsDashboard.tsx`

**Added:**
- Tabs component from shadcn/ui
- `activeSectionTab` state to track selected tab
- Tab filtering logic based on question key prefix
- Improved question card layout
- Statistics grid display
- Sorted value distribution

**Removed:**
- `showAllQuestions` state (no longer needed)
- "Show All" button (replaced by tabs)

### Tab Filtering Logic

```typescript
const filteredQuestions = Object.entries(analyticsData.aggregated?.questions || {})
  .filter(([key]) => section === 'all' || key.startsWith(section + '_'))
```

Questions are filtered by checking if the key starts with the section name:
- `financial_awarenessProjects` → Financial tab
- `disaster_awarenessDisasterInfo` → Disaster tab
- `business_receivedBusinessSupport` → Business tab
- etc.

---

## Benefits

### 1. Better Performance
- Only renders questions for the active tab
- Faster initial load (shows "All" tab by default)
- Reduced DOM elements

### 2. Better UX
- Easy to find questions by service area
- Clear organization
- No overwhelming list of 80+ questions
- Intuitive navigation

### 3. Better Readability
- Human-readable labels
- Clear section context
- Formatted statistics
- Sorted value counts

### 4. Mobile Friendly
- Tabs wrap on smaller screens
- Responsive grid layout
- Touch-friendly tab buttons

---

## Question Count by Section

Typical distribution:
- **Financial:** ~20 questions
- **Disaster:** ~10 questions
- **Safety:** ~15 questions
- **Social:** ~15 questions
- **Business:** ~10 questions
- **Environmental:** ~10 questions
- **Total:** ~80 questions

---

## Example: Business Tab

When you click the "Business" tab, you'll see:

```
Awareness: Business Clearance Process
Business Friendliness | awareness
Are you aware of the business clearance process?
150 responses
Value Distribution: Yes: 130  No: 20

Availment: Obtained Business Clearance
Business Friendliness | availment
Have you obtained a business clearance?
150 responses
Value Distribution: Yes: 95  No: 55

Satisfaction: Business Clearance Process
Business Friendliness | satisfaction
How satisfied are you with the business clearance process?
150 responses
Statistics:
Mean: 4.12    Median: 4.00
Min: 1        Max: 5
Value Distribution: 5: 45  4: 60  3: 30  2: 10  1: 5

... (more business questions)

Showing 10 questions
```

---

## Responsive Design

### Desktop (Large Screens)
- 7 tabs in a single row
- Full question cards with all details
- Grid layout for statistics

### Tablet (Medium Screens)
- Tabs may wrap to 2 rows
- Compact question cards
- Responsive statistics layout

### Mobile (Small Screens)
- Tabs in 4 columns (All, Financial, Disaster, Safety on first row)
- Stacked question cards
- Single column statistics

---

## Future Enhancements

Potential improvements:
1. **Search within tab** - Filter questions by keyword
2. **Export by section** - Download questions for specific service area
3. **Question type filter** - Show only awareness, availment, or satisfaction questions
4. **Comparison view** - Compare same question across different barangays
5. **Chart visualization** - Visual charts for value distribution

---

## Related Features

- **Question Labels:** `src/utils/questionLabels.ts`
- **Aggregated View:** `docs/AGGREGATED_VIEW_EXPLANATION.md`
- **Question Labels Improvement:** `docs/QUESTION_LABELS_IMPROVEMENT.md`

---

**Document Version:** 1.0  
**Last Updated:** December 2, 2024  
**Status:** ✅ Implemented
