"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { AdminSidebar } from "./ui/admin-sidebar"
import { Skeleton, SkeletonSidebar } from "@/components/ui/skeleton"
import { Menu, X } from "lucide-react"
import { ToastProvider } from "@/hooks/use-toast"
import { CycleDisplay } from "@/components/survey-cycle"
import { useActiveCycle } from "@/hooks/useSurveyCycle"

// Dynamic imports for better performance - sections load only when needed
const SurveyCycles = dynamic(() => import("./ui/sections/survey-cycles").then(mod => ({ default: mod.SurveyCycles })), {
  loading: () => <div className="p-8"><Skeleton className="h-96 w-full" /></div>
})
const Barangays = dynamic(() => import("./ui/sections/barangays").then(mod => ({ default: mod.Barangays })), {
  loading: () => <div className="p-8"><Skeleton className="h-96 w-full" /></div>
})
const AwardManagement = dynamic(() => import("./ui/sections/award-management").then(mod => ({ default: mod.AwardManagement })), {
  loading: () => <div className="p-8"><Skeleton className="h-96 w-full" /></div>
})
const SurveyTargets = dynamic(() => import("./ui/sections/survey-targets").then(mod => ({ default: mod.SurveyTargets })), {
  loading: () => <div className="p-8"><Skeleton className="h-96 w-full" /></div>
})
const UsersRoles = dynamic(() => import("./ui/sections/users-roles").then(mod => ({ default: mod.UsersRoles })), {
  loading: () => <div className="p-8"><Skeleton className="h-96 w-full" /></div>
})
const SupervisorAssignments = dynamic(() => import("./ui/sections/supervisor-assignments").then(mod => ({ default: mod.SupervisorAssignments })), {
  loading: () => <div className="p-8"><Skeleton className="h-96 w-full" /></div>
})
// Legacy Assignments section removed - now handled by FS Dashboard with spot-based assignments
// const Assignments = dynamic(() => import("./ui/sections/assignments").then(mod => ({ default: mod.Assignments })), {
//   loading: () => <div className="p-8"><Skeleton className="h-96 w-full" /></div>
// })
const Backup = dynamic(() => import("./ui/sections/backup").then(mod => ({ default: mod.Backup })), {
  loading: () => <div className="p-8"><Skeleton className="h-96 w-full" /></div>
})

const sectionTitles = {
  "survey-cycles": "Survey Cycles",
  barangays: "Barangays",
  "award-management": "Award Management",
  targets: "Survey Targets",
  "supervisor-assignments": "Supervisor Assignments",
  users: "Users & Roles",
  dashboard: "Dashboard Settings",
  backup: "Backup",
}

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { usePermissions } from "@/hooks/usePermissions"
import { useRouter } from "next/navigation"

export default function AdminSettingsPanel() {
  const router = useRouter()
  const { canAccessAdminSettings, isViewer } = usePermissions()
  const [activeSection, setActiveSection] = useState("survey-cycles")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dateTime, setDateTime] = useState("")
  const [pageLoading, setPageLoading] = useState(true)
  const { activeCycle, hasActiveCycle } = useActiveCycle()

  // Redirect viewers to backup section only
  useEffect(() => {
    if (isViewer && activeSection !== "backup") {
      setActiveSection("backup")
    }
  }, [isViewer, activeSection])

  useEffect(() => {
    const update = () => setDateTime(new Date().toLocaleString())
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      setActiveSection(event.detail);
    };

    window.addEventListener('navigate-to-section', handleNavigation as EventListener);
    return () => {
      window.removeEventListener('navigate-to-section', handleNavigation as EventListener);
    };
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case "survey-cycles":
        return <SurveyCycles />
      case "barangays":
        return <Barangays />
      case "award-management":
        return <AwardManagement />
      case "targets":
        return <SurveyTargets />
      case "supervisor-assignments":
        return <SupervisorAssignments />
      case "users":
        return <UsersRoles />
      case "backup":
        return <Backup />
      default:
        return <SurveyCycles />
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#dbeafe' }}>
        <div className="flex h-16 shrink-0 items-center gap-2 border-b bg-slate-800 px-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-4 w-32" />
          <div className="ml-auto flex items-center gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <SkeletonSidebar />
            </div>
            <div className="lg:col-span-3">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <ToastProvider>
        <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
          <SidebarInset>
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-slate-800 px-4 sticky top-0 z-10">
          <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8 p-0 text-white hover:bg-white/10"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#" className="text-white">
                    PULSE Admin
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium text-white">
                    {sectionTitles[activeSection as keyof typeof sectionTitles]}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center gap-4">
              <span className="text-white text-xs md:text-sm font-mono bg-black/20 rounded px-2 py-1">{dateTime}</span>
              <div className="text-white text-xs md:text-sm">
                {hasActiveCycle ? (
                  <div className="flex items-center gap-2">
                    <span className="text-white/70">Active:</span>
                    <CycleDisplay className="text-white" />
                  </div>
                ) : (
                  <div className="text-amber-300 font-medium">
                    ⚠️ No Active Cycle
                  </div>
                )}
              </div>
              <Link
                href="/dashboard"
                className="px-3 py-1 text-sm font-medium text-white border border-white/20 rounded hover:bg-white/10 transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto" style={{ backgroundColor: '#dbeafe' }}>
            <div className="container mx-auto p-6 max-w-7xl">{renderSection()}</div>
          </main>
        </SidebarInset>
        </SidebarProvider>
      </ToastProvider>
    </ProtectedRoute>
  )
}
