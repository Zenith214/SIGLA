"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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
import { SurveyCycles } from "./ui/sections/survey-cycles"
import { Barangays } from "./ui/sections/barangays"
import { SurveyTargets } from "./ui/sections/survey-targets"
import { UsersRoles } from "./ui/sections/users-roles"
import { Assignments } from "./ui/sections/assignments"
import { Backup } from "./ui/sections/backup"
import { Menu, X } from "lucide-react"
import { ToastProvider } from "@/hooks/use-toast.tsx"

const sectionTitles = {
  "survey-cycles": "Survey Cycles",
  barangays: "Barangays",
  targets: "Survey Targets",
  users: "Users & Roles",
  assignments: "Assignments",
  dashboard: "Dashboard Settings",
  backup: "Backup",
}

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function AdminSettingsPanel() {
  const [activeSection, setActiveSection] = useState("survey-cycles")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dateTime, setDateTime] = useState("")
  const [pageLoading, setPageLoading] = useState(true)

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

  const renderSection = () => {
    switch (activeSection) {
      case "survey-cycles":
        return <SurveyCycles />
      case "barangays":
        return <Barangays />
      case "targets":
        return <SurveyTargets />
      case "users":
        return <UsersRoles />
      case "assignments":
        return <Assignments />
      case "backup":
        return <Backup />
      default:
        return <SurveyCycles />
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-blue-50">
        <div className="flex h-16 shrink-0 items-center gap-2 border-b bg-primary px-4">
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
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-primary px-4 sticky top-0 z-10">
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
                    SIGLA Admin
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
              <Link
                href="/dashboard"
                className="px-3 py-1 text-sm font-medium text-white border border-white/20 rounded hover:bg-white/10 transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-blue-50">
            <div className="container mx-auto p-6 max-w-7xl">{renderSection()}</div>
          </main>
        </SidebarInset>
        </SidebarProvider>
      </ToastProvider>
    </ProtectedRoute>
  )
}
