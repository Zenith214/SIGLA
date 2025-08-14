"use client";

import { ReactNode } from "react";
import Navbar from "./Navbar";

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
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#dbeafe' }}>
      {/* Top Navbar - fixed height */}
      <Navbar activeView={activeView} onViewChange={onViewChange} />
      
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