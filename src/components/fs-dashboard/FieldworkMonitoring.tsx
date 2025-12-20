"use client";

import { useState, useEffect } from "react";
import { useActiveCycle } from "@/hooks/useSurveyCycle";
import ProgressMap from "./ProgressMap";
import FIPerformanceTable from "./FIPerformanceTable";
import GPSVerificationMonitor from "./GPSVerificationMonitor";
import GPSThresholdSettings from "./GPSThresholdSettings";
import { Loader2, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SpotData {
  spotId: number;
  spotName: string;
  barangayName: string;
  status: "Pending" | "In_Progress" | "Completed" | "Flagged";
  startingPoint: { lat: number; lng: number };
  assignedFI: string | null;
  assignedFIId: number | null;
  completedCount: number;
  totalCount: number;
  inProgressCount: number;
  flaggedCount: number;
  questionnaires: Array<{
    questionnaireId: string;
    status: string;
    visitCount: number;
  }>;
}

interface FIPerformance {
  fiId: number;
  name: string;
  email: string;
  assignedSpots: number;
  completedInterviews: number;
  inProgress: number;
  callbacks: number;
  flaggedForSubstitution: number;
  totalInterviews: number;
  completionRate: number;
}

interface MonitoringData {
  cycleId: number;
  cycleName: string;
  spots: SpotData[];
  fieldInterviewers: FIPerformance[];
  summary: {
    totalSpots: number;
    assignedSpots: number;
    unassignedSpots: number;
    completedSpots: number;
    totalInterviews: number;
    completedInterviews: number;
    totalFIs: number;
  };
}

export default function FieldworkMonitoring() {
  const { activeCycle, hasActiveCycle, loading: cycleLoading } = useActiveCycle();
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Fetch monitoring data
  const fetchMonitoringData = async () => {
    if (!activeCycle) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/fs/monitoring?cycleId=${activeCycle.cycle_id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch monitoring data");
      }

      const data = await response.json();
      setMonitoringData(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Error fetching monitoring data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch monitoring data");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and auto-refresh every 30 seconds
  useEffect(() => {
    if (hasActiveCycle && activeCycle) {
      fetchMonitoringData();

      // Set up auto-refresh
      const interval = setInterval(() => {
        fetchMonitoringData();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [hasActiveCycle, activeCycle]);

  // Manual refresh
  const handleRefresh = () => {
    fetchMonitoringData();
  };

  if (cycleLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-lg shadow-sm">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasActiveCycle) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-lg shadow-sm">
        <div className="text-center p-6">
          <p className="text-gray-600 mb-2">No active survey cycle</p>
          <p className="text-sm text-gray-500">
            Please set an active cycle to view monitoring data
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-lg shadow-sm">
        <div className="text-center p-6">
          <p className="text-red-600 mb-2">Error loading monitoring data</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto">
      {/* Header with summary and refresh */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Fieldwork Monitoring</h2>
            <p className="text-sm text-gray-600">
              {activeCycle?.name || "Active Cycle"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {lastRefresh && (
              <span className="text-xs text-gray-500">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary cards */}
        {monitoringData && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-medium mb-1">Total Spots</p>
              <p className="text-2xl font-bold text-blue-900">{monitoringData.summary.totalSpots}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-600 font-medium mb-1">Assigned</p>
              <p className="text-2xl font-bold text-green-900">{monitoringData.summary.assignedSpots}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 font-medium mb-1">Unassigned</p>
              <p className="text-2xl font-bold text-gray-900">{monitoringData.summary.unassignedSpots}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3">
              <p className="text-xs text-emerald-600 font-medium mb-1">Completed</p>
              <p className="text-2xl font-bold text-emerald-900">{monitoringData.summary.completedSpots}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-purple-600 font-medium mb-1">Interviews</p>
              <p className="text-2xl font-bold text-purple-900">
                {monitoringData.summary.completedInterviews}/{monitoringData.summary.totalInterviews}
              </p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3">
              <p className="text-xs text-indigo-600 font-medium mb-1">Field Staff</p>
              <p className="text-2xl font-bold text-indigo-900">{monitoringData.summary.totalFIs}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-xs text-amber-600 font-medium mb-1">Progress</p>
              <p className="text-2xl font-bold text-amber-900">
                {monitoringData.summary.totalInterviews > 0
                  ? Math.round((monitoringData.summary.completedInterviews / monitoringData.summary.totalInterviews) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs for different views */}
      <div className="flex-1">
        <Tabs defaultValue="overview" className="flex flex-col">
          <TabsList className="grid w-full grid-cols-4 bg-white rounded-lg shadow-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">FI Performance</TabsTrigger>
            <TabsTrigger value="gps-verification">GPS Verification</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab - Map and Performance */}
          <TabsContent value="overview" className="flex-1 mt-4 min-h-0">
            <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Progress Map */}
              <div className="h-full min-h-[400px]">
                <ProgressMap
                  spots={monitoringData?.spots || []}
                  loading={loading}
                />
              </div>

              {/* Performance Table */}
              <div className="h-full min-h-[400px] overflow-auto">
                <FIPerformanceTable
                  fieldInterviewers={monitoringData?.fieldInterviewers || []}
                  loading={loading}
                />
              </div>
            </div>
          </TabsContent>

          {/* Performance Tab - Full width table */}
          <TabsContent value="performance" className="flex-1 mt-4 min-h-0">
            <div className="h-full overflow-auto">
              <FIPerformanceTable
                fieldInterviewers={monitoringData?.fieldInterviewers || []}
                loading={loading}
              />
            </div>
          </TabsContent>

          {/* GPS Verification Tab */}
          <TabsContent value="gps-verification" className="mt-4">
            {activeCycle && (
              <GPSVerificationMonitor
                cycleId={activeCycle.cycle_id}
                loading={loading}
              />
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="flex-1 mt-4 min-h-0">
            <div className="max-w-3xl">
              <GPSThresholdSettings
                onThresholdChange={(threshold) => {
                  console.log("GPS threshold updated to:", threshold);
                  // Optionally refresh monitoring data
                  fetchMonitoringData();
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
