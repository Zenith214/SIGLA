"use client";

import { useState, useEffect } from "react";
import { X, MapPin, User, Calendar, FileText, AlertTriangle } from "lucide-react";
import InterviewMapView from "@/components/supervisor/InterviewMapView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GPSCoordinates } from "@/app/survey/forms/utils/gpsVerification";

interface InterviewDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  interviewId: number;
  questionnaireId: string;
}

interface InterviewDetails {
  response_id: number;
  questionnaire_id: string;
  survey_number: string;
  interviewer_name: string;
  barangay_name: string;
  location: GPSCoordinates;
  verification_location?: GPSCoordinates;
  gps_verification_status: "pending" | "verified" | "flagged";
  gps_distance_meters?: number;
  respondent_name: string;
  respondent_age: number;
  respondent_gender: string;
  visit_count: number;
  created_at: string;
  updated_at: string;
  spot_name?: string;
}

export default function InterviewDetailModal({
  isOpen,
  onClose,
  interviewId,
  questionnaireId,
}: InterviewDetailModalProps) {
  const [interview, setInterview] = useState<InterviewDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && interviewId) {
      fetchInterviewDetails();
    }
  }, [isOpen, interviewId]);

  const fetchInterviewDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/fs/interviews/${interviewId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch interview details");
      }

      const data = await response.json();
      setInterview(data);
    } catch (err) {
      console.error("Error fetching interview details:", err);
      setError(err instanceof Error ? err.message : "Failed to load interview details");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Interview Details</h2>
            <p className="text-sm text-gray-600 mt-1">Questionnaire: {questionnaireId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchInterviewDetails}
                className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
              >
                Try Again
              </button>
            </div>
          )}

          {interview && !loading && !error && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="gps-verification">
                  GPS Verification
                  {interview.gps_verification_status === "flagged" && (
                    <AlertTriangle className="h-4 w-4 ml-2 text-red-500" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="respondent">Respondent Info</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Survey Number</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{interview.survey_number}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Interviewer</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{interview.interviewer_name}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Barangay</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{interview.barangay_name}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Visit Count</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{interview.visit_count}</p>
                  </div>
                </div>

                {interview.spot_name && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 mb-1">Assigned Spot</p>
                    <p className="text-lg font-semibold text-blue-700">{interview.spot_name}</p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(interview.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(interview.updated_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* GPS Verification Tab */}
              <TabsContent value="gps-verification" className="mt-4">
                <InterviewMapView
                  surveyResponse={{
                    id: interview.response_id,
                    questionnaireId: interview.questionnaire_id,
                    assignedSpot: interview.location,
                    verificationLocation: interview.verification_location,
                  }}
                  verificationThreshold={200}
                />
              </TabsContent>

              {/* Respondent Info Tab */}
              <TabsContent value="respondent" className="space-y-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Respondent Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Name</p>
                      <p className="text-base font-medium text-gray-900">{interview.respondent_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Age</p>
                      <p className="text-base font-medium text-gray-900">{interview.respondent_age} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Gender</p>
                      <p className="text-base font-medium text-gray-900">{interview.respondent_gender}</p>
                    </div>
                  </div>
                </div>

                {interview.verification_location && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">GPS Capture Details</h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-blue-700">Coordinates:</span>
                        <span className="ml-2 text-blue-900 font-mono">
                          {interview.verification_location.lat.toFixed(6)}, {interview.verification_location.lng.toFixed(6)}
                        </span>
                      </div>
                      {interview.verification_location.accuracy && (
                        <div>
                          <span className="text-blue-700">Accuracy:</span>
                          <span className="ml-2 text-blue-900">
                            ±{Math.round(interview.verification_location.accuracy)}m
                          </span>
                        </div>
                      )}
                      {interview.verification_location.timestamp && (
                        <div>
                          <span className="text-blue-700">Captured:</span>
                          <span className="ml-2 text-blue-900">
                            {new Date(interview.verification_location.timestamp).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
