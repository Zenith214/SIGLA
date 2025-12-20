"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, MapPin, CheckCircle, Clock, Filter } from "lucide-react";
import InterviewDetailModal from "./InterviewDetailModal";
import { formatDistance } from "@/app/survey/forms/utils/gpsVerification";

interface GPSVerificationItem {
  response_id: number;
  questionnaire_id: string;
  survey_number: string;
  interviewer_name: string;
  barangay_name: string;
  spot_name: string;
  gps_verification_status: "pending" | "verified" | "flagged";
  gps_distance_meters: number | null;
  created_at: string;
  respondent_name: string;
}

interface GPSVerificationMonitorProps {
  cycleId: number;
  loading?: boolean;
}

export default function GPSVerificationMonitor({ cycleId, loading: parentLoading }: GPSVerificationMonitorProps) {
  const [interviews, setInterviews] = useState<GPSVerificationItem[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<GPSVerificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<{ id: number; questionnaireId: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "verified" | "flagged">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (cycleId) {
      fetchGPSVerificationData();
    }
  }, [cycleId]);

  useEffect(() => {
    // Apply filter and reset to page 1
    if (statusFilter === "all") {
      setFilteredInterviews(interviews);
    } else {
      setFilteredInterviews(interviews.filter((i) => i.gps_verification_status === statusFilter));
    }
    setCurrentPage(1);
  }, [statusFilter, interviews]);

  const fetchGPSVerificationData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/fs/gps-verification?cycleId=${cycleId}`);

      if (!response.ok) {
        // Handle 404 or empty data gracefully
        if (response.status === 404) {
          setInterviews([]);
          return;
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch GPS verification data");
      }

      const data = await response.json();
      setInterviews(data.interviews || []);
    } catch (err) {
      console.error("Error fetching GPS verification data:", err);
      setError(err instanceof Error ? err.message : "Failed to load GPS verification data");
      // Set empty array on error so UI shows "no records" instead of error
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle className="h-3 w-3" />
            Verified
          </span>
        );
      case "flagged":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <AlertTriangle className="h-3 w-3" />
            Flagged
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const flaggedCount = interviews.filter((i) => i.gps_verification_status === "flagged").length;
  const verifiedCount = interviews.filter((i) => i.gps_verification_status === "verified").length;
  const pendingCount = interviews.filter((i) => i.gps_verification_status === "pending").length;

  // Pagination calculations
  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInterviews = filteredInterviews.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading || parentLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Show empty state if no interviews and no error
  if (!loading && !parentLoading && interviews.length === 0 && !error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">GPS Verification</h3>
            <p className="text-sm text-gray-600">Monitor interview location verification</p>
          </div>
          <MapPin className="h-6 w-6 text-blue-600" />
        </div>
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No GPS Records Yet</h4>
          <p className="text-sm text-gray-500 mb-4">
            GPS verification data will appear here once interviews with location tracking are submitted.
          </p>
          <button
            onClick={fetchGPSVerificationData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-red-400" />
          <p className="text-red-600 mb-2 font-medium">Error loading GPS verification data</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchGPSVerificationData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* KPI Cards Section */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">GPS Verification</h3>
            <p className="text-sm text-gray-600">Monitor interview location verification</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchGPSVerificationData}
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
            <MapPin className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 font-medium mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">{interviews.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-green-600 font-medium mb-1">Verified</p>
            <p className="text-2xl font-bold text-green-900">{verifiedCount}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-xs text-red-600 font-medium mb-1">Flagged</p>
            <p className="text-2xl font-bold text-red-900">{flaggedCount}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <p className="text-xs text-yellow-600 font-medium mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Table Section - Separate card with min height for 5 items */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Filter */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                All ({interviews.length})
              </button>
              <button
                onClick={() => setStatusFilter("flagged")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === "flagged"
                    ? "bg-red-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Flagged ({flaggedCount})
              </button>
              <button
                onClick={() => setStatusFilter("verified")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === "verified"
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Verified ({verifiedCount})
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === "pending"
                    ? "bg-yellow-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Pending ({pendingCount})
              </button>
            </div>
          </div>
        </div>

        {/* Interview list with min height for 5 rows */}
        <div className="overflow-x-auto min-h-[400px]">
          {filteredInterviews.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                {interviews.length === 0 
                  ? "No GPS verification records yet" 
                  : `No ${statusFilter} interviews found`}
              </p>
              <p className="text-xs text-gray-500">
                {interviews.length === 0
                  ? "Records will appear here once interviews with GPS tracking are submitted"
                  : "Try selecting a different filter"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Questionnaire
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Interviewer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Barangay / Spot
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedInterviews.map((interview) => (
                  <tr
                    key={interview.response_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{interview.questionnaire_id}</p>
                        <p className="text-xs text-gray-500">{interview.survey_number}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{interview.interviewer_name}</td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="text-gray-900">{interview.barangay_name}</p>
                        <p className="text-xs text-gray-500">{interview.spot_name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(interview.gps_verification_status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(interview.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() =>
                          setSelectedInterview({
                            id: interview.response_id,
                            questionnaireId: interview.questionnaire_id,
                          })
                        }
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredInterviews.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{Math.min(endIndex, filteredInterviews.length)}</span> of{" "}
                <span className="font-medium">{filteredInterviews.length}</span> results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interview Detail Modal */}
      {selectedInterview && (
        <InterviewDetailModal
          isOpen={!!selectedInterview}
          onClose={() => setSelectedInterview(null)}
          interviewId={selectedInterview.id}
          questionnaireId={selectedInterview.questionnaireId}
        />
      )}
    </div>
  );
}
