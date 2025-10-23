"use client";

import AnalyticsPlaceholder from "./AnalyticsPlaceholder";
import { useActiveCycle } from "@/hooks/useSurveyCycle";
import { CycleDisplay } from "@/components/survey-cycle";

export default function AnalyticsView() {
  const { hasActiveCycle, activeCycle, loading: cycleLoading } = useActiveCycle();

  return (
    <div className="w-full h-full">
      {/* Cycle Context Header */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h2>
            <p className="text-sm text-gray-600">
              {hasActiveCycle 
                ? `Viewing analytics for ${activeCycle?.name} (${activeCycle?.year})`
                : "No active survey cycle selected"
              }
            </p>
          </div>
          <div className="text-sm">
            {hasActiveCycle ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Active Cycle:</span>
                <CycleDisplay />
              </div>
            ) : (
              <div className="text-amber-600 font-medium">
                ⚠️ No Active Cycle
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AnalyticsPlaceholder />
    </div>
  );
}