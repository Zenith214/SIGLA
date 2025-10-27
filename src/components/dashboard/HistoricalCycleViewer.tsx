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

interface BarangayPerformance {
  barangay_id: number;
  barangay_name: string;
  overall_satisfaction: number;
  total_responses: number;
  service_scores: {
    [key: string]: {
      satisfaction: number;
      need_action: number;
      category: string;
    };
  };
  action_grid: {
    maintain: string[];
    opportunities: string[];
    monitor: string[];
    fix_now: string[];
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
  const [barangayPerformance, setBarangayPerformance] = useState<BarangayPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBarangayId, setSelectedBarangayId] = useState<number | null>(null);

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
        // Fetch performance data for barangays with responses
        await fetchBarangayPerformance(cycleId, result.data.dashboard);
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

  const fetchBarangayPerformance = async (cycleId: number, dashboard: CycleDashboardData) => {
    try {
      setLoadingPerformance(true);
      const performanceData: BarangayPerformance[] = [];

      // Get unique barangays from targets
      const barangaysWithData = dashboard.targets.filter(t => (t.achieved_count || 0) > 0);

      // Fetch funnel analysis for each barangay
      for (const target of barangaysWithData) {
        try {
          const response = await fetch(`/api/ml/funnel-analysis?barangayId=${target.barangay_id}&cycleId=${cycleId}`);
          if (response.ok) {
            const funnelData = await response.json();
            
            // Transform to performance data
            const serviceScores: any = {};
            const actionGrid = {
              maintain: [] as string[],
              opportunities: [] as string[],
              monitor: [] as string[],
              fix_now: [] as string[]
            };

            Object.entries(funnelData.service_scores || {}).forEach(([key, scores]: [string, any]) => {
              const satisfaction = scores.satisfaction_score || 0;
              const needAction = scores.need_action_score || 0;
              
              // Determine category using 70%/30% thresholds
              let category = 'monitor';
              if (satisfaction >= 70 && needAction <= 30) {
                category = 'maintain';
                actionGrid.maintain.push(key);
              } else if (satisfaction >= 70 && needAction > 30) {
                category = 'opportunities';
                actionGrid.opportunities.push(key);
              } else if (satisfaction < 70 && needAction <= 30) {
                category = 'monitor';
                actionGrid.monitor.push(key);
              } else if (satisfaction < 70 && needAction > 30) {
                category = 'fix_now';
                actionGrid.fix_now.push(key);
              }

              serviceScores[key] = {
                satisfaction,
                need_action: needAction,
                category
              };
            });

            performanceData.push({
              barangay_id: target.barangay_id,
              barangay_name: target.barangay?.barangay_name || `Barangay ${target.barangay_id}`,
              overall_satisfaction: funnelData.overall_satisfaction || 0,
              total_responses: funnelData.total_responses || 0,
              service_scores: serviceScores,
              action_grid: actionGrid
            });
          }
        } catch (err) {
          console.error(`Error fetching performance for barangay ${target.barangay_id}:`, err);
        }
      }

      setBarangayPerformance(performanceData);
    } catch (err) {
      console.error('Error fetching barangay performance:', err);
    } finally {
      setLoadingPerformance(false);
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

          {/* Barangay Performance Overview */}
          {loadingPerformance ? (
            <Card>
              <div className="p-8 text-center">
                <div className="text-gray-500">Loading barangay performance data...</div>
              </div>
            </Card>
          ) : barangayPerformance.length > 0 ? (
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Barangay Performance Overview</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Barangay</th>
                        <th className="text-right py-2">Responses</th>
                        <th className="text-right py-2">Satisfaction</th>
                        <th className="text-center py-2">Action Grid</th>
                        <th className="text-center py-2">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {barangayPerformance.map((perf) => {
                        const isHighSatisfaction = perf.overall_satisfaction >= 70;
                        return (
                          <tr key={perf.barangay_id} className="border-b hover:bg-gray-50">
                            <td className="py-3 font-medium">{perf.barangay_name}</td>
                            <td className="text-right py-3">{perf.total_responses}</td>
                            <td className="text-right py-3">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                isHighSatisfaction ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {perf.overall_satisfaction}%
                              </span>
                            </td>
                            <td className="text-center py-3">
                              <div className="flex justify-center gap-1">
                                {perf.action_grid.maintain.length > 0 && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs" title="Maintain">
                                    M: {perf.action_grid.maintain.length}
                                  </span>
                                )}
                                {perf.action_grid.opportunities.length > 0 && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs" title="Opportunities">
                                    O: {perf.action_grid.opportunities.length}
                                  </span>
                                )}
                                {perf.action_grid.monitor.length > 0 && (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs" title="Monitor">
                                    Mo: {perf.action_grid.monitor.length}
                                  </span>
                                )}
                                {perf.action_grid.fix_now.length > 0 && (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs" title="Fix Now">
                                    F: {perf.action_grid.fix_now.length}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="text-center py-3">
                              <button
                                onClick={() => setSelectedBarangayId(perf.barangay_id)}
                                className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          ) : null}

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
                        // Handle both column naming conventions
                        const targetCount = target.target_count || target.target || 0;
                        const achievedCount = target.achieved_count || target.achieved || 0;
                        const progress = targetCount > 0 
                          ? Math.round((achievedCount / targetCount) * 100) 
                          : 0;
                        return (
                          <tr key={index} className="border-b">
                            <td className="py-2">
                              {target.barangay?.barangay_name || `Barangay ${target.barangay_id}`}
                            </td>
                            <td className="text-right py-2">{targetCount}</td>
                            <td className="text-right py-2">{achievedCount}</td>
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

          {/* Barangay Detail Modal */}
          {selectedBarangayId && (
            <BarangayDetailModal
              barangay={barangayPerformance.find(p => p.barangay_id === selectedBarangayId)!}
              cycleId={selectedCycle.cycle_id}
              cycleName={selectedCycle.name}
              onClose={() => setSelectedBarangayId(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Barangay Detail Modal Component
interface BarangayDetailModalProps {
  barangay: BarangayPerformance;
  cycleId: number;
  cycleName: string;
  onClose: () => void;
}

function BarangayDetailModal({ barangay, cycleId, cycleName, onClose }: BarangayDetailModalProps) {
  const serviceNames: { [key: string]: string } = {
    financial: 'Financial Administration',
    disaster: 'Disaster Preparedness',
    safety: 'Safety & Peace Order',
    social: 'Social Protection',
    business: 'Business Friendliness',
    environmental: 'Environmental Management'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{barangay.barangay_name}</h2>
            <p className="text-sm text-gray-600">{cycleName} - Historical Data</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overall Satisfaction */}
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Overall Satisfaction</div>
            <div className={`text-4xl font-bold ${
              barangay.overall_satisfaction >= 70 ? 'text-green-600' : 'text-red-600'
            }`}>
              {barangay.overall_satisfaction}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Based on {barangay.total_responses} responses
            </div>
          </div>

          {/* Action Grid */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Action Priority Matrix</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Maintain */}
              <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4">
                <div className="text-center mb-2">
                  <h4 className="text-green-800 font-bold">MAINTAIN</h4>
                  <p className="text-xs text-green-600">High Satisfaction, Low Need</p>
                </div>
                <div className="space-y-1">
                  {barangay.action_grid.maintain.length > 0 ? (
                    barangay.action_grid.maintain.map(key => (
                      <div key={key} className="text-sm text-green-800 bg-green-50 px-2 py-1 rounded">
                        • {serviceNames[key] || key}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-green-600 italic text-center">No services</div>
                  )}
                </div>
              </div>

              {/* Opportunities */}
              <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4">
                <div className="text-center mb-2">
                  <h4 className="text-blue-800 font-bold">OPPORTUNITIES</h4>
                  <p className="text-xs text-blue-600">High Satisfaction, High Need</p>
                </div>
                <div className="space-y-1">
                  {barangay.action_grid.opportunities.length > 0 ? (
                    barangay.action_grid.opportunities.map(key => (
                      <div key={key} className="text-sm text-blue-800 bg-blue-50 px-2 py-1 rounded">
                        • {serviceNames[key] || key}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-blue-600 italic text-center">No services</div>
                  )}
                </div>
              </div>

              {/* Monitor */}
              <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4">
                <div className="text-center mb-2">
                  <h4 className="text-yellow-800 font-bold">MONITOR</h4>
                  <p className="text-xs text-yellow-600">Low Satisfaction, Low Need</p>
                </div>
                <div className="space-y-1">
                  {barangay.action_grid.monitor.length > 0 ? (
                    barangay.action_grid.monitor.map(key => (
                      <div key={key} className="text-sm text-yellow-800 bg-yellow-50 px-2 py-1 rounded">
                        • {serviceNames[key] || key}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-yellow-600 italic text-center">No services</div>
                  )}
                </div>
              </div>

              {/* Fix Now */}
              <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4">
                <div className="text-center mb-2">
                  <h4 className="text-red-800 font-bold">FIX NOW</h4>
                  <p className="text-xs text-red-600">Low Satisfaction, High Need</p>
                </div>
                <div className="space-y-1">
                  {barangay.action_grid.fix_now.length > 0 ? (
                    barangay.action_grid.fix_now.map(key => (
                      <div key={key} className="text-sm text-red-800 bg-red-50 px-2 py-1 rounded">
                        • {serviceNames[key] || key}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-red-600 italic text-center">No services</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Service Area Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Service Area Performance</h3>
            <div className="space-y-2">
              {Object.entries(barangay.service_scores).map(([key, scores]) => (
                <div key={key} className="border rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{serviceNames[key] || key}</div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        <span className="text-gray-600">Satisfaction:</span>
                        <span className={`ml-1 font-semibold ${
                          scores.satisfaction >= 70 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {scores.satisfaction}%
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Need Action:</span>
                        <span className={`ml-1 font-semibold ${
                          scores.need_action > 30 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {scores.need_action}%
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        scores.category === 'maintain' ? 'bg-green-100 text-green-800' :
                        scores.category === 'opportunities' ? 'bg-blue-100 text-blue-800' :
                        scores.category === 'monitor' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {scores.category.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}