"use client";

import { useState } from 'react';
import { EmptyState } from '../shared/EmptyState';
import { Tooltip as CustomTooltip } from '../shared/Tooltip';

interface ActionGrid {
  maintain: string[];
  fix_now: string[];
  monitor: string[];
  low_priority: string[];
}

interface ActionGridHeatmapProps {
  data: {
    barangay_name: string;
    action_grid: ActionGrid;
  }[];
}

/**
 * ActionGridHeatmap Component
 * 
 * Displays a color-coded matrix showing the status of each service area for each barangay
 * Color coding:
 * - Green (maintain): High satisfaction, Low need-action
 * - Red (fix now): Low satisfaction, High need-action
 * - Yellow (monitor): Low satisfaction, Low need-action
 * - Gray (low priority): High satisfaction, High need-action
 */
export default function ActionGridHeatmap({ data }: ActionGridHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ barangay: string; service: string; status: string } | null>(null);

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No Data Available"
        message="Select barangays to view their service area status matrix"
      />
    );
  }

  const serviceAreas = [
    'Financial Assistance',
    'Disaster Preparedness',
    'Health Services',
    'Peace and Order',
    'Infrastructure',
    'Environmental Management'
  ];

  // Get status for a specific barangay and service
  const getServiceStatus = (barangay: { barangay_name: string; action_grid: ActionGrid }, service: string) => {
    if (barangay.action_grid.maintain.includes(service)) {
      return { status: 'maintain', color: 'bg-green-500', label: 'Maintain', textColor: 'text-white' };
    } else if (barangay.action_grid.fix_now.includes(service)) {
      return { status: 'fix_now', color: 'bg-red-500', label: 'Fix Now', textColor: 'text-white' };
    } else if (barangay.action_grid.monitor.includes(service)) {
      return { status: 'monitor', color: 'bg-yellow-500', label: 'Monitor', textColor: 'text-white' };
    } else if (barangay.action_grid.low_priority.includes(service)) {
      return { status: 'low_priority', color: 'bg-gray-400', label: 'Low Priority', textColor: 'text-white' };
    } else {
      return { status: 'no_data', color: 'bg-gray-200', label: 'No Data', textColor: 'text-gray-600' };
    }
  };

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span className="text-sm">Maintain (High satisfaction, Low need)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span className="text-sm">Fix Now (Low satisfaction, High need)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded" />
          <span className="text-sm">Monitor (Low satisfaction, Low need)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded" />
          <span className="text-sm">Low Priority (High satisfaction, High need)</span>
        </div>
      </div>

      {/* Desktop Heatmap Grid */}
      <div className="hidden md:block overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-50 p-3 text-left text-sm font-semibold sticky left-0 z-10">
                  Barangay / Service Area
                </th>
                {serviceAreas.map(service => (
                  <th
                    key={service}
                    className="border border-gray-300 bg-gray-50 p-3 text-center text-xs font-semibold min-w-[120px]"
                  >
                    {service}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(barangay => (
                <tr key={barangay.barangay_name}>
                  <td className="border border-gray-300 bg-gray-50 p-3 font-medium text-sm sticky left-0 z-10">
                    {barangay.barangay_name}
                  </td>
                  {serviceAreas.map(service => {
                    const statusInfo = getServiceStatus(barangay, service);
                    return (
                      <td
                        key={service}
                        className="border border-gray-300 p-0 relative"
                        onMouseEnter={() => setHoveredCell({ barangay: barangay.barangay_name, service, status: statusInfo.label })}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        <div className={`${statusInfo.color} ${statusInfo.textColor} p-3 h-full flex items-center justify-center text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity`}>
                          {statusInfo.label}
                        </div>
                        
                        {/* Tooltip */}
                        {hoveredCell?.barangay === barangay.barangay_name && hoveredCell?.service === service && (
                          <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
                            <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap">
                              <div className="font-semibold">{barangay.barangay_name}</div>
                              <div>{service}</div>
                              <div className="text-gray-300 mt-1">Status: {statusInfo.label}</div>
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile-friendly Card View */}
      <div className="md:hidden space-y-4">
        {data.map(barangay => (
          <div key={barangay.barangay_name} className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">{barangay.barangay_name}</h4>
            <div className="space-y-2">
              {serviceAreas.map(service => {
                const statusInfo = getServiceStatus(barangay, service);
                return (
                  <div key={service} className="flex items-center justify-between">
                    <span className="text-sm">{service}</span>
                    <span className={`${statusInfo.color} ${statusInfo.textColor} px-3 py-1 rounded text-xs font-medium`}>
                      {statusInfo.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map(barangay => {
          const maintainCount = barangay.action_grid.maintain.length;
          const fixNowCount = barangay.action_grid.fix_now.length;
          const monitorCount = barangay.action_grid.monitor.length;
          const lowPriorityCount = barangay.action_grid.low_priority.length;
          
          return (
            <div key={barangay.barangay_name} className="border rounded-lg p-3">
              <div className="font-medium text-sm mb-2">{barangay.barangay_name}</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-green-600">Maintain:</span>
                  <span className="font-medium">{maintainCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Fix Now:</span>
                  <span className="font-medium">{fixNowCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-600">Monitor:</span>
                  <span className="font-medium">{monitorCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Low Priority:</span>
                  <span className="font-medium">{lowPriorityCount}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
