"use client";

import { useEffect, useState, useCallback } from "react";
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

interface Spot {
  spotId: number;
  spotName: string;
  startingPoint: { lat: number; lng: number };
  status: "Pending" | "In_Progress" | "Completed";
  barangayName?: string;
  assignedFiName?: string;
  completedCount?: number;
  totalCount?: number;
}

interface SpotAllocationMapProps {
  cycleId: number | null;
  spots: Spot[];
  onMapClick: (lat: number, lng: number) => void;
  onSpotClick: (spot: Spot) => void;
}

// Wrapper component for MapClickHandler
function MapClickHandlerWrapper({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  const MapClickHandlerComponent = dynamic(
    () => import("./MapClickHandler"),
    { ssr: false }
  );
  
  return <MapClickHandlerComponent onClick={onClick} />;
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

export default function SpotAllocationMap({
  cycleId,
  spots,
  onMapClick,
  onSpotClick,
}: SpotAllocationMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    // Import Leaflet library
    import("leaflet").then((leaflet) => {
      setL(leaflet);
      // Import CSS dynamically
      if (typeof window !== "undefined") {
        require("leaflet/dist/leaflet.css");
      }
    });
  }, []);

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (cycleId) {
        onMapClick(lat, lng);
      }
    },
    [cycleId, onMapClick]
  );

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

  if (!cycleId) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center p-6">
          <p className="text-gray-600 mb-2">No active survey cycle</p>
          <p className="text-sm text-gray-500">
            Please set an active cycle to create spots
          </p>
        </div>
      </div>
    );
  }

  // Default center (Sulop, Davao del Sur)
  const defaultCenter: [number, number] = [6.596189, 125.344906];
  const defaultZoom = 13;

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-gray-300">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandlerWrapper onClick={handleMapClick} />

        {spots.map((spot) => {
          const icon = createCustomIcon(getMarkerColor(spot.status), L);
          
          // Parse startingPoint if it's a string, with validation
          let startingPoint;
          try {
            startingPoint = typeof spot.startingPoint === 'string' 
              ? JSON.parse(spot.startingPoint) 
              : spot.startingPoint;
          } catch (e) {
            console.error('Failed to parse startingPoint for spot:', spot.spotId, spot.startingPoint);
            return null; // Skip this marker if parsing fails
          }
          
          // Validate that we have valid coordinates
          if (!startingPoint || typeof startingPoint.lat !== 'number' || typeof startingPoint.lng !== 'number') {
            console.error('Invalid startingPoint for spot:', spot.spotId, startingPoint);
            return null; // Skip this marker if coordinates are invalid
          }
          
          return (
            <Marker
              key={spot.spotId}
              position={[startingPoint.lat, startingPoint.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSpotClick(spot),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-lg mb-2">{spot.spotName}</h3>
                  {spot.barangayName && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Barangay:</span> {spot.barangayName}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Status:</span>{" "}
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        spot.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : spot.status === "In_Progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {spot.status.replace("_", " ")}
                    </span>
                  </p>
                  {spot.assignedFiName && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Assigned to:</span> {spot.assignedFiName}
                    </p>
                  )}
                  {spot.completedCount !== undefined && spot.totalCount !== undefined && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Progress:</span> {spot.completedCount}/{spot.totalCount}
                    </p>
                  )}
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
        </div>
      </div>
    </div>
  );
}
