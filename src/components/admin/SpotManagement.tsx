"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { MapPin, Edit, Trash2, UserPlus, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { useActiveCycle } from "@/hooks/useSurveyCycle";

interface Spot {
  spotId: number;
  spotName: string;
  barangayId: number;
  barangayName: string;
  cycleId: number;
  assignedFiId: number | null;
  assignedFiName: string | null;
  assignedFiEmail: string | null;
  status: string;
  startingPoint: { lat: number; lng: number };
  randomStart: number;
  completedCount: number;
  totalCount: number;
  questionnaires: Array<{
    questionnaireId: string;
    status: string;
    visitCount: number;
  }>;
}

interface Interviewer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export function SpotManagement() {
  const { activeCycle } = useActiveCycle();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Edit form state
  const [editSpotName, setEditSpotName] = useState("");
  const [editAssignedFiId, setEditAssignedFiId] = useState<string>("");
  const [editLat, setEditLat] = useState("");
  const [editLng, setEditLng] = useState("");
  const [editStatus, setEditStatus] = useState("");
  
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSpots();
    fetchInterviewers();
  }, [activeCycle?.cycle_id]);

  const fetchSpots = async () => {
    try {
      setLoading(true);
      const url = activeCycle?.cycle_id 
        ? `/api/spots?cycleId=${activeCycle.cycle_id}&limit=100`
        : '/api/spots?limit=100';
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSpots(data.spots || []);
      }
    } catch (error) {
      console.error('Failed to fetch spots:', error);
      setMessage({ type: 'error', text: 'Failed to load spots' });
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviewers = async () => {
    try {
      const response = await fetch('/api/users?role=interviewer&status=active');
      if (response.ok) {
        const data = await response.json();
        setInterviewers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch interviewers:', error);
    }
  };

  const openEditDialog = (spot: Spot) => {
    setSelectedSpot(spot);
    setEditSpotName(spot.spotName);
    setEditAssignedFiId(spot.assignedFiId?.toString() || "unassigned");
    setEditLat(spot.startingPoint.lat.toString());
    setEditLng(spot.startingPoint.lng.toString());
    setEditStatus(spot.status);
    setEditDialogOpen(true);
    setMessage(null);
  };

  const openDeleteDialog = (spot: Spot) => {
    setSelectedSpot(spot);
    setDeleteDialogOpen(true);
    setMessage(null);
  };

  const handleUpdate = async () => {
    if (!selectedSpot) return;

    setSaving(true);
    setMessage(null);

    try {
      const updates: any = {
        spotId: selectedSpot.spotId
      };

      // Only include changed fields
      if (editSpotName !== selectedSpot.spotName) {
        updates.spotName = editSpotName;
      }

      if (editAssignedFiId === "unassigned") {
        if (selectedSpot.assignedFiId !== null) {
          updates.assignedFiId = null;
        }
      } else {
        const newFiId = parseInt(editAssignedFiId);
        if (newFiId !== selectedSpot.assignedFiId) {
          updates.assignedFiId = newFiId;
        }
      }

      const newLat = parseFloat(editLat);
      const newLng = parseFloat(editLng);
      if (newLat !== selectedSpot.startingPoint.lat || newLng !== selectedSpot.startingPoint.lng) {
        updates.startingPoint = { lat: newLat, lng: newLng };
      }

      if (editStatus !== selectedSpot.status) {
        updates.status = editStatus;
      }

      const response = await fetch('/api/spots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Spot updated successfully!' });
        await fetchSpots();
        setTimeout(() => {
          setEditDialogOpen(false);
          setMessage(null);
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update spot' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update spot' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSpot) return;

    setDeleting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/spots?spotId=${selectedSpot.spotId}&confirm=DELETE`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `Deleted spot and ${data.deletedQuestionnaires} questionnaires` });
        await fetchSpots();
        setTimeout(() => {
          setDeleteDialogOpen(false);
          setMessage(null);
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete spot' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete spot' });
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="default">Completed</Badge>;
      case 'In_Progress':
        return <Badge variant="secondary">In Progress</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading spots...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Spot Management
              </CardTitle>
              <CardDescription>
                Edit spot assignments, locations, and details. Handle human errors in spot allocation.
              </CardDescription>
            </div>
            <Button onClick={fetchSpots} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className={`mb-4 ${message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {spots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No spots found. Create spots using the Spot Allocation tab.
            </div>
          ) : (
            <div className="space-y-3">
              {spots.map((spot) => (
                <div
                  key={spot.spotId}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{spot.spotName}</h4>
                        {getStatusBadge(spot.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Barangay:</span> {spot.barangayName}
                        </div>
                        <div>
                          <span className="font-medium">Assigned to:</span>{' '}
                          {spot.assignedFiName || (
                            <span className="text-orange-600">Unassigned</span>
                          )}
                        </div>
                        <div>
                          <span className="font-medium">Location:</span> {spot.startingPoint.lat.toFixed(6)}, {spot.startingPoint.lng.toFixed(6)}
                        </div>
                        <div>
                          <span className="font-medium">Progress:</span> {spot.completedCount}/{spot.totalCount} questionnaires
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => openEditDialog(spot)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => openDeleteDialog(spot)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        disabled={spot.completedCount > 0}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Spot: {selectedSpot?.spotName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="spotName">Spot Name</Label>
              <Input
                id="spotName"
                value={editSpotName}
                onChange={(e) => setEditSpotName(e.target.value)}
                placeholder="Enter spot name"
              />
            </div>

            <div>
              <Label htmlFor="assignedFi">Assigned Field Interviewer</Label>
              <Select value={editAssignedFiId} onValueChange={setEditAssignedFiId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">
                    <span className="text-orange-600">Unassigned</span>
                  </SelectItem>
                  {interviewers.map((fi) => (
                    <SelectItem key={fi.id} value={fi.id}>
                      {fi.firstName} {fi.lastName} ({fi.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="0.000001"
                  value={editLat}
                  onChange={(e) => setEditLat(e.target.value)}
                  placeholder="7.123456"
                />
              </div>
              <div>
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  type="number"
                  step="0.000001"
                  value={editLng}
                  onChange={(e) => setEditLng(e.target.value)}
                  placeholder="125.123456"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In_Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {message && (
              <Alert className={message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Spot?</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Alert className="border-red-500 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Warning:</strong> This will permanently delete the spot "{selectedSpot?.spotName}" 
                and all {selectedSpot?.totalCount} associated questionnaires.
                {selectedSpot && selectedSpot.completedCount > 0 && (
                  <div className="mt-2">
                    <strong>Cannot delete:</strong> This spot has {selectedSpot.completedCount} completed questionnaires with survey responses.
                  </div>
                )}
              </AlertDescription>
            </Alert>

            {message && (
              <Alert className={message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || (selectedSpot?.completedCount || 0) > 0}
            >
              {deleting ? 'Deleting...' : 'Delete Spot'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
