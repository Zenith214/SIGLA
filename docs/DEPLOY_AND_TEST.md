# Deploy and Test - Complete Guide

## Current Status
✅ JWT_SECRET is configured in Railway
✅ Enhanced logging is in place
✅ Test tools are ready
⚠️ Need to deploy latest changes and test

## Step 1: Deploy Latest Changes

### What Changed:
1. Enhanced logging in login API, middleware, and /api/me
2. Disabled console log removal (temporarily)
3. Added JWT_SECRET to local .env
4. Created test tools

### Deploy Command:
```bash
railway up
```

Or push to your git repository if Railway is set to auto-deploy.

## Step 2: Wait for Deployment

Check deployment status:
```bash
railway status
```

Or check Railway dashboard: https://railway.app

## Step 3: Test Authentication Flow

### Option A: Browser Test Tool (Easiest)
1. Go to: https://mlgrc-pulse.up.railway.app/test-auth.html
2. Enter credentials (default: ana@example.com / password123)
3. Click "Run Full Test"
4. Review results

### Option B: Manual Browser Test
1. Open: https://mlgrc-pulse.up.railway.app
2. Open DevTools (F12)
3. Clear cookies (Application → Cookies → Clear)
4. Go to Console tab
5. Attempt login
6. Watch for colored emoji logs:
   - 🔐 Login API
   - 🍪 Cookie settings
   - 🔒 Middleware
   - 👤 User API

### Option C: Command Line Test
```bash
node scripts/test-cookie-flow.js https://mlgrc-pulse.up.railway.app ana@example.com password123
```

## Step 4: Analyze Results

### ✅ Success Scenario

**Browser Console Shows:**
```
🔐 Login form submitted
✅ Validation passed, attempting login...
📡 Calling login API with email: ana@example.com
📥 Login API response: {success: true, role: 'officer'}
✅ Login successful! Role: officer
🍪 Checking cookies: true
🍪 Has pulse_token cookie: true
🔄 Redirect URL: /dashboard
🚀 Redirecting to: /dashboard
```

**Railway Logs Show:**
```
🔐 [LOGIN API] Request received
📧 [LOGIN API] Email: ana@example.com
✅ [LOGIN API] User found - ID: 1 Role: officer
✅ [LOGIN API] Password valid
🍪 [LOGIN API] Cookie settings: { httpOnly: true, secure: true, ... }
✅ [LOGIN API] Login successful

🔒 [MIDDLEWARE] { pathname: '/dashboard', hasToken: true, ... }
✅ [MIDDLEWARE] Token valid for user: ana@example.com

👤 [/api/me] Request received { hasToken: true, ... }
```

**Network Tab Shows:**
- `/api/login` Response Headers: `Set-Cookie: pulse_token=...`
- `/dashboard` Request Headers: `Cookie: pulse_token=...`

### ❌ Failure Scenario 1: Cookie Not Set

**Symptoms:**
- Login API returns 200
- No `Set-Cookie` header in response
- Browser console shows: `Has pulse_token cookie: false`

**Diagnosis:**
```bash
railway logs | grep "Cookie settings"
```

**Possible Causes:**
1. JWT_SECRET not loaded properly
2. Error in cookie setting code
3. Response not being sent correctly

**Fix:**
1. Verify JWT_SECRET: `railway variables | grep JWT_SECRET`
2. Check Railway logs for errors
3. Redeploy: `railway up`

### ❌ Failure Scenario 2: Cookie Set But Not Sent

**Symptoms:**
- Login API sets cookie (visible in Application tab)
- Cookie not sent with subsequent requests
- Middleware logs show: `hasToken: false`

**Diagnosis:**
Check cookie properties in DevTools → Application → Cookies:
- Domain should be: `mlgrc-pulse.up.railway.app` or `.mlgrc-pulse.up.railway.app`
- Path should be: `/`
- Secure should be: `✓` (checked)
- HttpOnly should be: `✓` (checked)
- SameSite should be: `Lax`

**Possible Causes:**
1. Cookie domain mismatch
2. Browser cookie policy
3. CORS issue

**Fix:**
1. Try in incognito mode
2. Try different browser
3. Check browser cookie settings
4. Verify accessing via correct domain

### ❌ Failure Scenario 3: Cookie Sent But Validation Fails

**Symptoms:**
- Cookie is sent with requests
- Middleware logs show: `hasToken: true`
- Middleware logs show: `Token validation failed`
- Redirected back to login

**Diagnosis:**
```bash
railway logs | grep "Token validation failed"
```

**Possible Causes:**
1. JWT_SECRET mismatch
2. Token format invalid
3. Token expired

**Fix:**
1. Verify JWT_SECRET matches: `railway variables | grep JWT_SECRET`
2. Check token expiration (should be 7 days)
3. Clear cookies and login again
4. Check for JWT verification errors in logs

### ❌ Failure Scenario 4: Redirect Loop

**Symptoms:**
- Login succeeds
- Immediately redirected back to login
- Continuous loop

**Diagnosis:**
Watch Railway logs during login attempt:
```bash
railway logs --tail
```

Look for the sequence:
1. Login API success
2. Middleware check
3. Token validation result

**Possible Causes:**
1. Cookie not being set
2. Cookie not being sent
3. Token validation failing
4. Client-side redirect issue

**Fix:**
Based on which step fails in the logs above.

## Step 5: Common Issues and Solutions

### Issue: "Cannot read cookies"
**Solution:** Cookies are httpOnly, use Network tab to verify

### Issue: "Token expired"
**Solution:** Clear cookies and login again (tokens last 7 days)

### Issue: "CORS error"
**Solution:** Ensure accessing via Railway domain, not localhost

### Issue: "Database connection error"
**Solution:** Check DATABASE_URL in Railway variables

### Issue: "User not found"
**Solution:** Verify user exists in database, check email spelling

## Step 6: Verify Fix is Working

### Checklist:
- [ ] Can login successfully
- [ ] Not redirected back to login
- [ ] Can access dashboard
- [ ] Can access other protected routes
- [ ] Session persists after page refresh
- [ ] Logout works correctly

### Test Multiple Scenarios:
1. **Fresh login** - Clear cookies, login, verify access
2. **Page refresh** - Refresh dashboard, should stay logged in
3. **Direct URL** - Navigate directly to /dashboard, should work
4. **Logout** - Logout, verify redirect to login
5. **Different roles** - Test with different user roles

## Step 7: Clean Up (After Fix is Confirmed)

### Re-enable Console Log Removal:
Edit `next.config.ts`:
```typescript
compiler: {
  removeConsole: process.env.NODE_ENV === 'production' ? {
    exclude: ['error', 'warn'],
  } : false,
},
```

### Remove Excessive Debug Logging:
Keep error logs, remove verbose debug logs from:
- `src/app/api/login/route.ts`
- `middleware.ts`
- `src/app/api/me/route.ts`

### Redeploy:
```bash
railway up
```

## Monitoring

### Set Up Alerts:
Consider setting up monitoring for:
- Login failures
- Token validation failures
- Database connection errors
- High error rates

### Log Analysis:
Regularly check Railway logs for:
- Authentication errors
- Unusual patterns
- Performance issues

## Documentation

### Update Team Documentation:
- Document the authentication flow
- Document cookie configuration
- Document troubleshooting steps
- Document environment variables

### Create Runbook:
- How to handle login issues
- How to check authentication status
- How to verify environment configuration
- How to test authentication flow

## Support

### If Issues Persist:

1. **Gather Information:**
   - Railway logs (last 100 lines)
   - Browser console logs
   - Network tab screenshots
   - Cookie storage screenshot
   - Test script output

2. **Check Environment:**
   ```bash
   railway variables
   railway status
   railway logs | grep -i error
   ```

3. **Test Locally:**
   ```bash
   npm run dev
   # Test login on localhost:3000
   ```

4. **Compare Behavior:**
   - Does it work locally?
   - Does it work in incognito?
   - Does it work in different browser?

5. **Contact Support:**
   Provide all gathered information above

## Quick Reference

### Useful Commands:
```bash
# Deploy
railway up

# Check status
railway status

# View logs
railway logs

# View logs (tail)
railway logs --tail

# Check variables
railway variables

# Set variable
railway variables set KEY=value

# Test authentication
node scripts/test-cookie-flow.js https://mlgrc-pulse.up.railway.app email password
```

### Useful URLs:
- **App**: https://mlgrc-pulse.up.railway.app
- **Test Tool**: https://mlgrc-pulse.up.railway.app/test-auth.html
- **Railway Dashboard**: https://railway.app
- **Supabase Dashboard**: https://supabase.com/dashboard

### Key Files:
- `middleware.ts` - Authentication middleware
- `src/app/api/login/route.ts` - Login API
- `src/app/api/me/route.ts` - User validation API
- `src/lib/auth.ts` - Auth helper functions
- `src/components/auth/AuthProvider.tsx` - Auth context

---

**Next Step**: Run `railway up` to deploy changes, then test using one of the methods above.
