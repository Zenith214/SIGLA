"use client";

import { useState } from "react";
import MapCard from "./MapCard";
import BarangayDetailsCard from "./BarangayDetailsCard";
import SGLGBHistoryCard from "./SGLGBHistoryCard";
import BarangayListView from "./BarangayListView";
import FloatingHelpButton from "./FloatingHelpButton";
import { type ApiBarangayData } from "@/utils/barangayUtils";

export default function MapView() {
  const [selectedBarangay, setSelectedBarangay] = useState<ApiBarangayData | null>(null);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);

  const handleBarangaySelect = (barangay: ApiBarangayData) => {
    setSelectedBarangay(barangay);
  };

  const handleCycleChange = (cycleId: number | null) => {
    setSelectedCycleId(cycleId);
  };

  return (
    <div className="h-full relative">
      {/* Desktop view - Map with cards side by side */}
      <div className="hidden md:flex h-full gap-4">
        {/* Left side - Main map card */}
        <div className="flex-1 min-w-0">
          <MapCard 
            onBarangaySelect={handleBarangaySelect}
            selectedCycleId={selectedCycleId}
            onCycleChange={handleCycleChange}
          />
        </div>
        
        {/* Right side - Stacked cards */}
        <div className="w-96 flex flex-col gap-4 overflow-y-auto">
          <BarangayDetailsCard 
            selectedBarangay={selectedBarangay}
            selectedCycleId={selectedCycleId}
          />
          <SGLGBHistoryCard selectedBarangay={selectedBarangay} />
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