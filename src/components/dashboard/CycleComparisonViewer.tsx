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

interface ComparisonData {
  cycle: SurveyCycle;
  data: {
    responses: {
      total: number;
      rate_per_day: number;
    };
    assignments: {
      total: number;
      completed: number;
      completion_rate: number;
    };
    targets: {
      total: number;
      achieved: number;
      progress_rate: number;
    };
    satisfaction: {
      average: number;
      sample_size: number;
    };
  };
}

interface TrendData {
  direction: 'increasing' | 'decreasing' | 'stable';
  change_percentage: number;
  values: number[];
}

interface ComparisonResult {
  cycles: ComparisonData[];
  trends: {
    responses?: TrendData;
    assignment_completion?: TrendData;
    target_progress?: TrendData;
  };
  comparison_metrics: string[];
}

export default function CycleComparisonViewer() {
  const [cycles, setCycles] = useState<SurveyCycle[]>([]);
  const [selectedCycles, setSelectedCycles] = useState<number[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCycles();
  }, []);

  const fetchCycles = async () => {
    try {
      const response = await fetch('/api/survey-cycles');
      const result = await response.json();
      
      if (result.success) {
        setCycles(result.data);
      } else {
        setError('Failed to fetch survey cycles');
      }
    } catch (err) {
      setError('Error loading survey cycles');
      console.error('Error fetching cycles:', err);
    }
  };

  const handleCycleToggle = (cycleId: number) => {
    setSelectedCycles(prev => {
      if (prev.includes(cycleId)) {
        return prev.filter(id => id !== cycleId);
      } else if (prev.length < 5) { // Max 5 cycles
        return [...prev, cycleId];
      }
      return prev;
    });
  };

  const performComparison = async () => {
    if (selectedCycles.length < 2) {
      setError('Please select at least 2 cycles to compare');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/survey-cycles/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cycle_ids: selectedCycles,
          metrics: ['responses', 'assignments', 'progress']
        }),
      });

      const result = await response.json();
      
      console.log('[CYCLE COMPARISON] API response:', result);
      
      if (result.success) {
        console.log('[CYCLE COMPARISON] Setting comparison data:', result.data);
        console.log('[CYCLE COMPARISON] Trends:', result.data.trends);
        setComparisonData(result.data);
      } else {
        setError(result.error || 'Failed to compare cycles');
      }
    } catch (err) {
      setError('Error performing comparison');
      console.error('Error comparing cycles:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return <span className="text-green-500">↗️</span>;
      case 'decreasing':
        return <span className="text-red-500">↘️</span>;
      default:
        return <span className="text-gray-500">→</span>;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cycle Selection */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Select Cycles to Compare</h3>
          <p className="text-sm text-gray-600 mb-4">
            Choose 2-5 survey cycles to compare their performance metrics.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {cycles.map((cycle) => (
              <label
                key={cycle.cycle_id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedCycles.includes(cycle.cycle_id)
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-300 hover:border-blue-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedCycles.includes(cycle.cycle_id)}
                  onChange={() => handleCycleToggle(cycle.cycle_id)}
                  disabled={!selectedCycles.includes(cycle.cycle_id) && selectedCycles.length >= 5}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">{cycle.name}</div>
                  <div className="text-sm text-gray-500">
                    {cycle.year} {cycle.is_active && '(Active)'}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {selectedCycles.length} of 5 cycles selected
            </div>
            <button
              onClick={performComparison}
              disabled={selectedCycles.length < 2 || loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Comparing...' : 'Compare Cycles'}
            </button>
          </div>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card>
          <div className="p-4">
            <div className="text-red-600">{error}</div>
          </div>
        </Card>
      )}

      {/* Comparison Results */}
      {comparisonData && (
        <div className="space-y-6">
          {/* Trends Overview */}
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Trends Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {comparisonData.trends?.responses && (
                  <div className="text-center">
                    <div className="text-2xl mb-2">
                      {getTrendIcon(comparisonData.trends.responses.direction)}
                    </div>
                    <div className="font-medium">Survey Responses</div>
                    <div className={`text-sm ${getTrendColor(comparisonData.trends.responses.direction)}`}>
                      {comparisonData.trends.responses.change_percentage > 0 ? '+' : ''}
                      {comparisonData.trends.responses.change_percentage}%
                    </div>
                  </div>
                )}

                {comparisonData.trends?.assignment_completion && (
                  <div className="text-center">
                    <div className="text-2xl mb-2">
                      {getTrendIcon(comparisonData.trends.assignment_completion.direction)}
                    </div>
                    <div className="font-medium">Assignment Completion</div>
                    <div className={`text-sm ${getTrendColor(comparisonData.trends.assignment_completion.direction)}`}>
                      {comparisonData.trends.assignment_completion.change_percentage > 0 ? '+' : ''}
                      {comparisonData.trends.assignment_completion.change_percentage}%
                    </div>
                  </div>
                )}

                {comparisonData.trends?.target_progress && (
                  <div className="text-center">
                    <div className="text-2xl mb-2">
                      {getTrendIcon(comparisonData.trends.target_progress.direction)}
                    </div>
                    <div className="font-medium">Target Progress</div>
                    <div className={`text-sm ${getTrendColor(comparisonData.trends.target_progress.direction)}`}>
                      {comparisonData.trends.target_progress.change_percentage > 0 ? '+' : ''}
                      {comparisonData.trends.target_progress.change_percentage}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Detailed Comparison Table */}
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Detailed Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cycle</th>
                      <th className="text-right py-2">Responses</th>
                      <th className="text-right py-2">Assignments</th>
                      <th className="text-right py-2">Completion Rate</th>
                      <th className="text-right py-2">Target Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.cycles.map((cycleData, index) => (
                      <tr key={cycleData.cycle.cycle_id} className="border-b">
                        <td className="py-2">
                          <div>
                            <div className="font-medium">{cycleData.cycle.name}</div>
                            <div className="text-gray-500 text-xs">{cycleData.cycle.year}</div>
                          </div>
                        </td>
                        <td className="text-right py-2 font-medium">
                          {cycleData.data.responses.total}
                        </td>
                        <td className="text-right py-2">
                          {cycleData.data.assignments.completed} / {cycleData.data.assignments.total}
                        </td>
                        <td className="text-right py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            cycleData.data.assignments.completion_rate >= 80 ? 'bg-green-100 text-green-800' :
                            cycleData.data.assignments.completion_rate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {cycleData.data.assignments.completion_rate}%
                          </span>
                        </td>
                        <td className="text-right py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            cycleData.data.targets.progress_rate >= 80 ? 'bg-green-100 text-green-800' :
                            cycleData.data.targets.progress_rate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {cycleData.data.targets.progress_rate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Performance Insights */}
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
              <div className="space-y-3">
                {comparisonData.cycles.length > 0 && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span>Best Performing Cycle (Responses)</span>
                      <span className="font-medium">
                        {comparisonData.cycles.reduce((best, current) => 
                          current.data.responses.total > best.data.responses.total ? current : best
                        ).cycle.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span>Highest Assignment Completion</span>
                      <span className="font-medium">
                        {comparisonData.cycles.reduce((best, current) => 
                          current.data.assignments.completion_rate > best.data.assignments.completion_rate ? current : best
                        ).cycle.name} ({comparisonData.cycles.reduce((best, current) => 
                          current.data.assignments.completion_rate > best.data.assignments.completion_rate ? current : best
                        ).data.assignments.completion_rate}%)
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span>Best Target Achievement</span>
                      <span className="font-medium">
                        {comparisonData.cycles.reduce((best, current) => 
                          current.data.targets.progress_rate > best.data.targets.progress_rate ? current : best
                        ).cycle.name} ({comparisonData.cycles.reduce((best, current) => 
                          current.data.targets.progress_rate > best.data.targets.progress_rate ? current : best
                        ).data.targets.progress_rate}%)
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}