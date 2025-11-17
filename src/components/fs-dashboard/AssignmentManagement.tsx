"use client";

import { useState } from "react";
import InterviewerAssignmentTable from "./InterviewerAssignmentTable";
import BarangayAssignmentModal from "./BarangayAssignmentModal";

export default function AssignmentManagement() {
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddAssignment = () => {
    setShowAssignmentModal(true);
  };

  const handleAssignmentSuccess = () => {
    // Trigger a refresh of the table by changing the key
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="h-full bg-white rounded-lg shadow-sm p-6 overflow-auto">
      <InterviewerAssignmentTable key={refreshKey} onAddAssignment={handleAddAssignment} />
      <BarangayAssignmentModal
        open={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        onSuccess={handleAssignmentSuccess}
      />
    </div>
  );
}
