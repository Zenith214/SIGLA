"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, AlertCircle } from "lucide-react";
import { VisitStatusModal } from "@/components/fi-dashboard/VisitStatusModal";
import { useToast } from "@/hooks/use-toast";
import { addVisit } from "@/lib/indexedDB";

interface VisitStatusButtonProps {
  questionnaireId: string | null;
  cycleId: number | null;
  currentVisitCount: number;
  onVisitLogged?: () => void;
}

export function VisitStatusButton({
  questionnaireId,
  cycleId,
  currentVisitCount,
  onVisitLogged,
}: VisitStatusButtonProps) {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);

  // Don't show button if we don't have questionnaire context
  if (!questionnaireId || !cycleId) {
    return null;
  }

  const handleVisitLogged = async () => {
    // Refresh the page or update state to reflect the new visit
    if (onVisitLogged) {
      onVisitLogged();
    }
    
    toast({
      title: "Visit Logged",
      description: "The visit status has been recorded. You can continue with the interview or return later.",
    });
  };

  return (
    <>
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              Before Starting the Interview
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              If you need to schedule a callback or cannot proceed with the interview, 
              click the button below to log the visit status.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowModal(true)}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <FileText className="w-4 h-4 mr-2" />
              Log Visit Status
            </Button>
          </div>
        </div>
      </div>

      <VisitStatusModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleVisitLogged}
        questionnaireId={questionnaireId}
        currentVisitCount={currentVisitCount}
      />
    </>
  );
}
