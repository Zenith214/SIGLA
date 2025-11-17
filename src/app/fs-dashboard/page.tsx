"use client";

import { useState, lazy, Suspense } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { FSDashboardLayout } from "@/components/fs-dashboard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Lazy load heavy dashboard components for better performance
const AssignmentManagement = lazy(() => 
  import("@/components/fs-dashboard").then(mod => ({ default: mod.AssignmentManagement }))
);
const SpotAllocation = lazy(() => 
  import("@/components/fs-dashboard").then(mod => ({ default: mod.SpotAllocation }))
);
const FieldworkMonitoring = lazy(() => 
  import("@/components/fs-dashboard").then(mod => ({ default: mod.FieldworkMonitoring }))
);

export default function FSDashboard() {
  const [activeTab, setActiveTab] = useState<"assignments" | "spots" | "monitoring">("assignments");

  return (
    <ProtectedRoute>
      <FSDashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
        <Suspense fallback={<LoadingSpinner />}>
          {activeTab === "assignments" && <AssignmentManagement />}
          {activeTab === "spots" && <SpotAllocation />}
          {activeTab === "monitoring" && <FieldworkMonitoring />}
        </Suspense>
      </FSDashboardLayout>
    </ProtectedRoute>
  );
}
