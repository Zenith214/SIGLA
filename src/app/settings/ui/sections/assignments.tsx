"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserCheck, Users, Edit, Trash2, AlertTriangle, Search } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useActiveCycle } from "@/hooks/useSurveyCycle"

const statusOptions = [
  "Assigned",    // Assignment created, interviewer notified
  "In Progress", // Interviewer has started collecting surveys
  "Completed"    // Assignment finished (target reached or manually completed)
];

export function Assignments() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [barangays, setBarangays] = useState<any[]>([])
  const [surveyTargets, setSurveyTargets] = useState<any[]>([])
  const [interviewers, setInterviewers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addModal, setAddModal] = useState(false)
  const [addForm, setAddForm] = useState<any>({ barangay_id: "", user_id: "", status: "Assigned" })
  const [saving, setSaving] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<any | null>(null)
  const [deletingAssignment, setDeletingAssignment] = useState<any | null>(null)
  const [lastStatusCheck, setLastStatusCheck] = useState<Date | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const { activeCycle, hasActiveCycle, loading: cycleLoading } = useActiveCycle()

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch("/api/assignments", { credentials: 'include' }).then(r => r.json()),
      fetch("/api/survey-targets", { credentials: 'include' }).then(r => r.json()),
      fetch("/api/barangays", { credentials: 'include' }).then(r => r.json()),
      fetch("/api/interviewers", { credentials: 'include' }).then(r => r.json()),
    ])
      .then(([assignmentsData, surveyTargetsData, barangaysData, interviewersData]) => {
        setAssignments(assignmentsData || [])
        setSurveyTargets(surveyTargetsData || [])
        // Handle the new barangays API response structure
        setBarangays(barangaysData?.data || barangaysData || [])

        // The interviewers API returns the data directly (no wrapping)
        setInterviewers(interviewersData || [])
        
        // Check and update assignment statuses based on survey progress
        checkAndUpdateAssignmentStatuses(assignmentsData || [], surveyTargetsData || [])
        
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Function to check and update assignment statuses based on survey progress
  const checkAndUpdateAssignmentStatuses = async (assignmentsData: any[], surveyTargetsData: any[]) => {
    const updatedAssignments: any[] = []
    
    for (const assignment of assignmentsData) {
      const target = surveyTargetsData.find((t: any) => t.barangay_id === assignment.barangay_id)
      
      if (target && assignment.status !== 'Completed') {
        const surveyProgress = Math.round((target.achieved || 0) / target.target * 100)
        
        // Auto-update assignment status based on survey progress
        let newStatus = assignment.status
        
        if (surveyProgress >= 100) {
          // Auto-complete when target is reached
          newStatus = 'Completed'
        } else if (surveyProgress > 0 && assignment.status === 'Assigned') {
          // Auto-progress to "In Progress" when surveys start coming in
          newStatus = 'In Progress'
        }
        
        if (newStatus !== assignment.status) {
          try {
            const response = await fetch("/api/assignments", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...assignment,
                status: newStatus
              }),
            })
            
            if (response.ok) {
              const updated = await response.json()
              updatedAssignments.push(updated)
              console.log(`✅ Auto-updated assignment status to "${newStatus}" for barangay ${assignment.barangay_id}`)
            }
          } catch (error) {
            console.error(`❌ Failed to auto-update assignment status for barangay ${assignment.barangay_id}:`, error)
          }
        }
      }
    }
    
    // Update assignments state if any were updated
    if (updatedAssignments.length > 0) {
      setAssignments(prev => 
        prev.map(a => {
          const updated = updatedAssignments.find(u => u.assignment_id === a.assignment_id)
          return updated || a
        })
      )
      
      toast({
        title: "Assignments Auto-Updated",
        description: `${updatedAssignments.length} assignment(s) marked as completed due to 100% survey progress.`,
      })
    }
    
    setLastStatusCheck(new Date())
  }

  // Add Assignment
  const handleAddChange = (e: any) => {
    const { name, value } = e.target
    setAddForm({ ...addForm, [name]: value })
  }

  // Removed unused handleAddSelectChange function

  const validateAddForm = () => {
    if (targetBarangays.length === 0) {
      toast({
        variant: "destructive",
        title: "No Survey Targets",
        description: "Please create survey targets first before assigning interviewers.",
      });
      return false
    }
    if (!addForm.barangay_id) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a barangay with survey targets for the assignment.",
      });
      return false
    }
    if (!addForm.user_id) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select an interviewer for the assignment.",
      });
      return false
    }
    if (!addForm.status) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a status for the assignment.",
      });
      return false
    }
    return true
  }

  const handleAddSave = async () => {
    if (!validateAddForm()) return

    setSaving(true)
    try {
      const payload = {
        barangay_id: Number(addForm.barangay_id),
        user_id: Number(addForm.user_id),
        status: addForm.status,
        progress: 0 // Always start with 0 progress
      }
      console.log('Sending assignment payload:', payload)

      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to add assignment")
      }

      const created = await res.json()
      setAssignments([...assignments, created])
      setAddModal(false)
      setAddForm({ barangay_id: "", user_id: "", status: "Pending" })
      
      // Check if the new assignment should be auto-completed
      await checkAndUpdateAssignmentStatuses([created], surveyTargets)
      
      toast({
        title: "Assignment Added Successfully!",
        description: "New interviewer assignment has been created.",
      });
    } catch (err: any) {
      console.error('Add assignment error:', err)
      toast({
        variant: "destructive",
        title: "Assignment Failed",
        description: err.message || "An unexpected error occurred while creating the assignment.",
      });
    } finally {
      setSaving(false)
    }
  }

  // Edit Assignment
  const handleEditClick = (assignment: any) => {
    setEditingAssignment(assignment)
    setEditForm({ ...assignment })
  }
  const handleEditChange = (e: any) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }
  const handleEditSave = async () => {
    setSaving(true)
    try {
      const payload = { ...editForm, assignment_id: Number(editForm.assignment_id), barangay_id: Number(editForm.barangay_id), user_id: Number(editForm.user_id) }
      const res = await fetch("/api/assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to update assignment")
      const updated = await res.json()
      setAssignments(assignments.map(a => (a.assignment_id === updated.assignment_id ? updated : a)))
      setEditingAssignment(null)
      setEditForm(null)
      toast({
        title: "Assignment Updated!",
        description: "Assignment has been updated successfully.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message || "An unexpected error occurred while updating the assignment.",
      });
    } finally {
      setSaving(false)
    }
  }

  // Delete Assignment
  const handleDeleteClick = (assignment: any) => setDeletingAssignment(assignment)
  const handleDeleteConfirm = async () => {
    if (!deletingAssignment) return
    setSaving(true)

    try {
      console.log(`Attempting to delete assignment ${deletingAssignment.assignment_id}`)

      const res = await fetch(`/api/assignments/${deletingAssignment.assignment_id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      console.log(`Delete response status: ${res.status}`)
      console.log(`Delete response ok: ${res.ok}`)

      if (!res.ok) {
        let errorMessage = `Failed to delete assignment (HTTP ${res.status})`

        // Try to get response text first
        const responseText = await res.text()
        console.log(`Error response text: "${responseText}"`)

        if (responseText) {
          try {
            const errorData = JSON.parse(responseText)
            errorMessage = errorData.error || errorData.message || errorMessage
          } catch (jsonError) {
            // If response is not JSON, use the text directly
            errorMessage = responseText || errorMessage
          }
        }
        throw new Error(errorMessage)
      }

      // Handle successful response
      const responseText = await res.text()
      console.log(`Success response text: "${responseText}"`)

      if (responseText) {
        try {
          const result = JSON.parse(responseText)
          console.log('Delete result:', result)
        } catch (jsonError) {
          console.warn('Delete response was not JSON, but status was OK:', responseText)
        }
      }

      // Update UI regardless of response format if status was OK
      setAssignments(assignments.filter(a => a.assignment_id !== deletingAssignment.assignment_id))
      setDeletingAssignment(null)
      toast({
        title: "Assignment Deleted",
        description: "Assignment has been deleted successfully.",
      });

    } catch (err: any) {
      console.error('Delete assignment error:', err)
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: err.message || "An unexpected error occurred while deleting the assignment.",
      });
    } finally {
      setSaving(false)
    }
  }

  // Get barangays that have survey targets
  const targetBarangays = surveyTargets.map(target => {
    const barangay = Array.isArray(barangays) ? barangays.find(b => b.id === target.barangay_id) : null
    return barangay ? { ...barangay, target } : null
  }).filter(Boolean)



  // Statistics
  const total = assignments.length
  const assigned = assignments.filter(a => a.status === "Assigned").length
  const inProgress = assignments.filter(a => a.status === "In Progress").length
  const completed = assignments.filter(a => a.status === "Completed").length
  const assignedBarangays = new Set(assignments.map(a => a.barangay_id)).size
  const assignedInterviewers = new Set(assignments.map(a => a.user_id)).size

  // Filter assignments based on search term
  const filteredAssignments = assignments.filter(assignment => {
    if (!searchTerm) return true
    
    const barangay = Array.isArray(barangays) ? barangays.find((b: any) => b.id === assignment.barangay_id || b.barangay_id === assignment.barangay_id) : null
    const interviewer = interviewers.find((u: any) => u.id === assignment.user_id)
    
    const searchLower = searchTerm.toLowerCase()
    
    return (
      // Search by barangay name
      (barangay?.name || barangay?.barangay_name || assignment.barangay_name || '').toLowerCase().includes(searchLower) ||
      // Search by interviewer name
      `${interviewer?.firstName || assignment.firstName || ''} ${interviewer?.lastName || assignment.lastName || ''}`.toLowerCase().includes(searchLower) ||
      // Search by email
      (interviewer?.email || assignment.email || '').toLowerCase().includes(searchLower) ||
      // Search by status
      assignment.status.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interviewer Assignments</h1>
          <div>
            <p className="text-gray-600">Assign interviewers to barangays and track assignment status</p>
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
            {lastStatusCheck && (
              <p className="text-xs text-gray-500 mt-1">
                Last status check: {lastStatusCheck.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => checkAndUpdateAssignmentStatuses(assignments, surveyTargets)}
            disabled={loading}
            className="text-gray-600 hover:text-gray-800"
          >
            <Users className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setAddModal(true)}>
            <UserCheck className="w-4 h-4 mr-2" />
            Add Assignment
          </Button>
        </div>
      </div>

      {/* Assignment Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{total}</div>
              <div className="text-xs text-gray-600">Total Assignments</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">{assigned}</div>
              <div className="text-xs text-gray-600">Assigned</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-xl font-bold text-teal-600">{assignedInterviewers}</div>
              <div className="text-xs text-gray-600">Interviewers Active</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{inProgress}</div>
              <div className="text-xs text-gray-600">In Progress</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">{completed}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-xl font-bold text-indigo-600">{assignedBarangays}</div>
              <div className="text-xs text-gray-600">Barangays Assigned</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Assignment Modal */}
      {addModal && (
        <Dialog open={addModal} onOpenChange={open => { if (!open) setAddModal(false) }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label htmlFor="barangay_id" className="text-sm font-medium">
                  Barangay *
                  <span className="text-xs text-gray-500 ml-1">
                    (Only barangays with survey targets)
                  </span>
                </Label>
                <select
                  id="barangay_id"
                  name="barangay_id"
                  value={addForm.barangay_id}
                  onChange={handleAddChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Barangay (With Survey Targets)</option>
                  {targetBarangays.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (Target: {b.target.target} responses)
                    </option>
                  ))}
                </select>
                {targetBarangays.length === 0 && !loading && (
                  <p className="text-xs text-red-500 mt-1">
                    No barangays with survey targets found. Please create survey targets first.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="user_id" className="text-sm font-medium">
                  Interviewer *
                  <span className="text-xs text-gray-500 ml-1">
                    ({interviewers.length} interviewers available)
                  </span>
                </Label>
                <select
                  id="user_id"
                  name="user_id"
                  value={addForm.user_id}
                  onChange={handleAddChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Interviewer</option>
                  {interviewers.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </option>
                  ))}
                </select>
                {interviewers.length === 0 && !loading && (
                  <p className="text-xs text-red-500 mt-1">
                    No interviewers found. Please ensure there are users with "interviewer" role.
                  </p>
                )}

              </div>

              <div>
                <Label htmlFor="status" className="text-sm font-medium">Status *</Label>
                <select
                  id="status"
                  name="status"
                  value={addForm.status}
                  onChange={handleAddChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>


            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setAddModal(false)
                  setAddForm({ barangay_id: "", user_id: "", status: "Pending" })
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSave}
                disabled={saving || interviewers.length === 0 || targetBarangays.length === 0}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {saving ? 'Saving...' : 'Save Assignment'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Assignment Modal */}
      {editingAssignment && (
        <Dialog open={!!editingAssignment} onOpenChange={open => { if (!open) setEditingAssignment(null) }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label htmlFor="edit_barangay_id" className="text-sm font-medium">Barangay</Label>
                <select
                  id="edit_barangay_id"
                  name="barangay_id"
                  value={editForm?.barangay_id || ''}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {targetBarangays.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (Target: {b.target.target} responses)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="edit_user_id" className="text-sm font-medium">Interviewer</Label>
                <select
                  id="edit_user_id"
                  name="user_id"
                  value={editForm?.user_id || ''}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {interviewers.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="edit_status" className="text-sm font-medium">Status</Label>
                <select
                  id="edit_status"
                  name="status"
                  value={editForm?.status || ''}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>


            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditingAssignment(null)} disabled={saving}>Cancel</Button>
              <Button onClick={handleEditSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Assignment Modal */}
      {deletingAssignment && (
        <Dialog open={!!deletingAssignment} onOpenChange={open => { if (!open) setDeletingAssignment(null) }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Assignment</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2 mt-4 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Warning:</span>
            </div>
            <div className="mt-2 text-red-600">
              Are you sure you want to delete this assignment? <br />
              <span className="font-semibold">This action cannot be undone.</span>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setDeletingAssignment(null)} disabled={saving}>Cancel</Button>
              <Button onClick={handleDeleteConfirm} disabled={saving} className="bg-red-600 text-white">{saving ? 'Deleting...' : 'Delete'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Assignment Overview Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span>Assignment Overview</span>
          </CardTitle>
        </CardHeader>
        
        {/* Search Bar */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search assignments by barangay, interviewer, email, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>
        
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : assignments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No assignments found</p>
              <p className="text-gray-500 mb-4">Get started by creating your first interviewer assignment.</p>
              <Button onClick={() => setAddModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white">
                <UserCheck className="w-4 h-4 mr-2" />
                Add First Assignment
              </Button>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No assignments found</p>
              <p className="text-gray-500 mb-4">No assignments match your search criteria "{searchTerm}"</p>
              <Button 
                onClick={() => setSearchTerm("")} 
                variant="outline"
                className="text-gray-600 hover:text-gray-800"
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-medium">Barangay</TableHead>
                    <TableHead className="font-medium">Assigned Interviewer</TableHead>
                    <TableHead className="font-medium">Contact</TableHead>
                    <TableHead className="font-medium">Assignment Status</TableHead>
                    <TableHead className="font-medium text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => {
                    const barangay = Array.isArray(barangays) ? barangays.find((b: any) => b.id === assignment.barangay_id || b.barangay_id === assignment.barangay_id) : null
                    const interviewer = interviewers.find((u: any) => u.id === assignment.user_id)
                    const target = surveyTargets.find((t: any) => t.barangay_id === assignment.barangay_id)
                    
                    // Get survey progress from barangay data (this would come from actual survey responses)
                    const surveyProgress = target ? Math.round((target.achieved || 0) / target.target * 100) : 0
                    
                    return (
                      <TableRow key={assignment.assignment_id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="text-gray-900">
                              {barangay ? (barangay.name || barangay.barangay_name) : assignment.barangay_name || "Unknown"}
                            </span>
                            <span className="text-xs text-gray-500">
                              ID: {assignment.barangay_id}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-gray-900 font-medium">
                              {interviewer ? `${interviewer.firstName} ${interviewer.lastName}` : 
                               `${assignment.firstName || ''} ${assignment.lastName || ''}`.trim() || "Unknown"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {interviewer?.role || 'Interviewer'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {interviewer?.email || assignment.email || 'No email'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={
                                assignment.status === "In Progress" ? "default" : 
                                assignment.status === "Completed" ? "secondary" : 
                                "outline"
                              } 
                              className={`text-xs ${
                                assignment.status === "Assigned" ? "bg-orange-100 text-orange-800 border-orange-200" :
                                assignment.status === "In Progress" ? "bg-green-100 text-green-800 border-green-200" :
                                assignment.status === "Completed" ? "bg-purple-100 text-purple-800 border-purple-200" :
                                "bg-gray-100 text-gray-800 border-gray-200"
                              }`}
                            >
                              {assignment.status}
                            </Badge>
                            {assignment.status === "Completed" && surveyProgress >= 100 && (
                              <span className="text-xs text-green-600 font-medium" title="Auto-completed due to 100% survey progress">
                                ✓ Auto
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 hover:bg-blue-100" 
                              onClick={() => handleEditClick(assignment)}
                              title="Edit assignment"
                            >
                              <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 hover:bg-red-100" 
                              onClick={() => handleDeleteClick(assignment)}
                              title="Delete assignment"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
