"use client";

import { use } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SpotWorkflowScreen } from "@/components/fi-dashboard";

interface PageProps {
  params: Promise<{
    spotId: string;
  }>;
}

function SpotWorkflowPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const spotId = parseInt(resolvedParams.spotId);

  return (
    <ProtectedRoute>
      <SpotWorkflowScreen spotId={spotId} />
    </ProtectedRoute>
  );
}

export default SpotWorkflowPage;
