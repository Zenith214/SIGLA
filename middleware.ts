import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// Define routes that do NOT require authentication
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/success',
];

// Define admin-only routes
const ADMIN_ROUTES = [
  '/settings',
  '/api/users',
  '/api/barangays',
  '/api/survey-cycles',
  '/api/survey-targets',
  '/api/assignments',
  '/api/backups',
];

// Define interviewer-only routes
const INTERVIEWER_ROUTES = [
  '/survey/forms',
  '/survey/barangay',
];

// Define all protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/reportcard',
  '/settings',
  '/survey',
  '/api/users',
  '/api/barangays',
  '/api/survey-cycles',
  '/api/survey-targets',
  '/api/assignments',
  '/api/backups',
  '/api/me',
];

// Helper to check if the path is public
function isPublic(path: string) {
  // Allow public API routes
  if (
    path.startsWith('/api/login') ||
    path.startsWith('/api/register') ||
    path.startsWith('/api/logout')
  ) {
    return true;
  }
  
  // Allow static files and Next.js internals
  if (
    path.startsWith('/_next') ||
    path.startsWith('/favicon.ico') ||
    path.startsWith('/assets') ||
    path.startsWith('/public') ||
    path.match(/\.(svg|png|jpg|jpeg|css|js|ico|woff|woff2|ttf)$/)
  ) {
    return true;
  }
  
  return PUBLIC_PATHS.includes(path);
}

// Helper to check if the path requires authentication
function requiresAuth(path: string) {
  // Check if path matches any protected route
  return PROTECTED_ROUTES.some(route => path.startsWith(route));
}

// Helper to validate JWT token
function validateToken(token: string): { valid: boolean; user?: any; error?: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || !decoded.id || !decoded.email) {
      return { valid: false, error: 'Invalid token structure' };
    }
    return { valid: true, user: decoded };
  } catch (error) {
    return { valid: false, error: 'Invalid or expired token' };
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('🔍 MIDDLEWARE - Checking path:', pathname);

  // Allow public paths
  if (isPublic(pathname)) {
    console.log('✅ MIDDLEWARE - Public path, allowing through');
    return NextResponse.next();
  }

  // Check if route requires authentication
  if (!requiresAuth(pathname)) {
    // Allow non-protected routes to pass through
    return NextResponse.next();
  }

  // Check for the sigla_token cookie
  const token = request.cookies.get('sigla_token');
  console.log('🍪 MIDDLEWARE - Token present:', !!token?.value);
  
  if (!token || !token.value) {
    // Don't redirect if already on login page
    if (pathname === '/login') {
      console.log('📍 MIDDLEWARE - Already on login page, allowing through');
      return NextResponse.next();
    }
    console.log('❌ MIDDLEWARE - No token, redirecting to login');
    // No token found, redirect to login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirected', '1');
    loginUrl.searchParams.set('reason', 'no_token');
    return NextResponse.redirect(loginUrl);
  }

  // Validate the token
  const tokenValidation = validateToken(token.value);
  console.log('🔐 MIDDLEWARE - Token valid:', tokenValidation.valid);
  
  if (!tokenValidation.valid) {
    // Don't redirect if already on login page
    if (pathname === '/login') {
      console.log('📍 MIDDLEWARE - Invalid token but on login page, allowing through');
      return NextResponse.next();
    }
    console.log('❌ MIDDLEWARE - Invalid token, redirecting to login');
    // Invalid token, redirect to login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirected', '1');
    loginUrl.searchParams.set('reason', 'invalid_token');
    return NextResponse.redirect(loginUrl);
  }

  const user = tokenValidation.user!;
  const userRole = (user.role || 'viewer').toLowerCase();

  // Special redirect for interviewers accessing dashboard
  if (pathname === '/dashboard' && userRole === 'interviewer') {
    const surveyUrl = request.nextUrl.clone();
    surveyUrl.pathname = '/survey/forms';
    return NextResponse.redirect(surveyUrl);
  }

  // Check admin routes
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    if (userRole !== 'admin') {
      // Redirect to dashboard for non-admin users
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/dashboard';
      dashboardUrl.searchParams.set('reason', 'insufficient_permissions');
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Check interviewer routes
  if (INTERVIEWER_ROUTES.some(route => pathname.startsWith(route))) {
    if (userRole !== 'interviewer' && userRole !== 'admin') {
      // Redirect to dashboard for non-interviewer users
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/dashboard';
      dashboardUrl.searchParams.set('reason', 'insufficient_permissions');
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Add user info to headers for client-side access
  console.log('✅ MIDDLEWARE - Allowing access to:', pathname, 'for user:', user.email);
  const response = NextResponse.next();
  response.headers.set('x-user-id', user.id.toString());
  response.headers.set('x-user-role', userRole);
  response.headers.set('x-user-email', user.email);

  return response;
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(svg|png|jpg|jpeg|css|js|ico|woff|woff2|ttf)$).*)',
  ],
}; 