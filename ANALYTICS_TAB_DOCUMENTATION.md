# Analytics Tab Documentation

## Overview

The Analytics Tab in the main dashboard provides comprehensive survey data analysis and insights for the PULSE (Public Understanding and Local Service Evaluation) system. It enables administrators and stakeholders to visualize, analyze, and understand citizen satisfaction data across multiple dimensions including service areas, demographics, and geographic locations.

## Accessing the Analytics Tab

The Analytics Tab is accessible from the main dashboard navigation bar. Users can toggle between the **Map View** and **Analytics View** using the view switcher in the top navigation.

### Prerequisites
- An active survey cycle must be configured
- Survey responses must be collected and marked as "completed" or "submitted"
- User must have appropriate permissions to view analytics data

---

## Analytics Tab Structure

The Analytics Tab consists of **4 main views**, each providing different analytical perspectives:

1. **Dashboard Summary** - High-level KPIs and overview
2. **Service Area Deep Dive** - Detailed analysis by service area
3. **Demographics Analytics** - Respondent demographic breakdowns
4. **Detailed Analytics** - Advanced survey analytics dashboard

---

## 1. Dashboard Summary View

### Purpose
Provides a high-level overview of survey performance, satisfaction trends, and key performance indicators (KPIs) across all barangays.

### Key Components

#### A. Key Performance Indicators (KPIs)
Four primary metrics displayed as cards:

**Overall Satisfaction**
- Percentage representing average satisfaction across all completed surveys
- Calculated from the "Overall Satisfaction" question in survey responses
- Supports both binary (Yes/No) and 5-point scale formats
- Binary: Yes = 100%, No = 0%
- 5-point scale: Converted to percentage (1=20%, 2=40%, 3=60%, 4=80%, 5=100%)

**Need for Action**
- Inverse of satisfaction (100% - satisfaction)
- Indicates areas requiring intervention or improvement
- Higher percentage = more urgent need for action

**Responses Progress**
- Shows current responses vs target responses
- Format: `[Current] / [Target]`
- Target calculated as: Number of survey targets × 150 responses per barangay

**Barangays Coverage**
- Shows barangays with 100% completion vs total barangays with survey targets
- Format: `[Completed] / [Total]`
- Only counts barangays that have reached 100% of their survey target

#### B. Leaderboard
Displays top 5 and bottom 5 performing barangays based on satisfaction scores.

**Top 5 Barangays**
- Highest satisfaction scores
- Displayed with green background highlighting
- Shows barangay name and satisfaction percentage

**Bottom 5 Barangays**
- Lowest satisfaction scores
- Displayed with red background highlighting
- Indicates priority areas for intervention

**Trend Indicators**
- Up arrow (↑): Improving satisfaction
- Down arrow (↓): Declining satisfaction
- Horizontal line (—): Stable satisfaction

#### C. Satisfaction Trend Chart
Line chart showing satisfaction trends across multiple survey cycles.

**Data Points**
- X-axis: Survey cycle names (e.g., "Cycle 1 2024", "Cycle 2 2024")
- Y-axis: Average satisfaction percentage (0-100%)
- Shows historical progression of citizen satisfaction
- Helps identify long-term trends and patterns

**Calculation Method**
- Aggregates all completed surveys per cycle
- Calculates average satisfaction across all barangays
- Only includes barangays with completed surveys

#### D. Service Area Performance Chart
Horizontal bar chart showing satisfaction levels for each of the 6 service areas.

**Service Areas Tracked**
1. Financial Administration
2. Disaster Preparedness
3. Safety & Peace Order
4. Social Protection
5. Business Friendliness
6. Environmental Management

**Calculation Method**
- Extracts satisfaction scores from each service area section
- Aggregates all satisfaction questions within each section
- Converts to percentage (0-100%)
- Displays average satisfaction per service area

### Data Refresh
- Data is cached for 5 minutes to improve performance
- Automatically refreshes when switching between cycles
- Manual refresh available by re-selecting the active cycle

---

## 2. Service Area Deep Dive View

### Purpose
Provides detailed analysis of individual service areas with barangay-level rankings and performance metrics.

### Key Components

#### A. Service Area Selector
Grid of 6 buttons allowing users to select which service area to analyze:
- Financial Administration
- Disaster Preparedness
- Safety & Peace Order
- Social Protection
- Business Friendliness
- Environmental Management

#### B. Barangay Rankings Table
Comprehensive table showing all barangays ranked by satisfaction for the selected service area.

**Columns**

1. **Rank** - Position based on satisfaction score (1 = highest)
2. **Barangay** - Name of the barangay
3. **Awareness %** - Percentage of respondents aware of the service
   - Calculated from "awareness" questions in the service section
   - "Yes"/"Oo" responses counted as aware
4. **Availment %** - Percentage of respondents who availed the service
   - Calculated from "NFA" (Need for Action) binary questions
   - "No"/"Hindi" responses indicate service was availed (no action needed)
5. **Satisfaction %** - Average satisfaction with the service
   - Primary ranking metric
   - Color-coded: Green (≥70%), Yellow (50-69%), Red (<50%)
6. **Need for Action %** - Inverse of satisfaction
   - Indicates urgency of intervention needed
   - Color-coded: Red (≥70%), Yellow (50-69%), Green (<50%)
7. **Responses** - Number of completed survey responses for this barangay
8. **Trend** - Direction of change (up/down/stable)

**Color Coding System**
- **Green**: Good performance (≥70%)
- **Yellow**: Moderate performance (50-69%)
- **Red**: Poor performance (<50%)

#### C. Action Grid - Priority Matrix
Visual scatter plot showing barangays plotted on two dimensions:

**Axes**
- X-axis: Satisfaction % (0-100%)
- Y-axis: Need for Action % (0-100%)

**Quadrants**
1. **Fix Now** (Bottom-left): Low satisfaction, high need for action - URGENT
2. **Monitor** (Top-left): Low satisfaction, low need for action - Watch closely
3. **Opportunities** (Bottom-right): High satisfaction, high need for action - Potential improvements
4. **Maintain** (Top-right): High satisfaction, low need for action - Keep up good work

**Visual Elements**
- Each barangay represented as a blue dot
- Hover over dots to see barangay name and exact metrics
- Background gradient from red (urgent) to green (good)
- Helps prioritize intervention efforts

### Demographic Filtering (Future Enhancement)
The API supports filtering by:
- Age group
- Gender
- Household income
- Educational attainment

### Data Calculation Details

**Awareness Calculation**
```
Awareness % = (Count of "Yes"/"Oo" responses) / (Total awareness questions) × 100
```

**Availment Calculation**
```
Availment % = (Count of "No"/"Hindi" NFA responses) / (Total NFA questions) × 100
```
*Note: "No" means no action needed, indicating service was availed*

**Satisfaction Calculation**
```
For Binary: Yes = 100%, No = 0%
For 1-5 Scale: (Value / 5) × 100
Average across all satisfaction questions in the section
```

---

## 3. Demographics Analytics View

### Purpose
Analyzes survey respondent demographics and correlates them with satisfaction levels to identify patterns and disparities.

### Key Components

#### A. Summary Cards
Four overview cards showing:
- **Total Respondents**: Total number of completed surveys
- **Age Groups**: Number of different age ranges represented
- **Gender Distribution**: Number of gender categories
- **Income Levels**: Number of income brackets

#### B. Age Distribution & Satisfaction Chart
Dual-axis bar chart showing respondent count and satisfaction by age group.

**Age Groups**
- 18-24 years
- 25-34 years
- 35-44 years
- 45-54 years
- 55-64 years
- 65+ years
- Unknown (if age not provided)

**Metrics**
- Left Y-axis: Number of respondents
- Right Y-axis: Average satisfaction percentage
- Helps identify age-related satisfaction patterns

#### C. Gender Distribution
Combination of pie chart and detailed breakdown.

**Display Elements**
- Pie chart showing proportional distribution
- List showing count and satisfaction for each gender
- Supports multiple gender identities
- Color-coded for visual distinction

**Data Sources**
- Primary: `respondent_demographics` section
- Fallback: `survey_response.gender_identity` field

#### D. Household Income Distribution
Dual-axis bar chart showing respondents and satisfaction by income bracket.

**Income Brackets**
- Below 10,000
- 10,001-20,000
- 20,001-50,000
- Above 50,000
- Not specified

**Analysis Value**
- Identifies income-related satisfaction disparities
- Helps target interventions to specific economic groups
- Reveals equity in service delivery

#### E. Educational Attainment
Dual-axis bar chart showing respondents and satisfaction by education level.

**Education Levels**
- Elementary
- High School
- College
- Post Graduate
- Not specified

**Insights**
- Correlation between education and satisfaction
- Identifies if services meet needs of all education levels
- Helps tailor communication strategies

#### F. Purok/Sitio Distribution
Dual-axis bar chart showing geographic distribution within barangays.

**Features**
- Shows respondent count per purok/sitio
- Displays satisfaction levels by location
- Sorted numerically (Purok 1, Purok 2, etc.)
- Identifies micro-level geographic patterns

#### G. Key Insights Card
Automated insights highlighting:

**Highest Satisfaction**
- Age group with highest satisfaction
- Gender with highest satisfaction
- Exact percentages displayed

**Needs Attention**
- Age group with lowest satisfaction
- Gender with lowest satisfaction
- Priority areas for improvement

### Data Processing

**Satisfaction Calculation for Demographics**
```javascript
// Binary format
if (value includes "yes" or "oo") → 100%
if (value includes "no" or "hindi") → 0%

// 1-5 scale format
satisfaction = (numeric_value / 5) × 100

// Average across all responses in demographic group
```

**Data Sources**
- Age: `survey_response.respondent_age`
- Gender: `respondent_demographics.genderIdentity` or `survey_response.gender_identity`
- Income: `respondent_demographics.householdIncome`
- Education: `respondent_demographics.educationalAttainment`
- Purok: `respondent_demographics.purok` or `survey_response.respondent_purok`
- Satisfaction: `overall.overallSatisfaction`

---

## 4. Detailed Analytics View

### Purpose
Provides advanced survey analytics with comprehensive data exploration capabilities (SurveyAnalyticsDashboard component).

### Features
- Detailed response analysis
- Advanced filtering options
- Custom report generation
- Export capabilities

*Note: This view wraps the SurveyAnalyticsDashboard component which provides extensive analytical tools.*

---

## Technical Architecture

### API Endpoints

#### 1. Dashboard Summary API
**Endpoint**: `/api/analytics/dashboard-summary`

**Query Parameters**
- `cycleId` (optional): Specific survey cycle ID, defaults to active cycle

**Response Structure**
```json
{
  "kpis": {
    "overallSatisfaction": 75.5,
    "overallNeedForAction": 24.5,
    "totalResponses": 1250,
    "targetResponses": 1500,
    "barangaysCovered": 8,
    "totalBarangays": 10
  },
  "leaderboard": {
    "top5": [
      {
        "barangayId": 1,
        "barangayName": "Barangay A",
        "satisfaction": 85.2,
        "trend": "up"
      }
    ],
    "bottom5": [...]
  },
  "trendData": [
    {
      "cycleName": "Cycle 1 2024",
      "cycleYear": 2024,
      "avgSatisfaction": 72.3
    }
  ],
  "serviceAreaPerformance": [
    {
      "serviceArea": "Financial Administration",
      "avgSatisfaction": 78.5
    }
  ]
}
```

#### 2. Service Area Deep Dive API
**Endpoint**: `/api/analytics/service-area-deep-dive`

**Query Parameters**
- `serviceArea` (required): One of: financial, disaster, safety, social, business, environmental
- `cycleId` (optional): Survey cycle ID
- `ageGroup` (optional): Filter by age range (e.g., "25-34")
- `gender` (optional): Filter by gender
- `householdIncome` (optional): Filter by income bracket
- `educationalAttainment` (optional): Filter by education level

**Response Structure**
```json
{
  "rankings": [
    {
      "barangayId": 1,
      "barangayName": "Barangay A",
      "awareness": 85.0,
      "availment": 70.5,
      "satisfaction": 78.2,
      "needForAction": 21.8,
      "responseCount": 150,
      "trend": "stable"
    }
  ]
}
```

#### 3. Demographics API
**Endpoint**: `/api/analytics/demographics`

**Query Parameters**
- `cycleId` (optional): Survey cycle ID

**Response Structure**
```json
{
  "totalRespondents": 1250,
  "ageDistribution": [
    {
      "ageGroup": "25-34",
      "count": 320,
      "satisfaction": 75.5
    }
  ],
  "genderDistribution": [...],
  "incomeDistribution": [...],
  "educationDistribution": [...],
  "purokDistribution": [...]
}
```

### Data Flow

1. **User selects Analytics Tab** → AnalyticsView component loads
2. **Active cycle detected** → CycleDisplay shows current cycle
3. **User selects view** → Corresponding component loads (DashboardSummaryView, ServiceAreaDeepDive, etc.)
4. **Component fetches data** → API call to appropriate endpoint
5. **Data cached** → 5-minute TTL to reduce database load
6. **Charts render** → Chart.js visualizations display data
7. **User interactions** → Filters, selections trigger new API calls

### Database Queries

**Key Tables**
- `survey_response`: Main response records
- `survey_section`: Section-specific data (JSON)
- `survey_cycle`: Cycle definitions
- `barangay`: Geographic data
- `survey_target`: Target settings per barangay

**Performance Optimizations**
- Indexes on `survey_cycle_id`, `barangay_id`, `status`
- JSON field extraction for section data
- Caching layer for frequently accessed data
- Aggregation at database level

---

## Data Calculation Methodologies

### Satisfaction Score Calculation

The system supports two formats for satisfaction responses:

#### Binary Format (Current Standard)
```
Question: "Are you satisfied with this service?"
Responses: "Yes/Oo" or "No/Hindi"

Calculation:
- Yes/Oo → 100% satisfied
- No/Hindi → 0% satisfied
```

#### 5-Point Scale Format (Legacy)
```
Question: "Rate your satisfaction"
Responses: 1-5 scale

Calculation:
- 1 (Very Dissatisfied) → 20%
- 2 (Dissatisfied) → 40%
- 3 (Neutral) → 60%
- 4 (Satisfied) → 80%
- 5 (Very Satisfied) → 100%
```

### Aggregation Methods

**Barangay-Level Satisfaction**
```
1. Get all completed surveys for barangay
2. Extract overall satisfaction from each response
3. Convert to percentage using format rules
4. Calculate average: SUM(satisfaction) / COUNT(responses)
5. Round to 1 decimal place
```

**Service Area Satisfaction**
```
1. Get all completed surveys
2. Extract service section data
3. Find all satisfaction fields in section
4. Convert each to percentage
5. Calculate average across all satisfaction questions
6. Round to 1 decimal place
```

**Overall System Satisfaction**
```
1. Calculate satisfaction for each barangay
2. Average all barangay satisfactions
3. Weight equally (not by response count)
4. Round to 1 decimal place
```

### Need for Action Calculation

```
Need for Action % = 100% - Satisfaction %
```

This inverse relationship means:
- High satisfaction → Low need for action
- Low satisfaction → High need for action

### Awareness Calculation

```
Awareness % = (Count of "Yes"/"Oo" responses to awareness questions) / (Total awareness questions asked) × 100
```

Awareness questions typically ask: "Are you aware of this service?"

### Availment Calculation

```
Availment % = (Count of "No"/"Hindi" responses to NFA questions) / (Total NFA questions asked) × 100
```

**Important**: NFA (Need for Action) questions are phrased as:
- "Do you need this service?" 
- "No"/"Hindi" = Service already availed (good)
- "Yes"/"Oo" = Service needed but not availed (bad)

---

## User Workflows

### Workflow 1: Monitoring Overall Performance

1. Navigate to Analytics Tab
2. Select "Dashboard Summary" view
3. Review KPI cards for quick overview
4. Check leaderboard for top/bottom performers
5. Examine trend chart for historical patterns
6. Review service area performance chart
7. Identify areas needing attention

**Use Case**: Monthly performance review, executive reporting

### Workflow 2: Deep Diving into Service Areas

1. Navigate to Analytics Tab
2. Select "Service Area Deep Dive" view
3. Click on specific service area button
4. Review barangay rankings table
5. Identify low-performing barangays (red scores)
6. Check Action Grid for priority quadrants
7. Focus on "Fix Now" quadrant barangays
8. Plan interventions based on metrics

**Use Case**: Service improvement planning, resource allocation

### Workflow 3: Understanding Demographics

1. Navigate to Analytics Tab
2. Select "Demographics Analytics" view
3. Review total respondents and distribution
4. Analyze age distribution chart
5. Check gender distribution for equity
6. Review income and education correlations
7. Examine purok-level patterns
8. Read Key Insights card for highlights
9. Identify demographic groups with low satisfaction

**Use Case**: Equity analysis, targeted interventions, communication strategy

### Workflow 4: Comparing Cycles

1. Navigate to Dashboard Summary
2. Review Trend Chart
3. Note satisfaction changes across cycles
4. Switch to Service Area Deep Dive
5. Compare current rankings with historical data
6. Identify improving and declining barangays
7. Investigate causes of changes

**Use Case**: Impact assessment, longitudinal analysis

---

## Best Practices

### For Administrators

1. **Regular Monitoring**: Check analytics weekly during active survey cycles
2. **Data Quality**: Ensure surveys are marked "completed" for inclusion in analytics
3. **Cycle Management**: Maintain clear cycle boundaries for accurate trend analysis
4. **Target Setting**: Set realistic survey targets (default: 150 per barangay)
5. **Intervention Planning**: Use Action Grid to prioritize resource allocation

### For Data Interpretation

1. **Sample Size**: Consider response count when interpreting satisfaction scores
2. **Trends Over Time**: Look for patterns across multiple cycles, not single data points
3. **Context Matters**: Low satisfaction may indicate high expectations, not poor service
4. **Demographic Equity**: Monitor for disparities across age, gender, income groups
5. **Service Area Balance**: Ensure all 6 service areas receive attention

### For Performance

1. **Cache Awareness**: Data cached for 5 minutes; refresh cycle if needed
2. **Large Datasets**: Use filters in Service Area Deep Dive for better performance
3. **Export Data**: Use Detailed Analytics view for custom reports
4. **Browser Performance**: Close unused tabs when viewing complex charts

---

## Troubleshooting

### No Data Displayed

**Possible Causes**
- No active survey cycle configured
- No completed surveys in the cycle
- Surveys marked as "draft" or "in_progress" instead of "completed"
- Database connection issues

**Solutions**
1. Verify active cycle exists in Settings
2. Check survey response status in database
3. Ensure surveys have `progress = 100` and `status IN ('completed', 'submitted')`
4. Check browser console for API errors

### Incorrect Satisfaction Scores

**Possible Causes**
- Mixed satisfaction formats (binary vs 5-point scale)
- Missing overall satisfaction data
- Incorrect section keys in database

**Solutions**
1. Verify satisfaction question format in survey
2. Check `survey_section` table for `section_key = 'overall'`
3. Ensure `overallSatisfaction` field exists in section data
4. Run data validation scripts

### Missing Barangays in Rankings

**Possible Causes**
- No completed surveys for that barangay
- Survey target not set for barangay
- Barangay not linked to survey responses

**Solutions**
1. Check survey_target table for barangay entry
2. Verify survey_response records exist with correct barangay_id
3. Ensure responses are marked as completed

### Slow Performance

**Possible Causes**
- Large number of responses (>10,000)
- Complex demographic filters
- Cache expired
- Database query optimization needed

**Solutions**
1. Wait for cache to populate (first load slower)
2. Reduce demographic filter combinations
3. Check database indexes on key fields
4. Consider data archiving for old cycles

---

## Future Enhancements

### Planned Features

1. **Export Functionality**
   - PDF report generation
   - Excel data export
   - Custom report builder

2. **Advanced Filtering**
   - Multi-select barangay comparison
   - Date range selection
   - Custom demographic combinations

3. **Predictive Analytics**
   - Satisfaction trend forecasting
   - Risk identification algorithms
   - Anomaly detection

4. **Interactive Dashboards**
   - Drill-down capabilities
   - Custom widget arrangement
   - Saved view configurations

5. **Real-time Updates**
   - WebSocket integration
   - Live response tracking
   - Instant KPI updates

6. **Mobile Optimization**
   - Responsive chart layouts
   - Touch-friendly interactions
   - Offline viewing capabilities

---

## Glossary

**Active Cycle**: The currently ongoing survey cycle for data collection

**Availment**: The act of using or accessing a government service

**Awareness**: Knowledge or consciousness of a service's existence

**Barangay**: The smallest administrative division in the Philippines (village/district)

**Cycle**: A defined period for survey data collection (e.g., "Q1 2024")

**KPI**: Key Performance Indicator - measurable value demonstrating effectiveness

**Need for Action (NFA)**: Metric indicating urgency of intervention (inverse of satisfaction)

**Purok/Sitio**: Sub-divisions within a barangay

**Satisfaction Score**: Percentage representing citizen contentment with services

**Service Area**: One of 6 categories of government services being evaluated

**Survey Target**: Goal number of responses to collect per barangay (typically 150)

---

## Support and Contact

For technical issues, data questions, or feature requests related to the Analytics Tab:

1. Check this documentation first
2. Review troubleshooting section
3. Contact system administrator
4. Submit issue through project repository

---

**Document Version**: 1.0  
**Last Updated**: December 19, 2024  
**Maintained By**: PULSE Development Team
