import { NextRequest, NextResponse } from 'next/server';

// This endpoint will go through middleware authentication
// It's in the /api/:path* matcher, so middleware will check it
export async function GET(req: NextRequest) {
  // If we reach here, middleware has validated the token
  const userId = req.headers.get('x-user-id');
  const userEmail = req.headers.get('x-user-email');
  const userRole = req.headers.get('x-user-role');
  
  console.log('🧪 [/api/test-auth] Request received', {
    userId,
    userEmail,
    userRole,
    hasHeaders: !!(userId && userEmail && userRole)
  });
  
  return NextResponse.json({
    message: 'Authentication successful',
    user: {
      id: userId,
      email: userEmail,
      role: userRole
    },
    middlewareWorking: true
  });
}
