"use client";

import { useState, useEffect } from "react";
import { CycleDisplay } from "@/components/survey-cycle";
import UserDropdown from "@/components/dashboard/UserDropdown";

interface FSNavbarProps {
  activeTab: "overview" | "assignments" | "spots" | "spot-management" | "monitoring";
  onTabChange: (tab: "overview" | "assignments" | "spots" | "spot-management" | "monitoring") => void;
}

export default function FSNavbar({ activeTab, onTabChange }: FSNavbarProps) {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Convert to Philippine time (UTC+8)
      const philippineTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
      const timeString = philippineTime.toISOString().slice(0, 19).replace('T', ' ');
      setCurrentTime(timeString);
    };

    // Update immediately
    updateTime();
    
    // Update every second
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-slate-800 px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex flex-col gap-3">
        {/* Top row - Project Name, Time, Cycle, User */}
        <div className="flex items-center justify-between">
          {/* Left side - Project Name */}
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl font-semibold text-white">PULSE - Field Supervisor</h1>
          </div>

          {/* Right side - Date/Time, Cycle Display, User Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Philippine Date and Time - Hidden on mobile */}
            <div className="hidden lg:block text-white text-sm font-mono">
              {currentTime}
            </div>
            
            {/* Separator - Hidden on mobile */}
            <div className="hidden lg:block text-gray-400">|</div>
            
            {/* Active Survey Cycle Display - Hidden on mobile */}
            <div className="hidden md:block min-w-[200px]">
              <CycleDisplay className="text-white" />
            </div>
            
            {/* Separator - Hidden on mobile */}
            <div className="hidden md:block text-gray-400">|</div>
            
            {/* User Menu */}
            <UserDropdown />
          </div>
        </div>

        {/* Bottom row - Tabs */}
        <div className="flex items-center gap-1 border-t border-slate-700 pt-3 overflow-x-auto">
          <button
            onClick={() => onTabChange("overview")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onTabChange("assignments")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === "assignments"
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            Assignment Management
          </button>
          <button
            onClick={() => onTabChange("spots")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === "spots"
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            Spot Allocation
          </button>
          <button
            onClick={() => onTabChange("spot-management")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === "spot-management"
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            Spot Management
          </button>
          <button
            onClick={() => onTabChange("monitoring")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === "monitoring"
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            Fieldwork Monitoring
          </button>
        </div>
      </div>
    </nav>
  );
}
