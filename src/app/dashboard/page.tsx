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