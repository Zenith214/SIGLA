# SIGLA System Debugging Guide

**Last Updated:** October 28, 2025

## Quick Start Debugging

This guide helps you debug the SIGLA system efficiently using available tools and scripts.

---

## 🎯 Common Debugging Scenarios

### 1. **System Health Check**

Run a comprehensive system check to identify issues:

```bash
node scripts/comprehensive-system-check.js
```

This checks:
- Database connectivity
- API endpoints
- Survey cycle functionality
- ML system status
- User authentication

### 2. **Database Connection Issues**

If you're having database problems:

```bash
# Check database connection
node scripts/check-database-connection.js

# Test direct Postgres connection
node scripts/test-direct-postgres.js

# Check Supabase connection
node scripts/test-supabase-connection.js

# Verify service role key
node scripts/verify-supabase-service-key.js
```

### 3. **Survey Cycle Issues**

The system is cycle-aware. To debug cycle-related issues:

```bash
# Verify survey cycle system
node scripts/verify-survey-cycle-system.js

# Test cycle functionality
node scripts/test-survey-cycle-complete.js

# Check cycle API
node scripts/test-survey-cycle-api.js

# Test cycle-aware survey responses
node scripts/test-cycle-aware-survey-responses.js
```

### 4. **ML System Issues**

Current status: ML works but database saves are disabled (see ML_ISSUES.md)

```bash
# Check ML environment
node scripts/check-ml-environment.js

# Test ML API endpoints
node scripts/test-ml-api-endpoints.js

# Test ML with database
node scripts/test-ml-with-database.js

# Fix ML database issues
node scripts/fix-ml-database-issues.js
```

### 5. **API Endpoint Testing**

Test specific API endpoints:

```bash
# Test all critical APIs
node scripts/test-all-critical-apis.js

# Test specific endpoints
node scripts/test-analytics-api.js
node scripts/test-survey-response-api.js
node scripts/test-assignment-api-cycle-aware.js
node scripts/test-barangays-api.js
```

### 6. **Authentication Issues**

Debug login and user authentication:

```bash
# Test login API
node scripts/test-login-api.js

# Check users and roles
node scripts/check-users-roles.js

# Check admin user
node scripts/check-admin-user.js

# Update admin password if needed
node scripts/update-admin-password.js
```

### 7. **Data Issues**

Check and analyze data:

```bash
# Check barangays
node scripts/check-barangays.js

# Check survey targets
node scripts/check-survey-targets.js

# Analyze survey data
node scripts/analyze-survey-data.js

# Check specific barangay
node scripts/check-barangay-17-detailed.js
```

---

## 🔍 Browser DevTools Debugging

### Console Logging

The system has extensive console logging. Open browser DevTools (F12) and look for:

**Service Rankings API:**
```
[SERVICE RANKINGS] Sample data structure: {...}
[SERVICE RANKINGS] Looking for columns: [...]
[SERVICE RANKINGS] Found X barangays with data
```

**Service Trends API:**
```
[SERVICE TRENDS] Fetching trends for service: financial_assistance
[SERVICE TRENDS] Found X cycles with data
```

**Survey Cycle:**
```
Active cycle: {cycle_id: 18, year: 2026, name: "2026 Survey"}
```

### Network Tab

Monitor API calls:
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Look for failed requests (red)
4. Check response status codes:
   - 200: Success
   - 400: Bad request (check request body)
   - 403: Permission denied (check authentication)
   - 500: Server error (check server logs)

### React DevTools

Install React DevTools extension to:
- Inspect component props and state
- Check hook values
- Monitor re-renders
- Debug component hierarchy

---

## 🐛 Known Issues & Solutions

### Issue 1: ML Cache Shows 0% Satisfaction

**Symptoms:** Dashboard displays 0% for all satisfaction scores

**Cause:** `ml_cache` table is empty or missing data

**Solution:**
```bash
# Populate sample data
psql -h your-db-host -U postgres -d your-database -f database/populate-ml-cache-sample-data.sql
```

Or run in Supabase SQL Editor:
```sql
-- See database/populate-ml-cache-sample-data.sql
```

**Documentation:** See `ML-CACHE-FIX-SUMMARY.md`

### Issue 2: ML Database Saves Failing

**Symptoms:** ML analysis works but doesn't save to database

**Cause:** Supabase permission issues

**Current Workaround:** `save_to_db=False` in `ml/analyze_barangay.py`

**Solution:** See `ML_ISSUES.md` for detailed fix steps

### Issue 3: Survey Cycle Not Active

**Symptoms:** Dashboard shows no data or "No active cycle"

**Solution:**
1. Go to Settings → Survey Cycles
2. Set a cycle as active
3. Refresh the dashboard

**Test:**
```bash
node scripts/test-survey-cycle-api.js
```

### Issue 4: Database Connection Errors

**Symptoms:** "Connection refused" or "Permission denied"

**Check:**
1. `.env` file has correct credentials
2. Database is running
3. Network connectivity

**Test:**
```bash
node scripts/test-database-connection.js
```

---

## 📊 Development Server Debugging

### Start Development Server

```bash
npm run dev
```

Server runs on: http://localhost:3000

**Note:** The old `comprehensive-system-check.js` script checks for MySQL, but you're using Supabase. Use the new script instead:

```bash
node scripts/debug-supabase-system.js
```

### Enable Verbose Logging

Add to `.env`:
```env
NODE_ENV=development
DEBUG=true
```

### Hot Reload Issues

If changes aren't reflecting:
1. Stop the dev server (Ctrl+C)
2. Clear Next.js cache: `rm -rf .next`
3. Restart: `npm run dev`

---

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Test Specific Features

```bash
# Test error handling
node scripts/test-error-handling.js

# Test backup functionality
node scripts/test-backup-functionality.js

# Test funnel analysis
node scripts/test-funnel-analysis.js
```

---

## 🔧 Common Debugging Commands

### Check TypeScript Errors

```bash
npx tsc --noEmit
```

### Check ESLint Issues

```bash
npm run lint
```

### Rebuild Database Schema

```bash
npm run db:generate
npm run db:push
```

### Clear All Caches

```bash
# Clear ML cache
node clear-ml-cache.js

# Clear executive summary cache
node clear-executive-summary-cache.js

# Invalidate ML cache
node scripts/invalidate-ml-cache.js
```

---

## 📝 Debugging Checklist

When debugging an issue, go through this checklist:

- [ ] Check browser console for errors
- [ ] Check Network tab for failed API calls
- [ ] Verify database connection
- [ ] Check if active survey cycle is set
- [ ] Verify `.env` file has correct values
- [ ] Check server logs (terminal running `npm run dev`)
- [ ] Run relevant test script from `scripts/` folder
- [ ] Check if issue is documented in known issues
- [ ] Verify data exists in database tables
- [ ] Check Supabase dashboard for RLS policy issues

---

## 🚀 Performance Debugging

### Check Performance

```bash
node scripts/test-performance.js
```

### Monitor Database Queries

Add to API routes:
```typescript
console.time('Query execution');
const result = await client.query(query, params);
console.timeEnd('Query execution');
```

### Check Bundle Size

```bash
npm run build
```

Look for warnings about large bundles.

---

## 📚 Additional Resources

- **System Overview:** `SYSTEM_OVERVIEW.md`
- **Cycle Integration:** `CYCLE-INTEGRATION-STATUS.md`
- **ML Issues:** `ML_ISSUES.md`
- **ML Cache Fix:** `ML-CACHE-FIX-SUMMARY.md`
- **Database Setup:** `DATABASE_SETUP_GUIDE.md`
- **Supabase Migration:** `SUPABASE_MIGRATION_GUIDE.md`

---

## 💡 Tips

1. **Always check the active cycle first** - Most data issues are cycle-related
2. **Use browser DevTools Console** - Extensive logging is built-in
3. **Run comprehensive-system-check.js** - Good starting point for any issue
4. **Check .env file** - Many issues are configuration-related
5. **Read the error message carefully** - Often tells you exactly what's wrong
6. **Check Supabase dashboard** - Verify data exists and RLS policies are correct

---

## 🆘 Getting Help

If you're stuck:

1. Run `node scripts/comprehensive-system-check.js`
2. Check the relevant documentation file
3. Look for similar issues in the scripts folder
4. Check browser console and network tab
5. Verify database connection and active cycle

---

**Happy Debugging! 🐛🔍**
