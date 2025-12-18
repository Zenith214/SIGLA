# NFA Binary Field SQL Query Optimization

## Overview

This document describes the SQL query optimizations implemented for calculating Need for Action (NFA) rates using the new binary field approach. The optimizations ensure efficient querying of JSONB data in PostgreSQL with proper index usage.

**Requirements Addressed:** 4.1, 4.2, 4.5

## Database Schema

### Survey Section Table

The `survey_section` table stores survey responses with JSONB data:

```sql
CREATE TABLE survey_section (
  section_id SERIAL PRIMARY KEY,
  response_id INTEGER REFERENCES survey_response(response_id),
  section_key VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  survey_cycle_id INTEGER,
  barangay_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### JSONB Data Structure

Each service indicator has two fields in the JSONB data:
- `need_for_action_binary_{indicator}`: Binary response ("Yes"/"No" or "Oo"/"Hindi")
- `need_for_action_suggestion_{indicator}`: Optional suggestion text

Example:
```json
{
  "need_for_action_binary_projects": "Yes",
  "need_for_action_suggestion_projects": "Need more funding",
  "need_for_action_binary_financial": "No",
  "need_for_action_suggestion_financial": ""
}
```

## Indexes

### GIN Index on JSONB Data

A GIN (Generalized Inverted Index) index is created on the `data` column for efficient JSONB queries:

```sql
CREATE INDEX IF NOT EXISTS idx_survey_section_data_nfa_binary 
ON survey_section USING GIN (data jsonb_path_ops);
```

**Benefits:**
- Optimizes containment queries using the `?` operator
- Enables fast field existence checks
- Supports efficient JSONB field extraction

### Section Key Index

An index on `section_key` optimizes filtering by service area:

```sql
CREATE INDEX IF NOT EXISTS idx_survey_section_key 
ON survey_section(section_key);
```

## Query Patterns

### Pattern 1: Single Indicator NFA Rate

Calculate NFA Rate for a specific service indicator:

```sql
SELECT 
  COUNT(*) as total_responses,
  COUNT(*) FILTER (
    WHERE (data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
  ) as yes_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      ROUND((COUNT(*) FILTER (
        WHERE (data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
      )::numeric / COUNT(*)::numeric) * 100, 1)
    ELSE 0
  END as nfa_rate_percentage
FROM survey_section
WHERE section_key = 'financial'
  AND survey_cycle_id = $1
  AND barangay_id = $2
  AND data ? 'need_for_action_binary_projects';
```

**Key Optimizations:**
- Uses `COUNT(*) FILTER` for efficient conditional counting
- Filters by `section_key` first (indexed)
- Uses `data ? 'field_name'` to check field existence (GIN index)
- Handles both English and Tagalog responses with `IN` operator

### Pattern 2: All Indicators in Service Area

Calculate NFA Rates for all indicators within a service area:

```sql
WITH financial_indicators AS (
  SELECT 'projects' as indicator, 'need_for_action_binary_projects' as binary_field
  UNION ALL SELECT 'financial', 'need_for_action_binary_financial'
  UNION ALL SELECT 'socialPrograms', 'need_for_action_binary_socialPrograms'
  UNION ALL SELECT 'corruption', 'need_for_action_binary_corruption'
)
SELECT 
  fi.indicator,
  COUNT(*) as total_responses,
  COUNT(*) FILTER (
    WHERE (data->>fi.binary_field) IN ('Yes', 'Oo')
  ) as yes_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      ROUND((COUNT(*) FILTER (
        WHERE (data->>fi.binary_field) IN ('Yes', 'Oo')
      )::numeric / COUNT(*)::numeric) * 100, 1)
    ELSE 0
  END as nfa_rate_percentage
FROM survey_section ss
CROSS JOIN financial_indicators fi
WHERE ss.section_key = 'financial'
  AND ss.survey_cycle_id = $1
  AND ss.barangay_id = $2
  AND ss.data ? fi.binary_field
GROUP BY fi.indicator, fi.binary_field;
```

### Pattern 3: Cross-Barangay Comparison

Compare NFA Rates across multiple barangays:

```sql
SELECT 
  b.barangay_id,
  b.barangay_name,
  COUNT(*) as total_responses,
  COUNT(*) FILTER (
    WHERE (ss.data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
  ) as yes_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      ROUND((COUNT(*) FILTER (
        WHERE (ss.data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
      )::numeric / COUNT(*)::numeric) * 100, 1)
    ELSE 0
  END as nfa_rate_percentage
FROM survey_section ss
INNER JOIN barangay b ON ss.barangay_id = b.barangay_id
WHERE ss.section_key = 'financial'
  AND ss.survey_cycle_id = $1
  AND ss.data ? 'need_for_action_binary_projects'
GROUP BY b.barangay_id, b.barangay_name
ORDER BY nfa_rate_percentage DESC;
```

### Pattern 4: Trend Analysis

Compare NFA Rates across survey cycles:

```sql
SELECT 
  sc.cycle_id,
  sc.name as cycle_name,
  sc.year,
  COUNT(*) as total_responses,
  COUNT(*) FILTER (
    WHERE (ss.data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
  ) as yes_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      ROUND((COUNT(*) FILTER (
        WHERE (ss.data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
      )::numeric / COUNT(*)::numeric) * 100, 1)
    ELSE 0
  END as nfa_rate_percentage
FROM survey_section ss
INNER JOIN survey_cycle sc ON ss.survey_cycle_id = sc.cycle_id
WHERE ss.section_key = 'financial'
  AND ss.barangay_id = $1
  AND ss.data ? 'need_for_action_binary_projects'
GROUP BY sc.cycle_id, sc.name, sc.year
ORDER BY sc.year DESC, sc.cycle_id DESC;
```

## Performance Characteristics

### Expected Query Performance

With proper indexes on a dataset of 10,000 survey responses:

| Query Type | Expected Time | Notes |
|------------|---------------|-------|
| Single indicator | < 50ms | Uses GIN index + section_key index |
| All indicators in service area | < 200ms | Multiple field lookups |
| Cross-barangay comparison | < 500ms | Depends on number of barangays |
| Trend analysis | < 300ms | Depends on number of cycles |

### Index Usage Verification

Verify that indexes are being used:

```sql
EXPLAIN ANALYZE
SELECT COUNT(*)
FROM survey_section
WHERE section_key = 'financial'
  AND data ? 'need_for_action_binary_projects';
```

Expected output should show:
- `Index Scan using idx_survey_section_key`
- `Bitmap Index Scan using idx_survey_section_data_nfa_binary`

## TypeScript Integration

### Query Utility Functions

The `src/lib/nfa-analytics-queries.ts` module provides helper functions:

```typescript
import { calculateNFARateForIndicator } from '@/lib/nfa-analytics-queries';

// Calculate NFA rate for a single indicator
const result = await calculateNFARateForIndicator(
  supabase,
  'financial',
  'need_for_action_binary_projects',
  cycleId,
  barangayId
);

console.log(`NFA Rate: ${result.nfaRatePercentage}%`);
console.log(`Yes Count: ${result.yesCount} / ${result.totalResponses}`);
```

### Service Indicator Mapping

All service indicators are defined in a constant:

```typescript
import { SERVICE_INDICATORS } from '@/lib/nfa-analytics-queries';

// Access field names
const projectsField = SERVICE_INDICATORS.financial.projects;
// Returns: 'need_for_action_binary_projects'
```

## Optimization Best Practices

### 1. Always Filter by section_key First

```sql
-- GOOD: Uses index
WHERE section_key = 'financial' AND data ? 'need_for_action_binary_projects'

-- BAD: May not use index efficiently
WHERE data ? 'need_for_action_binary_projects' AND section_key = 'financial'
```

### 2. Use COUNT FILTER Instead of SUM CASE

```sql
-- GOOD: More efficient
COUNT(*) FILTER (WHERE (data->>'field') = 'Yes')

-- BAD: Less efficient
SUM(CASE WHEN (data->>'field') = 'Yes' THEN 1 ELSE 0 END)
```

### 3. Check Field Existence Before Extraction

```sql
-- GOOD: Uses GIN index
WHERE data ? 'need_for_action_binary_projects'
  AND (data->>'need_for_action_binary_projects') = 'Yes'

-- BAD: May scan all rows
WHERE (data->>'need_for_action_binary_projects') = 'Yes'
```

### 4. Use IN Operator for Multiple Values

```sql
-- GOOD: Single condition
WHERE (data->>'field') IN ('Yes', 'Oo')

-- BAD: Multiple OR conditions
WHERE (data->>'field') = 'Yes' OR (data->>'field') = 'Oo'
```

## Monitoring and Maintenance

### Query Performance Monitoring

Monitor slow queries in production:

```sql
-- Enable slow query logging
ALTER DATABASE your_database SET log_min_duration_statement = 100;

-- View slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE query LIKE '%survey_section%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Index Maintenance

Regularly analyze tables to update statistics:

```sql
ANALYZE survey_section;
```

### Vacuum for Performance

Periodically vacuum to reclaim space:

```sql
VACUUM ANALYZE survey_section;
```

## Verification of Requirements

### Requirement 4.1: COUNT where binary = "Yes"

✅ Implemented using `COUNT(*) FILTER (WHERE (data->>'field') IN ('Yes', 'Oo'))`

### Requirement 4.2: Calculate percentage

✅ Implemented using `(yes_count / total_count) * 100` with proper null handling

### Requirement 4.5: Use only binary field

✅ Verified through `verifyNFARateIndependence()` function that demonstrates calculation is independent of suggestion field content

## Testing

### Unit Tests

Run unit tests for query utilities:

```bash
npm test -- src/lib/__tests__/nfa-analytics-queries.test.ts
```

### Integration Tests

Test queries against actual database:

```bash
npm test -- src/lib/__tests__/nfa-binary-calculation.test.ts
```

### Performance Tests

Use `EXPLAIN ANALYZE` to verify query performance:

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT COUNT(*) FILTER (WHERE (data->>'need_for_action_binary_projects') IN ('Yes', 'Oo'))
FROM survey_section
WHERE section_key = 'financial'
  AND survey_cycle_id = 1
  AND barangay_id = 1;
```

## Troubleshooting

### Slow Queries

If queries are slow:

1. Verify indexes exist: `\d survey_section`
2. Check index usage: `EXPLAIN ANALYZE <query>`
3. Update statistics: `ANALYZE survey_section`
4. Consider adding composite indexes for common filter combinations

### Incorrect Results

If results don't match expectations:

1. Verify field naming: Check JSONB structure
2. Check case sensitivity: Binary values should be case-insensitive
3. Verify localization: Both "Yes"/"No" and "Oo"/"Hindi" should work
4. Run verification query to ensure independence from suggestion field

## References

- PostgreSQL JSONB Documentation: https://www.postgresql.org/docs/current/datatype-json.html
- GIN Indexes: https://www.postgresql.org/docs/current/gin.html
- COUNT FILTER: https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-AGGREGATES

## Related Files

- `database/nfa-binary-analytics-queries.sql` - SQL query patterns
- `src/lib/nfa-analytics-queries.ts` - TypeScript query utilities
- `src/lib/__tests__/nfa-analytics-queries.test.ts` - Unit tests
- `src/lib/funnel-calculations.ts` - Core calculation logic
- `database/nfa-binary-field-migration.sql` - Database migration with indexes
