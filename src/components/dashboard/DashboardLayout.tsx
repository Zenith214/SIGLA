"use client";

import { ReactNode } from "react";
import Navbar from "./Navbar";
import { useActiveCycle } from "@/hooks/useSurveyCycle";

interface DashboardLayoutProps {
  children: ReactNode;
  activeView: "map" | "analytics";
  onViewChange: (view: "map" | "analytics") => void;
}

export default function DashboardLayout({
  children,
  activeView,
  onViewChange,
}: DashboardLayoutProps) {
  const { hasActiveCycle, activeCycle, loading: cycleLoading } = useActiveCycle();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#dbeafe' }}>
      {/* Top Navbar - fixed height */}
      <Navbar activeView={activeView} onViewChange={onViewChange} />
      
      {/* Cycle Status Banner */}
      {!cycleLoading && !hasActiveCycle && (
        <div className="bg-amber-100 border-b border-amber-200 px-4 py-2">
          <div className="flex items-center justify-center text-amber-800 text-sm">
            <span className="font-medium">⚠️ No active survey cycle is set.</span>
            <span className="ml-2">Contact your administrator to configure a survey cycle.</span>
          </div>
        </div>
      )}
      
      {/* Main content area - takes remaining height */}
      <div className="flex-1 flex flex-col min-h-0" data-tour="dashboard-content">
        {/* Content area with padding that fits within remaining viewport */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="h-full w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}