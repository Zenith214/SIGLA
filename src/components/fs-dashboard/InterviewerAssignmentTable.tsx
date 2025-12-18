"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, Users, Trash2, Search, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface Assignment {
  assignment_id: number;
  barangay_id: number;
  user_id: number;
  status: string;
  progress: number;
  barangay_name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  barangay?: {
    barangay_id: number;
    barangay_name: string;
    population: number;
    households: number;
  };
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Interviewer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Barangay {
  id: number;
  name: string;
  households: number;
  population: number;
}

interface InterviewerAssignmentTableProps {
  onAddAssignment: () => void;
}

export default function InterviewerAssignmentTable({ onAddAssignment }: InterviewerAssignmentTableProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingInterviewer, setEditingInterviewer] = useState<Interviewer | null>(null);
  const [deletingInterviewer, setDeletingInterviewer] = useState<{ interviewer: Interviewer; assignments: Assignment[] } | null>(null);
  const [selectedBarangayIds, setSelectedBarangayIds] = useState<Set<number>>(new Set());
  const [originalAssignments, setOriginalAssignments] = useState<Assignment[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assignmentsRes, interviewersRes, barangaysRes] = await Promise.all([
        fetch("/api/assignments", { credentials: "include" }),
        fetch("/api/interviewers", { credentials: "include" }),
        fetch("/api/barangays?awardees_only=true", { credentials: "include" }),
      ]);

      // Check each response individually and only throw error if request actually failed
      if (!assignmentsRes.ok) {
        console.error("Failed to fetch assignments:", assignmentsRes.status);
        throw new Error("Failed to fetch assignments");
      }
      if (!interviewersRes.ok) {
        console.error("Failed to fetch interviewers:", interviewersRes.status);
        throw new Error("Failed to fetch interviewers");
      }
      if (!barangaysRes.ok) {
        console.error("Failed to fetch barangays:", barangaysRes.status);
        throw new Error("Failed to fetch barangays");
      }

      const assignmentsData = await assignmentsRes.json();
      const interviewersData = await interviewersRes.json();
      const barangaysData = await barangaysRes.json();

      // Empty arrays are valid - not an error
      setAssignments(assignmentsData || []);
      setInterviewers(interviewersData || []);
      // Handle the new barangays API response structure
      setBarangays(barangaysData?.data || barangaysData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load assignment data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditInterviewerAssignments = (interviewer: Interviewer, assignments: Assignment[]) => {
    setEditingInterviewer(interviewer);
    setOriginalAssignments(assignments);
    // Set currently assigned barangay IDs
    const assignedIds = new Set(assignments.map(a => a.barangay_id));
    setSelectedBarangayIds(assignedIds);
  };

  const handleToggleBarangay = (barangayId: number) => {
    const newSelected = new Set(selectedBarangayIds);
    if (newSelected.has(barangayId)) {
      newSelected.delete(barangayId);
    } else {
      newSelected.add(barangayId);
    }
    setSelectedBarangayIds(newSelected);
  };

  const handleSaveAssignments = async () => {
    if (!editingInterviewer) return;
    setSaving(true);

    try {
      const originalIds = new Set(originalAssignments.map(a => a.barangay_id));
      const toAdd = Array.from(selectedBarangayIds).filter(id => !originalIds.has(id));
      const toRemove = originalAssignments.filter(a => !selectedBarangayIds.has(a.barangay_id));

      // Delete removed assignments
      for (const assignment of toRemove) {
        const res = await fetch(`/api/assignments/${assignment.assignment_id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error(`Failed to remove assignment for ${assignment.barangay_name}`);
        }
      }

      // Add new assignments
      for (const barangayId of toAdd) {
        const res = await fetch("/api/assignments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: editingInterviewer.id,
            barangay_id: barangayId,
            status: "Assigned",
            progress: 0,
          }),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to add assignment`);
        }
      }

      await loadData();
      setEditingInterviewer(null);
      toast({
        title: "Assignments Updated",
        description: `Updated assignments for ${editingInterviewer.firstName} ${editingInterviewer.lastName}`,
      });
    } catch (error: any) {
      console.error("Update assignments error:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update assignments.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAllAssignments = (interviewer: Interviewer, assignments: Assignment[]) => {
    setDeletingInterviewer({ interviewer, assignments });
  };

  const handleConfirmDeleteAll = async () => {
    if (!deletingInterviewer) return;
    setSaving(true);

    try {
      // Delete all assignments for this interviewer
      for (const assignment of deletingInterviewer.assignments) {
        const res = await fetch(`/api/assignments/${assignment.assignment_id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error(`Failed to delete assignment`);
        }
      }

      await loadData();
      setDeletingInterviewer(null);
      toast({
        title: "All Assignments Removed",
        description: `Removed all ${deletingInterviewer.assignments.length} assignment(s) for ${deletingInterviewer.interviewer.firstName} ${deletingInterviewer.interviewer.lastName}`,
      });
    } catch (error: any) {
      console.error("Delete all assignments error:", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Failed to delete assignments.",
      });
    } finally {
      setSaving(false);
    }
  };



  // Group assignments by interviewer
  const interviewerAssignments = interviewers.map((interviewer) => {
    const interviewerAssignmentsList = assignments.filter((a) => a.user_id === interviewer.id);
    const assignedBarangays = interviewerAssignmentsList.map((a) => {
      const barangay = barangays.find((b) => b.id === a.barangay_id);
      return barangay?.name || a.barangay_name || a.barangay?.barangay_name || "Unknown";
    });

    return {
      interviewer,
      assignmentCount: interviewerAssignmentsList.length,
      assignedBarangays,
      assignments: interviewerAssignmentsList,
      status: interviewerAssignmentsList.length > 0 ? "Active" : "Unassigned",
    };
  });

  // Filter based on search term
  const filteredInterviewers = interviewerAssignments.filter((ia) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      `${ia.interviewer.firstName} ${ia.interviewer.lastName}`.toLowerCase().includes(searchLower) ||
      ia.interviewer.email.toLowerCase().includes(searchLower) ||
      ia.assignedBarangays.some((b) => b.toLowerCase().includes(searchLower))
    );
  });

  // Statistics
  const totalAssignments = assignments.length;
  const activeInterviewers = interviewerAssignments.filter((ia) => ia.assignmentCount > 0).length;
  const unassignedInterviewers = interviewers.length - activeInterviewers;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assignment Management</h2>
          <p className="text-gray-600">Manage Field Interviewer assignments to barangays</p>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={onAddAssignment}>
          <UserCheck className="w-4 h-4 mr-2" />
          Add Assignment
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalAssignments}</div>
              <div className="text-xs text-gray-600">Total Assignments</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{activeInterviewers}</div>
              <div className="text-xs text-gray-600">Active Interviewers</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{unassignedInterviewers}</div>
              <div className="text-xs text-gray-600">Unassigned</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{interviewers.length}</div>
              <div className="text-xs text-gray-600">Total Interviewers</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search by interviewer name, email, or barangay..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full"
        />
      </div>

      {/* Interviewer Assignment Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span>Field Interviewer Assignments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : interviewers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No interviewers found</p>
              <p className="text-gray-500">Please ensure there are users with "interviewer" role.</p>
            </div>
          ) : filteredInterviewers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No interviewers found</p>
              <p className="text-gray-500 mb-4">No interviewers match your search criteria "{searchTerm}"</p>
              <Button onClick={() => setSearchTerm("")} variant="outline" className="text-gray-600 hover:text-gray-800">
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-medium">Interviewer</TableHead>
                    <TableHead className="font-medium">Email</TableHead>
                    <TableHead className="font-medium">Assigned Barangays</TableHead>
                    <TableHead className="font-medium text-center">Assignment Count</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInterviewers.map((ia) => (
                    <TableRow key={ia.interviewer.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-gray-900">
                            {ia.interviewer.firstName} {ia.interviewer.lastName}
                          </span>
                          <span className="text-xs text-gray-500">ID: {ia.interviewer.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">{ia.interviewer.email}</div>
                      </TableCell>
                      <TableCell>
                        {ia.assignedBarangays.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {ia.assignedBarangays.map((barangay, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {barangay}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No assignments</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-medium text-gray-900">{ia.assignmentCount}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={ia.status === "Active" ? "default" : "outline"}
                          className={`text-xs ${
                            ia.status === "Active"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }`}
                        >
                          {ia.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-3 hover:bg-blue-100"
                            onClick={() => handleEditInterviewerAssignments(ia.interviewer, ia.assignments)}
                            title="Edit barangay assignments"
                          >
                            <Edit className="w-4 h-4 mr-1 text-blue-600" />
                            <span className="text-xs">Edit</span>
                          </Button>
                          {ia.assignmentCount > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-3 hover:bg-red-100"
                              onClick={() => handleDeleteAllAssignments(ia.interviewer, ia.assignments)}
                              title="Remove all assignments"
                            >
                              <Trash2 className="w-4 h-4 mr-1 text-red-600" />
                              <span className="text-xs">Delete All</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete All Assignments Confirmation Modal */}
      {deletingInterviewer && (
        <Dialog open={!!deletingInterviewer} onOpenChange={(open) => !open && setDeletingInterviewer(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Remove All Assignments?</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2 mt-4 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Confirm Removal</span>
            </div>
            <div className="mt-2 text-gray-700">
              Are you sure you want to remove all {deletingInterviewer.assignments.length} assignment(s) for{" "}
              <span className="font-semibold">
                {deletingInterviewer.interviewer.firstName} {deletingInterviewer.interviewer.lastName}
              </span>
              ?
            </div>
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <div className="text-sm font-medium text-gray-700 mb-2">Assigned Barangays:</div>
              <div className="flex flex-wrap gap-1">
                {deletingInterviewer.assignments.map((assignment) => (
                  <Badge key={assignment.assignment_id} variant="outline" className="text-xs">
                    {barangays.find((b) => b.id === assignment.barangay_id)?.name || assignment.barangay_name || "Unknown"}
                  </Badge>
                ))}
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setDeletingInterviewer(null)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleConfirmDeleteAll} disabled={saving} variant="destructive">
                {saving ? "Removing..." : "Remove All"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Interviewer Assignments Modal */}
      {editingInterviewer && (
        <Dialog open={!!editingInterviewer} onOpenChange={(open) => !open && setEditingInterviewer(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Edit Assignments for {editingInterviewer.firstName} {editingInterviewer.lastName}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <Label className="text-sm font-medium mb-3 block">
                Select Barangays to Assign (Awardee Barangays Only)
              </Label>
              <div className="space-y-2 max-h-96 overflow-y-auto border rounded-md p-3">
                {barangays.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No awardee barangays found
                  </div>
                ) : (
                  barangays.map((barangay) => (
                    <div
                      key={barangay.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => handleToggleBarangay(barangay.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedBarangayIds.has(barangay.id)}
                        onChange={() => handleToggleBarangay(barangay.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label className="flex-1 text-sm cursor-pointer">
                        {barangay.name}
                        <span className="text-xs text-gray-500 ml-2">
                          ({barangay.population?.toLocaleString()} pop, {barangay.households?.toLocaleString()} households)
                        </span>
                      </label>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-3 text-xs text-gray-600">
                Selected: {selectedBarangayIds.size} barangay{selectedBarangayIds.size !== 1 ? 's' : ''}
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setEditingInterviewer(null)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSaveAssignments} disabled={saving}>
                {saving ? "Saving..." : "Save Assignments"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
