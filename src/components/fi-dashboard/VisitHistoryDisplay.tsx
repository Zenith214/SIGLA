"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, MapPin, FileText, CheckCircle, XCircle, Home, AlertTriangle } from "lucide-react";

interface Visit {
  visitId: number;
  visitNumber: number;
  timestamp: string;
  outcome: string;
  notes: string | null;
  location?: { lat: number; lng: number } | null;
}

interface VisitHistoryDisplayProps {
  open: boolean;
  onClose: () => void;
  questionnaireId: string;
  visits: Visit[];
}

export function VisitHistoryDisplay({
  open,
  onClose,
  questionnaireId,
  visits,
}: VisitHistoryDisplayProps) {
  
  const getOutcomeDisplay = (outcome: string) => {
    switch (outcome) {
      case 'Interview_Completed':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          label: 'Interview Completed',
          color: 'text-green-800',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'Interview_Started':
        return {
          icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
          label: 'Interview Started',
          color: 'text-blue-800',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
      case 'Callback_Needed':
        return {
          icon: <Clock className="w-5 h-5 text-orange-600" />,
          label: 'Callback Needed',
          color: 'text-orange-800',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
        };
      case 'Refused':
        return {
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          label: 'Refused to Participate',
          color: 'text-red-800',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      case 'Household_Moved':
        return {
          icon: <Home className="w-5 h-5 text-gray-600" />,
          label: 'Household Moved',
          color: 'text-gray-800',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
      default:
        return {
          icon: <AlertTriangle className="w-5 h-5 text-gray-600" />,
          label: outcome,
          color: 'text-gray-800',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };
  };

  // Sort visits by visit number (most recent first for display)
  const sortedVisits = [...visits].sort((a, b) => b.visitNumber - a.visitNumber);
  const mostRecentVisit = sortedVisits[0];
  const callbackCount = visits.filter(v => 
    v.outcome === 'Callback_Needed' || 
    v.outcome === 'Refused' || 
    v.outcome === 'Household_Moved'
  ).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Visit History</DialogTitle>
          <DialogDescription>
            Complete visit history for questionnaire {questionnaireId}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-medium">Total Visits</p>
              <p className="text-2xl font-bold text-blue-900">{visits.length}</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-xs text-orange-600 font-medium">Callbacks</p>
              <p className="text-2xl font-bold text-orange-900">{callbackCount}</p>
            </div>
          </div>

          {/* Visit Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Visit Timeline</h3>
            
            {sortedVisits.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No visits recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedVisits.map((visit, index) => {
                  const outcomeDisplay = getOutcomeDisplay(visit.outcome);
                  const { date, time } = formatTimestamp(visit.timestamp);
                  const isMostRecent = visit.visitId === mostRecentVisit?.visitId;

                  return (
                    <div
                      key={visit.visitId}
                      className={`border rounded-lg p-4 ${outcomeDisplay.borderColor} ${outcomeDisplay.bgColor} ${
                        isMostRecent ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                      }`}
                    >
                      {/* Visit Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {outcomeDisplay.icon}
                          <div>
                            <p className={`font-semibold text-sm ${outcomeDisplay.color}`}>
                              Visit #{visit.visitNumber}
                              {isMostRecent && (
                                <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                  Most Recent
                                </span>
                              )}
                            </p>
                            <p className={`text-xs ${outcomeDisplay.color}`}>
                              {outcomeDisplay.label}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                        <Clock className="w-3 h-3" />
                        <span>{date} at {time}</span>
                      </div>

                      {/* Location */}
                      {visit.location && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {visit.location.lat.toFixed(6)}, {visit.location.lng.toFixed(6)}
                          </span>
                        </div>
                      )}

                      {/* Notes */}
                      {visit.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-gray-700 mb-1">Notes:</p>
                              <p className="text-xs text-gray-600 whitespace-pre-wrap">
                                {visit.notes}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
