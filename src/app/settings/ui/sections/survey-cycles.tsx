"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Edit, Trash2, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

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
  const [editingCycle, setEditingCycle] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [deletingCycle, setDeletingCycle] = useState<any | null>(null)
  const { addToast } = useToast()

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
      const data = await res.json()
      setSurveyCycles(Array.isArray(data) ? data : [])
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
    if (!startDate || !endDate) {
      addToast({
        type: "warning",
        title: "Missing Information",
        description: "Please select both start and end dates for the survey cycle.",
        duration: 4000
      });
      return
    }
    
    setSaving(true)
    try {
      const res = await fetch('/api/survey-cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: selectedYear,
          status: 'Active',
          start_date: new Date(startDate),
          end_date: new Date(endDate),
          responses: 0
        })
      })
      
      if (!res.ok) throw new Error('Failed to create survey cycle')
      
      // Archive previous cycle if requested
      if (archivePrevious) {
        const activeCycles = surveyCycles.filter(c => c.status === 'Active')
        for (const cycle of activeCycles) {
          await fetch('/api/survey-cycles', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cycle_id: cycle.cycle_id,
              status: 'Archived'
            })
          })
        }
      }
      
      fetchSurveyCycles()
      setStartDate('')
      setEndDate('')
      addToast({
        type: "success",
        title: "Survey Cycle Created!",
        description: `${selectedYear} survey cycle has been created successfully.`,
        duration: 4000
      });
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Creation Failed",
        description: err.message || "An unexpected error occurred while creating the survey cycle.",
        duration: 6000
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
    setSaving(true)
    try {
      const res = await fetch('/api/survey-cycles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycle_id: editForm.cycle_id,
          year: editForm.year,
          status: editForm.status,
          start_date: new Date(editForm.start_date),
          end_date: new Date(editForm.end_date),
          responses: parseInt(editForm.responses) || 0
        })
      })
      
      if (!res.ok) throw new Error('Failed to update survey cycle')
      
      fetchSurveyCycles()
      setEditingCycle(null)
      setEditForm({})
      addToast({
        type: "success",
        title: "Survey Cycle Updated!",
        description: `${editForm.year} survey cycle has been updated successfully.`,
        duration: 4000
      });
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Update Failed",
        description: err.message || "An unexpected error occurred while updating the survey cycle.",
        duration: 6000
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
      addToast({
        type: "success",
        title: "Survey Cycle Deleted",
        description: `${deletingCycle.year} survey cycle has been deleted successfully.`,
        duration: 4000
      });
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Delete Failed",
        description: err.message || "An unexpected error occurred while deleting the survey cycle.",
        duration: 6000
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
          <div className="space-y-2">
            <Label htmlFor="survey-year" className="text-sm font-medium">
              Active Survey Year
            </Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="bg-white border-gray-300 rounded max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-sm font-medium">
                Start Date
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
                End Date
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

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="archive-toggle" className="text-sm font-medium">
              Archive Previous Cycle
            </Label>
            <Switch id="archive-toggle" checked={archivePrevious} onCheckedChange={setArchivePrevious} />
          </div>

          <Button 
            onClick={handleCreateCycle}
            disabled={saving}
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Survey Cycle
          </Button>
        </CardContent>
      </Card>

      {/* Survey Cycle History */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Survey Cycle History</CardTitle>
        </CardHeader>
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
          ) : (
          <div className="space-y-4">
            {surveyCycles.map((cycle) => (
              <div
                key={cycle.cycle_id || cycle.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">{cycle.year}</h3>
                    <Badge
                      variant={
                        cycle.status === "Active" ? "default" : cycle.status === "Completed" ? "secondary" : "outline"
                      }
                      className="text-xs"
                    >
                      {cycle.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {cycle.start_date ? new Date(cycle.start_date).toLocaleDateString() : 'N/A'} to {cycle.end_date ? new Date(cycle.end_date).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">{(cycle.responses || 0).toLocaleString()} responses collected</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-200" onClick={() => handleEditClick(cycle)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  {cycle.status !== "Active" && (
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50" onClick={() => handleDeleteClick(cycle)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}
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
                <label className="block text-sm font-medium mb-1">Year</label>
                <Input name="year" value={editForm.year || ''} onChange={handleEditChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" value={editForm.status || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-2 py-1">
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <Input name="start_date" type="date" value={editForm.start_date || ''} onChange={handleEditChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <Input name="end_date" type="date" value={editForm.end_date || ''} onChange={handleEditChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Responses Count</label>
                <Input name="responses" type="number" value={editForm.responses || 0} onChange={handleEditChange} min={0} />
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
    </div>
  )
}
