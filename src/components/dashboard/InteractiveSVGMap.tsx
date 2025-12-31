"use client";

import { useState, useRef, useEffect } from "react";
import { isBarangayAwardee, type ApiBarangayData } from "@/utils/barangayUtils";
import SmallCalloutModal from "./SmallCalloutModal";
import { useActiveCycle } from "@/hooks/useSurveyCycle";
import BarangaySatisfactionIndex from "./BarangaySatisfactionIndex";
import barangayPaths from "@/data/barangayPaths";

interface InteractiveSVGMapProps {
  onBarangayHover?: (barangay: ApiBarangayData | null) => void;
  onBarangayLock?: (barangay: ApiBarangayData) => void;
  lockedBarangay?: ApiBarangayData | null;
  selectedCycleId?: number | null;
  officerBarangayId?: number;
  onAutoSelectComplete?: () => void;
}

export default function InteractiveSVGMap({ 
  onBarangayHover, 
  onBarangayLock, 
  lockedBarangay, 
  selectedCycleId,
  officerBarangayId,
  onAutoSelectComplete
}: InteractiveSVGMapProps) {
  const [hoveredBarangay, setHoveredBarangay] = useState<string | null>(null);
  const [lockedBarangayName, setLockedBarangayName] = useState<string | null>(null);
  const [calloutPosition, setCalloutPosition] = useState<{ x: number; y: number } | null>(null);
  const [showLargeModal, setShowLargeModal] = useState(false);
  const [barangays, setBarangays] = useState<{ [key: string]: ApiBarangayData }>({});
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<SVGSVGElement>(null);
  const { activeCycle, hasActiveCycle } = useActiveCycle();

  // Mapping from SVG path IDs to actual barangay names based on geographic location
  const barangayMapping = {
    "1katipunan": "Katipunan",
    "2tanwalang": "Tanwalang", 
    "3solongvale": "Solongvale",
    "4tala-o": "Tala-O",
    "5balasinon": "Balasinon",
    "6haradabutai": "Harada Butai",
    "7roxas": "Roxas",
    "8newcebu": "New Cebu",
    "9palili": "Palili",
    "10talas": "Talas",
    "11carre": "Carre",
    "12buguis": "Buguis",
    "13mckinley": "Mckinley",
    "14kiblagon": "Kiblagon",
    "15laperas": "Laperas",
    "16clib": "Clib",
    "17osmena": "Osmeña",
    "18luparan": "Luparan",
    "19poblacion": "Poblacion",
    "20tagolilong": "Tagolilong",
    "21lapla": "Lapla",
    "22litos": "Litos",
    "23parame": "Parame",
    "24labon": "Labon",
    "25waterfall": "Waterfall"
  };

  // Fetch barangay data from database
  useEffect(() => {
    const fetchBarangayData = async () => {
      try {
        setIsLoading(true);
        
        // Determine which cycle to use for data
        // If no specific cycle is selected, use the active cycle
        const cycleId = selectedCycleId !== null ? selectedCycleId : (hasActiveCycle && activeCycle ? activeCycle.cycle_id : null);
        
        console.log('🔍 Map data fetch:', {
          selectedCycleId,
          hasActiveCycle,
          activeCycleId: activeCycle?.cycle_id,
          finalCycleId: cycleId
        });
        
        // If we don't have a cycle ID yet and we're expecting an active cycle, wait for it
        if (selectedCycleId === null && !hasActiveCycle && !activeCycle) {
          console.log('⏳ Waiting for active cycle to load...');
          setIsLoading(false);
          return;
        }
        
        // Always use cycle-aware API with awards when we have a cycle ID
        const apiUrl = cycleId 
          ? `/api/barangays/all?cycle_id=${cycleId}&include_awards=true`
          : `/api/barangays-by-year?year=${new Date().getFullYear()}`;
        const response = await fetch(apiUrl);

        if (response.ok) {
          const responseData = await response.json();
          // Handle both new API format (with success/data structure) and legacy format
          const data = responseData.data || responseData;
          const barangaysByName: { [key: string]: ApiBarangayData } = {};
          
          // Create entries for all barangays (including those with no data)
          Object.values(barangayMapping).forEach((barangayName) => {
            const barangayData = data.find((b: any) => 
              (b.barangay_name || b.name) === barangayName
            );

            if (barangayData) {
              const name = barangayData.barangay_name || barangayData.name;
              barangaysByName[name] = {
                id: barangayData.barangay_id || barangayData.id,
                name: name,
                population: barangayData.population || 0,
                households: barangayData.households || 0,
                area: barangayData.area || 0,
                progress: barangayData.progress || 0,
                status: barangayData.status || 'No data',
                currentStatus: barangayData.currentStatus || barangayData.status,
                description: barangayData.description || `No data available`,
                seal: barangayData.seal || 'no',
                logo_url: barangayData.logo_url || null,
                survey_count: barangayData.survey_count || 0,
                completion_rate: barangayData.completion_rate || 0,
                year: cycleId ? 'cycle' : new Date().getFullYear().toString(),
                // Include cycle-aware award information
                awardStatus: barangayData.awardStatus ? {
                  isAwardee: barangayData.awardStatus.isAwardee,
                  awardedDate: barangayData.awardStatus.awardedDate,
                  notes: barangayData.awardStatus.notes,
                  awardId: barangayData.awardStatus.awardId,
                  cycleId: barangayData.awardStatus.cycleId,
                  createdAt: barangayData.awardStatus.createdAt,
                  updatedAt: barangayData.awardStatus.updatedAt
                } : undefined,
                cycleId: cycleId || undefined,
                isAwardee: barangayData.isAwardee || barangayData.awardStatus?.isAwardee || false,
                history: [
                  {
                    year: cycleId ? 'cycle' : new Date().getFullYear().toString(),
                    status: barangayData.status || 'No data',
                    score: barangayData.survey_count > 0 ? `${Math.round(barangayData.completion_rate || 0)}%` : "N/A",
                  }
                ],
              };
            } else {
              // Create placeholder for barangays with no data
              const displayYear = cycleId ? 'cycle' : new Date().getFullYear().toString();
              barangaysByName[barangayName] = {
                id: 0,
                name: barangayName,
                population: 0,
                households: 0,
                area: 0,
                progress: 0,
                status: 'No data',
                currentStatus: 'No data',
                description: `No data available`,
                seal: 'no', // No seal for placeholder data
                seal_original: 'no',
                survey_count: 0,
                completion_rate: 0,
                year: displayYear,
                cycleId: cycleId || undefined,
                isAwardee: false, // Default to non-awardee for placeholder data
                history: [
                  {
                    year: displayYear,
                    status: 'No data',
                    score: "N/A",
                  }
                ],
              };
            }
          });

          setBarangays(barangaysByName);
          console.log(`✅ Barangay data loaded for cycle ${cycleId || 'current'}:`, Object.keys(barangaysByName).length, 'barangays');
          console.log('🎯 Award data included:', cycleId ? 'Yes' : 'No', '- Cycle ID:', cycleId);
        }
      } catch (error) {
        console.error('❌ Error fetching barangay data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBarangayData();
  }, [selectedCycleId, activeCycle, hasActiveCycle]);

  // Auto-select officer's designated barangay
  useEffect(() => {
    if (!officerBarangayId || !barangays || Object.keys(barangays).length === 0 || isLoading) {
      return;
    }

    // Find the barangay that matches the officer's designation
    const designatedBarangay = Object.values(barangays).find(
      (b) => b.id === officerBarangayId
    );

    if (designatedBarangay && onBarangayLock) {
      console.log('🎯 Auto-selecting officer designated barangay:', designatedBarangay.name);
      
      // Fetch historical data for the designated barangay
      if (designatedBarangay.id > 0) {
        fetch(`/api/barangays/${designatedBarangay.id}/history`)
          .then(res => res.json())
          .then(historyData => {
            if (historyData.success && historyData.data.length > 0) {
              const barangayWithHistory = {
                ...designatedBarangay,
                history: historyData.data
              };
              onBarangayLock(barangayWithHistory);
            } else {
              onBarangayLock(designatedBarangay);
            }
          })
          .catch(error => {
            console.error('Error fetching history for auto-select:', error);
            onBarangayLock(designatedBarangay);
          });
      } else {
        onBarangayLock(designatedBarangay);
      }

      // Set the locked barangay name for visual feedback
      setLockedBarangayName(designatedBarangay.name);
      
      // Notify parent that auto-select is complete
      onAutoSelectComplete?.();
    }
  }, [officerBarangayId, barangays, isLoading, onBarangayLock, onAutoSelectComplete]);

  // Listen for custom event to open modal from BarangayDetailsCard
  useEffect(() => {
    const handleOpenModal = () => {
      if (lockedBarangayName) {
        setShowLargeModal(true);
      }
    };

    window.addEventListener('openBarangayDetailsModal', handleOpenModal);
    return () => {
      window.removeEventListener('openBarangayDetailsModal', handleOpenModal);
    };
  }, [lockedBarangayName]);

  const handlePathHover = (pathId: string) => {
    const barangayName = barangayMapping[pathId as keyof typeof barangayMapping];
    if (barangayName) {
      setHoveredBarangay(barangayName);
      
      // Notify parent component about hover with full barangay data
      const barangay = barangays[barangayName];
      if (barangay && onBarangayHover) {
        onBarangayHover(barangay);
      }
    }
  };

  const handlePathLeave = () => {
    setHoveredBarangay(null);
    
    // Clear hover preview in parent (unless something is locked)
    if (onBarangayHover && !lockedBarangayName) {
      onBarangayHover(null);
    }
  };

  const handlePathClick = async (pathId: string, event: React.MouseEvent) => {
    console.log('🖱️ Path clicked:', pathId); // Debug log
    
    const barangayName = barangayMapping[pathId as keyof typeof barangayMapping];
    let barangay = barangayName ? barangays[barangayName] : null;
    
    console.log('📍 Barangay found:', barangayName, barangay); // Debug log
    
    // If no barangay data exists, use the placeholder that should already be created
    if (!barangay && barangayName) {
      const currentYear = selectedCycleId ? 'cycle' : new Date().getFullYear().toString();
      barangay = {
        id: 0, // Use 0 to indicate no data
        name: barangayName,
        population: 0,
        households: 0,
        area: 0,
        progress: 0,
        status: 'No data',
        currentStatus: 'No data',
        description: `No data available for ${currentYear}`,
        seal: 'no',
        seal_original: 'no',
        survey_count: 0,
        completion_rate: 0,
        year: currentYear,
        cycleId: selectedCycleId || undefined,
        isAwardee: false,
        history: [
          {
            year: currentYear,
            status: 'No data',
            score: "N/A",
          }
        ],
      };
    }

    if (!barangay) {
      console.warn('❌ No barangay name found for path:', pathId);
      return;
    }

    // Only allow clicks on awardee barangays when viewing any cycle data (including active cycle)
    const viewingCycleData = selectedCycleId || (hasActiveCycle && activeCycle);
    if (viewingCycleData && !barangay.isAwardee) {
      console.log('🚫 Barangay is not an awardee for this cycle, ignoring click', {
        barangayName: barangay.name,
        isAwardee: barangay.isAwardee,
        selectedCycleId,
        hasActiveCycle,
        barangayData: barangay
      });
      return;
    }
    
    console.log('✅ Barangay click allowed:', {
      barangayName: barangay.name,
      isAwardee: barangay.isAwardee,
      viewingCycleData
    });

    // Fetch historical award data for this barangay
    if (barangay.id > 0) {
      try {
        console.log('🔍 Fetching history for barangay ID:', barangay.id);
        const historyResponse = await fetch(`/api/barangays/${barangay.id}/history`);
        console.log('📡 History API response status:', historyResponse.status);
        
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          console.log('📊 History API data:', historyData);
          
          if (historyData.success && historyData.data.length > 0) {
            barangay = {
              ...barangay,
              history: historyData.data
            };
            console.log('📜 Historical data loaded:', historyData.data);
          } else {
            console.log('⚠️ No historical data in response');
          }
        } else {
          console.error('❌ History API failed with status:', historyResponse.status);
          const errorText = await historyResponse.text();
          console.error('Error response:', errorText);
        }
      } catch (error) {
        console.error('❌ Error fetching history:', error);
        // Continue with existing history data if fetch fails
      }
    } else {
      console.log('⚠️ Barangay ID is 0, skipping history fetch');
    }

    // Lock the barangay selection
    setLockedBarangayName(barangayName);
    onBarangayLock?.(barangay);

    // Get the SVG element directly for accurate positioning
    const svgRect = mapRef.current?.getBoundingClientRect();
    
    if (svgRect) {
      // Calculate position relative to the SVG element
      const x = event.clientX - svgRect.left;
      const y = event.clientY - svgRect.top;
      
      console.log('📐 Position calculated:', { 
        x, 
        y, 
        clientX: event.clientX, 
        clientY: event.clientY,
        svgRect 
      });
      
      setCalloutPosition({ x, y });
    }
  };

  const handleCloseCallout = () => {
    setLockedBarangayName(null);
    setCalloutPosition(null);
    
    // Clear locked state in parent
    if (onBarangayHover) {
      onBarangayHover(null);
    }
  };

  const handleCloseLargeModal = () => {
    setShowLargeModal(false);
  };

  const handleMapClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleCloseCallout();
    }
  };

  const getPathFill = (pathId: string) => {
    const barangayName = barangayMapping[pathId as keyof typeof barangayMapping];
    const barangay = barangayName ? barangays[barangayName] : null;
    
    if (isLoading) {
      return "#e5e7eb"; // Default gray for loading
    }

    if (lockedBarangayName === barangayName) return "#f59e0b"; // Amber highlight for locked
    if (hoveredBarangay === barangayName) return "#fbbf24"; // Lighter amber for hover

    // If no barangay data exists
    if (!barangay) {
      return "#d1d5db"; // Light gray for no data areas
    }

    // Determine which cycle to use for award checking
    const cycleForAwards = selectedCycleId || (hasActiveCycle && activeCycle ? activeCycle.cycle_id : null);

    // Simple 2-color system: Awardee vs Non-Awardee (cycle-aware)
    if (isBarangayAwardee(barangay, cycleForAwards || undefined)) {
      return "#22c55e"; // Green for SGLGB awardees (updated to match design spec)
    } else {
      return "#6b7280"; // Gray for non-awardees
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }



  return (
    <div className="w-full h-full relative" onClick={handleMapClick}>

      
      <svg
        ref={mapRef}
        viewBox="0 0 1920 892"
        className="w-full h-full bg-gray-100"
        xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: "auto" }}
      >
        {/* Background - using a solid color instead of image for better performance */}
        <rect width="1920" height="892" fill="#f8fafc" />
        
        {/* Interactive barangay paths */}  
        {Object.entries(barangayMapping).map(([pathId, barangayName]) => {
          const pathData = getPathData(pathId);
          if (!pathData) {
            console.warn(`⚠️ No path data for ${pathId}`);
            return null;
          }
          
          return (
            <path
              key={pathId}
              id={pathId}
              fill={getPathFill(pathId)}
              stroke="#ffffff"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-200 hover:opacity-80 hover:stroke-yellow-400"
              onMouseEnter={() => handlePathHover(pathId)}
              onMouseLeave={handlePathLeave}
              onClick={(e) => {
                console.log('🖱️ Click event triggered for:', pathId);
                e.preventDefault();
                e.stopPropagation();
                handlePathClick(pathId, e);
              }}
              d={pathData}
              style={{
                filter: hoveredBarangay === barangayName ? 'brightness(1.1)' : 'none',
                pointerEvents: 'all' // Ensure the path can receive pointer events
              }}
            />
          );
        })}
        

      </svg>

      {/* Callout Modal - Only show if large modal is not open */}
      {calloutPosition && lockedBarangayName && !showLargeModal && (
        <SmallCalloutModal
          barangay={barangays[lockedBarangayName] || {
            id: 0,
            name: lockedBarangayName,
            population: 0,
            households: 0,
            area: 0,
            progress: 0,
            status: 'No data',
            currentStatus: 'No data',
            description: `No data available`,
            seal: 'no',
            seal_original: 'no',
            survey_count: 0,
            completion_rate: 0,
            year: selectedCycleId ? 'cycle' : new Date().getFullYear().toString(),
            cycleId: selectedCycleId || undefined,
            isAwardee: false,
            history: [{ year: selectedCycleId ? 'cycle' : new Date().getFullYear().toString(), status: 'No data', score: "N/A" }],
          }}
          position={calloutPosition}
          onClose={handleCloseCallout}
          onViewDetails={() => setShowLargeModal(true)}
        />
      )}

      {/* Large Modal */}
      {showLargeModal && lockedBarangayName && (
        <BarangaySatisfactionIndex
          key={`${lockedBarangayName}-${selectedCycleId || 'active'}`}
          barangay={barangays[lockedBarangayName] || {
            id: 0,
            name: lockedBarangayName,
            population: 0,
            households: 0,
            area: 0,
            progress: 0,
            status: 'No data',
            currentStatus: 'No data',
            description: `No data available`,
            seal: 'no',
            seal_original: 'no',
            survey_count: 0,
            completion_rate: 0,
            year: selectedCycleId ? 'cycle' : new Date().getFullYear().toString(),
            cycleId: selectedCycleId || undefined,
            isAwardee: false,
            history: [{ year: selectedCycleId ? 'cycle' : new Date().getFullYear().toString(), status: 'No data', score: "N/A" }],
          }}
          isOpen={showLargeModal}
          onClose={handleCloseLargeModal}
          selectedCycleId={selectedCycleId}
        />
      )}
    </div>
  );
}

// Helper function to get path data for each barangay
function getPathData(pathId: string): string {
  const pathData = barangayPaths[pathId];
  if (!pathData) {
    console.warn(`No path data found for barangay: ${pathId}`);
    return "";
  }
  return pathData;
}