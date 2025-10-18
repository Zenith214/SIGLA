"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Dropdown from "./Dropdown";
import InteractiveSVGMap from "./InteractiveSVGMap";
import { type ApiBarangayData } from "@/utils/barangayUtils";

interface MapCardProps {
  onBarangaySelect?: (barangay: ApiBarangayData) => void;
}

export default function MapCard({ onBarangaySelect }: MapCardProps) {
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState<string[]>([currentYear]);
  const [isLoadingYears, setIsLoadingYears] = useState(true);

  // Fetch available years
  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        setIsLoadingYears(true);
        const response = await fetch('/api/survey-years');
        if (response.ok) {
          const years = await response.json();
          setAvailableYears(years);
        }
      } catch (error) {
        console.error('Error fetching available years:', error);
      } finally {
        setIsLoadingYears(false);
      }
    };

    fetchAvailableYears();
  }, []);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };

  const dropdownOptions = availableYears.map(year => ({
    value: year,
    label: year
  }));

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
          placeholder={isLoadingYears ? "Loading..." : selectedYear}
          defaultValue={selectedYear}
          onValueChange={handleYearChange}
        />
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        {/* Interactive SVG map container */}
        <div className="w-full h-full bg-white rounded-lg border overflow-hidden">
          <InteractiveSVGMap 
            onBarangaySelect={onBarangaySelect} 
            selectedYear={selectedYear}
          />
        </div>
      </CardContent>
    </Card>
  );
}