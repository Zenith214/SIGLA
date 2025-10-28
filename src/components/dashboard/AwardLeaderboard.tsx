"use client";

import { useState, useMemo } from 'react';
import { useAwardLeaderboard, AwardLeaderboardParams } from '@/hooks/useAwardLeaderboard';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { ErrorBanner } from './shared/ErrorBanner';
import { LoadingSkeleton } from './shared/LoadingSkeleton';
import { EmptyState } from './shared/EmptyState';
import { AwardHistoryTimeline, StreakTracker } from './charts';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Trophy, TrendingUp } from 'lucide-react';

type SortField = 'total_awards' | 'win_rate' | 'consecutive_streak' | 'last_award';

export default function AwardLeaderboard() {
  const { cycles } = useAnalytics();
  const [sortBy, setSortBy] = useState<SortField>('total_awards');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const params: AwardLeaderboardParams = {
    sort_by: sortBy,
    sort_order: sortOrder,
    limit: 100, // Fetch more for client-side filtering
    year_filter: yearFilter,
  };

  const { data, total, loading, error, refetch } = useAwardLeaderboard(params);

  // Client-side search filtering
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(entry =>
      entry.name.toLowerCase().includes(lowerSearch)
    );
  }, [data, searchTerm]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, page]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Get unique years from cycles
  const availableYears = useMemo(() => {
    const years = cycles.map(c => c.year).filter((y): y is number => y !== null);
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [cycles]);

  // Top performers for streak tracker (top 5 by consecutive streak)
  const topStreakPerformers = useMemo(() => {
    return [...data]
      .sort((a, b) => b.consecutive_streak - a.consecutive_streak)
      .slice(0, 5)
      .map(entry => ({
        barangay_name: entry.name,
        current_streak: entry.consecutive_streak,
        longest_streak: entry.longest_streak,
        streak_years: entry.award_history
          .filter((_, idx, arr) => {
            // Find consecutive years
            if (idx === 0) return true;
            return arr[idx - 1].year - entry.award_history[idx].year === 1;
          })
          .map(h => h.year),
      }));
  }, [data]);

  // Improvement velocity calculations (barangays with fastest improvement)
  const improvementRankings = useMemo(() => {
    // This would require historical satisfaction data
    // For now, we'll show barangays with recent awards as "improving"
    return data
      .filter(entry => entry.years_since_last_award !== null && entry.years_since_last_award <= 2)
      .slice(0, 5);
  }, [data]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const getMedalBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-800">1st</span>;
      case 2:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-700">2nd</span>;
      case 3:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-700">3rd</span>;
      default:
        return null;
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-blue-600" />
    );
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={refetch} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title="No Award Data"
        message="No awards have been given yet. Awards will appear here once barangays start winning."
        icon="data"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Award Leaderboard
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Lifetime award rankings and performance streaks
        </p>
      </div>

      {/* Filters and Search - Mobile optimized */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search barangays..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 min-h-[44px] text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Year Filter */}
        <select
          value={yearFilter || ''}
          onChange={(e) => {
            setYearFilter(e.target.value ? parseInt(e.target.value) : undefined);
            setPage(1);
          }}
          className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Years</option>
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Barangay
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('total_awards')}
                >
                  <div className="flex items-center gap-1">
                    Total Awards
                    {getSortIcon('total_awards')}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('win_rate')}
                >
                  <div className="flex items-center gap-1">
                    Win Rate
                    {getSortIcon('win_rate')}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('consecutive_streak')}
                >
                  <div className="flex items-center gap-1">
                    Streak
                    {getSortIcon('consecutive_streak')}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('last_award')}
                >
                  <div className="flex items-center gap-1">
                    Last Award
                    {getSortIcon('last_award')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((entry) => {
                const medalBadge = getMedalBadge(entry.rank);
                const hasActiveStreak = entry.consecutive_streak > 0;
                
                return (
                  <tr key={entry.barangay_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          #{entry.rank}
                        </span>
                        {medalBadge}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.name}
                      </div>
                      {entry.first_time_winner && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                          First Time Winner
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {entry.total_awards}
                      </div>
                      {entry.longest_streak > 1 && (
                        <div className="text-xs text-gray-500">
                          Best: {entry.longest_streak} in a row
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(entry.win_rate * 100).toFixed(0)}%
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${hasActiveStreak ? 'text-orange-600' : 'text-gray-900'}`}>
                          {entry.consecutive_streak}
                        </span>
                        {hasActiveStreak && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {entry.last_award_year ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {entry.last_award_year}
                          </div>
                          {entry.years_since_last_award !== null && entry.years_since_last_award > 0 && (
                            <div className="text-xs text-gray-500">
                              {entry.years_since_last_award} {entry.years_since_last_award === 1 ? 'year' : 'years'} ago
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No awards yet</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, filteredData.length)} of {filteredData.length} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 min-h-[44px] text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 active:scale-95 transition-transform"
              >
                Previous
              </button>
              <span className="px-3 py-2 min-h-[44px] flex items-center text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 min-h-[44px] text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 active:scale-95 transition-transform"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Streak Tracker Section */}
      {topStreakPerformers.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Top Streaks
          </h4>
          <StreakTracker data={topStreakPerformers} />
        </div>
      )}

      {/* Award History Timeline */}
      <div className="bg-white rounded-lg border p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Award History Timeline
        </h4>
        <AwardHistoryTimeline data={data.slice(0, 10)} />
      </div>

      {/* Improvement Rankings Section */}
      {improvementRankings.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Recent Winners
          </h4>
          <div className="space-y-3">
            {improvementRankings.map((entry, index) => (
              <div
                key={entry.barangay_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-gray-400">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{entry.name}</div>
                    <div className="text-sm text-gray-600">
                      Last won {entry.years_since_last_award === 0 ? 'this year' : `${entry.years_since_last_award} ${entry.years_since_last_award === 1 ? 'year' : 'years'} ago`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {entry.total_awards} {entry.total_awards === 1 ? 'award' : 'awards'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {(entry.win_rate * 100).toFixed(0)}% win rate
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
