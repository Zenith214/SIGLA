"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { useActiveCycle } from "@/hooks/useSurveyCycle";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Sparkles, AlertTriangle, Lightbulb } from "lucide-react";
import { CPAPSpreadsheet } from "@/components/cpap/CPAPSpreadsheet";
import { AISuggestionsModal } from "@/components/cpap/AISuggestionsModal";
import type { CPAP, CPAPItemInput } from "@/types/cpap";

export default function CPAPEditorPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeCycle } = useActiveCycle();
  const { toast } = useToast();
  const { canEditCPAP } = usePermissions();
  
  const [cpap, setCpap] = useState<CPAP | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userBarangayId, setUserBarangayId] = useState<number | null>(null);
  const [userBarangayName, setUserBarangayName] = useState<string>("");
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiGeneratedItems, setAiGeneratedItems] = useState<CPAPItemInput[]>([]);
  const [showTips, setShowTips] = useState(true);

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

  // Check if user has permission to edit CPAPs
  useEffect(() => {
    if (user && !canEditCPAP) {
      router.push("/forbidden?reason=permission_denied&attempted_path=/cpap/editor");
    }
  }, [user, canEditCPAP, router]);

  const fetchUserBarangay = async () => {
    try {
      const response = await fetch("/api/users/me/barangay");
      
      if (response.status === 404) {
        setError("You are not assigned to any barangay. Please contact your administrator.");
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch user barangay");
      }
      
      const data = await response.json();
      setUserBarangayId(data.barangay_id);
      setUserBarangayName(data.barangay_name || "");
    } catch (err) {
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

      // Try to get existing CPAP
      const listResponse = await fetch(
        `/api/cpap?barangay_id=${userBarangayId}&cycle_id=${activeCycle.cycle_id}`
      );

      if (!listResponse.ok) {
        throw new Error("Failed to fetch CPAP");
      }

      const listData = await listResponse.json();

      if (listData.cpaps && listData.cpaps.length > 0) {
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
        const detailResponse = await fetch(`/api/cpap/${createData.cpap.id}`);
        const detailData = await detailResponse.json();
        setCpap(detailData.cpap);
      }
    } catch (err) {
      console.error("Error fetching/creating CPAP:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (items: any[]) => {
    if (!cpap) return;

    try {
      setIsSaving(true);

      // Calculate which items were deleted
      // Items that exist in cpap.items but not in the new items array
      const existingItemIds = (cpap.items || []).map(item => item.id).filter(id => id !== undefined);
      const newItemIds = items.map(item => item.id).filter(id => id !== undefined);
      const deleted_item_ids = existingItemIds.filter(id => !newItemIds.includes(id));

      console.log("Saving CPAP:", {
        totalItems: items.length,
        existingIds: existingItemIds,
        newIds: newItemIds,
        deletedIds: deleted_item_ids
      });

      const response = await fetch(`/api/cpap/${cpap.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          deleted_item_ids,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save");
      }

      const data = await response.json();
      setCpap(data.cpap);

      toast({
        title: "Success",
        description: "CPAP saved successfully",
        type: "success",
      });
    } catch (err) {
      console.error("Error saving CPAP:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUseSuggestions = (items: CPAPItemInput[]) => {
    setAiGeneratedItems(items);
    setShowAISuggestions(false);
    toast({
      title: "AI Suggestions Loaded",
      description: `${items.length} suggestions added. Review and edit them in the spreadsheet below.`,
      type: "success",
    });
  };

  const handleDiscardAI = () => {
    setAiGeneratedItems([]);
    toast({
      title: "Suggestions Cleared",
      description: "AI suggestions have been removed.",
      type: "info",
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#dbeafe' }}>
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/cpap")}
                  className="text-white hover:bg-slate-700"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    CITIZEN PRIORITY ACTION PLAN
                  </h1>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-slate-300">
                      <span className="font-medium">Barangay of:</span> {userBarangayName}
                    </p>
                    <p className="text-sm text-slate-300">
                      <span className="font-medium">{activeCycle?.name || "Survey Cycle"}:</span> {activeCycle?.year}
                    </p>
                  </div>
                </div>
              </div>
              {/* Removed save button from header - use the one in spreadsheet component */}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow p-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Unable to Load CPAP
                </h3>
                <p className="text-sm text-gray-600">{error}</p>
              </div>
            </div>
          ) : cpap ? (
            <div className="space-y-4">
              {/* Tips Card */}
              {showTips && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-2">
                          Tips for Creating Your CPAP
                        </h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Use the <strong>AI Suggestions</strong> button to get started with recommendations based on survey data</li>
                          <li>• Fill in the <strong>Output</strong> column for each row (required for saving)</li>
                          <li>• Add multiple rows per service area as needed</li>
                          <li>• Use <strong>Tab</strong> key to navigate between cells quickly</li>
                          <li>• Click <strong>Save All Changes</strong> when done to persist your work</li>
                        </ul>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTips(false)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}

              {/* AI Suggestions Button */}
              <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">AI-Powered Suggestions</h3>
                    <p className="text-sm text-gray-600">
                      Get action item recommendations based on your barangay's survey results
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowAISuggestions(true)}
                  variant="outline"
                  className="border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get AI Suggestions
                </Button>
              </div>

              {/* AI Generated Items Warning */}
              {aiGeneratedItems.length > 0 && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-900 mb-2">
                        ⚠️ AI Suggestions Loaded - Review Required
                      </h3>
                      <p className="text-sm text-amber-800 mb-3">
                        <strong>{aiGeneratedItems.length} AI-generated suggestions</strong> have been added to the spreadsheet below. 
                        <strong className="block mt-1">Important:</strong>
                      </p>
                      <ul className="text-sm text-amber-800 space-y-1 mb-3">
                        <li>• AI suggestions may contain inaccuracies or be incomplete</li>
                        <li>• Review and edit each suggestion to match your barangay's actual needs</li>
                        <li>• Verify all information before saving</li>
                        <li>• Add or remove rows as needed</li>
                        <li>• These are recommendations only - you have full control</li>
                      </ul>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleDiscardAI}
                          className="border-amber-600 text-amber-700 hover:bg-amber-100"
                        >
                          Clear All Suggestions
                        </Button>
                        <span className="text-xs text-amber-700 flex items-center">
                          Scroll down to see the suggestions in the spreadsheet
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Spreadsheet */}
              <CPAPSpreadsheet
                cpap={cpap}
                onSave={handleSave}
                isSaving={isSaving}
                aiSuggestions={aiGeneratedItems}
                onClearAISuggestions={handleDiscardAI}
              />
            </div>
          ) : null}
        </div>

        {/* AI Suggestions Modal */}
        {userBarangayId && activeCycle?.cycle_id && (
          <AISuggestionsModal
            open={showAISuggestions}
            onClose={() => setShowAISuggestions(false)}
            barangayId={userBarangayId}
            cycleId={activeCycle.cycle_id}
            onUseSuggestions={handleUseSuggestions}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
