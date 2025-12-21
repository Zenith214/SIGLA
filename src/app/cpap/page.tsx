"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { useActiveCycle } from "@/hooks/useSurveyCycle";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { CPAPSpreadsheet } from "@/components/cpap/CPAPSpreadsheet";
import { CPAPSpreadsheetReadOnly } from "@/components/cpap/CPAPSpreadsheetReadOnly";
import { CPAPSubmitModal } from "@/components/cpap/CPAPSubmitModal";
import { CPAPCommentsSidebar } from "@/components/cpap/CPAPCommentsSidebar";
import { CPAPNotificationMenu } from "@/components/cpap/CPAPNotificationMenu";
import type { CPAP, CPAPStatus, CPAPItem, CPAPItemInput } from "@/types/cpap";

function CPAPPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { activeCycle } = useActiveCycle();
  const { toast } = useToast();
  const { canEditCPAP: canEdit, canSubmitCPAP: canSubmit, isViewer: isViewerRole } = usePermissions();
  
  const [cpap, setCpap] = useState<CPAP | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      console.log("🔍 Fetching user barangay assignment...");
      // Fetch user's barangay assignment
      const response = await fetch("/api/users/me/barangay");
      
      console.log("📡 API Response status:", response.status);
      
      if (response.status === 404) {
        // User has no barangay assignment
        console.error("❌ No barangay assignment found (404)");
        setError("You are not assigned to any barangay. Please contact your administrator to assign you to a barangay.");
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ API Error:", errorData);
        throw new Error(errorData.error || "Failed to fetch user barangay");
      }
      
      const data = await response.json();
      console.log("✅ User barangay data:", data);
      setUserBarangayId(data.barangay_id);
    } catch (err) {
      console.error("❌ Error fetching user barangay:", err);
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

      // Cache-busting: Add timestamp to force fresh data
      const timestamp = Date.now();
      console.log("🔄 [OVERVIEW] Fetching CPAP with cache-busting timestamp:", timestamp);

      // First, try to get existing CPAP with cache-busting
      const listResponse = await fetch(
        `/api/cpap?barangay_id=${userBarangayId}&cycle_id=${activeCycle.cycle_id}&_t=${timestamp}`,
        {
          cache: 'no-store', // Disable Next.js cache
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        }
      );

      if (!listResponse.ok) {
        throw new Error("Failed to fetch CPAP");
      }

      const listData = await listResponse.json();

      if (listData.cpaps && listData.cpaps.length > 0) {
        // CPAP exists, fetch full details
        const cpapId = listData.cpaps[0].id;
        console.log("🔄 [OVERVIEW] Fetching CPAP details for ID:", cpapId);
        
        const detailResponse = await fetch(`/api/cpap/${cpapId}?_t=${timestamp}`, {
          cache: 'no-store', // Disable Next.js cache
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        if (!detailResponse.ok) {
          throw new Error("Failed to fetch CPAP details");
        }

        const detailData = await detailResponse.json();
        console.log("✅ [OVERVIEW] CPAP data loaded:", {
          id: detailData.cpap.id,
          itemCount: detailData.cpap.items?.length || 0,
          firstItemSample: detailData.cpap.items?.[0] ? {
            observation: detailData.cpap.items[0].observation?.substring(0, 50),
            actualOutput: detailData.cpap.items[0].actual_output?.substring(0, 50)
          } : null
        });
        setCpap(detailData.cpap);
      } else {
        // No CPAP exists - set cpap to null to show "Create a Plan" button
        setCpap(null);
      }
    } catch (err) {
      console.error("Error fetching CPAP:", err);
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

  const handleCreatePlan = () => {
    router.push("/cpap/editor");
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

  const handleEditItem = (item: CPAPItem) => {
    // Redirect to spreadsheet editor
    router.push("/cpap/editor");
  };

  const handleDeleteItem = async (itemId: number) => {
    // Redirect to spreadsheet editor for deletion
    router.push("/cpap/editor");
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

  const handleSave = async (items: any[]) => {
    if (!cpap) return;

    try {
      setIsSaving(true);

      // Calculate which items were deleted
      const existingItemIds = (cpap.items || []).map(item => item.id).filter(id => id !== undefined);
      const newItemIds = items.map(item => item.id).filter(id => id !== undefined);
      const deleted_item_ids = existingItemIds.filter(id => !newItemIds.includes(id));

      console.log("Saving CPAP progress:", {
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
                <div className="flex items-center gap-3">
                  <CPAPNotificationMenu />
                  <Badge variant={getStatusBadgeVariant(cpap.status)}>
                    {getStatusLabel(cpap.status)}
                  </Badge>
                </div>
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
          ) : cpap === null && !isLoading && !error ? (
            // No CPAP exists - show "Create a Plan" button
            <div className="bg-white rounded-lg shadow">
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Plus className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No CPAP Created Yet
                </h3>
                <p className="text-sm text-gray-600 text-center max-w-md mb-8">
                  Create your Citizen Priority Action Plan to document and track your barangay's priority actions based on survey results.
                </p>
                <Button
                  onClick={handleCreatePlan}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create a Plan
                </Button>
              </div>
            </div>
          ) : cpap ? (
            <div className="space-y-6">
              {/* CPAP Info Card */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {cpap.barangay?.barangay_name || "Barangay"}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {cpap.cycle?.name || "Survey Cycle"} - {cpap.cycle?.year}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(cpap.status)} className="text-sm px-3 py-1">
                      {getStatusLabel(cpap.status)}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{cpap.items.length}</p>
                      <p className="text-xs text-gray-500 mt-1">Action Items</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {cpap.items.filter(item => item.accomplishment_status).length}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">In Progress</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-600">
                        {new Set(cpap.items.map(item => item.priority_area)).size}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Service Areas</p>
                    </div>
                  </div>

                  {/* Viewer Notice */}
                  {isViewerRole && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                        <span className="mr-2">👁️</span> Viewing Mode
                      </h3>
                      <p className="text-sm text-blue-800">
                        You are viewing this CPAP in read-only mode. You cannot make changes or submit action plans.
                      </p>
                    </div>
                  )}

                  {/* Admin Comments (if revision requested) */}
                  {cpap.status === "Revision_Requested" && cpap.admin_comments && (
                    <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">
                        ⚠️ Revision Requested
                      </h3>
                      <p className="text-sm text-orange-800">{cpap.admin_comments}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 flex items-center gap-3">
                    {isEditable && (
                      <Button
                        onClick={() => router.push("/cpap/editor")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Edit in Spreadsheet View
                      </Button>
                    )}
                    {isEditable && canSubmit && cpap.items.length > 0 && (
                      <Button
                        onClick={handleSubmitClick}
                        disabled={isSaving}
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        {cpap.status === "Revision_Requested" ? "Resubmit to DILG" : "Submit to DILG"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Items List or Progress Tracker */}
              {isApproved ? (
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Implementation Progress - Update Action Items
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Update the "Actual Output", "Status of Accomplishment", and "Actual Date" fields to track your progress.
                    </p>
                    {/* Use editable spreadsheet for approved CPAPs */}
                    <CPAPSpreadsheet
                      cpap={cpap}
                      onSave={handleSave}
                      isSaving={isSaving}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Action Items ({cpap.items.length})
                    </h3>
                    <CPAPSpreadsheetReadOnly items={cpap.items} />
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

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

        {/* Comments Sidebar */}
        {cpap && user && (
          <CPAPCommentsSidebar
            cpapId={cpap.id}
            currentUserId={typeof user.id === 'string' ? parseInt(user.id) : user.id}
            currentUserRole={user.role || "officer"}
            initialOpen={searchParams.get('openComments') === 'true'}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

export default function CPAPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    }>
      <CPAPPageContent />
    </Suspense>
  );
}
