"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CycleSelectorDropdown, CycleDisplay } from "@/components/survey-cycle";
import { useSurveyCycle, useActiveCycle } from "@/hooks/useSurveyCycle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CycleTestPage() {
  const { 
    activeCycle, 
    allCycles, 
    loading, 
    error, 
    refreshActiveCycle, 
    refreshAllCycles 
  } = useSurveyCycle();
  
  const { hasActiveCycle, cycleId, cycleName, cycleYear } = useActiveCycle();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Survey Cycle Context Test</h1>
      
      {/* Cycle Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Cycle Selector Component</CardTitle>
        </CardHeader>
        <CardContent>
          <CycleSelectorDropdown adminOnly={true} />
        </CardContent>
      </Card>

      {/* Cycle Display */}
      <Card>
        <CardHeader>
          <CardTitle>Cycle Display Component</CardTitle>
        </CardHeader>
        <CardContent>
          <CycleDisplay />
        </CardContent>
      </Card>

      {/* Context State */}
      <Card>
        <CardHeader>
          <CardTitle>Context State</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Loading State</h4>
              <Badge variant={loading ? "default" : "secondary"}>
                {loading ? "Loading" : "Loaded"}
              </Badge>
            </div>
            
            <div>
              <h4 className="font-semibold">Has Active Cycle</h4>
              <Badge variant={hasActiveCycle ? "default" : "destructive"}>
                {hasActiveCycle ? "Yes" : "No"}
              </Badge>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <h4 className="font-semibold text-red-800">Error</h4>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {activeCycle && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <h4 className="font-semibold text-green-800">Active Cycle</h4>
              <div className="text-sm text-green-600 space-y-1">
                <p><strong>ID:</strong> {activeCycle.cycle_id}</p>
                <p><strong>Name:</strong> {activeCycle.name}</p>
                <p><strong>Year:</strong> {activeCycle.year}</p>
                <p><strong>Active:</strong> {activeCycle.is_active ? 'Yes' : 'No'}</p>
                {activeCycle.start_date && (
                  <p><strong>Start Date:</strong> {new Date(activeCycle.start_date).toLocaleDateString()}</p>
                )}
                {activeCycle.end_date && (
                  <p><strong>End Date:</strong> {new Date(activeCycle.end_date).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-semibold">All Cycles ({allCycles.length})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {allCycles.map((cycle) => (
                <div 
                  key={cycle.cycle_id} 
                  className={`p-2 border rounded text-sm ${
                    cycle.is_active ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{cycle.name} ({cycle.year})</span>
                    {cycle.is_active && (
                      <Badge variant="default" className="text-xs">Active</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={refreshActiveCycle} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              Refresh Active Cycle
            </Button>
            <Button 
              onClick={refreshAllCycles} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              Refresh All Cycles
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hook Values */}
      <Card>
        <CardHeader>
          <CardTitle>useActiveCycle Hook Values</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Cycle ID:</strong> {cycleId || 'None'}
            </div>
            <div>
              <strong>Cycle Name:</strong> {cycleName || 'None'}
            </div>
            <div>
              <strong>Cycle Year:</strong> {cycleYear || 'None'}
            </div>
            <div>
              <strong>Has Active Cycle:</strong> {hasActiveCycle ? 'Yes' : 'No'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}