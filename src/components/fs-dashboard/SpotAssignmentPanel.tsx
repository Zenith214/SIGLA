"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, User, CheckCircle2, AlertCircle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QuestionnaireAssignmentModal from "./QuestionnaireAssignmentModal";

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

interface FieldInterviewer {
  id: number;
  name: string;
  email: string;
}

interface Barangay {
  id: number;
  name: string;
}

interface SpotAssignmentPanelProps {
  cycleId: number | null;
  spots: Spot[];
  onAssignmentSuccess: () => void;
}

export default function SpotAssignmentPanel({
  cycleId,
  spots,
  onAssignmentSuccess,
}: SpotAssignmentPanelProps) {
  const { toast } = useToast();
  const [selectedBarangay, setSelectedBarangay] = useState<string>("");
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [fieldInterviewers, setFieldInterviewers] = useState<FieldInterviewer[]>([]);
  const [loadingBarangays, setLoadingBarangays] = useState(false);
  const [loadingFIs, setLoadingFIs] = useState(false);
  const [assigningSpots, setAssigningSpots] = useState<Set<number>>(new Set());
  const [managingSpot, setManagingSpot] = useState<{ spotId: number; spotName: string } | null>(null);

  // Fetch barangays when cycleId changes
  useEffect(() => {
    if (cycleId) {
      fetchBarangays();
    }
    fetchFieldInterviewers();
  }, [cycleId]);

  const fetchBarangays = async () => {
    if (!cycleId) return;
    
    setLoadingBarangays(true);
    try {
      // Fetch survey targets for the current cycle
      const response = await fetch(`/api/survey-targets?cycleId=${cycleId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch survey targets");
      }
      const data = await response.json();
      
      // Extract barangays from survey targets
      const targets = data.targets || data;
      
      setBarangays(
        targets.map((target: any) => ({
          id: target.barangayId || target.barangay_id,
          name: target.barangayName || target.barangay_name,
        }))
      );
    } catch (error) {
      console.error("Error fetching survey targets:", error);
      toast({
        title: "Error",
        description: "Failed to load survey targets for this cycle",
        variant: "destructive",
      });
    } finally {
      setLoadingBarangays(false);
    }
  };

  const fetchFieldInterviewers = async () => {
    setLoadingFIs(true);
    try {
      const response = await fetch("/api/users?role=interviewer");
      if (!response.ok) {
        throw new Error("Failed to fetch field interviewers");
      }
      const data = await response.json();
      
      // Handle both response formats: { users: [...] } or direct array
      const usersList = data.users || data;
      
      setFieldInterviewers(
        usersList.map((user: any) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        }))
      );
    } catch (error) {
      console.error("Error fetching field interviewers:", error);
      toast({
        title: "Error",
        description: "Failed to load field interviewers",
        variant: "destructive",
      });
    } finally {
      setLoadingFIs(false);
    }
  };

  const handleAssignSpot = async (spotId: number, fiId: string) => {
    if (!fiId) return;

    setAssigningSpots((prev) => new Set(prev).add(spotId));

    try {
      const response = await fetch(`/api/spots/${spotId}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fiId: parseInt(fiId, 10),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign spot");
      }

      toast({
        title: "Success",
        description: `Spot assigned to ${data.assignedTo || "field interviewer"}`,
      });

      onAssignmentSuccess();
    } catch (error) {
      console.error("Error assigning spot:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign spot",
        variant: "destructive",
      });
    } finally {
      setAssigningSpots((prev) => {
        const newSet = new Set(prev);
        newSet.delete(spotId);
        return newSet;
      });
    }
  };

  // Filter spots by selected barangay
  const filteredSpots = selectedBarangay
    ? spots.filter((spot) => spot.barangayName === selectedBarangay)
    : [];

  if (!cycleId) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center p-6">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No active survey cycle</p>
          <p className="text-sm text-gray-500">
            Please set an active cycle to manage spot assignments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Spot Assignment</h3>
        
        {/* Barangay Filter */}
        <div className="space-y-2">
          <Label htmlFor="barangay-filter">Filter by Barangay</Label>
          <Select
            value={selectedBarangay}
            onValueChange={setSelectedBarangay}
            disabled={loadingBarangays}
          >
            <SelectTrigger id="barangay-filter">
              <SelectValue placeholder="Select a barangay" />
            </SelectTrigger>
            <SelectContent>
              {loadingBarangays ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                barangays.map((barangay) => (
                  <SelectItem key={barangay.id} value={barangay.name}>
                    {barangay.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Spots List */}
      <div className="flex-1 overflow-y-auto p-4">
        {!selectedBarangay ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Select a barangay to view spots
          </div>
        ) : filteredSpots.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No spots found for this barangay
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSpots.map((spot) => (
              <div
                key={spot.spotId}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                {/* Spot Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{spot.spotName}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <MapPin className="h-3 w-3" />
                      <span className="font-mono text-xs">
                        {spot.startingPoint.lat.toFixed(4)}, {spot.startingPoint.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      spot.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : spot.status === "In_Progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {spot.status.replace("_", " ")}
                  </span>
                </div>

                {/* Progress */}
                {spot.completedCount !== undefined && spot.totalCount !== undefined && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">
                        {spot.completedCount}/{spot.totalCount} interviews
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(spot.completedCount / spot.totalCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Assignment Section */}
                <div className="space-y-2">
                  {/* Manage Individual Assignments Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setManagingSpot({ spotId: spot.spotId, spotName: spot.spotName })}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Questionnaire Assignments
                  </Button>

                  {spot.assignedFiName ? (
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-900">
                          Assigned to {spot.assignedFiName}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <Select
                        onValueChange={(value) => handleAssignSpot(spot.spotId, value)}
                        disabled={assigningSpots.has(spot.spotId) || loadingFIs}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Assign to Field Interviewer" />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingFIs ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : (
                            fieldInterviewers.map((fi) => (
                              <SelectItem key={fi.id} value={fi.id.toString()}>
                                {fi.name} ({fi.email})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {assigningSpots.has(spot.spotId) && (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Questionnaire Assignment Modal */}
      {managingSpot && (
        <QuestionnaireAssignmentModal
          open={!!managingSpot}
          onClose={() => setManagingSpot(null)}
          onSuccess={() => {
            onAssignmentSuccess();
          }}
          spotId={managingSpot.spotId}
          spotName={managingSpot.spotName}
        />
      )}
    </div>
  );
}
