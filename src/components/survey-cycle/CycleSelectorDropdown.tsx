"use client";

import { useState } from 'react';
import { Check, ChevronDown, Calendar, AlertCircle } from 'lucide-react';
import { useSurveyCycle } from '@/contexts/SurveyCycleContext';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface CycleSelectorDropdownProps {
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
  adminOnly?: boolean; // New prop to indicate this is for admin cycle management
}

export function CycleSelectorDropdown({ 
  className = '', 
  showLabel = true,
  compact = false,
  adminOnly = false
}: CycleSelectorDropdownProps) {
  const { user, isAuthenticated } = useAuth();
  const { 
    activeCycle, 
    allCycles, 
    loading, 
    error, 
    setActiveCycle 
  } = useSurveyCycle();
  
  const [isChanging, setIsChanging] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);

  // Check if user has admin permissions to change cycles
  const canChangeCycle = isAuthenticated && user?.role === 'admin' && adminOnly;

  const handleCycleChange = async (cycleIdString: string) => {
    if (!canChangeCycle) return;
    
    const cycleId = parseInt(cycleIdString, 10);
    if (isNaN(cycleId)) return;

    setIsChanging(true);
    setChangeError(null);

    try {
      await setActiveCycle(cycleId);
    } catch (error) {
      setChangeError(error instanceof Error ? error.message : 'Failed to change cycle');
    } finally {
      setIsChanging(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {showLabel && (
          <Skeleton className="h-4 w-24" />
        )}
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load survey cycles: {error}
        </AlertDescription>
      </Alert>
    );
  }

  // No cycles available
  if (allCycles.length === 0) {
    return (
      <Alert className={className}>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          No survey cycles available. Contact an administrator to create cycles.
        </AlertDescription>
      </Alert>
    );
  }

  const currentValue = activeCycle?.cycle_id?.toString() || '';

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">
            {adminOnly ? "Manage Active Survey Cycle" : "Survey Cycle"}
          </label>
          {activeCycle && (
            <Badge variant="secondary" className="text-xs">
              Active
            </Badge>
          )}
        </div>
      )}
      
      <Select
        value={currentValue}
        onValueChange={handleCycleChange}
        disabled={!canChangeCycle || isChanging || allCycles.length === 0}
      >
        <SelectTrigger className={compact ? "h-8 text-sm" : "h-10"}>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <SelectValue 
              placeholder={
                activeCycle 
                  ? `${activeCycle.name} (${activeCycle.year})`
                  : "No active cycle"
              }
            />
          </div>
        </SelectTrigger>
        
        <SelectContent>
          {allCycles.map((cycle) => (
            <SelectItem 
              key={cycle.cycle_id} 
              value={cycle.cycle_id.toString()}
              className="flex items-center justify-between"
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

      {/* Change error display */}
      {changeError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {changeError}
          </AlertDescription>
        </Alert>
      )}

      {/* Permission notice for non-admin users */}
      {!canChangeCycle && isAuthenticated && adminOnly && (
        <p className="text-xs text-muted-foreground">
          Only administrators can change the active survey cycle.
        </p>
      )}

      {/* Loading indicator during change */}
      {isChanging && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
          Changing cycle...
        </div>
      )}
    </div>
  );
}

// Compact version for navigation bars
export function CompactCycleSelector({ className = '' }: { className?: string }) {
  return (
    <CycleSelectorDropdown 
      className={className}
      showLabel={false}
      compact={true}
    />
  );
}

// Display-only version that shows current cycle without dropdown
export function CycleDisplay({ className = '' }: { className?: string }) {
  const { activeCycle, loading, error } = useSurveyCycle();

  // Check if we're using white text styling
  const isWhiteText = className.includes('text-white');

  if (loading) {
    return <Skeleton className={`h-6 w-32 ${className}`} />;
  }

  if (error || !activeCycle) {
    return (
      <div className={`flex items-center gap-2 text-sm ${isWhiteText ? 'text-white/70' : 'text-muted-foreground'} ${className}`}>
        <AlertCircle className="h-4 w-4" />
        No active cycle
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <Calendar className={`h-4 w-4 ${isWhiteText ? 'text-white/70' : 'text-muted-foreground'}`} />
      <span className="font-medium">{activeCycle.name}</span>
      <Badge variant={isWhiteText ? "outline" : "secondary"} className={`text-xs ${isWhiteText ? 'border-white/30 text-white' : ''}`}>
        {activeCycle.year}
      </Badge>
    </div>
  );
}