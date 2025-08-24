"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Dropdown from "./Dropdown";
import InteractiveSVGMap from "./InteractiveSVGMap";
import { type ApiBarangayData } from "@/utils/barangayUtils";

interface MapCardProps {
  onBarangaySelect?: (barangay: ApiBarangayData) => void;
}

export default function MapCard({ onBarangaySelect }: MapCardProps) {
  const currentYear = new Date().getFullYear().toString();
  const dropdownOptions = [
    { value: currentYear, label: currentYear }
  ];

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 flex-shrink-0">
        <div className="flex flex-col space-y-1">
          <CardTitle className="text-xl font-semibold">Satisfaction Index Overview</CardTitle>
          <p className="text-sm text-gray-600">
            Interactive map showing barangay satisfaction index status. Click on any barangay to view detailed information and historical data.
          </p>
        </div>
        <Dropdown
          options={dropdownOptions}
          placeholder={currentYear}
          defaultValue={currentYear}
        />
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        {/* Interactive SVG map container */}
        <div className="w-full h-full bg-white rounded-lg border overflow-hidden">
          <InteractiveSVGMap onBarangaySelect={onBarangaySelect} />
        </div>
      </CardContent>
    </Card>
  );
}