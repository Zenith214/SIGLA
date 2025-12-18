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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, User, CheckCircle2, AlertCircle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { calculateDisplayId } from "@/utils/displayIdCalculator";

interface Questionnaire {
  questionnaireId: string;
  sequenceNumber: number;
  status: string;
  assignedInterviewerId: number | null;
  assignedInterviewerName: string | null;
  assignedInterviewerEmail: string | null;
  display_id?: number | null;
}

interface FieldInterviewer {
  id: number;
  name: string;
  email: string;
}

interface QuestionnaireAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  spotId: number | null;
  spotName: string;
}

export default function QuestionnaireAssignmentModal({
  open,
  onClose,
  onSuccess,
  spotId,
  spotName,
}: QuestionnaireAssignmentModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [fieldInterviewers, setFieldInterviewers] = useState<FieldInterviewer[]>([]);
  const [selectedQuestionnaires, setSelectedQuestionnaires] = useState<Set<string>>(new Set());
  const [selectedInterviewer, setSelectedInterviewer] = useState<string>("");
  const [assignmentStats, setAssignmentStats] = useState({
    totalCount: 0,
    assignedCount: 0,
    unassignedCount: 0,
  });

  // Fetch questionnaires and interviewers when modal opens
  useEffect(() => {
    if (open && spotId) {
      fetchQuestionnaires();
      fetchFieldInterviewers();
    }
  }, [open, spotId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setSelectedQuestionnaires(new Set());
        setSelectedInterviewer("");
      }, 300);
    }
  }, [open]);

  const fetchQuestionnaires = async () => {
    if (!spotId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/questionnaires/assign?spotId=${spotId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch questionnaires");
      }
      const data = await response.json();
      
      setQuestionnaires(data.questionnaires || []);
      setAssignmentStats({
        totalCount: data.totalCount || 0,
        assignedCount: data.assignedCount || 0,
        unassignedCount: data.unassignedCount || 0,
      });
    } catch (error) {
      console.error("Error fetching questionnaires:", error);
      toast({
        title: "Error",
        description: "Failed to load questionnaires",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFieldInterviewers = async () => {
    try {
      const response = await fetch("/api/users?role=interviewer");
      if (!response.ok) {
        throw new Error("Failed to fetch field interviewers");
      }
      const data = await response.json();
      
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
    }
  };

  const handleToggleQuestionnaire = (questionnaireId: string) => {
    setSelectedQuestionnaires((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionnaireId)) {
        newSet.delete(questionnaireId);
      } else {
        newSet.add(questionnaireId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (assigned: boolean) => {
    const filtered = questionnaires.filter(q => 
      assigned ? q.assignedInterviewerId !== null : q.assignedInterviewerId === null
    );
    setSelectedQuestionnaires(new Set(filtered.map(q => q.questionnaireId)));
  };

  const handleAssign = async () => {
    if (selectedQuestionnaires.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one questionnaire to assign",
        variant: "destructive",
      });
      return;
    }

    if (!selectedInterviewer) {
      toast({
        title: "No Interviewer",
        description: "Please select an interviewer",
        variant: "destructive",
      });
      return;
    }

    setAssigning(true);
    try {
      const response = await fetch("/api/questionnaires/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionnaireIds: Array.from(selectedQuestionnaires),
          interviewerId: parseInt(selectedInterviewer),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign questionnaires");
      }

      toast({
        title: "Success",
        description: data.message || `Assigned ${data.assignedCount} questionnaire(s) to ${data.assignedTo}`,
      });

      // Refresh questionnaires list
      await fetchQuestionnaires();
      
      // Clear selection
      setSelectedQuestionnaires(new Set());
      setSelectedInterviewer("");

      // Notify parent
      onSuccess();
    } catch (error) {
      console.error("Error assigning questionnaires:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign questionnaires",
        variant: "destructive",
      });
    } finally {
      setAssigning(false);
    }
  };

  // Get display ID with fallback logic
  const getDisplayId = (questionnaire: Questionnaire): number | null => {
    // First, try to use display_id from API response
    if (questionnaire.display_id !== undefined && questionnaire.display_id !== null) {
      return questionnaire.display_id;
    }
    
    // Fallback: calculate display_id from questionnaireId (full_id)
    const calculated = calculateDisplayId(questionnaire.questionnaireId);
    if (calculated !== null) {
      return calculated;
    }
    
    // Ultimate fallback: return null (will show full_id)
    return null;
  };

  const getInterviewerColor = (interviewerId: number | null) => {
    if (!interviewerId) return "bg-gray-100 text-gray-800";
    
    // Generate consistent color based on interviewer ID
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
      "bg-pink-100 text-pink-800",
      "bg-teal-100 text-teal-800",
    ];
    return colors[interviewerId % colors.length];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Questionnaire Assignments</DialogTitle>
          <DialogDescription>
            Assign questionnaires from <strong>{spotName}</strong> to field interviewers
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{assignmentStats.totalCount}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-700">{assignmentStats.assignedCount}</div>
                <div className="text-xs text-green-600">Assigned</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-amber-700">{assignmentStats.unassignedCount}</div>
                <div className="text-xs text-amber-600">Unassigned</div>
              </div>
            </div>

            {/* Assignment Controls */}
            <div className="space-y-4 border-t border-b border-gray-200 py-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Label htmlFor="interviewer-select">Assign Selected To:</Label>
                  <Select
                    value={selectedInterviewer}
                    onValueChange={setSelectedInterviewer}
                    disabled={assigning}
                  >
                    <SelectTrigger id="interviewer-select">
                      <SelectValue placeholder="Select an interviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldInterviewers.map((fi) => (
                        <SelectItem key={fi.id} value={fi.id.toString()}>
                          {fi.name} ({fi.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAssign}
                  disabled={assigning || selectedQuestionnaires.size === 0 || !selectedInterviewer}
                >
                  {assigning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      Assign ({selectedQuestionnaires.size})
                    </>
                  )}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(false)}
                >
                  Select All Unassigned
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(true)}
                >
                  Select All Assigned
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedQuestionnaires(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            </div>

            {/* Questionnaires List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {questionnaires.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No questionnaires found for this spot
                </div>
              ) : (
                questionnaires.map((q) => {
                  const displayId = getDisplayId(q);
                  return (
                    <div
                      key={q.questionnaireId}
                      className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                        selectedQuestionnaires.has(q.questionnaireId)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      aria-label={`${displayId !== null ? `Interview number ${displayId}` : `Questionnaire ${q.questionnaireId}`}, ${q.assignedInterviewerId ? `assigned to ${q.assignedInterviewerName}` : 'unassigned'}`}
                    >
                      <Checkbox
                        checked={selectedQuestionnaires.has(q.questionnaireId)}
                        onCheckedChange={() => handleToggleQuestionnaire(q.questionnaireId)}
                        aria-label={`Select ${displayId !== null ? `interview ${displayId}` : `questionnaire ${q.questionnaireId}`}`}
                      />
                      <div className="flex-1">
                        <div 
                          className="text-sm font-semibold text-gray-900"
                          aria-label={displayId !== null ? `Interview number ${displayId}` : `Questionnaire ${q.questionnaireId}`}
                        >
                          {displayId !== null ? `Interview #${displayId}` : q.questionnaireId}
                        </div>
                        <div className="text-xs text-gray-500">
                          Slot #{q.sequenceNumber}
                        </div>
                      </div>
                      {q.assignedInterviewerId ? (
                        <div 
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getInterviewerColor(q.assignedInterviewerId)}`}
                          aria-label={`Assigned to ${q.assignedInterviewerName}`}
                        >
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {q.assignedInterviewerName}
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                          aria-label="Unassigned"
                        >
                          Unassigned
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={assigning}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
