"use client";

import { useState } from "react";
import { CheckCircle, Clock, AlertTriangle, MapPin, PlayCircle, History } from "lucide-react";
import { VisitStatusModal } from "./VisitStatusModal";
import { VisitHistoryDisplay } from "./VisitHistoryDisplay";
import { calculateDisplayId } from "@/utils/displayIdCalculator";

interface Visit {
  visitId: number;
  visitNumber: number;
  timestamp: string;
  outcome: string;
  notes: string | null;
  location?: { lat: number; lng: number } | null;
}

interface Interview {
  questionnaireId: string;
  sequenceNumber: number;
  status: string;
  visitCount: number;
  visits?: Visit[];
  display_id?: number | null;
}

interface InterviewSlotCardProps {
  interview: Interview;
  spotId: number;
  cycleId: number;
  barangayId: number;
  onUpdate?: () => void;
}

export function InterviewSlotCard({ interview, spotId, cycleId, barangayId, onUpdate }: InterviewSlotCardProps) {
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Get display ID with fallback logic
  const getDisplayId = (): number | null => {
    // First, try to use display_id from API response
    if (interview.display_id !== undefined && interview.display_id !== null) {
      return interview.display_id;
    }
    
    // Fallback: calculate display_id from questionnaireId
    const calculated = calculateDisplayId(interview.questionnaireId);
    if (calculated !== null) {
      return calculated;
    }
    
    // Ultimate fallback: return null (will show full_id)
    return null;
  };

  const displayId = getDisplayId();

  // Determine status display
  const getStatusDisplay = () => {
    switch (interview.status) {
      case 'Completed':
        return {
          badge: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Completed',
          buttonLabel: 'View Details',
          buttonClass: 'bg-green-100 text-green-800 cursor-not-allowed',
          buttonDisabled: true
        };
      case 'In_Progress':
        return {
          badge: 'bg-orange-100 text-orange-800',
          icon: <Clock className="w-4 h-4" />,
          label: `In Progress (Callback ${interview.visitCount})`,
          buttonLabel: 'Resume Interview',
          buttonClass: 'bg-orange-600 text-white hover:bg-orange-700',
          buttonDisabled: false
        };
      case 'Flagged_For_Substitution':
        return {
          badge: 'bg-red-100 text-red-800',
          icon: <AlertTriangle className="w-4 h-4" />,
          label: 'Substitution Needed',
          buttonLabel: 'Request Substitution',
          buttonClass: 'bg-red-600 text-white hover:bg-red-700',
          buttonDisabled: true
        };
      default:
        return {
          badge: 'bg-gray-100 text-gray-800',
          icon: <MapPin className="w-4 h-4" />,
          label: 'Pending',
          buttonLabel: 'Start Interview',
          buttonClass: 'bg-blue-600 text-white hover:bg-blue-700',
          buttonDisabled: false
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  const handleAction = async () => {
    if (statusDisplay.buttonDisabled) {
      return;
    }

    // For Pending status, navigate to survey form to start interview
    if (interview.status === 'Pending') {
      // Navigate to survey form with all required parameters
      window.location.href = `/survey/forms?questionnaireId=${interview.questionnaireId}&cycleId=${cycleId}&spotId=${spotId}&barangayId=${barangayId}`;
      return;
    }

    // For In_Progress, check IndexedDB for existing record
    if (interview.status === 'In_Progress') {
      try {
        // Import IndexedDB utilities
        const { getSurveyRecordByQuestionnaire } = await import('@/lib/indexedDB');
        
        // Check for existing record
        const existingRecord = await getSurveyRecordByQuestionnaire(interview.questionnaireId);
        
        if (existingRecord) {
          console.log(`📖 Found existing record for ${interview.questionnaireId}:`, existingRecord);
          
          // Display previous visit notes in console for debugging
          if (existingRecord.visits && existingRecord.visits.length > 0) {
            console.log(`📝 Previous visits:`, existingRecord.visits);
          }
          
          // Navigate to survey form to resume interview
          // The survey form will load the existing record and increment visit count
          window.location.href = `/survey/forms?questionnaireId=${interview.questionnaireId}&cycleId=${cycleId}&spotId=${spotId}&barangayId=${barangayId}`;
        } else {
          // No existing record found, show visit status modal
          console.log(`📭 No existing record found for ${interview.questionnaireId}, showing visit modal`);
          setShowVisitModal(true);
        }
      } catch (error) {
        console.error('Error loading existing record:', error);
        // Fallback to showing visit status modal
        setShowVisitModal(true);
      }
    }
  };

  const handleVisitLogged = () => {
    setShowVisitModal(false);
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span 
                className="text-sm font-semibold text-gray-900"
                aria-label={displayId !== null ? `Interview number ${displayId}` : `Questionnaire ${interview.questionnaireId}`}
              >
                {displayId !== null ? `Interview #${displayId}` : interview.questionnaireId}
              </span>
              <span className="text-xs text-gray-500">
                Slot #{interview.sequenceNumber}
              </span>
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${statusDisplay.badge}`}>
              {statusDisplay.icon}
              {statusDisplay.label}
            </span>
          </div>
        </div>

        {/* Visit History Summary for In Progress */}
        {interview.status === 'In_Progress' && interview.visitCount > 0 && (
          <div className="mb-3">
            <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs">
              <p className="text-orange-800">
                <span className="font-medium">Previous visits:</span> {interview.visitCount}
              </p>
              {interview.visits && interview.visits.length > 0 && (() => {
                const lastVisit = interview.visits[interview.visits.length - 1];
                return (
                  <div className="mt-2 space-y-1">
                    <p className="text-orange-700 font-medium">Last visit:</p>
                    <p className="text-orange-600">
                      {new Date(lastVisit.timestamp).toLocaleDateString()} - {lastVisit.outcome}
                    </p>
                    {lastVisit.notes && (
                      <p className="text-orange-600 italic">
                        "{lastVisit.notes.substring(0, 50)}{lastVisit.notes.length > 50 ? '...' : ''}"
                      </p>
                    )}
                  </div>
                );
              })()}
              <p className="text-orange-600 mt-2">
                Click "Resume Interview" to continue
              </p>
            </div>
            {interview.visits && interview.visits.length > 0 && (
              <button
                onClick={() => setShowHistory(true)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <History className="w-3 h-3" />
                View full visit history
              </button>
            )}
          </div>
        )}

        {/* Flagged Warning */}
        {interview.status === 'Flagged_For_Substitution' && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
            <p className="text-red-800">
              <span className="font-medium">3 failed attempts</span>
            </p>
            <p className="text-red-600 mt-1">
              This slot has been flagged for substitution. Contact your supervisor.
            </p>
            {interview.visits && interview.visits.length > 0 && (
              <button
                onClick={() => setShowHistory(true)}
                className="mt-2 text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <History className="w-3 h-3" />
                View visit history
              </button>
            )}
          </div>
        )}

        {/* Completed Status */}
        {interview.status === 'Completed' && interview.visits && interview.visits.length > 0 && (
          <div className="mb-3">
            <button
              onClick={() => setShowHistory(true)}
              className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1"
            >
              <History className="w-3 h-3" />
              View visit history
            </button>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleAction}
          disabled={statusDisplay.buttonDisabled}
          className={`w-full px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${statusDisplay.buttonClass}`}
        >
          {interview.status === 'Pending' && <PlayCircle className="w-4 h-4" />}
          {interview.status === 'In_Progress' && <Clock className="w-4 h-4" />}
          {interview.status === 'Completed' && <CheckCircle className="w-4 h-4" />}
          {interview.status === 'Flagged_For_Substitution' && <AlertTriangle className="w-4 h-4" />}
          {statusDisplay.buttonLabel}
        </button>
      </div>

      {/* Visit Status Modal */}
      <VisitStatusModal
        open={showVisitModal}
        onClose={() => setShowVisitModal(false)}
        onSuccess={handleVisitLogged}
        questionnaireId={interview.questionnaireId}
        currentVisitCount={interview.visitCount}
      />

      {/* Visit History Display */}
      {interview.visits && (
        <VisitHistoryDisplay
          open={showHistory}
          onClose={() => setShowHistory(false)}
          questionnaireId={interview.questionnaireId}
          visits={interview.visits}
        />
      )}
    </>
  );
}
