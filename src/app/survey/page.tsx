"use client"
import Link from "next/link"
import { User, Settings, LogOut, ChevronDown } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

interface Barangay {
  id: number;
  name: string;
  progress: number;
  status: string;
  population?: number;
  households?: number;
  captain?: string;
  description?: string;
  currentStatus?: string;
  seal?: string;
  assignment?: {
    assignment_id: number;
    status: string;
    progress: number;
    created_at: string;
    updated_at: string;
    interviewer: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

// Helper function to calculate overall progress based on active assignments
function calculateOverallProgress(barangays: Barangay[]): number {
  if (!barangays || barangays.length === 0) {
    return 0;
  }

  // Debug: Log the barangays data
  console.log('Barangays data for progress calculation:', barangays.map(b => ({
    name: b.name,
    progress: b.progress,
    assignment_status: b.assignment?.status,
    has_assignment: !!b.assignment
  })));

  // Filter barangays that have assignments (any status)
  const barangaysWithAssignments = barangays.filter(b => b.assignment);

  if (barangaysWithAssignments.length === 0) {
    console.log('No barangays with assignments found');
    return 0;
  }

  // Calculate average progress of all barangays with assignments (ensure numbers)
  const totalProgress = barangaysWithAssignments.reduce((acc, b) => {
    const progress = typeof b.progress === 'string' ? parseInt(b.progress) || 0 : (b.progress || 0);
    return acc + progress;
  }, 0);
  const averageProgress = totalProgress / barangaysWithAssignments.length;
  
  console.log('Progress calculation:', {
    totalProgress,
    count: barangaysWithAssignments.length,
    averageProgress
  });
  
  // Ensure progress doesn't exceed 100%
  return Math.min(Math.round(averageProgress), 100);
}

function SurveyDashboardContent() {
  const { user, logout } = useAuth() // Add logout from useAuth
  const router = useRouter()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [currentTime, setCurrentTime] = useState<string>('')
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const [loading, setLoading] = useState(true)

  // Logout handler function
  const handleLogout = async () => {
    await logout()
  }

  // Get role-specific welcome message
  const getRoleDisplayName = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'Administrator'
      case 'interviewer':
        return 'Field Interviewer'
      case 'viewer':
        return 'Data Viewer'
      default:
        return 'User'
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'Manage assignments, monitor survey progress, and oversee all survey operations across assigned barangays.'
      case 'interviewer':
        return 'Continue your survey work and track progress across your assigned barangays.'
      case 'viewer':
        return 'View assignment progress and survey data across all assigned barangays.'
      default:
        return 'Access assignment information and track survey progress.'
    }
  }

  // Fetch barangays with assignments from database
  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        const response = await fetch('/api/barangays-with-assignments');
        if (!response.ok) {
          throw new Error('Failed to fetch barangays with assignments');
        }
        const data = await response.json();
        setBarangays(data);
      } catch (error) {
        console.error('Error fetching barangays with assignments:', error);
        // Fallback to empty array if fetch fails
        setBarangays([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBarangays();
  }, []);

  // Update time display
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Convert to Philippine time (UTC+8)
      const philippineTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
      const timeString = philippineTime.toISOString().slice(0, 19).replace('T', ' ');
      setCurrentTime(timeString);
    };

    // Update immediately
    updateTime();

    // Update every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#dbeafe' }}>
      {/* Header */}
      <header className="bg-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-sm sm:text-lg md:text-xl font-semibold text-white truncate pr-4">
              <span className="hidden sm:inline">
                PULSE: Public Understanding and Local Service Evaluation
              </span>
              <span className="sm:hidden">PULSE Survey</span>
            </h1>

            {/* Right side - Time, Back Button, and User Menu */}
            <div className="flex items-center gap-4">
              {/* Philippine Date and Time */}
              <div className="text-white text-sm font-mono hidden sm:block">
                {currentTime}
              </div>

              {/* Separator */}
              <div className="text-gray-400 hidden sm:block">|</div>

              {/* Back to Dashboard Button - Hidden for interviewers */}
              {user?.role?.toLowerCase() !== 'interviewer' && (
                <>
                  <Link
                    href="/dashboard"
                    className="px-3 py-1 text-sm font-medium text-white border border-white/20 rounded hover:bg-white/10 transition-colors"
                  >
                    Back to Dashboard
                  </Link>

                  {/* Separator */}
                  <div className="text-gray-400 hidden sm:block">|</div>
                </>
              )}

              {/* User Menu */}
              <div className="relative" ref={dropdownRef}>
                <div
                  className="flex items-center space-x-2 cursor-pointer hover:bg-slate-700 rounded-lg p-2 transition-colors"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
                    {/* Show Settings only for admin users */}
                    {user?.role?.toLowerCase() === 'admin' && (
                      <>
                        <Link
                          href="/settings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full text-left px-4 py-3 text-sm text-[#111827] hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-6">
          {/* Welcome Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-2">
              Welcome, {user ? getRoleDisplayName(user.role) : 'User'}!
            </h2>
            <p className="text-sm sm:text-base text-[#6b7280]">
              {user ? getRoleDescription(user.role) : 'Access survey information and track progress.'}
            </p>
          </div>

          {/* Overall Assignment Progress Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-[#111827] mb-4">
              PULSE Survey 2025 - Assignment Progress Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {loading ? "..." : barangays.length}
                </div>
                <div className="text-sm text-gray-600">Active Assignments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {loading ? "..." : barangays.filter(b => b.status === 'Completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {loading ? "..." : barangays.filter(b => b.status === 'In Progress').length}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b7280]">Overall Progress</span>
                <span className="text-[#111827] font-medium">
                  {loading ? "Loading..." : `${calculateOverallProgress(barangays)}%`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[#16a34a] h-3 rounded-full transition-all duration-300"
                  style={{ 
                    width: loading ? "0%" : `${calculateOverallProgress(barangays)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Barangay Progress Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-8 animate-pulse"></div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : barangays.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No active assignments found. Please check with your administrator to get assigned to barangays.</p>
              </div>
            ) : (
              barangays.map((barangay) => (
                <Link key={barangay.id} href={`/survey/barangay/${barangay.id}`} className="block">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-[#111827] text-sm sm:text-base">{barangay.name}</h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${barangay.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : barangay.status === "In Progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {barangay.status}
                        </span>
                      </div>

                      {/* Assignment Information */}
                      {barangay.assignment && (
                        <div className="text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Interviewer:</span>
                            <span className="font-medium">
                              {barangay.assignment.interviewer.firstName} {barangay.assignment.interviewer.lastName}
                            </span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span>Assignment:</span>
                            <span className="font-medium">{barangay.assignment.status}</span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-[#6b7280]">Survey Progress</span>
                          <span className="text-[#111827] font-medium">{barangay.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              barangay.progress === 100 ? 'bg-green-500' :
                              barangay.progress >= 75 ? 'bg-blue-600' :
                              barangay.progress >= 50 ? 'bg-blue-500' :
                              barangay.progress >= 25 ? 'bg-blue-400' :
                              barangay.progress > 0 ? 'bg-orange-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${barangay.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Population info */}
                      <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <span>Pop: {barangay.population?.toLocaleString() || 'N/A'}</span>
                        <span>HH: {barangay.households?.toLocaleString() || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <SurveyDashboardContent />
    </ProtectedRoute>
  )
}
