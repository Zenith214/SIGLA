"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, Suspense } from "react";

function ForbiddenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const attemptedPath = searchParams.get("attempted_path") || "the requested page";
  const reason = searchParams.get("reason") || "insufficient_permissions";

  useEffect(() => {
    // If no user is logged in, redirect to login
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const getReasonMessage = () => {
    switch (reason) {
      case "insufficient_permissions":
        return "You do not have the required permissions to access this resource.";
      case "role_restricted":
        return "This feature is restricted to specific user roles.";
      default:
        return "Access to this resource is forbidden.";
    }
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    
    const role = user.role?.toLowerCase();
    switch (role) {
      case "admin":
        return "/dashboard";
      case "officer":
        return "/dashboard";
      case "fs":
        return "/fs-dashboard";
      case "interviewer":
        return "/survey/forms";
      default:
        return "/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 rounded-full p-4">
              <ShieldAlert className="h-12 w-12 text-red-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            403 - Access Forbidden
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {getReasonMessage()}
          </p>

          {/* Attempted Path */}
          {attemptedPath && attemptedPath !== "the requested page" && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Attempted to access:</p>
              <p className="text-sm font-mono text-gray-700 break-all">
                {attemptedPath}
              </p>
            </div>
          )}

          {/* User Info */}
          {user && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Logged in as:</p>
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                Role: <span className="font-medium capitalize">{user.role}</span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push(getDashboardPath())}
              className="w-full"
              size="lg"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
            
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500 mt-6">
            If you believe you should have access to this resource, please contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ForbiddenPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 rounded-full p-4">
                <ShieldAlert className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              403 - Access Forbidden
            </h1>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ForbiddenContent />
    </Suspense>
  );
}
