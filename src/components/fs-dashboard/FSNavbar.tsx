"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
      // Get current time in Philippine Standard Time (GMT+8)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      
      const formatter = new Intl.DateTimeFormat('en-US', options);
      const timeString = formatter.format(new Date());
      
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
          {/* Left side - Logo */}
          <div className="flex items-center gap-3">
            <Image 
              src="/headerlogo4k.png" 
              alt="PULSE" 
              width={120}
              height={43}
              className="h-8 sm:h-10 w-auto"
              priority
            />
            <span className="text-sm sm:text-base text-gray-300 hidden sm:inline">Field Supervisor</span>
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
