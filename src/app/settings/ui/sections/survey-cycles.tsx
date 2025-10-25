"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Edit, Trash2, AlertTriangle, CheckCircle, Power, Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useActiveCycle, useSurveyCycle } from "@/hooks/useSurveyCycle"

// Data will be fetched from API

export function SurveyCycles() {
  const [surveyCycles, setSurveyCycles] = useState<any[]>([])
  const [selectedYear, setSelectedYear] = useState("2024")
  const [archivePrevious, setArchivePrevious] = useState(false)
  const [dateTime, setDateTime] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [cycleName, setCycleName] = useState("")
  const [editingCycle, setEditingCycle] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [deletingCycle, setDeletingCycle] = useState<any | null>(null)
  const [activatingCycle, setActivatingCycle] = useState<any | null>(null)
  const [completingCycle, setCompletingCycle] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const { activeCycle } = useActiveCycle()
  const { refreshActiveCycle } = useSurveyCycle()

  useEffect(() => {
    const update = () => setDateTime(new Date().toLocaleString())
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  // Fetch survey cycles from API
  useEffect(() => {
    fetchSurveyCycles()
  }, [])

  const fetchSurveyCycles = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/survey-cycles')
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${res.status}: Failed to fetch survey cycles`)
      }
      const response = await res.json()
      const cycles = response.data || response
      setSurveyCycles(Array.isArray(cycles) ? cycles : [])
      setError(null)
    } catch (err: any) {
      console.error('Fetch survey cycles error:', err)
      setError(err.message || 'Unknown error occurred while fetching survey cycles')
      setSurveyCycles([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCycle = async () => {
    // Validation
    if (!cycleName.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter a name for the survey cycle.",
      });
      return
    }
    
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select both start and end dates for the survey cycle.",
      });
      return
    }

    // Validate date range
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (start >= end) {
      toast({
        variant: "destructive",
        title: "Invalid Date Range",
        description: "End date must be after start date.",
      });
      return
    }
    
    setSaving(true)
    try {
      const res = await fetch('/api/survey-cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cycleName.trim(),
          year: parseInt(selectedYear),
          start_date: start.toISOString(),
          end_date: end.toISOString()
        })
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to create survey cycle')
      }
      
      fetchSurveyCycles()
      
      // Clear form
      setStartDate('')
      setEndDate('')
      setCycleName('')
      
      toast({
        title: "Survey Cycle Created!",
        description: `${cycleName} survey cycle has been created successfully.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: err.message || "An unexpected error occurred while creating the survey cycle.",
      });
    } finally {
      setSaving(false)
    }
  }

  // Edit cycle
  const handleEditClick = (cycle: any) => {
    setEditingCycle(cycle)
    setEditForm({
      ...cycle,
      start_date: cycle.start_date ? new Date(cycle.start_date).toISOString().split('T')[0] : '',
      end_date: cycle.end_date ? new Date(cycle.end_date).toISOString().split('T')[0] : ''
    })
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleEditSave = async () => {
    // Validation
    if (!editForm.name?.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter a name for the survey cycle.",
      });
      return
    }

    if (editForm.start_date && editForm.end_date) {
      const start = new Date(editForm.start_date)
      const end = new Date(editForm.end_date)
      if (start >= end) {
        toast({
          variant: "destructive",
          title: "Invalid Date Range",
          description: "End date must be after start date.",
        });
        return
      }
    }

    setSaving(true)
    try {
      const res = await fetch('/api/survey-cycles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycle_id: editForm.cycle_id || editForm.id,
          name: editForm.name.trim(),
          year: parseInt(editForm.year),
          start_date: editForm.start_date ? new Date(editForm.start_date).toISOString() : null,
          end_date: editForm.end_date ? new Date(editForm.end_date).toISOString() : null
        })
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to update survey cycle')
      }
      
      fetchSurveyCycles()
      setEditingCycle(null)
      setEditForm({})
      toast({
        title: "Survey Cycle Updated!",
        description: `${editForm.name} survey cycle has been updated successfully.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message || "An unexpected error occurred while updating the survey cycle.",
      });
    } finally {
      setSaving(false)
    }
  }

  // Delete cycle
  const handleDeleteClick = (cycle: any) => {
    setDeletingCycle(cycle)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingCycle) return
    setSaving(true)
    try {
      const res = await fetch('/api/survey-cycles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycle_id: deletingCycle.cycle_id })
      })
      
      if (!res.ok) throw new Error('Failed to delete survey cycle')
      
      fetchSurveyCycles()
      setDeletingCycle(null)
      toast({
        title: "Survey Cycle Deleted",
        description: `${deletingCycle.year} survey cycle has been deleted successfully.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: err.message || "An unexpected error occurred while deleting the survey cycle.",
      });
    } finally {
      setSaving(false)
    }
  }

  // Set active cycle
  const handleSetActiveClick = (cycle: any) => {
    setActivatingCycle(cycle)
  }

  const handleSetActiveConfirm = async () => {
    if (!activatingCycle) return
    setSaving(true)
    try {
      const res = await fetch('/api/survey-cycles/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycle_id: activatingCycle.cycle_id || activatingCycle.id })
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to set active survey cycle')
      }
      
      // Refresh both the cycles list and active cycle context
      await Promise.all([
        fetchSurveyCycles(),
        refreshActiveCycle()
      ])
      
      setActivatingCycle(null)
      toast({
        title: "Active Cycle Set!",
        description: `${activatingCycle.name || activatingCycle.year} is now the active survey cycle.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Activation Failed",
        description: err.message || "An unexpected error occurred while setting the active survey cycle.",
      });
    } finally {
      setSaving(false)
    }
  }

  const handleCompleteCycleClick = (cycle: any) => {
    setCompletingCycle(cycle)
  }

  const handleCompleteCycleConfirm = async () => {
    if (!completingCycle) return
    setSaving(true)
    try {
      const res = await fetch('/api/survey-cycles/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycle_id: completingCycle.cycle_id || completingCycle.id })
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to complete survey cycle')
      }
      
      // Refresh both the cycles list and active cycle context
      await Promise.all([
        fetchSurveyCycles(),
        refreshActiveCycle()
      ])
      
      setCompletingCycle(null)
      toast({
        title: "Cycle Completed!",
        description: `${completingCycle.name || completingCycle.year} has been marked as completed and is no longer active.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Completion Failed",
        description: err.message || "An unexpected error occurred while completing the survey cycle.",
      });
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Survey Cycles</h1>
          <p className="text-gray-600 text-lg">Manage survey cycles and their schedules</p>
          {activeCycle ? (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-700 font-medium">
                Currently Active: {activeCycle.name} ({activeCycle.year})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-amber-700 font-medium">
                No active survey cycle set
              </span>
            </div>
          )}
        </div>
        <span className="text-xs md:text-sm font-mono bg-gray-200 rounded px-2 py-1 self-end">{dateTime}</span>
      </div>

      {/* Active Survey Cycle */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Calendar className="w-6 h-6 text-blue-500" />
            <span>Active Survey Cycle</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cycle-name" className="text-sm font-medium">
                Cycle Name <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="cycle-name" 
                type="text" 
                placeholder="e.g., PULSE Survey 2025"
                value={cycleName}
                onChange={(e) => setCycleName(e.target.value)}
                className="bg-white border-gray-300 rounded" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="survey-year" className="text-sm font-medium">
                Survey Year <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-white border-gray-300 rounded">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-sm font-medium">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="start-date" 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white border-gray-300 rounded" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-sm font-medium">
                End Date <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="end-date" 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white border-gray-300 rounded" 
              />
            </div>
          </div>

          <Button 
            onClick={handleCreateCycle}
            disabled={saving || !cycleName.trim() || !startDate || !endDate}
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            {saving ? 'Creating...' : 'Create New Survey Cycle'}
          </Button>
        </CardContent>
      </Card>

      {/* Survey Cycle History */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Survey Cycle History</CardTitle>
        </CardHeader>
        
        {/* Search Bar */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search cycles by name, year, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">Loading survey cycles...</div>
            </div>
          ) : error ? (
            <div className="text-red-500 py-8 text-center">
              Error: {error}
            </div>
          ) : surveyCycles.length === 0 ? (
            <div className="text-gray-500 py-8 text-center">
              No survey cycles found
            </div>
          ) : (() => {
            // Filter survey cycles based on search term
            const filteredCycles = surveyCycles.filter(cycle => {
              if (!searchTerm) return true
              
              const searchLower = searchTerm.toLowerCase()
              return (
                cycle.name.toLowerCase().includes(searchLower) ||
                cycle.year.toString().includes(searchLower) ||
                (cycle.is_active ? 'active' : 'inactive').includes(searchLower)
              )
            })
            
            return filteredCycles.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">No cycles found</p>
                <p className="text-gray-500 mb-4">No cycles match your search criteria "{searchTerm}"</p>
                <Button 
                  onClick={() => setSearchTerm("")} 
                  variant="outline"
                  className="text-gray-600 hover:text-gray-800"
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCycles.map((cycle) => (
              <div
                key={cycle.cycle_id || cycle.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {cycle.name || `Survey Cycle ${cycle.year}`}
                    </h3>
                    <Badge
                      variant={
                        activeCycle && activeCycle.cycle_id === (cycle.cycle_id || cycle.id) ? "default" : "outline"
                      }
                      className="text-xs"
                    >
                      {activeCycle && activeCycle.cycle_id === (cycle.cycle_id || cycle.id) ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-sm text-gray-500">({cycle.year})</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {cycle.start_date ? new Date(cycle.start_date).toLocaleDateString() : 'N/A'} to {cycle.end_date ? new Date(cycle.end_date).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">{(cycle.responses || 0).toLocaleString()} responses collected</p>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Set Active Button - only show if not currently active */}
                  {(!activeCycle || activeCycle.cycle_id !== (cycle.cycle_id || cycle.id)) && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-green-600 hover:bg-green-50" 
                      onClick={() => handleSetActiveClick(cycle)}
                      title="Set as active cycle (reactivates if completed)"
                    >
                      <Power className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {/* Active Indicator & Complete Button */}
                  {activeCycle && activeCycle.cycle_id === (cycle.cycle_id || cycle.id) && (
                    <>
                      <div className="h-8 w-8 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 px-3 text-xs text-blue-600 border-blue-300 hover:bg-blue-50" 
                        onClick={() => handleCompleteCycleClick(cycle)}
                        title="Mark this cycle as completed"
                      >
                        Complete
                      </Button>
                    </>
                  )}
                  
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-200" onClick={() => handleEditClick(cycle)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  {cycle.status !== "Active" && (!activeCycle || activeCycle.cycle_id !== (cycle.cycle_id || cycle.id)) && (
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50" onClick={() => handleDeleteClick(cycle)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
                ))}
              </div>
            )
          })()}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingCycle && (
        <Dialog open={!!editingCycle} onOpenChange={open => { if (!open) setEditingCycle(null) }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Survey Cycle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input name="name" value={editForm.name || ''} onChange={handleEditChange} placeholder="e.g., PULSE Survey 2025" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <Input name="year" type="number" value={editForm.year || ''} onChange={handleEditChange} min="2020" max="2030" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <Input name="start_date" type="date" value={editForm.start_date || ''} onChange={handleEditChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <Input name="end_date" type="date" value={editForm.end_date || ''} onChange={handleEditChange} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditingCycle(null)} disabled={saving}>Cancel</Button>
              <Button onClick={handleEditSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Modal */}
      {deletingCycle && (
        <Dialog open={!!deletingCycle} onOpenChange={open => { if (!open) setDeletingCycle(null) }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Survey Cycle</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2 mt-4 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Warning:</span>
            </div>
            <div className="mt-2 text-red-600">
              Are you sure you want to delete the survey cycle for <b>{deletingCycle.year}</b>?<br />
              <span className="font-semibold">This action cannot be undone.</span>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setDeletingCycle(null)} disabled={saving}>Cancel</Button>
              <Button onClick={handleDeleteConfirm} disabled={saving} className="bg-red-600 text-white">{saving ? 'Deleting...' : 'Delete'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Set Active Modal */}
      {activatingCycle && (
        <Dialog open={!!activatingCycle} onOpenChange={open => { if (!open) setActivatingCycle(null) }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Set Active Survey Cycle</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2 mt-4 text-blue-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Confirmation:</span>
            </div>
            <div className="mt-2 text-gray-700">
              Are you sure you want to set <b>{activatingCycle.name || activatingCycle.year}</b> as the active survey cycle?
              <br /><br />
              {activeCycle ? (
                <span className="text-amber-600">
                  This will deactivate the current active cycle: <b>{activeCycle.name}</b>
                </span>
              ) : (
                <span className="text-green-600">
                  This will reactivate the cycle and allow you to continue collecting data.
                </span>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setActivatingCycle(null)} disabled={saving}>Cancel</Button>
              <Button onClick={handleSetActiveConfirm} disabled={saving} className="bg-green-600 text-white">
                {saving ? 'Setting Active...' : 'Set Active'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Complete Cycle Modal */}
      {completingCycle && (
        <Dialog open={!!completingCycle} onOpenChange={open => { if (!open) setCompletingCycle(null) }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Complete Survey Cycle</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2 mt-4 text-blue-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Confirmation:</span>
            </div>
            <div className="mt-2 text-gray-700">
              Are you sure you want to mark <b>{completingCycle.name || completingCycle.year}</b> as completed?
              <br /><br />
              <span className="text-amber-600">
                This will deactivate the cycle and preserve all collected data ({(completingCycle.responses || 0).toLocaleString()} responses). You can create a new cycle to continue data collection.
              </span>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setCompletingCycle(null)} disabled={saving}>Cancel</Button>
              <Button onClick={handleCompleteCycleConfirm} disabled={saving} className="bg-blue-600 text-white">
                {saving ? 'Completing...' : 'Complete Cycle'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
