"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserCheck, Plus, Trash2, Search, AlertTriangle, Users } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useActiveCycle } from "@/hooks/useSurveyCycle"

export function SupervisorAssignments() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [supervisors, setSupervisors] = useState<any[]>([])
  const [barangays, setBarangays] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [addingAssignment, setAddingAssignment] = useState(false)
  const [deletingAssignment, setDeletingAssignment] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [addForm, setAddForm] = useState<any>({
    supervisor_id: "",
    barangay_ids: [],
    cycle_id: "",
  })
  const { toast } = useToast()
  const { activeCycle, hasActiveCycle } = useActiveCycle()

  // Filter assignments based on search term
  const filteredAssignments = assignments.filter(assignment => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      assignment.supervisor_first_name?.toLowerCase().includes(searchLower) ||
      assignment.supervisor_last_name?.toLowerCase().includes(searchLower) ||
      assignment.barangay_name?.toLowerCase().includes(searchLower) ||
      assignment.cycle_name?.toLowerCase().includes(searchLower)
    )
  })

  // Group assignments by supervisor
  const groupedAssignments = filteredAssignments.reduce((acc: any, assignment: any) => {
    const key = `${assignment.supervisor_id}-${assignment.cycle_id}`
    if (!acc[key]) {
      acc[key] = {
        supervisor_id: assignment.supervisor_id,
        supervisor_name: `${assignment.supervisor_first_name} ${assignment.supervisor_last_name}`,
        supervisor_email: assignment.supervisor_email,
        cycle_id: assignment.cycle_id,
        cycle_name: assignment.cycle_name,
        cycle_year: assignment.cycle_year,
        barangays: []
      }
    }
    acc[key].barangays.push({
      id: assignment.id,
      barangay_id: assignment.barangay_id,
      barangay_name: assignment.barangay_name,
      status: assignment.status,
      assigned_at: assignment.assigned_at
    })
    return acc
  }, {})

  useEffect(() => {
    fetchData()
  }, [activeCycle])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [assignmentsRes, usersRes, targetsRes] = await Promise.all([
        fetch("/api/supervisor-assignments"),
        fetch("/api/users"),
        fetch("/api/survey-targets")
      ])

      if (!assignmentsRes.ok || !usersRes.ok || !targetsRes.ok) {
        throw new Error("Failed to fetch data")
      }

      const assignmentsData = await assignmentsRes.json()
      const usersData = await usersRes.json()
      const targetsData = await targetsRes.json()

      setAssignments(assignmentsData.data || [])
      
      // Filter only supervisors (fs role)
      const allUsers = usersData.users || usersData
      const supervisorsList = allUsers.filter((u: any) => u.role?.toLowerCase() === "fs")
      setSupervisors(supervisorsList)
      
      // Get barangays from survey targets (only barangays with targets for active cycle)
      // The API already filters by active cycle, so we just need to extract unique barangays
      const targets = Array.isArray(targetsData) ? targetsData : []
      
      // Create a map to ensure unique barangays
      const barangayMap = new Map()
      targets.forEach((t: any) => {
        if (t.barangay_id && !barangayMap.has(t.barangay_id)) {
          barangayMap.set(t.barangay_id, {
            barangay_id: t.barangay_id,
            barangay_name: t.barangay_name,
            id: t.barangay_id,
            name: t.barangay_name
          })
        }
      })
      
      const barangaysWithTargets = Array.from(barangayMap.values())
      setBarangays(barangaysWithTargets)
    } catch (error: any) {
      console.error("Error fetching data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch data"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddClick = () => {
    if (!hasActiveCycle) {
      toast({
        variant: "destructive",
        title: "No Active Cycle",
        description: "Please activate a survey cycle before creating assignments."
      })
      return
    }
    
    setAddingAssignment(true)
    setAddForm({
      supervisor_id: "",
      barangay_ids: [],
      cycle_id: activeCycle?.cycle_id || "",
    })
  }

  const handleBarangayToggle = (barangayId: number) => {
    setAddForm((prev: any) => {
      const barangay_ids = prev.barangay_ids.includes(barangayId)
        ? prev.barangay_ids.filter((id: number) => id !== barangayId)
        : [...prev.barangay_ids, barangayId]
      return { ...prev, barangay_ids }
    })
  }

  const handleAddSave = async () => {
    if (!addForm.supervisor_id || addForm.barangay_ids.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a supervisor and at least one barangay."
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/supervisor-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to create assignment")
      }

      toast({
        title: "Success!",
        description: data.message || "Supervisor assignments created successfully"
      })
      
      setAddingAssignment(false)
      fetchData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create assignment"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = (assignment: any) => {
    setDeletingAssignment(assignment)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingAssignment) return

    setSaving(true)
    try {
      const res = await fetch("/api/supervisor-assignments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingAssignment.id }),
      })

      if (!res.ok) {
        throw new Error("Failed to delete assignment")
      }

      toast({
        title: "Deleted",
        description: "Supervisor assignment removed successfully"
      })
      
      setDeletingAssignment(null)
      fetchData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete assignment"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 mb-2 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="p-8 text-center text-gray-500">Loading assignments...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supervisor Assignments</h1>
          <p className="text-gray-600">Assign supervisors to barangays for field operations management</p>
        </div>
        <Button 
          className="bg-purple-500 hover:bg-purple-600 text-white" 
          onClick={handleAddClick}
          disabled={!hasActiveCycle}
        >
          <Plus className="w-4 h-4 mr-2" />
          Assign Supervisor
        </Button>
      </div>

      {!hasActiveCycle && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">No active survey cycle. Please activate a cycle to create assignments.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Supervisors</p>
                <p className="text-2xl font-bold text-gray-900">{supervisors.length}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-800">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-800">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned Supervisors</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(groupedAssignments).length}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-800">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-purple-500" />
            <span>Supervisor Assignments</span>
          </CardTitle>
        </CardHeader>
        
        {/* Search Bar */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by supervisor name, barangay, or cycle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>
        
        <CardContent>
          {Object.keys(groupedAssignments).length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No Assignments Yet</p>
              <p className="text-gray-500 mb-4">Start by assigning supervisors to barangays</p>
              <Button onClick={handleAddClick} disabled={!hasActiveCycle}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Assignment
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.values(groupedAssignments).map((group: any) => (
                <div key={`${group.supervisor_id}-${group.cycle_id}`} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{group.supervisor_name}</h3>
                      <p className="text-sm text-gray-600">{group.supervisor_email}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {group.cycle_name} ({group.cycle_year})
                      </Badge>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">
                      {group.barangays.length} Barangay{group.barangays.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {group.barangays.map((barangay: any) => (
                      <div key={barangay.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                        <span className="text-sm font-medium text-gray-700">{barangay.barangay_name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClick(barangay)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Assignment Modal */}
      {addingAssignment && (
        <Dialog open={addingAssignment} onOpenChange={open => { if (!open) setAddingAssignment(false) }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Assign Supervisor to Barangays</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-sm font-medium mb-2">Select Supervisor</label>
                <select
                  value={addForm.supervisor_id}
                  onChange={(e) => setAddForm({ ...addForm, supervisor_id: parseInt(e.target.value) })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Choose a supervisor...</option>
                  {supervisors.map(supervisor => (
                    <option key={supervisor.id} value={supervisor.id}>
                      {supervisor.firstName} {supervisor.lastName} ({supervisor.email})
                    </option>
                  ))}
                </select>
                {supervisors.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No supervisors found. Please create users with 'fs' role first.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Barangays ({addForm.barangay_ids.length} selected)
                </label>
                {barangays.length === 0 ? (
                  <div className="border rounded p-4 text-center bg-amber-50">
                    <p className="text-sm text-amber-800 font-medium">No barangays with survey targets</p>
                    <p className="text-xs text-amber-600 mt-1">
                      Please create survey targets for the active cycle first in Settings → Survey Targets
                    </p>
                  </div>
                ) : (
                  <div className="border rounded p-3 max-h-64 overflow-y-auto space-y-2">
                    {barangays.map((barangay, index) => {
                      const barangayId = barangay.barangay_id || barangay.id;
                      const barangayName = barangay.barangay_name || barangay.name;
                      return (
                        <label key={`barangay-${barangayId}-${index}`} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addForm.barangay_ids.includes(barangayId)}
                            onChange={() => handleBarangayToggle(barangayId)}
                            className="rounded"
                          />
                          <span className="text-sm">{barangayName}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Survey Cycle</label>
                <Input
                  value={activeCycle ? `${activeCycle.name} (${activeCycle.year})` : "No active cycle"}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setAddingAssignment(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleAddSave} disabled={saving}>
                {saving ? 'Assigning...' : 'Assign Supervisor'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAssignment && (
        <Dialog open={!!deletingAssignment} onOpenChange={open => { if (!open) setDeletingAssignment(null) }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Remove Assignment</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2 mt-4 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Confirm Removal</span>
            </div>
            <div className="mt-2 text-gray-700">
              Are you sure you want to remove the assignment for <b>{deletingAssignment.barangay_name}</b>?
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setDeletingAssignment(null)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleDeleteConfirm} disabled={saving} className="bg-red-600 text-white hover:bg-red-700">
                {saving ? 'Removing...' : 'Remove'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
