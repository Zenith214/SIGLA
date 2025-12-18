# Aggregated View - Detailed Explanation

## What is the Aggregated View?

The **Aggregated View** is one of four data formats available in the Detailed Analytics tab. It provides **statistical summaries** of survey responses by grouping and analyzing data across all respondents.

**Location:** Dashboard → Analytics Tab → Detailed Analytics → Format: "Aggregated"

---

## Purpose

Instead of showing individual survey responses (like the "Detailed" format), the Aggregated View shows:
- **How many people answered each question**
- **What answers were most common**
- **Statistical analysis** (averages, min/max, median) for numeric questions
- **Completion rates** for each survey section

Think of it as a **bird's-eye view** of your survey data that answers questions like:
- "How many people said 'Yes' to awareness of financial programs?"
- "What's the average satisfaction score for disaster preparedness?"
- "Which answer was most popular for each question?"

---

## How It Works

### Data Flow

```
User Selects "Aggregated" Format
    ↓
API Query: Get all survey responses + sections
    ↓
Group by Section (financial, disaster, safety, etc.)
    ↓
For each section:
  - Count total responses
  - Count completed responses
  - Extract all questions and answers
    ↓
For each question:
  - Count how many times each answer appears
  - Calculate statistics (if numeric)
    ↓
Return aggregated summary
```

### Example Query

```sql
SELECT 
  sr.response_id,
  ss.section_key,        -- e.g., 'financial', 'disaster'
  ss.section_name,       -- e.g., 'Financial Administration'
  ss.status,             -- 'completed' or 'in_progress'
  ss.data                -- JSONB with all answers
FROM survey_response sr
LEFT JOIN survey_section ss ON sr.response_id = ss.response_id
WHERE sr.survey_cycle_id = 1
  AND sr.status IN ('completed', 'submitted')
ORDER BY sr.response_id, ss.section_key
```

---

## Response Structure

### Top Level
```json
{
  "aggregated": {
    "sections": { ... },           // Section-level summaries
    "questions": { ... },          // Question-level summaries
    "totalResponses": 150,         // Total survey responses
    "malformedDataCount": 0,       // Excluded bad data (if any)
    "warning": "..."               // Warning message (if any)
  }
}
```

### Section Aggregations

Shows summary for each survey section:

```json
"sections": {
  "financial": {
    "name": "Financial Administration",
    "totalResponses": 150,        // How many people reached this section
    "completedResponses": 145,    // How many completed it
    "questions": {}               // (not used in current implementation)
  },
  "disaster": {
    "name": "Disaster Preparedness",
    "totalResponses": 150,
    "completedResponses": 148,
    "questions": {}
  }
  // ... more sections
}
```

**What this tells you:**
- **Completion Rate:** 145/150 = 96.7% completed Financial section
- **Drop-off:** 5 people didn't complete Financial section
- **Section Performance:** Which sections have highest completion

### Question Aggregations

Shows detailed analysis for each question:

```json
"questions": {
  "financial_awarenessProjects": {
    "section": "financial",
    "question": "awarenessProjects",
    "responses": ["Oo", "Oo", "Hindi", "Oo", ...],  // All 150 answers
    "valueCount": {
      "Oo": 120,      // 120 people said "Yes"
      "Hindi": 30     // 30 people said "No"
    },
    "statistics": null  // Only for numeric questions
  },
  "financial_satisfactionProjects": {
    "section": "financial",
    "question": "satisfactionProjects",
    "responses": ["4", "5", "3", "4", "5", ...],
    "valueCount": {
      "1": 5,
      "2": 10,
      "3": 30,
      "4": 60,
      "5": 45
    },
    "statistics": {
      "count": 150,
      "mean": 4.1,      // Average satisfaction: 4.1/5
      "min": 1,
      "max": 5,
      "median": 4
    }
  }
}
```

**What this tells you:**
- **Most Common Answer:** "Oo" (Yes) - 120 out of 150 (80%)
- **Distribution:** How answers are spread out
- **Average Score:** 4.1/5 satisfaction (82%)
- **Range:** Scores from 1 to 5
- **Median:** Middle value is 4

---

## Real-World Example

### Scenario: Analyzing Financial Administration Section

**Question 1: "Are you aware of barangay projects?"**
```json
"financial_awarenessProjects": {
  "valueCount": {
    "Oo": 120,      // 80% aware
    "Hindi": 30     // 20% not aware
  }
}
```
**Insight:** 80% awareness rate - good, but 20% need more information

**Question 2: "Have you benefited from projects?"**
```json
"financial_benefitedProjects": {
  "valueCount": {
    "Oo": 90,       // 60% benefited
    "Hindi": 60     // 40% didn't benefit
  }
}
```
**Insight:** Of 150 people, 90 benefited (60% availment rate)

**Question 3: "How satisfied are you?" (1-5 scale)**
```json
"financial_satisfactionProjects": {
  "valueCount": {
    "1": 5,   // Very dissatisfied
    "2": 10,  // Dissatisfied
    "3": 30,  // Neutral
    "4": 60,  // Satisfied
    "5": 45   // Very satisfied
  },
  "statistics": {
    "mean": 4.1,
    "median": 4
  }
}
```
**Insight:** Average 4.1/5 (82%) satisfaction - most people satisfied

**Question 4: "Does this need action?"**
```json
"financial_nfaBinaryProjects": {
  "valueCount": {
    "Oo": 25,       // 17% need action
    "Hindi": 125    // 83% don't need action
  }
}
```
**Insight:** Only 17% say action needed - aligns with high satisfaction

---

## Use Cases

### 1. Quick Overview
**Question:** "What's the overall sentiment?"
**Answer:** Look at satisfaction statistics across all sections
```json
"financial_satisfactionProjects": { "mean": 4.1 }
"disaster_satisfactionDisasterInfo": { "mean": 3.8 }
"safety_satisfactionTanods": { "mean": 4.3 }
```
**Insight:** Safety scores highest (4.3), Disaster needs improvement (3.8)

### 2. Identify Popular Answers
**Question:** "What do most people say?"
**Answer:** Look at valueCount for highest numbers
```json
"valueCount": {
  "Improve response time": 45,
  "More training needed": 30,
  "Better equipment": 25
}
```
**Insight:** "Improve response time" is the top suggestion (45 people)

### 3. Find Problem Areas
**Question:** "Which sections have low completion?"
**Answer:** Compare totalResponses vs completedResponses
```json
"financial": { "totalResponses": 150, "completedResponses": 145 }  // 96.7%
"disaster": { "totalResponses": 150, "completedResponses": 120 }   // 80%
```
**Insight:** Disaster section has 20% drop-off - investigate why

### 4. Statistical Analysis
**Question:** "What's the distribution of scores?"
**Answer:** Look at statistics for numeric questions
```json
"statistics": {
  "mean": 3.5,    // Average
  "median": 4,    // Middle value
  "min": 1,       // Lowest score
  "max": 5        // Highest score
}
```
**Insight:** Median (4) > Mean (3.5) suggests some low outliers pulling average down

---

## Comparison with Other Formats

### Summary Format
- **Purpose:** High-level overview
- **Shows:** Total responses, barangay stats, section completion
- **Best for:** Quick dashboard view

### Detailed Format
- **Purpose:** Individual responses
- **Shows:** Each person's complete survey
- **Best for:** Reviewing specific responses, quality control

### Aggregated Format ⭐
- **Purpose:** Statistical analysis
- **Shows:** Answer distributions, averages, counts
- **Best for:** Understanding trends, finding patterns

### Export Format
- **Purpose:** Data download
- **Shows:** Flattened data for Excel/CSV
- **Best for:** External analysis, reporting

---

## How to Read the Data

### For Yes/No Questions
```json
"valueCount": {
  "Oo": 120,
  "Hindi": 30
}
```
**Calculation:**
- Yes Rate: 120/150 = 80%
- No Rate: 30/150 = 20%

### For Rating Questions (1-5)
```json
"statistics": {
  "mean": 4.1,
  "median": 4
}
```
**Interpretation:**
- Mean 4.1 = 82% satisfaction (4.1/5 × 100)
- Median 4 = Most people gave 4 or higher
- If mean < median: Some low scores pulling average down
- If mean > median: Some high scores pulling average up

### For Open-Ended Questions
```json
"valueCount": {
  "Need better roads": 25,
  "More street lights": 20,
  "Improve drainage": 15,
  "Better waste management": 10
}
```
**Analysis:**
- Top concern: Roads (25 mentions)
- Second: Street lights (20 mentions)
- Total unique suggestions: 4 categories

---

## Common Questions

### Q: Why use Aggregated instead of Detailed?
**A:** Aggregated is faster and easier to understand for large datasets. Instead of scrolling through 150 individual responses, you see "120 people said Yes" instantly.

### Q: Can I see individual responses?
**A:** No, that's what "Detailed" format is for. Aggregated only shows summaries.

### Q: What if I want to export this data?
**A:** Use "Export" format to download as CSV/JSON for Excel analysis.

### Q: Why are some responses excluded?
**A:** If `malformedDataCount > 0`, some responses had corrupted data and were skipped. This is rare and logged for debugging.

### Q: How is this different from Dashboard Summary?
**A:** Dashboard Summary shows high-level KPIs (overall satisfaction, leaderboard). Aggregated shows question-by-question breakdown.

---

## Technical Details

### Performance
- **Query Time:** 2-5 seconds for 150 responses
- **Data Size:** ~50-100KB JSON response
- **Caching:** Not cached (real-time data)

### Filtering
You can filter aggregated data by:
- **Barangay:** `?barangayId=10`
- **Date Range:** `?startDate=2024-01-01&endDate=2024-12-31`
- **Awardee Status:** `?include_non_awardees=true`

### Data Quality
- Validates JSONB data structure
- Skips malformed responses
- Logs warnings for debugging
- Returns count of excluded data

---

## Example API Call

```bash
# Get aggregated analytics for active cycle
GET /api/survey-analytics?format=aggregated

# Filter by barangay
GET /api/survey-analytics?format=aggregated&barangayId=10

# Include non-awardees
GET /api/survey-analytics?format=aggregated&include_non_awardees=true
```

---

## Visualization Ideas

The aggregated data is perfect for creating:

1. **Bar Charts:** Show answer distribution
   - X-axis: Answer options
   - Y-axis: Count of responses

2. **Pie Charts:** Show percentage breakdown
   - Slices: Each answer option
   - Size: Percentage of total

3. **Line Charts:** Show trends over time
   - X-axis: Survey cycles
   - Y-axis: Average satisfaction

4. **Heat Maps:** Show section performance
   - Rows: Sections
   - Columns: Metrics (completion, satisfaction)
   - Color: Performance level

---

## Summary

**Aggregated View** transforms individual survey responses into meaningful statistics:

✅ **Counts:** How many people gave each answer  
✅ **Percentages:** What % chose each option  
✅ **Averages:** Mean satisfaction scores  
✅ **Distributions:** How answers are spread out  
✅ **Completion:** Which sections people finish  

**Use it when you want to:**
- Understand overall trends
- Find most common answers
- Calculate satisfaction rates
- Identify problem areas
- Make data-driven decisions

**Don't use it when you want to:**
- See individual responses (use "Detailed")
- Export raw data (use "Export")
- Quick dashboard view (use "Summary")

---

**Document Version:** 1.0  
**Last Updated:** December 2, 2024  
**Related:** `ANALYTICS_TAB_TECHNICAL_DOCUMENTATION.md`
