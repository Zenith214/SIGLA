"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2 } from "lucide-react";
import type { CPAPItem, ProgressUpdate } from "@/types/cpap";

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
        {lastUpdated && (
          <div className="text-sm text-gray-500">
            Last updated: {formatDate(lastUpdated)}
          </div>
        )}
      </div>

      {/* Progress Items */}
      <div className="space-y-6">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="bg-white border rounded-lg p-6 space-y-4"
          >
            {/* Item Header (Read-only) */}
            <div className="pb-4 border-b">
              <div className="flex items-start gap-3 mb-3">
                <Badge variant="outline">#{index + 1}</Badge>
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
                <Input
                  id={`accomplishment_status_${item.id}`}
                  value={progressData[item.id]?.accomplishment_status || ""}
                  onChange={(e) =>
                    handleChange(item.id, "accomplishment_status", e.target.value)
                  }
                  placeholder="e.g., Completed, In Progress, Delayed"
                />
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
        ))}
      </div>

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
