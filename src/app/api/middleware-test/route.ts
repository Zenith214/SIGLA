import { NextRequest, NextResponse } from 'next/server';

// This endpoint will be protected by middleware
// We can use it to test if middleware is working
export async function GET(req: NextRequest) {
  // These headers should be set by middleware if authentication passed
  const userId = req.headers.get('x-user-id');
  const userEmail = req.headers.get('x-user-email');
  const userRole = req.headers.get('x-user-role');
  
  // Also check cookies directly
  const token = req.cookies.get('pulse_token');
  const cookieHeader = req.headers.get('cookie');
  
  console.log('🧪 [MIDDLEWARE-TEST] Request received', {
    middlewareHeaders: { userId, userEmail, userRole },
    hasToken: !!token,
    cookieHeader: cookieHeader ? 'present' : 'missing'
  });
  
  return NextResponse.json({
    message: 'Middleware test endpoint',
    middlewareWorking: !!(userId && userEmail && userRole),
    middlewareHeaders: {
      userId,
      userEmail,
      userRole
    },
    cookieInfo: {
      hasToken: !!token,
      tokenPreview: token?.value?.substring(0, 30) + '...' || null,
      cookieHeaderPresent: !!cookieHeader
    }
  });
}
