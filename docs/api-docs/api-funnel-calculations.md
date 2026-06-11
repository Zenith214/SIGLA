# API Documentation: Funnel Calculation Endpoints

## Overview

This document describes the API endpoints that implement the cascading funnel calculation methodology for service delivery metrics. The funnel approach accurately models the service delivery journey through three sequential stages:

1. **Awareness** - Calculated from all respondents
2. **Availment** - Calculated only from aware respondents  
3. **Satisfaction** - Calculated only from respondents who availed services

This methodology ensures each stage uses the appropriate population as its denominator, providing accurate metrics that reflect real-world service progression.

## Key Concepts

### Cascading Funnel Methodology

Unlike independent calculations that use total respondents as the denominator for all metrics, the cascading funnel approach uses:

- **Awareness denominator**: Total respondents
- **Availment denominator**: Count of aware respondents (from Stage 1)
- **Satisfaction denominator**: Count of respondents who availed services (from Stage 2)

This reflects the logical progression: residents cannot avail a service they're unaware of, and cannot rate satisfaction for a service they haven't used.

### Structured Metrics Format

All funnel metrics are returned in a structured format with three fields:

```typescript
interface FunnelStageMetrics {
  count: number;           // Numerator (e.g., number of aware respondents)
  total: number;           // Denominator (e.g., total respondents for this stage)
  percentage: number | null; // Calculated percentage, or null if total is 0
}
```

This structure provides:
- **Transparency**: See exactly how percentages are calculated
- **Debugging**: Verify denominators are correct at each stage
- **Visualization**: Display both absolute numbers and percentages
- **Edge case handling**: Distinguish between 0% (valid) and null (undefined)

---

## Executive Summary API

### Endpoint

```
POST /api/ai/executive-summary
```

### Description

Generates AI-powered executive summaries and action plans based on survey data for a specific barangay. Uses the cascading funnel methodology to calculate service delivery metrics.

### Request

#### Headers
```
Content-Type: application/json
```

#### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `barangayId` | number | Yes | ID of the barangay to analyze |
| `cycleId` | number | Yes | ID of the survey cycle |
| `forceRefresh` | boolean | No | If true, bypasses cache and recalculates (default: false) |

#### Example Request

```json
{
  "barangayId": 17,
  "cycleId": 3,
  "forceRefresh": false
}
```

### Response

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "barangay_id": 17,
    "cycle_id": 3,
    "executiveSummary": "The survey results for Barangay XYZ show...",
    "keyFindings": [
      "High awareness but low availment in financial services",
      "Strong satisfaction among disaster response service users",
      "Safety services show consistent performance across all stages"
    ],
    "criticalIssues": [
      {
        "issue": "Low service availment despite high awareness",
        "impact": "High",
        "affectedArea": "financial",
        "recommendation": "Simplify application processes and reduce requirements"
      }
    ],
    "actionPlan": {
      "immediate": [
        {
          "action": "Launch information campaign for financial assistance programs",
          "timeline": "1-3 months",
          "priority": "High",
          "resources": "Marketing materials, community volunteers",
          "expectedOutcome": "Increase availment rate by 15%"
        }
      ],
      "shortTerm": [...],
      "longTerm": [...]
    },
    "recommendations": {
      "governance": ["Improve transparency in budget allocation"],
      "serviceDelivery": ["Streamline permit processing"],
      "communityEngagement": ["Conduct regular town hall meetings"]
    },
    "successMetrics": [
      {
        "metric": "Financial service availment rate",
        "target": "Increase from 45% to 60%",
        "timeline": "6 months"
      }
    ],
    "generated_at": "2025-10-26T10:30:00.000Z"
  },
  "_cache": {
    "cached": false,
    "stale": false,
    "computedAt": "2025-10-26T10:30:00.000Z",
    "expiresAt": "2025-11-02T10:30:00.000Z"
  }
}
```

### Service Scores Format

The executive summary internally uses service scores in the following structured format:

```typescript
interface ServiceFunnelMetrics {
  awareness: FunnelStageMetrics;
  availment: FunnelStageMetrics;
  satisfaction: FunnelStageMetrics;
}
```

#### Example Service Scores

```json
{
  "financial": {
    "awareness": {
      "count": 45,
      "total": 50,
      "percentage": 90.0
    },
    "availment": {
      "count": 30,
      "total": 45,
      "percentage": 66.7
    },
    "satisfaction": {
      "count": 25,
      "total": 30,
      "percentage": 83.3
    }
  },
  "disaster": {
    "awareness": {
      "count": 48,
      "total": 50,
      "percentage": 96.0
    },
    "availment": {
      "count": 20,
      "total": 48,
      "percentage": 41.7
    },
    "satisfaction": {
      "count": 18,
      "total": 20,
      "percentage": 90.0
    }
  }
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "error": "barangayId and cycleId are required"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to generate executive summary",
  "details": "Error message details"
}
```

---

## Funnel Analysis API

### Endpoint

```
GET /api/ml/funnel-analysis
```

### Description

Calculates detailed funnel progression metrics for service areas, including bottleneck identification, trends, and recommendations. Returns structured funnel data with counts and percentages for each stage.

### Request

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `barangayId` | number | Yes | ID of the barangay to analyze |
| `cycleId` | number | Yes | ID of the survey cycle |
| `refresh` | boolean | No | If true, bypasses cache and recalculates (default: false) |

#### Example Request

```
GET /api/ml/funnel-analysis?barangayId=17&cycleId=3&refresh=false
```

### Response

#### Success Response (200 OK)

```json
{
  "barangay_id": 17,
  "total_responses": 50,
  "overall_satisfaction": 78,
  "service_scores": {
    "financial": {
      "awareness": 90.0,
      "availment": 66.7,
      "satisfaction": 83.3,
      "need_action": 35.0,
      "awareness_metrics": {
        "count": 45,
        "total": 50,
        "percentage": 90.0
      },
      "availment_metrics": {
        "count": 30,
        "total": 45,
        "percentage": 66.7
      },
      "satisfaction_metrics": {
        "count": 25,
        "total": 30,
        "percentage": 83.3
      },
      "sample_size": 50,
      "confidence": "high",
      "bottleneck": "availment",
      "concerns": [
        "The application process is too complicated and takes too long",
        "Access to financial assistance is difficult",
        "Processing of applications needs improvement"
      ],
      "quotes": {
        "awareness": "More information campaigns needed about available services",
        "availment": "The application process is too complicated and takes too long",
        "satisfaction": "Good service, but more funding is needed for programs"
      },
      "recommendations": {
        "shortTerm": [
          "Simplify application and registration processes",
          "Extend service hours to accommodate more residents"
        ],
        "mediumTerm": [
          "Allocate additional budget for service improvements",
          "Upgrade facilities and equipment"
        ],
        "longTerm": [
          "Integrate digital solutions for service delivery",
          "Develop comprehensive service improvement plan"
        ]
      }
    },
    "disaster": {
      "awareness": 96.0,
      "availment": 41.7,
      "satisfaction": 90.0,
      "need_action": 25.0,
      "awareness_metrics": {
        "count": 48,
        "total": 50,
        "percentage": 96.0
      },
      "availment_metrics": {
        "count": 20,
        "total": 48,
        "percentage": 41.7
      },
      "satisfaction_metrics": {
        "count": 18,
        "total": 20,
        "percentage": 90.0
      },
      "sample_size": 50,
      "confidence": "high",
      "bottleneck": "availment",
      "concerns": [
        "Emergency response is slow and not well-coordinated",
        "Access to evacuation centers needs improvement",
        "Emergency supplies are insufficient"
      ],
      "quotes": {
        "awareness": "Not everyone knows where the evacuation centers are",
        "availment": "Emergency response is slow and not well-coordinated",
        "satisfaction": "Response was good but we need better equipment"
      },
      "recommendations": {
        "shortTerm": [
          "Simplify application and registration processes",
          "Extend service hours to accommodate more residents"
        ],
        "mediumTerm": [
          "Establish regular monitoring and feedback mechanisms",
          "Create service quality standards and benchmarks"
        ],
        "longTerm": [
          "Integrate digital solutions for service delivery",
          "Develop comprehensive service improvement plan"
        ]
      }
    }
  },
  "action_grid": {
    "financial": {
      "quadrant": "MAINTAIN_IMPROVE",
      "satisfaction_score": 83.3,
      "need_action_score": 35.0,
      "confidence": "high",
      "trend": {
        "change": 5,
        "direction": "up",
        "available": true,
        "previousScore": 78.3,
        "currentScore": 83.3,
        "previousCycle": "Q2 2025",
        "previousCycleYear": 2025
      }
    },
    "disaster": {
      "quadrant": "MAINTAIN_IMPROVE",
      "satisfaction_score": 90.0,
      "need_action_score": 25.0,
      "confidence": "high",
      "trend": {
        "change": 0,
        "direction": "baseline",
        "available": false,
        "message": "No historical data available for comparison"
      }
    }
  },
  "ml_insights": {},
  "recommendations": {},
  "data_quality": {},
  "_cache": {
    "cached": true,
    "stale": false,
    "computedAt": "2025-10-26T08:15:00.000Z",
    "expiresAt": "2025-10-26T20:15:00.000Z"
  }
}
```

### Field Definitions

#### Service Scores

| Field | Type | Description |
|-------|------|-------------|
| `awareness` | number | Percentage of all respondents who are aware of the service |
| `availment` | number | Percentage of aware respondents who availed the service |
| `satisfaction` | number | Percentage of respondents who availed and are satisfied |
| `need_action` | number | Calculated score indicating urgency of action needed |
| `awareness_metrics` | FunnelStageMetrics | Detailed awareness data with count, total, percentage |
| `availment_metrics` | FunnelStageMetrics | Detailed availment data with count, total, percentage |
| `satisfaction_metrics` | FunnelStageMetrics | Detailed satisfaction data with count, total, percentage |
| `sample_size` | number | Total number of respondents for this service area |
| `confidence` | string | Confidence level: "high" (≥5), "medium" (3-4), "low" (<3) |
| `bottleneck` | string | Identified bottleneck: "awareness", "availment", or "satisfaction" |
| `concerns` | string[] | Top 3 concerns extracted from survey responses |
| `quotes` | object | Representative quotes for each funnel stage |
| `recommendations` | object | Short-term, medium-term, and long-term recommendations |

#### FunnelStageMetrics

| Field | Type | Description |
|-------|------|-------------|
| `count` | number | Numerator (e.g., number of aware respondents) |
| `total` | number | Denominator (e.g., total respondents for this stage) |
| `percentage` | number \| null | Calculated percentage, or null if total is 0 |

#### Action Grid

| Field | Type | Description |
|-------|------|-------------|
| `quadrant` | string | Action priority quadrant based on satisfaction and need scores |
| `satisfaction_score` | number | Current satisfaction percentage |
| `need_action_score` | number | Calculated urgency score |
| `confidence` | string | Confidence level in the data |
| `trend` | object | Trend comparison with previous cycle |

#### Trend

| Field | Type | Description |
|-------|------|-------------|
| `change` | number | Percentage point change from previous cycle |
| `direction` | string | "up", "down", "stable", or "baseline" |
| `available` | boolean | Whether trend data is available |
| `previousScore` | number | Satisfaction score from previous cycle (if available) |
| `currentScore` | number | Current satisfaction score (if available) |
| `previousCycle` | string | Name of previous cycle (if available) |
| `previousCycleYear` | number | Year of previous cycle (if available) |
| `message` | string | Explanation if trend is unavailable |

### Error Responses

#### 400 Bad Request
```json
{
  "error": "barangayId parameter is required"
}
```

```json
{
  "error": "cycleId parameter is required"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to perform ML funnel analysis"
}
```

---

## Edge Cases

### Zero Awareness

When no respondents are aware of a service, subsequent stages return null percentages:

```json
{
  "financial": {
    "awareness": 0.0,
    "availment": 0.0,
    "satisfaction": 0.0,
    "awareness_metrics": {
      "count": 0,
      "total": 50,
      "percentage": 0.0
    },
    "availment_metrics": {
      "count": 0,
      "total": 0,
      "percentage": null
    },
    "satisfaction_metrics": {
      "count": 0,
      "total": 0,
      "percentage": null
    }
  }
}
```

**Interpretation**: 0% of respondents are aware. Availment and satisfaction cannot be calculated (null) because there are no aware respondents to evaluate.

### Zero Availment

When respondents are aware but none availed the service:

```json
{
  "disaster": {
    "awareness": 90.0,
    "availment": 0.0,
    "satisfaction": 0.0,
    "awareness_metrics": {
      "count": 45,
      "total": 50,
      "percentage": 90.0
    },
    "availment_metrics": {
      "count": 0,
      "total": 45,
      "percentage": 0.0
    },
    "satisfaction_metrics": {
      "count": 0,
      "total": 0,
      "percentage": null
    }
  }
}
```

**Interpretation**: 90% are aware, but 0% of aware respondents availed the service. Satisfaction cannot be calculated (null) because no one used the service.

### Missing Questions

When a service area has no awareness questions in the survey:

```json
{
  "safety": {
    "awareness": 0.0,
    "availment": 0.0,
    "satisfaction": 0.0,
    "awareness_metrics": {
      "count": 0,
      "total": 0,
      "percentage": null
    },
    "availment_metrics": {
      "count": 0,
      "total": 0,
      "percentage": null
    },
    "satisfaction_metrics": {
      "count": 0,
      "total": 0,
      "percentage": null
    }
  }
}
```

**Interpretation**: No data available for this service area. All stages return null because foundational questions are missing.

### Partial Data

When some respondents skip questions:

```json
{
  "social": {
    "awareness": 88.0,
    "availment": 70.5,
    "satisfaction": 85.7,
    "awareness_metrics": {
      "count": 44,
      "total": 50,
      "percentage": 88.0
    },
    "availment_metrics": {
      "count": 31,
      "total": 44,
      "percentage": 70.5
    },
    "satisfaction_metrics": {
      "count": 24,
      "total": 28,
      "percentage": 85.7
    }
  }
}
```

**Interpretation**: 44 out of 50 respondents answered awareness questions. Of those 44 aware respondents, 31 answered availment questions. Of those 31 who availed, 28 provided satisfaction ratings, with 24 being satisfied. Respondents who skip questions are excluded from subsequent stages.

---

## Backward Compatibility

### Legacy Format Support

The system maintains backward compatibility during the transition period. Older API consumers may still receive percentage-only responses:

```json
{
  "financial": {
    "awareness_score": 90.0,
    "availment_score": 66.7,
    "satisfaction_score": 83.3,
    "need_action_score": 35.0
  }
}
```

### New Format (Recommended)

New integrations should use the structured format with detailed metrics:

```json
{
  "financial": {
    "awareness": 90.0,
    "availment": 66.7,
    "satisfaction": 83.3,
    "need_action": 35.0,
    "awareness_metrics": {
      "count": 45,
      "total": 50,
      "percentage": 90.0
    },
    "availment_metrics": {
      "count": 30,
      "total": 45,
      "percentage": 66.7
    },
    "satisfaction_metrics": {
      "count": 25,
      "total": 30,
      "percentage": 83.3
    }
  }
}
```

---

## Migration Guide for Frontend Consumers

### Breaking Changes

1. **Denominator Changes**: Availment and satisfaction percentages now use different denominators
   - **Old**: All percentages used total respondents as denominator
   - **New**: Availment uses aware count; satisfaction uses availed count

2. **Metric Values**: Satisfaction percentages will generally increase (smaller denominator)
   - Example: If 25 out of 50 respondents are satisfied
   - **Old calculation**: 25/50 = 50%
   - **New calculation**: 25/30 (only availed) = 83.3%

3. **Null Values**: Percentages can now be null when calculations are undefined
   - **Old**: Always returned a number (often 0)
   - **New**: Returns null when denominator is 0

### Migration Steps

#### Step 1: Update Type Definitions

```typescript
// Old interface
interface ServiceScores {
  awareness_score: number;
  availment_score: number;
  satisfaction_score: number;
}

// New interface
interface FunnelStageMetrics {
  count: number;
  total: number;
  percentage: number | null;
}

interface ServiceScores {
  awareness: number;
  availment: number;
  satisfaction: number;
  awareness_metrics: FunnelStageMetrics;
  availment_metrics: FunnelStageMetrics;
  satisfaction_metrics: FunnelStageMetrics;
}
```

#### Step 2: Handle Null Values

```typescript
// Old code
const satisfactionDisplay = `${scores.satisfaction_score}%`;

// New code
const satisfactionDisplay = scores.satisfaction !== null 
  ? `${scores.satisfaction}%` 
  : 'No data';
```

#### Step 3: Display Detailed Metrics

```typescript
// Show both percentage and counts
const awarenessDisplay = scores.awareness_metrics.percentage !== null
  ? `${scores.awareness_metrics.percentage}% (${scores.awareness_metrics.count}/${scores.awareness_metrics.total})`
  : 'No data';
```

#### Step 4: Update Visualizations

```typescript
// Funnel chart data
const funnelData = [
  {
    stage: 'Awareness',
    value: scores.awareness_metrics.count,
    total: scores.awareness_metrics.total,
    percentage: scores.awareness_metrics.percentage
  },
  {
    stage: 'Availment',
    value: scores.availment_metrics.count,
    total: scores.availment_metrics.total,
    percentage: scores.availment_metrics.percentage
  },
  {
    stage: 'Satisfaction',
    value: scores.satisfaction_metrics.count,
    total: scores.satisfaction_metrics.total,
    percentage: scores.satisfaction_metrics.percentage
  }
];
```

### Historical Data Considerations

**Important**: Historical metrics calculated before the methodology change will differ from newly calculated metrics for the same data.

- **Satisfaction scores**: Will be higher with new methodology (smaller denominator)
- **Availment scores**: Will change based on aware population
- **Trend comparisons**: May show discontinuities at the methodology change point

**Recommendation**: When displaying historical trends, add a visual indicator or note explaining the methodology change date.

```typescript
// Example: Add methodology change indicator
const methodologyChangeDate = new Date('2025-10-26');
const dataDate = new Date(dataPoint.date);

if (dataDate >= methodologyChangeDate) {
  // Use new methodology label
  label = 'Satisfaction (Cascading Funnel)';
} else {
  // Use old methodology label
  label = 'Satisfaction (Legacy)';
}
```

---

## Cache Behavior

Both APIs implement intelligent caching to improve performance:

### Cache TTL

- **Executive Summary API**: 7 days (604,800 seconds)
- **Funnel Analysis API**: 12 hours (43,200 seconds)

### Cache Invalidation

Cache can be invalidated by:

1. **Force Refresh**: Set `forceRefresh=true` (Executive Summary) or `refresh=true` (Funnel Analysis)
2. **Manual Invalidation**: Run the cache invalidation script
3. **Automatic Expiration**: Cache expires after TTL period

### Cache Metadata

All responses include cache metadata:

```json
{
  "_cache": {
    "cached": true,
    "stale": false,
    "computedAt": "2025-10-26T08:15:00.000Z",
    "expiresAt": "2025-10-26T20:15:00.000Z"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `cached` | boolean | Whether response was served from cache |
| `stale` | boolean | Whether cached data is stale but still served |
| `computedAt` | string | ISO timestamp when data was computed |
| `expiresAt` | string | ISO timestamp when cache entry expires |

---

## Performance Considerations

### Response Times

- **Cached responses**: < 100ms
- **Fresh calculations**: 1-5 seconds (depending on data volume)
- **Large datasets** (10,000+ respondents): Up to 10 seconds

### Rate Limiting

No explicit rate limiting is implemented, but consider:

- Using cached responses when possible
- Avoiding unnecessary `forceRefresh` calls
- Batching requests for multiple barangays

### Optimization Tips

1. **Use cache**: Don't force refresh unless data has changed
2. **Batch operations**: Process multiple barangays in sequence rather than parallel
3. **Monitor cache hit rate**: High cache hit rates indicate good performance
4. **Pre-warm cache**: Run regeneration script after data updates

---

## Related Documentation

- [Funnel Methodology](./funnel-methodology.md) - Detailed explanation of the cascading funnel approach
- [Requirements Document](../.kiro/specs/funnel-calculation-methodology/requirements.md) - Formal requirements specification
- [Design Document](../.kiro/specs/funnel-calculation-methodology/design.md) - Technical design details
- [Implementation Tasks](../.kiro/specs/funnel-calculation-methodology/tasks.md) - Implementation checklist

---

## Support and Questions

For questions about the API or methodology:

1. Review the [Funnel Methodology documentation](./funnel-methodology.md)
2. Check the [Design Document](../.kiro/specs/funnel-calculation-methodology/design.md) for technical details
3. Examine the source code:
   - Shared utility: `src/lib/funnel-calculations.ts`
   - Executive Summary: `src/app/api/ai/executive-summary/route.ts`
   - Funnel Analysis: `src/app/api/ml/funnel-analysis/route.ts`

---

**Last Updated**: October 26, 2025  
**API Version**: 2.0 (Cascading Funnel Methodology)
