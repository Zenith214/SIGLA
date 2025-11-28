"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SpotCard } from "./SpotCard";

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

interface MySpotAssignmentsProps {
  cycleId?: number;
}

export function MySpotAssignments({ cycleId }: MySpotAssignmentsProps) {
  const router = useRouter();
  const [assignments, setAssignments] = useState<SpotAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, [cycleId]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = cycleId 
        ? `/api/fi/assignments?cycleId=${cycleId}`
        : '/api/fi/assignments';

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch assignments');
      }

      const data = await response.json();
      // Empty assignments array is valid, not an error
      setAssignments(data.assignments || []);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleSpotClick = (spotId: number) => {
    router.push(`/survey/spot/${spotId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading your assignments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-blue-900 font-semibold mb-1">No Assignments Available</h3>
            <p className="text-blue-700 text-sm mb-3">
              You don't have any spot assignments yet. This could be because:
            </p>
            <ul className="text-blue-700 text-sm space-y-1 mb-4 list-disc list-inside">
              <li>No active survey cycle is currently running</li>
              <li>Your Field Supervisor hasn't assigned you any spots yet</li>
              <li>You need to log in with an interviewer account</li>
            </ul>
            <p className="text-blue-600 text-sm font-medium">
              💡 Contact your Field Supervisor to get assigned to spots for fieldwork.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Spot Assignments Yet</h3>
          <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto">
            You haven't been assigned to any spots for the current survey cycle. 
            Once your Field Supervisor assigns you to spots, they will appear here.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-blue-800 text-sm font-medium mb-1">What are spots?</p>
            <p className="text-blue-700 text-xs">
              Spots are geographic work areas containing 5 interview assignments each. 
              Your Field Supervisor will allocate spots to you based on the survey cycle requirements.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          My Spot Assignments
        </h3>
        <div className="text-sm text-gray-600">
          {assignments.length} {assignments.length === 1 ? 'spot' : 'spots'} assigned
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((spot) => (
          <SpotCard
            key={spot.spotId}
            spot={spot}
            onClick={() => handleSpotClick(spot.spotId)}
          />
        ))}
      </div>
    </div>
  );
}
