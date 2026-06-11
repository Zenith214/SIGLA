# FS DASHBOARD PAGE (Field Supervisor Dashboard)

**File**: `src/app/fs-dashboard/page.tsx`

---

```tsx
"use client";

import { useState, lazy, Suspense, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { FSDashboardLayout } from "@/components/fs-dashboard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Lazy load heavy dashboard components for better performance
const SupervisorOverview = lazy(() => 
  import("@/components/fs-dashboard").then(mod => ({ default: mod.SupervisorOverview }))
);
const AssignmentManagement = lazy(() => 
  import("@/components/fs-dashboard").then(mod => ({ default: mod.AssignmentManagement }))
);
const SpotAllocation = lazy(() => 
  import("@/components/fs-dashboard").then(mod => ({ default: mod.SpotAllocation }))
);
const SpotManagement = lazy(() => 
  import("@/components/admin/SpotManagement").then(mod => ({ default: mod.SpotManagement }))
);
const FieldworkMonitoring = lazy(() => 
  import("@/components/fs-dashboard").then(mod => ({ default: mod.FieldworkMonitoring }))
);

export default function FSDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "assignments" | "spots" | "spot-management" | "monitoring">("overview");

  // Listen for tab change events from SupervisorOverview quick actions
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('fs-dashboard-tab-change', handleTabChange as EventListener);
    return () => {
      window.removeEventListener('fs-dashboard-tab-change', handleTabChange as EventListener);
    };
  }, []);

  return (
    <ProtectedRoute allowedRoles={['admin', 'developer', 'fs']}>
      <FSDashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
        <Suspense fallback={<LoadingSpinner />}>
          {activeTab === "overview" && <SupervisorOverview />}
          {activeTab === "assignments" && <AssignmentManagement />}
          {activeTab === "spots" && <SpotAllocation />}
          {activeTab === "spot-management" && (
            <div className="h-full overflow-auto p-6">
              <SpotManagement />
            </div>
          )}
          {activeTab === "monitoring" && <FieldworkMonitoring />}
        </Suspense>
      </FSDashboardLayout>
    </ProtectedRoute>
  );
}
```

---

## NOTES

**FS Dashboard Page** - Field Supervisor main workspace with 5 tabs

**Key Features:**
- **Role-based access** - Admin, Developer, FS (Field Supervisor) only
- **Lazy loading** - All tab components loaded on-demand for performance
- **Tab navigation** - 5 main sections with tab switching
- **Event-driven navigation** - Listens for `fs-dashboard-tab-change` custom events
- **Suspense fallback** - Shows LoadingSpinner while components load

**5 Main Tabs:**

**1. Overview (`overview`)**
- Component: `SupervisorOverview`
- Default tab on page load
- Shows summary stats, quick actions, recent activity
- Can trigger tab changes via custom events

**2. Assignments (`assignments`)**
- Component: `AssignmentManagement`
- Manage field interviewer assignments
- Assign interviewers to barangays/spots
- View assignment status and progress

**3. Spots (`spots`)**
- Component: `SpotAllocation`
- Allocate survey spots to field interviewers
- Spot-based assignment system
- View spot coverage and allocation

**4. Spot Management (`spot-management`)**
- Component: `SpotManagement` (from admin components)
- Create, edit, delete survey spots
- Configure spot details (location, target count, etc.)
- Wrapped in padding div for consistent layout

**5. Monitoring (`monitoring`)**
- Component: `FieldworkMonitoring`
- Real-time fieldwork progress tracking
- Monitor interviewer activity
- View completion rates and quality metrics

**Layout:**
- `FSDashboardLayout` wrapper component
- Provides consistent header, sidebar, navigation
- Passes `activeTab` and `onTabChange` props
- Handles responsive design

**Performance Optimization:**
- **Lazy loading** - Components loaded only when tab is active
- **Code splitting** - Each tab is separate bundle
- **Suspense** - Shows loading state during component load
- Reduces initial bundle size

**Event System:**
- Custom event: `fs-dashboard-tab-change`
- Payload: tab name (string)
- Allows components to trigger navigation
- Example: Quick action button in Overview can switch to Assignments tab

**Permission Enforcement:**
- `ProtectedRoute` wrapper with `allowedRoles`
- Only admin, developer, fs roles can access
- Redirects unauthorized users

**Tab State:**
- Managed via `useState` hook
- Type: `"overview" | "assignments" | "spots" | "spot-management" | "monitoring"`
- Default: `"overview"`

**Typical User Flow:**
1. FS logs in → redirected to `/fs-dashboard`
2. Lands on Overview tab
3. Sees summary stats and quick actions
4. Clicks "Manage Assignments" → switches to Assignments tab
5. Assigns interviewers to spots
6. Switches to Monitoring tab to track progress
7. Views real-time completion rates

**Component Hierarchy:**
```
FSDashboard (page)
└── ProtectedRoute
    └── FSDashboardLayout
        └── Suspense
            ├── SupervisorOverview (tab 1)
            ├── AssignmentManagement (tab 2)
            ├── SpotAllocation (tab 3)
            ├── SpotManagement (tab 4)
            └── FieldworkMonitoring (tab 5)
```

**Lazy Import Pattern:**
```tsx
const Component = lazy(() => 
  import("@/components/module").then(mod => ({ default: mod.Component }))
);
```

This pattern allows importing named exports from barrel files while using lazy loading.

**Use Cases:**
- **Field Supervisor** - Manage team, allocate spots, monitor progress
- **Admin** - Oversee all field operations, manage spots system-wide
- **Developer** - Debug and test field operations features
