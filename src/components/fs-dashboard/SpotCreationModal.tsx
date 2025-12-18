"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, MapPin, CheckCircle2, Dices } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Barangay {
  id: number;
  name: string;
}

interface SpotCreationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cycleId: number | null;
  startingPoint: { lat: number; lng: number } | null;
}

interface GeneratedQuestionnaire {
  questionnaireId: string;
}

export default function SpotCreationModal({
  open,
  onClose,
  onSuccess,
  cycleId,
  startingPoint,
}: SpotCreationModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [loadingBarangays, setLoadingBarangays] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedQuestionnaires, setGeneratedQuestionnaires] = useState<string[]>([]);

  // Form state
  const [spotName, setSpotName] = useState("");
  const [barangayId, setBarangayId] = useState("");
  const [randomStart, setRandomStart] = useState("");
  // Fixed at 5 questionnaires per spot as per survey methodology
  const numberOfQuestionnaires = 5;

  // Validation errors
  const [errors, setErrors] = useState<{
    spotName?: string;
    barangayId?: string;
    randomStart?: string;
  }>({});

  // Fetch barangays when modal opens
  useEffect(() => {
    if (open && cycleId) {
      fetchBarangays();
    }
  }, [open, cycleId]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setSpotName("");
        setBarangayId("");
        setRandomStart("");
        setErrors({});
        setShowSuccess(false);
        setGeneratedQuestionnaires([]);
      }, 300);
    }
  }, [open]);

  const fetchBarangays = async () => {
    if (!cycleId) return;
    
    setLoadingBarangays(true);
    try {
      // First, try to fetch supervisor's assigned barangays
      const supervisorResponse = await fetch(`/api/supervisor-assignments/my-barangays?cycle_id=${cycleId}`);
      
      if (supervisorResponse.ok) {
        // Supervisor has assignments - show only their assigned barangays
        const supervisorData = await supervisorResponse.json();
        const assignedBarangays = supervisorData.data || [];
        
        if (assignedBarangays.length === 0) {
          toast({
            title: "No Assigned Barangays",
            description: "You have not been assigned any barangays for this cycle. Please contact your administrator.",
            variant: "destructive",
          });
          setBarangays([]);
          return;
        }
        
        setBarangays(
          assignedBarangays.map((assignment: any) => ({
            id: assignment.barangay_id,
            name: assignment.barangay_name,
          }))
        );
      } else if (supervisorResponse.status === 403) {
        // Not a supervisor - fetch all survey targets (for admins/other roles)
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
      } else {
        throw new Error("Failed to fetch barangays");
      }
    } catch (error) {
      console.error("Error fetching barangays:", error);
      toast({
        title: "Error",
        description: "Failed to load barangays for this cycle. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingBarangays(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!spotName.trim()) {
      newErrors.spotName = "Spot name is required";
    }

    if (!barangayId) {
      newErrors.barangayId = "Please select a barangay";
    }

    if (!randomStart) {
      newErrors.randomStart = "Random start number is required";
    } else {
      const num = parseInt(randomStart, 10);
      if (isNaN(num) || num < 1 || num > 5) {
        newErrors.randomStart = "Must be a number between 1 and 5";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !cycleId || !startingPoint) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/spots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cycleId,
          barangayId: parseInt(barangayId, 10),
          spotName: spotName.trim(),
          startingPoint,
          randomStart: parseInt(randomStart, 10),
          numberOfQuestionnaires: numberOfQuestionnaires, // Always 5 per survey methodology
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create spot");
      }

      // Show success state with generated questionnaire IDs
      setGeneratedQuestionnaires(data.questionnaires || []);
      setShowSuccess(true);

      toast({
        title: "Success",
        description: `Spot "${spotName}" created successfully with ${numberOfQuestionnaires} questionnaires.`,
      });

      // Wait a moment before closing to show the success state
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error creating spot:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create spot",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {showSuccess ? (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <DialogTitle className="text-center">Spot Created Successfully!</DialogTitle>
              <DialogDescription className="text-center">
                The following questionnaire IDs have been generated:
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {generatedQuestionnaires.map((id, index) => (
                  <div
                    key={id}
                    className="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
                  >
                    <span className="text-sm font-mono font-medium">{id}</span>
                    <span className="text-xs text-gray-500">Interview {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create New Spot</DialogTitle>
              <DialogDescription>
                Create a new spot with interview assignments. Click on the map to set the
                starting point.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                {/* Starting Point Display */}
                <div className="space-y-2">
                  <Label>Starting Point</Label>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    {startingPoint ? (
                      <span className="text-sm font-mono text-blue-900">
                        {startingPoint.lat.toFixed(6)}, {startingPoint.lng.toFixed(6)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">Click on the map to set location</span>
                    )}
                  </div>
                </div>

                {/* Spot Name */}
                <div className="space-y-2">
                  <Label htmlFor="spotName">
                    Spot Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="spotName"
                    placeholder="e.g., Spot #1"
                    value={spotName}
                    onChange={(e) => setSpotName(e.target.value)}
                    disabled={loading}
                    className={errors.spotName ? "border-red-500" : ""}
                  />
                  {errors.spotName && (
                    <p className="text-sm text-red-500">{errors.spotName}</p>
                  )}
                </div>

                {/* Barangay Selection */}
                <div className="space-y-2">
                  <Label htmlFor="barangay">
                    Barangay <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={barangayId}
                    onValueChange={setBarangayId}
                    disabled={loading || loadingBarangays}
                  >
                    <SelectTrigger className={errors.barangayId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a barangay" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingBarangays ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        barangays.map((barangay) => (
                          <SelectItem key={barangay.id} value={barangay.id.toString()}>
                            {barangay.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.barangayId && (
                    <p className="text-sm text-red-500">{errors.barangayId}</p>
                  )}
                </div>

                {/* Questionnaires per Spot - Fixed at 5 */}
                <div className="space-y-2">
                  <Label>Questionnaires per Spot</Label>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-900">{numberOfQuestionnaires}</span>
                        <span className="text-sm text-blue-700">questionnaires</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Fixed at 5 per survey methodology standard
                      </p>
                    </div>
                  </div>
                </div>

                {/* Random Start */}
                <div className="space-y-2">
                  <Label htmlFor="randomStart">
                    Random Start (1-5) <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="randomStart"
                      type="number"
                      min="1"
                      max="5"
                      placeholder="e.g., 3"
                      value={randomStart}
                      onChange={(e) => setRandomStart(e.target.value)}
                      disabled={loading}
                      className={errors.randomStart ? "border-red-500" : ""}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setRandomStart(String(Math.floor(Math.random() * 5) + 1))}
                      disabled={loading}
                      title="Generate random number (1-5)"
                    >
                      <Dices className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.randomStart && (
                    <p className="text-sm text-red-500">{errors.randomStart}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    This number is used for randomization in the survey methodology
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !startingPoint}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Spot"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
