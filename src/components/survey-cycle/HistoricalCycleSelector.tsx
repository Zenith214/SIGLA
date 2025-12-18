"use client";

import { useState, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSurveyCycle } from '@/contexts/SurveyCycleContext';

interface HistoricalCycleSelectorProps {
  className?: string;
  showLabel?: boolean;
  onCycleChange?: (cycleId: number | null) => void;
  placeholder?: string;
}

export function HistoricalCycleSelector({ 
  className = '', 
  showLabel = true,
  onCycleChange,
  placeholder = "Select cycle to view"
}: HistoricalCycleSelectorProps) {
  const { activeCycle, allCycles, loading } = useSurveyCycle();
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');

  // Get historical cycles (non-active cycles)
  const historicalCycles = allCycles.filter(cycle => !cycle.is_active);
  
  // Include active cycle in the list for comparison
  const availableCycles = [...allCycles].sort((a, b) => b.year - a.year);

  const handleCycleChange = (cycleIdString: string) => {
    setSelectedCycleId(cycleIdString);
    const cycleId = cycleIdString === "current" ? null : parseInt(cycleIdString, 10);
    onCycleChange?.(cycleId);
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {showLabel && (
          <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
        )}
        <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            View Historical Data
          </label>
          <Badge variant="outline" className="text-xs">
            Compare Cycles
          </Badge>
        </div>
      )}
      
      <Select
        value={selectedCycleId}
        onValueChange={handleCycleChange}
      >
        <SelectTrigger className="h-10">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        
        <SelectContent>
          {/* Current/Active cycle option */}
          {activeCycle && (
            <SelectItem value="current">
              <div className="flex items-center gap-2">
                <div>
                  <div className="font-medium">
                    Current: {activeCycle.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Year: {activeCycle.year} (Active)
                  </div>
                </div>
                <Badge variant="default" className="ml-2 text-xs">
                  Current
                </Badge>
              </div>
            </SelectItem>
          )}
          
          {/* All available cycles for comparison */}
          {availableCycles.map((cycle) => (
            <SelectItem 
              key={cycle.cycle_id} 
              value={cycle.cycle_id.toString()}
            >
              <div className="flex items-center gap-2">
                <div>
                  <div className="font-medium">
                    {cycle.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Year: {cycle.year}
                    {cycle.start_date && cycle.end_date && (
                      <span className="ml-2">
                        {new Date(cycle.start_date).toLocaleDateString()} - {new Date(cycle.end_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                {cycle.is_active && (
                  <Badge variant="default" className="ml-2 text-xs">
                    Active
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {availableCycles.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No historical cycles available for comparison.
        </p>
      )}
    </div>
  );
}