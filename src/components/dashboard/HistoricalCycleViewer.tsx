"use client";

import { useState, useEffect } from 'react';
import Card from './Card';

interface SurveyCycle {
  cycle_id: number;
  name: string;
  year: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string | null;
}

interface CycleDashboardData {
  summary: {
    total_responses: number;
    total_assignments: number;
    completed_assignments: number;
    assignment_completion_rate: number;
    total_targets: number;
    total_achieved: number;
    progress_percentage: number;
    barangays_with_data: number;
  };
  targets: any[];
  cycle_info: {
    cycle_id: number;
    is_historical: boolean;
  };
}

interface HistoricalCycleViewerProps {
  selectedCycleId?: number;
  onCycleChange?: (cycleId: number) => void;
}

export default function HistoricalCycleViewer({ 
  selectedCycleId, 
  onCycleChange 
}: HistoricalCycleViewerProps) {
  const [cycles, setCycles] = useState<SurveyCycle[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<SurveyCycle | null>(null);
  const [dashboardData, setDashboardData] = useState<CycleDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all cycles on component mount
  useEffect(() => {
    fetchCycles();
  }, []);

  // Handle cycle selection
  useEffect(() => {
    if (selectedCycleId && cycles.length > 0) {
      const cycle = cycles.find(c => c.cycle_id === selectedCycleId);
      if (cycle) {
        setSelectedCycle(cycle);
        fetchCycleDashboardData(selectedCycleId);
      }
    }
  }, [selectedCycleId, cycles]);

  const fetchCycles = async () => {
    try {
      const response = await fetch('/api/survey-cycles');
      const result = await response.json();
      
      if (result.success) {
        setCycles(result.data);
        // Auto-select the most recent non-active cycle if no cycle is selected
        if (!selectedCycleId && result.data.length > 0) {
          const historicalCycles = result.data.filter((c: SurveyCycle) => !c.is_active);
          if (historicalCycles.length > 0) {
            const mostRecent = historicalCycles[0]; // Already sorted by year desc
            setSelectedCycle(mostRecent);
            fetchCycleDashboardData(mostRecent.cycle_id);
            onCycleChange?.(mostRecent.cycle_id);
          }
        }
      } else {
        setError('Failed to fetch survey cycles');
      }
    } catch (err) {
      setError('Error loading survey cycles');
      console.error('Error fetching cycles:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCycleDashboardData = async (cycleId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/survey-cycles/${cycleId}/dashboard`);
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data.dashboard);
      } else {
        setError('Failed to fetch cycle dashboard data');
      }
    } catch (err) {
      setError('Error loading dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCycleSelect = (cycleId: number) => {
    const cycle = cycles.find(c => c.cycle_id === cycleId);
    if (cycle) {
      setSelectedCycle(cycle);
      fetchCycleDashboardData(cycleId);
      onCycleChange?.(cycleId);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading historical cycle data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const historicalCycles = cycles.filter(c => !c.is_active);

  if (historicalCycles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No historical survey cycles available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cycle Selector */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Historical Survey Cycles</h3>
          <div className="flex flex-wrap gap-2">
            {historicalCycles.map((cycle) => (
              <button
                key={cycle.cycle_id}
                onClick={() => handleCycleSelect(cycle.cycle_id)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedCycle?.cycle_id === cycle.cycle_id
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
              >
                {cycle.name} ({cycle.year})
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Selected Cycle Dashboard */}
      {selectedCycle && dashboardData && (
        <div className="space-y-6">
          {/* Cycle Info Header */}
          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedCycle.name}</h2>
                  <p className="text-gray-600">Year: {selectedCycle.year}</p>
                  {selectedCycle.start_date && selectedCycle.end_date && (
                    <p className="text-sm text-gray-500">
                      {new Date(selectedCycle.start_date).toLocaleDateString()} - {new Date(selectedCycle.end_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    Historical Data
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Dashboard Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-600">Total Responses</h4>
                <p className="text-2xl font-bold text-blue-600">{dashboardData.summary.total_responses}</p>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-600">Assignment Completion</h4>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData.summary.assignment_completion_rate}%
                </p>
                <p className="text-sm text-gray-500">
                  {dashboardData.summary.completed_assignments} / {dashboardData.summary.total_assignments}
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-600">Target Progress</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {dashboardData.summary.progress_percentage}%
                </p>
                <p className="text-sm text-gray-500">
                  {dashboardData.summary.total_achieved} / {dashboardData.summary.total_targets}
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-600">Barangays with Data</h4>
                <p className="text-2xl font-bold text-orange-600">{dashboardData.summary.barangays_with_data}</p>
              </div>
            </Card>
          </div>

          {/* Targets Breakdown */}
          {dashboardData.targets.length > 0 && (
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Survey Targets by Barangay</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Barangay</th>
                        <th className="text-right py-2">Target</th>
                        <th className="text-right py-2">Achieved</th>
                        <th className="text-right py-2">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.targets.map((target, index) => {
                        const progress = target.target_count > 0 
                          ? Math.round((target.achieved_count / target.target_count) * 100) 
                          : 0;
                        return (
                          <tr key={index} className="border-b">
                            <td className="py-2">
                              {target.barangay?.barangay_name || `Barangay ${target.barangay_id}`}
                            </td>
                            <td className="text-right py-2">{target.target_count}</td>
                            <td className="text-right py-2">{target.achieved_count || 0}</td>
                            <td className="text-right py-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                progress >= 100 ? 'bg-green-100 text-green-800' :
                                progress >= 75 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {progress}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}