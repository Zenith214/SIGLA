"use client";

import { useState, useEffect } from "react";
import MapCard from "./MapCard";
import BarangayDetailsCard from "./BarangayDetailsCard";
import SGLGBHistoryCard from "./SGLGBHistoryCard";
import BarangayListView from "./BarangayListView";
import FloatingHelpButton from "./FloatingHelpButton";
import { type ApiBarangayData } from "@/utils/barangayUtils";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Map, List } from "lucide-react";

export default function MapView() {
  const { user } = useAuth();
  const [hoveredBarangay, setHoveredBarangay] = useState<ApiBarangayData | null>(null);
  const [lockedBarangay, setLockedBarangay] = useState<ApiBarangayData | null>(null);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  const [autoSelectTriggered, setAutoSelectTriggered] = useState(false);
  
  // Check if user can toggle views (officer, admin, viewer)
  const userRole = user?.role?.toLowerCase();
  const isOfficer = userRole === 'officer';
  const canToggleView = userRole === 'officer' || userRole === 'admin' || userRole === 'viewer';
  
  // For officers, default to list view; for admin/viewer, default to map view
  const [viewMode, setViewMode] = useState<'map' | 'list'>(isOfficer ? 'list' : 'map');

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
      {/* Desktop view - Conditional rendering based on viewMode */}
      {(!canToggleView || viewMode === 'map') && (
        <div className="hidden md:flex h-full gap-4" data-tour="map-view">
          {/* Left side - Main map card */}
          <div className="flex-1 min-w-0">
            <MapCard 
              onBarangayHover={handleBarangayHover}
              onBarangayLock={handleBarangayLock}
              lockedBarangay={lockedBarangay}
              selectedCycleId={selectedCycleId}
              onCycleChange={handleCycleChange}
              officerBarangayId={user?.role?.toLowerCase() === 'officer' ? user.barangayDesignation : undefined}
              onAutoSelectComplete={() => setAutoSelectTriggered(true)}
              isOfficer={isOfficer}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
          
          {/* Right side - Stacked cards */}
          <div className="w-96 flex flex-col gap-4 overflow-y-auto">
            <BarangayDetailsCard 
              selectedBarangay={displayedBarangay}
              isLocked={!!lockedBarangay}
              selectedCycleId={selectedCycleId}
              canToggleView={canToggleView}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            <SGLGBHistoryCard 
              selectedBarangay={displayedBarangay}
              isLocked={!!lockedBarangay}
            />
          </div>
        </div>
      )}

      {/* List view when selected */}
      {canToggleView && viewMode === 'list' && (
        <div className="hidden md:block h-full" data-tour="list-view">
          <BarangayListView 
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      )}
      
      {/* Mobile view - Always show list for all users */}
      <div className="block md:hidden h-full">
        <BarangayListView />
      </div>
      
      {/* Floating Help Button - All devices */}
      <FloatingHelpButton />
    </div>
  );
}