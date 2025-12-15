# Immediate Fix for Login Redirect Loop

## Current Situation

Based on testing, we've confirmed:
1. ✅ Login API works - sets cookie correctly
2. ✅ `/api/me` works - can read and validate the cookie
3. ✅ `/api/test-auth` works - but middleware headers are null (middleware not running for API routes)
4. ❌ `/dashboard` fails - redirects to login (middleware IS running but rejecting the request)

## The Core Issue

The middleware is running for `/dashboard` but NOT finding/validating the cookie, even though:
- The cookie is being set correctly (we can see it in the Set-Cookie header)
- The cookie is being sent correctly (` /api/me` can read it)

## Hypothesis

There might be a difference in how Next.js middleware handles cookies vs how API routes handle cookies. Or there's a caching/timing issue.

## Immediate Solution

Let's bypass the middleware temporarily for testing and add direct logging to see what's happening.

### Step 1: Add Explicit Cookie Logging

The middleware already has logging, but we need to see it in Railway logs. The issue is that Railway logs might be buffering or not showing all output.

### Step 2: Test Locally First

Before deploying, let's test locally to see if the issue exists there too:

```bash
# In one terminal
npm run dev

# In another terminal
node scripts/test-cookie-flow.js http://localhost:3000 ana.reyes2@sigla.com password123
```

If it works locally but not in production, the issue is environment-specific.

### Step 3: Check for Next.js Middleware Limitations

Next.js middleware has some limitations:
1. It runs on Edge Runtime (limited Node.js APIs)
2. Cookie handling might be different
3. There might be caching issues

### Step 4: Alternative Approach

Instead of relying on middleware for ALL authentication, we could:
1. Keep middleware for basic checks
2. Add authentication checks in page components
3. Use a more robust session management system

## Quick Test

Let's add a simple endpoint that echoes back all cookies it receives:

```typescript
// src/app/api/debug-cookies/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const allCookies = req.cookies.getAll();
  const cookieHeader = req.headers.get('cookie');
  
  return NextResponse.json({
    cookiesFromAPI: allCookies,
    cookieHeader: cookieHeader,
    hasPulseToken: !!req.cookies.get('pulse_token'),
    pulseTokenValue: req.cookies.get('pulse_token')?.value?.substring(0, 20) + '...'
  });
}
```

Then test:
```bash
# After login, test this endpoint
curl https://mlgrc-pulse.up.railway.app/api/debug-cookies \
  -H "Cookie: pulse_token=YOUR_TOKEN_HERE" \
  -v
```

## Root Cause Investigation

The fact that `/api/me` works but `/dashboard` doesn't suggests:

1. **Different cookie handling**: API routes and middleware might handle cookies differently
2. **Middleware not receiving cookies**: The middleware might not be getting the Cookie header
3. **Next.js bug**: There might be a bug in Next.js 16.0.7 middleware cookie handling

## Recommended Next Steps

1. **Check Next.js version**: Upgrade/downgrade to see if it's a version-specific issue
2. **Simplify middleware**: Remove all logic except cookie logging
3. **Use alternative auth**: Consider using next-auth or similar library
4. **Check Railway configuration**: Ensure Railway isn't stripping cookies

## Emergency Workaround

If you need to get the app working immediately, you could:

1. **Disable middleware temporarily**:
   ```typescript
   // middleware.ts
   export function middleware(request: NextRequest) {
     // Temporarily allow all requests
     return NextResponse.next();
   }
   ```

2. **Add authentication checks in pages**:
   ```typescript
   // In each protected page
   export default async function DashboardPage() {
     const user = await getCurrentUser();
     if (!user) {
       redirect('/login');
     }
     // ... rest of page
   }
   ```

This is not ideal for security, but it would let you test if the rest of the app works.

## Long-term Solution

Consider migrating to a more robust authentication system like:
- NextAuth.js
- Clerk
- Auth0
- Supabase Auth (you're already using Supabase!)

These handle all the cookie/session management complexities for you.
