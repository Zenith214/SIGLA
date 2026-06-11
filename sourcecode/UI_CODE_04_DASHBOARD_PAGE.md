# Dashboard Page - Source Code

**File:** `src/app/dashboard/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MapView from "@/components/dashboard/MapView";
import AnalyticsView from "@/components/dashboard/AnalyticsView";

export default function Dashboard() {
  const [activeView, setActiveView] = useState<"map" | "analytics">("map");

  return (
    <ErrorBoundary>
      <ProtectedRoute allowedRoles={['admin', 'developer', 'fs', 'officer', 'viewer']}>
        <DashboardLayout activeView={activeView} onViewChange={setActiveView}>
          {activeView === "map" ? <MapView /> : <AnalyticsView />}
        </DashboardLayout>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
```

---

**Note:** This is the main dashboard page that serves as the central hub for the PULSE system. It's a simple wrapper that:

1. **Protected Route**: Only allows access to users with roles: admin, developer, fs (field supervisor), officer, or viewer
2. **Error Boundary**: Catches and handles any errors gracefully
3. **Two Views**: 
   - **Map View** (default): Interactive map showing barangay locations and survey progress
   - **Analytics View**: Charts, graphs, and statistical analysis of survey data
4. **Toggle**: Users can switch between map and analytics views using the DashboardLayout component

The actual UI components (DashboardLayout, MapView, AnalyticsView) are separate reusable components that handle the complex visualization and interaction logic.
