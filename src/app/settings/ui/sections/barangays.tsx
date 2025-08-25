"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MapPin, Edit, Trash2, Award, History } from "lucide-react"
import { Input } from "@/components/ui/input"

export function Barangays() {
  const [barangays, setBarangays] = useState<any[]>([])
  const [selectedBarangay, setSelectedBarangay] = useState<any | null>(null)
  const [dateTime, setDateTime] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingBarangay, setEditingBarangay] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)



  useEffect(() => {
    const update = () => setDateTime(new Date().toLocaleString())
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setLoading(true)
    fetch("/api/barangays/all")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch barangays")
        return res.json()
      })
      .then((data) => {
        setBarangays(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Handle edit button click
  const handleEditClick = (barangay: any) => {
    setEditingBarangay(barangay)
    setEditForm({ ...barangay })
  }

  // Handle form field change
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  // Handle save
  const handleEditSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/barangays/all", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) throw new Error("Failed to update barangay")
      const updated = await res.json()
      setBarangays(barangays.map(b => (b.id === updated.id ? updated : b)))
      setEditingBarangay(null)
      setEditForm(null)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Barangay Management</h1>
            <p className="text-gray-600 text-lg">Manage barangays and their SGLGB award information</p>
          </div>
          <span className="text-xs md:text-sm font-mono bg-gray-200 rounded px-2 py-1 self-end">{dateTime}</span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            📊 Export Data
          </Button>
        </div>
      </div>

      {/* SGLGB Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Barangays</p>
                <p className="text-2xl font-bold text-gray-900">{barangays.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">SGLGB Awardees</p>
                <p className="text-2xl font-bold text-green-600">
                  {barangays.filter((b) => b.seal === 'yes').length}
                </p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Non-Awardees</p>
                <p className="text-2xl font-bold text-red-600">
                  {barangays.filter((b) => b.seal === 'no').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">×</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Survey Status</p>
                <p className="text-2xl font-bold text-blue-600">
                  {barangays.filter((b) => b.currentStatus === "Completed").length} Done
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barangays Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <MapPin className="w-6 h-6 text-blue-500" />
            <span>Barangays List</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">{error}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-medium">Barangay Name</TableHead>
                    <TableHead className="font-medium">Households</TableHead>
                    <TableHead className="font-medium">Population</TableHead>
                    <TableHead className="font-medium">Captain</TableHead>
                    <TableHead className="font-medium">SGLGB Awardee</TableHead>
                    <TableHead className="font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {barangays.map((barangay) => (
                    <TableRow key={barangay.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{barangay.name}</TableCell>
                      <TableCell>{barangay.households ?? "-"}</TableCell>
                      <TableCell>{barangay.population ? barangay.population.toLocaleString() : "-"}</TableCell>
                      <TableCell className="text-gray-600">{barangay.captain ?? "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={barangay.seal === 'yes' ? "default" : "destructive"}
                          className={cn(
                            "text-xs",
                            barangay.seal === 'yes' && "bg-green-100 text-green-800 hover:bg-green-200",
                            barangay.seal === 'no' && "bg-red-100 text-red-800 hover:bg-red-200",
                          )}
                        >
                          {barangay.seal === 'yes' && <Award className="w-3 h-3 mr-1" />}
                          {barangay.seal === 'yes' ? "Awardee" : "Non-Awardee"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-blue-50"
                                onClick={() => setSelectedBarangay(barangay)}
                              >
                                <History className="w-3 h-3 text-blue-600" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle className="flex items-center space-x-2">
                                  <History className="w-5 h-5 text-blue-600" />
                                  <span>Award History</span>
                                </DialogTitle>
                                <DialogDescription>SGLGB award history for {selectedBarangay?.name}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-3 mt-4">
                                {(selectedBarangay?.history ?? []).map((record: any) => (
                                  <div
                                    key={record.year}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                  >
                                    <span className="font-medium text-gray-900">{record.year}</span>
                                    <Badge
                                      variant={
                                        record.status === "Awardee"
                                          ? "default"
                                          : record.status === "Non-Awardee"
                                            ? "destructive"
                                            : "secondary"
                                      }
                                      className={cn(
                                        "text-xs",
                                        record.status === "Awardee" && "bg-green-100 text-green-800",
                                        record.status === "Non-Awardee" && "bg-red-100 text-red-800",
                                        record.status === "Pending" && "bg-yellow-100 text-yellow-800",
                                      )}
                                    >
                                      {record.status === "Awardee" && <Award className="w-3 h-3 mr-1" />}
                                      {record.status}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-200" onClick={() => handleEditClick(barangay)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingBarangay && (
        <Dialog open={!!editingBarangay} onOpenChange={open => { if (!open) setEditingBarangay(null) }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Barangay</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input name="name" value={editForm.name} readOnly disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Households</label>
                <Input name="households" type="number" value={editForm.households ?? ""} onChange={handleEditChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Population</label>
                <Input name="population" type="number" value={editForm.population ?? ""} onChange={handleEditChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Captain</label>
                <Input name="captain" value={editForm.captain ?? ""} onChange={handleEditChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SGLGB Award Status</label>
                <select name="seal" value={editForm.seal ?? "no"} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-2 py-1">
                  <option value="no">Non-Awardee</option>
                  <option value="yes">Awardee</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditingBarangay(null)} disabled={saving}>Cancel</Button>
              <Button onClick={handleEditSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
