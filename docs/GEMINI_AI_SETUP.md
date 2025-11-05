# Gemini AI Executive Summary Setup

## Overview

This feature uses Google's Gemini AI to generate comprehensive executive summaries and action plans based on survey data. The AI analyzes all survey responses for a barangay and creates:

- Executive summary with key findings
- Critical issues identification
- Prioritized action plan (immediate, short-term, long-term)
- Specific recommendations by category
- Success metrics and targets

## Setup Instructions

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

### 2. Install Dependencies

```bash
npm install @google/generative-ai
```

### 3. Add Environment Variable

Add to your `.env.local` file:

```env
GEMINI_API_KEY=your_api_key_here
```

### 4. Add to Barangay Detail Page

Update `src/app/survey/barangay/[id]/page.tsx` or your barangay detail page:

```typescript
import { ExecutiveSummaryGenerator } from '@/components/ai/ExecutiveSummaryGenerator'

// Inside your component, add:
<ExecutiveSummaryGenerator 
  barangayId={barangayId}
  cycleId={activeCycle?.cycle_id}
  barangayName={barangay.barangay_name}
/>
```

## Features

### 🎯 Smart Caching
- Results are cached for 7 days
- Saves API tokens by not regenerating unnecessarily
- Manual refresh button available when needed

### 📊 Comprehensive Analysis
- Analyzes all survey responses
- Considers demographics and service area scores
- Identifies patterns and trends
- Provides context-aware recommendations

### 📥 Export Functionality
- Download summary as text file
- Includes all sections and details
- Ready for reports and presentations

### 🔄 Real-time Generation
- On-demand generation (button click)
- Loading states and progress indicators
- Error handling with user feedback

## API Endpoint

**POST** `/api/ai/executive-summary`

### Request Body
```json
{
  "barangayId": 1,
  "cycleId": 5,
  "forceRefresh": false
}
```

### Response
```json
{
  "success": true,
  "data": {
    "barangay_id": 1,
    "cycle_id": 5,
    "executiveSummary": "...",
    "keyFindings": [...],
    "criticalIssues": [...],
    "actionPlan": {
      "immediate": [...],
      "shortTerm": [...],
      "longTerm": [...]
    },
    "recommendations": {
      "governance": [...],
      "serviceDelivery": [...],
      "communityEngagement": [...]
    },
    "successMetrics": [...],
    "generated_at": "2025-01-15T10:30:00Z"
  },
  "_cache": {
    "cached": false,
    "stale": false,
    "computedAt": "2025-01-15T10:30:00Z",
    "expiresAt": "2025-01-22T10:30:00Z"
  }
}
```

## Cost Optimization

### Token Savings
- **On-demand generation**: Only generates when user clicks button
- **7-day cache**: Reuses results for a week
- **Efficient prompts**: Optimized to minimize token usage
- **Structured output**: JSON format reduces parsing overhead

### Estimated Costs
- **Per generation**: ~2,000-3,000 tokens
- **Gemini Pro pricing**: Free tier available (60 requests/minute)
- **With caching**: Minimal cost for most use cases

## Usage Tips

### When to Generate
- After completing survey data collection
- Before creating reports or presentations
- When planning interventions
- For quarterly reviews

### When to Regenerate
- After significant new survey responses
- When priorities change
- For updated action plans
- After implementing recommendations

### Best Practices
1. Generate once per barangay per cycle
2. Use cached results for regular viewing
3. Regenerate only when data changes significantly
4. Download for offline reference
5. Share with stakeholders

## Customization

### Modify AI Prompt

Edit `src/app/api/ai/executive-summary/route.ts`:

```typescript
const prompt = `
  // Customize the prompt here
  // Add specific instructions
  // Adjust output format
`
```

### Adjust Cache Duration

Change TTL in the API route:

```typescript
ttl: 604800, // 7 days (in seconds)
// Options:
// 86400 = 1 day
// 259200 = 3 days
// 604800 = 7 days
// 1209600 = 14 days
```

### Customize UI

Edit `src/components/ai/ExecutiveSummaryGenerator.tsx`:
- Modify card layouts
- Change color schemes
- Add/remove sections
- Adjust export format

## Troubleshooting

### API Key Issues
```
Error: API key not found
```
**Solution**: Verify `GEMINI_API_KEY` is in `.env.local` and restart dev server

### Rate Limiting
```
Error: 429 Too Many Requests
```
**Solution**: Wait a moment and try again. Free tier has rate limits.

### Generation Failures
```
Error: Failed to generate summary
```
**Solution**: 
1. Check API key is valid
2. Verify survey data exists
3. Check console for detailed errors
4. Try regenerating

### Cache Issues
```
Error: permission denied for table ml_cache
```
**Solution**: Run `database/fix-ml-cache-permissions.sql`

## Security Notes

- API key is server-side only (never exposed to client)
- Uses service role for database access
- RLS policies protect data
- Cache is user-specific

## Future Enhancements

- [ ] Multi-language support
- [ ] PDF export with formatting
- [ ] Comparison across cycles
- [ ] Trend analysis over time
- [ ] Custom report templates
- [ ] Email delivery of summaries

## Support

For issues or questions:
1. Check console logs for errors
2. Verify API key and permissions
3. Review cache status
4. Check Gemini AI status page
