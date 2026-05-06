"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useActiveCycle } from "@/hooks/useSurveyCycle";
import { Search, ChevronRight, Award, MapPin, Map, List } from "lucide-react";
import BarangayDetailsCard from "./BarangayDetailsCard";
import SGLGBHistoryCard from "./SGLGBHistoryCard";
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { HistoricalCycleSelector } from "@/components/survey-cycle";

import { type ApiBarangayData } from "@/utils/barangayUtils";
import { getBarangayLogoPath } from "@/utils/logoUtils";

// Helper function to convert status to progress value
function getProgressValue(status: string | null) {
  switch(status) {
    case 'Completed': return 100;
    case 'In Progress': return 50;
    case 'Pending': return 0;
    default: return 0;
  }
}

// Get status badge color
const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-500';
    case 'In Progress':
      return 'bg-blue-500';
    case 'Pending':
    default:
      return 'bg-gray-500';
  }
};

export default function BarangayListView({ viewMode, onViewModeChange }: { viewMode?: 'map' | 'list', onViewModeChange?: (mode: 'map' | 'list') => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState<ApiBarangayData | null>(null);
  const [barangays, setBarangays] = useState<ApiBarangayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  const [funnelData, setFunnelData] = useState<any>(null);
  const [loadingFunnel, setLoadingFunnel] = useState(true);
  const { activeCycle, hasActiveCycle } = useActiveCycle();

  // Fetch funnel data for the selected barangay
  useEffect(() => {
    if (!selectedBarangay) {
      setFunnelData(null);
      setLoadingFunnel(false);
      return;
    }

    const fetchFunnelData = async () => {
      try {
        setLoadingFunnel(true);
        const cycleId = selectedCycleId || (hasActiveCycle && activeCycle ? activeCycle.cycle_id : null);
        
        if (!cycleId) {
          console.warn('[Mobile] No cycle ID available for funnel data');
          setLoadingFunnel(false);
          return;
        }

        console.log(`[Mobile] Fetching funnel data for barangay ${selectedBarangay.id}, cycle ${cycleId}`);
        const response = await fetch(`/api/ml/funnel-analysis?barangayId=${selectedBarangay.id}&cycleId=${cycleId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('[Mobile] Funnel data received:', data);
          console.log('[Mobile] Overall Satisfaction:', data.overall_satisfaction);
          console.log('[Mobile] Overall Need Action:', data.overall_need_action);
          setFunnelData(data);
        } else {
          console.error('[Mobile] Funnel API returned non-OK status:', response.status);
        }
      } catch (error) {
        console.error('[Mobile] Error fetching funnel data:', error);
      } finally {
        setLoadingFunnel(false);
      }
    };

    fetchFunnelData();
  }, [selectedBarangay, selectedCycleId, activeCycle, hasActiveCycle]);

  // Fetch barangays from API
  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        setLoading(true);
        // Use selected cycle if available, otherwise use active cycle
        const cycleId = selectedCycleId || (hasActiveCycle && activeCycle ? activeCycle.cycle_id : null);
        
        // Use the same API as the map view to get award data
        const apiUrl = cycleId 
          ? `/api/barangays/all?cycle_id=${cycleId}&include_awards=true`
          : `/api/barangays-by-year?year=${new Date().getFullYear()}`;
        
        const response = await fetch(apiUrl);
        if (response.ok) {
          const responseData = await response.json();
          // Handle both new API format (with success/data structure) and legacy format
          const data = responseData.data || responseData;
          
          // Map the data to include award status and apply name/logo corrections
          const NAME_MAPPING: Record<string, string> = {
            "Haradabutai": "Harada Butai",
            "Parame": "Parami",
            "Solong Vale": "Solongvale"
          };

          const barangaysWithHistory = data.map((barangay: any) => {
            const rawName = barangay.barangay_name || barangay.name;
            const correctedName = NAME_MAPPING[rawName] || rawName;

            // Construct fallback logo URL if missing from database
            let logo_url = barangay.logo_url;
            if (!logo_url) {
              const extension = correctedName === "Parami" ? "png" : "jpg";
              logo_url = `/barangay-logos/${correctedName}.${extension}`;
            }

            return {
              id: barangay.barangay_id || barangay.id,
              name: correctedName,
              population: barangay.population || 0,
              households: barangay.households || 0,
              area: barangay.area || 0,
              progress: barangay.progress || 0,
              status: barangay.status || 'No data',
              currentStatus: barangay.currentStatus || barangay.status,
              description: barangay.description,
              seal: barangay.seal,
              logo_url: logo_url,
              // Include cycle-aware award information
              isAwardee: barangay.isAwardee || barangay.awardStatus?.isAwardee || false,
              awardStatus: barangay.awardStatus,
              cycleId: cycleId || undefined,
              history: [
                { 
                  year: cycleId ? 'cycle' : new Date().getFullYear().toString(), 
                  status: barangay.status || 'No data', 
                  score: barangay.survey_count > 0 ? `${Math.round(barangay.completion_rate || 0)}%` : "N/A"
                }
              ]
            };
          });
          
          setBarangays(barangaysWithHistory);
          console.log(`✅ Mobile view: Loaded ${barangaysWithHistory.length} barangays for cycle ${cycleId || 'current'}`);
          console.log(`🎯 Awardees found: ${barangaysWithHistory.filter((b: any) => b.isAwardee).length}`);
        }
      } catch (error) {
        console.error('Error fetching barangays:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBarangays();
  }, [activeCycle, hasActiveCycle, selectedCycleId]);
  
  // Helper function to determine award status from actual data
  const getAwardStatus = (barangay: ApiBarangayData) => {
    // Use the isAwardee flag from the API response
    return barangay.isAwardee || false;
  };

  const filteredBarangays = barangays.filter((barangay) =>
    barangay.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    getAwardStatus(barangay) // Only show awardees
  );

  if (selectedBarangay) {
    const satisfactionPercentage = funnelData?.overall_satisfaction || 0;
    
    // Calculate overall NFA by averaging service area need_action scores (same as desktop)
    const needForActionPercentage = (() => {
      if (!funnelData?.service_scores) return 0;
      
      const serviceScores = Object.values(funnelData.service_scores);
      const validScores = serviceScores.filter((score: any) => 
        score.need_action !== null && score.need_action !== undefined
      );
      
      if (validScores.length === 0) return 0;
      
      const avgNFA = validScores.reduce((sum: number, score: any) => 
        sum + (score.need_action || 0), 0
      ) / validScores.length;
      
      return avgNFA;
    })();
    
    const surveyProgress = selectedBarangay.progress || 0;
    const isHighSatisfaction = satisfactionPercentage >= 58;

    console.log('[Mobile Display] Barangay:', selectedBarangay.name);
    console.log('[Mobile Display] Satisfaction:', satisfactionPercentage);
    console.log('[Mobile Display] NFA (calculated):', needForActionPercentage);
    console.log('[Mobile Display] Progress:', surveyProgress);
    console.log('[Mobile Display] Service Scores:', funnelData?.service_scores);

    const handleViewReportCard = () => {
      // Navigate to score card page with barangay data
      const params = new URLSearchParams({
        barangay: selectedBarangay.name,
        population: selectedBarangay.population.toString(),
        households: selectedBarangay.households.toString(),
        area: (selectedBarangay.area || 0).toString(),
        surveyStatus: selectedBarangay.status,
        satisfaction: satisfactionPercentage.toString(),
        logo_url: selectedBarangay.logo_url || ''
      });
      
      window.location.href = `/reportcard?${params.toString()}`;
    };

    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header with back button */}
        <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 p-4">
          <button
            onClick={() => setSelectedBarangay(null)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-3"
          >
            ← Back to List
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-slate-800">{selectedBarangay.name}</h2>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              getAwardStatus(selectedBarangay) 
                ? "text-white" 
                : "text-white"
            }`}
            style={{
              backgroundColor: getAwardStatus(selectedBarangay) ? "#64D9B7" : "#6A7280"
            }}>
              {getAwardStatus(selectedBarangay) ? "Awardee" : "Non-Awardee"}
            </div>
          </div>
        </div>
        
        {/* Content - Satisfaction Index */}
        <div className="flex-1 overflow-auto p-4">
          {loadingFunnel ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading barangay data...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Survey Progress */}
              <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium text-sm">Survey Progress</span>
                  <span className="text-gray-900 font-bold text-lg">{surveyProgress.toFixed(0)}%</span>
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
                <p className="text-xs text-gray-500 mt-2">
                  {surveyProgress === 100 
                    ? 'Survey completed' 
                    : surveyProgress === 0
                    ? 'Survey has not started yet'
                    : `${(100 - surveyProgress).toFixed(0)}% remaining`}
                </p>
              </div>

              {/* Overall Satisfaction and Need for Action Cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Overall Satisfaction */}
                <div className="border-2 border-gray-300 rounded-xl p-4 bg-white shadow-sm">
                  <div className="text-center">
                    <div className="text-3xl mb-2">📊</div>
                    <div className="text-xs font-semibold text-gray-600 mb-2">Overall Satisfaction</div>
                    <div className={`text-2xl font-bold ${isHighSatisfaction ? 'text-green-600' : 'text-red-600'}`}>
                      {satisfactionPercentage.toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {isHighSatisfaction ? 'Above cutoff' : 'Below cutoff'}
                    </div>
                  </div>
                </div>

                {/* Overall Need for Action */}
                <div className="border-2 border-gray-300 rounded-xl p-4 bg-white shadow-sm">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="text-xs font-semibold text-gray-600 mb-2">Overall NFA</div>
                    <div className={`text-2xl font-bold ${needForActionPercentage > 30 ? 'text-orange-600' : 'text-green-600'}`}>
                      {needForActionPercentage.toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {needForActionPercentage > 30 ? 'Action needed' : 'Low priority'}
                    </div>
                  </div>
                </div>
              </div>

            {/* Barangay Logos - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              {/* BLGU Logo */}
              <div className="border-2 border-gray-200 rounded-xl p-4 h-28 flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 shadow-sm">
                {(() => {
                  const logoUrl = getBarangayLogoPath(selectedBarangay.name);
                  return (
                    <img 
                      src={logoUrl} 
                      alt={`${selectedBarangay.name} logo`}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<span class="text-sm font-bold text-gray-700 tracking-wide">BLGU LOGO</span>';
                      }}
                    />
                  );
                })()}
              </div>

              {/* MLGRC Logo */}
              <div className="border-2 border-gray-200 rounded-xl p-4 h-28 flex items-center justify-center bg-gradient-to-br from-purple-50 to-gray-50 shadow-sm">
                <img 
                  src="/mlgrclogohd.png" 
                  alt="MLGRC Logo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>

              {/* View Score Card Button */}
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
                onClick={handleViewReportCard}
              >
                View Score Card
              </button>

              {/* How to Use Section */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-blue-50 shadow-sm">
                <h3 className="text-gray-800 font-semibold mb-3 text-base">How to Read This Report</h3>

                <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
                  {/* Survey Progress */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Survey Progress</h4>
                    <p>Shows the completion percentage of surveys for this barangay. Green indicates completed (100%), blue shows in progress (50%+), and gray means not started.</p>
                  </div>

                  {/* Overall Satisfaction */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Overall Satisfaction</h4>
                    <p>Shows the barangay's overall performance score. Green (58% or higher) indicates good performance, while red (below 58%) suggests areas needing improvement.</p>
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                      <p className="font-semibold text-blue-900 mb-1">How is 58% calculated?</p>
                      <p className="text-blue-800">Cut-off = 50% + (0.98 / √n)</p>
                      <p className="text-blue-700 mt-1">For n=150: Cut-off = 50% + 8% = <span className="font-semibold">58%</span></p>
                    </div>
                  </div>

                  {/* Overall NFA */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Overall Need for Action (NFA)</h4>
                    <p>Indicates the percentage of services requiring improvements. Orange (above 30%) means action is needed, while green (below 30%) indicates low priority.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <CardTitle className="text-xl font-semibold">
            Satisfaction Index Overview
            {hasActiveCycle && (
              <span className="text-sm font-normal text-blue-600 block mt-1">
                {activeCycle?.name} ({activeCycle?.year})
              </span>
            )}
          </CardTitle>
          {/* View Toggle for Officers */}
          {viewMode && onViewModeChange && (
            <div className="bg-gray-100 rounded-lg p-1 flex gap-1">
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('map')}
                className="h-8 px-3"
              >
                <Map className="h-4 w-4 mr-1" />
                Map
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="h-8 px-3"
              >
                <List className="h-4 w-4 mr-1" />
                List
              </Button>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Browse and search through all barangays to view their satisfaction index status and details.
          {hasActiveCycle && (
            <span className="text-blue-600"> Data filtered for active survey cycle.</span>
          )}
        </p>
        
        {/* Historical Cycle Selector */}
        <div className="mb-4">
          <HistoricalCycleSelector
            onCycleChange={setSelectedCycleId}
            placeholder="Current cycle data"
          />
        </div>
        
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search barangays..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
      </div>

      {/* Barangay list */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-3">
          {filteredBarangays.map((barangay, index) => {
            const isAwardee = getAwardStatus(barangay);
            return (
              <button
                key={`${barangay.id}-${barangay.name}-${index}`}
                onClick={() => setSelectedBarangay(barangay)}
                className="w-full text-left p-4 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{barangay.name}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isAwardee ? "text-white" : "text-white"
                      }`}
                      style={{
                        backgroundColor: isAwardee ? "#64D9B7" : "#6A7280"
                      }}>
                        {isAwardee ? "Awardee" : "Non-Awardee"}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Population: {barangay.population.toLocaleString()}</span>
                      <span>Households: {barangay.households.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                      <span className={`w-2 h-2 rounded-full ${
                        barangay.status === 'Completed' ? 'bg-green-500' :
                        barangay.status === 'In Progress' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}></span>
                      <span>{barangay.status}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            );
          })}
          {loading && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium mb-2">Loading barangays...</p>
            </div>
          )}
          {!loading && filteredBarangays.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No barangays found</p>
              <p>No barangays match "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>




    </div>
  );
}