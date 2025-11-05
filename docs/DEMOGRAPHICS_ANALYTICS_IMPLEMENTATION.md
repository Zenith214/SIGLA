# Respondent Demographics Analytics Implementation

## Overview
Added comprehensive demographic analysis to the analytics dashboard, providing insights into survey participant characteristics including gender, age groups, educational attainment, household income, and purok/sitio distribution.

## Changes Made

### 1. Database Schema Update ✅
**Added Column:**
```sql
ALTER TABLE survey_response 
ADD COLUMN respondent_purok VARCHAR(50);
```

**Purpose:** Store the purok or sitio where the respondent resides.

---

### 2. Frontend Form Updates ✅

**File:** `src/app/survey/forms/sections/respondent-demographics.tsx`

**Added Purok Input Field:**
```typescript
<input
  type="text"
  value={demographics.purok}
  onChange={(e) => handleDemographicsChange("purok", e.target.value)}
  placeholder="Enter purok or sitio name (e.g., Purok 1, Sitio Riverside)"
  className="w-full px-3 py-2 border border-gray-300 rounded-lg..."
/>
```

**Features:**
- Text input for flexible purok naming
- Optional field (not required)
- Helpful placeholder text
- Clear label and description

---

### 3. Data Model Updates ✅

**File:** `src/app/survey/forms/page.tsx`

**Updated SurveyData Interface:**
```typescript
respondentDemographics: {
  age: number
  birthdate: string
  gender: string
  educationalAttainment: string
  householdIncome: string
  purok: string  // NEW
}
```

**Initial State:**
```typescript
respondentDemographics: {
  age: 0,
  birthdate: "",
  gender: "",
  educationalAttainment: "",
  householdIncome: "",
  purok: ""  // NEW
}
```

---

### 4. API Updates ✅

**File:** `src/app/api/survey-responses/route.ts`

**Updated INSERT Query:**
```sql
INSERT INTO survey_response (
  survey_number, barangay_id, interviewer_id, survey_cycle_id, respondent_name,
  respondent_age, respondent_gender, respondent_educational_attainment,
  respondent_household_income, respondent_purok,  -- NEW
  location_lat, location_lng, ...
)
```

**Added Parameter:**
```typescript
respondentDemographics?.purok || null
```

---

### 5. New Analytics API Endpoint ✅

**File:** `src/app/api/analytics/demographics/route.ts`

**Endpoint:** `GET /api/analytics/demographics`

**Query Parameters:**
- `barangayId` (optional) - Filter by specific barangay
- `cycleId` (optional) - Filter by specific cycle (defaults to active cycle)

**Response Structure:**
```json
{
  "success": true,
  "cycleId": 18,
  "barangayId": 6,
  "totalRespondents": 150,
  "demographics": {
    "gender": [
      { "label": "Female", "count": 85, "percentage": "56.7" },
      { "label": "Male", "count": 60, "percentage": "40.0" },
      { "label": "LGBTQI", "count": 5, "percentage": "3.3" }
    ],
    "ageGroups": [
      { "label": "25-34", "count": 45, "percentage": "30.0" },
      { "label": "35-44", "count": 40, "percentage": "26.7" },
      ...
    ],
    "education": [...],
    "income": [...],
    "purok": [...]
  }
}
```

**Features:**
- Automatic percentage calculation
- Sorted by count (descending)
- Handles null/missing values
- Cycle-aware filtering
- Barangay-specific filtering

---

### 6. Demographics Analytics Component ✅

**File:** `src/components/analytics/DemographicsAnalytics.tsx`

**Component:** `<DemographicsAnalytics />`

**Props:**
```typescript
interface DemographicsAnalyticsProps {
  barangayId?: number
  cycleId?: number
}
```

**Features:**

#### Visual Elements:
- **Header Card:** Total respondents with gradient background
- **Distribution Cards:** 5 separate cards for each demographic category
- **Progress Bars:** Visual representation of percentages
- **Color-Coded:** Different colors for each category
  - Gender: Purple
  - Age Groups: Blue
  - Education: Green
  - Income: Yellow
  - Purok: Indigo

#### Key Insights Section:
- Most represented gender
- Largest age group
- Most common education level
- Automatic calculation from data

#### Responsive Design:
- Mobile: Single column
- Tablet: 2 columns
- Desktop: 2-3 columns

---

## Data Analysis Capabilities

### 1. Gender Distribution
**Categories:**
- Male
- Female
- LGBTQI
- Prefer not to say

**Insights:**
- Gender balance in survey participation
- Representation of different gender identities
- Comparison across barangays

### 2. Age Group Distribution
**Categories:**
- Under 18
- 18-24
- 25-34
- 35-44
- 45-54
- 55-64
- 65+

**Insights:**
- Age demographics of respondents
- Generational representation
- Target age groups for specific services

### 3. Educational Attainment
**Categories:**
- No formal education
- Elementary (1-6)
- Elementary graduate
- High school (1-4)
- High school graduate
- Vocational/Technical
- College (1-4)
- College graduate
- Post-graduate

**Insights:**
- Education levels in the community
- Literacy and education access
- Correlation with service satisfaction

### 4. Household Income
**Categories:**
- ₱0 – No income
- Below ₱10,000
- ₱10,000 - ₱20,000
- ₱20,001 - ₱30,000
- ₱30,001 - ₱50,000
- ₱50,001 - ₱75,000
- ₱75,001 - ₱100,000
- Above ₱100,000
- Prefer not to say

**Insights:**
- Economic profile of respondents
- Income distribution patterns
- Socioeconomic context for service needs

### 5. Purok/Sitio Distribution
**Features:**
- Free-text input (flexible naming)
- Shows distribution across puroks
- Identifies underrepresented areas
- Helps with geographic coverage analysis

**Insights:**
- Geographic distribution of respondents
- Coverage gaps in survey collection
- Purok-specific service needs

---

## Usage Examples

### In Analytics Dashboard:

```typescript
import { DemographicsAnalytics } from '@/components/analytics/DemographicsAnalytics'

// Show demographics for specific barangay
<DemographicsAnalytics barangayId={6} />

// Show demographics for specific cycle
<DemographicsAnalytics cycleId={18} />

// Show demographics for specific barangay in specific cycle
<DemographicsAnalytics barangayId={6} cycleId={18} />

// Show demographics for all barangays in active cycle
<DemographicsAnalytics />
```

### API Usage:

```typescript
// Get demographics for barangay 6
fetch('/api/analytics/demographics?barangayId=6')

// Get demographics for cycle 18
fetch('/api/analytics/demographics?cycleId=18')

// Get demographics for barangay 6 in cycle 18
fetch('/api/analytics/demographics?barangayId=6&cycleId=18')

// Get demographics for active cycle (all barangays)
fetch('/api/analytics/demographics')
```

---

## Benefits

### For Administrators:
✅ **Understand Survey Participation** - See who is responding to surveys
✅ **Identify Gaps** - Find underrepresented demographics
✅ **Target Outreach** - Focus on specific groups or areas
✅ **Validate Sampling** - Ensure representative sample

### For Analysts:
✅ **Demographic Context** - Understand respondent characteristics
✅ **Correlation Analysis** - Link demographics to satisfaction scores
✅ **Trend Analysis** - Track demographic changes over time
✅ **Geographic Insights** - Purok-level participation patterns

### For Decision Makers:
✅ **Evidence-Based Planning** - Data-driven service improvements
✅ **Equity Assessment** - Ensure all groups are heard
✅ **Resource Allocation** - Target services to specific demographics
✅ **Community Profile** - Comprehensive demographic picture

---

## Technical Details

### Database Query Optimization:
- Uses indexed columns for filtering
- Efficient GROUP BY operations
- Calculated percentages in application layer
- Handles NULL values gracefully

### Performance:
- Single API call for all demographics
- Cached at component level
- Efficient SQL queries with proper indexing
- Minimal data transfer

### Error Handling:
- Graceful fallback for missing data
- Loading states
- Error messages
- Empty state handling

---

## Future Enhancements

### Potential Additions:
- [ ] Comparison between barangays
- [ ] Trend analysis over multiple cycles
- [ ] Export demographics data to CSV/PDF
- [ ] Cross-tabulation (e.g., gender by age group)
- [ ] Statistical significance testing
- [ ] Demographic weighting for analysis
- [ ] Interactive filtering and drill-down
- [ ] Purok-level satisfaction comparison

### Advanced Analytics:
- [ ] Correlation with satisfaction scores
- [ ] Demographic segmentation
- [ ] Predictive modeling based on demographics
- [ ] Geographic heat maps by purok
- [ ] Time-series demographic trends

---

## Testing Checklist

- [x] Database column added successfully
- [x] Form accepts purok input
- [x] Data saves to database correctly
- [x] API returns correct demographics
- [x] Component renders all categories
- [x] Percentages calculate correctly
- [x] Progress bars display properly
- [x] Responsive design works
- [x] Loading states function
- [x] Error handling works
- [x] Empty states display correctly

---

## Migration Notes

### For Existing Data:
- `respondent_purok` column allows NULL values
- Existing records will have NULL for purok
- Shows as "Not specified" in analytics
- No data migration required

### For New Surveys:
- Purok field is optional
- Interviewers can leave blank if unknown
- Recommended to collect for better analysis

---

## Conclusion

The Respondent Demographics Analytics feature provides comprehensive insights into survey participant characteristics, enabling data-driven decision-making and ensuring representative sampling across all demographic groups and geographic areas.

**Status:** ✅ Fully Implemented and Ready for Use

**Last Updated:** 2025-11-05
