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

  const handleBarangaySelect = (barangay: ApiBarangayData) => {
    setSelectedBarangay(barangay);
  };

  return (
    <div className="h-full relative">
      {/* Desktop view - Map with cards */}
      <div className="hidden md:flex h-full flex-col gap-4">
        {/* Main map card - takes up most of the space */}
        <div className="flex-1 min-h-0">
          <MapCard onBarangaySelect={handleBarangaySelect} />
        </div>
        
        {/* Bottom cards grid - fixed height */}
        <div className="h-48 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BarangayDetailsCard selectedBarangay={selectedBarangay} />
          <SGLGBHistoryCard selectedBarangay={selectedBarangay} />
        </div>
      </div>

      {/* Mobile view - Barangay list */}
      <div className="block md:hidden h-full">
        <BarangayListView />
      </div>
      
      {/* Floating Help Button - Desktop only */}
      <div className="hidden md:block">
        <FloatingHelpButton />
      </div>
    </div>
  );
}