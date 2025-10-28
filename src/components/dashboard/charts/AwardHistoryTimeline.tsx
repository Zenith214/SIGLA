"use client";

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AwardLeaderboardEntry } from '@/hooks/useAwardLeaderboard';
import { EmptyState } from '../shared/EmptyState';
import { Trophy } from 'lucide-react';

interface AwardHistoryTimelineProps {
  data: AwardLeaderboardEntry[];
  selectedBarangays?: number[]; // Optional: filter to specific barangays
}

interface TimelineData {
  year: number;
  awards: {
    barangay_id: number;
    barangay_name: string;
    award_type: string;
  }[];
  total: number;
}

const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#6366f1', // Indigo
  '#84cc16', // Lime
];

export default function AwardHistoryTimeline({ data, selectedBarangays }: AwardHistoryTimelineProps) {
  // Transform data into timeline format
  const timelineData = useMemo(() => {
    const yearMap = new Map<number, TimelineData>();

    // Filter data if specific barangays are selected
    const filteredData = selectedBarangays && selectedBarangays.length > 0
      ? data.filter(entry => selectedBarangays.includes(entry.barangay_id))
      : data;

    // Process each barangay's award history
    filteredData.forEach(entry => {
      entry.award_history.forEach(award => {
        if (!yearMap.has(award.year)) {
          yearMap.set(award.year, {
            year: award.year,
            awards: [],
            total: 0,
          });
        }

        const yearData = yearMap.get(award.year)!;
        yearData.awards.push({
          barangay_id: entry.barangay_id,
          barangay_name: entry.name,
          award_type: award.award_type,
        });
        yearData.total++;
      });
    });

    // Convert to array and sort by year
    return Array.from(yearMap.values())
      .sort((a, b) => a.year - b.year);
  }, [data, selectedBarangays]);

  // Create chart data with barangay counts per year
  const chartData = useMemo(() => {
    return timelineData.map(yearData => {
      const barangayCounts: Record<string, number> = {};
      
      yearData.awards.forEach(award => {
        const key = award.barangay_name;
        barangayCounts[key] = (barangayCounts[key] || 0) + 1;
      });

      return {
        year: yearData.year,
        total: yearData.total,
        ...barangayCounts,
      };
    });
  }, [timelineData]);

  // Get all unique barangay names for the legend
  const barangayNames = useMemo(() => {
    const names = new Set<string>();
    timelineData.forEach(yearData => {
      yearData.awards.forEach(award => {
        names.add(award.barangay_name);
      });
    });
    return Array.from(names);
  }, [timelineData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const yearData = timelineData.find(d => d.year === label);
    if (!yearData) return null;

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-1">
          {yearData.awards.map((award, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Trophy className="h-3 w-3 text-yellow-500" />
              <span className="text-gray-700">{award.barangay_name}</span>
              {award.award_type && (
                <span className="text-gray-500 text-xs">({award.award_type})</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-900">
            Total: {yearData.total} {yearData.total === 1 ? 'award' : 'awards'}
          </p>
        </div>
      </div>
    );
  };

  if (timelineData.length === 0) {
    return (
      <EmptyState
        title="No Award History"
        message="No awards have been given in the selected time period."
        icon="data"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="year"
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ value: 'Year', position: 'insideBottom', offset: -10, fill: '#6b7280' }}
          />
          <YAxis
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ value: 'Number of Awards', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          
          {/* Create a bar for each barangay */}
          {barangayNames.map((name, index) => (
            <Bar
              key={name}
              dataKey={name}
              stackId="awards"
              fill={COLORS[index % COLORS.length]}
              name={name}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Total Years</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            {timelineData.length}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Total Awards</div>
          <div className="text-2xl font-bold text-green-900 mt-1">
            {timelineData.reduce((sum, year) => sum + year.total, 0)}
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium">Unique Winners</div>
          <div className="text-2xl font-bold text-purple-900 mt-1">
            {barangayNames.length}
          </div>
        </div>
      </div>

      {/* Year-by-Year Breakdown */}
      <div className="mt-6">
        <h5 className="text-sm font-semibold text-gray-900 mb-3">Year-by-Year Breakdown</h5>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {timelineData.slice().reverse().map(yearData => (
            <div
              key={yearData.year}
              className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{yearData.year}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {yearData.awards.map((award, index) => (
                    <span key={index}>
                      {award.barangay_name}
                      {index < yearData.awards.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <Trophy className="h-4 w-4" />
                <span className="font-semibold text-gray-900">{yearData.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
