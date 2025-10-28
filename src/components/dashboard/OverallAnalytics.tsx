"use client";

import { useState, useEffect } from 'react';
import Card from './Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

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

interface ImprovementVelocityRanking {
  barangay_id: number;
  barangay_name: string;
  improvement_velocity: number;
  cycles_analyzed: number;
  satisfaction_scores: number[];
  average_satisfaction: number;
  latest_satisfaction: number;
  vs_system_average: number;
}

interface AwardLeaderboardEntry {
  rank: number;
  barangay_id: number;
  name: string;
  total_awards: number;
  consecutive_streak: number;
  longest_streak: number;
  win_rate: number;
  last_award_year: number;
  years_since_last_award: number;
  first_time_winner: boolean;
  award_history: Array<{
    year: number;
    cycle_id: number;
    cycle_name: string;
  }>;
}

interface AwardHistoryData {
  year: number;
  cycle_name: string;
  winners: string[];
  award_count: number;
}

export default function OverallAnalytics() {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [barangayPerformance, setBarangayPerformance] = useState<BarangayOverallPerformance[]>([]);
  const [serviceAreaTrends, setServiceAreaTrends] = useState<ServiceAreaTrend[]>([]);
  const [awardLeaderboard, setAwardLeaderboard] = useState<AwardLeaderboardEntry[]>([]);
  const [awardHistory, setAwardHistory] = useState<AwardHistoryData[]>([]);
  const [improvementVelocityRankings, setImprovementVelocityRankings] = useState<ImprovementVelocityRanking[]>([]);
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
        
        // Calculate improvement velocity rankings
        calculateImprovementVelocity(performance);
      }

      // Fetch service area trends
      const trendsResponse = await fetch('/api/analytics/service-area-trends');
      if (trendsResponse.ok) {
        const trends = await trendsResponse.json();
        setServiceAreaTrends(trends);
      }

      // Fetch award leaderboard (top 10)
      const leaderboardResponse = await fetch('/api/analytics/award-leaderboard?limit=10&sort_by=total_awards');
      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json();
        setAwardLeaderboard(leaderboardData.leaderboard || []);
        
        // Process award history from leaderboard data
        processAwardHistory(leaderboardData.leaderboard || []);
      }

    } catch (err) {
      console.error('Error fetching overall analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processAwardHistory = (leaderboard: AwardLeaderboardEntry[]) => {
    // Aggregate awards by year
    const yearMap = new Map<number, { cycle_name: string; winners: Set<string> }>();
    
    leaderboard.forEach(entry => {
      entry.award_history?.forEach(award => {
        if (!yearMap.has(award.year)) {
          yearMap.set(award.year, {
            cycle_name: award.cycle_name,
            winners: new Set()
          });
        }
        yearMap.get(award.year)!.winners.add(entry.name);
      });
    });

    // Convert to array and sort by year
    const history: AwardHistoryData[] = Array.from(yearMap.entries())
      .map(([year, data]) => ({
        year,
        cycle_name: data.cycle_name,
        winners: Array.from(data.winners),
        award_count: data.winners.size
      }))
      .sort((a, b) => b.year - a.year)
      .slice(0, 5); // Last 5 years

    setAwardHistory(history);
  };

  const calculateImprovementVelocity = (performance: BarangayOverallPerformance[]) => {
    // Calculate system average satisfaction for comparison
    const systemAverage = performance.length > 0
      ? performance.reduce((sum, b) => sum + b.average_satisfaction, 0) / performance.length
      : 0;

    // Calculate improvement velocity for each barangay
    const velocityRankings: ImprovementVelocityRanking[] = performance
      .filter(b => b.cycles_participated >= 2 && b.trend === 'improving') // Only include improving barangays with at least 2 cycles
      .map(b => {
        // Calculate velocity as rate of change per cycle
        const velocity = b.cycles_participated > 1 
          ? b.satisfaction_change / (b.cycles_participated - 1)
          : 0;

        return {
          barangay_id: b.barangay_id,
          barangay_name: b.barangay_name,
          improvement_velocity: Math.round(velocity * 10) / 10, // Round to 1 decimal
          cycles_analyzed: b.cycles_participated,
          satisfaction_scores: [], // Will be populated if needed
          average_satisfaction: b.average_satisfaction,
          latest_satisfaction: b.latest_satisfaction,
          vs_system_average: Math.round((b.average_satisfaction - systemAverage) * 10) / 10
        };
      })
      .sort((a, b) => b.improvement_velocity - a.improvement_velocity)
      .slice(0, 10); // Top 10

    setImprovementVelocityRankings(velocityRankings);
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
                <div className="text-sm text-gray-600 mb-1">Award Winners</div>
                <div className="text-2xl font-bold text-teal-600">
                  {systemStats.total_awardees}
                </div>
                <div className="text-xs text-gray-500">of {systemStats.total_barangays} barangays</div>
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
            
            {/* Line Chart for Service Area Trends */}
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={serviceAreaTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="service_name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    label={{ value: 'Average Satisfaction (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Satisfaction']}
                    labelFormatter={(label) => `Service: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="average_satisfaction" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Avg Satisfaction"
                    dot={{ fill: '#3b82f6', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Service Area Cards */}
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

      {/* Award History Section */}
      {awardHistory.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Award History</h3>
            <div className="space-y-4">
              {/* Award Timeline */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 text-gray-700">Award Timeline (Last 5 Years)</h4>
                <div className="space-y-3">
                  {awardHistory.map((yearData) => (
                    <div key={yearData.year} className="flex items-start gap-4 pb-3 border-b last:border-b-0">
                      <div className="flex-shrink-0 w-20">
                        <div className="text-lg font-bold text-blue-600">{yearData.year}</div>
                        <div className="text-xs text-gray-500">{yearData.cycle_name}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">🏆</span>
                          <span className="font-semibold text-gray-700">
                            {yearData.award_count} Winner{yearData.award_count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {yearData.winners.map((winner, idx) => (
                            <span 
                              key={idx}
                              className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                            >
                              {winner}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Award Distribution Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Awards Per Barangay - Pie Chart */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-gray-700">Award Distribution</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={awardLeaderboard.slice(0, 5).map(entry => ({
                          name: entry.name,
                          value: entry.total_awards
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {awardLeaderboard.slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#fbbf24', '#60a5fa', '#34d399', '#f87171', '#a78bfa'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Total Awards Over Time - Line Chart */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-gray-700">Awards Over Time</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={[...awardHistory].reverse()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="award_count" 
                        stroke="#fbbf24" 
                        strokeWidth={2}
                        name="Awards Given"
                        dot={{ fill: '#fbbf24', r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Lifetime Award Rankings */}
      {awardLeaderboard.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top 10 Lifetime Award Rankings</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-2">Rank</th>
                    <th className="text-left py-3 px-2">Barangay</th>
                    <th className="text-center py-3 px-2">Total Awards</th>
                    <th className="text-center py-3 px-2">Award Rate</th>
                    <th className="text-center py-3 px-2">Current Streak</th>
                    <th className="text-center py-3 px-2">Longest Streak</th>
                    <th className="text-center py-3 px-2">Last Award</th>
                  </tr>
                </thead>
                <tbody>
                  {awardLeaderboard.map((entry) => (
                    <tr key={entry.barangay_id} className={`border-b hover:bg-gray-50 ${
                      entry.rank <= 3 ? 'bg-yellow-50' : ''
                    }`}>
                      <td className="py-3 px-2 text-center">
                        <span className={`font-bold text-lg ${
                          entry.rank === 1 ? 'text-yellow-600' :
                          entry.rank === 2 ? 'text-gray-500' :
                          entry.rank === 3 ? 'text-orange-600' :
                          'text-gray-700'
                        }`}>
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-medium">
                        <div className="flex items-center gap-2">
                          {entry.name}
                          {entry.first_time_winner && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              New
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-center py-3 px-2">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-bold">
                          {entry.total_awards}
                        </span>
                      </td>
                      <td className="text-center py-3 px-2">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-3 py-1 rounded font-semibold ${
                            entry.win_rate >= 0.7 ? 'bg-green-100 text-green-800' :
                            entry.win_rate >= 0.5 ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {Math.round(entry.win_rate * 100)}%
                          </span>
                          {entry.win_rate === 1.0 && (
                            <span className="text-xs text-green-600 font-medium">Perfect</span>
                          )}
                        </div>
                      </td>
                      <td className="text-center py-3 px-2">
                        {entry.consecutive_streak > 0 ? (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-semibold">
                            {entry.consecutive_streak}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-2">
                        <span className="font-semibold text-gray-700">{entry.longest_streak || 0}</span>
                      </td>
                      <td className="text-center py-3 px-2">
                        {entry.last_award_year ? (
                          <div>
                            <div className="font-medium">{entry.last_award_year}</div>
                            <div className="text-xs text-gray-500">
                              {entry.years_since_last_award === 0 ? 'This year' :
                               entry.years_since_last_award === 1 ? '1 year ago' :
                               `${entry.years_since_last_award} years ago`}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Award Rate Statistics Visualization */}
            <div className="mt-6 border-t pt-6">
              <h4 className="font-medium mb-3 text-gray-700">Award Rate Statistics</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={awardLeaderboard}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    label={{ value: 'Award Rate (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${Math.round(value * 100)}%`, 'Award Rate']}
                    labelFormatter={(label) => `Barangay: ${label}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="win_rate" 
                    fill="#fbbf24" 
                    name="Award Rate"
                    radius={[8, 8, 0, 0]}
                  >
                    {awardLeaderboard.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.win_rate >= 0.7 ? '#10b981' : entry.win_rate >= 0.5 ? '#3b82f6' : '#6b7280'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Consecutive Award Streaks Display */}
            <div className="mt-6 border-t pt-6">
              <h4 className="font-medium mb-3 text-gray-700">Consecutive Award Streaks</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={awardLeaderboard.filter(entry => entry.longest_streak > 0)}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" label={{ value: 'Streak Length (Years)', position: 'insideBottom', offset: -5 }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value} year${value !== 1 ? 's' : ''}`, 
                      name === 'consecutive_streak' ? 'Current Streak' : 'Longest Streak'
                    ]}
                  />
                  <Legend />
                  <Bar 
                    dataKey="consecutive_streak" 
                    fill="#f97316" 
                    name="Current Streak"
                    radius={[0, 8, 8, 0]}
                  />
                  <Bar 
                    dataKey="longest_streak" 
                    fill="#fbbf24" 
                    name="Longest Streak"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>

              {/* Streak Summary */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Active Streaks</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {awardLeaderboard.filter(e => e.consecutive_streak > 0).length}
                  </div>
                  <div className="text-xs text-gray-500">
                    Barangays with current streaks
                  </div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Longest Streak</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {Math.max(...awardLeaderboard.map(e => e.longest_streak || 0))}
                  </div>
                  <div className="text-xs text-gray-500">
                    {awardLeaderboard.find(e => e.longest_streak === Math.max(...awardLeaderboard.map(e => e.longest_streak || 0)))?.name || 'N/A'}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Avg Award Rate</div>
                  <div className="text-2xl font-bold text-amber-600">
                    {Math.round((awardLeaderboard.reduce((sum, e) => sum + e.win_rate, 0) / awardLeaderboard.length) * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    Top 10 average
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Improvement Velocity Rankings */}
      {improvementVelocityRankings.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Top 10 Most Improved Barangays</h3>
              <p className="text-sm text-gray-600 mt-1">
                Barangays with the fastest rate of satisfaction improvement across cycles
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-2">Rank</th>
                    <th className="text-left py-3 px-2">Barangay</th>
                    <th className="text-center py-3 px-2">Improvement Rate</th>
                    <th className="text-center py-3 px-2">Cycles</th>
                    <th className="text-center py-3 px-2">Avg Satisfaction</th>
                    <th className="text-center py-3 px-2">Latest</th>
                    <th className="text-center py-3 px-2">vs System Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {improvementVelocityRankings.map((entry, index) => (
                    <tr key={entry.barangay_id} className={`border-b hover:bg-gray-50 ${
                      index < 3 ? 'bg-green-50' : ''
                    }`}>
                      <td className="py-3 px-2 text-center">
                        <span className={`font-bold text-lg ${
                          index === 0 ? 'text-green-600' :
                          index === 1 ? 'text-green-500' :
                          index === 2 ? 'text-green-400' :
                          'text-gray-700'
                        }`}>
                          {index === 0 ? '🚀' : index === 1 ? '⬆️' : index === 2 ? '📈' : index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-medium">
                        <div className="flex items-center gap-2">
                          {entry.barangay_name}
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                            ↑ Improving
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-2">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-bold text-green-600">
                            +{entry.improvement_velocity}%
                          </span>
                          <span className="text-xs text-gray-500">per cycle</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-2">
                        <span className="text-gray-700">{entry.cycles_analyzed}</span>
                      </td>
                      <td className="text-center py-3 px-2">
                        <span className={`px-2 py-1 rounded font-semibold ${
                          entry.average_satisfaction >= 70 ? 'bg-green-100 text-green-800' :
                          entry.average_satisfaction >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {entry.average_satisfaction}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          entry.latest_satisfaction >= 70 ? 'bg-green-50 text-green-700' :
                          'bg-red-50 text-red-700'
                        }`}>
                          {entry.latest_satisfaction}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-2">
                        <span className={`font-semibold ${
                          entry.vs_system_average > 0 ? 'text-green-600' :
                          entry.vs_system_average < 0 ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {entry.vs_system_average > 0 ? '+' : ''}{entry.vs_system_average}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Improvement Velocity Chart */}
            <div className="mt-6 border-t pt-6">
              <h4 className="font-medium mb-3 text-gray-700">Improvement Rate Comparison</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={improvementVelocityRankings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="barangay_name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ value: 'Improvement Rate (% per cycle)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`+${value}% per cycle`, 'Improvement Rate']}
                    labelFormatter={(label) => `Barangay: ${label}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="improvement_velocity" 
                    fill="#10b981" 
                    name="Improvement Rate"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Statistics */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Fastest Improver</div>
                <div className="text-xl font-bold text-green-600">
                  {improvementVelocityRankings[0]?.barangay_name || 'N/A'}
                </div>
                <div className="text-sm text-gray-500">
                  +{improvementVelocityRankings[0]?.improvement_velocity || 0}% per cycle
                </div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Average Improvement</div>
                <div className="text-xl font-bold text-blue-600">
                  +{improvementVelocityRankings.length > 0 
                    ? Math.round((improvementVelocityRankings.reduce((sum, b) => sum + b.improvement_velocity, 0) / improvementVelocityRankings.length) * 10) / 10
                    : 0}%
                </div>
                <div className="text-sm text-gray-500">
                  Across top 10
                </div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Total Improving</div>
                <div className="text-xl font-bold text-purple-600">
                  {barangayPerformance.filter(b => b.trend === 'improving').length}
                </div>
                <div className="text-sm text-gray-500">
                  Barangays
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Performance Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Performance Distribution</h3>
            
            {/* Bar Chart for Performance Distribution */}
            <ResponsiveContainer width="100%" height={250}>
              <BarChart 
                data={[
                  { label: 'Excellent (≥80%)', count: barangayPerformance.filter(b => b.average_satisfaction >= 80).length, fill: '#10b981' },
                  { label: 'Good (70-79%)', count: barangayPerformance.filter(b => b.average_satisfaction >= 70 && b.average_satisfaction < 80).length, fill: '#3b82f6' },
                  { label: 'Fair (60-69%)', count: barangayPerformance.filter(b => b.average_satisfaction >= 60 && b.average_satisfaction < 70).length, fill: '#f59e0b' },
                  { label: 'Poor (<60%)', count: barangayPerformance.filter(b => b.average_satisfaction < 60).length, fill: '#ef4444' }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="label" 
                  angle={-15}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11 }}
                />
                <YAxis label={{ value: 'Number of Barangays', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value: number) => [value, 'Barangays']}
                  labelFormatter={(label) => label}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {[
                    { label: 'Excellent (≥80%)', count: barangayPerformance.filter(b => b.average_satisfaction >= 80).length, fill: '#10b981' },
                    { label: 'Good (70-79%)', count: barangayPerformance.filter(b => b.average_satisfaction >= 70 && b.average_satisfaction < 80).length, fill: '#3b82f6' },
                    { label: 'Fair (60-69%)', count: barangayPerformance.filter(b => b.average_satisfaction >= 60 && b.average_satisfaction < 70).length, fill: '#f59e0b' },
                    { label: 'Poor (<60%)', count: barangayPerformance.filter(b => b.average_satisfaction < 60).length, fill: '#ef4444' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Data Table Alternative for Accessibility */}
            <div className="mt-4 text-sm">
              <table className="w-full">
                <thead className="sr-only">
                  <tr>
                    <th>Category</th>
                    <th>Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody className="space-y-1">
                  {[
                    { label: 'Excellent (≥80%)', count: barangayPerformance.filter(b => b.average_satisfaction >= 80).length, color: 'text-green-600' },
                    { label: 'Good (70-79%)', count: barangayPerformance.filter(b => b.average_satisfaction >= 70 && b.average_satisfaction < 80).length, color: 'text-blue-600' },
                    { label: 'Fair (60-69%)', count: barangayPerformance.filter(b => b.average_satisfaction >= 60 && b.average_satisfaction < 70).length, color: 'text-yellow-600' },
                    { label: 'Poor (<60%)', count: barangayPerformance.filter(b => b.average_satisfaction < 60).length, color: 'text-red-600' }
                  ].map((category) => {
                    const percentage = barangayPerformance.length > 0 
                      ? Math.round((category.count / barangayPerformance.length) * 100) 
                      : 0;
                    return (
                      <tr key={category.label} className="border-b">
                        <td className="py-1">{category.label}</td>
                        <td className={`py-1 text-right font-semibold ${category.color}`}>
                          {category.count} ({percentage}%)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Trend Distribution</h3>
            
            {/* Pie Chart for Trend Distribution */}
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Improving', value: barangayPerformance.filter(b => b.trend === 'improving').length },
                    { name: 'Stable', value: barangayPerformance.filter(b => b.trend === 'stable').length },
                    { name: 'Declining', value: barangayPerformance.filter(b => b.trend === 'declining').length },
                    { name: 'New', value: barangayPerformance.filter(b => b.trend === 'new').length }
                  ].filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Improving', value: barangayPerformance.filter(b => b.trend === 'improving').length, color: '#10b981' },
                    { name: 'Stable', value: barangayPerformance.filter(b => b.trend === 'stable').length, color: '#6b7280' },
                    { name: 'Declining', value: barangayPerformance.filter(b => b.trend === 'declining').length, color: '#ef4444' },
                    { name: 'New', value: barangayPerformance.filter(b => b.trend === 'new').length, color: '#3b82f6' }
                  ].filter(item => item.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            {/* Data Table Alternative for Accessibility */}
            <div className="mt-4 text-sm">
              <table className="w-full">
                <thead className="sr-only">
                  <tr>
                    <th>Trend</th>
                    <th>Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody className="space-y-1">
                  {[
                    { label: 'Improving', count: barangayPerformance.filter(b => b.trend === 'improving').length, color: 'text-green-600' },
                    { label: 'Stable', count: barangayPerformance.filter(b => b.trend === 'stable').length, color: 'text-gray-600' },
                    { label: 'Declining', count: barangayPerformance.filter(b => b.trend === 'declining').length, color: 'text-red-600' },
                    { label: 'New', count: barangayPerformance.filter(b => b.trend === 'new').length, color: 'text-blue-600' }
                  ].map((category) => {
                    const percentage = barangayPerformance.length > 0 
                      ? Math.round((category.count / barangayPerformance.length) * 100) 
                      : 0;
                    return (
                      <tr key={category.label} className="border-b">
                        <td className="py-1">{category.label}</td>
                        <td className={`py-1 text-right font-semibold ${category.color}`}>
                          {category.count} ({percentage}%)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
