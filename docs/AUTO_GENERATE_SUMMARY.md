# Auto-Generate Executive Summary

## Overview

The executive summary is automatically generated once when a barangay survey reaches 100% completion. This saves tokens by only generating when needed and ensures every completed survey has a comprehensive AI-powered analysis.

## How It Works

### 1. Automatic Trigger
When a survey reaches 100% completion:
- System checks if summary already exists
- If not, automatically generates executive summary
- Summary is cached for 7 days
- No duplicate generations (checks cache first)

### 2. Manual Regeneration
Users can manually regenerate the summary:
- Click "Regenerate" button in report card
- Forces fresh AI analysis
- Updates cached version

## Implementation

### Where to Call Auto-Generation

Add this code wherever survey progress is updated to 100%:

```typescript
import { triggerAutoGenerateSummary, shouldAutoGenerateSummary } from '@/lib/auto-generate-summary'

// When updating survey progress
const previousProgress = currentProgress
const newProgress = calculateProgress() // Your progress calculation

if (shouldAutoGenerateSummary(newProgress, previousProgress)) {
  // Trigger auto-generation in background
  triggerAutoGenerateSummary(barangayId, cycleId)
    .then(success => {
      if (success) {
        console.log('Executive summary auto-generated')
      }
    })
}
```

### Example Integration Points

#### 1. Survey Submission Handler
```typescript
// In your survey submission API route
if (allSectionsCompleted) {
  // Update progress to 100%
  await updateProgress(barangayId, cycleId, 100)
  
  // Trigger auto-generation
  await triggerAutoGenerateSummary(barangayId, cycleId)
}
```

#### 2. Progress Update Endpoint
```typescript
// In your progress update API
const { data: assignment } = await supabase
  .from('assignment')
  .update({ progress: newProgress })
  .eq('id', assignmentId)
  .select()
  .single()

if (assignment.progress >= 100) {
  // Auto-generate summary
  triggerAutoGenerateSummary(assignment.barangay_id, assignment.survey_cycle_id)
}
```

#### 3. Admin Manual Completion
```typescript
// When admin marks survey as complete
const markAsComplete = async () => {
  await updateStatus('completed')
  await updateProgress(100)
  
  // Trigger summary generation
  await triggerAutoGenerateSummary(barangayId, cycleId)
}
```

## API Endpoints

### Auto-Generate Summary
**POST** `/api/ai/auto-generate-summary`

```json
{
  "barangayId": 1,
  "cycleId": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Executive summary generated successfully",
  "data": { /* summary data */ }
}
```

Or if already exists:
```json
{
  "success": true,
  "message": "Summary already exists",
  "alreadyGenerated": true,
  "generatedAt": "2025-01-15T10:30:00Z"
}
```

## Features

### ✅ Smart Generation
- Only generates once per barangay per cycle
- Checks cache before generating
- Prevents duplicate API calls
- Saves tokens and costs

### ✅ Completion Detection
- Monitors survey progress
- Triggers at 100% completion
- Works with any completion method
- Handles edge cases

### ✅ Error Handling
- Graceful failures (doesn't block survey completion)
- Logs all attempts
- Can be manually triggered if auto-generation fails
- Retry-safe (won't duplicate)

## Token Optimization

### Cost Savings
- **One-time generation**: Only when survey completes
- **Cache reuse**: 7-day cache prevents regeneration
- **Smart checking**: Verifies existence before generating
- **Background processing**: Doesn't block user actions

### Estimated Usage
- **Per barangay**: 1 generation per cycle
- **Tokens per generation**: ~2,000-3,000
- **With 50 barangays**: ~100,000-150,000 tokens per cycle
- **Cost**: Minimal with Gemini free tier

## Monitoring

### Check Auto-Generation Status

```sql
-- View generated summaries
SELECT 
  barangay_id,
  cycle_id,
  computed_at,
  hit_count
FROM ml_cache
WHERE endpoint = 'ai-executive-summary'
ORDER BY computed_at DESC;
```

### Check Completion Status

```sql
-- View completed surveys without summaries
SELECT 
  a.barangay_id,
  a.survey_cycle_id,
  a.progress,
  a.status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM ml_cache 
      WHERE endpoint = 'ai-executive-summary' 
      AND barangay_id = a.barangay_id 
      AND cycle_id = a.survey_cycle_id
    ) THEN 'Generated'
    ELSE 'Missing'
  END as summary_status
FROM assignment a
WHERE a.progress >= 100 OR a.status = 'completed';
```

## Troubleshooting

### Summary Not Auto-Generating

**Check 1: Survey Completion**
```sql
SELECT progress, status FROM assignment 
WHERE barangay_id = ? AND survey_cycle_id = ?;
```
- Progress should be >= 100 or status = 'completed'

**Check 2: Integration Point**
- Verify `triggerAutoGenerateSummary()` is called
- Check console logs for trigger messages
- Ensure function is awaited or handled

**Check 3: API Errors**
- Check browser console for errors
- Verify Gemini API key is set
- Check server logs for generation errors

### Manual Generation

If auto-generation fails, users can:
1. Go to report card
2. Click "Regenerate" button
3. Summary will be generated immediately

Or via API:
```bash
curl -X POST http://localhost:3000/api/ai/executive-summary \
  -H "Content-Type: application/json" \
  -d '{"barangayId": 1, "cycleId": 5, "forceRefresh": true}'
```

## Best Practices

1. **Call in Background**: Don't block user actions waiting for generation
2. **Log Everything**: Track all auto-generation attempts
3. **Handle Failures Gracefully**: Survey completion shouldn't fail if summary generation fails
4. **Provide Manual Option**: Always allow manual regeneration
5. **Monitor Usage**: Track token usage and costs

## Future Enhancements

- [ ] Batch generation for multiple completed surveys
- [ ] Email notification when summary is ready
- [ ] Scheduled regeneration for updated data
- [ ] Summary comparison across cycles
- [ ] Custom summary templates
- [ ] Multi-language summaries

## Support

For issues:
1. Check console logs for trigger messages
2. Verify survey completion status
3. Check cache for existing summaries
4. Try manual regeneration
5. Review API error logs
