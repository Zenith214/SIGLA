# ML Cache Invalidation Tool

## Overview

The ML Cache Invalidation Tool provides an API endpoint to manage and clear the ML cache (`ml_cache` table). This is useful when:

- Deploying new funnel calculation methodology
- Fixing bugs in ML calculations
- Testing with fresh data
- Clearing stale cache entries

## API Endpoint

**Base URL:** `/api/tools/invalidate-ml-cache`

## Operations

### 1. Get Cache Statistics

**Method:** `GET`

**Description:** Retrieve current cache statistics including entry counts, hit rates, and breakdown by endpoint.

**Request:**
```bash
GET /api/tools/invalidate-ml-cache
```

**Response:**
```json
{
  "totalEntries": 50,
  "freshEntries": 42,
  "staleEntries": 8,
  "totalHits": 1250,
  "avgHitsPerEntry": 25.0,
  "byEndpoint": {
    "/api/ml/funnel-analysis": {
      "count": 50,
      "hits": 1250
    }
  }
}
```

**Example (curl):**
```bash
curl http://localhost:3000/api/tools/invalidate-ml-cache
```

**Example (JavaScript):**
```javascript
const response = await fetch('/api/tools/invalidate-ml-cache');
const stats = await response.json();
console.log('Cache stats:', stats);
```

---

### 2. Invalidate All Cache

**Method:** `DELETE`

**Description:** Delete all entries from the ML cache. Use this when deploying major changes to calculation logic.

**Request:**
```bash
DELETE /api/tools/invalidate-ml-cache
```

**Response:**
```json
{
  "success": true,
  "message": "ML cache invalidated successfully",
  "entriesDeleted": 50,
  "entriesRemaining": 0,
  "verified": true
}
```

**Example (curl):**
```bash
curl -X DELETE http://localhost:3000/api/tools/invalidate-ml-cache
```

**Example (JavaScript):**
```javascript
const response = await fetch('/api/tools/invalidate-ml-cache', {
  method: 'DELETE'
});
const result = await response.json();
console.log('Cache cleared:', result);
```

---

### 3. Invalidate Specific Cache Entries

**Method:** `POST`

**Description:** Delete cache entries matching specific criteria (endpoint, barangay, or cycle).

**Request Body:**
```json
{
  "endpoint": "/api/ml/funnel-analysis",  // Optional
  "barangayId": 6,                        // Optional
  "cycleId": 17                           // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cache entries invalidated successfully",
  "entriesDeleted": 5,
  "filter": {
    "endpoint": null,
    "barangayId": 6,
    "cycleId": 17
  }
}
```

**Examples:**

**Clear cache for specific endpoint:**
```bash
curl -X POST http://localhost:3000/api/tools/invalidate-ml-cache \
  -H "Content-Type: application/json" \
  -d '{"endpoint": "/api/ml/funnel-analysis"}'
```

**Clear cache for specific barangay:**
```bash
curl -X POST http://localhost:3000/api/tools/invalidate-ml-cache \
  -H "Content-Type: application/json" \
  -d '{"barangayId": 6}'
```

**Clear cache for specific cycle:**
```bash
curl -X POST http://localhost:3000/api/tools/invalidate-ml-cache \
  -H "Content-Type: application/json" \
  -d '{"cycleId": 17}'
```

**Clear cache for specific barangay + cycle:**
```bash
curl -X POST http://localhost:3000/api/tools/invalidate-ml-cache \
  -H "Content-Type: application/json" \
  -d '{"barangayId": 6, "cycleId": 17}'
```

**JavaScript example:**
```javascript
// Clear cache for specific barangay
const response = await fetch('/api/tools/invalidate-ml-cache', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ barangayId: 6 })
});
const result = await response.json();
console.log('Cache cleared for barangay:', result);
```

---

## Use Cases

### 1. After Deploying New Calculation Logic

When you deploy changes to the funnel calculation methodology:

```bash
# Clear all cache
curl -X DELETE http://localhost:3000/api/tools/invalidate-ml-cache

# Then regenerate analytics
node scripts/regenerate-analytics.js
```

### 2. Testing with Fresh Data

When testing changes with specific barangays:

```bash
# Clear cache for test barangay
curl -X POST http://localhost:3000/api/tools/invalidate-ml-cache \
  -H "Content-Type: application/json" \
  -d '{"barangayId": 17}'

# Test the API
curl "http://localhost:3000/api/ml/funnel-analysis?barangayId=17&cycleId=18&refresh=true"
```

### 3. Monitoring Cache Health

Check cache statistics regularly:

```bash
# Get current stats
curl http://localhost:3000/api/tools/invalidate-ml-cache

# Look for:
# - High stale entry count (may need cleanup)
# - Low hit rates (cache not being used effectively)
# - Uneven distribution across endpoints
```

### 4. Cycle Transition

When transitioning to a new survey cycle:

```bash
# Clear cache for old cycle
curl -X POST http://localhost:3000/api/tools/invalidate-ml-cache \
  -H "Content-Type: application/json" \
  -d '{"cycleId": 17}'
```

---

## Integration with Scripts

The tool can be used alongside the existing cache management scripts:

### Command Line Script
```bash
# Use the Node.js script for interactive confirmation
node scripts/invalidate-ml-cache.js
```

### API Tool
```bash
# Use the API for programmatic access (no confirmation)
curl -X DELETE http://localhost:3000/api/tools/invalidate-ml-cache
```

**When to use which:**
- **Script:** Manual operations, requires confirmation, detailed logging
- **API:** Automated workflows, CI/CD pipelines, programmatic access

---

## Error Handling

### Common Errors

**Missing parameters (POST):**
```json
{
  "error": "Must provide endpoint, barangayId, or cycleId"
}
```

**Database error:**
```json
{
  "error": "Failed to invalidate cache: [error message]"
}
```

**Internal server error:**
```json
{
  "error": "Internal server error"
}
```

---

## Security Considerations

⚠️ **Important:** This tool has no authentication/authorization checks. In production:

1. Add authentication middleware
2. Restrict to admin users only
3. Log all cache invalidation operations
4. Consider rate limiting

**Example protection:**
```typescript
// Add to route.ts
import { verifyAdmin } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  const user = await verifyAdmin(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... rest of the code
}
```

---

## Related Tools

- **Cache Invalidation Script:** `scripts/invalidate-ml-cache.js`
- **Analytics Regeneration:** `scripts/regenerate-analytics.js`
- **Validation Script:** `scripts/validate-funnel-migration.js`

---

## Troubleshooting

### Cache not clearing

1. Check database connection
2. Verify Supabase credentials
3. Check table permissions
4. Look for database locks

### Verification fails

If `verified: false` in response:
1. Check for database triggers that recreate entries
2. Verify no concurrent processes are writing to cache
3. Check for replication lag

### Performance issues

If deletion is slow:
1. Check cache table size
2. Consider adding indexes
3. Use specific filters (POST) instead of full clear (DELETE)

---

**Created:** October 26, 2025  
**Last Updated:** October 26, 2025  
**Version:** 1.0.0
