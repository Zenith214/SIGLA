# SURVEY DASHBOARD (Field Interviewer Dashboard) - PART 1

**File**: `src/app/survey/page.tsx`

---

```tsx
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
```

---

**CONTINUED IN PART 2**
