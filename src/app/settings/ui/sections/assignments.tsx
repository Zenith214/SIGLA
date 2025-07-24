"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserCheck, MapPin, Users, Edit, Trash2, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const statusOptions = ["Active", "Pending", "Completed"];

export function Assignments() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [barangays, setBarangays] = useState<any[]>([])
  const [interviewers, setInterviewers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addModal, setAddModal] = useState(false)
  const [addForm, setAddForm] = useState<any>({ barangay_id: "", user_id: "", status: "Pending", progress: 0 })
  const [saving, setSaving] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<any | null>(null)
  const [deletingAssignment, setDeletingAssignment] = useState<any | null>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch("/api/assignments").then(r => r.json()),
      fetch("/api/barangays").then(r => r.json()),
      fetch("/api/users").then(r => r.json()),
    ])
      .then(([assignmentsData, barangaysData, usersData]) => {
        setAssignments(assignmentsData)
        setBarangays(barangaysData)
        setInterviewers(usersData.filter((u: any) => u.role === "Interviewer"))
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Add Assignment
  const handleAddChange = (e: any) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value })
  }
  const handleAddSave = async () => {
    setSaving(true)
    try {
      const payload = { ...addForm, barangay_id: Number(addForm.barangay_id), user_id: Number(addForm.user_id), progress: Number(addForm.progress) }
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to add assignment")
      const created = await res.json()
      setAssignments([...assignments, created])
      setAddModal(false)
      setAddForm({ barangay_id: "", user_id: "", status: "Pending", progress: 0 })
    } catch (err: any) {
      alert(err.message)
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
    } catch (err: any) {
      alert(err.message)
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
      const res = await fetch("/api/assignments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignment_id: deletingAssignment.assignment_id }),
      })
      if (!res.ok) throw new Error("Failed to delete assignment")
      setAssignments(assignments.filter(a => a.assignment_id !== deletingAssignment.assignment_id))
      setDeletingAssignment(null)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

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
                <label className="block text-sm font-medium mb-1">Barangay</label>
                <select name="barangay_id" value={addForm.barangay_id} onChange={handleAddChange} className="w-full border rounded px-2 py-1">
                  <option value="">Select Barangay</option>
                  {barangays.map((b: any) => (
                    <option key={b.barangay_id} value={b.barangay_id}>{b.barangay_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Interviewer</label>
                <select name="user_id" value={addForm.user_id} onChange={handleAddChange} className="w-full border rounded px-2 py-1">
                  <option value="">Select Interviewer</option>
                  {interviewers.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" value={addForm.status} onChange={handleAddChange} className="w-full border rounded px-2 py-1">
                  {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Progress</label>
                <Input name="progress" type="number" value={addForm.progress} onChange={handleAddChange} min={0} max={100} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setAddModal(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleAddSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
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
                <label className="block text-sm font-medium mb-1">Barangay</label>
                <select name="barangay_id" value={editForm.barangay_id} onChange={handleEditChange} className="w-full border rounded px-2 py-1">
                  {barangays.map((b: any) => (
                    <option key={b.barangay_id} value={b.barangay_id}>{b.barangay_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Interviewer</label>
                <select name="user_id" value={editForm.user_id} onChange={handleEditChange} className="w-full border rounded px-2 py-1">
                  {interviewers.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" value={editForm.status} onChange={handleEditChange} className="w-full border rounded px-2 py-1">
                  {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Progress</label>
                <Input name="progress" type="number" value={editForm.progress} onChange={handleEditChange} min={0} max={100} />
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

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span>Current Assignments</span>
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
                  const barangay = barangays.find((b: any) => b.barangay_id === assignment.barangay_id)
                  const interviewer = interviewers.find((u: any) => u.id === assignment.user_id)
                  return (
                    <TableRow key={assignment.assignment_id}>
                      <TableCell className="font-medium">{barangay ? barangay.barangay_name : ""}</TableCell>
                      <TableCell className="text-gray-600">{interviewer ? interviewer.firstName + " " + interviewer.lastName : ""}</TableCell>
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
