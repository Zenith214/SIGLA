"use client";

import { useState } from "react";
import MapCard from "./MapCard";
import BarangayDetailsCard from "./BarangayDetailsCard";
import SGLGBHistoryCard from "./SGLGBHistoryCard";
import BarangayListView from "./BarangayListView";
import FloatingHelpButton from "./FloatingHelpButton";
import { type ApiBarangayData } from "@/utils/barangayUtils";

export default function MapView() {
  const [hoveredBarangay, setHoveredBarangay] = useState<ApiBarangayData | null>(null);
  const [lockedBarangay, setLockedBarangay] = useState<ApiBarangayData | null>(null);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);

  const handleBarangayHover = (barangay: ApiBarangayData | null) => {
    setHoveredBarangay(barangay);
  };

  const handleBarangayLock = (barangay: ApiBarangayData) => {
    setLockedBarangay(barangay);
  };

  const handleCycleChange = (cycleId: number | null) => {
    setSelectedCycleId(cycleId);
  };

  // Show locked barangay if available, otherwise show hovered barangay
  const displayedBarangay = lockedBarangay || hoveredBarangay;

  return (
    <div className="h-full relative">
      {/* Desktop view - Map with cards side by side */}
      <div className="hidden md:flex h-full gap-4">
        {/* Left side - Main map card */}
        <div className="flex-1 min-w-0">
          <MapCard 
            onBarangayHover={handleBarangayHover}
            onBarangayLock={handleBarangayLock}
            lockedBarangay={lockedBarangay}
            selectedCycleId={selectedCycleId}
            onCycleChange={handleCycleChange}
          />
        </div>
        
        {/* Right side - Stacked cards */}
        <div className="w-96 flex flex-col gap-4 overflow-y-auto">
          <BarangayDetailsCard 
            selectedBarangay={displayedBarangay}
            isLocked={!!lockedBarangay}
            selectedCycleId={selectedCycleId}
          />
          <SGLGBHistoryCard 
            selectedBarangay={displayedBarangay}
            isLocked={!!lockedBarangay}
          />
        </div>
      </div>

      {/* Mobile view - Barangay list */}
      <div className="block md:hidden h-full">
        <BarangayListView />
      </div>
      
      {/* Floating Help Button - All devices */}
      <FloatingHelpButton />
    </div>
  );
}