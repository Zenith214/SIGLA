"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import {
  verifyGPSLocation,
  formatDistance,
  getVerificationStatusText,
  type GPSCoordinates,
  type GPSVerificationResult,
} from "@/app/survey/forms/utils/gpsVerification";
import "leaflet/dist/leaflet.css";

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
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// Custom marker icons - created only on client side
const createCustomIcon = (color: "blue" | "green", L: any) => {
  if (typeof window === "undefined" || !L) return null;
  
  const iconHtml = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2C10.477 2 6 6.477 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.523-4.477-10-10-10z" 
            fill="${color === "blue" ? "#3b82f6" : "#22c55e"}" 
            stroke="white" 
            stroke-width="2"/>
      <circle cx="16" cy="12" r="4" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    html: iconHtml,
    className: "custom-marker-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

interface InterviewMapViewProps {
  surveyResponse: {
    id: number;
    questionnaireId: string;
    assignedSpot?: GPSCoordinates;
    verificationLocation?: GPSCoordinates;
  };
  verificationThreshold?: number;
}

// Component to fit map bounds to show both markers
function MapBoundsController({ 
  assignedSpot, 
  verificationLocation,
  L
}: { 
  assignedSpot: GPSCoordinates; 
  verificationLocation: GPSCoordinates;
  L: any;
}) {
  const { useMap } = require("react-leaflet");
  const map = useMap();

  useEffect(() => {
    if (L && map) {
      const bounds = L.latLngBounds(
        [assignedSpot.lat, assignedSpot.lng],
        [verificationLocation.lat, verificationLocation.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, assignedSpot, verificationLocation, L]);

  return null;
}

export default function InterviewMapView({
  surveyResponse,
  verificationThreshold = 200,
}: InterviewMapViewProps) {
  const [verification, setVerification] = useState<GPSVerificationResult | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<any>(null);
  const [blueIcon, setBlueIcon] = useState<any>(null);
  const [greenIcon, setGreenIcon] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    // Import Leaflet library
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
      
      if (typeof window !== "undefined") {
        // Fix for default marker icons in Leaflet
        delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl;
        leaflet.default.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });
        
        // Create custom icons
        setBlueIcon(createCustomIcon("blue", leaflet.default));
        setGreenIcon(createCustomIcon("green", leaflet.default));
      }
    });
  }, []);

  useEffect(() => {
    if (!surveyResponse.assignedSpot || !surveyResponse.verificationLocation) {
      return;
    }

    // Calculate verification
    const result = verifyGPSLocation(
      surveyResponse.assignedSpot,
      surveyResponse.verificationLocation,
      { thresholdMeters: verificationThreshold }
    );
    setVerification(result);
  }, [surveyResponse, verificationThreshold]);

  // Show loading state while client-side resources load
  if (!isClient || !L || !blueIcon || !greenIcon) {
    return (
      <div className="w-full h-96 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  // Handle missing GPS data
  if (!surveyResponse.assignedSpot || !surveyResponse.verificationLocation) {
    return (
      <div className="w-full h-96 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="text-sm font-medium text-gray-900 mb-1">GPS Data Not Available</p>
          <p className="text-xs text-gray-500">
            {!surveyResponse.assignedSpot && "No assigned spot location"}
            {!surveyResponse.verificationLocation && !surveyResponse.assignedSpot && " and "}
            {!surveyResponse.verificationLocation && "No verification location captured"}
          </p>
        </div>
      </div>
    );
  }

  const center: [number, number] = [
    (surveyResponse.assignedSpot.lat + surveyResponse.verificationLocation.lat) / 2,
    (surveyResponse.assignedSpot.lng + surveyResponse.verificationLocation.lng) / 2,
  ];

  const lineColor = verification?.withinThreshold ? "#22c55e" : "#ef4444";

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="w-full h-96 rounded-lg border border-gray-200 overflow-hidden">
        <MapContainer
          center={center}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          whenReady={() => setMapReady(true)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Blue pin: Assigned spot */}
          <Marker
            position={[surveyResponse.assignedSpot.lat, surveyResponse.assignedSpot.lng]}
            icon={blueIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold text-blue-600 mb-1">Assigned Spot</p>
                <p className="text-xs text-gray-600">
                  {surveyResponse.assignedSpot.lat.toFixed(6)}, {surveyResponse.assignedSpot.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Green pin: Actual location */}
          <Marker
            position={[surveyResponse.verificationLocation.lat, surveyResponse.verificationLocation.lng]}
            icon={greenIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold text-green-600 mb-1">Interview Location</p>
                <p className="text-xs text-gray-600">
                  {surveyResponse.verificationLocation.lat.toFixed(6)}, {surveyResponse.verificationLocation.lng.toFixed(6)}
                </p>
                {surveyResponse.verificationLocation.accuracy && (
                  <p className="text-xs text-gray-500 mt-1">
                    Accuracy: ±{Math.round(surveyResponse.verificationLocation.accuracy)}m
                  </p>
                )}
              </div>
            </Popup>
          </Marker>

          {/* Line between pins */}
          <Polyline
            positions={[
              [surveyResponse.assignedSpot.lat, surveyResponse.assignedSpot.lng],
              [surveyResponse.verificationLocation.lat, surveyResponse.verificationLocation.lng],
            ]}
            pathOptions={{
              color: lineColor,
              weight: 2,
              dashArray: "5, 10",
              opacity: 0.7,
            }}
          />

          {/* Fit bounds to show both markers */}
          <MapBoundsController
            assignedSpot={surveyResponse.assignedSpot}
            verificationLocation={surveyResponse.verificationLocation}
            L={L}
          />
        </MapContainer>
      </div>

      {/* Verification Status Card */}
      {verification && (
        <div
          className={`p-4 rounded-lg border ${
            verification.withinThreshold
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-gray-900">GPS Verification</h4>
                {verification.flagForReview && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                    Flagged for Review
                  </span>
                )}
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Distance:</span>
                  <span className="font-medium text-gray-900">
                    {formatDistance(verification.distanceMeters)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Threshold:</span>
                  <span className="font-medium text-gray-900">
                    {formatDistance(verificationThreshold)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`font-medium ${
                      verification.withinThreshold ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {getVerificationStatusText(verification)}
                  </span>
                </div>

                {surveyResponse.verificationLocation.timestamp && (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200 mt-2">
                    <span className="text-gray-600">Captured:</span>
                    <span className="text-gray-900">
                      {new Date(surveyResponse.verificationLocation.timestamp).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Visual indicator */}
            <div className="ml-4">
              {verification.withinThreshold ? (
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-gray-600 px-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"></div>
          <span>Assigned Spot</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
          <span>Interview Location</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 border-t-2 border-dashed" style={{ borderColor: lineColor }}></div>
          <span>Distance</span>
        </div>
      </div>
    </div>
  );
}
