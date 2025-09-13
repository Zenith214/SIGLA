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
import { MapPin, Edit, Trash2, Award, History, AlertTriangle, Calendar, CheckCircle, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast.tsx"

export function Barangays() {
  const [barangays, setBarangays] = useState<any[]>([])
  const [selectedBarangay, setSelectedBarangay] = useState<any | null>(null)
  const [dateTime, setDateTime] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingBarangay, setEditingBarangay] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingBarangay, setDeletingBarangay] = useState<any | null>(null)
  const { addToast } = useToast()
  
  // Function to check if seal is expired or expiring soon
  const getSealStatus = (barangay: any) => {
    if (barangay.seal !== 'yes') return { status: 'non-awardee' };
    
    if (!barangay.seal_expiration_date) return { status: 'valid' };
    
    const expirationDate = new Date(barangay.seal_expiration_date);
    const now = new Date();
    const daysUntilExpiration = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration < 0) {
      return { status: 'expired', daysUntilExpiration };
    } else if (daysUntilExpiration <= 30) {
      return { status: 'expiring-soon', daysUntilExpiration };
    } else {
      return { status: 'valid', daysUntilExpiration };
    }
  };



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
    setEditForm({ 
      ...barangay,
      seal_expiration_date: barangay.seal_expiration_date ? new Date(barangay.seal_expiration_date).toISOString().split('T')[0] : ''
    })
  }
  
  // Handle delete button click
  const handleDeleteClick = (barangay: any) => {
    setDeletingBarangay(barangay)
  }

  // Handle form field change
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // If changing seal status to 'yes', automatically set expiration date to one year from now
    if (name === 'seal' && value === 'yes') {
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      setEditForm({ 
        ...editForm, 
        [name]: value,
        seal_expiration_date: oneYearFromNow.toISOString().split('T')[0]
      });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  }

  // Handle save
  const handleEditSave = async () => {
    setSaving(true)
    try {
      
      // Include the barangayId that the API expects
      const updatePayload = {
        barangayId: editForm.barangay_id || editForm.id, // Use barangay_id or fallback to id
        ...editForm
      };

      console.log('Sending update payload:', updatePayload);

      const res = await fetch("/api/barangays/all", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      })
      
      if (!res.ok) {
        let errorMessage = "Failed to update barangay";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If response is not JSON (e.g., HTML error page), use status text
          errorMessage = `Server error: ${res.status} ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const updated = await res.json()
      console.log('Update response:', updated);
      
      // Update the local state with the updated barangay
      setBarangays(barangays.map(b => (b.id === updated.id ? { ...b, ...updated } : b)))
      setEditingBarangay(null)
      setEditForm(null)
      
      // Show beautiful success toast
      addToast({
        type: "success",
        title: "Barangay Updated Successfully!",
        description: `${editForm.name} has been updated with the latest information.`,
        duration: 4000
      });
    } catch (err: any) {
      console.error('Update error:', err);
      
      // Show beautiful error toast
      addToast({
        type: "error",
        title: "Update Failed",
        description: err.message || "An unexpected error occurred while updating the barangay.",
        duration: 6000
      });
    } finally {
      setSaving(false)
    }
  }
  
  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingBarangay) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/barangays/all?id=${deletingBarangay.id || deletingBarangay.barangay_id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        let errorMessage = "Failed to delete barangay";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If response is not JSON (e.g., HTML error page), use status text
          errorMessage = `Server error: ${res.status} ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      // Update the local state by removing the deleted barangay
      setBarangays(barangays.filter(b => b.id !== deletingBarangay.id && b.barangay_id !== deletingBarangay.barangay_id));
      setDeletingBarangay(null);
      
      // Show success toast
      addToast({
        type: "success",
        title: "Barangay Deleted",
        description: `${deletingBarangay.name} has been successfully removed.`,
        duration: 4000
      });
    } catch (err: any) {
      console.error('Delete error:', err);
      
      // Show error toast
      addToast({
        type: "error",
        title: "Delete Failed",
        description: err.message || "An unexpected error occurred while deleting the barangay.",
        duration: 6000
      });
    } finally {
      setSaving(false);
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
                    <TableHead className="font-medium">Seal Expiration</TableHead>
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
                        {(() => {
                          const sealStatus = getSealStatus(barangay);
                          return (
                            <Badge
                              variant={barangay.seal === 'yes' ? "default" : "destructive"}
                              className={cn(
                                "text-xs",
                                barangay.seal === 'yes' && sealStatus.status === 'valid' && "bg-green-100 text-green-800 hover:bg-green-200",
                                barangay.seal === 'yes' && sealStatus.status === 'expiring-soon' && "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
                                barangay.seal === 'yes' && sealStatus.status === 'expired' && "bg-orange-100 text-orange-800 hover:bg-orange-200",
                                barangay.seal === 'no' && "bg-red-100 text-red-800 hover:bg-red-200",
                              )}
                            >
                              {barangay.seal === 'yes' && (
                                sealStatus.status === 'expired' ? 
                                <AlertTriangle className="w-3 h-3 mr-1" /> : 
                                sealStatus.status === 'expiring-soon' ? 
                                <Calendar className="w-3 h-3 mr-1" /> :
                                <Award className="w-3 h-3 mr-1" />
                              )}
                              {barangay.seal === 'yes' ? 
                                (sealStatus.status === 'expired' ? "Expired" : 
                                 sealStatus.status === 'expiring-soon' ? "Renew Soon" : 
                                 "Awardee") : 
                                "Non-Awardee"}
                            </Badge>
                          );
                        })()} 
                      </TableCell>
                      <TableCell>
                        {barangay.seal === 'yes' && barangay.seal_expiration_date ? (
                          <span className={cn(
                            "text-xs",
                            getSealStatus(barangay).status === 'expired' && "text-red-600 font-semibold",
                            getSealStatus(barangay).status === 'expiring-soon' && "text-yellow-600 font-semibold",
                            getSealStatus(barangay).status === 'valid' && "text-green-600",
                          )}>
                            {new Date(barangay.seal_expiration_date).toLocaleDateString()}
                            {getSealStatus(barangay).status === 'expired' && " (Expired)"}
                            {getSealStatus(barangay).status === 'expiring-soon' && ` (${getSealStatus(barangay).daysUntilExpiration} days left)`}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
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
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteClick(barangay)}
                          >
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
              
              {editForm?.seal === 'yes' && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Seal Expiration Date
                  </label>
                  <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-gray-50">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{editForm.seal_expiration_date}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Annual renewal automatically set to one year from today.</p>
                </div>
              )}
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
      
      {/* Delete Confirmation Modal */}
      {deletingBarangay && (
        <Dialog open={!!deletingBarangay} onOpenChange={open => { if (!open) setDeletingBarangay(null) }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Barangay</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2 mt-4 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Warning:</span>
            </div>
            <div className="mt-2 text-red-600">
              Are you sure you want to delete {deletingBarangay.name}? <br />
              <span className="font-semibold">This action cannot be undone.</span>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setDeletingBarangay(null)} disabled={saving}>Cancel</Button>
              <Button onClick={handleDeleteConfirm} disabled={saving} className="bg-red-600 text-white">
                {saving ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
