# NFA Analytics Quick Reference Guide

## Quick Start

### Calculate NFA Rate for a Single Indicator

```typescript
import { calculateNFARateForIndicator } from '@/lib/nfa-analytics-queries';
import { supabaseAdmin } from '@/lib/supabase';

const result = await calculateNFARateForIndicator(
  supabaseAdmin,
  'financial',                              // service area
  'need_for_action_binary_projects',        // binary field name
  cycleId,                                  // survey cycle ID
  barangayId                                // barangay ID
);

console.log(`NFA Rate: ${result.nfaRatePercentage}%`);
console.log(`${result.yesCount} out of ${result.totalResponses} need action`);
```

### Get All Indicators for a Service Area

```typescript
import { calculateNFARatesForServiceArea, SERVICE_INDICATORS } from '@/lib/nfa-analytics-queries';

const results = await calculateNFARatesForServiceArea(
  supabaseAdmin,
  'financial',  // service area
  cycleId,
  barangayId
);

results.forEach(indicator => {
  console.log(`${indicator.indicator}: ${indicator.nfaRatePercentage}%`);
});
```

### Compare Across All Service Areas

```typescript
import { calculateNFARatesAcrossAllServiceAreas } from '@/lib/nfa-analytics-queries';

const results = await calculateNFARatesAcrossAllServiceAreas(
  supabaseAdmin,
  cycleId,
  barangayId
);

results.forEach(area => {
  console.log(`${area.serviceArea}: ${area.nfaRatePercentage}%`);
});
```

## Service Indicator Reference

### All 14 Service Indicators

```typescript
import { SERVICE_INDICATORS } from '@/lib/nfa-analytics-queries';

// Financial Administration (4 indicators)
SERVICE_INDICATORS.financial.projects           // 'need_for_action_binary_projects'
SERVICE_INDICATORS.financial.financial          // 'need_for_action_binary_financial'
SERVICE_INDICATORS.financial.socialPrograms     // 'need_for_action_binary_socialPrograms'
SERVICE_INDICATORS.financial.corruption         // 'need_for_action_binary_corruption'

// Disaster Preparedness (2 indicators)
SERVICE_INDICATORS.disaster.disasterInfo        // 'need_for_action_binary_disasterInfo'
SERVICE_INDICATORS.disaster.evacuation          // 'need_for_action_binary_evacuation'

// Safety & Peace Order (3 indicators)
SERVICE_INDICATORS.safety.tanods                // 'need_for_action_binary_tanods'
SERVICE_INDICATORS.safety.lupon                 // 'need_for_action_binary_lupon'
SERVICE_INDICATORS.safety.antiDrug              // 'need_for_action_binary_antiDrug'

// Social Protection (3 indicators)
SERVICE_INDICATORS.social.healthServices        // 'need_for_action_binary_healthServices'
SERVICE_INDICATORS.social.womenChildrenProtection  // 'need_for_action_binary_womenChildrenProtection'
SERVICE_INDICATORS.social.communityParticipation   // 'need_for_action_binary_communityParticipation'

// Business Friendliness (1 indicator)
SERVICE_INDICATORS.business.businessClearance   // 'need_for_action_binary_businessClearance'

// Environmental Management (1 indicator)
SERVICE_INDICATORS.environmental.wasteManagement  // 'need_for_action_binary_wasteManagement'
```

## SQL Query Examples

### Basic NFA Rate Query

```sql
SELECT 
  COUNT(*) as total_responses,
  COUNT(*) FILTER (
    WHERE (data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
  ) as yes_count,
  ROUND((COUNT(*) FILTER (
    WHERE (data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
  )::numeric / COUNT(*)::numeric) * 100, 1) as nfa_rate_percentage
FROM survey_section
WHERE section_key = 'financial'
  AND survey_cycle_id = $1
  AND barangay_id = $2
  AND data ? 'need_for_action_binary_projects';
```

### Cross-Barangay Comparison

```sql
SELECT 
  b.barangay_name,
  COUNT(*) FILTER (
    WHERE (ss.data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
  )::numeric / COUNT(*)::numeric * 100 as nfa_rate
FROM survey_section ss
JOIN barangay b ON ss.barangay_id = b.barangay_id
WHERE ss.section_key = 'financial'
  AND ss.survey_cycle_id = $1
GROUP BY b.barangay_name
ORDER BY nfa_rate DESC;
```

### Trend Analysis

```sql
SELECT 
  sc.year,
  sc.name,
  COUNT(*) FILTER (
    WHERE (ss.data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
  )::numeric / COUNT(*)::numeric * 100 as nfa_rate
FROM survey_section ss
JOIN survey_cycle sc ON ss.survey_cycle_id = sc.cycle_id
WHERE ss.section_key = 'financial'
  AND ss.barangay_id = $1
GROUP BY sc.year, sc.name, sc.cycle_id
ORDER BY sc.year DESC;
```

## Common Patterns

### Handle Empty Results

```typescript
const result = await calculateNFARateForIndicator(...);

if (result.totalResponses === 0) {
  console.log('No data available');
} else {
  console.log(`NFA Rate: ${result.nfaRatePercentage}%`);
}
```

### Verify Independence from Suggestions

```typescript
import { verifyNFARateIndependence } from '@/lib/nfa-analytics-queries';

const verification = await verifyNFARateIndependence(
  supabaseAdmin,
  'financial',
  'need_for_action_binary_projects',
  'need_for_action_suggestion_projects',
  cycleId,
  barangayId
);

console.log('With suggestions:', verification.withSuggestions.nfaRatePercentage);
console.log('Without suggestions:', verification.withoutSuggestions.nfaRatePercentage);
console.log('Rates match:', verification.ratesMatch);
```

### Compare Barangays

```typescript
import { compareNFARatesAcrossBarangays } from '@/lib/nfa-analytics-queries';

const comparison = await compareNFARatesAcrossBarangays(
  supabaseAdmin,
  'financial',
  'need_for_action_binary_projects',
  cycleId
);

// Results are already sorted by NFA rate (descending)
console.log('Top 5 barangays needing action:');
comparison.slice(0, 5).forEach((b, i) => {
  console.log(`${i + 1}. ${b.barangayName}: ${b.nfaRatePercentage}%`);
});
```

### Trend Analysis

```typescript
import { calculateNFARateTrend } from '@/lib/nfa-analytics-queries';

const trend = await calculateNFARateTrend(
  supabaseAdmin,
  'financial',
  'need_for_action_binary_projects',
  barangayId
);

trend.forEach(cycle => {
  console.log(`${cycle.year} - ${cycle.cycleName}: ${cycle.nfaRatePercentage}%`);
});
```

## Performance Tips

### 1. Always Filter by Service Area First

```typescript
// GOOD: Efficient
WHERE section_key = 'financial' AND data ? 'need_for_action_binary_projects'

// BAD: Less efficient
WHERE data ? 'need_for_action_binary_projects' AND section_key = 'financial'
```

### 2. Use Batch Queries for Multiple Indicators

```typescript
// GOOD: Single function call for all indicators
const results = await calculateNFARatesForServiceArea(supabase, 'financial', cycleId, barangayId);

// BAD: Multiple individual calls
const projects = await calculateNFARateForIndicator(supabase, 'financial', 'need_for_action_binary_projects', ...);
const financial = await calculateNFARateForIndicator(supabase, 'financial', 'need_for_action_binary_financial', ...);
// ... etc
```

### 3. Cache Results When Appropriate

```typescript
import { getCachedOrCompute } from '@/lib/ml-cache';

const result = await getCachedOrCompute(
  'nfa-rate-financial-projects',
  { cycleId, barangayId },
  async () => {
    return await calculateNFARateForIndicator(
      supabase,
      'financial',
      'need_for_action_binary_projects',
      cycleId,
      barangayId
    );
  },
  { ttl: 3600 } // Cache for 1 hour
);
```

## Troubleshooting

### Query is Slow

1. Verify indexes exist:
   ```sql
   \d survey_section
   ```

2. Check index usage:
   ```sql
   EXPLAIN ANALYZE <your query>
   ```

3. Update statistics:
   ```sql
   ANALYZE survey_section;
   ```

### Incorrect Results

1. Check field naming:
   ```typescript
   console.log(SERVICE_INDICATORS.financial.projects);
   // Should output: 'need_for_action_binary_projects'
   ```

2. Verify data structure:
   ```sql
   SELECT data FROM survey_section WHERE section_key = 'financial' LIMIT 1;
   ```

3. Check for case sensitivity:
   ```sql
   SELECT DISTINCT data->>'need_for_action_binary_projects' as value
   FROM survey_section
   WHERE section_key = 'financial';
   ```

### No Data Returned

1. Check if data exists:
   ```sql
   SELECT COUNT(*) FROM survey_section
   WHERE section_key = 'financial'
     AND survey_cycle_id = $1
     AND barangay_id = $2;
   ```

2. Verify field exists:
   ```sql
   SELECT COUNT(*) FROM survey_section
   WHERE data ? 'need_for_action_binary_projects';
   ```

## Testing

### Run Unit Tests

```bash
# Test query utilities
npm test -- src/lib/__tests__/nfa-analytics-queries.test.ts

# Test calculation logic
npm test -- src/lib/__tests__/nfa-binary-calculation.test.ts
```

### Verify Database Performance

```bash
# Run performance verification script
psql -d your_database -f database/verify-nfa-analytics-performance.sql
```

## Related Documentation

- **Comprehensive Guide**: `docs/NFA_BINARY_SQL_OPTIMIZATION.md`
- **SQL Query Patterns**: `database/nfa-binary-analytics-queries.sql`
- **Implementation Summary**: `.kiro/specs/binary-need-for-action/TASK_10_SUMMARY.md`
- **Requirements**: `.kiro/specs/binary-need-for-action/requirements.md`
- **Design**: `.kiro/specs/binary-need-for-action/design.md`

## Support

For questions or issues:
1. Check the comprehensive documentation in `docs/NFA_BINARY_SQL_OPTIMIZATION.md`
2. Review SQL query patterns in `database/nfa-binary-analytics-queries.sql`
3. Run the verification script: `database/verify-nfa-analytics-performance.sql`
4. Check unit tests for usage examples
