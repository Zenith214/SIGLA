"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addVisit, getSurveyRecordByQuestionnaire, updateStatus } from "@/lib/indexedDB";

interface VisitStatusModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  questionnaireId: string;
  currentVisitCount: number;
}

export function VisitStatusModal({
  open,
  onClose,
  onSuccess,
  questionnaireId,
  currentVisitCount,
}: VisitStatusModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [outcome, setOutcome] = useState<string>("");
  const [callbackReason, setCallbackReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Validation errors
  const [errors, setErrors] = useState<{
    outcome?: string;
    callbackReason?: string;
    notes?: string;
  }>({});

  // Reset form when modal closes
  const handleClose = () => {
    if (!loading) {
      setOutcome("");
      setCallbackReason("");
      setNotes("");
      setErrors({});
      onClose();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!outcome) {
      newErrors.outcome = "Please select a visit outcome";
    }

    if (outcome === "Callback_Needed" && !callbackReason) {
      newErrors.callbackReason = "Please select a callback reason";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Get current location if available
      let location = null;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: false,
            });
          });
          location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        } catch (error) {
          console.log("Could not get location:", error);
          // Continue without location
        }
      }

      // Prepare notes with callback reason if applicable
      let finalNotes = notes.trim();
      if (outcome === "Callback_Needed" && callbackReason) {
        finalNotes = `Reason: ${callbackReason}${finalNotes ? `\n\n${finalNotes}` : ""}`;
      }

      // First, save to IndexedDB
      try {
        const record = await getSurveyRecordByQuestionnaire(questionnaireId);
        if (record) {
          // Convert outcome from underscore format to space format for IndexedDB
          const outcomeForIndexedDB = outcome.replace(/_/g, ' ') as any
          await addVisit(
            questionnaireId,
            record.cycleId,
            outcomeForIndexedDB,
            finalNotes || "",
            location || undefined
          );
          console.log(`✅ Visit logged to IndexedDB for ${questionnaireId}`);
          
          // Check if this should be flagged for substitution
          if (outcome === "Callback_Needed" || outcome === "Refused" || outcome === "Household_Moved") {
            // Get updated record to check visit count
            const updatedRecord = await getSurveyRecordByQuestionnaire(questionnaireId);
            if (updatedRecord) {
              // Count failed attempts (all visits except "Interview_Started" and "Interview_Completed")
              const failedAttempts = updatedRecord.visits.filter(
                v => v.outcome !== "Interview Started" && v.outcome !== "Interview Completed"
              ).length;
              
              if (failedAttempts >= 3) {
                // Note: We keep status as "In Progress" in IndexedDB
                // The API will set it to "Flagged_For_Substitution"
                console.log(`⚠️ Questionnaire ${questionnaireId} will be flagged after 3 failed attempts`);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error saving to IndexedDB:", error);
        // Continue to API call even if IndexedDB fails
      }

      // Then, save to API
      const response = await fetch("/api/visits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionnaireId,
          outcome,
          notes: finalNotes || null,
          location,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to log visit");
      }

      toast({
        title: "Visit Logged",
        description: `Visit ${data.visitNumber} has been recorded successfully.`,
      });

      // If interview was started, navigate to survey form to complete it
      if (outcome === "Interview_Started") {
        // Get the record to pass spot and cycle info
        const record = await getSurveyRecordByQuestionnaire(questionnaireId);
        if (record) {
          window.location.href = `/survey/forms?questionnaireId=${questionnaireId}&spotId=${record.spotId}&cycleId=${record.cycleId}`;
        } else {
          window.location.href = `/survey/forms?questionnaireId=${questionnaireId}`;
        }
        return;
      }

      // For other outcomes (callbacks, refused, moved), just close and refresh
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error logging visit:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to log visit",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const willBeFlagged = currentVisitCount >= 2 && outcome !== "Interview_Started";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log Visit Status</DialogTitle>
          <DialogDescription>
            Record the outcome of your visit to this household. This will be visit #{currentVisitCount + 1}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Visit Outcome Radio Group */}
            <div className="space-y-3">
              <Label>
                Visit Outcome <span className="text-red-500">*</span>
              </Label>
              <RadioGroup value={outcome} onValueChange={setOutcome}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Callback_Needed" id="callback" />
                  <Label htmlFor="callback" className="font-normal cursor-pointer">
                    Callback Needed
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Interview_Started" id="started" />
                  <Label htmlFor="started" className="font-normal cursor-pointer">
                    Interview Started
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Refused" id="refused" />
                  <Label htmlFor="refused" className="font-normal cursor-pointer">
                    Refused to Participate
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Household_Moved" id="moved" />
                  <Label htmlFor="moved" className="font-normal cursor-pointer">
                    Household Moved
                  </Label>
                </div>
              </RadioGroup>
              {errors.outcome && (
                <p className="text-sm text-red-500">{errors.outcome}</p>
              )}
            </div>

            {/* Callback Reason Dropdown (shown only when Callback_Needed is selected) */}
            {outcome === "Callback_Needed" && (
              <div className="space-y-2">
                <Label htmlFor="callbackReason">
                  Callback Reason <span className="text-red-500">*</span>
                </Label>
                <Select value={callbackReason} onValueChange={setCallbackReason}>
                  <SelectTrigger className={errors.callbackReason ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No one home">No one home</SelectItem>
                    <SelectItem value="Respondent busy">Respondent busy</SelectItem>
                    <SelectItem value="Respondent unavailable">Respondent unavailable</SelectItem>
                    <SelectItem value="Bad weather">Bad weather</SelectItem>
                    <SelectItem value="Other">Other (specify in notes)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.callbackReason && (
                  <p className="text-sm text-red-500">{errors.callbackReason}</p>
                )}
              </div>
            )}

            {/* Digital Fieldwork Diary Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                Digital Fieldwork Diary Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Enter any additional notes about this visit..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Optional: Add any observations or details about this visit
              </p>
            </div>

            {/* Warning for 3rd failed attempt */}
            {willBeFlagged && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">Warning: Final Attempt</p>
                  <p className="text-red-600 mt-1">
                    This will be the 3rd failed attempt. The questionnaire will be flagged for substitution.
                  </p>
                </div>
              </div>
            )}
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
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging...
                </>
              ) : (
                "Log Visit"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
