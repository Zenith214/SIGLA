import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

/**
 * Verifies JWT token from request cookies
 * @param request - NextRequest object
 * @returns AuthResult with user info or error
 */
export function verifyAuth(request: NextRequest): AuthResult {
  const token = request.cookies.get('pulse_token')?.value;
  
  if (!token) {
    return {
      success: false,
      error: 'No authentication token provided'
    };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user: AuthUser = {
      id: decoded.id,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      email: decoded.email,
      role: (decoded.role || 'officer').toLowerCase()
    };

    return {
      success: true,
      user
    };
  } catch (error) {
    return {
      success: false,
      error: 'Invalid authentication token'
    };
  }
}

/**
 * Checks if user has admin role (or developer role)
 * @param request - NextRequest object
 * @returns boolean indicating admin status
 */
export function isAdmin(request: NextRequest): boolean {
  const authResult = verifyAuth(request);
  const userRole = authResult.user?.role;
  return authResult.success && (userRole === 'admin' || userRole === 'developer');
}

/**
 * Middleware to require authentication
 * @param request - NextRequest object
 * @returns AuthResult or null if authenticated
 */
export function requireAuth(request: NextRequest): AuthResult | null {
  const authResult = verifyAuth(request);
  
  if (!authResult.success) {
    return authResult;
  }
  
  return null; // No error, user is authenticated
}

/**
 * Middleware to require admin role (or developer role)
 * @param request - NextRequest object
 * @returns AuthResult or null if authorized
 */
export function requireAdmin(request: NextRequest): AuthResult | null {
  const authResult = verifyAuth(request);
  
  if (!authResult.success) {
    return authResult;
  }
  
  // Allow both admin and developer roles
  const userRole = authResult.user?.role;
  if (userRole !== 'admin' && userRole !== 'developer') {
    return {
      success: false,
      error: 'Admin access required'
    };
  }
  
  return null; // No error, user is admin or developer
}

/**
 * Middleware to require write permissions (non-viewer)
 * @param request - NextRequest object
 * @returns AuthResult or null if authorized
 */
export function requireWritePermission(request: NextRequest): AuthResult | null {
  const authResult = verifyAuth(request);
  
  if (!authResult.success) {
    return authResult;
  }
  
  // Viewer role cannot perform write operations
  const userRole = authResult.user?.role;
  if (userRole === 'viewer') {
    return {
      success: false,
      error: 'Write permission required. Viewer role has read-only access.'
    };
  }
  
  return null; // No error, user has write permissions
}

/**
 * Creates audit log entry for cycle management operations
 * @param user - User performing the action
 * @param action - Action being performed
 * @param details - Additional details about the action
 */
export function createAuditLog(user: AuthUser, action: string, details: any = {}): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    user_id: user.id,
    user_email: user.email,
    action,
    details,
    ip_address: 'unknown', // Could be enhanced to capture actual IP
  };
  
  // Log to console for now - could be enhanced to write to database
  console.log('AUDIT LOG:', JSON.stringify(logEntry, null, 2));
}