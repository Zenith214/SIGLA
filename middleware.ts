import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// Public paths that don't require authentication
const PUBLIC_PATHS = ['/', '/login', '/register', '/success'];

// Paths that require authentication
const PROTECTED_PATHS = ['/dashboard', '/survey', '/fs-dashboard', '/cpap', '/admin', '/settings', '/tools', '/reportcard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Log EVERY request that hits middleware
  console.log('🚦 [MIDDLEWARE START]', pathname);

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    console.log('✅ [MIDDLEWARE] Public path, allowing:', pathname);
    return NextResponse.next();
  }

  // Allow public API routes
  if (pathname.startsWith('/api/login') || pathname.startsWith('/api/register') || pathname.startsWith('/api/logout') || pathname.startsWith('/api/debug-cookies') || pathname.startsWith('/api/last-middleware-log')) {
    return NextResponse.next();
  }

  // Check if path requires authentication
  const requiresAuth = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  
  if (!requiresAuth) {
    return NextResponse.next();
  }

  // Check for authentication token - try multiple methods
  let token = request.cookies.get('pulse_token');
  let tokenSource = 'cookies';
  
  // If not found via cookies API, try reading from Cookie header directly
  if (!token || !token.value) {
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(/pulse_token=([^;]+)/);
      if (match) {
        token = { name: 'pulse_token', value: match[1] };
        tokenSource = 'header';
      }
    }
  }
  
  const middlewareLog = {
    pathname,
    hasToken: !!token,
    tokenSource,
    tokenValue: token?.value ? `${token.value.substring(0, 20)}...` : 'none',
    allCookies: request.cookies.getAll().map(c => c.name),
    cookieHeader: request.headers.get('cookie') ? 'present' : 'missing',
    headers: {
      host: request.headers.get('host'),
      protocol: request.headers.get('x-forwarded-proto'),
      userAgent: request.headers.get('user-agent')?.substring(0, 50)
    },
    timestamp: new Date().toISOString()
  };
  
  console.log('🔒 [MIDDLEWARE]', middlewareLog);
  
  if (!token || !token.value) {
    console.log('❌ [MIDDLEWARE] No token found, redirecting to login');
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // Validate token
  try {
    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    if (!decoded || !decoded.id || !decoded.email) {
      throw new Error('Invalid token');
    }
    
    console.log('✅ [MIDDLEWARE] Token valid for user:', decoded.email);
    
    const response = NextResponse.next();
    response.headers.set('x-user-id', decoded.id.toString());
    response.headers.set('x-user-role', (decoded.role || 'officer').toLowerCase());
    response.headers.set('x-user-email', decoded.email);
    return response;
  } catch (error) {
    console.log('❌ [MIDDLEWARE] Token validation failed:', error instanceof Error ? error.message : 'Unknown error');
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }
}

// Simple matcher - no complex regex
export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/dashboard/:path*',
    '/survey/:path*',
    '/fs-dashboard/:path*',
    '/cpap/:path*',
    '/admin/:path*',
    '/settings/:path*',
    '/tools/:path*',
    '/reportcard/:path*',
    '/api/:path*',
  ],
};
