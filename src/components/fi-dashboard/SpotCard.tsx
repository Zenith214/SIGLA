"use client";

import { MapPin, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface Interview {
  questionnaireId: string;
  sequenceNumber: number;
  status: string;
  visitCount: number;
}

interface SpotAssignment {
  spotId: number;
  spotName: string;
  barangayId: number;
  barangayName: string;
  startingPoint: any;
  randomStart: number;
  status: string;
  completedCount: number;
  totalCount: number;
  inProgressCount: number;
  flaggedCount: number;
  createdAt: string;
  updatedAt: string;
  interviews: Interview[];
}

interface SpotCardProps {
  spot: SpotAssignment;
  onClick: () => void;
}

export function SpotCard({ spot, onClick }: SpotCardProps) {
  // Determine status badge color and icon
  const getStatusBadge = () => {
    if (spot.completedCount === spot.totalCount && spot.totalCount > 0) {
      return {
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="w-3 h-3" />,
        label: "Completed"
      };
    } else if (spot.inProgressCount > 0 || spot.completedCount > 0) {
      return {
        color: "bg-blue-100 text-blue-800",
        icon: <Clock className="w-3 h-3" />,
        label: "In Progress"
      };
    } else {
      return {
        color: "bg-gray-100 text-gray-800",
        icon: <MapPin className="w-3 h-3" />,
        label: "Pending"
      };
    }
  };

  const statusBadge = getStatusBadge();
  const progressPercentage = spot.totalCount > 0 
    ? Math.round((spot.completedCount / spot.totalCount) * 100)
    : 0;

  // Get status for each interview slot
  const getInterviewSlotStatus = (interview: Interview) => {
    switch (interview.status) {
      case 'Completed':
        return {
          color: 'bg-green-500',
          icon: <CheckCircle className="w-4 h-4 text-green-600" />,
          label: 'Completed'
        };
      case 'In_Progress':
        return {
          color: 'bg-orange-500',
          icon: <Clock className="w-4 h-4 text-orange-600" />,
          label: `Callback ${interview.visitCount}`
        };
      case 'Flagged_For_Substitution':
        return {
          color: 'bg-red-500',
          icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
          label: 'Flagged'
        };
      default:
        return {
          color: 'bg-gray-300',
          icon: <MapPin className="w-4 h-4 text-gray-600" />,
          label: 'Pending'
        };
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border-2 border-gray-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-base mb-1">
            {spot.spotName}
          </h4>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {spot.barangayName}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full font-medium flex items-center gap-1 ${statusBadge.color}`}>
          {statusBadge.icon}
          {statusBadge.label}
        </span>
      </div>

      {/* Progress Indicator */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold text-gray-900">
            {spot.completedCount}/{spot.totalCount} Completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              progressPercentage === 100 ? 'bg-green-500' :
              progressPercentage >= 60 ? 'bg-blue-600' :
              progressPercentage >= 20 ? 'bg-blue-400' :
              progressPercentage > 0 ? 'bg-orange-500' : 'bg-gray-400'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Interview Slots */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-700 mb-2">Interview Slots:</p>
        <div className="space-y-1.5">
          {spot.interviews.map((interview) => {
            const slotStatus = getInterviewSlotStatus(interview);
            return (
              <div
                key={interview.questionnaireId}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${slotStatus.color}`} />
                  <span className="text-xs font-mono text-gray-700">
                    {interview.questionnaireId}
                  </span>
                </div>
                <span className="text-xs text-gray-600">
                  {slotStatus.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flagged Warning */}
      {spot.flaggedCount > 0 && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-xs text-red-800">
            {spot.flaggedCount} {spot.flaggedCount === 1 ? 'slot' : 'slots'} flagged for substitution
          </span>
        </div>
      )}
    </div>
  );
}
