"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

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

interface BarangayAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BarangayAssignmentModal({ open, onClose, onSuccess }: BarangayAssignmentModalProps) {
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    barangay_id: "",
    status: "Assigned",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [interviewersRes, barangaysRes] = await Promise.all([
        fetch("/api/interviewers", { credentials: "include" }),
        fetch("/api/barangays?awardees_only=true", { credentials: "include" }),
      ]);

      if (!interviewersRes.ok || !barangaysRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const interviewersData = await interviewersRes.json();
      const barangaysData = await barangaysRes.json();

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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.user_id) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a Field Interviewer.",
      });
      return false;
    }
    if (!formData.barangay_id) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a barangay.",
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        user_id: Number(formData.user_id),
        barangay_id: Number(formData.barangay_id),
        status: formData.status,
        progress: 0,
      };

      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Failed to create assignment");
      }

      toast({
        title: "Assignment Created",
        description: "Field Interviewer has been assigned successfully.",
      });

      // Reset form
      setFormData({
        user_id: "",
        barangay_id: "",
        status: "Assigned",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Create assignment error:", error);
      toast({
        variant: "destructive",
        title: "Assignment Failed",
        description: error.message || "An unexpected error occurred while creating the assignment.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setFormData({
        user_id: "",
        barangay_id: "",
        status: "Assigned",
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Field Interviewer to Barangay</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-4 mt-2">
            <div>
              <Label htmlFor="user_id" className="text-sm font-medium">
                Field Interviewer *
                <span className="text-xs text-gray-500 ml-1">({interviewers.length} available)</span>
              </Label>
              <select
                id="user_id"
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1"
                required
                disabled={saving}
              >
                <option value="">Select Field Interviewer</option>
                {interviewers.map((interviewer) => (
                  <option key={interviewer.id} value={interviewer.id}>
                    {interviewer.firstName} {interviewer.lastName} ({interviewer.email})
                  </option>
                ))}
              </select>
              {interviewers.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  No interviewers found. Please ensure there are users with "interviewer" role.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="barangay_id" className="text-sm font-medium">
                Barangay *
                <span className="text-xs text-gray-500 ml-1">({barangays.length} awardee barangays)</span>
              </Label>
              <select
                id="barangay_id"
                name="barangay_id"
                value={formData.barangay_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1"
                required
                disabled={saving}
              >
                <option value="">Select Barangay</option>
                {barangays.map((barangay) => (
                  <option key={barangay.id} value={barangay.id}>
                    {barangay.name} (Pop: {barangay.population?.toLocaleString() || 0}, HH: {barangay.households?.toLocaleString() || 0})
                  </option>
                ))}
              </select>
              {barangays.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  No awardee barangays found. Please ensure barangays have been granted award status for the current cycle.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="status" className="text-sm font-medium">
                Status *
              </Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1"
                required
                disabled={saving}
              >
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading || interviewers.length === 0 || barangays.length === 0}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {saving ? "Creating..." : "Create Assignment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
