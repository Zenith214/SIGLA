# ✅ Gemini API Settings - Complete Setup

## What Was Implemented

### 1. **Database Tables** ✅
- `gemini_settings` - Stores API key and token limits
- `gemini_token_usage` - Detailed usage logs
- Helper functions for tracking and statistics

### 2. **API Endpoints** ✅
- `GET /api/settings/gemini` - Fetch settings and usage stats
- `POST /api/settings/gemini` - Update API key, test key, reset tokens
- `DELETE /api/settings/gemini` - Deactivate API key

### 3. **Admin UI** ✅
- New "Gemini AI" section in Settings
- API key management interface
- Real-time token usage monitoring
- Usage statistics and charts
- Test API key functionality

### 4. **Smart Features** ✅
- API key stored in database (not just .env)
- Automatic token usage tracking
- Usage warnings (80% and 100% thresholds)
- Monthly token limit enforcement
- Usage breakdown by feature
- Recent activity log

## Setup Instructions

### Step 1: Install Package
```bash
npm install @google/generative-ai
```

### Step 2: Run Database Migration
In Supabase SQL Editor, run:
```sql
-- File: database/gemini-settings-table.sql
```

This creates:
- `gemini_settings` table
- `gemini_token_usage` table
- Helper functions
- RLS policies

### Step 3: Add Initial API Key

**Option A: Via UI (Recommended)**
1. Go to Settings → Gemini AI
2. Enter your API key
3. Click "Test API Key"
4. Click "Save Settings"

**Option B: Via Environment Variable (Fallback)**
Add to `.env.local`:
```env
GEMINI_API_KEY=your_key_here
```

The system will use database key if available, otherwise falls back to env variable.

### Step 4: Set Token Limit
- Free tier: 1,000,000 tokens/month (default)
- Paid tier: Adjust based on your plan

## Features

### 📊 Token Usage Monitoring

**Real-time Dashboard:**
- Total tokens used
- Tokens remaining
- Usage percentage
- Daily average
- Monthly usage

**Visual Indicators:**
- 🟢 Green: < 80% usage (Healthy)
- 🟡 Yellow: 80-99% usage (Near Limit)
- 🔴 Red: ≥ 100% usage (Limit Reached)

### 🔑 API Key Management

**Secure Storage:**
- API key stored encrypted in database
- Masked display (shows only last 4 characters)
- Easy rotation without code changes

**Test Functionality:**
- Test API key before saving
- Validates key with actual API call
- Shows success/error messages

### 📈 Usage Analytics

**By Feature:**
- Executive Summary generation
- Other AI features
- Request count per feature
- Token usage per feature

**Recent Activity:**
- Last 10 AI requests
- Timestamp and details
- Barangay/Cycle information
- Token count per request

### ⚙️ Management Actions

**Reset Token Counter:**
- Manual reset when needed
- Tracks last reset date
- Useful for monthly limits

**Update Token Limit:**
- Adjust based on your plan
- Prevents over-usage
- Automatic enforcement

## How It Works

### 1. API Key Retrieval
```typescript
// Automatically gets key from database or env
const apiKey = await getGeminiApiKey()
```

### 2. Token Usage Tracking
```typescript
// Automatically logged after each AI call
await logTokenUsage('executive-summary', 2500, barangayId, cycleId)
```

### 3. Limit Enforcement
```typescript
// Checked before each AI call
const limitCheck = await checkTokenLimit()
if (!limitCheck.withinLimit) {
  throw new Error('Token limit reached')
}
```

## Usage Monitoring

### Check Current Usage
```sql
SELECT * FROM get_gemini_token_stats();
```

### View Usage History
```sql
SELECT 
  endpoint,
  SUM(tokens_used) as total_tokens,
  COUNT(*) as request_count
FROM gemini_token_usage
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY endpoint
ORDER BY total_tokens DESC;
```

### Find High Usage Periods
```sql
SELECT 
  DATE(created_at) as date,
  SUM(tokens_used) as daily_tokens
FROM gemini_token_usage
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;
```

## Cost Management

### Free Tier Limits
- **1,000,000 tokens/month**
- **60 requests/minute**
- Resets monthly

### Estimated Costs
- Executive Summary: ~2,000-3,000 tokens
- 50 barangays: ~100,000-150,000 tokens
- Well within free tier!

### When to Upgrade
- Exceeding 1M tokens/month
- Need higher rate limits
- Require longer context windows

## Troubleshooting

### API Key Not Working
1. Test the key in Settings → Gemini AI
2. Check if key is active in Google AI Studio
3. Verify no rate limiting

### Token Limit Reached
1. Check usage in Settings → Gemini AI
2. Reset counter if it's a new month
3. Increase limit if needed
4. Upgrade to paid tier

### Usage Not Tracking
1. Verify database tables exist
2. Check RLS policies
3. Review server logs
4. Ensure functions are called

## Security

### API Key Protection
- ✅ Stored encrypted in database
- ✅ Never exposed to client
- ✅ Masked in UI
- ✅ RLS policies enabled
- ✅ Service role access only

### Access Control
- ✅ Admin-only settings page
- ✅ Protected API endpoints
- ✅ Audit trail in usage logs

## Benefits

### 1. Easy Management
- Change API key without redeploying
- No code changes needed
- Instant updates

### 2. Cost Control
- Real-time usage monitoring
- Automatic limit enforcement
- Usage alerts

### 3. Transparency
- Detailed usage logs
- Feature-level breakdown
- Historical tracking

### 4. Flexibility
- Switch between free/paid tiers
- Adjust limits as needed
- Multiple key support (future)

## Future Enhancements

- [ ] Multiple API keys (rotation)
- [ ] Usage alerts via email
- [ ] Budget forecasting
- [ ] Usage reports export
- [ ] Per-user usage tracking
- [ ] Cost optimization suggestions

## Quick Reference

### Get API Key
```typescript
import { getGeminiApiKey } from '@/lib/gemini-config'
const apiKey = await getGeminiApiKey()
```

### Log Usage
```typescript
import { logTokenUsage } from '@/lib/gemini-config'
await logTokenUsage('endpoint-name', tokenCount, barangayId, cycleId)
```

### Check Limit
```typescript
import { checkTokenLimit } from '@/lib/gemini-config'
const { withinLimit } = await checkTokenLimit()
```

## Success! 🎉

You now have:
- ✅ Database-backed API key management
- ✅ Real-time token usage monitoring
- ✅ Automatic usage tracking
- ✅ Cost control and alerts
- ✅ Easy key rotation
- ✅ Comprehensive analytics

No more hardcoded API keys or manual token tracking!
