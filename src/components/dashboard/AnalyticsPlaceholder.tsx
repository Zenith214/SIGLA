"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CycleDisplay } from "@/components/survey-cycle";
import { useActiveCycle } from "@/hooks/useSurveyCycle";

export default function AnalyticsPlaceholder() {
  const { activeCycle, hasActiveCycle, loading } = useActiveCycle();

  return (
    <div className="h-full space-y-4">
      {/* Cycle Context Display */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <CycleDisplay />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
        {/* Chart placeholders */}
        <Card className="col-span-1 md:col-span-2 flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle>
              Survey Analytics Overview
              {hasActiveCycle && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  - {activeCycle?.name} ({activeCycle?.year})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
          <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
            {loading ? (
              <p className="text-gray-500">Loading cycle data...</p>
            ) : hasActiveCycle ? (
              <div className="text-center">
                <p className="text-gray-500">Chart placeholder - Survey trends over time</p>
                <p className="text-xs text-gray-400 mt-2">
                  Data filtered for: {activeCycle?.name} ({activeCycle?.year})
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-500">No active survey cycle</p>
                <p className="text-xs text-gray-400 mt-2">
                  Contact an administrator to set up a survey cycle
                </p>
              </div>
            )}
          </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Response Rate</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Pie chart placeholder</p>
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Regional Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Bar chart placeholder</p>
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Data Quality Metrics</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Metrics dashboard placeholder</p>
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Activity feed placeholder</p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}