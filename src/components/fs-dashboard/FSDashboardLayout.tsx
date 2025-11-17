"use client";

import { ReactNode } from "react";
import { useActiveCycle } from "@/hooks/useSurveyCycle";
import FSNavbar from "./FSNavbar";

interface FSDashboardLayoutProps {
  children: ReactNode;
  activeTab: "assignments" | "spots" | "monitoring";
  onTabChange: (tab: "assignments" | "spots" | "monitoring") => void;
}

export default function FSDashboardLayout({
  children,
  activeTab,
  onTabChange,
}: FSDashboardLayoutProps) {
  const { hasActiveCycle, activeCycle, loading: cycleLoading } = useActiveCycle();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#dbeafe' }}>
      {/* Top Navbar - fixed height */}
      <FSNavbar activeTab={activeTab} onTabChange={onTabChange} />
      
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
      <div className="flex-1 flex flex-col min-h-0">
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
