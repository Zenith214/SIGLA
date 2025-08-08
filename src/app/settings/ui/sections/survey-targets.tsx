"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp, Edit, Trash2, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function SurveyTargets() {
  const [targets, setTargets] = useState<any[]>([])
  const [barangays, setBarangays] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addModal, setAddModal] = useState(false)
  const [addForm, setAddForm] = useState<any>({ barangay_id: "", target: 0, achieved: 0, percentage: 0 })
  const [saving, setSaving] = useState(false)
  const [editingTarget, setEditingTarget] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<any | null>(null)
  const [deletingTarget, setDeletingTarget] = useState<any | null>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch("/api/survey-targets").then(r => r.json()),
      fetch("/api/barangays").then(r => r.json()),
    ])
      .then(([targetsData, barangaysData]) => {
        setTargets(targetsData)
        setBarangays(barangaysData)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Add Target
  const handleAddChange = (e: any) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value })
  }
  const handleAddSave = async () => {
    setSaving(true)
    try {
      const payload = { ...addForm, barangay_id: Number(addForm.barangay_id), target: Number(addForm.target), achieved: Number(addForm.achieved), percentage: Number(addForm.percentage) }
      const res = await fetch("/api/survey-targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to add target")
      const created = await res.json()
      setTargets([...targets, created])
      setAddModal(false)
      setAddForm({ barangay_id: "", target: 0, achieved: 0, percentage: 0 })
    } catch (err: any) {
      alert(err.message)
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
    setSaving(true)
    try {
      const payload = { ...editForm, target_id: Number(editForm.target_id), barangay_id: Number(editForm.barangay_id), target: Number(editForm.target), achieved: Number(editForm.achieved), percentage: Number(editForm.percentage) }
      const res = await fetch("/api/survey-targets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to update target")
      const updated = await res.json()
      setTargets(targets.map(t => (t.target_id === updated.target_id ? updated : t)))
      setEditingTarget(null)
      setEditForm(null)
    } catch (err: any) {
      alert(err.message)
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
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Survey Targets</h1>
          <p className="text-gray-600 text-lg">Set and monitor survey response targets by barangay</p>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setAddModal(true)}>
          <Target className="w-4 h-4 mr-2" />
          Add Target
        </Button>
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
                  {barangays.map((b: any) => (
                    <option key={b.barangay_id} value={b.barangay_id}>{b.barangay_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Responses</label>
                <Input name="target" type="number" value={addForm.target} onChange={handleAddChange} min={0} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Achieved</label>
                <Input name="achieved" type="number" value={addForm.achieved} onChange={handleAddChange} min={0} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Percentage</label>
                <Input name="percentage" type="number" value={addForm.percentage} onChange={handleAddChange} min={0} max={100} />
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
                  {barangays.map((b: any) => (
                    <option key={b.barangay_id} value={b.barangay_id}>{b.barangay_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Responses</label>
                <Input name="target" type="number" value={editForm.target} onChange={handleEditChange} min={0} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Achieved</label>
                <Input name="achieved" type="number" value={editForm.achieved} onChange={handleEditChange} min={0} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Percentage</label>
                <Input name="percentage" type="number" value={editForm.percentage} onChange={handleEditChange} min={0} max={100} />
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
                const barangay = barangays.find((b: any) => b.barangay_id === target.barangay_id)
                return (
                  <div key={target.target_id} className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 text-lg">{barangay ? barangay.barangay_name : ""}</h3>
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