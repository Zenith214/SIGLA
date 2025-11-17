"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { UserCheck, Users, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [deletingAssignment, setDeletingAssignment] = useState<Assignment | null>(null);
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

      if (!assignmentsRes.ok || !interviewersRes.ok || !barangaysRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const assignmentsData = await assignmentsRes.json();
      const interviewersData = await interviewersRes.json();
      const barangaysData = await barangaysRes.json();

      setAssignments(assignmentsData || []);
      setInterviewers(interviewersData || []);
      // Handle the new barangays API response structure
      setBarangays(barangaysData?.data || barangaysData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load assignment data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (assignment: Assignment) => {
    setDeletingAssignment(assignment);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAssignment) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/assignments/${deletingAssignment.assignment_id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete assignment");
      }

      setAssignments(assignments.filter((a) => a.assignment_id !== deletingAssignment.assignment_id));
      setDeletingAssignment(null);
      toast({
        title: "Assignment Deleted",
        description: "Assignment has been removed successfully.",
      });
    } catch (error: any) {
      console.error("Delete assignment error:", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "An unexpected error occurred while deleting the assignment.",
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
                        <div className="flex justify-center space-x-1">
                          {ia.assignments.map((assignment) => (
                            <Button
                              key={assignment.assignment_id}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-red-100"
                              onClick={() => handleDeleteClick(assignment)}
                              title={`Unassign from ${
                                barangays.find((b) => b.id === assignment.barangay_id)?.name ||
                                assignment.barangay_name ||
                                "barangay"
                              }`}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          ))}
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

      {/* Delete Assignment Modal */}
      {deletingAssignment && (
        <Dialog open={!!deletingAssignment} onOpenChange={(open) => !open && setDeletingAssignment(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Unassign Interviewer</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2 mt-4 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Confirm Unassignment</span>
            </div>
            <div className="mt-2 text-gray-700">
              Are you sure you want to unassign{" "}
              <span className="font-semibold">
                {deletingAssignment.firstName || deletingAssignment.user?.firstName}{" "}
                {deletingAssignment.lastName || deletingAssignment.user?.lastName}
              </span>{" "}
              from{" "}
              <span className="font-semibold">
                {barangays.find((b) => b.id === deletingAssignment.barangay_id)?.name ||
                  deletingAssignment.barangay_name ||
                  deletingAssignment.barangay?.barangay_name ||
                  "this barangay"}
              </span>
              ?
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setDeletingAssignment(null)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleDeleteConfirm} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white">
                {saving ? "Removing..." : "Unassign"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
