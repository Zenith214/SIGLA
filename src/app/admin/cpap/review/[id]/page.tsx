"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Loader2, CheckCircle, XCircle, TrendingUp, Clock, Calendar } from "lucide-react";
import { CPAPSpreadsheetReadOnly } from "@/components/cpap/CPAPSpreadsheetReadOnly";
import { CPAPCommentsSidebar } from "@/components/cpap/CPAPCommentsSidebar";
import type { CPAPWithDetails, CPAPStatus } from "@/types/cpap";

export default function CPAPReviewPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const cpapId = params.id ? parseInt(params.id as string) : null;
  
  const [cpap, setCpap] = useState<CPAPWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isRequestingRevision, setIsRequestingRevision] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionComments, setRevisionComments] = useState("");
  const [commentsError, setCommentsError] = useState("");

  useEffect(() => {
    if (user && user.role?.toLowerCase() !== "admin") {
      router.push("/forbidden?reason=insufficient_permissions&attempted_path=/admin/cpap");
    }
  }, [user, router]);

  useEffect(() => {
    if (cpapId && user?.role?.toLowerCase() === "admin") {
      fetchCPAP();
    }
  }, [cpapId, user]);

  const fetchCPAP = async () => {
    if (!cpapId) return;
    
    try {
      setIsLoading(true);
      
      // Cache-busting: Add timestamp to force fresh data
      const timestamp = Date.now();
      console.log("🔄 [ADMIN REVIEW] Fetching CPAP with cache-busting timestamp:", timestamp);
      
      const response = await fetch(`/api/cpap/${cpapId}?_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch CPAP details");
      }

      const data = await response.json();
      console.log("✅ [ADMIN REVIEW] CPAP data loaded:", {
        id: data.cpap.id,
        itemCount: data.cpap.items?.length || 0
      });
      setCpap(data.cpap);
    } catch (err) {
      console.error("Error fetching CPAP:", err);
      toast({
        title: "Error",
        description: "Failed to load CPAP details",
        type: "error",
      });
      router.push("/admin/cpap");
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleApprove = async () => {
    if (!cpap) return;
    
    try {
      setIsApproving(true);

      const response = await fetch(`/api/cpap/${cpap.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to approve CPAP");
      }

      toast({
        title: "Success",
        description: "CPAP approved successfully",
        type: "success",
      });

      // Redirect back to management page
      router.push("/admin/cpap");
    } catch (err) {
      console.error("Error approving CPAP:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to approve CPAP",
        type: "error",
      });
    } finally {
      setIsApproving(false);
      setShowApproveConfirm(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!cpap) return;
    
    // Validate comments
    if (!revisionComments.trim()) {
      setCommentsError("Comments are required when requesting revision");
      return;
    }

    try {
      setIsRequestingRevision(true);

      const response = await fetch(`/api/cpap/${cpap.id}/request-revision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments: revisionComments }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to request rework");
      }

      toast({
        title: "Success",
        description: "Revision requested successfully",
        type: "success",
      });

      // Redirect back to management page
      router.push("/admin/cpap");
    } catch (err) {
      console.error("Error requesting revision:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to request rework",
        type: "error",
      });
    } finally {
      setIsRequestingRevision(false);
      setShowRevisionForm(false);
      setRevisionComments("");
    }
  };

  const canReview = cpap?.status === "Submitted";
  const isApproved = cpap?.status === "Approved";

  // Calculate progress for approved CPAPs
  const calculateProgress = () => {
    if (!cpap || !isApproved) return null;
    
    const totalItems = cpap.items.length;
    const itemsWithProgress = cpap.items.filter(
      item => item.actual_output && item.actual_output.trim() !== ""
    ).length;
    const completedItems = cpap.items.filter(
      item => item.progress === "Completed"
    ).length;
    const ongoingItems = cpap.items.filter(
      item => item.progress === "Ongoing"
    ).length;
    const delayedItems = cpap.items.filter(
      item => item.progress === "Delayed"
    ).length;
    
    const progressPercentage = totalItems > 0 
      ? Math.round((itemsWithProgress / totalItems) * 100) 
      : 0;
    
    return {
      totalItems,
      itemsWithProgress,
      completedItems,
      ongoingItems,
      delayedItems,
      progressPercentage
    };
  };

  const progress = calculateProgress();

  if (!user || user.role?.toLowerCase() !== "admin") {
    return null;
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'developer']}>
      <div className="min-h-screen" style={{ backgroundColor: '#dbeafe' }}>
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/admin/cpap")}
                  className="text-white hover:bg-slate-700"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    CPAP Review
                  </h1>
                  <p className="text-sm text-slate-300 mt-1">
                    Review Citizen Priority Action Plan
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {cpap && (
                  <Badge variant={getStatusBadgeVariant(cpap.status)} className="text-sm px-3 py-1">
                    {getStatusLabel(cpap.status)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : cpap ? (
            <div className="space-y-6">
              {/* CPAP Info Card */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Barangay</p>
                      <p className="text-base font-semibold text-gray-900">
                        {cpap.barangay?.barangay_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Survey Cycle</p>
                      <p className="text-base font-semibold text-gray-900">
                        {cpap.cycle?.name} - {cpap.cycle?.year}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Submitted</p>
                      <p className="text-base text-gray-900">
                        {formatDate(cpap.submitted_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Items</p>
                      <p className="text-base text-gray-900">{cpap.items.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Monitoring (for Approved CPAPs) */}
              {isApproved && progress && (
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Implementation Progress
                      </h3>
                      <Badge variant="default" className="bg-green-600">
                        Approved
                      </Badge>
                    </div>
                    
                    {/* Progress Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 rounded-full p-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-900">Overall Progress</p>
                            <p className="text-2xl font-bold text-blue-600">{progress.progressPercentage}%</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 rounded-full p-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-900">Completed</p>
                            <p className="text-2xl font-bold text-green-600">
                              {progress.completedItems} / {progress.totalItems}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-100 rounded-full p-2">
                            <Clock className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-orange-900">Ongoing</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {progress.ongoingItems}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-red-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-red-100 rounded-full p-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-red-900">Delayed</p>
                            <p className="text-2xl font-bold text-red-600">
                              {progress.delayedItems}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Implementation Progress</span>
                        <span className="font-semibold text-gray-900">{progress.progressPercentage}%</span>
                      </div>
                      <Progress value={progress.progressPercentage} className="h-3" />
                    </div>

                    {/* Approval Date */}
                    {cpap.approved_at && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Approved on {formatDate(cpap.approved_at)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Comments (if any) */}
              {cpap.admin_comments && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-2">Previous Comments</h4>
                  <p className="text-sm text-orange-800">{cpap.admin_comments}</p>
                </div>
              )}

              {/* Action Items - Spreadsheet View */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Action Items ({cpap.items.length})
                    </h3>
                    {/* Action Buttons */}
                    {canReview && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowRevisionForm(true)}
                          size="sm"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Request Rework
                        </Button>
                        <Button
                          onClick={() => setShowApproveConfirm(true)}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve CPAP
                        </Button>
                      </div>
                    )}
                  </div>
                  <CPAPSpreadsheetReadOnly items={cpap.items} />
                </div>
              </div>

              {/* Revision Request Modal */}
              <Dialog open={showRevisionForm} onOpenChange={setShowRevisionForm}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Request Rework</DialogTitle>
                    <DialogDescription>
                      Provide comments explaining what needs to be revised in this CPAP.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="revision-comments">
                        Comments <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="revision-comments"
                        value={revisionComments}
                        onChange={(e) => {
                          setRevisionComments(e.target.value);
                          setCommentsError("");
                        }}
                        placeholder="Explain what needs to be revised..."
                        rows={6}
                        className="mt-2"
                      />
                      {commentsError && (
                        <p className="text-sm text-red-500 mt-1">{commentsError}</p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRevisionForm(false);
                        setRevisionComments("");
                        setCommentsError("");
                      }}
                      disabled={isRequestingRevision}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleRequestRevision}
                      disabled={isRequestingRevision}
                    >
                      {isRequestingRevision ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Requesting...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Request Rework
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Approve Confirmation Modal */}
              <Dialog open={showApproveConfirm} onOpenChange={setShowApproveConfirm}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Confirm Approval</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to approve this CPAP? The LGU officer will be notified
                      and can begin tracking implementation progress.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowApproveConfirm(false)}
                      disabled={isApproving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={isApproving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isApproving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm Approval
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">CPAP not found</p>
              <Button
                onClick={() => router.push("/admin/cpap")}
                variant="outline"
                className="mt-4"
              >
                Back to Management
              </Button>
            </div>
          )}
        </div>

        {/* Comments Sidebar */}
        {cpap && user && (
          <CPAPCommentsSidebar
            cpapId={cpap.id}
            currentUserId={typeof user.id === 'string' ? parseInt(user.id) : user.id}
            currentUserRole={user.role || "admin"}
            initialOpen={searchParams.get('openComments') === 'true'}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
