"use client";

import { useState, useRef, useEffect } from "react";
import { isBarangayAwardee, type ApiBarangayData } from "@/utils/barangayUtils";
import SmallCalloutModal from "./SmallCalloutModal";
import BarangaySatisfactionIndex from "./BarangaySatisfactionIndex";
import barangayPaths from "@/data/barangayPaths";

interface InteractiveSVGMapProps {
  onBarangaySelect?: (barangay: ApiBarangayData) => void;
}

export default function InteractiveSVGMap({ onBarangaySelect }: InteractiveSVGMapProps) {
  const [hoveredBarangay, setHoveredBarangay] = useState<string | null>(null);
  const [selectedBarangay, setSelectedBarangay] = useState<string | null>(null);
  const [calloutPosition, setCalloutPosition] = useState<{ x: number; y: number } | null>(null);
  const [showLargeModal, setShowLargeModal] = useState(false);
  const [barangays, setBarangays] = useState<{ [key: string]: ApiBarangayData }>({});
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<SVGSVGElement>(null);

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
        const response = await fetch('/api/barangays');

        if (response.ok) {
          const data = await response.json();
          const barangaysByName: { [key: string]: ApiBarangayData } = {};
          
          data.forEach((barangay: any) => {
            const name = barangay.barangay_name || barangay.name; 
           barangaysByName[name] = {
              id: barangay.barangay_id || barangay.id,
              name: name,
              population: barangay.population || 0,
              households: barangay.households || 0,
              area: barangay.area || 0,
              progress: barangay.progress || 0,
              status: barangay.status || 'Pending',
              currentStatus: barangay.currentStatus,
              description: barangay.description,
              seal: barangay.seal,
              history: [
                {
                  year: "2024",
                  status: barangay.seal === 'yes' ? 'Completed' : 'Pending',
                  score: barangay.seal === 'yes' ? "100%" : "N/A",
                },
                { year: "2023", status: "Completed", score: "75%" },
                { year: "2022", status: "Completed", score: "70%" },
                { year: "2021", status: "Completed", score: "65%" },
              ],
            };
          });

          setBarangays(barangaysByName);
          console.log('✅ Barangay data loaded:', Object.keys(barangaysByName).length, 'barangays');
        }
      } catch (error) {
        console.error('❌ Error fetching barangay data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBarangayData();
  }, []);

  const handlePathHover = (pathId: string) => {
    const barangayName = barangayMapping[pathId as keyof typeof barangayMapping];
    if (barangayName) {
      setHoveredBarangay(barangayName);
    }
  };

  const handlePathLeave = () => {
    setHoveredBarangay(null);
  };

  const handlePathClick = (pathId: string, event: React.MouseEvent) => {
    console.log('🖱️ Path clicked:', pathId); // Debug log
    
    const barangayName = barangayMapping[pathId as keyof typeof barangayMapping];
    let barangay = barangayName ? barangays[barangayName] : null;
    
    console.log('📍 Barangay found:', barangayName, barangay); // Debug log
    
    // If no barangay data exists, create a placeholder with "No data"
    if (!barangay && barangayName) {
      barangay = {
        id: 0, // Use 0 to indicate no data
        name: barangayName,
        population: 0,
        households: 0,
        area: 0,
        progress: 0,
        status: 'No data',
        currentStatus: 'No data',
        description: 'No data available for this barangay',
        seal: 'no',
        history: [
          {
            year: "2024",
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

    setSelectedBarangay(barangayName);
    onBarangaySelect?.(barangay);

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

  const handleViewDetails = () => {
    setShowLargeModal(true);
  };

  const handleCloseCallout = () => {
    setSelectedBarangay(null);
    setCalloutPosition(null);
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

    if (selectedBarangay === barangayName) return "#f59e0b"; // Amber highlight for selected
    if (hoveredBarangay === barangayName) return "#fbbf24"; // Lighter amber for hover

    // If no barangay data exists, show as clickable but different color
    if (!barangay) {
      return "#d1d5db"; // Light gray for no data areas
    }

    // Check if barangay has seal (is awardee)
    if (isBarangayAwardee(barangay)) {
      return "#10b981"; // Emerald green for awardee
    }

    return "#6b7280"; // Gray for non-awardee
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
        style={{ imageRendering: "optimizeQuality" as const }}
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
      {calloutPosition && selectedBarangay && !showLargeModal && (
        <SmallCalloutModal
          barangay={barangays[selectedBarangay] || {
            id: 0,
            name: selectedBarangay,
            population: 0,
            households: 0,
            area: 0,
            progress: 0,
            status: 'No data',
            currentStatus: 'No data',
            description: 'No data available for this barangay',
            seal: 'no',
            history: [{ year: "2024", status: 'No data', score: "N/A" }],
          }}
          position={calloutPosition}
          onClose={handleCloseCallout}
          onViewDetails={handleViewDetails}
        />
      )}

      {/* Large Modal */}
      {showLargeModal && selectedBarangay && (
        <BarangaySatisfactionIndex
          barangay={barangays[selectedBarangay] || {
            id: 0,
            name: selectedBarangay,
            population: 0,
            households: 0,
            area: 0,
            progress: 0,
            status: 'No data',
            currentStatus: 'No data',
            description: 'No data available for this barangay',
            seal: 'no',
            history: [{ year: "2024", status: 'No data', score: "N/A" }],
          }}
          isOpen={showLargeModal}
          onClose={handleCloseLargeModal}
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