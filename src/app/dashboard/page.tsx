"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MapView from "@/components/dashboard/MapView";
import AnalyticsView from "@/components/dashboard/AnalyticsView";

export default function Dashboard() {
  const [activeView, setActiveView] = useState<"map" | "analytics">("map");

  return (
    <ProtectedRoute>
      <DashboardLayout activeView={activeView} onViewChange={setActiveView}>
        {activeView === "map" ? <MapView /> : <AnalyticsView />}
      </DashboardLayout>
    </ProtectedRoute>
  );
}