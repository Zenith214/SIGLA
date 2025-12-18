"use client";

import { useState, useEffect, useCallback } from "react";
import { useActiveCycle } from "@/hooks/useSurveyCycle";
import SpotAllocationMap from "./SpotAllocationMap";
import SpotCreationModal from "./SpotCreationModal";
import SpotAssignmentPanel from "./SpotAssignmentPanel";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Spot {
  spotId: number;
  spotName: string;
  startingPoint: { lat: number; lng: number };
  status: "Pending" | "In_Progress" | "Completed";
  barangayName?: string;
  assignedFiName?: string;
  assignedFiId?: number;
  completedCount?: number;
  totalCount?: number;
}

export default function SpotAllocation() {
  const { toast } = useToast();
  const { activeCycle } = useActiveCycle();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  // Fetch spots when cycle changes
  useEffect(() => {
    if (activeCycle?.cycle_id) {
      fetchSpots();
    }
  }, [activeCycle?.cycle_id]);

  const fetchSpots = async () => {
    if (!activeCycle?.cycle_id) return;

    setLoading(true);
    try {
      // First, check if user is a supervisor and get their assigned barangays
      const supervisorResponse = await fetch(`/api/supervisor-assignments/my-barangays?cycle_id=${activeCycle.cycle_id}`);
      
      let allSpots: Spot[] = [];
      
      if (supervisorResponse.ok) {
        // Supervisor - fetch spots only for assigned barangays
        const supervisorData = await supervisorResponse.json();
        const assignedBarangays = supervisorData.data || [];
        
        if (assignedBarangays.length === 0) {
          toast({
            title: "No Assigned Barangays",
            description: "You have not been assigned any barangays for this cycle.",
            variant: "destructive",
          });
          setSpots([]);
          return;
        }
        
        // Fetch spots for each assigned barangay
        const spotPromises = assignedBarangays.map((assignment: any) =>
          fetch(`/api/spots?cycleId=${activeCycle.cycle_id}&barangayId=${assignment.barangay_id}`)
            .then(res => res.json())
            .then(data => data.spots || [])
        );
        
        const spotsArrays = await Promise.all(spotPromises);
        allSpots = spotsArrays.flat();
      } else if (supervisorResponse.status === 403) {
        // Not a supervisor - fetch all spots (for admins/other roles)
        const response = await fetch(`/api/spots?cycleId=${activeCycle.cycle_id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch spots");
        }
        const data = await response.json();
        allSpots = data.spots || [];
      } else {
        throw new Error("Failed to fetch spots");
      }
      
      setSpots(allSpots);
    } catch (error) {
      console.error("Error fetching spots:", error);
      toast({
        title: "Error",
        description: "Failed to load spots",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setShowCreationModal(true);
  }, []);

  const handleSpotClick = useCallback((spot: Spot) => {
    setSelectedSpot(spot);
  }, []);

  const handleCreationSuccess = () => {
    fetchSpots();
    setSelectedLocation(null);
  };

  const handleAssignmentSuccess = () => {
    fetchSpots();
  };

  const handleRefresh = () => {
    fetchSpots();
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Spot Allocation</h2>
            <p className="text-sm text-gray-600 mt-1">
              Click on the map to create spots, then assign them to field interviewers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setShowCreationModal(true)}
              disabled={!activeCycle?.cycle_id}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Spot
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Map and Assignment Panel */}
      <div className="flex-1 flex gap-4 p-4 min-h-0">
        {/* Map - Takes 2/3 of the space */}
        <div className="flex-[2] min-w-0">
          <SpotAllocationMap
            cycleId={activeCycle?.cycle_id || null}
            spots={spots}
            onMapClick={handleMapClick}
            onSpotClick={handleSpotClick}
          />
        </div>

        {/* Assignment Panel - Takes 1/3 of the space */}
        <div className="flex-[1] min-w-[300px] max-w-[400px]">
          <SpotAssignmentPanel
            cycleId={activeCycle?.cycle_id || null}
            spots={spots}
            onAssignmentSuccess={handleAssignmentSuccess}
          />
        </div>
      </div>

      {/* Spot Creation Modal */}
      <SpotCreationModal
        open={showCreationModal}
        onClose={() => {
          setShowCreationModal(false);
          setSelectedLocation(null);
        }}
        onSuccess={handleCreationSuccess}
        cycleId={activeCycle?.cycle_id || null}
        startingPoint={selectedLocation}
      />
    </div>
  );
}
