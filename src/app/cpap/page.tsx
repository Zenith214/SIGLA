"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { useActiveCycle } from "@/hooks/useSurveyCycle";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Loader2, Plus, Sparkles } from "lucide-react";
import { CPAPItemForm } from "@/components/cpap/CPAPItemForm";
import { CPAPItemList } from "@/components/cpap/CPAPItemList";
import { AISuggestionsModal } from "@/components/cpap/AISuggestionsModal";
import { CPAPSubmitModal } from "@/components/cpap/CPAPSubmitModal";
import { ProgressTracker } from "@/components/cpap/ProgressTracker";
import type { CPAP, CPAPStatus, CPAPItem, CPAPItemInput, ProgressUpdate } from "@/types/cpap";

export default function CPAPPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeCycle } = useActiveCycle();
  const { toast } = useToast();
  const { canEditCPAP: canEdit, canSubmitCPAP: canSubmit, isViewer: isViewerRole } = usePermissions();
  
  const [cpap, setCpap] = useState<CPAP | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<CPAPItem | null>(null);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiGeneratedItems, setAiGeneratedItems] = useState<CPAPItemInput[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const [userBarangayId, setUserBarangayId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserBarangay();
    }
  }, [user]);

  useEffect(() => {
    if (userBarangayId && activeCycle) {
      fetchOrCreateCPAP();
    }
  }, [userBarangayId, activeCycle]);

  const fetchUserBarangay = async () => {
    try {
      // Fetch user's barangay assignment
      const response = await fetch("/api/users/me/barangay");
      
      if (response.status === 404) {
        // User has no barangay assignment
        setError("You are not assigned to any barangay. Please contact your administrator to assign you to a barangay.");
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch user barangay");
      }
      
      const data = await response.json();
      setUserBarangayId(data.barangay_id);
    } catch (err) {
      console.error("Error fetching user barangay:", err);
      setError(err instanceof Error ? err.message : "Unable to determine your assigned barangay");
      setIsLoading(false);
    }
  };

  const fetchOrCreateCPAP = async () => {
    if (!userBarangayId || !activeCycle?.cycle_id) {
      setError("Missing barangay or cycle information");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // First, try to get existing CPAP
      const listResponse = await fetch(
        `/api/cpap?barangay_id=${userBarangayId}&cycle_id=${activeCycle.cycle_id}`
      );

      if (!listResponse.ok) {
        throw new Error("Failed to fetch CPAP");
      }

      const listData = await listResponse.json();

      if (listData.cpaps && listData.cpaps.length > 0) {
        // CPAP exists, fetch full details
        const cpapId = listData.cpaps[0].id;
        const detailResponse = await fetch(`/api/cpap/${cpapId}`);
        
        if (!detailResponse.ok) {
          throw new Error("Failed to fetch CPAP details");
        }

        const detailData = await detailResponse.json();
        setCpap(detailData.cpap);
      } else {
        // Create new CPAP
        const createResponse = await fetch("/api/cpap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            barangay_id: userBarangayId,
            cycle_id: activeCycle.cycle_id,
          }),
        });

        if (!createResponse.ok) {
          throw new Error("Failed to create CPAP");
        }

        const createData = await createResponse.json();
        
        // Fetch full details of newly created CPAP
        const detailResponse = await fetch(`/api/cpap/${createData.cpap.id}`);
        const detailData = await detailResponse.json();
        setCpap(detailData.cpap);
      }
    } catch (err) {
      console.error("Error fetching/creating CPAP:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: "Failed to load CPAP. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: CPAPStatus) => {
    switch (status) {
      case "Draft":
        return "secondary";
      case "Submitted":
        return "default";
      case "Approved":
        return "default";
      case "Revision_Requested":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: CPAPStatus) => {
    switch (status) {
      case "Revision_Requested":
        return "Revision Requested";
      default:
        return status;
    }
  };

  const isEditable = (cpap?.status === "Draft" || cpap?.status === "Revision_Requested") && canEdit;
  const isApproved = cpap?.status === "Approved";

  const handleAddItem = () => {
    setEditingItem(null);
    setShowItemForm(true);
  };

  const handleEditItem = (item: CPAPItem) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleCancelForm = () => {
    setShowItemForm(false);
    setEditingItem(null);
  };

  const debouncedSave = useCallback(
    (items: CPAPItemInput[], deletedIds: number[] = []) => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      const timeout = setTimeout(async () => {
        await saveItems(items, deletedIds);
      }, 1000);

      setSaveTimeout(timeout);
    },
    [saveTimeout]
  );

  const saveItems = async (items: CPAPItemInput[], deletedIds: number[] = []) => {
    if (!cpap) return;

    try {
      setIsSaving(true);

      const response = await fetch(`/api/cpap/${cpap.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          deleted_item_ids: deletedIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save items");
      }

      const data = await response.json();
      setCpap(data.cpap);

      toast({
        title: "Success",
        description: "Changes saved successfully",
        type: "success",
      });
    } catch (err) {
      console.error("Error saving items:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save changes",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveItem = async (itemData: CPAPItemInput) => {
    if (!cpap) return;

    const existingItems = cpap.items.map((item) => ({
      id: item.id,
      priority_area: item.priority_area,
      target_output: item.target_output,
      success_indicator: item.success_indicator,
      responsible_person: item.responsible_person,
      timeline_start: item.timeline_start.split("T")[0],
      timeline_end: item.timeline_end.split("T")[0],
    }));

    let updatedItems: CPAPItemInput[];

    if (editingItem) {
      // Update existing item
      updatedItems = existingItems.map((item) =>
        item.id === editingItem.id ? itemData : item
      );
    } else {
      // Add new item
      updatedItems = [...existingItems, itemData];
    }

    await saveItems(updatedItems);
    setShowItemForm(false);
    setEditingItem(null);
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!cpap) return;

    const remainingItems = cpap.items
      .filter((item) => item.id !== itemId)
      .map((item) => ({
        id: item.id,
        priority_area: item.priority_area,
        target_output: item.target_output,
        success_indicator: item.success_indicator,
        responsible_person: item.responsible_person,
        timeline_start: item.timeline_start.split("T")[0],
        timeline_end: item.timeline_end.split("T")[0],
      }));

    await saveItems(remainingItems, [itemId]);
  };

  const handleUseSuggestions = (items: CPAPItemInput[]) => {
    setAiGeneratedItems(items);
    toast({
      title: "AI Suggestions Loaded",
      description: `${items.length} action items have been added. Review and save them to your CPAP.`,
      type: "success",
    });
  };

  const handleSaveAIItems = async () => {
    if (!cpap || aiGeneratedItems.length === 0) return;

    const existingItems = cpap.items.map((item) => ({
      id: item.id,
      priority_area: item.priority_area,
      target_output: item.target_output,
      success_indicator: item.success_indicator,
      responsible_person: item.responsible_person,
      timeline_start: item.timeline_start.split("T")[0],
      timeline_end: item.timeline_end.split("T")[0],
    }));

    const allItems = [...existingItems, ...aiGeneratedItems];
    await saveItems(allItems);
    setAiGeneratedItems([]);
  };

  const handleDiscardAIItems = () => {
    setAiGeneratedItems([]);
    toast({
      title: "Suggestions Discarded",
      description: "AI-generated items have been removed.",
      type: "info",
    });
  };

  const validateForSubmission = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!cpap || cpap.items.length === 0) {
      errors.push("At least one action item is required");
      return { valid: false, errors };
    }

    cpap.items.forEach((item, index) => {
      if (!item.priority_area.trim()) {
        errors.push(`Item ${index + 1}: Priority area is required`);
      }
      if (!item.target_output.trim()) {
        errors.push(`Item ${index + 1}: Target output is required`);
      }
      if (!item.success_indicator.trim()) {
        errors.push(`Item ${index + 1}: Success indicator is required`);
      }
      if (!item.responsible_person.trim()) {
        errors.push(`Item ${index + 1}: Responsible person is required`);
      }
      if (!item.timeline_start) {
        errors.push(`Item ${index + 1}: Start date is required`);
      }
      if (!item.timeline_end) {
        errors.push(`Item ${index + 1}: End date is required`);
      }
    });

    return { valid: errors.length === 0, errors };
  };

  const handleSubmitClick = () => {
    if (!cpap) return;

    // Validate
    const validation = validateForSubmission();
    if (!validation.valid) {
      toast({
        title: "Validation Error",
        description: validation.errors[0],
        type: "error",
      });
      return;
    }

    // Show submit modal
    setShowSubmitModal(true);
  };

  const handleSubmit = async () => {
    if (!cpap) return;

    try {
      setIsSaving(true);

      const response = await fetch(`/api/cpap/${cpap.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit CPAP");
      }

      toast({
        title: "Success",
        description: "CPAP submitted successfully for DILG review",
        type: "success",
      });

      setShowSubmitModal(false);
      
      // Refresh CPAP data
      await fetchOrCreateCPAP();
    } catch (err) {
      console.error("Error submitting CPAP:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to submit CPAP",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProgress = async (updates: ProgressUpdate[]) => {
    if (!cpap) return;

    try {
      setIsSaving(true);

      const response = await fetch(`/api/cpap/${cpap.id}/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: updates }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save progress");
      }

      const data = await response.json();
      setCpap(data.cpap);

      toast({
        title: "Success",
        description: "Progress updated successfully",
        type: "success",
      });
    } catch (err) {
      console.error("Error saving progress:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save progress",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Check if user has access to CPAP dashboard (Officer, Admin, or Viewer)
  useEffect(() => {
    if (user) {
      const userRole = user.role?.toLowerCase();
      const allowedRoles = ["officer", "admin", "developer", "viewer"];
      if (!allowedRoles.includes(userRole)) {
        router.push("/forbidden?reason=role_restricted&attempted_path=/cpap");
      }
    }
  }, [user, router]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#dbeafe' }}>
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/dashboard")}
                  className="text-white hover:bg-slate-700"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    CPAP Submission
                  </h1>
                  <p className="text-sm text-slate-300 mt-1">
                    Citizen Priority Action Plan
                  </p>
                </div>
              </div>
              {cpap && (
                <Badge variant={getStatusBadgeVariant(cpap.status)}>
                  {getStatusLabel(cpap.status)}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow">
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <ArrowLeft className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Unable to Load CPAP
                </h3>
                <p className="text-sm text-gray-600 text-center max-w-md mb-6">
                  {error}
                </p>
                {error.includes("not assigned") ? (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 max-w-md">
                    <p className="text-sm text-indigo-800">
                      <strong>Need Help?</strong> Contact your system administrator to assign you to a barangay. Once assigned, you'll be able to create and manage CPAPs.
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      setError(null);
                      fetchUserBarangay();
                    }}
                    variant="outline"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          ) : cpap ? (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {cpap.barangay?.barangay_name || "Barangay"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {cpap.cycle?.name || "Survey Cycle"} - {cpap.cycle?.year}
                  </p>
                </div>

                {/* Viewer Notice */}
                {isViewerRole && (
                  <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      👁️ Viewing Mode
                    </h3>
                    <p className="text-sm text-blue-800">
                      You are viewing this CPAP in read-only mode. You cannot make changes or submit action plans.
                    </p>
                  </div>
                )}

                {/* Admin Comments (if revision requested) */}
                {cpap.status === "Revision_Requested" && cpap.admin_comments && (
                  <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-900 mb-2">
                      Revision Requested
                    </h3>
                    <p className="text-sm text-orange-800">{cpap.admin_comments}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {isEditable && !showItemForm && (
                  <div className="mb-6 flex items-center gap-3">
                    <Button onClick={handleAddItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAISuggestions(true)}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Suggestions
                    </Button>
                    {isSaving && (
                      <span className="ml-3 text-sm text-gray-500">
                        Saving...
                      </span>
                    )}
                  </div>
                )}

                {/* Item Form Modal */}
                <Dialog open={showItemForm} onOpenChange={(open) => !open && handleCancelForm()}>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingItem ? "Edit Action Item" : "Add Action Item"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingItem 
                          ? "Update the details of this action item"
                          : "Add a new action item to your CPAP"}
                      </DialogDescription>
                    </DialogHeader>
                    <CPAPItemForm
                      item={editingItem}
                      onSave={handleSaveItem}
                      onCancel={handleCancelForm}
                      isReadOnly={false}
                    />
                  </DialogContent>
                </Dialog>

                {/* AI Generated Items Preview */}
                {aiGeneratedItems.length > 0 && (
                  <div className="mb-6 bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-600" />
                        <h3 className="font-semibold text-indigo-900">
                          AI-Generated Items (Not Saved)
                        </h3>
                        <Badge variant="secondary">
                          {aiGeneratedItems.length} items
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDiscardAIItems}
                        >
                          Discard
                        </Button>
                        <Button size="sm" onClick={handleSaveAIItems}>
                          Save All
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-indigo-800 mb-4">
                      Review these AI-generated suggestions. You can save them all,
                      or discard them and create your own items.
                    </p>
                    <div className="space-y-3">
                      {aiGeneratedItems.map((item, index) => (
                        <div
                          key={index}
                          className="bg-white border rounded-lg p-4 space-y-2"
                        >
                          <h4 className="font-medium text-gray-900">
                            {item.priority_area}
                          </h4>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                              Target Output
                            </p>
                            <p className="text-sm text-gray-700">
                              {item.target_output}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                              Success Indicator
                            </p>
                            <p className="text-sm text-gray-700">
                              {item.success_indicator}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Items List or Progress Tracker */}
                {isApproved ? (
                  <ProgressTracker
                    items={cpap.items}
                    onSaveProgress={handleSaveProgress}
                    isSaving={isSaving}
                    lastUpdated={cpap.updated_at}
                  />
                ) : (
                  <>
                    <CPAPItemList
                      items={cpap.items}
                      status={cpap.status}
                      onEdit={handleEditItem}
                      onDelete={handleDeleteItem}
                      canEdit={canEdit}
                    />

                        {/* Submit Button */}
                    {isEditable && canSubmit && cpap.items.length > 0 && !showItemForm && aiGeneratedItems.length === 0 && (
                      <div className="mt-6 pt-6 border-t">
                        <div className="flex justify-end">
                          <Button
                            size="lg"
                            onClick={handleSubmitClick}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {cpap.status === "Revision_Requested" ? (
                              "Resubmit to DILG"
                            ) : (
                              "Submit to DILG for Review"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* AI Suggestions Modal */}
        {cpap && userBarangayId && activeCycle?.cycle_id && (
          <AISuggestionsModal
            open={showAISuggestions}
            onClose={() => setShowAISuggestions(false)}
            barangayId={userBarangayId}
            cycleId={activeCycle.cycle_id}
            onUseSuggestions={handleUseSuggestions}
          />
        )}

        {/* Submit Modal */}
        {cpap && (
          <CPAPSubmitModal
            cpap={cpap}
            open={showSubmitModal}
            onClose={() => setShowSubmitModal(false)}
            onSubmit={handleSubmit}
            isResubmission={cpap.status === "Revision_Requested"}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
