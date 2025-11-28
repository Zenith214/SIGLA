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
  '/admin/cpap',
  '/api/users',
  '/api/barangays',
  '/api/survey-cycles',
  '/api/survey-targets',
  '/api/assignments',
  '/api/backups',
];

// Define Officer routes (Officer and Admin can access)
const OFFICER_ROUTES = [
  '/cpap',
];

// Define Field Supervisor routes (FS and Admin can access)
const FS_ROUTES = [
  '/fs-dashboard',
  '/api/spots',
  '/api/fs/monitoring',
];

// Define FI-specific routes (Interviewer, FS, and Admin can access)
const FI_ROUTES = [
  '/api/fi/assignments',
  '/api/questionnaires',
  '/api/visits',
  '/api/sync',
  '/api/survey-responses',
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
  '/fs-dashboard',
  '/cpap',
  '/admin/cpap',
  '/tools',
  '/api/users',
  '/api/barangays',
  '/api/survey-cycles',
  '/api/survey-targets',
  '/api/assignments',
  '/api/backups',
  '/api/spots',
  '/api/fs/monitoring',
  '/api/fi/assignments',
  '/api/questionnaires',
  '/api/visits',
  '/api/sync',
  '/api/survey-responses',
  '/api/cpap',
  '/api/me',
  '/api/tools',
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
    path === '/sw.js' ||
    path === '/manifest.json' ||
    path === '/offline.html' ||
    path.match(/\.(svg|png|jpg|jpeg|css|js|ico|woff|woff2|ttf)$/)
  ) {
    return true;
  }
  
  // Check if the path is in the public paths list
  for (const publicPath of PUBLIC_PATHS) {
    if (path === publicPath || path === `${publicPath}/`) {
      return true;
    }
  }
  
  return false;
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
  
  // Special handling for API routes
  const isApiRoute = pathname.startsWith('/api/');
  const isAuthApiRoute = pathname === '/api/login' || pathname === '/api/register' || pathname === '/api/logout';
  
  // Allow auth API routes to pass through
  if (isApiRoute && isAuthApiRoute) {
    return NextResponse.next();
  }

  // Check for the pulse_token cookie
  const token = request.cookies.get('pulse_token');
  console.log('🍪 MIDDLEWARE - Token present:', !!token?.value);
  
  if (!token || !token.value) {
    // For API routes, return a 401 Unauthorized response
    if (pathname.startsWith('/api/')) {
      console.log('❌ MIDDLEWARE - No token for API route, returning 401');
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Don't redirect if already on login page or register page
    if (pathname === '/login' || pathname === '/register') {
      console.log('📍 MIDDLEWARE - Already on auth page, allowing through');
      return NextResponse.next();
    }
    
    console.log('❌ MIDDLEWARE - No token, redirecting to login');
    // No token found, redirect to login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirected', '1');
    loginUrl.searchParams.set('reason', 'no_token');
    // Store the original URL for redirect after login
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Validate the token
  const tokenValidation = validateToken(token.value);
  console.log('🔐 MIDDLEWARE - Token valid:', tokenValidation.valid);
  
  if (!tokenValidation.valid) {
    // For API routes, return a 401 Unauthorized response
    if (pathname.startsWith('/api/')) {
      console.log('❌ MIDDLEWARE - Invalid token for API route, returning 401');
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or expired authentication token' },
        { status: 401 }
      );
    }
    
    // Don't redirect if already on login page or register page
    if (pathname === '/login' || pathname === '/register') {
      console.log('📍 MIDDLEWARE - Invalid token but on auth page, allowing through');
      return NextResponse.next();
    }
    
    console.log('❌ MIDDLEWARE - Invalid token, redirecting to login');
    // Invalid token, redirect to login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirected', '1');
    loginUrl.searchParams.set('reason', 'invalid_token');
    // Store the original URL for redirect after login
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  const user = tokenValidation.user!;
  const userRole = (user.role || 'officer').toLowerCase();

  // Developer role has access to everything - bypass all checks
  if (userRole === 'developer') {
    console.log('🔓 MIDDLEWARE - Developer role detected, granting full access');
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.id.toString());
    response.headers.set('x-user-role', userRole);
    response.headers.set('x-user-email', user.email);
    return response;
  }

  // Special redirect for interviewers accessing dashboard
  if (pathname === '/dashboard' && userRole === 'interviewer') {
    const surveyUrl = request.nextUrl.clone();
    surveyUrl.pathname = '/survey/forms';
    return NextResponse.redirect(surveyUrl);
  }

  // Check admin routes
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    if (userRole !== 'admin') {
      // For API routes, return a 403 Forbidden response
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Insufficient permissions', message: 'You need admin privileges to access this resource' },
          { status: 403 }
        );
      }
      
      // Redirect to 403 forbidden page for non-admin users
      const forbiddenUrl = request.nextUrl.clone();
      forbiddenUrl.pathname = '/forbidden';
      forbiddenUrl.searchParams.set('reason', 'insufficient_permissions');
      forbiddenUrl.searchParams.set('attempted_path', pathname);
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  // Check Officer routes (Officer and Admin can access)
  if (OFFICER_ROUTES.some(route => pathname.startsWith(route))) {
    if (userRole !== 'officer' && userRole !== 'admin') {
      // For API routes, return a 403 Forbidden response
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Insufficient permissions', message: 'You need Officer privileges to access this resource' },
          { status: 403 }
        );
      }
      
      // Redirect to 403 forbidden page for FS and INTERVIEWER users
      const forbiddenUrl = request.nextUrl.clone();
      forbiddenUrl.pathname = '/forbidden';
      forbiddenUrl.searchParams.set('reason', 'role_restricted');
      forbiddenUrl.searchParams.set('attempted_path', pathname);
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  // Check CPAP API routes with specific role-based access control
  if (pathname.startsWith('/api/cpap')) {
    // Admin can approve and request revisions
    if (pathname.includes('/approve') || pathname.includes('/request-revision')) {
      if (userRole !== 'admin') {
        return NextResponse.json(
          { error: 'Insufficient permissions', message: 'Only ADMIN users can review CPAPs' },
          { status: 403 }
        );
      }
    }
    // Officer and Admin can access other CPAP endpoints
    else if (userRole !== 'officer' && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions', message: 'You need Officer or Admin privileges to access CPAP resources' },
        { status: 403 }
      );
    }
  }

  // Check Field Supervisor routes
  if (FS_ROUTES.some(route => pathname.startsWith(route))) {
    if (userRole !== 'fs' && userRole !== 'admin') {
      // For API routes, return a 403 Forbidden response
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Insufficient permissions', message: 'You need Field Supervisor privileges to access this resource' },
          { status: 403 }
        );
      }
      
      // Redirect to appropriate dashboard based on role
      const redirectUrl = request.nextUrl.clone();
      if (userRole === 'interviewer') {
        redirectUrl.pathname = '/survey/forms';
      } else {
        redirectUrl.pathname = '/dashboard';
      }
      redirectUrl.searchParams.set('redirected', '1');
      redirectUrl.searchParams.set('reason', 'insufficient_permissions');
      redirectUrl.searchParams.set('attempted_path', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Check interviewer routes
  if (INTERVIEWER_ROUTES.some(route => pathname.startsWith(route))) {
    if (userRole !== 'interviewer' && userRole !== 'admin' && userRole !== 'fs') {
      // For API routes, return a 403 Forbidden response
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Insufficient permissions', message: 'You need interviewer privileges to access this resource' },
          { status: 403 }
        );
      }
      
      // Redirect to dashboard for non-interviewer users
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/dashboard';
      dashboardUrl.searchParams.set('redirected', '1');
      dashboardUrl.searchParams.set('reason', 'insufficient_permissions');
      dashboardUrl.searchParams.set('attempted_path', pathname);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Check FI-specific routes (Interviewer, FS, and Admin can access)
  if (FI_ROUTES.some(route => pathname.startsWith(route))) {
    if (userRole !== 'interviewer' && userRole !== 'fs' && userRole !== 'admin') {
      // For API routes, return a 403 Forbidden response
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Insufficient permissions', message: 'You need field interviewer or supervisor privileges to access this resource' },
          { status: 403 }
        );
      }
      
      // Redirect to dashboard for unauthorized users
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/dashboard';
      dashboardUrl.searchParams.set('redirected', '1');
      dashboardUrl.searchParams.set('reason', 'insufficient_permissions');
      dashboardUrl.searchParams.set('attempted_path', pathname);
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
    // Match all routes except static files, Next.js internals, and PWA files
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|offline.html|.*\\.(svg|png|jpg|jpeg|css|js|ico|woff|woff2|ttf)$).*)',
  ],
};