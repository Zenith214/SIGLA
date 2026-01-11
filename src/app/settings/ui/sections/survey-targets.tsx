"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp, Edit, Trash2, AlertTriangle, Calculator } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { useActiveCycle } from "@/hooks/useSurveyCycle"

// MoE Calculation Display Component
function MoECalculationPopover({ sampleSize }: { sampleSize: number }) {
  const n = sampleSize || 150;
  const moe = (0.98 / Math.sqrt(n)) * 100;
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 underline decoration-dotted underline-offset-2 transition-colors">
          <Calculator className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Show Calculation</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4 z-[10000]" align="start" sideOffset={8}>
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Calculator className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Margin of Error Calculation</h4>
          </div>
          
          <div className="space-y-2">
            <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm">
              <div className="text-gray-700 mb-1">Formula:</div>
              <div className="text-lg font-semibold text-gray-900">
                MoE = 0.98 / √n
              </div>
            </div>
            
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600">Where:</span>
              </div>
              <div className="pl-3 space-y-1">
                <div className="flex items-start gap-2">
                  <span className="font-mono font-semibold text-blue-600 min-w-[60px]">MoE</span>
                  <span className="text-gray-700">= Margin of Error (as a percentage)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono font-semibold text-blue-600 min-w-[60px]">0.98</span>
                  <span className="text-gray-700">= Z-score constant for 95% confidence level</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono font-semibold text-blue-600 min-w-[60px]">n</span>
                  <span className="text-gray-700">= Sample size (number of respondents)</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="text-xs font-semibold text-blue-900 mb-2">Current Calculation:</div>
              <div className="font-mono text-sm space-y-1">
                <div className="text-gray-700">
                  MoE = 0.98 / √{n}
                </div>
                <div className="text-gray-700">
                  MoE = 0.98 / {Math.sqrt(n).toFixed(2)}
                </div>
                <div className="text-blue-900 font-semibold text-base pt-1 border-t border-blue-200">
                  MoE = ±{moe.toFixed(2)}%
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-600 leading-relaxed pt-2 border-t">
              <strong>What this means:</strong> If you survey {n} people, your results will be accurate within ±{moe.toFixed(1)}% of the true population value, 95% of the time.
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function SurveyTargets() {
  const [targets, setTargets] = useState<any[]>([])
  const [barangays, setBarangays] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addModal, setAddModal] = useState(false)
  const [addForm, setAddForm] = useState<any>({ barangay_id: "", target: 150 })
  const [saving, setSaving] = useState(false)
  const [editingTarget, setEditingTarget] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<any | null>(null)
  const [deletingTarget, setDeletingTarget] = useState<any | null>(null)
  const [bulkCreating, setBulkCreating] = useState(false)
  const { toast } = useToast()
  const { activeCycle, hasActiveCycle, loading: cycleLoading } = useActiveCycle()

  useEffect(() => {
    if (!hasActiveCycle || !activeCycle) {
      setLoading(false)
      return
    }

    setLoading(true)
    Promise.all([
      fetch("/api/survey-targets").then(r => r.json()),
      fetch(`/api/cycle-awards?cycle_id=${activeCycle.cycle_id}`).then(r => r.json()),
      fetch("/api/barangays").then(r => r.json()),
    ])
      .then(([targetsData, awardsResponse, barangaysData]) => {
        console.log('🔍 Awards Response:', awardsResponse)
        console.log('🔍 Barangays Data:', barangaysData)
        
        setTargets(targetsData)
        
        // Get all barangays data
        let allBarangays: any[] = []
        if (Array.isArray(barangaysData)) {
          allBarangays = barangaysData
        } else if (barangaysData?.data && Array.isArray(barangaysData.data)) {
          allBarangays = barangaysData.data
        }
        
        // Extract awards data from response - handle nested data structure
        let awardsData = []
        if (awardsResponse?.success && awardsResponse?.data) {
          awardsData = awardsResponse.data
        } else if (awardsResponse?.data) {
          awardsData = awardsResponse.data
        } else if (Array.isArray(awardsResponse)) {
          awardsData = awardsResponse
        }
        
        console.log('🔍 Extracted Awards Data:', awardsData)
        
        // Get barangay IDs that have awards (is_awardee = true) in the active cycle
        const awardedBarangayIds = new Set(
          Array.isArray(awardsData) 
            ? awardsData
                .filter((award: any) => award.is_awardee === true)
                .map((award: any) => award.barangay_id)
            : []
        )
        
        console.log('🔍 Awarded Barangay IDs:', Array.from(awardedBarangayIds))
        
        // Filter barangays: ONLY include those with awards in the current cycle
        const filteredBarangays = allBarangays.filter((b: any) => 
          awardedBarangayIds.has(b.id)
        )
        
        console.log('🔍 Filtered Barangays:', filteredBarangays.map(b => ({ id: b.id, name: b.name })))
        
        setBarangays(filteredBarangays)
        setLoading(false)
      })
      .catch((err) => {
        console.error('❌ Error loading data:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [hasActiveCycle, activeCycle])

  // Add Target
  const handleAddChange = (e: any) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value })
  }
  const handleAddSave = async () => {
    // Validation
    if (!addForm.barangay_id) {
      toast({
        title: "Validation Error",
        description: "Please select a barangay.",
        variant: "destructive"
      });
      return;
    }
    
    const targetValue = Number(addForm.target);
    if (targetValue <= 0) {
      toast({
        title: "Validation Error",
        description: "Target responses must be greater than zero.",
        variant: "destructive"
      });
      return;
    }
    
    setSaving(true)
    try {
      const payload = { ...addForm, barangay_id: Number(addForm.barangay_id), target: targetValue }
      const res = await fetch("/api/survey-targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add target");
      }
      const created = await res.json()
      setTargets([...targets, created])
      setAddModal(false)
      setAddForm({ barangay_id: "", target: 150 })
      toast({
        title: "Survey Target Added!",
        description: "New survey target has been created successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Add Target Failed",
        description: err.message || "An unexpected error occurred while adding the survey target.",
        variant: "destructive"
      });
    } finally {
      setSaving(false)
    }
  }

  // Edit Target
  const handleEditClick = (target: any) => {
    setEditingTarget(target)
    setEditForm({ ...target })
  }
  const handleEditChange = (e: any) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }
  const handleEditSave = async () => {
    // Validation
    const targetValue = Number(editForm.target);
    if (targetValue <= 0) {
      toast({
        title: "Validation Error",
        description: "Target responses must be greater than zero.",
        variant: "destructive"
      });
      return;
    }
    
    setSaving(true)
    try {
      // Only send fields that should be updated (exclude survey_cycle_id)
      const payload = { 
        target_id: Number(editForm.target_id), 
        barangay_id: Number(editForm.barangay_id), 
        target: targetValue
      }
      const res = await fetch("/api/survey-targets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update target");
      }
      const updated = await res.json()
      setTargets(targets.map(t => (t.target_id === updated.target_id ? updated : t)))
      setEditingTarget(null)
      setEditForm(null)
      toast({
        title: "Survey Target Updated!",
        description: "Survey target has been updated successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "An unexpected error occurred while updating the survey target.",
        variant: "destructive"
      });
    } finally {
      setSaving(false)
    }
  }

  // Delete Target
  const handleDeleteClick = (target: any) => setDeletingTarget(target)
  const handleDeleteConfirm = async () => {
    if (!deletingTarget) return
    setSaving(true)
    try {
      const res = await fetch("/api/survey-targets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_id: deletingTarget.target_id }),
      })
      if (!res.ok) throw new Error("Failed to delete target")
      setTargets(targets.filter(t => t.target_id !== deletingTarget.target_id))
      setDeletingTarget(null)
      toast({
        title: "Survey Target Deleted",
        description: "Survey target has been deleted successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Delete Failed",
        description: err.message || "An unexpected error occurred while deleting the survey target.",
        variant: "destructive"
      });
    } finally {
      setSaving(false)
    }
  }

  // Bulk Create Targets for All Awardees
  const handleBulkCreateTargets = async () => {
    if (!activeCycle) {
      toast({
        title: "No Active Cycle",
        description: "Please set an active cycle first.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm(`Create survey targets (150 responses each) for all awardees in ${activeCycle.name}?\n\nThis will only create targets for awardees that don't already have targets.`)) {
      return;
    }

    setBulkCreating(true);
    try {
      const response = await fetch('/api/survey-targets/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycle_id: activeCycle.cycle_id,
          default_target: 150
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Targets Created",
          description: `Successfully created ${data.created} survey targets for awardees.`,
        });
        
        // Refresh targets list
        const targetsResponse = await fetch("/api/survey-targets");
        const targetsData = await targetsResponse.json();
        setTargets(targetsData);
      } else {
        throw new Error(data.error || 'Failed to create targets');
      }
    } catch (err: any) {
      toast({
        title: "Bulk Create Failed",
        description: err.message || "Failed to create survey targets.",
        variant: "destructive"
      });
    } finally {
      setBulkCreating(false);
    }
  }

  // Recalculate Progress
  const [recalculating, setRecalculating] = useState(false);
  const handleRecalculateProgress = async () => {
    if (!activeCycle) {
      toast({
        title: "No Active Cycle",
        description: "Please set an active cycle first.",
        variant: "destructive"
      });
      return;
    }

    setRecalculating(true);
    try {
      const response = await fetch('/api/survey-targets/calculate-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Progress Recalculated",
          description: `Successfully updated progress for ${data.updated_count} survey targets.`,
        });
        
        // Refresh targets list
        const targetsResponse = await fetch("/api/survey-targets");
        const targetsData = await targetsResponse.json();
        setTargets(targetsData);
      } else {
        throw new Error(data.error || 'Failed to recalculate progress');
      }
    } catch (err: any) {
      toast({
        title: "Recalculation Failed",
        description: err.message || "Failed to recalculate survey target progress.",
        variant: "destructive"
      });
    } finally {
      setRecalculating(false);
    }
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Survey Targets</h1>
          <p className="text-gray-600 text-lg">Set and monitor survey response targets by barangay</p>
          {hasActiveCycle && (
            <p className="text-sm text-blue-600 mt-1">
              Active Cycle: {activeCycle?.name} ({activeCycle?.year})
            </p>
          )}
          {!hasActiveCycle && !cycleLoading && (
            <p className="text-sm text-amber-600 mt-1">
              ⚠️ No active survey cycle - Contact admin to set up a cycle
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-purple-500 hover:bg-purple-600 text-white" 
            onClick={handleRecalculateProgress}
            disabled={recalculating || !hasActiveCycle}
            title="Recalculate progress based on actual survey responses"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {recalculating ? 'Recalculating...' : 'Recalculate Progress'}
          </Button>
          <Button 
            className="bg-green-500 hover:bg-green-600 text-white" 
            onClick={handleBulkCreateTargets}
            disabled={bulkCreating || !hasActiveCycle}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {bulkCreating ? 'Creating...' : 'Bulk Create Targets'}
          </Button>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setAddModal(true)}>
            <Target className="w-4 h-4 mr-2" />
            Add Target
          </Button>
        </div>
      </div>

      {/* Add Target Modal */}
      {addModal && (
        <Dialog open={addModal} onOpenChange={open => { if (!open) setAddModal(false) }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Survey Target</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-sm font-medium mb-1">Barangay</label>
                <select name="barangay_id" value={addForm.barangay_id} onChange={handleAddChange} className="w-full border rounded px-2 py-1">
                  <option value="">Select Barangay</option>
                  {Array.isArray(barangays) && barangays.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Number of Respondents</label>
                <Input name="target" type="number" value={addForm.target} onChange={handleAddChange} min={1} />
                <p className="text-xs text-gray-500 mt-1">Must be greater than zero</p>
              </div>
              
              {/* Statistical Precision Reminder */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Statistical Precision Reminder</h4>
                    <div className="flex items-baseline gap-2 mb-2">
                      <p className="text-sm text-blue-800 font-medium">
                        At this target, your Margin of Error will be: <span className="text-lg font-bold">±{(() => {
                          const n = Number(addForm.target) || 150;
                          const moe = (0.98 / Math.sqrt(n)) * 100;
                          return moe.toFixed(1);
                        })()}%</span>
                      </p>
                      <MoECalculationPopover sampleSize={Number(addForm.target) || 150} />
                    </div>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      The Margin of Error at a 95% confidence level. This number represents how much the survey results can vary from the true opinion of the entire population. A lower margin of error means the results are more precise.
                    </p>
                    <div className="mt-2 pt-2 border-t border-blue-200">
                      <p className="text-xs text-blue-600 italic">
                        💡 Tip: Higher sample sizes reduce the margin of error but require more resources.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setAddModal(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleAddSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Target Modal */}
      {editingTarget && (
        <Dialog open={!!editingTarget} onOpenChange={open => { if (!open) setEditingTarget(null) }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Survey Target</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-sm font-medium mb-1">Barangay</label>
                <select name="barangay_id" value={editForm.barangay_id} onChange={handleEditChange} className="w-full border rounded px-2 py-1">
                  {Array.isArray(barangays) && barangays.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Number of Respondents</label>
                <Input name="target" type="number" value={editForm.target} onChange={handleEditChange} min={1} />
                <p className="text-xs text-gray-500 mt-1">Must be greater than zero</p>
              </div>
              
              {/* Statistical Precision Reminder */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Statistical Precision Reminder</h4>
                    <div className="flex items-baseline gap-2 mb-2">
                      <p className="text-sm text-blue-800 font-medium">
                        At this target, your Margin of Error will be: <span className="text-lg font-bold">±{(() => {
                          const n = Number(editForm.target) || 150;
                          const moe = (0.98 / Math.sqrt(n)) * 100;
                          return moe.toFixed(1);
                        })()}%</span>
                      </p>
                      <MoECalculationPopover sampleSize={Number(editForm.target) || 150} />
                    </div>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      The Margin of Error at a 95% confidence level. This number represents how much the survey results can vary from the true opinion of the entire population. A lower margin of error means the results are more precise.
                    </p>
                    <div className="mt-2 pt-2 border-t border-blue-200">
                      <p className="text-xs text-blue-600 italic">
                        💡 Tip: Higher sample sizes reduce the margin of error but require more resources.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditingTarget(null)} disabled={saving}>Cancel</Button>
              <Button onClick={handleEditSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Target Modal */}
      {deletingTarget && (
        <Dialog open={!!deletingTarget} onOpenChange={open => { if (!open) setDeletingTarget(null) }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Survey Target</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2 mt-4 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Warning:</span>
            </div>
            <div className="mt-2 text-red-600">
              Are you sure you want to delete this survey target? <br />
              <span className="font-semibold">This action cannot be undone.</span>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setDeletingTarget(null)} disabled={saving}>Cancel</Button>
              <Button onClick={handleDeleteConfirm} disabled={saving} className="bg-red-600 text-white">{saving ? 'Deleting...' : 'Delete'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Target Progress */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            <span>Target Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : Array.isArray(targets) && targets.length > 0 ? (
            <div className="space-y-6">
              {targets.map((target) => {
                const barangay = Array.isArray(barangays) ? barangays.find((b: any) => b.id === target.barangay_id) : null
                return (
                  <div key={target.target_id} className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 text-lg">{barangay ? barangay.name : ""}</h3>
                        <p className="text-sm text-gray-600">
                          {target.achieved} of {target.target} responses ({target.percentage}%)
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-semibold text-gray-900">{target.percentage}%</div>
                        <div className="text-sm text-gray-500">Complete</div>
                      </div>
                    </div>
                    <Progress value={target.percentage} className="h-3" />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEditClick(target)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" onClick={() => handleDeleteClick(target)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-gray-500 text-center">
              No survey targets found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}