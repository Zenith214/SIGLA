# ADMIN CPAP MANAGEMENT PAGE

**File**: `src/app/admin/cpap/page.tsx`

---

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CPAPList } from "@/components/cpap/admin/CPAPList";
import { CPAPNotificationMenu } from "@/components/cpap/CPAPNotificationMenu";
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
    }
  }, [user, router]);

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
    <ProtectedRoute allowedRoles={['admin', 'developer']}>
      <div className="min-h-screen" style={{ backgroundColor: '#dbeafe' }}>
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
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
              <CPAPNotificationMenu />
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
```

---

## NOTES

**Admin CPAP Management Page** - Admin dashboard for reviewing all CPAPs

**Key Features:**
- **Admin-only access** - Redirects non-admin to `/forbidden`
- **List all CPAPs** - Shows CPAPs from all barangays
- **Cache-busting** - Timestamp + no-cache headers for fresh data
- **Error handling** - Specific handling for 403, 404, 500 errors
- **Auto-refresh** - `handleCPAPUpdate` callback refreshes list after changes
- **Notification menu** - Shows CPAP-related notifications

**Header:**
- Dark slate-800 background
- Back arrow to dashboard
- "CPAP Management" title
- Subtitle: "Review and monitor Citizen Priority Action Plans"
- `CPAPNotificationMenu` component (bell icon)

**Main Content States:**

**1. Loading State:**
- Centered spinner (Loader2 icon)
- Gray-400 color
- Shows while fetching data

**2. Error State:**
- Red-50 background with red-200 border
- Red-800 text showing error message
- "Try Again" button to retry fetch

**3. Success State:**
- Shows `CPAPList` component
- Props: `cpaps` array, `onUpdate` callback
- Component handles display of all CPAPs

**Permission Enforcement:**
- Double-check: useEffect redirect + ProtectedRoute wrapper
- Allowed roles: 'admin', 'developer'
- Redirects to `/forbidden?reason=insufficient_permissions&attempted_path=/admin/cpap`

**Error Handling:**
- **403 Forbidden** - "You don't have permission to access CPAPs"
- **404 Not Found** - Sets empty array (not an error, just no CPAPs)
- **500 Server Error** - "Server error occurred. Please try again later."
- **Other errors** - Generic "Failed to fetch CPAPs"

**CPAPList Component:**
- Displays table/grid of all CPAPs
- Shows: Barangay, Status, Cycle, Action items count, Last updated
- Actions: View, Approve, Request Revision, Add Comments
- Calls `onUpdate()` after any status change to refresh list

**Data Flow:**
1. Page loads → checks admin role
2. Fetches all CPAPs via GET `/api/cpap`
3. Displays in `CPAPList` component
4. Admin performs action (approve/revision/comment)
5. `onUpdate` callback triggered
6. Refetches CPAP list
7. UI updates with new data

**Cache-Busting:**
- Adds `_t=${timestamp}` query param
- Sets `cache: 'no-store'`
- Headers: `Cache-Control: no-cache, no-store, must-revalidate` + `Pragma: no-cache`

**Toast Notifications:**
- Only shows for actual errors
- Skips toast for empty state (404)
- Shows error title + description
