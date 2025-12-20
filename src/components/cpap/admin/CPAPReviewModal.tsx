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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Calendar, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { CPAPWithDetails, CPAPStatus } from "@/types/cpap";

const ITEMS_PER_PAGE = 5;

interface CPAPReviewModalProps {
  cpap: CPAPWithDetails;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function CPAPReviewModal({
  cpap,
  open,
  onClose,
  onUpdate,
}: CPAPReviewModalProps) {
  const { toast } = useToast();
  const [isApproving, setIsApproving] = useState(false);
  const [isRequestingRevision, setIsRequestingRevision] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionComments, setRevisionComments] = useState("");
  const [commentsError, setCommentsError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination calculations
  const totalPages = Math.ceil(cpap.items.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = cpap.items.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top of items list
    const itemsSection = document.querySelector('[data-items-section]');
    if (itemsSection) {
      itemsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

      onUpdate();
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
        throw new Error(errorData.message || "Failed to request revision");
      }

      toast({
        title: "Success",
        description: "Revision requested successfully",
        type: "success",
      });

      onUpdate();
    } catch (err) {
      console.error("Error requesting revision:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to request revision",
        type: "error",
      });
    } finally {
      setIsRequestingRevision(false);
      setShowRevisionForm(false);
      setRevisionComments("");
    }
  };

  const handleClose = () => {
    setShowApproveConfirm(false);
    setShowRevisionForm(false);
    setRevisionComments("");
    setCommentsError("");
    onClose();
  };

  const canReview = cpap.status === "Submitted";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>CPAP Review</DialogTitle>
            <Badge variant={getStatusBadgeVariant(cpap.status)}>
              {getStatusLabel(cpap.status)}
            </Badge>
          </div>
          <DialogDescription>
            Review the Citizen Priority Action Plan for {cpap.barangay.barangay_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1">
          {/* CPAP Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Barangay</p>
                <p className="text-base font-semibold text-gray-900">
                  {cpap.barangay.barangay_name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Survey Cycle</p>
                <p className="text-base font-semibold text-gray-900">
                  {cpap.cycle.name} - {cpap.cycle.year}
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

          {/* Admin Comments (if any) */}
          {cpap.admin_comments && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-2">Previous Comments</h4>
              <p className="text-sm text-orange-800">{cpap.admin_comments}</p>
            </div>
          )}

          {/* Action Items */}
          <div data-items-section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Action Items</h3>
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600">
                  {cpap.items.length} {cpap.items.length === 1 ? "item" : "items"}
                </p>
                {totalPages > 1 && (
                  <Badge variant="outline">
                    Page {currentPage} of {totalPages}
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {currentItems.map((item, index) => {
                const globalIndex = startIndex + index;
                return (
                  <div
                    key={item.id}
                    className="bg-white border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">
                        #{globalIndex + 1}
                      </Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {item.priority_area}
                        </h4>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Target Output
                      </p>
                      <p className="text-sm text-gray-700">{item.target_output}</p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Success Indicator
                      </p>
                      <p className="text-sm text-gray-700">{item.success_indicator}</p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Responsible Person
                      </p>
                      <p className="text-sm text-gray-700">{item.responsible_person}</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(item.timeline_start)} - {formatDate(item.timeline_end)}
                      </span>
                    </div>

                    {/* Progress info (if approved) */}
                    {cpap.status === "Approved" && (
                      <div className="mt-4 pt-4 border-t space-y-2">
                        {item.actual_output && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                              Actual Output
                            </p>
                            <p className="text-sm text-gray-700">{item.actual_output}</p>
                          </div>
                        )}
                        {item.accomplishment_status && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                              Status
                            </p>
                            <p className="text-sm text-gray-700">{item.accomplishment_status}</p>
                          </div>
                        )}
                        {item.remarks && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                              Remarks
                            </p>
                            <p className="text-sm text-gray-700">{item.remarks}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 mt-4 border-t">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, cpap.items.length)} of {cpap.items.length} items
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      const showPage = 
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1);
                      
                      const showEllipsis = 
                        (page === currentPage - 2 && currentPage > 3) ||
                        (page === currentPage + 2 && currentPage < totalPages - 2);

                      if (showEllipsis) {
                        return (
                          <span key={page} className="px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }

                      if (!showPage) return null;

                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="min-w-[2.5rem]"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Revision Form */}
          {showRevisionForm && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-orange-900">Request Revision</h4>
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
                  rows={4}
                  className="mt-1"
                />
                {commentsError && (
                  <p className="text-sm text-red-500 mt-1">{commentsError}</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
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
                      Request Revision
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Approve Confirmation */}
          {showApproveConfirm && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-indigo-900">Confirm Approval</h4>
              <p className="text-sm text-indigo-800">
                Are you sure you want to approve this CPAP? The LGU officer will be notified
                and can begin tracking implementation progress.
              </p>
              <div className="flex justify-end gap-2">
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
                  className="bg-indigo-600 hover:bg-indigo-700"
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
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4 mt-4 flex-shrink-0">
          {canReview && !showApproveConfirm && !showRevisionForm && (
            <div className="flex gap-2 w-full justify-end">
              <Button
                variant="outline"
                onClick={() => setShowRevisionForm(true)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Request Revision
              </Button>
              <Button
                onClick={() => setShowApproveConfirm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve CPAP
              </Button>
            </div>
          )}
          {!canReview && !showApproveConfirm && !showRevisionForm && (
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
