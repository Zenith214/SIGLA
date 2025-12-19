"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface SpotData {
  spotId: number;
  spotName: string;
  barangayName: string;
  status: "Pending" | "In_Progress" | "Completed" | "Flagged";
  startingPoint: { lat: number; lng: number };
  assignedFI: string | null;
  assignedFIId: number | null;
  completedCount: number;
  totalCount: number;
  inProgressCount: number;
  flaggedCount: number;
  questionnaires: Array<{
    questionnaireId: string;
    status: string;
    visitCount: number;
  }>;
}

interface ProgressMapProps {
  spots: SpotData[];
  loading?: boolean;
}

// Get marker color based on spot status
function getMarkerColor(status: string): string {
  switch (status) {
    case "Pending":
      return "#9ca3af"; // Gray
    case "In_Progress":
      return "#3b82f6"; // Blue
    case "Completed":
      return "#10b981"; // Green
    case "Flagged":
      return "#ef4444"; // Red
    default:
      return "#9ca3af";
  }
}

// Create custom marker icon
function createCustomIcon(color: string, L: any) {
  if (typeof window === "undefined" || !L) return null;
  
  const svgIcon = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.375 12.5 28.125 12.5 28.125S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0z" 
            fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="12.5" cy="12.5" r="5" fill="#fff"/>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: "custom-marker-icon",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
}

export default function ProgressMap({ spots, loading = false }: ProgressMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    // Import Leaflet library and CSS
    import("leaflet/dist/leaflet.css");
    import("leaflet").then((leaflet) => {
      setL(leaflet);
    });
  }, []);

  if (!isClient || !L) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  if (spots.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center p-6">
          <p className="text-gray-600 mb-2">No spots found</p>
          <p className="text-sm text-gray-500">
            Create spots in the Spot Allocation tab to see them here
          </p>
        </div>
      </div>
    );
  }

  // Calculate center point from all spots
  const centerLat = spots.reduce((sum, spot) => sum + spot.startingPoint.lat, 0) / spots.length;
  const centerLng = spots.reduce((sum, spot) => sum + spot.startingPoint.lng, 0) / spots.length;
  const center: [number, number] = [centerLat, centerLng];
  const defaultZoom = 12;

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-gray-300 relative">
      <MapContainer
        center={center}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {spots.map((spot) => {
          const icon = createCustomIcon(getMarkerColor(spot.status), L);
          
          return (
            <Marker
              key={spot.spotId}
              position={[spot.startingPoint.lat, spot.startingPoint.lng]}
              icon={icon}
            >
              <Popup>
                <div className="p-2 min-w-[250px]">
                  <h3 className="font-semibold text-lg mb-2">{spot.spotName}</h3>
                  
                  <div className="space-y-1 mb-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Barangay:</span> {spot.barangayName}
                    </p>
                    
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          spot.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : spot.status === "In_Progress"
                            ? "bg-blue-100 text-blue-800"
                            : spot.status === "Flagged"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {spot.status.replace("_", " ")}
                      </span>
                    </p>
                    
                    {spot.assignedFI && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Assigned to:</span> {spot.assignedFI}
                      </p>
                    )}
                    
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Progress:</span> {spot.completedCount}/{spot.totalCount} completed
                    </p>
                    
                    {spot.inProgressCount > 0 && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">In Progress:</span> {spot.inProgressCount}
                      </p>
                    )}
                    
                    {spot.flaggedCount > 0 && (
                      <p className="text-sm text-red-600">
                        <span className="font-medium">Flagged:</span> {spot.flaggedCount}
                      </p>
                    )}
                  </div>

                  {/* Questionnaire details */}
                  <div className="border-t pt-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">Questionnaires:</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {spot.questionnaires.map((q) => (
                        <div key={q.questionnaireId} className="text-xs flex items-center justify-between">
                          <span className="text-gray-600">{q.questionnaireId}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs ${
                              q.status === "Completed"
                                ? "bg-green-100 text-green-700"
                                : q.status === "In_Progress"
                                ? "bg-blue-100 text-blue-700"
                                : q.status === "Flagged_For_Substitution"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {q.status === "Flagged_For_Substitution" ? "Flagged" : q.status.replace("_", " ")}
                            {q.visitCount > 1 && ` (${q.visitCount} visits)`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-[1000]">
        <h4 className="text-xs font-semibold mb-2 text-gray-700">Spot Status</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-xs text-gray-600">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">Flagged</span>
          </div>
        </div>
      </div>
    </div>
  );
}
