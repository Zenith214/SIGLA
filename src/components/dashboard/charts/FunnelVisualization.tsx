"use client";

import { memo, useMemo, useCallback } from 'react';
import { FunnelData, ServiceAreaType } from '@/types/analytics';
import Tooltip from '../shared/Tooltip';

interface FunnelVisualizationProps {
  data: FunnelData;
  serviceArea: ServiceAreaType;
}

const FunnelVisualization = memo(function FunnelVisualization({ data, serviceArea }: FunnelVisualizationProps) {
  // Memoize stages data
  const stages = useMemo(() => [
    {
      name: 'Awareness',
      value: data.awareness,
      color: 'from-blue-400 to-blue-500',
      description: 'Percentage of residents who are aware of this service'
    },
    {
      name: 'Availment',
      value: data.availment,
      color: 'from-blue-500 to-blue-600',
      description: 'Percentage of aware residents who have availed the service'
    },
    {
      name: 'Satisfaction',
      value: data.satisfaction,
      color: 'from-blue-600 to-blue-700',
      description: 'Percentage of users who are satisfied with the service'
    }
  ], [data.awareness, data.availment, data.satisfaction]);

  // Memoize screen reader description
  const funnelDescription = useMemo(() => 
    `Service funnel for ${serviceArea}: ${data.awareness}% awareness, ${data.availment}% availment, ${data.satisfaction}% satisfaction. Conversion rate from awareness to availment is ${data.awareness_to_availment_rate}%, and from availment to satisfaction is ${data.availment_to_satisfaction_rate}%.`,
    [serviceArea, data.awareness, data.availment, data.satisfaction, data.awareness_to_availment_rate, data.availment_to_satisfaction_rate]
  );

  // Memoize max value calculation
  const maxValue = useMemo(() => 
    Math.max(data.awareness, data.availment, data.satisfaction),
    [data.awareness, data.availment, data.satisfaction]
  );

  // Memoize width calculation function
  const getWidth = useCallback((value: number) => {
    return (value / maxValue) * 100;
  }, [maxValue]);

  return (
    <div className="space-y-6">
      {/* Screen reader description */}
      <div className="sr-only" role="img" aria-label={funnelDescription}>
        {funnelDescription}
      </div>

      {/* Funnel Stages */}
      <div className="space-y-4" aria-hidden="true">
        {stages.map((stage, index) => {
          const width = getWidth(stage.value);
          const conversionRate = index === 0
            ? null
            : index === 1
            ? data.awareness_to_availment_rate
            : data.availment_to_satisfaction_rate;

          return (
            <div key={stage.name} className="space-y-2">
              {/* Stage Bar - Responsive sizing */}
              <div className="relative">
                <Tooltip content={stage.description}>
                  <div
                    className={`h-12 md:h-16 bg-gradient-to-r ${stage.color} rounded-lg shadow-md transition-all hover:shadow-lg cursor-help flex items-center justify-between px-4 md:px-6`}
                    style={{ width: `${width}%`, minWidth: '180px' }}
                    role="presentation"
                  >
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className="text-white font-semibold text-sm md:text-lg">
                        {stage.name}
                      </span>
                    </div>
                    <div className="text-white font-bold text-xl md:text-2xl">
                      {stage.value}%
                    </div>
                  </div>
                </Tooltip>
              </div>

              {/* Conversion Rate Arrow */}
              {conversionRate !== null && (
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-2xl" aria-hidden="true">↓</span>
                    <span className="font-medium">
                      {conversionRate}% conversion
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">Awareness → Availment</div>
          <div className="text-lg font-bold text-blue-600">
            {data.awareness_to_availment_rate}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">Availment → Satisfaction</div>
          <div className="text-lg font-bold text-blue-600">
            {data.availment_to_satisfaction_rate}%
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 rounded-lg p-4" role="region" aria-label="Funnel insights and recommendations">
        <h5 className="font-semibold text-blue-900 mb-2">
          <span role="img" aria-label="Chart icon">📊</span> Funnel Insights
        </h5>
        <ul className="text-sm text-blue-800 space-y-1">
          {data.awareness < 70 && (
            <li>• Low awareness - consider information campaigns</li>
          )}
          {data.awareness_to_availment_rate < 70 && (
            <li>• Many aware but not availing - check accessibility</li>
          )}
          {data.availment_to_satisfaction_rate < 80 && (
            <li>• Service quality needs improvement</li>
          )}
          {data.satisfaction >= 80 && (
            <li>• <span role="img" aria-label="Check mark">✓</span> High satisfaction - maintain service quality</li>
          )}
        </ul>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for React.memo
  return (
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data) &&
    prevProps.serviceArea === nextProps.serviceArea
  );
});

export default FunnelVisualization;
