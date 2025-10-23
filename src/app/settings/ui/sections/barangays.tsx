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
import { MapPin, Edit, Trash2, Award, History, AlertTriangle, Calendar, CheckCircle, Clock, Upload, Eye, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useActiveCycle } from "@/hooks/useSurveyCycle"

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
  const [logoViewModal, setLogoViewModal] = useState(false)
  const [selectedBarangayLogo, setSelectedBarangayLogo] = useState<{name: string, logo_url: string} | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const { activeCycle, hasActiveCycle, loading: cycleLoading } = useActiveCycle()
  
  // Function to get award status from cycle-aware system
  const getAwardStatus = (barangay: any) => {
    if (!barangay.awardStatus) return { status: 'non-awardee' };
    
    return {
      status: barangay.awardStatus.isAwardee ? 'awardee' : 'non-awardee',
      awardedDate: barangay.awardStatus.awardedDate,
      notes: barangay.awardStatus.notes
    };
  };

  // Filter barangays based on search term
  const filteredBarangays = Array.isArray(barangays) ? barangays.filter(barangay => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    const awardStatus = getAwardStatus(barangay)
    
    return (
      barangay.name.toLowerCase().includes(searchLower) ||
      (barangay.population?.toString() || '').includes(searchLower) ||
      (barangay.households?.toString() || '').includes(searchLower) ||
      barangay.status?.toLowerCase().includes(searchLower) ||
      awardStatus.status.includes(searchLower)
    )
  }) : [];



  useEffect(() => {
    const update = () => setDateTime(new Date().toLocaleString())
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (cycleLoading) return; // Wait for cycle to load
    
    setLoading(true)
    // Fetch barangays with cycle-aware award information
    const url = hasActiveCycle 
      ? `/api/barangays?include_awards=true&cycle_id=${activeCycle?.cycle_id}`
      : "/api/barangays/all"
      
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch barangays")
        return res.json()
      })
      .then((response) => {
        // Handle the API response structure: { success: true, data: [...], meta: {...} }
        const barangaysData = response.data || response || []
        setBarangays(Array.isArray(barangaysData) ? barangaysData : [])
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setBarangays([]) // Ensure barangays is always an array
        setLoading(false)
      })
  }, [hasActiveCycle, activeCycle, cycleLoading])

  // Handle edit button click
  const handleEditClick = (barangay: any) => {
    setEditingBarangay(barangay)
    setEditForm({ 
      ...barangay,
      logo_url: barangay.logo_url || ''
    })
  }
  
  // Handle delete button click
  const handleDeleteClick = (barangay: any) => {
    setDeletingBarangay(barangay)
  }

  // Handle form field change
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  }

  // Handle logo upload
  const handleLogoUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select an image file (PNG, JPG, etc.)",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
      });
      return;
    }

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('barangay_id', (editForm.barangay_id || editForm.id).toString());

      const response = await fetch('/api/barangays/upload-logo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }

      const data = await response.json();
      
      // Update the form with the new logo URL
      setEditForm({ ...editForm, logo_url: data.logo_url });

      toast({
        title: "Logo Uploaded Successfully!",
        description: "The barangay logo has been uploaded.",
      });
    } catch (error) {
      console.error('Logo upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload logo. Please try again.",
      });
    } finally {
      setUploadingLogo(false);
    }
  }

  // Handle save
  const handleEditSave = async () => {
    setSaving(true)
    try {
      // Update only basic barangay info (no award management here)
      const barangayUpdatePayload = {
        barangayId: editForm.barangay_id || editForm.id,
        households: editForm.households,
        population: editForm.population,
        captain: editForm.captain,
        logo_url: editForm.logo_url
      };

      const barangayRes = await fetch("/api/barangays/all", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(barangayUpdatePayload),
      });
      
      if (!barangayRes.ok) {
        throw new Error("Failed to update barangay information");
      }

      const updated = await barangayRes.json();
      
      // Update local state with basic info only (preserve award status)
      setBarangays(Array.isArray(barangays) ? barangays.map(b => 
        (b.id === updated.id || b.barangay_id === updated.barangay_id) 
          ? { ...b, ...updated, awardStatus: b.awardStatus } // Preserve award status
          : b
      ) : []);
      
      setEditingBarangay(null)
      setEditForm(null)
      
      toast({
        title: "Barangay Updated Successfully!",
        description: `${editForm.name} information has been updated.`,
      });
    } catch (err: any) {
      console.error('Update error:', err);
      
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message || "An unexpected error occurred while updating the barangay.",
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
      setBarangays(Array.isArray(barangays) ? barangays.filter(b => b.id !== deletingBarangay.id && b.barangay_id !== deletingBarangay.barangay_id) : []);
      setDeletingBarangay(null);
      
      // Show success toast
      toast({
        title: "Barangay Deleted",
        description: `${deletingBarangay.name} has been successfully removed.`,
      });
    } catch (err: any) {
      console.error('Delete error:', err);
      
      // Show error toast
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: err.message || "An unexpected error occurred while deleting the barangay.",
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
            <p className="text-gray-600 text-lg">Manage barangay information and view award status</p>
            {hasActiveCycle && (
              <p className="text-sm text-blue-600">
                Active Cycle: {activeCycle?.name} ({activeCycle?.year})
              </p>
            )}
            {!hasActiveCycle && !cycleLoading && (
              <p className="text-sm text-amber-600">
                ⚠️ No active survey cycle - Award management disabled
              </p>
            )}
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
          {hasActiveCycle && (
            <Button
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
              onClick={() => {
                // Navigate to award management section
                const event = new CustomEvent('navigate-to-section', { detail: 'award-management' });
                window.dispatchEvent(event);
              }}
            >
              <Award className="w-4 h-4 mr-2" />
              Manage Awards
            </Button>
          )}
        </div>
      </div>

      {/* SGLGB Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Barangays</p>
                <p className="text-2xl font-bold text-gray-900">{Array.isArray(barangays) ? barangays.length : 0}</p>
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
                  {Array.isArray(barangays) ? barangays.filter((b) => b.awardStatus?.isAwardee).length : 0}
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
                  {Array.isArray(barangays) ? barangays.filter((b) => !b.awardStatus?.isAwardee).length : 0}
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
                  {Array.isArray(barangays) ? barangays.filter((b) => b.currentStatus === "Completed").length : 0} Done
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
        
        {/* Search Bar */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search barangays by name, population, households, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>
        
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
                    <TableHead className="font-medium">Award Status</TableHead>
                    <TableHead className="font-medium">Logo</TableHead>
                    <TableHead className="font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBarangays.length === 0 && searchTerm ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">No barangays found</p>
                        <p className="text-gray-500 mb-4">No barangays match your search criteria "{searchTerm}"</p>
                        <Button 
                          onClick={() => setSearchTerm("")} 
                          variant="outline"
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Clear Search
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBarangays.map((barangay) => (
                    <TableRow key={barangay.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{barangay.name}</TableCell>
                      <TableCell>{barangay.households ?? "-"}</TableCell>
                      <TableCell>{barangay.population ? barangay.population.toLocaleString() : "-"}</TableCell>
                      <TableCell className="text-gray-600">{barangay.captain ?? "-"}</TableCell>
                      <TableCell>
                        {(() => {
                          const awardStatus = getAwardStatus(barangay);
                          return (
                            <Badge
                              variant={awardStatus.status === 'awardee' ? "default" : "destructive"}
                              className={cn(
                                "text-xs",
                                awardStatus.status === 'awardee' && "bg-green-100 text-green-800 hover:bg-green-200",
                                awardStatus.status === 'non-awardee' && "bg-red-100 text-red-800 hover:bg-red-200",
                              )}
                            >
                              {awardStatus.status === 'awardee' && <Award className="w-3 h-3 mr-1" />}
                              {awardStatus.status === 'awardee' ? "Awardee" : "Non-Awardee"}
                            </Badge>
                          );
                        })()} 
                      </TableCell>
                      <TableCell>
                        {barangay.logo_url ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => {
                              setSelectedBarangayLogo({
                                name: barangay.name,
                                logo_url: barangay.logo_url
                              });
                              setLogoViewModal(true);
                            }}
                          >
                            View Logo
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-xs">No logo</span>
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
                    ))
                  )}
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
                <label className="block text-sm font-medium mb-1">Barangay Logo</label>
                <div className="space-y-3">
                  {editForm.logo_url && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded">
                      <img 
                        src={editForm.logo_url} 
                        alt="Current logo" 
                        className="w-12 h-12 object-cover rounded border"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">Current logo uploaded</p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="mt-1 text-xs"
                          onClick={() => {
                            setSelectedBarangayLogo({
                              name: editForm.name,
                              logo_url: editForm.logo_url
                            });
                            setLogoViewModal(true);
                          }}
                        >
                          View Full Size
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleLogoUpload(file);
                        }
                      }}
                      className="hidden"
                      id="logo-upload"
                      disabled={uploadingLogo}
                    />
                    <label 
                      htmlFor="logo-upload" 
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-lg">📷</span>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700">
                          {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {hasActiveCycle && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Current Award Status</span>
                  </div>
                  <div className="text-sm text-blue-700">
                    <strong>Status:</strong> {editForm.awardStatus?.isAwardee ? "Awardee" : "Non-Awardee"}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    💡 To modify award status, use the Award Management section
                  </p>
                </div>
              )}
              
              {!hasActiveCycle && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                  <p className="text-sm text-gray-600">
                    No active survey cycle - Award information not available
                  </p>
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

      {/* Logo View Modal */}
      {selectedBarangayLogo && (
        <Dialog open={logoViewModal} onOpenChange={setLogoViewModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <span>📷</span>
                <span>{selectedBarangayLogo.name} Logo</span>
              </DialogTitle>
            </DialogHeader>
            <div className="flex justify-center p-4">
              <img 
                src={selectedBarangayLogo.logo_url} 
                alt={`${selectedBarangayLogo.name} logo`}
                className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-logo.svg'; // Fallback image
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = selectedBarangayLogo.logo_url;
                  link.download = `${selectedBarangayLogo.name}-logo`;
                  link.click();
                }}
              >
                Download
              </Button>
              <Button onClick={() => setLogoViewModal(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
