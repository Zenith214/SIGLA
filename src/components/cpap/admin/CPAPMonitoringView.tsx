"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, Clock, TrendingUp, Eye, Calendar } from "lucide-react";
import type { CPAPListItem, CPAPWithDetails } from "@/types/cpap";

interface CPAPMonitoringViewProps {
  cpaps: CPAPListItem[];
  onUpdate: () => void;
}

export function CPAPMonitoringView({ cpaps, onUpdate }: CPAPMonitoringViewProps) {
  const [selectedCPAP, setSelectedCPAP] = useState<CPAPWithDetails | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [cpapProgress, setCpapProgress] = useState<Record<number, number>>({});
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  // Load progress for all CPAPs on mount
  const loadAllProgress = async () => {
    if (cpaps.length === 0) return;
    
    setIsLoadingProgress(true);
    const progressData: Record<number, number> = {};
    
    try {
      // Fetch details for each CPAP to calculate progress
      await Promise.all(
        cpaps.map(async (cpap) => {
          try {
            const response = await fetch(`/api/cpap/${cpap.id}`);
            if (response.ok) {
              const data = await response.json();
              progressData[cpap.id] = calculateCPAPProgress(data.cpap);
            }
          } catch (err) {
            console.error(`Error loading progress for CPAP ${cpap.id}:`, err);
          }
        })
      );
      
      setCpapProgress(progressData);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  // Load progress when component mounts or cpaps change
  useEffect(() => {
    loadAllProgress();
  }, [cpaps.length]); // Re-run when number of CPAPs changes

  // Calculate summary metrics
  const metrics = useMemo(() => {
    const totalApproved = cpaps.length;
    const totalItems = cpaps.reduce((sum, cpap) => sum + cpap.item_count, 0);
    
    // For completion rate, we'd need to fetch detailed progress
    // For now, we'll show a placeholder
    const avgCompletionRate = 0; // This would be calculated from actual progress data

    return {
      totalApproved,
      totalItems,
      avgCompletionRate,
    };
  }, [cpaps]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTimeSinceApproval = (approvedAt: string | null) => {
    if (!approvedAt) return "—";
    
    const approved = new Date(approvedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - approved.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return "1 month ago";
    return `${diffMonths} months ago`;
  };

  const handleViewDetails = async (cpapId: number) => {
    try {
      setIsLoadingDetails(true);
      
      const response = await fetch(`/api/cpap/${cpapId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch CPAP details");
      }

      const data = await response.json();
      const cpapDetails = data.cpap;
      
      // Calculate and store progress
      const progress = calculateCPAPProgress(cpapDetails);
      setCpapProgress(prev => ({ ...prev, [cpapId]: progress }));
      
      setSelectedCPAP(cpapDetails);
      setIsDetailModalOpen(true);
    } catch (err) {
      console.error("Error fetching CPAP details:", err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCPAP(null);
  };

  const calculateItemProgress = (item: any) => {
    // Progress calculation based on accomplishment status
    const status = item.accomplishment_status?.toLowerCase().trim() || '';
    
    if (status.includes('completed') || status.includes('done') || status.includes('finished')) {
      return 100;
    } else if (status.includes('in progress') || status.includes('ongoing') || status.includes('in-progress')) {
      return 50;
    } else if (status.includes('delayed') || status.includes('behind')) {
      return 25;
    } else if (status.includes('not started') || status.includes('pending') || status === '') {
      return 0;
    }
    
    // Default: if status is filled but doesn't match known patterns, assume in progress
    return 50;
  };

  const calculateCPAPProgress = (cpap: CPAPWithDetails) => {
    if (!cpap.items || cpap.items.length === 0) return 0;
    
    const totalProgress = cpap.items.reduce((sum, item) => {
      return sum + calculateItemProgress(item);
    }, 0);

    return Math.round(totalProgress / cpap.items.length);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Approved CPAPs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalApproved}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all barangays
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Action Items</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Being implemented
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Rate</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgCompletionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Progress tracking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CPAPs List */}
      <Card>
        <CardHeader>
          <CardTitle>Approved CPAPs</CardTitle>
        </CardHeader>
        <CardContent>
          {cpaps.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No approved CPAPs yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Approved CPAPs will appear here for monitoring
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cpaps.map((cpap) => (
                <div
                  key={cpap.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {cpap.barangay_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {cpap.cycle_name}
                          </p>
                        </div>
                        <Badge variant="default" className="bg-indigo-600">
                          Approved
                        </Badge>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Action Items</p>
                          <p className="font-semibold text-gray-900">
                            {cpap.item_count}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Approved</p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(cpap.approved_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Time Since Approval</p>
                          <p className="font-semibold text-gray-900">
                            {getTimeSinceApproval(cpap.approved_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Last Updated</p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(cpap.submitted_at)}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress Tracking</span>
                          <span className="font-medium text-gray-900">
                            {cpapProgress[cpap.id] !== undefined ? `${cpapProgress[cpap.id]}%` : '—'}
                          </span>
                        </div>
                        <Progress value={cpapProgress[cpap.id] || 0} className="h-2" />
                        <p className="text-xs text-gray-500">
                          {cpapProgress[cpap.id] !== undefined 
                            ? 'Click "View Details" to see item-by-item progress'
                            : 'Click "View Details" to load progress data'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(cpap.id)}
                        disabled={isLoadingDetails}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedCPAP && (
        <Dialog open={isDetailModalOpen} onOpenChange={handleCloseModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>CPAP Progress Details</DialogTitle>
              <DialogDescription>
                Implementation progress for {selectedCPAP.barangay?.barangay_name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* CPAP Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Barangay</p>
                    <p className="text-base font-semibold text-gray-900">
                      {selectedCPAP.barangay?.barangay_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Survey Cycle</p>
                    <p className="text-base font-semibold text-gray-900">
                      {selectedCPAP.cycle?.name} - {selectedCPAP.cycle?.year}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Approved</p>
                    <p className="text-base text-gray-900">
                      {formatDate(selectedCPAP.approved_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="text-base text-gray-900">
                      {formatDate(selectedCPAP.updated_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Overall Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Overall Progress
                  </h3>
                  <span className="text-2xl font-bold text-gray-900">
                    {calculateCPAPProgress(selectedCPAP)}%
                  </span>
                </div>
                <Progress value={calculateCPAPProgress(selectedCPAP)} className="h-3" />
              </div>

              {/* Action Items Progress */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Action Items Progress
                </h3>
                <div className="space-y-4">
                  {selectedCPAP.items.map((item, index) => {
                    const itemProgress = calculateItemProgress(item);
                    return (
                      <div
                        key={item.id}
                        className="bg-white border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-0.5">
                            #{index + 1}
                          </Badge>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {item.priority_area}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {item.target_output}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-gray-900">
                              {itemProgress}%
                            </span>
                          </div>
                        </div>

                        <Progress value={itemProgress} className="h-2" />

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(item.timeline_start)} -{" "}
                            {formatDate(item.timeline_end)}
                          </span>
                        </div>

                        {/* Progress Details */}
                        {(item.actual_output || item.accomplishment_status || item.remarks) && (
                          <div className="mt-3 pt-3 border-t space-y-2">
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
                                <p className="text-sm text-gray-700">
                                  {item.accomplishment_status}
                                </p>
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

                        {!item.actual_output && !item.accomplishment_status && !item.remarks && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-gray-500 italic">
                              No progress updates yet
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={handleCloseModal}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
