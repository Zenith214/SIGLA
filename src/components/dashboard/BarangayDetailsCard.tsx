"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarangayData } from "@/data/barangayData";

interface BarangayDetailsCardProps {
  selectedBarangay?: BarangayData | null;
}

export default function BarangayDetailsCard({ selectedBarangay }: BarangayDetailsCardProps) {
  return (
    <Card className="w-full h-full flex flex-col mb-4">
      <CardHeader className="flex-shrink-0 pb-2">
        <CardTitle className="text-lg font-semibold">
          {selectedBarangay ? `${selectedBarangay.name} Details` : "Barangay Details"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-start pt-3">
        {selectedBarangay ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700 mb-1">Population:</p>
                <p className="text-gray-900 font-semibold">{selectedBarangay.population.toLocaleString()}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">Households:</p>
                <p className="text-gray-900 font-semibold">{selectedBarangay.households.toLocaleString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700 mb-1">Area:</p>
                <p className="text-gray-900 font-semibold">{selectedBarangay.area} km²</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">Survey Status:</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedBarangay.surveyStatus === 'Completed' ? 'bg-green-500' :
                    selectedBarangay.surveyStatus === 'In Progress' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-gray-900 font-semibold text-xs">{selectedBarangay.surveyStatus}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">
            <p className="text-sm">Click on a barangay in the map to view details</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}