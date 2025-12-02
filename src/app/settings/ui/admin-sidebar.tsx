"use client"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { MapPin, Users, Settings, Target, Calendar, Database, HardDrive, Award, Sparkles, UserCheck } from "lucide-react"
import { usePermissions } from "@/hooks/usePermissions"

const navigationItems = [
  {
    title: "Survey Cycles",
    icon: Calendar,
    id: "survey-cycles",
  },
  {
    title: "Barangays",
    icon: MapPin,
    id: "barangays",
  },
  {
    title: "Award Management",
    icon: Award,
    id: "award-management",
  },
  {
    title: "Survey Targets",
    icon: Target,
    id: "targets",
  },
  {
    title: "Supervisor Assignments",
    icon: UserCheck,
    id: "supervisor-assignments",
  },
  {
    title: "Users & Roles",
    icon: Users,
    id: "users",
  },
  {
    title: "Backup",
    icon: HardDrive,
    id: "backup",
  },
]

interface AdminSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const { isViewer } = usePermissions()
  
  // Filter navigation items for viewers - only show backup
  const visibleItems = isViewer 
    ? navigationItems.filter(item => item.id === "backup")
    : navigationItems

  return (
    <Sidebar className="border-r border-slate-300 bg-white">
      <SidebarHeader className="border-b border-slate-300 p-4 bg-slate-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isViewer ? "Settings" : "PULSE Admin"}
            </h2>
            <p className="text-sm text-slate-600">
              {isViewer ? "Backup Access" : "Settings Panel"}
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2 bg-white">
        <SidebarMenu className="space-y-1">
          {visibleItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => onSectionChange(item.id)}
                isActive={activeSection === item.id}
                className={cn(
                  "w-full justify-start px-4 py-3 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors text-slate-700",
                  activeSection === item.id &&
                    "bg-slate-700 text-white hover:bg-slate-600 shadow-sm",
                )}
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
