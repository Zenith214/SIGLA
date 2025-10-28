"use client";

import { useState, useMemo, useCallback, memo } from 'react';
import { ServiceAreaRanking, ServiceAreaType } from '@/types/analytics';
import EmptyState from '../shared/EmptyState';

interface ServiceLeaderboardProps {
  rankings: ServiceAreaRanking[];
  serviceArea: ServiceAreaType;
}

type SortField = 'rank' | 'satisfaction' | 'need_action' | 'improvement_rate';
type SortOrder = 'asc' | 'desc';

const ServiceLeaderboard = memo(function ServiceLeaderboard({ rankings, serviceArea }: ServiceLeaderboardProps) {
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Memoize sorted rankings (expensive operation for large lists)
  const sortedRankings = useMemo(() => {
    if (!rankings || rankings.length === 0) {
      return [];
    }
    return [...rankings].sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortField) {
        case 'rank':
          aValue = a.rank;
          bValue = b.rank;
          break;
        case 'satisfaction':
          aValue = a.satisfaction;
          bValue = b.satisfaction;
          break;
        case 'need_action':
          aValue = a.need_action;
          bValue = b.need_action;
          break;
        case 'improvement_rate':
          aValue = a.improvement_rate;
          bValue = b.improvement_rate;
          break;
        default:
          aValue = a.rank;
          bValue = b.rank;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [rankings, sortField, sortOrder]);

  // Memoize sort handler
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'rank' ? 'asc' : 'desc');
    }
  }, [sortField, sortOrder]);

  // Memoize helper functions
  const getSatisfactionColor = useCallback((satisfaction: number): string => {
    if (satisfaction >= 80) return 'text-green-600 bg-green-50';
    if (satisfaction >= 70) return 'text-blue-600 bg-blue-50';
    if (satisfaction >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  }, []);

  const getTrendIcon = useCallback((trend: 'improving' | 'declining' | 'stable'): string => {
    switch (trend) {
      case 'improving':
        return '↑';
      case 'declining':
        return '↓';
      case 'stable':
        return '→';
    }
  }, []);

  const getTrendColor = useCallback((trend: 'improving' | 'declining' | 'stable'): string => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
    }
  }, []);

  const getMedalIcon = useCallback((rank: number): string | null => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  }, []);

  // Memoize SortButton component
  const SortButton = useCallback(({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
    >
      {label}
      {sortField === field && (
        <span className="text-blue-600">
          {sortOrder === 'asc' ? '▲' : '▼'}
        </span>
      )}
    </button>
  ), [handleSort, sortField, sortOrder]);

  // Check for empty state after all hooks
  if (!rankings || rankings.length === 0) {
    return (
      <EmptyState
        icon="chart"
        title="No Rankings Available"
        message="No barangay data available for this service area."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table
        className="w-full text-sm"
        role="table"
        aria-label={`Service area rankings for ${serviceArea}`}
        aria-describedby="leaderboard-description"
      >
        <caption id="leaderboard-description" className="sr-only">
          Rankings of all barangays for the selected service area, sorted by {sortField} in {sortOrder}ending order.
          Click column headers to change sorting.
        </caption>
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th scope="col" className="text-left py-3 px-2 font-semibold text-gray-700" aria-sort={sortField === 'rank' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}>
              <SortButton field="rank" label="Rank" />
            </th>
            <th scope="col" className="text-left py-3 px-4 font-semibold text-gray-700">
              Barangay
            </th>
            <th scope="col" className="text-right py-3 px-4 font-semibold text-gray-700" aria-sort={sortField === 'satisfaction' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}>
              <SortButton field="satisfaction" label="Satisfaction" />
            </th>
            <th scope="col" className="text-right py-3 px-4 font-semibold text-gray-700" aria-sort={sortField === 'need_action' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}>
              <SortButton field="need_action" label="Need Action" />
            </th>
            <th scope="col" className="text-center py-3 px-4 font-semibold text-gray-700">
              Trend
            </th>
            <th scope="col" className="text-right py-3 px-4 font-semibold text-gray-700" aria-sort={sortField === 'improvement_rate' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}>
              <SortButton field="improvement_rate" label="Change" />
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRankings.map((ranking, index) => {
            const medal = getMedalIcon(ranking.rank);
            const satisfactionColor = getSatisfactionColor(ranking.satisfaction);
            const trendIcon = getTrendIcon(ranking.trend);
            const trendColor = getTrendColor(ranking.trend);

            return (
              <tr
                key={`${ranking.barangay_id}-${index}`}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {/* Rank */}
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    {medal && <span className="text-xl" role="img" aria-label={`Rank ${ranking.rank} medal`}>{medal}</span>}
                    <span className={`font-medium ${medal ? 'text-lg' : ''}`}>
                      {ranking.rank}
                    </span>
                  </div>
                </td>

                {/* Barangay Name */}
                <td className="py-3 px-4">
                  <span className="font-medium text-gray-900">{ranking.name}</span>
                </td>

                {/* Satisfaction Score */}
                <td className="py-3 px-4 text-right">
                  <span
                    className={`px-3 py-1 rounded-full font-semibold ${satisfactionColor}`}
                    aria-label={`${ranking.satisfaction} percent satisfaction`}
                  >
                    {ranking.satisfaction}%
                  </span>
                </td>

                {/* Need Action Score */}
                <td className="py-3 px-4 text-right">
                  <span
                    className="text-gray-700 font-medium"
                    aria-label={`${ranking.need_action} percent need action`}
                  >
                    {ranking.need_action}%
                  </span>
                </td>

                {/* Trend */}
                <td className="py-3 px-4 text-center">
                  <span
                    className={`text-xl font-bold ${trendColor}`}
                    role="img"
                    aria-label={`Trend: ${ranking.trend}`}
                  >
                    {trendIcon}
                  </span>
                  <span className="sr-only">{ranking.trend}</span>
                </td>

                {/* Improvement Rate */}
                <td className="py-3 px-4 text-right">
                  {ranking.improvement_rate !== 0 ? (
                    <span
                      className={`font-medium ${ranking.improvement_rate > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      aria-label={`${ranking.improvement_rate > 0 ? 'Increased' : 'Decreased'} by ${Math.abs(ranking.improvement_rate)} percent`}
                    >
                      {ranking.improvement_rate > 0 ? '+' : ''}{ranking.improvement_rate}%
                    </span>
                  ) : (
                    <span className="text-gray-400" aria-label="No change">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-600 mb-1">Average Satisfaction</div>
            <div className="text-lg font-bold text-blue-600">
              {Math.round(
                rankings.reduce((sum, r) => sum + r.satisfaction, 0) / rankings.length
              )}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Top Performer</div>
            <div className="text-lg font-bold text-green-600">
              {rankings[0]?.satisfaction}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Improving</div>
            <div className="text-lg font-bold text-green-600">
              {rankings.filter(r => r.trend === 'improving').length}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Declining</div>
            <div className="text-lg font-bold text-red-600">
              {rankings.filter(r => r.trend === 'declining').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for React.memo
  return (
    JSON.stringify(prevProps.rankings) === JSON.stringify(nextProps.rankings) &&
    prevProps.serviceArea === nextProps.serviceArea
  );
});

export default ServiceLeaderboard;
