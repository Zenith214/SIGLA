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
import { Loader2, Send, AlertCircle, CheckCircle2, Calendar } from "lucide-react";
import type { CPAP } from "@/types/cpap";

interface CPAPSubmitModalProps {
  cpap: CPAP;
  open: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  isResubmission?: boolean;
}

export function CPAPSubmitModal({
  cpap,
  open,
  onClose,
  onSubmit,
  isResubmission = false,
}: CPAPSubmitModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit();
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Group items by timeline
  const shortTermItems = cpap.items.filter(item => {
    const start = new Date(item.timeline_start);
    const end = new Date(item.timeline_end);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30); // months
    return duration <= 3;
  });

  const mediumTermItems = cpap.items.filter(item => {
    const start = new Date(item.timeline_start);
    const end = new Date(item.timeline_end);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return duration > 3 && duration <= 12;
  });

  const longTermItems = cpap.items.filter(item => {
    const start = new Date(item.timeline_start);
    const end = new Date(item.timeline_end);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return duration > 12;
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-500" />
            {isResubmission ? "Resubmit CPAP for Review" : "Submit CPAP for Review"}
          </DialogTitle>
          <DialogDescription>
            {isResubmission
              ? "Review your updated CPAP before resubmitting to DILG for approval"
              : "Review your CPAP before submitting to DILG for approval"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* CPAP Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-blue-900">Barangay</p>
                <p className="text-base font-semibold text-blue-950">
                  {cpap.barangay?.barangay_name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Survey Cycle</p>
                <p className="text-base font-semibold text-blue-950">
                  {cpap.cycle?.name} - {cpap.cycle?.year}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Total Action Items</p>
                <p className="text-base font-semibold text-blue-950">
                  {cpap.items.length}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Last Updated</p>
                <p className="text-base font-semibold text-blue-950">
                  {formatDate(cpap.updated_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Comments (if resubmission) */}
          {isResubmission && cpap.admin_comments && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-900 mb-1">
                    Previous Feedback from DILG
                  </h4>
                  <p className="text-sm text-orange-800">{cpap.admin_comments}</p>
                </div>
              </div>
            </div>
          )}

          {/* Items Breakdown */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Action Items Breakdown</h3>
            <div className="space-y-3">
              {/* Short-term */}
              {shortTermItems.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-700" />
                      <span className="font-medium text-green-900">Short-Term (0-3 months)</span>
                    </div>
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      {shortTermItems.length} {shortTermItems.length === 1 ? "item" : "items"}
                    </Badge>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {shortTermItems.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{item.priority_area}</span>
                      </li>
                    ))}
                    {shortTermItems.length > 3 && (
                      <li className="text-sm text-green-700 italic">
                        +{shortTermItems.length - 3} more items
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Medium-term */}
              {mediumTermItems.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-700" />
                      <span className="font-medium text-blue-900">Medium-Term (6-12 months)</span>
                    </div>
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      {mediumTermItems.length} {mediumTermItems.length === 1 ? "item" : "items"}
                    </Badge>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {mediumTermItems.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{item.priority_area}</span>
                      </li>
                    ))}
                    {mediumTermItems.length > 3 && (
                      <li className="text-sm text-blue-700 italic">
                        +{mediumTermItems.length - 3} more items
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Long-term */}
              {longTermItems.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-700" />
                      <span className="font-medium text-purple-900">Long-Term (1+ year)</span>
                    </div>
                    <Badge variant="outline" className="text-purple-700 border-purple-300">
                      {longTermItems.length} {longTermItems.length === 1 ? "item" : "items"}
                    </Badge>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {longTermItems.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="text-sm text-purple-800 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{item.priority_area}</span>
                      </li>
                    ))}
                    {longTermItems.length > 3 && (
                      <li className="text-sm text-purple-700 italic">
                        +{longTermItems.length - 3} more items
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 mb-1">Important</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Once submitted, you cannot edit the CPAP until it is reviewed</li>
                  <li>• DILG will review your action plan and may request revisions</li>
                  <li>• You will be notified when your CPAP is approved or needs changes</li>
                  {isResubmission && (
                    <li>• Make sure you've addressed all feedback from the previous review</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4 flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isResubmission ? "Resubmitting..." : "Submitting..."}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {isResubmission ? "Resubmit to DILG" : "Submit to DILG"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
