"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CycleDisplay } from "@/components/survey-cycle";
import UserDropdown from "./UserDropdown";

interface NavbarProps {
  activeView: "map" | "analytics";
  onViewChange: (view: "map" | "analytics") => void;
}

export default function Navbar({ activeView, onViewChange }: NavbarProps) {
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

  const toggleView = () => {
    onViewChange(activeView === "map" ? "analytics" : "map");
  };

  return (
    <nav className="bg-slate-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Project Name */}
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-white">PULSE</h1>
        </div>

        {/* Right side - Date/Time, Cycle Selector, Toggle Button, User Menu */}
        <div className="flex items-center gap-4">
          {/* Philippine Date and Time */}
          <div className="text-white text-sm font-mono">
            {currentTime}
          </div>
          
          {/* Separator */}
          <div className="text-gray-400">|</div>
          
          {/* Active Survey Cycle Display */}
          <div className="min-w-[200px]">
            <CycleDisplay className="text-white" />
          </div>
          
          {/* Separator */}
          <div className="text-gray-400">|</div>
          
          {/* Toggle Button with Pill Design */}
          <div className="relative bg-slate-600 rounded-full p-1 flex items-center">
            <div 
              className={`absolute top-1 bottom-1 bg-white rounded-full transition-all duration-300 ease-in-out ${
                activeView === "map" ? "left-1 right-1/2" : "left-1/2 right-1"
              }`}
            />
            <button
              onClick={() => onViewChange("map")}
              className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-300 ${
                activeView === "map" ? "text-slate-800" : "text-white"
              }`}
            >
              Map
            </button>
            <button
              onClick={() => onViewChange("analytics")}
              className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-300 ${
                activeView === "analytics" ? "text-slate-800" : "text-white"
              }`}
            >
              Analytics
            </button>
          </div>
          
          {/* User Menu */}
          <UserDropdown />
        </div>
      </div>
    </nav>
  );
}