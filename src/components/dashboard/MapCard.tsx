"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InteractiveSVGMap from "./InteractiveSVGMap";
import { type ApiBarangayData } from "@/utils/barangayUtils";
import { useActiveCycle } from "@/hooks/useSurveyCycle";
import { HistoricalCycleSelector } from "@/components/survey-cycle";

interface MapCardProps {
  onBarangayHover?: (barangay: ApiBarangayData | null) => void;
  onBarangayLock?: (barangay: ApiBarangayData) => void;
  lockedBarangay?: ApiBarangayData | null;
  selectedCycleId: number | null;
  onCycleChange: (cycleId: number | null) => void;
  officerBarangayId?: number;
  onAutoSelectComplete?: () => void;
}

export default function MapCard({ 
  onBarangayHover, 
  onBarangayLock, 
  lockedBarangay, 
  selectedCycleId, 
  onCycleChange,
  officerBarangayId,
  onAutoSelectComplete
}: MapCardProps) {
  const { activeCycle, hasActiveCycle } = useActiveCycle();

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 flex-shrink-0">
        <div className="flex flex-col space-y-1">
          <CardTitle className="text-xl font-semibold">
            Satisfaction Index Overview
            {hasActiveCycle && (
              <span className="text-sm font-normal text-blue-600 ml-2">
                - {activeCycle?.name} ({activeCycle?.year})
              </span>
            )}
          </CardTitle>
          <p className="text-sm text-gray-600">
            Interactive map showing barangay satisfaction index status. Click on any barangay to view detailed information and historical data.
            {hasActiveCycle && (
              <span className="text-blue-600"> Data filtered for active survey cycle.</span>
            )}
          </p>
        </div>
        <div className="min-w-[250px]">
          <HistoricalCycleSelector
            onCycleChange={onCycleChange}
            placeholder="Current cycle data"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        {/* Interactive SVG map container */}
        <div className="w-full h-full bg-white rounded-lg border overflow-hidden">
          <InteractiveSVGMap 
            onBarangayHover={onBarangayHover}
            onBarangayLock={onBarangayLock}
            lockedBarangay={lockedBarangay}
            selectedCycleId={selectedCycleId}
            officerBarangayId={officerBarangayId}
            onAutoSelectComplete={onAutoSelectComplete}
          />
        </div>
      </CardContent>
    </Card>
  );
}