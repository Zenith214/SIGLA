"use client";

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { EmptyState } from '../shared/EmptyState';
import { Flame } from 'lucide-react';

interface StreakData {
  barangay_name: string;
  current_streak: number;
  longest_streak: number;
  streak_years: number[];
}

interface StreakTrackerProps {
  data: StreakData[];
}

export default function StreakTracker({ data }: StreakTrackerProps) {
  // Transform data for the chart
  const chartData = useMemo(() => {
    return data.map(item => ({
      name: item.barangay_name,
      current: item.current_streak,
      longest: item.longest_streak,
      hasActiveStreak: item.current_streak > 0,
    }));
  }, [data]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const dataPoint = payload[0].payload;
    const streakData = data.find(d => d.barangay_name === dataPoint.name);

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">{dataPoint.name}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-600">Current Streak:</span>
            <span className={`font-semibold ${dataPoint.hasActiveStreak ? 'text-orange-600' : 'text-gray-600'}`}>
              {dataPoint.current} {dataPoint.current === 1 ? 'year' : 'years'}
              {dataPoint.hasActiveStreak && <span className="ml-1 text-xs">(Active)</span>}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-600">Longest Streak:</span>
            <span className="font-semibold text-purple-600">
              {dataPoint.longest} {dataPoint.longest === 1 ? 'year' : 'years'}
            </span>
          </div>
          {streakData && streakData.streak_years.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Years:</p>
              <p className="text-sm text-gray-700">
                {streakData.streak_years.slice(0, 5).join(', ')}
                {streakData.streak_years.length > 5 && '...'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <EmptyState
        title="No Streaks"
        message="No consecutive award streaks have been achieved yet."
        icon="data"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          layout="horizontal"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ value: 'Years', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="rect"
          />
          <Bar
            dataKey="current"
            name="Current Streak"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-current-${index}`}
                fill={entry.hasActiveStreak ? '#3b82f6' : '#94a3b8'}
              />
            ))}
          </Bar>
          <Bar
            dataKey="longest"
            name="Longest Streak"
            fill="#8b5cf6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Streak Details */}
      <div className="space-y-3">
        {data.map((item, index) => {
          const hasActiveStreak = item.current_streak > 0;
          const isRecordStreak = item.current_streak === item.longest_streak && item.current_streak > 0;

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 transition-all ${
                hasActiveStreak
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-semibold text-gray-900">{item.barangay_name}</h5>
                    {hasActiveStreak && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                        Active
                      </span>
                    )}
                    {isRecordStreak && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        Record Streak
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-600">Current Streak</div>
                      <div className={`text-lg font-bold ${hasActiveStreak ? 'text-blue-600' : 'text-gray-400'}`}>
                        {item.current_streak} {item.current_streak === 1 ? 'year' : 'years'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Longest Streak</div>
                      <div className="text-lg font-bold text-purple-600">
                        {item.longest_streak} {item.longest_streak === 1 ? 'year' : 'years'}
                      </div>
                    </div>
                  </div>

                  {item.streak_years.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Streak Years:</div>
                      <div className="flex flex-wrap gap-1">
                        {item.streak_years.map((year, yearIndex) => (
                          <span
                            key={yearIndex}
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              hasActiveStreak
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {year}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="text-sm text-orange-700 font-medium mb-2">Active Streaks</div>
          <div className="text-3xl font-bold text-orange-900">
            {data.filter(d => d.current_streak > 0).length}
          </div>
          <div className="text-xs text-orange-600 mt-1">
            {data.filter(d => d.current_streak > 0).length === 1 ? 'barangay' : 'barangays'} on a winning streak
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="text-sm text-purple-700 font-medium mb-2">Longest Streak</div>
          <div className="text-3xl font-bold text-purple-900">
            {Math.max(...data.map(d => d.longest_streak), 0)}
          </div>
          <div className="text-xs text-purple-600 mt-1">
            {data.find(d => d.longest_streak === Math.max(...data.map(d => d.longest_streak)))?.barangay_name || 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
}
