# Testing Deployed Authentication

## Your Railway Deployment
- **URL**: https://mlgrc-pulse.up.railway.app
- **Status**: Running
- **JWT_SECRET**: ✅ Already configured

## Quick Test Steps

### 1. Browser Test (Recommended)
1. Open: https://mlgrc-pulse.up.railway.app/test-auth.html
2. Enter credentials:
   - Email: `ana@example.com`
   - Password: `password123`
3. Click "Run Full Test"
4. Review the log output

### 2. Manual Browser Test
1. Open: https://mlgrc-pulse.up.railway.app
2. Open DevTools (F12)
3. Go to Application tab → Cookies
4. Clear all cookies for mlgrc-pulse.up.railway.app
5. Go to Console tab
6. Attempt login
7. Watch for logs starting with:
   - `🔐 [LOGIN API]`
   - `🍪 [LOGIN API] Cookie settings:`
   - `🔒 [MIDDLEWARE]`

### 3. Network Tab Analysis
1. Open DevTools → Network tab
2. Clear network log
3. Attempt login
4. Find `/api/login` request
5. Check Response Headers for:
   ```
   Set-Cookie: pulse_token=...; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800
   ```
6. Find `/dashboard` request (or wherever you're redirected)
7. Check Request Headers for:
   ```
   Cookie: pulse_token=...
   ```

### 4. Command Line Test
```bash
node scripts/test-cookie-flow.js https://mlgrc-pulse.up.railway.app ana@example.com password123
```

## What to Look For

### ✅ Success Indicators:
- Login API returns 200 status
- `Set-Cookie` header present in login response
- Cookie appears in browser's cookie storage
- Cookie is sent with subsequent requests
- No redirect loop to login page

### ❌ Failure Indicators:
- Login API returns 200 but no `Set-Cookie` header
- Cookie is set but not sent with requests
- Middleware logs show "No token found"
- Immediate redirect back to login after successful login

## Common Issues

### Issue 1: Cookie Domain Mismatch
**Symptoms**: Cookie is set but not sent with requests
**Check**: 
- Browser DevTools → Application → Cookies
- Look at the Domain column for pulse_token
- Should be: `.mlgrc-pulse.up.railway.app` or `mlgrc-pulse.up.railway.app`

**Fix**: Already handled in code (domain is not explicitly set)

### Issue 2: Secure Flag Issue
**Symptoms**: Cookie not set in production
**Check**: Railway always uses HTTPS, so secure flag should be true
**Fix**: Already handled in code (secure: true in production)

### Issue 3: SameSite Issue
**Symptoms**: Cookie not sent with navigation requests
**Check**: Cookie should have `SameSite=Lax`
**Fix**: Already handled in code (sameSite: 'lax')

### Issue 4: JWT Validation Failure
**Symptoms**: Cookie is sent but middleware rejects it
**Check Railway logs**:
```bash
railway logs
```
Look for JWT verification errors

## Debugging with Railway Logs

### View Real-Time Logs:
```bash
railway logs --tail
```

### What to Look For in Logs:

**Successful Login:**
```
🔐 [LOGIN API] Request received
📧 [LOGIN API] Email: ana@example.com
✅ [LOGIN API] User found - ID: X Role: officer
✅ [LOGIN API] Password valid
🍪 [LOGIN API] Cookie settings: {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
  maxAge: 604800,
  nodeEnv: 'production',
  host: 'mlgrc-pulse.up.railway.app',
  protocol: 'https',
  isHttps: true
}
✅ [LOGIN API] Login successful
```

**Middleware Check:**
```
🔒 [MIDDLEWARE] {
  pathname: '/dashboard',
  hasToken: true,
  tokenValue: 'eyJhbGciOiJIUzI1NiIs...',
  allCookies: ['pulse_token']
}
```

**User Validation:**
```
👤 [/api/me] Request received {
  hasToken: true,
  tokenPreview: 'eyJhbGciOiJIUzI1NiIs...'
}
```

## If Still Not Working

### Step 1: Verify Environment
```bash
railway variables | grep JWT_SECRET
```
Should show: `JWT_SECRET │ ZztUa7B65uxktpcRCAPuXSdySZWKLxVLRnUEakgv5ro=`

### Step 2: Redeploy
Even though JWT_SECRET is set, redeploy to ensure latest code is running:
```bash
railway up
```

### Step 3: Check for Other Issues

**Database Connection:**
```bash
railway logs | grep "Database connection"
```

**User Exists:**
```bash
railway logs | grep "User found"
```

**Password Validation:**
```bash
railway logs | grep "Password validation"
```

## Advanced Debugging

### Test Cookie Setting Directly:
```bash
curl -X POST https://mlgrc-pulse.up.railway.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@example.com","password":"password123"}' \
  -v 2>&1 | grep -i "set-cookie"
```

Should show:
```
< set-cookie: pulse_token=...; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800
```

### Test Cookie Reading:
```bash
# First, get the token from login
TOKEN=$(curl -X POST https://mlgrc-pulse.up.railway.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@example.com","password":"password123"}' \
  -c cookies.txt -s | jq -r '.message')

# Then test /api/me with the cookie
curl https://mlgrc-pulse.up.railway.app/api/me \
  -b cookies.txt \
  -v
```

## Next Steps Based on Results

### If Login API Works But Redirect Fails:
- Issue is in client-side redirect logic
- Check browser console for JavaScript errors
- Check AuthProvider refresh logic

### If Cookie Is Set But Not Sent:
- Issue is with browser cookie handling
- Check cookie domain and path
- Try different browser
- Check browser cookie settings

### If Cookie Is Sent But Validation Fails:
- Issue is with JWT validation
- Check JWT_SECRET matches
- Check token expiration
- Check token format

### If No Cookie Is Set:
- Issue is in login API
- Check Railway logs for errors
- Check database connection
- Check user credentials

## Contact Information

If you need help, provide:
1. **Railway logs** (last 50 lines after login attempt)
2. **Browser console logs** (all logs during login)
3. **Network tab screenshots**:
   - `/api/login` response headers
   - `/dashboard` request headers
4. **Cookie storage screenshot** (DevTools → Application → Cookies)
5. **Test script output** (if you ran it)

---

**Deployment URL**: https://mlgrc-pulse.up.railway.app
**Test Tool URL**: https://mlgrc-pulse.up.railway.app/test-auth.html
**Status**: Ready for testing
