"use client";

import { useState, useEffect } from "react";
import { useActiveCycle } from "@/hooks/useSurveyCycle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Target, Users, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AssignedBarangay {
  assignment_id: number;
  barangay_id: number;
  barangay_name: string;
  status: string;
  target?: number;
  achieved?: number;
  percentage?: number;
}

interface SupervisorInfo {
  id: number;
  name: string;
  email: string;
}

export default function SupervisorOverview() {
  const { toast } = useToast();
  const { activeCycle } = useActiveCycle();
  const [loading, setLoading] = useState(true);
  const [assignedBarangays, setAssignedBarangays] = useState<AssignedBarangay[]>([]);
  const [supervisorInfo, setSupervisorInfo] = useState<SupervisorInfo | null>(null);
  const [stats, setStats] = useState({
    totalSpots: 0,
    assignedSpots: 0,
    completedSpots: 0,
    totalInterviewers: 0,
  });

  useEffect(() => {
    if (activeCycle?.cycle_id) {
      fetchAssignments();
      fetchStats();
    }
  }, [activeCycle?.cycle_id]);

  const fetchAssignments = async () => {
    if (!activeCycle?.cycle_id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/supervisor-assignments/my-barangays?cycle_id=${activeCycle.cycle_id}`);
      
      if (response.ok) {
        const data = await response.json();
        setAssignedBarangays(data.data || []);
        setSupervisorInfo(data.supervisor);
      } else if (response.status === 403) {
        // Not a supervisor - show message
        toast({
          title: "Not a Supervisor",
          description: "This view is only available for users with supervisor role.",
          variant: "destructive",
        });
      } else {
        // Log the error response for debugging
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("API Error:", response.status, errorData);
        throw new Error(errorData.error || `Failed to fetch assignments (${response.status})`);
      }
    } catch (error: any) {
      console.error("Error fetching assignments:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load your assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!activeCycle?.cycle_id) return;

    try {
      // Fetch spots for this supervisor
      const spotsResponse = await fetch(`/api/spots?cycleId=${activeCycle.cycle_id}`);
      if (spotsResponse.ok) {
        const spotsData = await spotsResponse.json();
        const spots = spotsData.spots || [];
        
        setStats({
          totalSpots: spots.length,
          assignedSpots: spots.filter((s: any) => s.assignedFiId).length,
          completedSpots: spots.filter((s: any) => s.status === "Completed").length,
          totalInterviewers: new Set(spots.map((s: any) => s.assignedFiId).filter(Boolean)).size,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (assignedBarangays.length === 0) {
    return (
      <div className="p-8">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-amber-600 mb-4" />
            <h3 className="text-xl font-semibold text-amber-900 mb-2">No Assignments Yet</h3>
            <p className="text-amber-700 mb-4">
              You have not been assigned any barangays for the current survey cycle.
            </p>
            <p className="text-sm text-amber-600">
              Please contact your administrator to assign barangays to you.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Welcome, {supervisorInfo?.name}!</h1>
          <p className="text-blue-100 text-lg">
            You are assigned to manage {assignedBarangays.length} barangay{assignedBarangays.length !== 1 ? 's' : ''} for {activeCycle?.name} ({activeCycle?.year})
          </p>
        </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned Barangays</p>
                <p className="text-3xl font-bold text-gray-900">{assignedBarangays.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spots</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalSpots}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned Spots</p>
                <p className="text-3xl font-bold text-gray-900">{stats.assignedSpots}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalSpots > 0 ? Math.round((stats.assignedSpots / stats.totalSpots) * 100) : 0}% assigned
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Field Interviewers</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalInterviewers}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Barangays */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Your Assigned Barangays
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedBarangays.map((barangay) => (
              <Card key={barangay.assignment_id} className="border-2 hover:border-blue-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{barangay.barangay_name}</h3>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {barangay.status}
                      </Badge>
                    </div>
                    <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  </div>
                  
                  {barangay.target && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Survey Target:</span>
                        <span className="font-semibold text-gray-900">{barangay.target}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Achieved:</span>
                        <span className="font-semibold text-gray-900">{barangay.achieved || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(barangay.percentage || 0, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-right">
                        {barangay.percentage || 0}% complete
                      </p>
                    </div>
                  )}
                  
                  {!barangay.target && (
                    <p className="text-sm text-gray-500 italic">No survey target set</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                const event = new CustomEvent('fs-dashboard-tab-change', { detail: 'spots' });
                window.dispatchEvent(event);
              }}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
            >
              <Target className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 mb-1">Create Spots</h3>
              <p className="text-sm text-gray-600">Set up survey spots in your assigned barangays</p>
            </button>

            <button
              onClick={() => {
                const event = new CustomEvent('fs-dashboard-tab-change', { detail: 'assignments' });
                window.dispatchEvent(event);
              }}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
            >
              <Users className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 mb-1">Assign Interviewers</h3>
              <p className="text-sm text-gray-600">Assign field interviewers to spots</p>
            </button>

            <button
              onClick={() => {
                const event = new CustomEvent('fs-dashboard-tab-change', { detail: 'monitoring' });
                window.dispatchEvent(event);
              }}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group"
            >
              <CheckCircle2 className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 mb-1">Monitor Progress</h3>
              <p className="text-sm text-gray-600">Track fieldwork progress and performance</p>
            </button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
