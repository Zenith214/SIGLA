"use client";

import { useState } from 'react';
import { EmptyState } from '../shared/EmptyState';

interface Award {
  year: number;
  cycle_id: number;
  award_type: string;
}

interface AwardTimelineProps {
  data: {
    barangay_name: string;
    color: string;
    awards: Award[];
  }[];
}

/**
 * AwardTimeline Component
 * 
 * Displays a horizontal timeline showing award wins for selected barangays
 * - Medal icons (🥇🥈🥉) at award years
 * - Different colors per barangay
 * - Tooltips showing award details
 */
export default function AwardTimeline({ data }: AwardTimelineProps) {
  const [hoveredAward, setHoveredAward] = useState<{ barangay: string; year: number } | null>(null);

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No Data Available"
        message="Select barangays to view their award history"
      />
    );
  }

  // Check if any barangay has awards
  const hasAnyAwards = data.some(b => b.awards && b.awards.length > 0);

  if (!hasAnyAwards) {
    return (
      <EmptyState
        title="No Awards Yet"
        message="The selected barangays have not won any awards"
      />
    );
  }

  // Get all unique years from all barangays' awards
  const allYears = new Set<number>();
  data.forEach(barangay => {
    barangay.awards.forEach(award => {
      allYears.add(award.year);
    });
  });

  const years = Array.from(allYears).sort((a, b) => a - b);
  
  // If no years, show empty state
  if (years.length === 0) {
    return (
      <EmptyState
        title="No Award Data"
        message="No award years available for the selected barangays"
      />
    );
  }

  const minYear = years[0];
  const maxYear = years[years.length - 1];
  const yearRange = maxYear - minYear + 1;

  // Generate year markers (show every year if range is small, otherwise show every 2-3 years)
  const yearMarkers = [];
  const step = yearRange <= 10 ? 1 : yearRange <= 20 ? 2 : 3;
  for (let year = minYear; year <= maxYear; year += step) {
    yearMarkers.push(year);
  }
  // Always include the last year
  if (!yearMarkers.includes(maxYear)) {
    yearMarkers.push(maxYear);
  }

  // Get medal icon based on position (for visual variety)
  const getMedalIcon = (index: number) => {
    const medals = ['🥇', '🥈', '🥉'];
    return medals[index % medals.length];
  };

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {data.map((barangay, index) => (
          <div key={barangay.barangay_name} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: barangay.color }}
            />
            <span className="text-sm font-medium">{barangay.barangay_name}</span>
            <span className="text-xs text-gray-500">
              ({barangay.awards.length} {barangay.awards.length === 1 ? 'award' : 'awards'})
            </span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative py-8 px-4">
        {/* Horizontal timeline line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 transform -translate-y-1/2" />

        {/* Year markers */}
        <div className="relative flex justify-between items-center">
          {yearMarkers.map(year => (
            <div key={year} className="flex flex-col items-center">
              {/* Year marker dot */}
              <div className="w-3 h-3 bg-gray-400 rounded-full mb-2 z-10" />
              
              {/* Year label */}
              <div className="text-xs text-gray-600 font-medium">{year}</div>
            </div>
          ))}
        </div>

        {/* Award markers for each barangay */}
        <div className="relative mt-8 space-y-6">
          {data.map((barangay, barangayIndex) => (
            <div key={barangay.barangay_name} className="relative">
              {/* Barangay name */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: barangay.color }}
                />
                <span className="text-sm font-medium">{barangay.barangay_name}</span>
              </div>

              {/* Award markers */}
              <div className="relative h-12 bg-gray-50 rounded-lg">
                {barangay.awards.map((award, awardIndex) => {
                  // Calculate position based on year
                  const position = ((award.year - minYear) / (maxYear - minYear)) * 100;
                  
                  return (
                    <div
                      key={`${award.year}-${award.cycle_id}`}
                      className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 cursor-pointer"
                      style={{ left: `${position}%` }}
                      onMouseEnter={() => setHoveredAward({ barangay: barangay.barangay_name, year: award.year })}
                      onMouseLeave={() => setHoveredAward(null)}
                    >
                      {/* Medal icon */}
                      <div className="text-2xl hover:scale-125 transition-transform">
                        {getMedalIcon(awardIndex)}
                      </div>

                      {/* Tooltip */}
                      {hoveredAward?.barangay === barangay.barangay_name && hoveredAward?.year === award.year && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none z-20">
                          <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap">
                            <div className="font-semibold">{barangay.barangay_name}</div>
                            <div>Year: {award.year}</div>
                            <div className="text-gray-300">{award.award_type}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile-friendly List View */}
      <div className="mt-8 md:hidden space-y-4">
        <h4 className="text-sm font-semibold mb-3">Award History</h4>
        {data.map((barangay, index) => (
          <div key={barangay.barangay_name} className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: barangay.color }}
              />
              <span className="font-medium">{barangay.barangay_name}</span>
            </div>
            
            {barangay.awards.length > 0 ? (
              <div className="space-y-2">
                {barangay.awards.map((award, awardIndex) => (
                  <div key={`${award.year}-${award.cycle_id}`} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">{getMedalIcon(awardIndex)}</span>
                      <span>Year {award.year}</span>
                    </span>
                    <span className="text-gray-600">{award.award_type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No awards yet</div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-semibold mb-2">Timeline Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Year Range</div>
            <div className="font-medium">{minYear} - {maxYear}</div>
          </div>
          <div>
            <div className="text-gray-600">Total Awards</div>
            <div className="font-medium">
              {data.reduce((sum, b) => sum + b.awards.length, 0)}
            </div>
          </div>
          <div>
            <div className="text-gray-600">Most Awards</div>
            <div className="font-medium">
              {data.reduce((max, b) => b.awards.length > max.awards.length ? b : max, data[0]).barangay_name}
            </div>
          </div>
          <div>
            <div className="text-gray-600">Years Covered</div>
            <div className="font-medium">{yearRange} {yearRange === 1 ? 'year' : 'years'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
