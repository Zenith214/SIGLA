"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CPAPList } from "@/components/cpap/admin/CPAPList";
import type { CPAPListItem } from "@/types/cpap";

export default function AdminCPAPPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [cpaps, setCpaps] = useState<CPAPListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role?.toLowerCase() !== "admin") {
      router.push("/forbidden?reason=insufficient_permissions&attempted_path=/admin/cpap");
    } else if (user?.role?.toLowerCase() === "admin") {
      // Mark CPAP notifications as read when visiting this page
      markNotificationsAsRead();
    }
  }, [user, router]);

  const markNotificationsAsRead = async () => {
    try {
      await fetch('/api/cpap/notifications', { method: 'POST' });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  useEffect(() => {
    if (user?.role?.toLowerCase() === "admin") {
      fetchCPAPs();
    }
  }, [user]);

  const fetchCPAPs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Cache-busting: Add timestamp to force fresh data
      const timestamp = Date.now();
      console.log("🔄 [ADMIN LIST] Fetching CPAPs with cache-busting timestamp:", timestamp);

      const response = await fetch(`/api/cpap?_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        // Try to get error details from response
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", response.status, errorData);
        
        // Handle specific error cases
        if (response.status === 403) {
          throw new Error(errorData.message || "You don't have permission to access CPAPs");
        } else if (response.status === 404) {
          // No CPAPs found - this is not an error, just empty state
          setCpaps([]);
          return;
        } else if (response.status === 500) {
          throw new Error(errorData.message || "Server error occurred. Please try again later.");
        } else {
          throw new Error(errorData.message || "Failed to fetch CPAPs");
        }
      }

      const data = await response.json();
      console.log("CPAP data received:", data);
      setCpaps(data.cpaps || []);
    } catch (err) {
      console.error("Error fetching CPAPs:", err);
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      
      // Only show toast for actual errors, not empty states
      if (errorMessage !== "No CPAPs found") {
        toast({
          title: "Error",
          description: errorMessage,
          type: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCPAPUpdate = () => {
    // Refresh the list after any update
    fetchCPAPs();
  };

  if (!user || user.role?.toLowerCase() !== "admin") {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#dbeafe' }}>
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard")}
                className="text-white hover:bg-slate-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  CPAP Management
                </h1>
                <p className="text-sm text-slate-300 mt-1">
                  Review and monitor Citizen Priority Action Plans
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
              <Button
                onClick={fetchCPAPs}
                variant="outline"
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <CPAPList 
              cpaps={cpaps} 
              onUpdate={handleCPAPUpdate}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
