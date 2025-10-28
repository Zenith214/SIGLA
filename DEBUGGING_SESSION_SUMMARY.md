# Debugging Session Summary

**Date:** October 28, 2025  
**System:** SIGLA (Supabase-based)

---

## ✅ System Status: HEALTHY

### What's Working:

1. **✅ Database Connection**
   - Supabase: Connected
   - PostgreSQL: Connected
   - 25 barangays in database

2. **✅ Active Survey Cycle**
   - Name: PULSE SURVEY 2026
   - Year: 2026
   - Cycle ID: 18

3. **✅ Survey Data**
   - 600 survey responses
   - 12 survey targets
   - 5 assignments

4. **✅ ML Cache**
   - 6 records in ml_cache table (cycles 17 & 18)
   - Data structure: `data.action_grid.{service}.satisfaction_score`
   - Sample data verified and readable

5. **✅ Development Server**
   - Running on http://localhost:3000
   - Network: http://192.168.1.8:3000
   - Ready in 3.3s

---

## 🔍 How to Debug the Dashboard

### Step 1: Open the Application

```
http://localhost:3000
```

### Step 2: Login

Use your admin credentials to authenticate.

### Step 3: Open Browser DevTools

Press **F12** or right-click → Inspect

### Step 4: Check Console Logs

Look for these log messages:

```
[SERVICE RANKINGS] Fetching rankings for financial in cycle 18
[SERVICE RANKINGS] Looking for service area: financial -> service key: financial
[SERVICE RANKINGS] Successfully ranked X barangays
```

### Step 5: Check Network Tab

1. Filter by "Fetch/XHR"
2. Look for API calls to:
   - `/api/analytics/service-area-rankings`
   - `/api/analytics/service-trends`
3. Check response status:
   - **200**: Success ✅
   - **401**: Not logged in (login first)
   - **500**: Server error (check console)

### Step 6: Inspect Component State

Using React DevTools:
1. Find `ServiceLeaderboard` component
2. Check props and state
3. Verify data is being passed correctly

---

## 📊 ML Cache Data Structure

The ML cache stores data in a nested JSONB structure:

```json
{
  "data": {
    "action_grid": {
      "financial": {
        "satisfaction_score": 60.0,
        "need_action_score": 35.1,
        "quadrant": "OPPORTUNITIES"
      },
      "disaster": {
        "satisfaction_score": 57.6,
        "need_action_score": 21.4,
        "quadrant": "MAINTAIN"
      },
      "safety": {
        "satisfaction_score": 51.1,
        "need_action_score": 32.1,
        "quadrant": "OPPORTUNITIES"
      }
      // ... other services
    },
    "service_scores": {
      "financial": {
        "satisfaction": 60.0,
        "need_action": 35.1,
        "availment": 100,
        "awareness": 100
      }
      // ... other services
    }
  }
}
```

The API reads from **both** `action_grid` and `service_scores` structures.

---

## 🐛 Common Issues & Solutions

### Issue 1: Dashboard Shows 0% or No Data

**Possible Causes:**
1. Not logged in (401 Unauthorized)
2. No active cycle set
3. ML cache empty for active cycle
4. Wrong cycle selected

**Solutions:**
1. Login first
2. Check Settings → Survey Cycles → Set Active
3. Check console logs for actual data
4. Verify cycle ID in URL/state

**Test:**
```bash
node scripts/test-ml-cache-reading.js
```

### Issue 2: API Returns 401 Unauthorized

**Cause:** Not authenticated

**Solution:**
1. Go to http://localhost:3000/login
2. Login with admin credentials
3. Try again

### Issue 3: API Returns Empty Array

**Possible Causes:**
1. No data for selected cycle
2. Wrong service area name
3. Data structure mismatch

**Debug:**
```javascript
// In browser console
fetch('/api/analytics/service-area-rankings?service_area=financial&cycle_id=18')
  .then(r => r.json())
  .then(console.log)
```

### Issue 4: React Hooks Error

**Error:** "Rendered more hooks than during the previous render"

**Cause:** Early return before all hooks are called

**Solution:** Already fixed in `ServiceLeaderboard.tsx`

---

## 🧪 Testing Scripts

### Comprehensive System Check
```bash
node scripts/debug-supabase-system.js
```

### Test ML Cache Reading
```bash
node scripts/test-ml-cache-reading.js
```

### Test Specific API Endpoint
```bash
# In browser console (after login)
fetch('/api/analytics/service-area-rankings?service_area=financial&cycle_id=18')
  .then(r => r.json())
  .then(console.log)
```

### Check Database Directly
```bash
node -e "const {Pool}=require('pg');require('dotenv').config();const pool=new Pool({connectionString:process.env.DATABASE_URL});pool.query('SELECT COUNT(*) FROM ml_cache').then(r=>{console.log('ML Cache records:',r.rows[0].count);pool.end();})"
```

---

## 📝 Debugging Checklist

When debugging dashboard issues:

- [ ] Dev server is running (`npm run dev`)
- [ ] Logged in to the application
- [ ] Active cycle is set (Settings → Survey Cycles)
- [ ] Browser DevTools Console is open
- [ ] Network tab is monitoring API calls
- [ ] Check for console errors (red messages)
- [ ] Check for failed API calls (red in Network tab)
- [ ] Verify data exists in database
- [ ] Check API response structure
- [ ] Verify component is receiving data

---

## 🎯 Next Steps

### For Development:

1. **Open the app:** http://localhost:3000
2. **Login** with your credentials
3. **Navigate to Dashboard** to see analytics
4. **Open DevTools** (F12) to monitor
5. **Check Console** for any errors

### For Production:

1. Ensure ML cache is populated with real data
2. Set up scheduled tasks to update ML cache
3. Monitor API performance
4. Set up error logging

---

## 💡 Pro Tips

1. **Always check the active cycle first** - Most issues are cycle-related
2. **Use browser DevTools extensively** - Console and Network tabs are your friends
3. **Check authentication** - Many APIs require login
4. **Verify data exists** - Run test scripts to confirm
5. **Read error messages carefully** - They usually tell you exactly what's wrong

---

## 📚 Related Documentation

- `DEBUGGING_GUIDE.md` - Comprehensive debugging guide
- `ML-CACHE-FIX-SUMMARY.md` - ML cache structure and fixes
- `ML_ISSUES.md` - Known ML system issues
- `CYCLE-INTEGRATION-STATUS.md` - Survey cycle implementation status

---

## 🆘 Still Stuck?

If you're still experiencing issues:

1. Run: `node scripts/debug-supabase-system.js`
2. Check all items in the debugging checklist
3. Look for error messages in:
   - Browser console
   - Network tab
   - Terminal (dev server logs)
4. Verify your `.env` file has correct credentials
5. Check Supabase dashboard for RLS policies

---

**System is healthy and ready for debugging! 🚀**

Open http://localhost:3000 and start exploring with DevTools open.
