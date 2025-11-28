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
    <ProtectedRoute>
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
