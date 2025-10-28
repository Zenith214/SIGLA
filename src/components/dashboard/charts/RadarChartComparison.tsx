"use client";

import { memo, useMemo, useCallback } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { EmptyState } from '../shared/EmptyState';

interface ServiceScores {
  financial: number;
  disaster: number;
  health: number;
  peace: number;
  infrastructure: number;
  environmental: number;
}

interface RadarChartComparisonProps {
  data: {
    barangay_name: string;
    scores: ServiceScores;
  }[];
  colors: string[];
}

/**
 * RadarChartComparison Component
 * 
 * Displays a radar chart comparing multiple barangays across 6 service areas
 * - Financial Assistance
 * - Disaster Preparedness
 * - Health Services
 * - Peace and Order
 * - Infrastructure
 * - Environmental Management
 * 
 * Optimized with React.memo and useMemo for expensive calculations
 */
const RadarChartComparison = memo(function RadarChartComparison({ data, colors }: RadarChartComparisonProps) {
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No Data Available"
        message="Select barangays to compare their service area performance"
      />
    );
  }

  // Memoize service areas (constant data)
  const serviceAreas = useMemo(() => [
    { key: 'financial', label: 'Financial Assistance' },
    { key: 'disaster', label: 'Disaster Preparedness' },
    { key: 'health', label: 'Health Services' },
    { key: 'peace', label: 'Peace and Order' },
    { key: 'infrastructure', label: 'Infrastructure' },
    { key: 'environmental', label: 'Environmental Mgmt' }
  ], []);

  // Memoize chart data transformation (expensive operation)
  const chartData = useMemo(() => {
    return serviceAreas.map(area => {
      const dataPoint: any = {
        service: area.label,
        fullMark: 100
      };

      // Add each barangay's score for this service area
      data.forEach(barangay => {
        dataPoint[barangay.barangay_name] = barangay.scores[area.key as keyof ServiceScores] || 0;
      });

      return dataPoint;
    });
  }, [data, serviceAreas]);

  // Memoize screen reader description
  const chartDescription = useMemo(() => {
    return data.map(barangay => {
      const scores = Object.entries(barangay.scores)
        .map(([area, score]) => {
          const areaLabels: Record<string, string> = {
            financial: 'Financial Assistance',
            disaster: 'Disaster Preparedness',
            health: 'Health Services',
            peace: 'Peace and Order',
            infrastructure: 'Infrastructure',
            environmental: 'Environmental Management'
          };
          return `${areaLabels[area]}: ${score}%`;
        })
        .join(', ');
      return `${barangay.barangay_name} scores: ${scores}`;
    }).join('. ');
  }, [data]);

  // Memoize custom tooltip component
  const CustomTooltip = useCallback(({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-sm mb-2">{payload[0].payload.service}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-medium">{entry.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  }, []);

  return (
    <div className="w-full">
      {/* Screen reader description */}
      <div className="sr-only" role="img" aria-label={`Radar chart comparing ${data.length} barangays across 6 service areas. ${chartDescription}`}>
        {chartDescription}
      </div>

      {/* Legend - Responsive sizing */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-4" role="list" aria-label="Chart legend">
        {data.map((barangay, index) => (
          <div key={barangay.barangay_name} className="flex items-center gap-1.5 md:gap-2" role="listitem">
            <div
              className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: colors[index] }}
              aria-hidden="true"
            />
            <span className="text-xs md:text-sm font-medium">{barangay.barangay_name}</span>
          </div>
        ))}
      </div>

      {/* Radar Chart - Responsive height and font sizes */}
      <div aria-hidden="true" className="w-full">
        <ResponsiveContainer width="100%" height={300} className="mx-auto md:!h-[400px]">
          <RadarChart data={chartData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="service"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              className="md:text-xs"
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#9ca3af', fontSize: 8 }}
              className="md:text-[10px]"
              tickCount={6}
            />
            
            {/* Render a Radar for each barangay */}
            {data.map((barangay, index) => (
              <Radar
                key={barangay.barangay_name}
                name={barangay.barangay_name}
                dataKey={barangay.barangay_name}
                stroke={colors[index]}
                fill={colors[index]}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            ))}
            
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Data table alternative for accessibility */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
          View data table
        </summary>
        <table className="w-full mt-4 text-sm border-collapse">
          <caption className="sr-only">
            Service area satisfaction scores for {data.length} barangays
          </caption>
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th scope="col" className="text-left py-2 px-3 font-semibold">Service Area</th>
              {data.map((barangay) => (
                <th key={barangay.barangay_name} scope="col" className="text-right py-2 px-3 font-semibold">
                  {barangay.barangay_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {serviceAreas.map(area => (
              <tr key={area.key} className="border-b border-gray-100">
                <th scope="row" className="text-left py-2 px-3 font-medium">{area.label}</th>
                {data.map((barangay) => (
                  <td key={barangay.barangay_name} className="text-right py-2 px-3">
                    {barangay.scores[area.key as keyof ServiceScores]}%
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      {/* Mobile-friendly table view */}
      <div className="mt-6 md:hidden">
        <h4 className="text-sm font-semibold mb-3">Service Area Scores</h4>
        <div className="space-y-3">
          {serviceAreas.map(area => (
            <div key={area.key} className="border rounded-lg p-3">
              <div className="font-medium text-sm mb-2">{area.label}</div>
              <div className="space-y-1">
                {data.map((barangay, index) => (
                  <div key={barangay.barangay_name} className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors[index] }}
                        aria-hidden="true"
                      />
                      {barangay.barangay_name}
                    </span>
                    <span className="font-medium">
                      {barangay.scores[area.key as keyof ServiceScores]}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // Only re-render if data or colors actually changed
  return (
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data) &&
    JSON.stringify(prevProps.colors) === JSON.stringify(nextProps.colors)
  );
});

export default RadarChartComparison;
