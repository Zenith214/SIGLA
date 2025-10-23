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

interface TrendDataPoint {
  cycle: SurveyCycle;
  responses: number;
  completion_rate: number;
  target_progress: number;
  barangays_covered: number;
}

export default function HistoricalTrendAnalysis() {
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'responses' | 'completion_rate' | 'target_progress' | 'barangays_covered'>('responses');

  useEffect(() => {
    fetchTrendData();
  }, []);

  const fetchTrendData = async () => {
    try {
      setLoading(true);
      
      // First get all cycles
      const cyclesResponse = await fetch('/api/survey-cycles');
      const cyclesResult = await cyclesResponse.json();
      
      if (!cyclesResult.success) {
        throw new Error('Failed to fetch cycles');
      }

      const cycles = cyclesResult.data;
      
      // Fetch dashboard data for each cycle
      const trendPromises = cycles.map(async (cycle: SurveyCycle) => {
        try {
          const dashboardResponse = await fetch(`/api/survey-cycles/${cycle.cycle_id}/dashboard`);
          const dashboardResult = await dashboardResponse.json();
          
          if (dashboardResult.success) {
            const data = dashboardResult.data.dashboard;
            return {
              cycle,
              responses: data.summary.total_responses,
              completion_rate: data.summary.assignment_completion_rate,
              target_progress: data.summary.progress_percentage,
              barangays_covered: data.summary.barangays_with_data
            };
          }
          return null;
        } catch (err) {
          console.warn(`Failed to fetch data for cycle ${cycle.cycle_id}:`, err);
          return null;
        }
      });

      const results = await Promise.all(trendPromises);
      const validResults = results.filter(result => result !== null) as TrendDataPoint[];
      
      // Sort by year
      validResults.sort((a, b) => a.cycle.year - b.cycle.year);
      
      setTrendData(validResults);
    } catch (err) {
      setError('Error loading trend data');
      console.error('Error fetching trend data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMetricValue = (dataPoint: TrendDataPoint, metric: string): number => {
    switch (metric) {
      case 'responses':
        return dataPoint.responses;
      case 'completion_rate':
        return dataPoint.completion_rate;
      case 'target_progress':
        return dataPoint.target_progress;
      case 'barangays_covered':
        return dataPoint.barangays_covered;
      default:
        return 0;
    }
  };

  const getMetricLabel = (metric: string): string => {
    switch (metric) {
      case 'responses':
        return 'Survey Responses';
      case 'completion_rate':
        return 'Assignment Completion Rate (%)';
      case 'target_progress':
        return 'Target Progress (%)';
      case 'barangays_covered':
        return 'Barangays with Data';
      default:
        return '';
    }
  };

  const calculateTrendDirection = (data: TrendDataPoint[], metric: string): 'up' | 'down' | 'stable' => {
    if (data.length < 2) return 'stable';
    
    const values = data.map(d => getMetricValue(d, metric));
    const first = values[0];
    const last = values[values.length - 1];
    
    if (last > first * 1.1) return 'up';
    if (last < first * 0.9) return 'down';
    return 'stable';
  };

  const calculateAverageGrowth = (data: TrendDataPoint[], metric: string): number => {
    if (data.length < 2) return 0;
    
    const values = data.map(d => getMetricValue(d, metric));
    let totalGrowth = 0;
    let validPairs = 0;
    
    for (let i = 1; i < values.length; i++) {
      if (values[i - 1] > 0) {
        const growth = ((values[i] - values[i - 1]) / values[i - 1]) * 100;
        totalGrowth += growth;
        validPairs++;
      }
    }
    
    return validPairs > 0 ? totalGrowth / validPairs : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading trend analysis...</div>
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

  if (trendData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No trend data available</div>
      </div>
    );
  }

  const currentMetricData = trendData.map(d => getMetricValue(d, selectedMetric));
  const maxValue = Math.max(...currentMetricData);
  const minValue = Math.min(...currentMetricData);
  const trendDirection = calculateTrendDirection(trendData, selectedMetric);
  const averageGrowth = calculateAverageGrowth(trendData, selectedMetric);

  return (
    <div className="space-y-6">
      {/* Metric Selector */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Historical Trend Analysis</h3>
          <div className="flex flex-wrap gap-2">
            {(['responses', 'completion_rate', 'target_progress', 'barangays_covered'] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedMetric === metric
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
              >
                {getMetricLabel(metric)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Trend Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl mb-2">
              {trendDirection === 'up' ? '📈' : trendDirection === 'down' ? '📉' : '➡️'}
            </div>
            <div className="text-sm font-medium text-gray-600">Overall Trend</div>
            <div className={`text-lg font-bold ${
              trendDirection === 'up' ? 'text-green-600' : 
              trendDirection === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trendDirection === 'up' ? 'Improving' : 
               trendDirection === 'down' ? 'Declining' : 'Stable'}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 text-center">
            <div className="text-sm font-medium text-gray-600">Average Growth</div>
            <div className={`text-2xl font-bold ${
              averageGrowth > 0 ? 'text-green-600' : 
              averageGrowth < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {averageGrowth > 0 ? '+' : ''}{averageGrowth.toFixed(1)}%
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 text-center">
            <div className="text-sm font-medium text-gray-600">Highest Value</div>
            <div className="text-2xl font-bold text-blue-600">{maxValue}</div>
            <div className="text-xs text-gray-500">
              {trendData.find(d => getMetricValue(d, selectedMetric) === maxValue)?.cycle.name}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 text-center">
            <div className="text-sm font-medium text-gray-600">Lowest Value</div>
            <div className="text-2xl font-bold text-orange-600">{minValue}</div>
            <div className="text-xs text-gray-500">
              {trendData.find(d => getMetricValue(d, selectedMetric) === minValue)?.cycle.name}
            </div>
          </div>
        </Card>
      </div>

      {/* Trend Chart (Simple Bar Chart) */}
      <Card>
        <div className="p-4">
          <h4 className="text-lg font-semibold mb-4">{getMetricLabel(selectedMetric)} Over Time</h4>
          <div className="space-y-3">
            {trendData.map((dataPoint, index) => {
              const value = getMetricValue(dataPoint, selectedMetric);
              const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
              
              return (
                <div key={dataPoint.cycle.cycle_id} className="flex items-center space-x-4">
                  <div className="w-24 text-sm font-medium">
                    {dataPoint.cycle.year}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                        <div
                          className={`h-6 rounded-full transition-all duration-300 ${
                            dataPoint.cycle.is_active ? 'bg-blue-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                          {value}
                        </div>
                      </div>
                      <div className="w-32 text-sm text-gray-600">
                        {dataPoint.cycle.name}
                        {dataPoint.cycle.is_active && (
                          <span className="ml-1 text-blue-600">(Active)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Detailed Data Table */}
      <Card>
        <div className="p-4">
          <h4 className="text-lg font-semibold mb-4">Detailed Historical Data</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Cycle</th>
                  <th className="text-right py-2">Year</th>
                  <th className="text-right py-2">Responses</th>
                  <th className="text-right py-2">Completion Rate</th>
                  <th className="text-right py-2">Target Progress</th>
                  <th className="text-right py-2">Barangays</th>
                </tr>
              </thead>
              <tbody>
                {trendData.map((dataPoint) => (
                  <tr key={dataPoint.cycle.cycle_id} className="border-b">
                    <td className="py-2">
                      <div className="flex items-center space-x-2">
                        <span>{dataPoint.cycle.name}</span>
                        {dataPoint.cycle.is_active && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-2">{dataPoint.cycle.year}</td>
                    <td className="text-right py-2 font-medium">{dataPoint.responses}</td>
                    <td className="text-right py-2">{dataPoint.completion_rate}%</td>
                    <td className="text-right py-2">{dataPoint.target_progress}%</td>
                    <td className="text-right py-2">{dataPoint.barangays_covered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}