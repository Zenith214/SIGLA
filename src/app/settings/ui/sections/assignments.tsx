"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserCheck, Users, Edit, Trash2, AlertTriangle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

const statusOptions = ["Active", "Pending", "Completed"];

export function Assignments() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [barangays, setBarangays] = useState<any[]>([])
  const [surveyTargets, setSurveyTargets] = useState<any[]>([])
  const [interviewers, setInterviewers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addModal, setAddModal] = useState(false)
  const [addForm, setAddForm] = useState<any>({ barangay_id: "", user_id: "", status: "Pending" })
  const [saving, setSaving] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<any | null>(null)
  const [deletingAssignment, setDeletingAssignment] = useState<any | null>(null)
  const { addToast } = useToast()

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
        setBarangays(barangaysData || [])

        // The interviewers API returns the data directly (no wrapping)
        setInterviewers(interviewersData || [])
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Add Assignment
  const handleAddChange = (e: any) => {
    const { name, value } = e.target
    setAddForm({ ...addForm, [name]: value })
  }

  // Removed unused handleAddSelectChange function

  const validateAddForm = () => {
    if (targetBarangays.length === 0) {
      addToast({
        type: "warning",
        title: "No Survey Targets",
        description: "Please create survey targets first before assigning interviewers.",
        duration: 4000
      });
      return false
    }
    if (!addForm.barangay_id) {
      addToast({
        type: "warning",
        title: "Missing Information",
        description: "Please select a barangay with survey targets for the assignment.",
        duration: 4000
      });
      return false
    }
    if (!addForm.user_id) {
      addToast({
        type: "warning",
        title: "Missing Information",
        description: "Please select an interviewer for the assignment.",
        duration: 4000
      });
      return false
    }
    if (!addForm.status) {
      addToast({
        type: "warning",
        title: "Missing Information",
        description: "Please select a status for the assignment.",
        duration: 4000
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
      addToast({
        type: "success",
        title: "Assignment Added Successfully!",
        description: "New interviewer assignment has been created.",
        duration: 4000
      });
    } catch (err: any) {
      console.error('Add assignment error:', err)
      addToast({
        type: "error",
        title: "Assignment Failed",
        description: err.message || "An unexpected error occurred while creating the assignment.",
        duration: 6000
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
      const payload = { ...editForm, assignment_id: Number(editForm.assignment_id), barangay_id: Number(editForm.barangay_id), user_id: Number(editForm.user_id), progress: Number(editForm.progress) }
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
      addToast({
        type: "success",
        title: "Assignment Updated!",
        description: "Assignment has been updated successfully.",
        duration: 4000
      });
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Update Failed",
        description: err.message || "An unexpected error occurred while updating the assignment.",
        duration: 6000
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
      addToast({
        type: "success",
        title: "Assignment Deleted",
        description: "Assignment has been deleted successfully.",
        duration: 4000
      });

    } catch (err: any) {
      console.error('Delete assignment error:', err)
      addToast({
        type: "error",
        title: "Delete Failed",
        description: err.message || "An unexpected error occurred while deleting the assignment.",
        duration: 6000
      });
    } finally {
      setSaving(false)
    }
  }

  // Get barangays that have survey targets
  const targetBarangays = surveyTargets.map(target => {
    const barangay = barangays.find(b => b.id === target.barangay_id)
    return barangay ? { ...barangay, target } : null
  }).filter(Boolean)

  // Group assignments by barangay and calculate unified progress
  const groupedAssignments = assignments.reduce((acc, assignment) => {
    const barangayId = assignment.barangay_id
    if (!acc[barangayId]) {
      acc[barangayId] = {
        barangay_id: barangayId,
        assignments: [],
        totalProgress: 0,
        averageProgress: 0,
        interviewers: [],
        statuses: []
      }
    }
    
    acc[barangayId].assignments.push(assignment)
    acc[barangayId].totalProgress += (assignment.progress || 0)
    acc[barangayId].averageProgress = Math.round(acc[barangayId].totalProgress / acc[barangayId].assignments.length)
    
    const interviewer = interviewers.find(i => i.id === assignment.user_id)
    if (interviewer && !acc[barangayId].interviewers.find(i => i.id === interviewer.id)) {
      acc[barangayId].interviewers.push(interviewer)
    }
    
    if (!acc[barangayId].statuses.includes(assignment.status)) {
      acc[barangayId].statuses.push(assignment.status)
    }
    
    return acc
  }, {})

  const unifiedAssignments = Object.values(groupedAssignments)

  // Statistics
  const total = assignments.length
  const active = assignments.filter(a => a.status === "Active").length
  const pending = assignments.filter(a => a.status === "Pending").length
  const avgProgress = total ? Math.round(assignments.reduce((sum, a) => sum + (a.progress || 0), 0) / total) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interviewer Assignments</h1>
          <p className="text-gray-600">Assign interviewers to barangays and monitor progress</p>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setAddModal(true)}>
          <UserCheck className="w-4 h-4 mr-2" />
          Add Assignment
        </Button>
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

              <div>
                <Label htmlFor="edit_progress" className="text-sm font-medium">Progress (%)</Label>
                <Input
                  id="edit_progress"
                  name="progress"
                  type="number"
                  value={editForm?.progress || 0}
                  onChange={handleEditChange}
                  min={0}
                  max={100}
                  className="focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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

      {/* Unified Assignments by Barangay */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span>Assignments by Barangay</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : unifiedAssignments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No assignments found</div>
          ) : (
            <div className="space-y-4">
              {unifiedAssignments.map((unified: any) => {
                const barangay = barangays.find((b: any) => b.id === unified.barangay_id)
                const target = surveyTargets.find((t: any) => t.barangay_id === unified.barangay_id)
                const primaryStatus = unified.statuses.includes("Active") ? "Active" : 
                                   unified.statuses.includes("Pending") ? "Pending" : "Completed"
                
                return (
                  <div key={unified.barangay_id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {barangay ? barangay.name : "Unknown Barangay"}
                          </h3>
                          <Badge variant={primaryStatus === "Active" ? "default" : "secondary"} className="text-xs">
                            {primaryStatus}
                          </Badge>
                          {target && (
                            <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                              Target: {target.target} responses
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{unified.assignments.length} assignment{unified.assignments.length !== 1 ? 's' : ''}</span>
                          <span>•</span>
                          <span>{unified.interviewers.length} interviewer{unified.interviewers.length !== 1 ? 's' : ''}</span>
                        </div>
                        
                        <div className="mt-2">
                          <div className="text-xs text-gray-500 mb-1">
                            Interviewers: {unified.interviewers.map((i: any) => `${i.firstName} ${i.lastName}`).join(', ')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-2xl font-semibold text-gray-900">{unified.averageProgress}%</div>
                        <div className="text-sm text-gray-500">Avg Progress</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${unified.averageProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 min-w-[3rem]">{unified.averageProgress}%</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        Individual progress: {unified.assignments.map((a: any) => `${a.progress}%`).join(', ')}
                      </div>
                      <div className="flex space-x-1">
                        {unified.assignments.map((assignment: any) => (
                          <div key={assignment.assignment_id} className="flex space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 w-7 p-0" 
                              onClick={() => handleEditClick(assignment)}
                              title={`Edit assignment for ${unified.interviewers.find((i: any) => i.id === assignment.user_id)?.firstName || 'Unknown'}`}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 w-7 p-0 text-red-600" 
                              onClick={() => handleDeleteClick(assignment)}
                              title={`Delete assignment for ${unified.interviewers.find((i: any) => i.id === assignment.user_id)?.firstName || 'Unknown'}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-500" />
            <span>Individual Assignments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">Barangay</TableHead>
                  <TableHead className="font-medium">Interviewer</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Progress</TableHead>
                  <TableHead className="font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => {
                  const barangay = barangays.find((b: any) => b.id === assignment.barangay_id || b.barangay_id === assignment.barangay_id)
                  const interviewer = interviewers.find((u: any) => u.id === assignment.user_id)
                  return (
                    <TableRow key={assignment.assignment_id}>
                      <TableCell className="font-medium">{barangay ? (barangay.name || barangay.barangay_name) : assignment.barangay_name || "Unknown"}</TableCell>
                      <TableCell className="text-gray-600">{interviewer ? `${interviewer.firstName} ${interviewer.lastName}` : `${assignment.firstName || ''} ${assignment.lastName || ''}`.trim() || "Unknown"}</TableCell>
                      <TableCell>
                        <Badge variant={assignment.status === "Active" ? "default" : "secondary"} className="text-xs">
                          {assignment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${assignment.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{assignment.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEditClick(assignment)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" onClick={() => handleDeleteClick(assignment)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assignment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{total}</div>
              <div className="text-sm text-gray-600">Total Assignments</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{active}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{avgProgress}%</div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
