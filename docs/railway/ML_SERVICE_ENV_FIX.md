# Add Supabase Credentials to ML Service

## Current Status

✅ ML service is running and analyzing data
✅ Returns 200 OK responses
⚠️ Cannot save results to database (missing Supabase credentials)

## Fix: Add Environment Variables to ML Service

The ML service needs Supabase credentials to save analysis results to the database.

### Required Variables

Add these to your **ML Scripts** service (not SIGLA):

```
SUPABASE_URL=https://wzmlfzlmmwclerbwqfha.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6bWxmemxtbXdjbGVyYndxZmhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg2Njc5MywiZXhwIjoyMDcyNDQyNzkzfQ.5t5JLh3iOqOS7f_Gh3BvGnZdw3XKMnw2aWPu67Pqd-o
DATABASE_URL=postgresql://postgres.wzmlfzlmmwclerbwqfha:tjUMnuyl5E5b5kb8@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### Option 1: Via Railway Dashboard

1. Go to https://railway.app
2. Open your project
3. Click **"ML Scripts"** service (the Python one)
4. Go to **"Variables"** tab
5. Add these three variables:
   - `SUPABASE_URL` = `https://wzmlfzlmmwclerbwqfha.supabase.co`
   - `SUPABASE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6bWxmemxtbXdjbGVyYndxZmhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg2Njc5MywiZXhwIjoyMDcyNDQyNzkzfQ.5t5JLh3iOqOS7f_Gh3BvGnZdw3XKMnw2aWPu67Pqd-o`
   - `DATABASE_URL` = `postgresql://postgres.wzmlfzlmmwclerbwqfha:tjUMnuyl5E5b5kb8@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres`
6. Railway will auto-redeploy

### Option 2: Via Railway CLI

```bash
cd ml
railway link  # Select ML Scripts service

# Add the variables
railway variables set SUPABASE_URL=https://wzmlfzlmmwclerbwqfha.supabase.co
railway variables set SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6bWxmemxtbXdjbGVyYndxZmhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg2Njc5MywiZXhwIjoyMDcyNDQyNzkzfQ.5t5JLh3iOqOS7f_Gh3BvGnZdw3XKMnw2aWPu67Pqd-o
railway variables set DATABASE_URL=postgresql://postgres.wzmlfzlmmwclerbwqfha:tjUMnuyl5E5b5kb8@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
```

## After Adding Variables

Wait 2-3 minutes for ML service to redeploy, then check logs:

```bash
cd ml
railway logs
```

### Expected Logs (After Fix)

```
✅ POST /api/analyze HTTP/1.1" 200 OK
✅ Analyzing barangay 10, cycle 21
✅ Analysis complete for barangay 10
✅ Saved insights to database  (no more warnings!)
```

## Why This Matters

Without Supabase credentials, the ML service:
- ✅ Can analyze data
- ✅ Can return results to the Next.js app
- ❌ Cannot save insights to database
- ❌ Cannot save action grid classifications
- ❌ Cannot persist ML recommendations

With Supabase credentials, the ML service:
- ✅ Analyzes data
- ✅ Returns results
- ✅ Saves insights to database
- ✅ Saves action grid classifications
- ✅ Persists recommendations for future use

## Current Behavior

Right now, your app **IS WORKING** - barangay cards should show satisfaction scores! The ML service is analyzing data and returning results to the Next.js app.

The warnings just mean the ML service can't save its analysis to the database for later reference. The analysis still works and displays in your app.

## Optional: Verify It's Working Now

Even without adding these variables, your app should work. Test it:

1. Go to: https://mlgrc-pulse.up.railway.app
2. Click on a barangay card
3. You should see satisfaction scores (not 0%)!

If it's working, you can add the Supabase variables later to enable database persistence.

## Summary

| Feature | Without Supabase Vars | With Supabase Vars |
|---------|----------------------|-------------------|
| ML Analysis | ✅ Works | ✅ Works |
| Display Results | ✅ Works | ✅ Works |
| Save to Database | ❌ Fails (warnings) | ✅ Works |
| Persist Insights | ❌ No | ✅ Yes |

**Bottom line:** Your app should be working now! The Supabase variables are optional for better data persistence.
