"use client";

import { ServiceTrendData, ServiceAreaType } from '@/types/analytics';
import EmptyState from '../shared/EmptyState';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ServiceTrendChartProps {
  data: ServiceTrendData[];
  serviceArea: ServiceAreaType;
  barangayId?: number;
}

export default function ServiceTrendChart({ data, serviceArea, barangayId }: ServiceTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon="chart"
        title="No Trend Data"
        message="No historical data available for this service area."
      />
    );
  }

  // Calculate trend slope (simple linear regression)
  const calculateTrendSlope = (values: number[]): number => {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += Math.pow(i - xMean, 2);
    }
    
    return denominator !== 0 ? numerator / denominator : 0;
  };

  const satisfactionValues = data.map(d => d.satisfaction);
  const trendSlope = calculateTrendSlope(satisfactionValues);
  const trendDirection = trendSlope > 1 ? 'improving' : trendSlope < -1 ? 'declining' : 'stable';

  // Format data for chart
  const chartData = data.map(d => ({
    year: d.year,
    cycle_id: d.cycle_id,
    satisfaction: d.satisfaction,
    need_action: d.need_action,
    awareness: d.awareness,
    availment: d.availment
  }));

  const getTrendColor = (direction: string): string => {
    switch (direction) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (direction: string): string => {
    switch (direction) {
      case 'improving':
        return '📈';
      case 'declining':
        return '📉';
      default:
        return '➡️';
    }
  };

  return (
    <div className="space-y-4">
      {/* Trend Summary - Responsive grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-gray-50 rounded-lg p-3 md:p-4 text-center">
          <div className="text-xl md:text-2xl mb-1 md:mb-2">{getTrendIcon(trendDirection)}</div>
          <div className="text-xs md:text-sm font-medium text-gray-600">Overall Trend</div>
          <div className={`text-sm md:text-lg font-bold ${getTrendColor(trendDirection)}`}>
            {trendDirection === 'improving' ? 'Improving' : 
             trendDirection === 'declining' ? 'Declining' : 'Stable'}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 md:p-4 text-center">
          <div className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2">Current</div>
          <div className="text-xl md:text-2xl font-bold text-blue-600">
            {data[data.length - 1]?.satisfaction || 0}%
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 md:p-4 text-center">
          <div className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2">Highest</div>
          <div className="text-xl md:text-2xl font-bold text-green-600">
            {Math.max(...satisfactionValues)}%
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 md:p-4 text-center">
          <div className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2">Lowest</div>
          <div className="text-xl md:text-2xl font-bold text-orange-600">
            {Math.min(...satisfactionValues)}%
          </div>
        </div>
      </div>

      {/* Line Chart with Area Fill - Responsive height */}
      <div className="bg-white rounded-lg border p-3 md:p-4">
        <h5 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Satisfaction Trend Over Time</h5>
        <ResponsiveContainer width="100%" height={250} className="md:!h-[300px]">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="satisfactionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="year" 
              label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              domain={[0, 100]}
              label={{ value: 'Satisfaction %', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border rounded shadow-lg">
                      <p className="font-medium">Year {data.year}</p>
                      <p className="text-sm text-blue-600 font-semibold">
                        Satisfaction: {data.satisfaction}%
                      </p>
                      <p className="text-sm text-gray-600">
                        Need Action: {data.need_action}%
                      </p>
                      <p className="text-sm text-gray-600">
                        Awareness: {data.awareness}%
                      </p>
                      <p className="text-sm text-gray-600">
                        Availment: {data.availment}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="satisfaction"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#satisfactionGradient)"
              name="Satisfaction"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Multi-Metric Line Chart - Responsive */}
      <div className="bg-white rounded-lg border p-3 md:p-4">
        <h5 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">All Metrics Comparison</h5>
        <ResponsiveContainer width="100%" height={200} className="md:!h-[250px]">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="satisfaction"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Satisfaction"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="awareness"
              stroke="#10b981"
              strokeWidth={2}
              name="Awareness"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="availment"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Availment"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="need_action"
              stroke="#ef4444"
              strokeWidth={2}
              name="Need Action"
              dot={{ r: 4 }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Analysis */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h5 className="font-semibold text-blue-900 mb-2">📊 Trend Analysis</h5>
        <div className="text-sm text-blue-800 space-y-1">
          <p>
            • Trend slope: <span className="font-semibold">{trendSlope.toFixed(2)}</span> points per cycle
          </p>
          <p>
            • Change from first to last: 
            <span className={`font-semibold ml-1 ${
              satisfactionValues[satisfactionValues.length - 1] > satisfactionValues[0]
                ? 'text-green-700'
                : 'text-red-700'
            }`}>
              {satisfactionValues[satisfactionValues.length - 1] > satisfactionValues[0] ? '+' : ''}
              {satisfactionValues[satisfactionValues.length - 1] - satisfactionValues[0]} points
            </span>
          </p>
          <p>
            • Data points: <span className="font-semibold">{data.length}</span> cycles
          </p>
        </div>
      </div>
    </div>
  );
}
