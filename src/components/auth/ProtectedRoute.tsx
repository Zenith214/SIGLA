"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, fallback, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login with current path as redirect parameter
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    } else if (!isLoading && isAuthenticated && allowedRoles && user) {
      // Check if user has required role (developer role bypasses all checks)
      const userRole = user.role?.toLowerCase();
      if (userRole !== 'developer' && !allowedRoles.includes(userRole)) {
        // Redirect to forbidden page
        router.push('/forbidden?reason=insufficient_permissions');
      }
    }
  }, [isAuthenticated, isLoading, router, allowedRoles, user]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show fallback or redirect if not authenticated
  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check role-based access (developer role bypasses all checks)
  if (allowedRoles && user) {
    const userRole = user.role?.toLowerCase();
    if (userRole !== 'developer' && !allowedRoles.includes(userRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600">Insufficient permissions...</p>
          </div>
        </div>
      );
    }
  }

  // Render protected content
  return <>{children}</>;
}