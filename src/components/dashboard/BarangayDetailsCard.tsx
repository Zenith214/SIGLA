"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type ApiBarangayData } from "@/utils/barangayUtils";
import { useActiveCycle } from "@/hooks/useSurveyCycle";
import { 
  type SatisfactionData, 
  fetchSatisfactionData,
  getSatisfactionColorClass,
  getSatisfactionLabel 
} from "@/utils/satisfactionDataHelpers";

/**
 * SkeletonLoader Component
 * Displays a skeleton loading state for satisfaction data section
 */
function SkeletonLoader() {
  return (
    <div className="space-y-3 animate-pulse">
      {/* Overall Satisfaction Skeleton */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="flex items-center gap-2">
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3"></div>
        <div className="h-3 bg-gray-200 rounded w-32 mt-1"></div>
      </div>

      {/* Service Area Scores Skeleton */}
      <div className="border-t pt-3">
        <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-200 rounded w-12"></div>
                <div className="w-16 bg-gray-200 rounded-full h-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * ServiceAreaScore Component
 * Displays a single service area score with visual indicator and color coding
 */
interface ServiceAreaScoreProps {
  name: string;
  score: number | null;
}

function ServiceAreaScore({ name, score }: ServiceAreaScoreProps) {
  // Determine color based on score
  const getScoreColor = (score: number | null): string => {
    if (score === null) return 'bg-gray-400';
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = (score: number | null): string => {
    if (score === null) return 'text-gray-600';
    if (score >= 70) return 'text-green-700';
    if (score >= 50) return 'text-yellow-700';
    return 'text-red-700';
  };

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <span className="text-xs font-medium text-gray-700">{name}</span>
      <div className="flex items-center gap-2">
        {score !== null ? (
          <>
            <span className={`text-sm font-bold ${getTextColor(score)}`}>
              {score.toFixed(1)}%
            </span>
            <div className="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getScoreColor(score)}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </>
        ) : (
          <span className="text-xs text-gray-500 font-medium">N/A</span>
        )}
      </div>
    </div>
  );
}

interface BarangayDetailsCardProps {
  selectedBarangay?: ApiBarangayData | null;
  selectedCycleId: number | null;
}

export default function BarangayDetailsCard({ selectedBarangay, selectedCycleId }: BarangayDetailsCardProps) {
  const { activeCycle } = useActiveCycle();
  
  // State for satisfaction data
  const [satisfactionData, setSatisfactionData] = useState<SatisfactionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch satisfaction data function (can be called for retry)
  const fetchData = async () => {
    if (!selectedBarangay) return;

    // Determine which cycle to use: selected cycle or active cycle
    const effectiveCycleId = selectedCycleId || activeCycle?.cycle_id;
    
    if (!effectiveCycleId) {
      setError('No active cycle available. Please ensure a survey cycle is active.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchSatisfactionData(selectedBarangay.id, effectiveCycleId);
      setSatisfactionData(data);
      // Clear any previous errors on successful fetch
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load satisfaction data';
      setError(errorMessage);
      
      // Log detailed error information for debugging
      console.error('Error fetching satisfaction data:', {
        error: err,
        barangayId: selectedBarangay.id,
        barangayName: selectedBarangay.name,
        cycleId: selectedCycleId,
        timestamp: new Date().toISOString(),
        errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Retry function for error handling
  const handleRetry = () => {
    fetchData();
  };

  // Fetch satisfaction data when barangay or cycle changes
  useEffect(() => {
    // Reset state when no barangay is selected
    if (!selectedBarangay) {
      setSatisfactionData(null);
      setError(null);
      setLoading(false);
      return;
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBarangay, selectedCycleId]);

  // Determine if viewing historical data
  const isHistorical = satisfactionData && activeCycle && satisfactionData.cycleId !== activeCycle.cycle_id;

  return (
    <Card className="w-full h-full flex flex-col mb-4">
      <CardHeader className="flex-shrink-0 pb-2">
        <CardTitle className="text-lg font-semibold">
          {selectedBarangay ? `${selectedBarangay.name} Details` : "Barangay Details"}
        </CardTitle>
        {satisfactionData && (
          <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium text-blue-900">
                Currently viewing: <span className="font-semibold">{satisfactionData.cycleName} ({satisfactionData.cycleYear})</span>
              </span>
              {isHistorical && (
                <Badge variant="outline" className="text-xs bg-white">
                  Historical Data
                </Badge>
              )}
            </div>
          </div>
        )}
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
              <div>
                <p className="font-medium text-gray-700 mb-1">Survey Status:</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedBarangay.status === 'Completed' ? 'bg-green-500' :
                    selectedBarangay.status === 'In Progress' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-gray-900 font-semibold text-xs">{selectedBarangay.status}</span>
                </div>
              </div>
            </div>

            {/* Satisfaction data section */}
            <div className="border-t pt-3 mt-3 min-h-[400px]">
              {loading && (
                <SkeletonLoader />
              )}

              {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-red-900 font-medium mb-1">Unable to Load Data</p>
                      <p className="text-red-700 text-xs mb-3">{error}</p>
                      <button 
                        onClick={handleRetry}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Try Again
                      </button>
                      {satisfactionData && satisfactionData.hasData && (
                        <div className="mt-3 pt-3 border-t border-red-200">
                          <p className="text-xs text-red-600 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Showing previously loaded data below
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!loading && !error && satisfactionData && !satisfactionData.hasData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-blue-900 font-medium mb-1">No Data Available</p>
                      <p className="text-blue-700 text-xs">
                        No satisfaction data has been collected for <span className="font-semibold">{selectedBarangay.name}</span> in <span className="font-semibold">{satisfactionData.cycleName}</span>.
                      </p>
                      {satisfactionData.cycleId !== activeCycle?.cycle_id && (
                        <p className="text-blue-600 text-xs mt-2">
                          Try selecting a different cycle or check back later.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!loading && !error && satisfactionData && satisfactionData.hasData && (
                <div className="space-y-3 animate-fadeIn">
                  {/* Overall Satisfaction Score */}
                  <div className="transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-700">Overall Satisfaction</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900 transition-all duration-300">
                          {satisfactionData.overallSatisfaction?.toFixed(1)}%
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium transition-all duration-300 ${getSatisfactionColorClass(satisfactionData.overallSatisfaction || null)}`}>
                          {getSatisfactionLabel(satisfactionData.overallSatisfaction || null)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ease-out ${
                          satisfactionData.overallSatisfaction !== null && satisfactionData.overallSatisfaction >= 70
                            ? 'bg-green-500'
                            : satisfactionData.overallSatisfaction !== null && satisfactionData.overallSatisfaction >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${satisfactionData.overallSatisfaction || 0}%` }}
                      />
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1 transition-opacity duration-300">
                      Based on {satisfactionData.responseCount} {satisfactionData.responseCount === 1 ? 'response' : 'responses'}
                    </p>
                  </div>

                  {/* Service Area Scores Breakdown */}
                  <div className="border-t pt-3 transition-all duration-300">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Service Areas</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <ServiceAreaScore 
                        name="Financial" 
                        score={satisfactionData.serviceScores.financial} 
                      />
                      <ServiceAreaScore 
                        name="Disaster" 
                        score={satisfactionData.serviceScores.disaster} 
                      />
                      <ServiceAreaScore 
                        name="Safety" 
                        score={satisfactionData.serviceScores.safety} 
                      />
                      <ServiceAreaScore 
                        name="Social" 
                        score={satisfactionData.serviceScores.social} 
                      />
                      <ServiceAreaScore 
                        name="Business" 
                        score={satisfactionData.serviceScores.business} 
                      />
                      <ServiceAreaScore 
                        name="Environmental" 
                        score={satisfactionData.serviceScores.environmental} 
                      />
                    </div>
                  </div>
                </div>
              )}
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