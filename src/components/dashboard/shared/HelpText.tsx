"use client";

import { useState } from 'react';
import { Tooltip } from './Tooltip';

interface HelpTextProps {
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * HelpText Component
 * 
 * Displays a help icon with tooltip explaining metrics and visualizations
 */
export default function HelpText({ title, content, position = 'top' }: HelpTextProps) {
  return (
    <Tooltip content={content} position={position}>
      <button
        type="button"
        className="inline-flex items-center justify-center w-5 h-5 ml-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
        aria-label={`Help: ${title}`}
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </Tooltip>
  );
}

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  icon?: string;
}

/**
 * InfoCard Component
 * 
 * Displays inline documentation for complex features
 */
export function InfoCard({ title, children, icon = 'ℹ️' }: InfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <span role="img" aria-label="Information" className="text-xl">
            {icon}
          </span>
          <h4 className="font-semibold text-blue-900">{title}</h4>
        </div>
        <svg
          className={`w-5 h-5 text-blue-700 transition-transform ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isExpanded && (
        <div className="mt-3 text-sm text-blue-800 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Metric explanation texts
 */
export const metricExplanations = {
  satisfaction: {
    title: 'Satisfaction Score',
    content: 'Percentage of residents who are satisfied with the service quality. Higher scores indicate better service delivery.'
  },
  needAction: {
    title: 'Need-Action Score',
    content: 'Percentage of residents who require or would benefit from this service. Helps identify service demand.'
  },
  awareness: {
    title: 'Awareness',
    content: 'Percentage of residents who know about the availability of this service.'
  },
  availment: {
    title: 'Availment',
    content: 'Percentage of aware residents who have actually used or accessed the service.'
  },
  winRate: {
    title: 'Win Rate',
    content: 'Percentage of survey cycles in which the barangay won an award. Calculated as (total awards / total cycles participated) × 100.'
  },
  consecutiveStreak: {
    title: 'Consecutive Streak',
    content: 'Number of consecutive survey cycles in which the barangay won awards. Active streaks are marked with 🔥.'
  },
  improvementRate: {
    title: 'Improvement Rate',
    content: 'Rate of change in satisfaction score compared to the previous cycle. Positive values indicate improvement.'
  },
  actionGrid: {
    title: 'Action Grid',
    content: 'Service status: Maintain, Fix Now, Monitor, or Low Priority.'
  },
  radarChart: {
    title: 'Radar Chart',
    content: 'Compare barangays across all 6 service areas.'
  },
  funnel: {
    title: 'Service Funnel',
    content: 'Progression: Awareness → Availment → Satisfaction.'
  }
};
