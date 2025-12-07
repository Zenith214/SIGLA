# Quick Fix Steps for Login Redirect Loop

## Immediate Actions Required

### 1. Set JWT_SECRET in Railway (CRITICAL!)

```bash
# Option A: Using Railway CLI
railway variables set JWT_SECRET="your-strong-random-secret-here-min-32-chars"

# Option B: Using Railway Dashboard
# 1. Go to https://railway.app
# 2. Select your project
# 3. Go to "Variables" tab
# 4. Click "New Variable"
# 5. Name: JWT_SECRET
# 6. Value: (generate a strong random string)
```

**Generate a strong secret:**
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Or use an online generator (make sure it's at least 32 characters)
```

### 2. Redeploy the Application

```bash
# If using Railway CLI
railway up

# Or trigger redeploy from Railway Dashboard
# 1. Go to your project
# 2. Click "Deployments" tab
# 3. Click "Deploy" button
```

### 3. Test the Login Flow

After redeployment:

1. **Clear Browser Cookies**
   - Open DevTools (F12)
   - Go to Application/Storage tab
   - Click "Cookies" → Your Railway domain
   - Right-click → "Clear"

2. **Attempt Login**
   - Go to your Railway URL
   - Try logging in with valid credentials

3. **Check Browser Console**
   - Look for logs starting with:
     - `🔐 [LOGIN API]`
     - `🍪 [LOGIN API] Cookie settings:`
     - `🔒 [MIDDLEWARE]`
     - `👤 [/api/me]`

4. **Check Network Tab**
   - Find the `/api/login` request
   - Check Response Headers for `Set-Cookie: pulse_token=...`
   - Find the `/dashboard` request
   - Check Request Headers for `Cookie: pulse_token=...`

### 4. Check Railway Logs

```bash
# Using Railway CLI
railway logs --tail

# Or in Railway Dashboard
# 1. Go to your project
# 2. Click "Deployments" tab
# 3. Click on the latest deployment
# 4. View logs
```

Look for:
- `✅ [LOGIN API] Login successful`
- `🍪 [LOGIN API] Cookie settings:`
- `🔒 [MIDDLEWARE]` logs showing token presence

## What Was Fixed

1. ✅ Added `JWT_SECRET` to local `.env` file
2. ✅ Enhanced logging in login API to track cookie setting
3. ✅ Enhanced logging in middleware to track authentication
4. ✅ Enhanced logging in `/api/me` to track token validation
5. ✅ Disabled console log removal in production (temporarily for debugging)
6. ✅ Improved cookie configuration logging

## Expected Behavior After Fix

### Successful Login Flow:
1. User submits login form
2. `/api/login` validates credentials
3. `/api/login` generates JWT token
4. `/api/login` sets `pulse_token` cookie with proper flags
5. Browser stores cookie
6. User is redirected to dashboard
7. Browser sends cookie with dashboard request
8. Middleware validates token
9. Dashboard loads successfully

### What You Should See in Logs:

```
🔐 [LOGIN API] Request received
📧 [LOGIN API] Email: user@example.com
✅ [LOGIN API] User found - ID: 1 Role: officer
✅ [LOGIN API] Password valid
🍪 [LOGIN API] Cookie settings: {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
  maxAge: 604800,
  nodeEnv: 'production',
  host: 'your-app.up.railway.app',
  protocol: 'https',
  isHttps: true
}
✅ [LOGIN API] Login successful

🔒 [MIDDLEWARE] {
  pathname: '/dashboard',
  hasToken: true,
  tokenValue: 'eyJhbGciOiJIUzI1NiIs...',
  allCookies: ['pulse_token']
}

👤 [/api/me] Request received {
  hasToken: true,
  tokenPreview: 'eyJhbGciOiJIUzI1NiIs...'
}
```

## If Still Not Working

### Check 1: Verify JWT_SECRET is Set
```bash
railway variables
# Should show JWT_SECRET in the list
```

### Check 2: Verify Cookie is Being Set
In browser DevTools:
- Network tab → `/api/login` → Response Headers
- Should see: `Set-Cookie: pulse_token=...; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`

### Check 3: Verify Cookie is Being Sent
In browser DevTools:
- Network tab → `/dashboard` → Request Headers
- Should see: `Cookie: pulse_token=...`

### Check 4: Test with Script
```bash
node scripts/test-cookie-flow.js https://your-app.up.railway.app test@example.com password123
```

## Common Issues

### Issue: "No Set-Cookie header"
**Cause**: Login API is not setting the cookie
**Fix**: Check Railway logs for errors in login API

### Issue: "Cookie set but not sent"
**Cause**: Browser cookie policy or domain mismatch
**Fix**: 
- Ensure you're accessing via the correct Railway domain
- Check browser cookie settings
- Try in incognito mode

### Issue: "Token validation fails"
**Cause**: JWT_SECRET mismatch or token expired
**Fix**:
- Verify JWT_SECRET is the same in all Railway variables
- Check token expiration (7 days)
- Clear cookies and login again

### Issue: "Still redirecting to login"
**Cause**: Middleware not receiving cookie
**Fix**:
- Check middleware logs for token presence
- Verify cookie domain matches Railway domain
- Check if cookie is httpOnly (should be)

## Need More Help?

Provide these details:
1. Railway logs (last 50 lines)
2. Browser console logs
3. Network tab screenshot showing:
   - `/api/login` response headers
   - `/dashboard` request headers
4. Output of: `railway variables` (hide sensitive values)

## Rollback Plan

If issues persist, you can temporarily disable authentication:
1. Comment out middleware checks (NOT RECOMMENDED for production)
2. Or revert to previous working version

## Next Steps After Fix

Once login is working:
1. Re-enable console log removal in `next.config.ts`
2. Remove excessive logging from production code
3. Set up proper monitoring/logging service
4. Document the working configuration
