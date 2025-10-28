# Design Document

## Overview

The Enhanced Analytics Dashboard redesigns the PULSE Survey Analytics system to shift focus from response count metrics (which are always 150 and provide limited value) to quality-based metrics including satisfaction scores, service area performance, and award rankings. The design follows a hybrid approach that replaces two underutilized tabs, adds one new tab, and enhances two existing tabs while preserving essential administrative functionality.

### Design Goals

1. **Actionable Insights**: Provide meaningful metrics that drive decision-making for government officials, barangay administrators, and citizens
2. **Service-Centric Analysis**: Enable deep analysis of the 6 service areas (Financial Assistance, Disaster Preparedness, Health Services, Peace and Order, Infrastructure, Environmental Management)
3. **Performance Comparison**: Allow multi-barangay comparisons across service areas and award history
4. **Award Transparency**: Display comprehensive award rankings, streaks, and historical performance
5. **Administrative Continuity**: Maintain existing operational features needed for cycle management
6. **Responsive Design**: Ensure all visualizations work across desktop, tablet, and mobile devices
7. **Performance**: Optimize data loading and chart rendering for smooth user experience

### Key Principles

- **Quality over Quantity**: Focus on satisfaction scores rather than response counts
- **Visual Clarity**: Use appropriate chart types for each data relationship
- **Progressive Enhancement**: Build on existing components where possible
- **Data Integrity**: Handle missing data gracefully with clear indicators
- **Accessibility**: Ensure WCAG compliance with keyboard navigation and screen reader support

## Architecture

### System Architecture


```mermaid
graph TB
    subgraph "Frontend - React/Next.js"
        AV[AnalyticsView.tsx<br/>Tab Navigation]
        
        subgraph "Tab 1: Historical Cycles"
            HCV[HistoricalCycleViewer.tsx<br/>Enhanced]
        end
        
        subgraph "Tab 2: Barangay Comparison"
            BCV[BarangayComparisonViewer.tsx<br/>Renamed & Refactored]
            RCC[RadarChartComparison.tsx]
            AGH[ActionGridHeatmap.tsx]
            AWT[AwardTimeline.tsx]
        end
        
        subgraph "Tab 3: Service Deep Dive"
            SDD[ServiceAreaDeepDive.tsx<br/>Renamed & Refactored]
            SLB[ServiceLeaderboard.tsx]
            FV[FunnelVisualization.tsx]
            STC[ServiceTrendChart.tsx]
        end
        
        subgraph "Tab 4: Overall Analytics"
            OA[OverallAnalytics.tsx<br/>Enhanced]
        end
        
        subgraph "Tab 5: Award Leaderboard"
            AL[AwardLeaderboard.tsx<br/>New]
            AHT[AwardHistoryTimeline.tsx]
            ST[StreakTracker.tsx]
        end
    end
    
    subgraph "API Layer - Next.js API Routes"
        API1[/api/analytics/barangay-comparison<br/>POST - New]
        API2[/api/analytics/service-area-rankings<br/>GET - New]
        API3[/api/analytics/service-trends<br/>GET - New]
        API4[/api/analytics/award-leaderboard<br/>GET - New]
        API5[/api/ml/funnel-analysis<br/>GET - Existing]
        API6[/api/cycle-awards<br/>GET - Existing]
    end
    
    subgraph "Data Layer - Supabase PostgreSQL"
        DB[(Database)]
        TABLES[survey_responses<br/>barangays<br/>survey_cycles<br/>cycle_awards<br/>ml_cache]
    end
    
    subgraph "External Services"
        ML[ML Funnel Analysis Service<br/>Python/FastAPI]
    end
    
    AV --> HCV
    AV --> BCV
    AV --> SDD
    AV --> OA
    AV --> AL
    
    BCV --> RCC
    BCV --> AGH
    BCV --> AWT
    
    SDD --> SLB
    SDD --> FV
    SDD --> STC
    
    AL --> AHT
    AL --> ST
    
    BCV --> API1
    SDD --> API2
    SDD --> API3
    AL --> API4
    BCV --> API5
    BCV --> API6
    SDD --> API5
    AL --> API6
    
    API1 --> DB
    API2 --> DB
    API3 --> DB
    API4 --> DB
    API5 --> ML
    API6 --> DB
    
    ML --> TABLES
    DB --> TABLES
```

### Component Hierarchy


```
AnalyticsView (Tab Container)
├── Tab 1: HistoricalCycleViewer (Enhanced)
│   ├── Cycle Selector Dropdown
│   ├── Dashboard Metrics Cards
│   ├── Service Area Breakdown (New)
│   ├── Satisfaction Summary (New)
│   ├── Barangay Performance Table
│   └── Award Status Indicators (New)
│
├── Tab 2: BarangayComparisonViewer (Refactored)
│   ├── Barangay Multi-Select (2-5 barangays)
│   ├── RadarChartComparison (6 service areas)
│   ├── Side-by-Side Satisfaction Bars
│   ├── ActionGridHeatmap (Service status matrix)
│   └── AwardTimeline (Historical awards)
│
├── Tab 3: ServiceAreaDeepDive (Refactored)
│   ├── Service Area Selector Dropdown
│   ├── ServiceLeaderboard (Ranked barangays)
│   ├── FunnelVisualization (Awareness → Availment → Satisfaction)
│   ├── ServiceTrendChart (Satisfaction over time)
│   └── Scatter Plot (Satisfaction vs Need-Action)
│
├── Tab 4: OverallAnalytics (Enhanced)
│   ├── System-Wide Statistics
│   ├── Barangay Performance Rankings
│   ├── Service Area Trends
│   ├── Award History Section (New)
│   ├── Lifetime Award Rankings Top 10 (New)
│   └── Improvement Velocity Rankings (New)
│
└── Tab 5: AwardLeaderboard (New)
    ├── Sortable Rankings Table
    ├── Medal Display (🥇🥈🥉)
    ├── AwardHistoryTimeline
    ├── StreakTracker
    ├── Win Rate Statistics
    └── Filter Controls (Year, Cycle, Sort)
```

### Technology Stack

- **Frontend Framework**: React 18+ with Next.js 15
- **UI Components**: Custom components + shadcn/ui
- **Charting Library**: Recharts (already installed)
- **State Management**: React hooks (useState, useEffect, useContext)
- **Data Fetching**: Next.js API routes with fetch
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety
- **Database**: Supabase PostgreSQL
- **ML Service**: Python FastAPI (existing)

## Components and Interfaces

### Tab 1: Historical Cycle Viewer (Enhanced)

**Component**: `HistoricalCycleViewer.tsx`

**Status**: Existing component with minor enhancements

**Purpose**: Display individual cycle data for administrative and operational purposes

**Props Interface**:
```typescript
interface HistoricalCycleViewerProps {
  initialCycleId?: number;
}
```

**State Management**:
```typescript
interface HistoricalCycleState {
  selectedCycle: SurveyCycle | null;
  metrics: CycleMetrics;
  barangays: BarangayPerformance[];
  serviceAreas: ServiceAreaBreakdown[]; // New
  satisfactionSummary: SatisfactionSummary; // New
  loading: boolean;
  error: string | null;
}
```

**New Sections**:
1. **Service Area Breakdown**: Display satisfaction scores for each of the 6 service areas
2. **Satisfaction Summary**: Quick overview card showing average satisfaction, top/bottom performers
3. **Award Status Indicators**: Show which barangays won awards in this cycle

**Data Flow**:
1. User selects cycle from dropdown
2. Fetch cycle data from existing APIs
3. Fetch service area data from ML Funnel Analysis API
4. Fetch award data from cycle-awards API
5. Render enhanced view with new sections



### Tab 2: Barangay Comparison Viewer (Refactored)

**Component**: `BarangayComparisonViewer.tsx` (renamed from `CycleComparisonViewer.tsx`)

**Status**: Refactored - replace cycle comparison with barangay comparison

**Purpose**: Compare 2-5 barangays across service areas, satisfaction scores, and award history

**Props Interface**:
```typescript
interface BarangayComparisonViewerProps {
  cycleId?: number;
}
```

**State Management**:
```typescript
interface BarangayComparisonState {
  selectedBarangays: number[]; // 2-5 barangay IDs
  cycleId: number;
  comparisonData: BarangayComparisonData[];
  loading: boolean;
  error: string | null;
}

interface BarangayComparisonData {
  barangay_id: number;
  name: string;
  service_scores: {
    financial: number;
    disaster: number;
    health: number;
    peace: number;
    infrastructure: number;
    environmental: number;
  };
  overall_satisfaction: number;
  awards: {
    total: number;
    consecutive: number;
    win_rate: number;
  };
  action_grid: {
    maintain: string[]; // Service areas in "Maintain" quadrant
    fix_now: string[];
    monitor: string[];
    low_priority: string[];
  };
}
```

**Child Components**:

#### 1. RadarChartComparison.tsx
**Purpose**: Display 6 service areas as radar chart with multiple barangay overlays

**Props**:
```typescript
interface RadarChartComparisonProps {
  data: {
    barangay_name: string;
    scores: {
      financial: number;
      disaster: number;
      health: number;
      peace: number;
      infrastructure: number;
      environmental: number;
    };
  }[];
  colors: string[]; // Distinct color per barangay
}
```

**Implementation**:
- Use Recharts `RadarChart` component
- 6 axes for service areas
- Multiple `Radar` components (one per barangay)
- Legend showing barangay names with colors
- Tooltips on hover showing exact scores

#### 2. ActionGridHeatmap.tsx
**Purpose**: Display color-coded matrix of service area status for each barangay

**Props**:
```typescript
interface ActionGridHeatmapProps {
  data: {
    barangay_name: string;
    services: {
      name: string;
      satisfaction: number;
      need_action: number;
      quadrant: 'maintain' | 'fix_now' | 'monitor' | 'low_priority';
    }[];
  }[];
}
```

**Implementation**:
- Custom component using Recharts cells or CSS Grid
- Color coding: Green (maintain), Red (fix now), Yellow (monitor), Gray (low priority)
- Rows = Barangays, Columns = Service Areas
- Tooltips showing satisfaction and need-action scores

#### 3. AwardTimeline.tsx
**Purpose**: Display historical award wins for selected barangays

**Props**:
```typescript
interface AwardTimelineProps {
  data: {
    barangay_name: string;
    awards: {
      year: number;
      cycle_id: number;
      award_type: string;
    }[];
  }[];
}
```

**Implementation**:
- Custom timeline component
- Horizontal timeline with year markers
- Medal icons (🥇🥈🥉) at award years
- Different colors per barangay
- Tooltips showing award details

**Data Flow**:
1. User selects 2-5 barangays from multi-select dropdown
2. POST request to `/api/analytics/barangay-comparison` with barangay IDs and cycle ID
3. Receive comparison data including service scores, awards, action grid
4. Render radar chart, heatmap, and timeline
5. Update visualizations when selection changes



### Tab 3: Service Area Deep Dive (Refactored)

**Component**: `ServiceAreaDeepDive.tsx` (renamed from `HistoricalTrendAnalysis.tsx`)

**Status**: Refactored - replace trend analysis with service area analysis

**Purpose**: Analyze specific service areas, rank barangays, show funnel progression, and track satisfaction trends

**Props Interface**:
```typescript
interface ServiceAreaDeepDiveProps {
  cycleId?: number;
}
```

**State Management**:
```typescript
interface ServiceAreaDeepDiveState {
  selectedServiceArea: ServiceAreaType;
  cycleId: number;
  rankings: ServiceAreaRanking[];
  trends: ServiceTrendData[];
  funnelData: FunnelData;
  loading: boolean;
  error: string | null;
}

type ServiceAreaType = 'financial' | 'disaster' | 'health' | 'peace' | 'infrastructure' | 'environmental';

interface ServiceAreaRanking {
  rank: number;
  barangay_id: number;
  name: string;
  satisfaction: number;
  need_action: number;
  trend: 'improving' | 'declining' | 'stable';
  improvement_rate: number;
}

interface ServiceTrendData {
  cycle_id: number;
  year: number;
  satisfaction: number;
  need_action: number;
}

interface FunnelData {
  awareness: number;
  availment: number;
  satisfaction: number;
  awareness_to_availment_rate: number;
  availment_to_satisfaction_rate: number;
}
```

**Child Components**:

#### 1. ServiceLeaderboard.tsx
**Purpose**: Display ranked list of barangays for selected service area

**Props**:
```typescript
interface ServiceLeaderboardProps {
  rankings: ServiceAreaRanking[];
  serviceArea: ServiceAreaType;
}
```

**Implementation**:
- Sortable table with rank, barangay name, satisfaction score, need-action score
- Visual indicators: ↑ improving, ↓ declining, → stable
- Color-coded satisfaction scores (green/blue/yellow/red)
- Click to view barangay details
- Top 3 highlighted with medal icons

#### 2. FunnelVisualization.tsx
**Purpose**: Show progression from Awareness → Availment → Satisfaction

**Props**:
```typescript
interface FunnelVisualizationProps {
  data: FunnelData;
  serviceArea: ServiceAreaType;
}
```

**Implementation**:
- Custom SVG funnel chart
- Three stages with decreasing widths
- Percentage labels at each stage
- Conversion rate labels between stages
- Color gradient from top to bottom
- Tooltips explaining each stage

#### 3. ServiceTrendChart.tsx
**Purpose**: Display satisfaction trends over time for selected service area

**Props**:
```typescript
interface ServiceTrendChartProps {
  data: ServiceTrendData[];
  serviceArea: ServiceAreaType;
  barangayId?: number; // Optional: show specific barangay or all
}
```

**Implementation**:
- Recharts `LineChart` component
- X-axis: Years/Cycles
- Y-axis: Satisfaction percentage (0-100%)
- Multiple lines if comparing barangays
- Area fill under line for visual emphasis
- Tooltips showing exact values
- Trend indicators (slope calculation)

**Data Flow**:
1. User selects service area from dropdown
2. GET request to `/api/analytics/service-area-rankings?service_area=X&cycle_id=Y`
3. GET request to `/api/analytics/service-trends?service_area=X`
4. GET request to `/api/ml/funnel-analysis` for funnel data
5. Render leaderboard, funnel, and trend chart
6. Update when service area selection changes



### Tab 4: Overall Analytics (Enhanced)

**Component**: `OverallAnalytics.tsx`

**Status**: Existing component with significant enhancements

**Purpose**: Provide system-wide overview including statistics, rankings, and award data

**Props Interface**:
```typescript
interface OverallAnalyticsProps {
  // No props needed - shows all-time data
}
```

**State Management**:
```typescript
interface OverallAnalyticsState {
  systemStats: SystemStatistics;
  barangayRankings: BarangayRanking[];
  serviceAreaTrends: ServiceAreaTrend[];
  awardData: AwardStatistics; // New
  improvementRankings: ImprovementRanking[]; // New
  loading: boolean;
  error: string | null;
}

interface AwardStatistics {
  top_10_lifetime: {
    barangay_id: number;
    name: string;
    total_awards: number;
    win_rate: number;
    consecutive_streak: number;
  }[];
  recent_winners: {
    cycle_id: number;
    year: number;
    winners: string[];
  }[];
  award_distribution: {
    barangay_name: string;
    award_count: number;
  }[];
}

interface ImprovementRanking {
  barangay_id: number;
  name: string;
  improvement_velocity: number; // Rate of satisfaction increase
  cycles_analyzed: number;
}
```

**New Sections**:

1. **Award History Section**:
   - Timeline of recent award cycles
   - Award distribution pie chart
   - Total awards given over time

2. **Lifetime Award Rankings (Top 10)**:
   - Table showing top 10 barangays by total awards
   - Win rate percentages
   - Consecutive streak indicators
   - Medal icons for top 3

3. **Improvement Velocity Rankings**:
   - Barangays with fastest satisfaction improvement
   - Rate of change calculations
   - Trend indicators
   - Comparison to system average

**Data Flow**:
1. Component mounts and fetches all data
2. GET requests to existing APIs for system stats
3. GET request to `/api/analytics/award-leaderboard?limit=10` for award data
4. Calculate improvement velocities from historical data
5. Render enhanced view with new award sections



### Tab 5: Award Leaderboard (New)

**Component**: `AwardLeaderboard.tsx`

**Status**: Brand new component

**Purpose**: Display comprehensive award rankings, streaks, and historical performance

**Props Interface**:
```typescript
interface AwardLeaderboardProps {
  // No props needed - shows all barangays
}
```

**State Management**:
```typescript
interface AwardLeaderboardState {
  leaderboard: AwardLeaderboardEntry[];
  sortBy: 'total_awards' | 'win_rate' | 'consecutive_streak' | 'last_award';
  sortOrder: 'asc' | 'desc';
  filterYear?: number;
  filterCycle?: number;
  loading: boolean;
  error: string | null;
}

interface AwardLeaderboardEntry {
  rank: number;
  barangay_id: number;
  name: string;
  total_awards: number;
  consecutive_years: number;
  win_rate: number;
  last_award_year: number;
  years_since_last_award: number;
  first_time_winner: boolean;
  award_history: {
    year: number;
    cycle_id: number;
    award_type: string;
  }[];
}
```

**Child Components**:

#### 1. AwardHistoryTimeline.tsx
**Purpose**: Display award wins over time for all or selected barangays

**Props**:
```typescript
interface AwardHistoryTimelineProps {
  data: {
    year: number;
    winners: {
      barangay_id: number;
      name: string;
      award_type: string;
    }[];
  }[];
}
```

**Implementation**:
- Recharts `BarChart` or custom timeline
- X-axis: Years
- Y-axis: Number of awards or barangay names
- Stacked bars showing multiple winners per year
- Color-coded by award type
- Interactive tooltips

#### 2. StreakTracker.tsx
**Purpose**: Display consecutive award streaks for top performers

**Props**:
```typescript
interface StreakTrackerProps {
  data: {
    barangay_name: string;
    current_streak: number;
    longest_streak: number;
    streak_years: number[];
  }[];
}
```

**Implementation**:
- Visual streak indicators (🔥 fire emoji for active streaks)
- Bar chart showing streak lengths
- Highlight current vs historical streaks
- Tooltips with year ranges

**Features**:
1. **Sortable Table**: Click column headers to sort
2. **Medal Display**: 🥇🥈🥉 for top 3 positions
3. **Filtering**: Filter by year, cycle, or award type
4. **Search**: Search barangays by name
5. **Export**: Download leaderboard as CSV (optional)

**Data Flow**:
1. Component mounts and fetches leaderboard data
2. GET request to `/api/analytics/award-leaderboard?sort_by=X&limit=25`
3. User can change sorting, filtering
4. Re-fetch data with new parameters
5. Render updated leaderboard



## Data Models

### API Request/Response Models

#### 1. Barangay Comparison API

**Endpoint**: `POST /api/analytics/barangay-comparison`

**Request Body**:
```typescript
interface BarangayComparisonRequest {
  barangay_ids: number[]; // 2-5 IDs
  cycle_id: number;
  metrics: ('service_scores' | 'awards' | 'trends')[];
}
```

**Response**:
```typescript
interface BarangayComparisonResponse {
  barangays: {
    barangay_id: number;
    name: string;
    service_scores: {
      financial: number;
      disaster: number;
      health: number;
      peace: number;
      infrastructure: number;
      environmental: number;
    };
    overall_satisfaction: number;
    awards: {
      total: number;
      consecutive: number;
      win_rate: number;
    };
    action_grid: {
      maintain: string[];
      fix_now: string[];
      monitor: string[];
      low_priority: string[];
    };
  }[];
}
```

#### 2. Service Area Rankings API

**Endpoint**: `GET /api/analytics/service-area-rankings`

**Query Parameters**:
```typescript
interface ServiceAreaRankingsParams {
  service_area: 'financial' | 'disaster' | 'health' | 'peace' | 'infrastructure' | 'environmental';
  cycle_id: number;
}
```

**Response**:
```typescript
interface ServiceAreaRankingsResponse {
  service_area: string;
  cycle_id: number;
  rankings: {
    rank: number;
    barangay_id: number;
    name: string;
    satisfaction: number;
    need_action: number;
    trend: 'improving' | 'declining' | 'stable';
    improvement_rate: number;
  }[];
}
```

#### 3. Service Trends API

**Endpoint**: `GET /api/analytics/service-trends`

**Query Parameters**:
```typescript
interface ServiceTrendsParams {
  service_area: string;
  barangay_id?: number; // Optional: specific barangay or all
}
```

**Response**:
```typescript
interface ServiceTrendsResponse {
  service_area: string;
  barangay_id?: number;
  trends: {
    cycle_id: number;
    year: number;
    satisfaction: number;
    need_action: number;
    awareness: number;
    availment: number;
  }[];
}
```

#### 4. Award Leaderboard API

**Endpoint**: `GET /api/analytics/award-leaderboard`

**Query Parameters**:
```typescript
interface AwardLeaderboardParams {
  sort_by?: 'total_awards' | 'win_rate' | 'consecutive_streak' | 'last_award';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  year_filter?: number;
}
```

**Response**:
```typescript
interface AwardLeaderboardResponse {
  leaderboard: {
    rank: number;
    barangay_id: number;
    name: string;
    total_awards: number;
    consecutive_years: number;
    win_rate: number;
    last_award_year: number;
    years_since_last_award: number;
    award_history: {
      year: number;
      cycle_id: number;
      award_type: string;
    }[];
  }[];
}
```

### Database Queries

#### Service Area Rankings Query
```sql
WITH service_scores AS (
  SELECT 
    b.id as barangay_id,
    b.name,
    mc.financial_assistance_satisfaction as financial,
    mc.disaster_preparedness_satisfaction as disaster,
    mc.health_services_satisfaction as health,
    mc.peace_and_order_satisfaction as peace,
    mc.infrastructure_satisfaction as infrastructure,
    mc.environmental_management_satisfaction as environmental
  FROM barangays b
  JOIN ml_cache mc ON b.id = mc.barangay_id
  WHERE mc.cycle_id = $1
)
SELECT 
  ROW_NUMBER() OVER (ORDER BY financial DESC) as rank,
  barangay_id,
  name,
  financial as satisfaction
FROM service_scores
ORDER BY rank;
```

#### Award Leaderboard Query
```sql
SELECT 
  b.id as barangay_id,
  b.name,
  COUNT(ca.id) as total_awards,
  ROUND(COUNT(ca.id)::numeric / COUNT(DISTINCT sc.id)::numeric, 2) as win_rate,
  MAX(sc.year) as last_award_year,
  EXTRACT(YEAR FROM CURRENT_DATE) - MAX(sc.year) as years_since_last_award
FROM barangays b
LEFT JOIN cycle_awards ca ON b.id = ca.barangay_id
LEFT JOIN survey_cycles sc ON ca.cycle_id = sc.id
GROUP BY b.id, b.name
ORDER BY total_awards DESC, win_rate DESC;
```

#### Consecutive Streak Query
```sql
WITH award_years AS (
  SELECT 
    ca.barangay_id,
    sc.year,
    LAG(sc.year) OVER (PARTITION BY ca.barangay_id ORDER BY sc.year) as prev_year
  FROM cycle_awards ca
  JOIN survey_cycles sc ON ca.cycle_id = sc.id
),
streak_groups AS (
  SELECT 
    barangay_id,
    year,
    SUM(CASE WHEN year - prev_year > 1 OR prev_year IS NULL THEN 1 ELSE 0 END) 
      OVER (PARTITION BY barangay_id ORDER BY year) as streak_group
  FROM award_years
)
SELECT 
  barangay_id,
  MAX(COUNT(*)) OVER (PARTITION BY barangay_id) as longest_streak,
  COUNT(*) as current_streak
FROM streak_groups
GROUP BY barangay_id, streak_group
ORDER BY current_streak DESC;
```



## Error Handling

### Error Types and Handling Strategies

#### 1. API Errors

**Network Errors**:
```typescript
try {
  const response = await fetch('/api/analytics/barangay-comparison', {
    method: 'POST',
    body: JSON.stringify(requestData)
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Failed to fetch comparison data:', error);
  setError('Unable to load comparison data. Please try again.');
  // Show retry button
}
```

**Timeout Handling**:
```typescript
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};
```

#### 2. Data Validation Errors

**Missing Data**:
```typescript
const validateBarangayData = (data: BarangayComparisonData) => {
  if (!data.service_scores) {
    return {
      valid: false,
      message: 'Service scores not available for this barangay'
    };
  }
  
  if (Object.values(data.service_scores).some(score => score === null)) {
    return {
      valid: false,
      message: 'Some service area data is missing'
    };
  }
  
  return { valid: true };
};
```

**Display Strategy**:
- Show "No Data" indicator for missing service areas
- Display partial data with clear indicators of what's missing
- Provide explanation tooltips
- Offer to view different cycle if current has no data

#### 3. Chart Rendering Errors

**Empty Data Sets**:
```typescript
const RadarChartComparison = ({ data }: RadarChartComparisonProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-gray-500">No data available</p>
          <p className="text-sm text-gray-400">Select barangays to compare</p>
        </div>
      </div>
    );
  }
  
  // Render chart
};
```

**Invalid Data Values**:
```typescript
const sanitizeChartData = (data: any[]) => {
  return data.map(item => ({
    ...item,
    value: isNaN(item.value) || item.value === null ? 0 : item.value
  }));
};
```

#### 4. User Input Errors

**Invalid Selections**:
```typescript
const handleBarangaySelection = (selectedIds: number[]) => {
  if (selectedIds.length < 2) {
    setError('Please select at least 2 barangays to compare');
    return;
  }
  
  if (selectedIds.length > 5) {
    setError('Maximum 5 barangays can be compared at once');
    return;
  }
  
  setError(null);
  fetchComparisonData(selectedIds);
};
```

### Error UI Components

**Error Banner**:
```typescript
const ErrorBanner = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
        <p className="text-red-700">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-red-600 hover:text-red-800 font-medium"
        >
          Retry
        </button>
      )}
    </div>
  </div>
);
```

**Loading States**:
```typescript
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="h-64 bg-gray-200 rounded mb-4"></div>
    <div className="h-32 bg-gray-200 rounded"></div>
  </div>
);
```



## Testing Strategy

### Unit Testing

#### Component Tests

**Test File**: `BarangayComparisonViewer.test.tsx`

```typescript
describe('BarangayComparisonViewer', () => {
  it('should render barangay selector', () => {
    render(<BarangayComparisonViewer />);
    expect(screen.getByText('Select Barangays')).toBeInTheDocument();
  });
  
  it('should show error when less than 2 barangays selected', () => {
    const { getByText } = render(<BarangayComparisonViewer />);
    // Select only 1 barangay
    fireEvent.click(getByText('Buguis'));
    expect(screen.getByText(/at least 2 barangays/i)).toBeInTheDocument();
  });
  
  it('should fetch comparison data when valid selection made', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ barangays: mockComparisonData })
    });
    global.fetch = mockFetch;
    
    render(<BarangayComparisonViewer />);
    // Select 2 barangays
    fireEvent.click(screen.getByText('Buguis'));
    fireEvent.click(screen.getByText('Poblacion'));
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics/barangay-comparison',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });
});
```

**Test File**: `RadarChartComparison.test.tsx`

```typescript
describe('RadarChartComparison', () => {
  const mockData = [
    {
      barangay_name: 'Buguis',
      scores: {
        financial: 85,
        disaster: 78,
        health: 82,
        peace: 90,
        infrastructure: 75,
        environmental: 80
      }
    }
  ];
  
  it('should render radar chart with correct data', () => {
    render(<RadarChartComparison data={mockData} colors={['#3b82f6']} />);
    expect(screen.getByText('Buguis')).toBeInTheDocument();
  });
  
  it('should show empty state when no data', () => {
    render(<RadarChartComparison data={[]} colors={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
  
  it('should display all 6 service areas', () => {
    render(<RadarChartComparison data={mockData} colors={['#3b82f6']} />);
    expect(screen.getByText('Financial')).toBeInTheDocument();
    expect(screen.getByText('Disaster')).toBeInTheDocument();
    expect(screen.getByText('Health')).toBeInTheDocument();
    expect(screen.getByText('Peace')).toBeInTheDocument();
    expect(screen.getByText('Infrastructure')).toBeInTheDocument();
    expect(screen.getByText('Environmental')).toBeInTheDocument();
  });
});
```

#### API Route Tests

**Test File**: `barangay-comparison.test.ts`

```typescript
describe('/api/analytics/barangay-comparison', () => {
  it('should return comparison data for valid request', async () => {
    const response = await POST({
      json: async () => ({
        barangay_ids: [1, 2],
        cycle_id: 18,
        metrics: ['service_scores', 'awards']
      })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.barangays).toHaveLength(2);
    expect(data.barangays[0]).toHaveProperty('service_scores');
  });
  
  it('should return 400 for invalid barangay count', async () => {
    const response = await POST({
      json: async () => ({
        barangay_ids: [1], // Only 1 barangay
        cycle_id: 18,
        metrics: ['service_scores']
      })
    });
    
    expect(response.status).toBe(400);
  });
  
  it('should handle missing cycle_id', async () => {
    const response = await POST({
      json: async () => ({
        barangay_ids: [1, 2],
        metrics: ['service_scores']
      })
    });
    
    expect(response.status).toBe(400);
  });
});
```

### Integration Testing

#### Tab Navigation Test

```typescript
describe('Analytics Dashboard Integration', () => {
  it('should navigate between tabs without losing state', async () => {
    render(<AnalyticsView />);
    
    // Select barangays in Tab 2
    fireEvent.click(screen.getByText('Barangay Comparison'));
    fireEvent.click(screen.getByText('Buguis'));
    fireEvent.click(screen.getByText('Poblacion'));
    
    // Switch to Tab 3
    fireEvent.click(screen.getByText('Service Deep Dive'));
    expect(screen.getByText('Select Service Area')).toBeInTheDocument();
    
    // Switch back to Tab 2
    fireEvent.click(screen.getByText('Barangay Comparison'));
    
    // Verify selections are preserved
    expect(screen.getByText('Buguis')).toHaveClass('selected');
    expect(screen.getByText('Poblacion')).toHaveClass('selected');
  });
});
```

#### Data Flow Test

```typescript
describe('Service Area Deep Dive Data Flow', () => {
  it('should fetch and display service rankings', async () => {
    const mockRankings = [
      { rank: 1, name: 'Poblacion', satisfaction: 92 },
      { rank: 2, name: 'Buguis', satisfaction: 85 }
    ];
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rankings: mockRankings })
    });
    
    render(<ServiceAreaDeepDive />);
    
    // Select service area
    fireEvent.change(screen.getByLabelText('Service Area'), {
      target: { value: 'financial' }
    });
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Poblacion')).toBeInTheDocument();
      expect(screen.getByText('92%')).toBeInTheDocument();
    });
  });
});
```

### End-to-End Testing

#### User Journey: Compare Barangays

```typescript
describe('E2E: Compare Barangays', () => {
  it('should allow user to compare multiple barangays', async () => {
    // Navigate to analytics dashboard
    await page.goto('http://localhost:3000/dashboard/analytics');
    
    // Click Barangay Comparison tab
    await page.click('text=Barangay Comparison');
    
    // Select 3 barangays
    await page.click('text=Select Barangays');
    await page.click('text=Buguis');
    await page.click('text=Poblacion');
    await page.click('text=Caningag');
    
    // Wait for radar chart to render
    await page.waitForSelector('.recharts-radar-chart');
    
    // Verify all 3 barangays appear in legend
    expect(await page.textContent('.recharts-legend')).toContain('Buguis');
    expect(await page.textContent('.recharts-legend')).toContain('Poblacion');
    expect(await page.textContent('.recharts-legend')).toContain('Caningag');
    
    // Verify action grid heatmap is visible
    await page.waitForSelector('.action-grid-heatmap');
    
    // Verify award timeline is visible
    await page.waitForSelector('.award-timeline');
  });
});
```

### Performance Testing

#### Load Time Benchmarks

```typescript
describe('Performance Tests', () => {
  it('should load barangay comparison in under 2 seconds', async () => {
    const startTime = performance.now();
    
    render(<BarangayComparisonViewer />);
    
    // Select barangays and wait for data
    fireEvent.click(screen.getByText('Buguis'));
    fireEvent.click(screen.getByText('Poblacion'));
    
    await waitFor(() => {
      expect(screen.getByText('Radar Chart')).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    expect(loadTime).toBeLessThan(2000);
  });
  
  it('should render 25 barangays in leaderboard efficiently', async () => {
    const mockLeaderboard = Array.from({ length: 25 }, (_, i) => ({
      rank: i + 1,
      name: `Barangay ${i + 1}`,
      total_awards: 25 - i
    }));
    
    const startTime = performance.now();
    
    render(<AwardLeaderboard data={mockLeaderboard} />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(500);
  });
});
```

### Accessibility Testing

```typescript
describe('Accessibility Tests', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<BarangayComparisonViewer />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should support keyboard navigation', async () => {
    render(<ServiceAreaDeepDive />);
    
    // Tab to service area selector
    userEvent.tab();
    expect(screen.getByLabelText('Service Area')).toHaveFocus();
    
    // Use arrow keys to select
    userEvent.keyboard('{ArrowDown}');
    userEvent.keyboard('{Enter}');
    
    // Verify selection worked
    await waitFor(() => {
      expect(screen.getByText('Financial Assistance')).toBeInTheDocument();
    });
  });
});
```



## Performance Optimization

### Caching Strategy

#### API Response Caching

```typescript
// Cache service area rankings for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const cache = new Map<string, { data: any; timestamp: number }>();

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Usage in API route
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cacheKey = `rankings-${searchParams.toString()}`;
  
  const cached = getCachedData(cacheKey);
  if (cached) {
    return Response.json(cached);
  }
  
  const data = await fetchRankingsFromDB(searchParams);
  setCachedData(cacheKey, data);
  
  return Response.json(data);
}
```

#### Component-Level Caching

```typescript
// Use React.memo for expensive chart components
export const RadarChartComparison = React.memo(
  ({ data, colors }: RadarChartComparisonProps) => {
    // Chart rendering logic
  },
  (prevProps, nextProps) => {
    // Custom comparison function
    return (
      JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data) &&
      JSON.stringify(prevProps.colors) === JSON.stringify(nextProps.colors)
    );
  }
);

// Use useMemo for expensive calculations
const ServiceAreaDeepDive = () => {
  const [rankings, setRankings] = useState([]);
  
  const sortedRankings = useMemo(() => {
    return [...rankings].sort((a, b) => b.satisfaction - a.satisfaction);
  }, [rankings]);
  
  const topPerformers = useMemo(() => {
    return sortedRankings.slice(0, 3);
  }, [sortedRankings]);
  
  return (
    <div>
      <ServiceLeaderboard rankings={sortedRankings} />
      <TopPerformersCard performers={topPerformers} />
    </div>
  );
};
```

### Lazy Loading

#### Code Splitting

```typescript
// Lazy load chart components
const RadarChartComparison = lazy(() => import('./charts/RadarChartComparison'));
const FunnelVisualization = lazy(() => import('./charts/FunnelVisualization'));
const AwardHistoryTimeline = lazy(() => import('./charts/AwardHistoryTimeline'));

const BarangayComparisonViewer = () => {
  return (
    <div>
      <Suspense fallback={<LoadingSkeleton />}>
        <RadarChartComparison data={data} />
      </Suspense>
    </div>
  );
};
```

#### Data Pagination

```typescript
// Paginate large leaderboards
const AwardLeaderboard = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  
  const { data, loading } = usePaginatedData(
    '/api/analytics/award-leaderboard',
    { page, pageSize }
  );
  
  return (
    <div>
      <LeaderboardTable data={data} />
      <Pagination
        currentPage={page}
        totalPages={Math.ceil(data.total / pageSize)}
        onPageChange={setPage}
      />
    </div>
  );
};
```

### Database Optimization

#### Indexed Queries

```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_ml_cache_cycle_barangay ON ml_cache(cycle_id, barangay_id);
CREATE INDEX idx_cycle_awards_barangay ON cycle_awards(barangay_id);
CREATE INDEX idx_survey_cycles_year ON survey_cycles(year);

-- Composite index for service area rankings
CREATE INDEX idx_ml_cache_service_scores ON ml_cache(
  cycle_id,
  financial_assistance_satisfaction,
  disaster_preparedness_satisfaction,
  health_services_satisfaction,
  peace_and_order_satisfaction,
  infrastructure_satisfaction,
  environmental_management_satisfaction
);
```

#### Query Optimization

```sql
-- Use materialized view for award statistics (refreshed periodically)
CREATE MATERIALIZED VIEW award_statistics AS
SELECT 
  b.id as barangay_id,
  b.name,
  COUNT(ca.id) as total_awards,
  MAX(sc.year) as last_award_year,
  ROUND(COUNT(ca.id)::numeric / NULLIF(COUNT(DISTINCT sc.id), 0)::numeric, 2) as win_rate
FROM barangays b
LEFT JOIN cycle_awards ca ON b.id = ca.barangay_id
LEFT JOIN survey_cycles sc ON ca.cycle_id = sc.id
GROUP BY b.id, b.name;

-- Refresh materialized view after award updates
REFRESH MATERIALIZED VIEW award_statistics;
```

### Bundle Size Optimization

#### Tree Shaking

```typescript
// Import only needed Recharts components
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

// Instead of:
// import * as Recharts from 'recharts';
```

#### Dynamic Imports

```typescript
// Load heavy libraries only when needed
const exportToPDF = async (data: any) => {
  const jsPDF = await import('jspdf');
  const doc = new jsPDF.default();
  // Generate PDF
};
```

### Rendering Optimization

#### Virtual Scrolling for Large Lists

```typescript
import { FixedSizeList } from 'react-window';

const AwardLeaderboard = ({ data }: { data: AwardLeaderboardEntry[] }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style} className="leaderboard-row">
      <span>{data[index].rank}</span>
      <span>{data[index].name}</span>
      <span>{data[index].total_awards}</span>
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={data.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

#### Debounced Search

```typescript
import { useDebouncedCallback } from 'use-debounce';

const SearchableLeaderboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  
  const debouncedSearch = useDebouncedCallback((term: string) => {
    const filtered = data.filter(item =>
      item.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredData(filtered);
  }, 300);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };
  
  return (
    <input
      type="text"
      value={searchTerm}
      onChange={handleSearch}
      placeholder="Search barangays..."
    />
  );
};
```



## Accessibility Considerations

### WCAG 2.1 AA Compliance

#### Color Contrast

```typescript
// Color palette with WCAG AA compliant contrast ratios
const colors = {
  excellent: '#059669', // Green - 4.5:1 contrast on white
  good: '#2563eb',      // Blue - 4.5:1 contrast on white
  fair: '#d97706',      // Orange - 4.5:1 contrast on white
  poor: '#dc2626',      // Red - 4.5:1 contrast on white
  text: '#1f2937',      // Dark gray - 12:1 contrast on white
  textLight: '#6b7280'  // Medium gray - 4.5:1 contrast on white
};

// Ensure chart colors are distinguishable for color-blind users
const colorBlindSafeColors = [
  '#0173B2', // Blue
  '#DE8F05', // Orange
  '#029E73', // Green
  '#CC78BC', // Purple
  '#CA9161', // Brown
  '#949494'  // Gray
];
```

#### Keyboard Navigation

```typescript
const BarangaySelector = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const barangays = ['Buguis', 'Poblacion', 'Caningag'];
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, barangays.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleSelect(barangays[selectedIndex]);
        break;
      case 'Escape':
        e.preventDefault();
        handleClose();
        break;
    }
  };
  
  return (
    <div
      role="listbox"
      aria-label="Select barangays to compare"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {barangays.map((name, index) => (
        <div
          key={name}
          role="option"
          aria-selected={index === selectedIndex}
          className={index === selectedIndex ? 'focused' : ''}
        >
          {name}
        </div>
      ))}
    </div>
  );
};
```

#### Screen Reader Support

```typescript
const RadarChartComparison = ({ data }: RadarChartComparisonProps) => {
  // Generate text description for screen readers
  const chartDescription = useMemo(() => {
    return data.map(barangay => {
      const scores = Object.entries(barangay.scores)
        .map(([area, score]) => `${area}: ${score}%`)
        .join(', ');
      return `${barangay.barangay_name} scores: ${scores}`;
    }).join('. ');
  }, [data]);
  
  return (
    <div>
      {/* Visual chart */}
      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={transformedData}>
            {/* Chart components */}
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Screen reader accessible description */}
      <div className="sr-only" role="img" aria-label={chartDescription}>
        {chartDescription}
      </div>
      
      {/* Data table alternative */}
      <details className="mt-4">
        <summary>View data table</summary>
        <table>
          <thead>
            <tr>
              <th>Barangay</th>
              {Object.keys(data[0].scores).map(area => (
                <th key={area}>{area}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(barangay => (
              <tr key={barangay.barangay_name}>
                <td>{barangay.barangay_name}</td>
                {Object.values(barangay.scores).map((score, i) => (
                  <td key={i}>{score}%</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
};
```

#### Focus Management

```typescript
const AnalyticsView = () => {
  const [activeTab, setActiveTab] = useState(0);
  const tabPanelRef = useRef<HTMLDivElement>(null);
  
  const handleTabChange = (newTab: number) => {
    setActiveTab(newTab);
    
    // Move focus to tab panel content
    setTimeout(() => {
      tabPanelRef.current?.focus();
    }, 0);
  };
  
  return (
    <div>
      <div role="tablist" aria-label="Analytics views">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => handleTabChange(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div
        ref={tabPanelRef}
        role="tabpanel"
        id={`tabpanel-${tabs[activeTab].id}`}
        aria-labelledby={`tab-${tabs[activeTab].id}`}
        tabIndex={0}
      >
        {/* Tab content */}
      </div>
    </div>
  );
};
```

#### ARIA Labels and Descriptions

```typescript
const ServiceLeaderboard = ({ rankings }: ServiceLeaderboardProps) => {
  return (
    <table
      role="table"
      aria-label="Service area rankings"
      aria-describedby="leaderboard-description"
    >
      <caption id="leaderboard-description" className="sr-only">
        Rankings of all barangays for the selected service area, 
        sorted by satisfaction score from highest to lowest
      </caption>
      <thead>
        <tr>
          <th scope="col" aria-sort="descending">Rank</th>
          <th scope="col">Barangay</th>
          <th scope="col">Satisfaction</th>
          <th scope="col">Trend</th>
        </tr>
      </thead>
      <tbody>
        {rankings.map((item) => (
          <tr key={item.barangay_id}>
            <td>{item.rank}</td>
            <td>{item.name}</td>
            <td>
              <span aria-label={`${item.satisfaction} percent satisfaction`}>
                {item.satisfaction}%
              </span>
            </td>
            <td>
              <span
                aria-label={`Trend: ${item.trend}`}
                role="img"
              >
                {item.trend === 'improving' ? '↑' : 
                 item.trend === 'declining' ? '↓' : '→'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

### Mobile Responsiveness

#### Responsive Breakpoints

```typescript
// Tailwind CSS breakpoints
const breakpoints = {
  sm: '640px',   // Small devices (phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (desktops)
  xl: '1280px',  // Extra large devices
  '2xl': '1536px' // 2X large devices
};

// Responsive chart sizing
const RadarChartComparison = ({ data }: RadarChartComparisonProps) => {
  const [chartSize, setChartSize] = useState({ width: 600, height: 400 });
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setChartSize({ width: 300, height: 300 });
      } else if (width < 1024) {
        setChartSize({ width: 400, height: 350 });
      } else {
        setChartSize({ width: 600, height: 400 });
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <ResponsiveContainer width="100%" height={chartSize.height}>
      <RadarChart data={data}>
        {/* Chart components */}
      </RadarChart>
    </ResponsiveContainer>
  );
};
```

#### Mobile-Optimized Layouts

```typescript
const BarangayComparisonViewer = () => {
  return (
    <div className="space-y-6">
      {/* Barangay selector - full width on mobile */}
      <div className="w-full md:w-1/2">
        <BarangayMultiSelect />
      </div>
      
      {/* Charts - stack vertically on mobile, side-by-side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="w-full">
          <RadarChartComparison data={data} />
        </div>
        <div className="w-full">
          <ActionGridHeatmap data={data} />
        </div>
      </div>
      
      {/* Timeline - full width on all devices */}
      <div className="w-full">
        <AwardTimeline data={data} />
      </div>
    </div>
  );
};
```

#### Touch-Friendly Interactions

```typescript
const TouchFriendlyButton = ({ children, onClick }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="
        min-h-[44px] min-w-[44px]  /* Minimum touch target size */
        px-4 py-2
        text-base                   /* Readable text size */
        rounded-lg
        active:scale-95             /* Visual feedback on touch */
        transition-transform
      "
    >
      {children}
    </button>
  );
};

// Swipeable tabs for mobile
const MobileTabNavigation = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  const handlers = useSwipeable({
    onSwipedLeft: () => setActiveTab(prev => Math.min(prev + 1, tabs.length - 1)),
    onSwipedRight: () => setActiveTab(prev => Math.max(prev - 1, 0)),
    trackMouse: false
  });
  
  return (
    <div {...handlers}>
      {/* Tab content */}
    </div>
  );
};
```



## Design Patterns and Best Practices

### Component Design Patterns

#### Container/Presenter Pattern

```typescript
// Container component - handles data fetching and state
const BarangayComparisonContainer = () => {
  const [selectedBarangays, setSelectedBarangays] = useState<number[]>([]);
  const [data, setData] = useState<BarangayComparisonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (selectedBarangays.length >= 2) {
      fetchComparisonData();
    }
  }, [selectedBarangays]);
  
  const fetchComparisonData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analytics/barangay-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barangay_ids: selectedBarangays,
          cycle_id: currentCycleId,
          metrics: ['service_scores', 'awards']
        })
      });
      
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const result = await response.json();
      setData(result.barangays);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <BarangayComparisonPresenter
      selectedBarangays={selectedBarangays}
      onBarangaySelect={setSelectedBarangays}
      data={data}
      loading={loading}
      error={error}
      onRetry={fetchComparisonData}
    />
  );
};

// Presenter component - pure UI rendering
const BarangayComparisonPresenter = ({
  selectedBarangays,
  onBarangaySelect,
  data,
  loading,
  error,
  onRetry
}: BarangayComparisonPresenterProps) => {
  if (error) {
    return <ErrorBanner message={error} onRetry={onRetry} />;
  }
  
  if (loading) {
    return <LoadingSkeleton />;
  }
  
  return (
    <div>
      <BarangayMultiSelect
        selected={selectedBarangays}
        onChange={onBarangaySelect}
      />
      {data.length > 0 && (
        <>
          <RadarChartComparison data={data} />
          <ActionGridHeatmap data={data} />
          <AwardTimeline data={data} />
        </>
      )}
    </div>
  );
};
```

#### Custom Hooks Pattern

```typescript
// Custom hook for data fetching
const useBarangayComparison = (barangayIds: number[], cycleId: number) => {
  const [data, setData] = useState<BarangayComparisonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    if (barangayIds.length < 2) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analytics/barangay-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barangay_ids: barangayIds,
          cycle_id: cycleId,
          metrics: ['service_scores', 'awards']
        })
      });
      
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const result = await response.json();
      setData(result.barangays);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [barangayIds, cycleId]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { data, loading, error, refetch: fetchData };
};

// Usage
const BarangayComparisonViewer = () => {
  const [selectedBarangays, setSelectedBarangays] = useState<number[]>([]);
  const { data, loading, error, refetch } = useBarangayComparison(
    selectedBarangays,
    currentCycleId
  );
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};
```

#### Compound Components Pattern

```typescript
// Parent component
const ServiceAreaDeepDive = ({ children }: { children: React.ReactNode }) => {
  const [selectedService, setSelectedService] = useState<ServiceAreaType>('financial');
  const [data, setData] = useState<ServiceAreaData | null>(null);
  
  const context = {
    selectedService,
    setSelectedService,
    data,
    setData
  };
  
  return (
    <ServiceAreaContext.Provider value={context}>
      <div className="service-area-deep-dive">
        {children}
      </div>
    </ServiceAreaContext.Provider>
  );
};

// Child components
ServiceAreaDeepDive.Selector = () => {
  const { selectedService, setSelectedService } = useServiceAreaContext();
  
  return (
    <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
      <option value="financial">Financial Assistance</option>
      <option value="disaster">Disaster Preparedness</option>
      {/* Other options */}
    </select>
  );
};

ServiceAreaDeepDive.Leaderboard = () => {
  const { data } = useServiceAreaContext();
  
  return <ServiceLeaderboard rankings={data?.rankings || []} />;
};

ServiceAreaDeepDive.Funnel = () => {
  const { data } = useServiceAreaContext();
  
  return <FunnelVisualization data={data?.funnel} />;
};

// Usage
const ServiceAreaPage = () => (
  <ServiceAreaDeepDive>
    <ServiceAreaDeepDive.Selector />
    <ServiceAreaDeepDive.Leaderboard />
    <ServiceAreaDeepDive.Funnel />
  </ServiceAreaDeepDive>
);
```

### State Management

#### Context for Shared State

```typescript
// Analytics context for shared state across tabs
interface AnalyticsContextType {
  currentCycleId: number;
  setCurrentCycleId: (id: number) => void;
  barangays: Barangay[];
  cycles: SurveyCycle[];
  loading: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentCycleId, setCurrentCycleId] = useState<number>(18);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [cycles, setCycles] = useState<SurveyCycle[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch initial data
    Promise.all([
      fetch('/api/barangays').then(r => r.json()),
      fetch('/api/survey-cycles').then(r => r.json())
    ]).then(([barangaysData, cyclesData]) => {
      setBarangays(barangaysData);
      setCycles(cyclesData);
      setLoading(false);
    });
  }, []);
  
  const value = {
    currentCycleId,
    setCurrentCycleId,
    barangays,
    cycles,
    loading
  };
  
  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
};
```

### Code Organization

#### File Structure

```
src/
├── components/
│   └── dashboard/
│       ├── AnalyticsView.tsx
│       ├── HistoricalCycleViewer.tsx
│       ├── BarangayComparisonViewer.tsx
│       ├── ServiceAreaDeepDive.tsx
│       ├── OverallAnalytics.tsx
│       ├── AwardLeaderboard.tsx
│       │
│       ├── charts/
│       │   ├── RadarChartComparison.tsx
│       │   ├── ActionGridHeatmap.tsx
│       │   ├── AwardTimeline.tsx
│       │   ├── ServiceLeaderboard.tsx
│       │   ├── FunnelVisualization.tsx
│       │   ├── ServiceTrendChart.tsx
│       │   ├── AwardHistoryTimeline.tsx
│       │   └── StreakTracker.tsx
│       │
│       ├── shared/
│       │   ├── ErrorBanner.tsx
│       │   ├── LoadingSkeleton.tsx
│       │   ├── EmptyState.tsx
│       │   └── Tooltip.tsx
│       │
│       └── index.ts
│
├── hooks/
│   ├── useBarangayComparison.ts
│   ├── useServiceAreaRankings.ts
│   ├── useAwardLeaderboard.ts
│   └── useAnalytics.ts
│
├── contexts/
│   └── AnalyticsContext.tsx
│
├── types/
│   ├── analytics.ts
│   ├── barangay.ts
│   └── awards.ts
│
├── utils/
│   ├── chartHelpers.ts
│   ├── dataTransformers.ts
│   └── validators.ts
│
└── app/
    └── api/
        └── analytics/
            ├── barangay-comparison/
            │   └── route.ts
            ├── service-area-rankings/
            │   └── route.ts
            ├── service-trends/
            │   └── route.ts
            └── award-leaderboard/
                └── route.ts
```

### TypeScript Best Practices

#### Strict Type Definitions

```typescript
// types/analytics.ts

export type ServiceAreaType = 
  | 'financial' 
  | 'disaster' 
  | 'health' 
  | 'peace' 
  | 'infrastructure' 
  | 'environmental';

export interface ServiceScores {
  financial: number;
  disaster: number;
  health: number;
  peace: number;
  infrastructure: number;
  environmental: number;
}

export interface BarangayComparisonData {
  barangay_id: number;
  name: string;
  service_scores: ServiceScores;
  overall_satisfaction: number;
  awards: AwardData;
  action_grid: ActionGridData;
}

export interface AwardData {
  total: number;
  consecutive: number;
  win_rate: number;
}

export interface ActionGridData {
  maintain: ServiceAreaType[];
  fix_now: ServiceAreaType[];
  monitor: ServiceAreaType[];
  low_priority: ServiceAreaType[];
}

// Type guards
export const isServiceAreaType = (value: string): value is ServiceAreaType => {
  return ['financial', 'disaster', 'health', 'peace', 'infrastructure', 'environmental']
    .includes(value);
};

export const isValidServiceScores = (scores: any): scores is ServiceScores => {
  return (
    typeof scores === 'object' &&
    typeof scores.financial === 'number' &&
    typeof scores.disaster === 'number' &&
    typeof scores.health === 'number' &&
    typeof scores.peace === 'number' &&
    typeof scores.infrastructure === 'number' &&
    typeof scores.environmental === 'number'
  );
};
```



## Security Considerations

### API Security

#### Authentication and Authorization

```typescript
// Middleware for API routes
import { createClient } from '@/lib/supabase/server';

export async function authenticateRequest(request: Request) {
  const supabase = createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return {
      authenticated: false,
      error: 'Unauthorized'
    };
  }
  
  return {
    authenticated: true,
    user
  };
}

// Usage in API route
export async function POST(request: Request) {
  const auth = await authenticateRequest(request);
  
  if (!auth.authenticated) {
    return Response.json(
      { error: auth.error },
      { status: 401 }
    );
  }
  
  // Process request
}
```

#### Input Validation

```typescript
import { z } from 'zod';

// Request validation schemas
const BarangayComparisonSchema = z.object({
  barangay_ids: z.array(z.number().int().positive())
    .min(2, 'At least 2 barangays required')
    .max(5, 'Maximum 5 barangays allowed'),
  cycle_id: z.number().int().positive(),
  metrics: z.array(z.enum(['service_scores', 'awards', 'trends']))
});

const ServiceAreaRankingsSchema = z.object({
  service_area: z.enum(['financial', 'disaster', 'health', 'peace', 'infrastructure', 'environmental']),
  cycle_id: z.number().int().positive()
});

// Usage in API route
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = BarangayComparisonSchema.parse(body);
    
    // Process validated data
    const result = await fetchComparisonData(validated);
    
    return Response.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### SQL Injection Prevention

```typescript
// Use parameterized queries
const getServiceAreaRankings = async (serviceArea: string, cycleId: number) => {
  const supabase = createClient();
  
  // Parameterized query - safe from SQL injection
  const { data, error } = await supabase
    .from('ml_cache')
    .select(`
      barangay_id,
      barangays!inner(name),
      ${serviceArea}_satisfaction as satisfaction
    `)
    .eq('cycle_id', cycleId)
    .order(`${serviceArea}_satisfaction`, { ascending: false });
  
  if (error) throw error;
  
  return data;
};

// NEVER do this (vulnerable to SQL injection):
// const query = `SELECT * FROM ml_cache WHERE cycle_id = ${cycleId}`;
```

#### Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);
  
  if (!success) {
    return Response.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString()
        }
      }
    );
  }
  
  // Process request
}
```

### Data Privacy

#### Sensitive Data Handling

```typescript
// Sanitize data before sending to client
const sanitizeBarangayData = (data: BarangayComparisonData) => {
  return {
    barangay_id: data.barangay_id,
    name: data.name,
    service_scores: data.service_scores,
    overall_satisfaction: data.overall_satisfaction,
    awards: data.awards,
    // Exclude any sensitive fields
    // Do not include: internal_notes, contact_info, etc.
  };
};

// Apply sanitization in API route
export async function POST(request: Request) {
  const rawData = await fetchComparisonData(validated);
  const sanitizedData = rawData.map(sanitizeBarangayData);
  
  return Response.json({ barangays: sanitizedData });
}
```

#### CORS Configuration

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGIN || 'https://yourdomain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

### XSS Prevention

```typescript
// Sanitize user input before rendering
import DOMPurify from 'isomorphic-dompurify';

const SafeHTML = ({ html }: { html: string }) => {
  const sanitized = DOMPurify.sanitize(html);
  
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};

// Escape special characters in search queries
const escapeRegex = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const SearchableLeaderboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/<[^>]*>/g, ''); // Remove HTML tags
    setSearchTerm(sanitized);
  };
  
  return (
    <input
      type="text"
      value={searchTerm}
      onChange={handleSearch}
      placeholder="Search barangays..."
    />
  );
};
```

## Deployment Considerations

### Environment Variables

```bash
# .env.local
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ML_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://pulse.gov.ph
```

### Build Optimization

```typescript
// next.config.ts
const nextConfig = {
  // Enable SWC minification
  swcMinify: true,
  
  // Optimize images
  images: {
    domains: ['yourdomain.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Enable compression
  compress: true,
  
  // Production source maps (for debugging)
  productionBrowserSourceMaps: false,
  
  // Analyze bundle size
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};
```

### Monitoring and Logging

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  },
  
  error: (message: string, error?: Error, meta?: any) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  },
  
  warn: (message: string, meta?: any) => {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  }
};

// Usage in API route
export async function POST(request: Request) {
  try {
    logger.info('Barangay comparison request received', {
      endpoint: '/api/analytics/barangay-comparison'
    });
    
    const result = await fetchComparisonData(validated);
    
    logger.info('Barangay comparison successful', {
      barangay_count: result.barangays.length
    });
    
    return Response.json(result);
  } catch (error) {
    logger.error('Barangay comparison failed', error as Error, {
      endpoint: '/api/analytics/barangay-comparison'
    });
    
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Migration Strategy

### Phase 1: Preparation

1. **Backup existing components**:
   ```bash
   cp src/components/dashboard/CycleComparisonViewer.tsx src/components/dashboard/CycleComparisonViewer.backup.tsx
   cp src/components/dashboard/HistoricalTrendAnalysis.tsx src/components/dashboard/HistoricalTrendAnalysis.backup.tsx
   ```

2. **Create feature branch**:
   ```bash
   git checkout -b feature/enhanced-analytics-dashboard
   ```

3. **Set up new directory structure**:
   ```bash
   mkdir -p src/components/dashboard/charts
   mkdir -p src/hooks
   mkdir -p src/types
   ```

### Phase 2: Incremental Implementation

1. **Week 1**: Implement Tab 2 (Barangay Comparison)
   - Create new API endpoint
   - Rename and refactor component
   - Build chart components
   - Test thoroughly

2. **Week 2**: Implement Tab 3 (Service Deep Dive)
   - Create new API endpoints
   - Rename and refactor component
   - Build chart components
   - Test thoroughly

3. **Week 3**: Implement Tab 5 (Award Leaderboard) + Enhancements
   - Create new API endpoint
   - Build new component
   - Enhance existing tabs
   - Test thoroughly

4. **Week 4**: Polish and Deploy
   - Cross-browser testing
   - Performance optimization
   - Documentation
   - Production deployment

### Phase 3: Rollback Plan

```typescript
// Feature flag for gradual rollout
const useEnhancedAnalytics = () => {
  const [enabled, setEnabled] = useState(false);
  
  useEffect(() => {
    // Check feature flag from environment or database
    const featureEnabled = process.env.NEXT_PUBLIC_ENHANCED_ANALYTICS === 'true';
    setEnabled(featureEnabled);
  }, []);
  
  return enabled;
};

// Usage in AnalyticsView
const AnalyticsView = () => {
  const enhancedEnabled = useEnhancedAnalytics();
  
  if (!enhancedEnabled) {
    // Render old version
    return <LegacyAnalyticsView />;
  }
  
  // Render new version
  return <EnhancedAnalyticsView />;
};
```

## Summary

This design document provides a comprehensive blueprint for implementing the Enhanced Analytics Dashboard. The design follows modern React patterns, ensures accessibility and performance, and maintains security best practices. The hybrid approach preserves essential administrative functionality while introducing powerful new analytics capabilities focused on quality metrics, service area performance, and award tracking.

Key design decisions:
- **Component architecture**: Container/Presenter pattern for separation of concerns
- **State management**: Context API for shared state, custom hooks for data fetching
- **Visualization**: Recharts library with custom components for specialized charts
- **API design**: RESTful endpoints with proper validation and error handling
- **Performance**: Caching, lazy loading, and optimized queries
- **Accessibility**: WCAG 2.1 AA compliance with keyboard navigation and screen reader support
- **Security**: Authentication, input validation, SQL injection prevention, rate limiting
- **Testing**: Comprehensive unit, integration, and E2E tests
- **Deployment**: Incremental rollout with feature flags and rollback capability

The design is ready for implementation following the task list in the next phase of the spec workflow.
