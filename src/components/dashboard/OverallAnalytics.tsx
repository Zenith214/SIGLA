"use client";

import { useState, useEffect } from 'react';
import Card from './Card';

interface SystemStats {
  total_cycles: number;
  total_barangays: number;
  total_responses: number;
  total_awardees: number;
  average_satisfaction: number;
  cycles_completed: number;
}

interface BarangayOverallPerformance {
  barangay_id: number;
  barangay_name: string;
  cycles_participated: number;
  total_responses: number;
  average_satisfaction: number;
  latest_satisfaction: number;
  trend: 'improving' | 'declining' | 'stable' | 'new';
  satisfaction_change: number;
  best_cycle: string;
  worst_cycle: string;
}

interface ServiceAreaTrend {
  service_area: string;
  service_name: string;
  average_satisfaction: number;
  cycles_tracked: number;
  trend: 'improving' | 'declining' | 'stable';
  change_percentage: number;
}

export default function OverallAnalytics() {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [barangayPerformance, setBarangayPerformance] = useState<BarangayOverallPerformance[]>([]);
  const [serviceAreaTrends, setServiceAreaTrends] = useState<ServiceAreaTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'satisfaction' | 'responses' | 'trend'>('satisfaction');
  const [filterTrend, setFilterTrend] = useState<'all' | 'improving' | 'declining' | 'stable'>('all');

  useEffect(() => {
    fetchOverallAnalytics();
  }, []);

  const fetchOverallAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch system-wide statistics
      const statsResponse = await fetch('/api/analytics/system-stats');
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setSystemStats(stats);
      }

      // Fetch barangay overall performance
      const performanceResponse = await fetch('/api/analytics/barangay-overall-performance');
      if (performanceResponse.ok) {
        const performance = await performanceResponse.json();
        setBarangayPerformance(performance);
      }

      // Fetch service area trends
      const trendsResponse = await fetch('/api/analytics/service-area-trends');
      if (trendsResponse.ok) {
        const trends = await trendsResponse.json();
        setServiceAreaTrends(trends);
      }

    } catch (err) {
      console.error('Error fetching overall analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading overall analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  // Sort and filter barangays
  let filteredBarangays = [...barangayPerformance];
  if (filterTrend !== 'all') {
    filteredBarangays = filteredBarangays.filter(b => b.trend === filterTrend);
  }

  filteredBarangays.sort((a, b) => {
    switch (sortBy) {
      case 'satisfaction':
        return b.average_satisfaction - a.average_satisfaction;
      case 'responses':
        return b.total_responses - a.total_responses;
      case 'trend':
        return b.satisfaction_change - a.satisfaction_change;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* System-Wide Statistics */}
      {systemStats && (
        <div>
          <h3 className="text-lg font-semibold mb-4">System-Wide Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <div className="p-4">
                <div className="text-sm text-gray-600 mb-1">Total Cycles</div>
                <div className="text-2xl font-bold text-blue-600">{systemStats.total_cycles}</div>
                <div className="text-xs text-gray-500">{systemStats.cycles_completed} completed</div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="text-sm text-gray-600 mb-1">Total Barangays</div>
                <div className="text-2xl font-bold text-purple-600">{systemStats.total_barangays}</div>
                <div className="text-xs text-gray-500">{systemStats.total_awardees} awardees</div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="text-sm text-gray-600 mb-1">Total Responses</div>
                <div className="text-2xl font-bold text-green-600">{systemStats.total_responses.toLocaleString()}</div>
                <div className="text-xs text-gray-500">All cycles</div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="text-sm text-gray-600 mb-1">Avg Satisfaction</div>
                <div className={`text-2xl font-bold ${
                  systemStats.average_satisfaction >= 70 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {systemStats.average_satisfaction}%
                </div>
                <div className="text-xs text-gray-500">System-wide</div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="text-sm text-gray-600 mb-1">Avg per Cycle</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {Math.round(systemStats.total_responses / systemStats.cycles_completed)}
                </div>
                <div className="text-xs text-gray-500">Responses</div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="text-sm text-gray-600 mb-1">Participation</div>
                <div className="text-2xl font-bold text-teal-600">
                  {Math.round((systemStats.total_awardees / systemStats.total_barangays) * 100)}%
                </div>
                <div className="text-xs text-gray-500">Awardee rate</div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Service Area Trends */}
      {serviceAreaTrends.length > 0 && (
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Service Area Performance Trends</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceAreaTrends.map((service) => (
                <div key={service.service_area} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{service.service_name}</div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      service.trend === 'improving' ? 'bg-green-100 text-green-800' :
                      service.trend === 'declining' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {service.trend === 'improving' ? '↑' : service.trend === 'declining' ? '↓' : '→'} 
                      {service.trend}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-2xl font-bold ${
                        service.average_satisfaction >= 70 ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {service.average_satisfaction}%
                      </div>
                      <div className="text-xs text-gray-500">Avg satisfaction</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        service.change_percentage > 0 ? 'text-green-600' :
                        service.change_percentage < 0 ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {service.change_percentage > 0 ? '+' : ''}{service.change_percentage}%
                      </div>
                      <div className="text-xs text-gray-500">{service.cycles_tracked} cycles</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Barangay Overall Performance */}
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Barangay Overall Performance</h3>
            <div className="flex gap-2">
              {/* Filter by Trend */}
              <select
                value={filterTrend}
                onChange={(e) => setFilterTrend(e.target.value as any)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="all">All Trends</option>
                <option value="improving">Improving</option>
                <option value="declining">Declining</option>
                <option value="stable">Stable</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="satisfaction">Sort by Satisfaction</option>
                <option value="responses">Sort by Responses</option>
                <option value="trend">Sort by Trend</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-2">Rank</th>
                  <th className="text-left py-3 px-2">Barangay</th>
                  <th className="text-center py-3 px-2">Cycles</th>
                  <th className="text-center py-3 px-2">Responses</th>
                  <th className="text-center py-3 px-2">Avg Satisfaction</th>
                  <th className="text-center py-3 px-2">Latest</th>
                  <th className="text-center py-3 px-2">Trend</th>
                  <th className="text-center py-3 px-2">Change</th>
                </tr>
              </thead>
              <tbody>
                {filteredBarangays.map((barangay, index) => (
                  <tr key={barangay.barangay_id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 text-center">
                      <span className={`font-bold ${
                        index === 0 ? 'text-yellow-600' :
                        index === 1 ? 'text-gray-500' :
                        index === 2 ? 'text-orange-600' :
                        'text-gray-700'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-medium">{barangay.barangay_name}</td>
                    <td className="text-center py-3 px-2">{barangay.cycles_participated}</td>
                    <td className="text-center py-3 px-2">{barangay.total_responses}</td>
                    <td className="text-center py-3 px-2">
                      <span className={`px-2 py-1 rounded font-semibold ${
                        barangay.average_satisfaction >= 70 ? 'bg-green-100 text-green-800' :
                        barangay.average_satisfaction >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {barangay.average_satisfaction}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        barangay.latest_satisfaction >= 70 ? 'bg-green-50 text-green-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {barangay.latest_satisfaction}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        barangay.trend === 'improving' ? 'bg-green-100 text-green-800' :
                        barangay.trend === 'declining' ? 'bg-red-100 text-red-800' :
                        barangay.trend === 'new' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {barangay.trend === 'improving' ? '↑ Improving' :
                         barangay.trend === 'declining' ? '↓ Declining' :
                         barangay.trend === 'new' ? '🆕 New' :
                         '→ Stable'}
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      {barangay.trend !== 'new' && (
                        <span className={`font-semibold ${
                          barangay.satisfaction_change > 0 ? 'text-green-600' :
                          barangay.satisfaction_change < 0 ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {barangay.satisfaction_change > 0 ? '+' : ''}{barangay.satisfaction_change}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBarangays.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No barangays match the selected filter
            </div>
          )}
        </div>
      </Card>

      {/* Performance Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Performance Distribution</h3>
            <div className="space-y-3">
              {[
                { label: 'Excellent (≥80%)', count: barangayPerformance.filter(b => b.average_satisfaction >= 80).length, color: 'bg-green-500' },
                { label: 'Good (70-79%)', count: barangayPerformance.filter(b => b.average_satisfaction >= 70 && b.average_satisfaction < 80).length, color: 'bg-blue-500' },
                { label: 'Fair (60-69%)', count: barangayPerformance.filter(b => b.average_satisfaction >= 60 && b.average_satisfaction < 70).length, color: 'bg-yellow-500' },
                { label: 'Poor (<60%)', count: barangayPerformance.filter(b => b.average_satisfaction < 60).length, color: 'bg-red-500' }
              ].map((category) => {
                const percentage = barangayPerformance.length > 0 
                  ? Math.round((category.count / barangayPerformance.length) * 100) 
                  : 0;
                return (
                  <div key={category.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{category.label}</span>
                      <span className="font-semibold">{category.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${category.color}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Trend Distribution</h3>
            <div className="space-y-3">
              {[
                { label: 'Improving', count: barangayPerformance.filter(b => b.trend === 'improving').length, color: 'bg-green-500' },
                { label: 'Stable', count: barangayPerformance.filter(b => b.trend === 'stable').length, color: 'bg-gray-500' },
                { label: 'Declining', count: barangayPerformance.filter(b => b.trend === 'declining').length, color: 'bg-red-500' },
                { label: 'New', count: barangayPerformance.filter(b => b.trend === 'new').length, color: 'bg-blue-500' }
              ].map((category) => {
                const percentage = barangayPerformance.length > 0 
                  ? Math.round((category.count / barangayPerformance.length) * 100) 
                  : 0;
                return (
                  <div key={category.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{category.label}</span>
                      <span className="font-semibold">{category.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${category.color}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
