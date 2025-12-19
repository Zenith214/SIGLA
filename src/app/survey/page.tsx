"use client"
"use client"
import Link from "next/link"
import Image from "next/image"
import { User, Settings, LogOut, ChevronDown, PlayCircle, CheckCircle } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { CycleDisplay } from "@/components/survey-cycle"
import { useActiveCycle } from "@/hooks/useSurveyCycle"
import { MySpotAssignments } from "@/components/fi-dashboard"
import { OfflineIndicator } from "@/components/OfflineIndicator"
import { AutoSync } from "@/components/AutoSync"
import '@/utils/cacheDebug' // Load cache debugging utilities

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
  assignments?: {
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
  }[];
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

  // Calculate average progress of all barangays (whether they have assignments or not)
  const totalProgress = barangays.reduce((acc, b) => {
    const progress = typeof b.progress === 'string' ? parseInt(b.progress) || 0 : (b.progress || 0);
    return acc + progress;
  }, 0);
  const averageProgress = barangays.length > 0 ? totalProgress / barangays.length : 0;
  
  console.log('Progress calculation:', {
    totalProgress,
    count: barangays.length,
    averageProgress
  });
  
  // Ensure progress doesn't exceed 100%
  return Math.min(Math.round(averageProgress), 100);
}

function SurveyDashboardContent() {
  const { user, logout } = useAuth() // Add logout from useAuth
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [currentTime, setCurrentTime] = useState<string>('')
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const [myAssignments, setMyAssignments] = useState<Barangay[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'spots' | 'assignments'>('overview')
  const { activeCycle, hasActiveCycle, loading: cycleLoading } = useActiveCycle()

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
      case 'officer':
        return 'LGU Officer'
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
      case 'officer':
        return 'View assignment progress and survey data across all assigned barangays.'
      default:
        return 'Access assignment information and track survey progress.'
    }
  }

  // Fetch barangays with assignments from database
  const fetchBarangays = async () => {
    try {
      setLoading(true);
      // Add cache-busting parameter to ensure fresh data
      const response = await fetch(`/api/barangays-with-assignments?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch barangays with assignments');
      }
      const data = await response.json();
      setBarangays(data);

      // Filter assignments for current user if they're an interviewer
      if (user?.id && user?.role?.toLowerCase() === 'interviewer') {
        const userAssignments = data.filter((b: Barangay) => 
          b.assignment && b.assignment.interviewer.email === user.email
        );
        setMyAssignments(userAssignments);
      }
    } catch (error) {
      console.error('Error fetching barangays with assignments:', error);
      // Fallback to empty array if fetch fails
      setBarangays([]);
      setMyAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBarangays();
    }
  }, [user]);

  // Refresh data when page becomes visible (e.g., after navigating back from survey form)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log('📊 Page visible - refreshing barangay data...');
        fetchBarangays();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also refresh when window gains focus
    const handleFocus = () => {
      if (user) {
        console.log('📊 Window focused - refreshing barangay data...');
        fetchBarangays();
      }
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

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
      {/* Offline Indicator */}
      <OfflineIndicator />
      
      {/* Auto-sync on reconnection */}
      <AutoSync />
      
      {/* Header */}
      <header className="bg-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image 
                src="/headerlogo4k.png" 
                alt="PULSE Survey" 
                width={120}
                height={43}
                className="h-8 sm:h-10 w-auto"
                priority
              />
            </div>

            {/* Right side - Time, Cycle Info, Back Button, and User Menu */}
            <div className="flex items-center gap-4">
              {/* Philippine Date and Time */}
              <div className="text-white text-sm font-mono hidden sm:block">
                {currentTime}
              </div>

              {/* Separator */}
              <div className="text-gray-400 hidden sm:block">|</div>

              {/* Survey Cycle Display */}
              <div className="text-white text-sm hidden sm:block">
                <CycleDisplay className="text-white" />
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
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt={user?.firstName || 'User'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
                    {/* Profile - Available for all users */}
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full text-left px-4 py-3 text-sm text-[#111827] hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>
                    {/* Show Settings only for admin users */}
                    {user?.role?.toLowerCase() === 'admin' && (
                      <>
                        <div className="border-t border-gray-100 my-1"></div>
                        <Link
                          href="/settings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full text-left px-4 py-3 text-sm text-[#111827] hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                      </>
                    )}
                    <div className="border-t border-gray-100 my-1"></div>
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
              Welcome, {user ? `${user.firstName} ${user.lastName}` : 'User'}!
            </h2>
            <p className="text-sm sm:text-base text-[#6b7280] mb-3">
              {user ? getRoleDescription(user.role) : 'Access survey information and track progress.'}
            </p>
            {hasActiveCycle && (
              <div className="text-sm text-gray-700 font-medium">
                Current Survey Cycle: <span className="text-blue-600">{activeCycle?.name}</span>
              </div>
            )}
            {!hasActiveCycle && !cycleLoading && (
              <div className="text-sm text-amber-600 font-medium">
                ⚠️ No active survey cycle
              </div>
            )}
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Tab Headers */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  Overall Progress
                </button>
                {(user?.role?.toLowerCase() === 'interviewer' || 
                  user?.role?.toLowerCase() === 'admin' || 
                  user?.role?.toLowerCase() === 'developer') && (
                  <>
                    <button
                      onClick={() => setActiveTab('spots')}
                      className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors relative ${
                        activeTab === 'spots'
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      {user?.role?.toLowerCase() === 'interviewer' ? 'My Spots' : 'All Spots'}
                    </button>

                  </>
                )}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Overall Assignment Progress Section */}
                  <div>
                    <div className="mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-[#111827]">
                        Survey Progress Overview
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {loading ? "..." : barangays.length}
                        </div>
                        <div className="text-sm text-gray-600">Barangay Survey Targets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {loading ? "..." : barangays.filter(b => b.assignment).length}
                        </div>
                        <div className="text-sm text-gray-600">With Assignments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {loading ? "..." : barangays.filter(b => {
                            const progress = typeof b.progress === 'string' ? parseInt(b.progress) || 0 : (b.progress || 0);
                            return progress === 100;
                          }).length}
                        </div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {loading ? "..." : barangays.filter(b => {
                            const progress = typeof b.progress === 'string' ? parseInt(b.progress) || 0 : (b.progress || 0);
                            return progress > 0 && progress < 100;
                          }).length}
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

                  {/* All Barangays Progress Cards Grid */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#111827] mb-4">
                      All Barangay Survey Targets
                    </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <div className="space-y-3">
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
                  <div className="text-gray-500">
                    <p className="mb-2">No barangay survey targets found.</p>
                    {!hasActiveCycle && !cycleLoading && (
                      <p className="text-amber-600 font-medium">
                        ⚠️ No active survey cycle is set. Contact your administrator to set up a survey cycle.
                      </p>
                    )}
                    {hasActiveCycle && (
                      <p>Please check with your administrator to create barangay survey targets for the current cycle.</p>
                    )}
                  </div>
                </div>
              ) : (
                barangays.map((barangay) => (
                  <Link key={barangay.id} href={`/survey/barangay/${barangay.id}`} className="block">
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-[#111827] text-sm">Brgy. {barangay.name}</h4>
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-medium ${
                              (() => {
                                const progress = typeof barangay.progress === 'string' ? parseInt(barangay.progress) || 0 : (barangay.progress || 0);
                                return progress === 100
                                  ? "bg-green-100 text-green-800"
                                  : progress > 0
                                    ? "bg-blue-100 text-blue-800"
                                    : barangay.assignment
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-gray-100 text-gray-800";
                              })()
                              }`}
                          >
                            {(() => {
                              const progress = typeof barangay.progress === 'string' ? parseInt(barangay.progress) || 0 : (barangay.progress || 0);
                              return progress === 100 
                                ? "Completed" 
                                : progress > 0 
                                  ? "In Progress" 
                                  : barangay.assignment 
                                    ? "Assigned" 
                                    : "Not Assigned";
                            })()}
                          </span>
                        </div>

                        {/* Assignment Information */}
                        <div className="text-xs text-gray-600">
                          {barangay.assignment ? (
                            <>
                              <div className="flex justify-between">
                                <span>Interviewer:</span>
                                <span className="font-medium truncate ml-1">
                                  {barangay.assignment.interviewer.firstName} {barangay.assignment.interviewer.lastName}
                                  {(barangay as any).assignments && (barangay as any).assignments.length > 1 && (
                                    <span className="text-blue-600"> and {(barangay as any).assignments.length - 1} more</span>
                                  )}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <span className="font-medium text-amber-600">No assignment</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#6b7280]">Progress</span>
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
                </div>
              )}

              {activeTab === 'spots' && (user?.role?.toLowerCase() === 'interviewer' || 
                user?.role?.toLowerCase() === 'admin' || 
                user?.role?.toLowerCase() === 'developer') && (
                <div>
                  <MySpotAssignments cycleId={activeCycle?.cycle_id} />
                </div>
              )}

              {activeTab === 'assignments' && user?.role?.toLowerCase() === 'interviewer' && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-[#111827] mb-4">
                    Legacy Barangay Assignments
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {loading ? (
                      // Loading skeleton
                      Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="bg-white rounded-lg border-2 border-blue-200 p-4 sm:p-6">
                          <div className="space-y-3 sm:space-y-4">
                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      ))
                    ) : myAssignments.length === 0 ? (
                      <div className="col-span-full text-center py-8">
                        <div className="text-gray-500">
                          <p className="mb-2">You have no assignments yet.</p>
                          <p className="text-sm">Contact your administrator to get assigned to barangay survey targets.</p>
                        </div>
                      </div>
                    ) : (
                      myAssignments.map((barangay) => (
                        <div key={barangay.id} className="bg-white rounded-lg border-2 border-blue-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
                          <div className="space-y-3 sm:space-y-4">
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-[#111827] text-sm sm:text-base">{barangay.name}</h4>
                              <span
                                className={`px-2 py-1 text-xs rounded-full font-medium ${
                                  (() => {
                                    const progress = typeof barangay.progress === 'string' ? parseInt(barangay.progress) || 0 : (barangay.progress || 0);
                                    return progress === 100
                                      ? "bg-green-100 text-green-800"
                                      : progress > 0
                                        ? "bg-blue-100 text-blue-800"
                                        : barangay.assignment
                                          ? "bg-orange-100 text-orange-800"
                                          : "bg-gray-100 text-gray-800";
                                  })()
                                  }`}
                              >
                                {(() => {
                                  const progress = typeof barangay.progress === 'string' ? parseInt(barangay.progress) || 0 : (barangay.progress || 0);
                                  return progress === 100 
                                    ? "Completed" 
                                    : progress > 0 
                                      ? "In Progress" 
                                      : barangay.assignment 
                                        ? "Assigned" 
                                        : "Not Assigned";
                                })()}
                              </span>
                            </div>

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

                            {/* Action Button */}
                            <div className="pt-2">
                              {(() => {
                                const progress = typeof barangay.progress === 'string' ? parseInt(barangay.progress) || 0 : (barangay.progress || 0);
                                return progress === 100;
                              })() ? (
                                <button
                                  disabled
                                  className="w-full px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Survey Completed
                                </button>
                              ) : (
                                <Link
                                  href={`/survey/forms?barangayId=${barangay.id}`}
                                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                  <PlayCircle className="w-4 h-4" />
                                  {barangay.progress > 0 ? 'Continue Survey' : 'Start Survey'}
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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
