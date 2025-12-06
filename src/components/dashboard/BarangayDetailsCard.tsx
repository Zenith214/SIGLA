"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ApiBarangayData } from "@/utils/barangayUtils";
import { useActiveCycle } from "@/hooks/useSurveyCycle";

interface BarangayDetailsCardProps {
  selectedBarangay?: ApiBarangayData | null;
  selectedCycleId: number | null;
}

export default function BarangayDetailsCard({ selectedBarangay, selectedCycleId }: BarangayDetailsCardProps) {
  const { activeCycle } = useActiveCycle();
  const [surveyProgress, setSurveyProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch fresh progress data when barangay changes
  useEffect(() => {
    if (!selectedBarangay) {
      setSurveyProgress(0);
      return;
    }

    const fetchProgress = async () => {
      setLoading(true);
      try {
        const cycleId = selectedCycleId || activeCycle?.cycle_id;
        if (!cycleId) {
          setSurveyProgress(selectedBarangay.progress || 0);
          return;
        }

        // Fetch fresh barangay data with current progress
        const response = await fetch(`/api/barangays/all?cycle_id=${cycleId}&include_awards=true`);
        if (response.ok) {
          const data = await response.json();
          const barangayData = data.data || data;
          const currentBarangay = barangayData.find((b: any) => 
            (b.barangay_id || b.id) === selectedBarangay.id
          );
          
          if (currentBarangay) {
            setSurveyProgress(currentBarangay.progress || currentBarangay.completion_rate || 0);
          } else {
            setSurveyProgress(selectedBarangay.progress || 0);
          }
        } else {
          setSurveyProgress(selectedBarangay.progress || 0);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
        setSurveyProgress(selectedBarangay.progress || 0);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [selectedBarangay?.id, selectedCycleId, activeCycle?.cycle_id]);

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
            {/* Static barangay information - always visible */}
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
                <p className="text-gray-900 font-semibold">{selectedBarangay.area || 'N/A'} km²</p>
              </div>
            </div>

            {/* Survey Progress Section */}
            <div className="border-t pt-3 mt-3">
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="w-full bg-gray-200 rounded-full h-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Survey Progress</span>
                    <span className="font-bold text-gray-900">{surveyProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        surveyProgress === 100 ? 'bg-green-500' :
                        surveyProgress >= 50 ? 'bg-blue-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${surveyProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {surveyProgress === 100 
                      ? 'Survey completed' 
                      : surveyProgress === 0
                      ? 'Survey has not started yet'
                      : `${(100 - surveyProgress).toFixed(0)}% remaining`}
                  </p>
                </div>
              )}
            </div>

            {/* View Details Button */}
            <div className="mt-4">
              <button
                onClick={() => {
                  // Dispatch custom event to open the modal in InteractiveSVGMap
                  window.dispatchEvent(new CustomEvent('openBarangayDetailsModal'));
                }}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Details
              </button>
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