# Analytics Dashboard Documentation

## Overview
The SIGLA (Survey-Informed Good Local Governance) Analytics Dashboard provides comprehensive data visualization and analysis tools for survey responses, barangay performance, and SGLGB (Seal of Good Local Governance for Barangays) award tracking.

**Last Updated:** December 2, 2025

## Table of Contents
1. [Main Analytics Dashboard](#main-analytics-dashboard)
2. [Dashboard Summary View](#dashboard-summary-view)
3. [Service Area Deep Dive](#service-area-deep-dive)
4. [Demographic Analysis](#demographic-analysis)
5. [Detailed Analytics](#detailed-analytics)
6. [Analytics API Endpoints](#analytics-api-endpoints)
7. [Dashboard Components](#dashboard-components)
8. [Data Export](#data-export)

---

## Main Analytics Dashboard

**Location:** `/analytics`

The redesigned analytics dashboard features three primary views accessible via tabs:

1. **Dashboard Summary View** - Primary landing page with KPIs and system-wide metrics
2. **Service Area Deep Dive** - Detailed analysis by service area with demographic filtering
3. **Detailed Analytics** - Raw data exploration and export functionality

---

## Dashboard Summary View

**Purpose:** Serves as the primary landing page providing a high-level overview of system performance.

### Key Widgets

#### 1. KPI Cards Row
Four key performance indicators displayed prominently at the top:

- **Overall Barangay Satisfaction %**
  - System-wide average satisfaction score
  - Calculated across all service areas and barangays
  - Color-coded: Blue for primary metric
  - Icon: Award

- **Overall Need for Action %**
  - System-wide average of services requiring attention
  - Inverse relationship with satisfaction
  - Color-coded: Orange for attention needed
  - Icon: Target

- **Total Responses vs. Target**
  - Current response count / Target response count
  - Progress bar visualization
  - Target based on total households across all barangays
  - Icon: Users

- **Barangays Covered**
  - Number of barangays with completed surveys / Total barangays
  - Percentage coverage displayed
  - Icon: MapPin

#### 2. Barangay Leaderboard Widget
Displays top 5 and bottom 5 performing barangays based on Overall Satisfaction score.

**Features:**
- Split view: Top 5 (green theme) and Bottom 5 (red theme)
- Rank badges (numbered 1-5 for top, last 5 positions for bottom)
- Barangay name and satisfaction percentage
- Trend arrows for each barangay:
  - ↑ Up (green) - Improving performance
  - ↓ Down (red) - Declining performance
  - → Stable (gray) - No significant change

**Data Source:** `/api/analytics/dashboard-summary`

#### 3. System-Wide Trend Chart Widget
Line graph showing average Overall Satisfaction % across all available survey cycles.

**Features:**
- X-axis: Survey cycles (name and year)
- Y-axis: Satisfaction percentage (0-100%)
- Smooth line with area fill
- Shows historical progression
- Helps identify long-term trends

**Chart Type:** Line chart with filled area
**Library:** Chart.js

#### 4. Service Area Performance Overview Widget
Horizontal bar chart ranking the six service areas by average satisfaction score.

**Service Areas:**
1. Financial Administration
2. Disaster Preparedness
3. Safety & Peace Order
4. Social Protection
5. Business Friendliness
6. Environmental Management

**Features:**
- Bars sorted by satisfaction score (descending)
- Color-coded bars (blue theme)
- Percentage labels on bars
- Identifies strongest and weakest service areas

**Chart Type:** Horizontal bar chart
**Library:** Chart.js

---

## Service Area Deep Dive

**Purpose:** Detailed analysis of individual service areas with demographic filtering capabilities.

### Key Features

#### 1. Service Area Selector
Grid of buttons allowing users to select one of six service areas:
- Financial Administration
- Disaster Preparedness
- Safety & Peace Order
- Social Protection
- Business Friendliness
- Environmental Management

**Interaction:** Click to select, active button highlighted

#### 2. Barangay Rankings Table
Comprehensive table showing all barangays ranked by satisfaction for the selected service area.

**Columns:**
- **Rank** - Position (1 to N)
- **Barangay** - Barangay name
- **Awareness %** - Percentage who know about the service
- **Availment %** - Percentage who used the service
- **Satisfaction %** - Average satisfaction rating
- **Need for Action %** - Percentage requiring improvements
- **Responses** - Number of survey responses
- **Trend** - Performance trend indicator (↑↓→)

**Color Coding:**
- Green (70%+): Good performance
- Yellow (50-69%): Moderate performance
- Red (<50%): Needs improvement

**Note:** Need for Action uses inverse color coding (red for high values)

#### 3. Action Grid Visualization
2x2 matrix plotting barangays by Satisfaction (x-axis) vs Need for Action (y-axis).

**Quadrants:**
- **Top-Left (Monitor):** Low satisfaction, low need for action
- **Top-Right (Maintain):** High satisfaction, low need for action
- **Bottom-Left (Fix Now):** Low satisfaction, high need for action
- **Bottom-Right (Opportunities):** High satisfaction, high need for action

**Features:**
- Each barangay represented as a dot
- Hover to see barangay name and metrics
- Visual gradient background (red → yellow → green)
- Helps prioritize interventions

**Data Source:** `/api/analytics/service-area-deep-dive`

---

## Demographic Analysis

**Purpose:** Filter and disaggregate survey results by demographic variables to identify inequities and specific group needs.

### Demographic Filters

#### Available Filters:
1. **Age Group**
   - All Ages (default)
   - 18-24
   - 25-34
   - 35-44
   - 45-54
   - 55-64
   - 65+

2. **Gender**
   - All Genders (default)
   - Male
   - Female
   - LGBTQI+

3. **Household Income**
   - All Income Levels (default)
   - Below ₱10,000
   - ₱10,000 - ₱20,000
   - ₱20,001 - ₱30,000
   - ₱30,001 - ₱50,000
   - ₱50,001 - ₱75,000
   - ₱75,001 - ₱100,000
   - Above ₱100,000

4. **Educational Attainment**
   - All Education Levels (default)
   - No formal education
   - Elementary
   - High school
   - Vocational/Technical
   - College
   - Post-graduate

### Filter Behavior

**Location:** Service Area Deep Dive view

**Features:**
- Collapsible filter panel (Show/Hide Filters button)
- Active filter badge indicator
- Clear Filters button
- Filters apply to:
  - Barangay rankings table
  - Action Grid visualization
  - All funnel metrics (Awareness, Availment, Satisfaction, Need for Action)

**Use Cases:**
- Compare satisfaction between age groups
- Identify gender-based service gaps
- Analyze income-related disparities
- Assess education level impact on service awareness

**Data Source:** Same API with demographic query parameters

---

## Detailed Analytics

**Purpose:** Raw data exploration, aggregated statistics, and data export.

### Summary View (Legacy)
Displays high-level statistics and overview metrics.

**Metrics Displayed:**
- **Total Responses**: Count of unique survey respondents
- **Average Progress**: Mean completion percentage across all surveys
- **Barangays Covered**: Number of barangays with survey responses
- **Recent Activity**: Number of responses submitted today

**Additional Information:**
- **Responses by Barangay**: Detailed breakdown showing:
  - Barangay name
  - Population
  - Number of households
  - Response count
  - Visual badge indicating response volume

**Data Source:** `/api/survey-analytics?format=summary`

### 2. Detailed View
Shows individual survey responses with complete information.

**Information Per Response:**
- Survey number (format: BB-CYCLEYEAR-NNNN)
- Barangay name
- Interviewer name
- Respondent name
- Location address
- Completion date
- Progress percentage (with visual badge)
- Sections completed (list of section keys)

**Features:**
- Displays first 10 responses
- Color-coded completion badges (100% = default, <100% = secondary)
- Organized in card layout for easy scanning

**Data Source:** `/api/survey-analytics?format=detailed`

### 3. Aggregated View
Provides statistical analysis of survey data.

**Section Completion Statistics:**
- Section name
- Completed responses count
- Total responses count
- Completion percentage

**Question Response Analysis:**
- Question identifier
- Response count
- Statistical measures (for numeric questions):
  - Mean value
  - Minimum value
  - Maximum value
- Value distribution (top 5 most common responses)
- Visual badges for value counts

**Data Source:** `/api/survey-analytics?format=aggregated`

### 4. Export View
Facilitates data export for external analysis.

**Features:**
- CSV export functionality
- Shows available record count
- Lists column names (first 5 displayed)
- Cycle-specific export (includes cycle name in filename)
- Format: `survey-data-{cycle-name}-{year}.csv`

**Export Includes:**
- All survey responses
- Respondent demographics (age, biological sex, gender identity, education, income, purok)
- Location data (coordinates, address, barangay, municipality, province)
- Section data (flattened for CSV format)
- Interviewer information
- Timestamps (started, completed, submitted)

**Data Source:** `/api/survey-analytics?format=export`

---

## Dashboard Views

### Interactive Map View
**Component:** `InteractiveSVGMap`

**Features:**
- Visual representation of barangays on SVG map
- Color-coded by satisfaction index or award status
- Hover tooltips showing barangay details
- Click to view detailed barangay information
- Legend explaining color coding

**Data Displayed:**
- Barangay name
- Satisfaction score
- Award status (Awardee/Non-Awardee)
- Population and household counts

### Barangay Satisfaction Index
**Component:** `BarangaySatisfactionIndex`

**Metrics:**
- Overall satisfaction score (0-100)
- Service area breakdown:
  - Financial Administration
  - Disaster Preparedness
  - Safety and Security
  - Social Services
  - Business and Economic Development
  - Environmental Management
- Trend indicators (up/down/stable)
- Historical comparison

**Calculation Method:**
- Aggregates satisfaction ratings across all service areas
- Weighted by response count
- Normalized to 0-100 scale

### Award Leaderboard
**Component:** `AwardLeaderboard`
**API:** `/api/analytics/award-leaderboard`

**Features:**
- Ranks barangays by total awards won
- Shows award history across cycles
- Displays:
  - Barangay name
  - Total awards count
  - Award years
  - Current cycle status
  - Trend indicators

**Sorting Options:**
- By total awards (descending)
- By most recent award
- Alphabetical by barangay name

### Barangay Comparison Viewer
**Component:** `BarangayComparisonViewer`
**API:** `/api/analytics/barangay-comparison`

**Features:**
- Compare 2-5 barangays side-by-side
- Comparison metrics:
  - Overall satisfaction scores
  - Service area performance
  - Award history
  - Demographics (population, households)
  - Response counts
  - Trend analysis

**Visualization:**
- Radar charts for service area comparison
- Bar charts for satisfaction scores
- Timeline for award history
- Statistical tables

### Service Area Deep Dive
**Component:** `ServiceAreaDeepDive`
**API:** `/api/analytics/service-area-rankings`

**Service Areas Analyzed:**
1. Financial Administration
2. Disaster Preparedness
3. Safety and Security
4. Social Services
5. Business and Economic Development
6. Environmental Management

**Metrics Per Service Area:**
- Awareness rate (% who know about services)
- Availment rate (% who used services)
- Satisfaction score (average rating)
- Need action rate (% requiring improvements)
- Funnel analysis (awareness → availment → satisfaction)

**Rankings:**
- Barangays ranked by satisfaction score
- Color-coded performance indicators
- Trend arrows (improving/declining)

### Overall Analytics
**Component:** `OverallAnalytics`
**API:** `/api/analytics/barangay-overall-performance`

**System-Wide Metrics:**
- Total survey responses
- Average satisfaction across all barangays
- Service area performance summary
- Completion rates
- Geographic coverage

**Visualizations:**
- Line charts for trends over time
- Bar charts for barangay comparisons
- Pie charts for distribution analysis
- Heat maps for geographic patterns

### Historical Cycle Viewer
**Component:** `HistoricalCycleViewer`

**Features:**
- View data from previous survey cycles
- Compare performance across cycles
- Track improvement/decline trends
- Award history timeline

**Data Displayed:**
- Cycle name and year
- Total responses per cycle
- Average satisfaction per cycle
- Award winners per cycle
- Key metrics comparison

---

## Analytics API Endpoints

### 1. Survey Analytics
**Endpoint:** `/api/survey-analytics`

**Query Parameters:**
- `format`: `summary` | `detailed` | `aggregated` | `export`
- `barangayId`: Filter by specific barangay (optional)
- `startDate`: Filter responses from date (optional)
- `endDate`: Filter responses to date (optional)
- `section`: Filter by section key (optional)
- `cycleId`: Filter by survey cycle (optional, defaults to active cycle)

**Response Formats:**

**Summary:**
```json
{
  "summary": {
    "totalResponses": 150,
    "averageProgress": 87.5,
    "barangayStats": [
      {
        "barangayId": 10,
        "barangayName": "Balasinon",
        "population": 273,
        "households": 91,
        "responses": 15
      }
    ],
    "timeSeriesData": [
      {
        "date": "2025-11-30",
        "count": 5
      }
    ]
  }
}
```

**Detailed:**
```json
{
  "detailed": {
    "responses": [
      {
        "responseId": 1,
        "surveyNumber": "10-2025-0001",
        "barangay": {
          "id": 10,
          "name": "Balasinon",
          "population": 273,
          "households": 91
        },
        "interviewer": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "respondent": {
          "name": "Jane Smith",
          "age": 35,
          "sex": "Female",
          "genderIdentity": "Female"
        },
        "location": {
          "lat": 10.3157,
          "lng": 123.8854,
          "address": "123 Main St",
          "barangay": "Balasinon",
          "municipality": "Sulop",
          "province": "Davao del Sur",
          "accuracy": 10.5
        },
        "progress": 100,
        "completedAt": "2025-11-30T10:30:00Z",
        "sections": [
          {
            "key": "financial",
            "name": "Financial Administration",
            "status": "completed"
          }
        ]
      }
    ],
    "count": 150
  }
}
```

**Aggregated:**
```json
{
  "aggregated": {
    "sections": {
      "financial": {
        "name": "Financial Administration",
        "totalResponses": 150,
        "completedResponses": 145,
        "averageCompletionTime": 15.5
      }
    },
    "questions": {
      "aware_financial": {
        "responses": 150,
        "valueCount": {
          "Yes": 120,
          "No": 30
        }
      },
      "satisfaction_rating": {
        "responses": 120,
        "statistics": {
          "mean": 4.2,
          "min": 1,
          "max": 5,
          "median": 4
        }
      }
    },
    "totalResponses": 150
  }
}
```

### 2. Award Leaderboard
**Endpoint:** `/api/analytics/award-leaderboard`

**Query Parameters:**
- `limit`: Number of results (default: 25)
- `sortBy`: `total_awards` | `recent_award` | `name`

**Response:**
```json
{
  "leaderboard": [
    {
      "barangayId": 10,
      "barangayName": "Balasinon",
      "totalAwards": 5,
      "awardYears": [2021, 2022, 2023, 2024, 2025],
      "currentCycleStatus": "Awardee",
      "trend": "improving"
    }
  ],
  "metadata": {
    "totalBarangays": 25,
    "totalAwards": 125,
    "averageAwardsPerBarangay": 5.0
  }
}
```

### 3. Barangay Comparison
**Endpoint:** `/api/analytics/barangay-comparison`

**Method:** POST

**Request Body:**
```json
{
  "barangayIds": [10, 17, 16],
  "cycleId": 17
}
```

**Response:**
```json
{
  "comparison": {
    "barangays": [
      {
        "id": 10,
        "name": "Balasinon",
        "overallSatisfaction": 85.5,
        "serviceAreas": {
          "financial": 87.2,
          "disaster": 83.5,
          "safety": 86.1,
          "social": 84.8,
          "business": 85.0,
          "environmental": 86.5
        },
        "awardHistory": [2023, 2024, 2025],
        "demographics": {
          "population": 273,
          "households": 91
        },
        "responseCount": 15
      }
    ],
    "insights": {
      "topPerformer": "Balasinon",
      "mostImproved": "Buguis",
      "needsAttention": []
    }
  }
}
```

### 4. Service Area Rankings
**Endpoint:** `/api/analytics/service-area-rankings`

**Query Parameters:**
- `serviceArea`: `financial` | `disaster` | `safety` | `social` | `business` | `environmental`
- `cycleId`: Survey cycle ID (optional, defaults to active)
- `limit`: Number of results (default: 25)

**Response:**
```json
{
  "serviceArea": "financial",
  "rankings": [
    {
      "rank": 1,
      "barangayId": 10,
      "barangayName": "Balasinon",
      "satisfactionScore": 87.2,
      "awarenessRate": 95.0,
      "availmentRate": 85.0,
      "needActionRate": 10.0,
      "responseCount": 15,
      "trend": "up"
    }
  ],
  "summary": {
    "averageSatisfaction": 75.5,
    "highestScore": 87.2,
    "lowestScore": 62.3,
    "totalBarangays": 25
  }
}
```

### 5. Service Area Trends
**Endpoint:** `/api/analytics/service-area-trends`

**Query Parameters:**
- `barangayId`: Specific barangay (optional)
- `startCycle`: Starting cycle ID (optional)
- `endCycle`: Ending cycle ID (optional)

**Response:**
```json
{
  "trends": {
    "financial": [
      {
        "cycleId": 15,
        "cycleName": "Survey Cycle 2023",
        "year": 2023,
        "satisfactionScore": 82.5,
        "responseCount": 12
      },
      {
        "cycleId": 16,
        "cycleName": "Survey Cycle 2024",
        "year": 2024,
        "satisfactionScore": 85.0,
        "responseCount": 14
      }
    ],
    "disaster": [...],
    "safety": [...],
    "social": [...],
    "business": [...],
    "environmental": [...]
  },
  "overallTrend": "improving"
}
```

### 6. Barangay Overall Performance
**Endpoint:** `/api/analytics/barangay-overall-performance`

**Query Parameters:**
- `cycleId`: Survey cycle ID (optional, defaults to active)

**Response:**
```json
{
  "performance": [
    {
      "barangayId": 10,
      "barangayName": "Balasinon",
      "overallScore": 85.5,
      "serviceAreaScores": {
        "financial": 87.2,
        "disaster": 83.5,
        "safety": 86.1,
        "social": 84.8,
        "business": 85.0,
        "environmental": 86.5
      },
      "responseCount": 15,
      "completionRate": 95.0,
      "awardStatus": "Awardee"
    }
  ],
  "systemAverage": 75.5,
  "topPerformers": [10, 17, 16],
  "needsImprovement": [21, 11]
}
```

### 7. System Stats
**Endpoint:** `/api/analytics/system-stats`

**Response:**
```json
{
  "stats": {
    "totalResponses": 1500,
    "totalBarangays": 25,
    "totalCycles": 5,
    "activeCycle": {
      "id": 17,
      "name": "Survey Cycle 2025",
      "year": 2025
    },
    "averageSatisfaction": 75.5,
    "completionRate": 87.3,
    "totalAwards": 125,
    "lastUpdated": "2025-11-30T12:00:00Z"
  }
}
```

### 8. Cache Management
**Endpoint:** `/api/analytics/cache`

**Methods:**
- **GET**: Get cache statistics
- **POST**: Invalidate cache

**GET Response:**
```json
{
  "cacheStats": {
    "totalKeys": 150,
    "totalSize": "2.5 MB",
    "hitRate": 85.5,
    "missRate": 14.5,
    "oldestEntry": "2025-11-29T10:00:00Z",
    "newestEntry": "2025-11-30T12:00:00Z"
  }
}
```

**POST Request:**
```json
{
  "pattern": "analytics:*"
}
```

**POST Response:**
```json
{
  "success": true,
  "keysInvalidated": 45,
  "message": "Cache invalidated successfully"
}
```

---

## Dashboard Components

### 1. Interactive SVG Map
**File:** `src/components/dashboard/InteractiveSVGMap.tsx`

**Features:**
- SVG-based map of municipality
- Clickable barangay regions
- Color-coded by satisfaction or award status
- Hover tooltips
- Zoom and pan capabilities
- Legend with color scale

**Color Schemes:**
- **Satisfaction Mode:**
  - Green (80-100): High satisfaction
  - Yellow (60-79): Medium satisfaction
  - Orange (40-59): Low satisfaction
  - Red (0-39): Very low satisfaction
  - Gray: No data

- **Award Mode:**
  - Gold: Current awardee
  - Silver: Previous awardee
  - Bronze: Historical awardee
  - Gray: Non-awardee

### 2. Barangay Satisfaction Index
**File:** `src/components/dashboard/BarangaySatisfactionIndex.tsx`

**Displays:**
- Overall satisfaction score (large number)
- Service area breakdown (6 areas)
- Trend indicators (↑ ↓ →)
- Historical comparison chart
- Percentile ranking

**Calculation:**
```
Overall Score = (Σ Service Area Scores) / 6
Service Area Score = (Σ Satisfaction Ratings) / Response Count
```

### 3. Award Leaderboard
**File:** `src/components/dashboard/AwardLeaderboard.tsx`

**Features:**
- Top 10 barangays by awards
- Award count badges
- Year-by-year breakdown
- Trend indicators
- Filter by cycle
- Export to PDF

### 4. Barangay Comparison Viewer
**File:** `src/components/dashboard/BarangayComparisonViewer.tsx`

**Comparison Types:**
- Side-by-side metrics
- Radar chart overlay
- Bar chart comparison
- Timeline comparison
- Statistical significance indicators

**Maximum:** 5 barangays at once

### 5. Service Area Deep Dive
**File:** `src/components/dashboard/ServiceAreaDeepDive.tsx`

**Analysis Includes:**
- Funnel visualization (Awareness → Availment → Satisfaction)
- Question-level breakdown
- Response distribution
- Correlation analysis
- Recommendations based on data

### 6. Overall Analytics
**File:** `src/components/dashboard/OverallAnalytics.tsx`

**Sections:**
- System summary cards
- Trend charts (line graphs)
- Distribution charts (bar/pie)
- Geographic heat map
- Time series analysis

### 7. Historical Cycle Viewer
**File:** `src/components/dashboard/HistoricalCycleViewer.tsx`

**Features:**
- Cycle selector dropdown
- Year-over-year comparison
- Award history timeline
- Performance trends
- Export historical data

---

## Data Export

### CSV Export Format

**Filename:** `survey-data-{cycle-name}-{year}.csv`

**Columns Included:**
1. **Response Information:**
   - response_id
   - survey_number
   - barangay_name
   - barangay_population
   - interviewer_name
   - interviewer_email

2. **Respondent Demographics:**
   - respondent_name
   - respondent_age
   - biological_sex
   - gender_identity
   - respondent_educational_attainment
   - respondent_household_income
   - respondent_purok

3. **Location Data:**
   - location_lat
   - location_lng
   - location_address
   - location_barangay
   - location_municipality
   - location_province
   - location_accuracy

4. **Survey Metadata:**
   - progress
   - completed_at
   - submitted_at
   - status

5. **Section Data:**
   - section_{key}_status
   - section_{key}_data (flattened JSON)

**Example Row:**
```csv
response_id,survey_number,barangay_name,respondent_name,respondent_age,biological_sex,gender_identity,...
1,"10-2025-0001","Balasinon","Jane Smith",35,"Female","Female",...
```

### Export Process:
1. Click "Export CSV" button
2. System fetches all responses from active cycle
3. Data is flattened and formatted
4. CSV file is generated client-side
5. Browser downloads file automatically

---

## Filtering and Search

### Available Filters:
- **Barangay**: Select specific barangay
- **Date Range**: Start and end dates
- **Section**: Filter by survey section
- **Cycle**: Select survey cycle
- **Status**: Completed, In Progress, Draft
- **Interviewer**: Filter by interviewer

### Search Functionality:
- Search by survey number
- Search by respondent name
- Search by barangay name
- Full-text search in responses

---

## Performance Considerations

### Caching:
- Analytics data cached for 5 minutes
- Cache invalidation on new responses
- Manual cache refresh available

### Optimization:
- Pagination for large datasets (50 records per page)
- Lazy loading for charts
- Debounced search (300ms delay)
- Virtualized lists for long tables

### Loading States:
- Skeleton loaders for initial load
- Progress indicators for exports
- Refresh buttons with loading spinners

---

## Access Control

### Role-Based Access:
- **Admin**: Full access to all analytics
- **Developer**: Full access to all analytics
- **Officer**: Access to designated barangay only
- **FS (Field Supervisor)**: Access to assigned barangays
- **Interviewer**: View own responses only

### Cycle-Based Access:
- Active cycle data always accessible
- Historical cycles require admin permission
- Export limited to active cycle for non-admins

---

## Technical Notes

### Data Refresh:
- Real-time updates via polling (30 seconds)
- Manual refresh button available
- Auto-refresh on window focus

### Browser Compatibility:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Responsiveness:
- Responsive grid layouts
- Touch-friendly controls
- Simplified charts for mobile
- Collapsible sections

---

## Troubleshooting

### Common Issues:

**No data showing:**
- Check if active cycle is set
- Verify survey responses exist
- Check date range filters
- Clear cache and refresh

**Export not working:**
- Ensure active cycle exists
- Check browser download settings
- Verify sufficient data exists
- Try manual cache refresh

**Slow performance:**
- Reduce date range
- Filter by specific barangay
- Clear browser cache
- Check network connection

---

## Future Enhancements

### Planned Features:
- Real-time dashboard updates (WebSocket)
- Advanced filtering with multiple criteria
- Custom report builder
- Scheduled exports
- Email notifications for milestones
- Mobile app for analytics
- AI-powered insights and recommendations
- Predictive analytics for award likelihood
- Geospatial analysis tools
- Integration with external BI tools

---

## Support

For technical support or questions about the analytics dashboard:
- Contact: System Administrator
- Documentation: `/docs` folder
- API Reference: This document
- Issue Tracker: Project repository
