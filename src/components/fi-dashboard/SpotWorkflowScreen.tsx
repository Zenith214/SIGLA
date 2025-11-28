"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { InterviewSlotCard } from "./InterviewSlotCard";

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse" />
  }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface Visit {
  visitId: number;
  visitNumber: number;
  timestamp: string;
  outcome: string;
  notes: string | null;
  location?: { lat: number; lng: number } | null;
}

interface Interview {
  questionnaireId: string;
  sequenceNumber: number;
  status: string;
  visitCount: number;
  visits?: Visit[];
}

interface SpotDetails {
  spotId: number;
  spotName: string;
  barangayId: number;
  barangayName: string;
  cycleId: number;
  startingPoint: { lat: number; lng: number };
  randomStart: number;
  status: string;
  completedCount: number;
  totalCount: number;
  inProgressCount: number;
  flaggedCount: number;
  createdAt: string;
  updatedAt: string;
  interviews: Interview[];
}

interface SpotWorkflowScreenProps {
  spotId: number;
}

export function SpotWorkflowScreen({ spotId }: SpotWorkflowScreenProps) {
  const router = useRouter();
  const [spot, setSpot] = useState<SpotDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSpotDetails();
    
    // Import Leaflet CSS and configure icons dynamically
    if (typeof window !== "undefined") {
      require("leaflet/dist/leaflet.css");
      
      // Fix marker icons
      import('leaflet').then((L) => {
        delete (L.default.Icon.Default.prototype as any)._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconUrl: '/marker-icon.png',
          shadowUrl: '/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        });
      });
    }
  }, [spotId]);

  const fetchSpotDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from FI assignments endpoint and find the specific spot
      const response = await fetch('/api/fi/assignments');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData.error || `Failed to fetch spot details (${response.status})`);
      }

      const data = await response.json();
      console.log('Assignments data:', data);
      
      const foundSpot = data.assignments?.find((s: SpotDetails) => s.spotId === spotId);

      if (!foundSpot) {
        console.error('Spot not found. Looking for spotId:', spotId, 'Available spots:', data.assignments?.map((s: SpotDetails) => s.spotId));
        throw new Error('Spot not found or not assigned to you');
      }

      // Fetch visit history for each interview
      const interviewsWithVisits = await Promise.all(
        foundSpot.interviews.map(async (interview: Interview) => {
          try {
            const visitResponse = await fetch(`/api/questionnaires/${interview.questionnaireId}`);
            if (visitResponse.ok) {
              const visitData = await visitResponse.json();
              return {
                ...interview,
                visits: visitData.visits || [],
              };
            }
          } catch (error) {
            console.error(`Error fetching visits for ${interview.questionnaireId}:`, error);
          }
          return interview;
        })
      );

      setSpot({
        ...foundSpot,
        interviews: interviewsWithVisits,
      });
    } catch (err) {
      console.error('Error fetching spot details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load spot details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading spot details...</p>
        </div>
      </div>
    );
  }

  if (error || !spot) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-medium">Error loading spot</p>
            <p className="text-red-600 text-sm mt-1">{error || 'Spot not found'}</p>
            <button
              onClick={fetchSpotDetails}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = spot.totalCount > 0 
    ? Math.round((spot.completedCount / spot.totalCount) * 100)
    : 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#dbeafe' }}>
      {/* Header */}
      <div className="bg-slate-800 sticky top-0 z-10 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={handleBack}
            className="mb-3 flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assignments
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {spot.spotName}
              </h1>
              <p className="text-slate-300 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {spot.barangayName}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-400">
                {spot.completedCount}/{spot.totalCount}
              </div>
              <div className="text-sm text-slate-300">Completed</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  progressPercentage === 100 ? 'bg-green-500' :
                  progressPercentage >= 60 ? 'bg-blue-500' :
                  progressPercentage >= 20 ? 'bg-blue-400' :
                  progressPercentage > 0 ? 'bg-orange-500' : 'bg-slate-600'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Spot Location
            </h2>
            <div className="h-64 rounded-lg overflow-hidden border border-gray-300 relative z-0">
              {typeof window !== 'undefined' && spot.startingPoint && (
                <MapContainer
                  key={`map-${spotId}`}
                  center={[spot.startingPoint.lat, spot.startingPoint.lng]}
                  zoom={16}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                  whenReady={() => {
                    console.log('Map is ready');
                  }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[spot.startingPoint.lat, spot.startingPoint.lng]}>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{spot.spotName}</p>
                        <p className="text-gray-600">{spot.barangayName}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Random Start: {spot.randomStart}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              )}
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <p><span className="font-medium">Random Start Number:</span> {spot.randomStart}</p>
              <p className="text-xs mt-1 text-gray-500">
                Use this number to determine the starting household for your interviews
              </p>
            </div>
          </div>

          {/* Interview Slots Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Interview Slots
            </h2>
            <div className="space-y-3">
              {spot.interviews.map((interview) => (
                <InterviewSlotCard
                  key={interview.questionnaireId}
                  interview={interview}
                  spotId={spot.spotId}
                  cycleId={spot.cycleId}
                  barangayId={spot.barangayId}
                  onUpdate={fetchSpotDetails}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
