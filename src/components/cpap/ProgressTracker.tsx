"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import type { CPAPItem, ProgressUpdate } from "@/types/cpap";

const ITEMS_PER_PAGE = 5;

const STATUS_OPTIONS = [
  { value: "Not Started", label: "Not Started", progress: 0 },
  { value: "In Progress", label: "In Progress", progress: 50 },
  { value: "Delayed", label: "Delayed", progress: 25 },
  { value: "Completed", label: "Completed", progress: 100 },
] as const;

interface ProgressTrackerProps {
  items: CPAPItem[];
  onSaveProgress: (updates: ProgressUpdate[]) => void;
  isSaving: boolean;
  lastUpdated?: string;
}

export function ProgressTracker({
  items,
  onSaveProgress,
  isSaving,
  lastUpdated,
}: ProgressTrackerProps) {
  const [progressData, setProgressData] = useState<Record<number, ProgressUpdate>>(
    () => {
      const initial: Record<number, ProgressUpdate> = {};
      items.forEach((item) => {
        initial[item.id] = {
          id: item.id,
          actual_output: item.actual_output || "",
          accomplishment_status: item.accomplishment_status || "",
          remarks: item.remarks || "",
        };
      });
      return initial;
    }
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination calculations
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = items.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (
    itemId: number,
    field: keyof ProgressUpdate,
    value: string
  ) => {
    setProgressData((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    const updates = Object.values(progressData);
    onSaveProgress(updates);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const hasChanges = () => {
    return items.some((item) => {
      const current = progressData[item.id];
      return (
        current.actual_output !== (item.actual_output || "") ||
        current.accomplishment_status !== (item.accomplishment_status || "") ||
        current.remarks !== (item.remarks || "")
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Progress Tracking
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Update the progress of your approved action items
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <div className="text-sm text-gray-500">
              Last updated: {formatDate(lastUpdated)}
            </div>
          )}
          {totalPages > 1 && (
            <Badge variant="outline">
              Page {currentPage} of {totalPages}
            </Badge>
          )}
        </div>
      </div>

      {/* Item count */}
      <div className="text-sm text-gray-600">
        {items.length} {items.length === 1 ? "action item" : "action items"} to track
      </div>

      {/* Progress Items */}
      <div className="space-y-6">
        {currentItems.map((item, index) => {
          const globalIndex = startIndex + index;
          return (
            <div
              key={item.id}
              className="bg-white border rounded-lg p-6 space-y-4"
            >
              {/* Item Header (Read-only) */}
              <div className="pb-4 border-b">
                <div className="flex items-start gap-3 mb-3">
                  <Badge variant="outline">#{globalIndex + 1}</Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.priority_area}
                    </h3>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">
                      Target Output:
                    </span>{" "}
                    <span className="text-gray-600">{item.target_output}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Success Indicator:
                    </span>{" "}
                    <span className="text-gray-600">{item.success_indicator}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Responsible Person:
                    </span>{" "}
                    <span className="text-gray-600">{item.responsible_person}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(item.timeline_start)} -{" "}
                      {formatDate(item.timeline_end)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Fields (Editable) */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`actual_output_${item.id}`}>
                    Actual Output
                  </Label>
                  <Textarea
                    id={`actual_output_${item.id}`}
                    value={progressData[item.id]?.actual_output || ""}
                    onChange={(e) =>
                      handleChange(item.id, "actual_output", e.target.value)
                    }
                    placeholder="Describe what has been accomplished"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor={`accomplishment_status_${item.id}`}>
                    Accomplishment Status
                  </Label>
                  <Select
                    value={progressData[item.id]?.accomplishment_status || ""}
                    onValueChange={(value) =>
                      handleChange(item.id, "accomplishment_status", value)
                    }
                  >
                    <SelectTrigger id={`accomplishment_status_${item.id}`}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{option.label}</span>
                            <span className="text-xs text-gray-500 ml-4">
                              ({option.progress}%)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Progress: Not Started (0%), In Progress (50%), Delayed (25%), Completed (100%)
                  </p>
                </div>

                <div>
                  <Label htmlFor={`remarks_${item.id}`}>Remarks</Label>
                  <Textarea
                    id={`remarks_${item.id}`}
                    value={progressData[item.id]?.remarks || ""}
                    onChange={(e) =>
                      handleChange(item.id, "remarks", e.target.value)
                    }
                    placeholder="Additional notes or comments"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, items.length)} of {items.length} items
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

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          size="lg"
          onClick={handleSave}
          disabled={isSaving || !hasChanges()}
        >
          {isSaving ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Progress Update
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
