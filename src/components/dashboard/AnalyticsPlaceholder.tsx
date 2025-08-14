"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPlaceholder() {
  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
      {/* Chart placeholders */}
      <Card className="col-span-1 md:col-span-2 flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Survey Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder - Survey trends over time</p>
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
  );
}