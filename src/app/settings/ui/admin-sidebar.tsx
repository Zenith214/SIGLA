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
import { MapPin, Users, Settings, Target, Calendar, Database, HardDrive } from "lucide-react"

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
    title: "Survey Targets",
    icon: Target,
    id: "targets",
  },
  {
    title: "Users & Roles",
    icon: Users,
    id: "users",
  },
  {
    title: "Assignments",
    icon: Database,
    id: "assignments",
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
  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">PULSE Admin</h2>
            <p className="text-sm text-gray-600">Settings Panel</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu className="space-y-1">
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => onSectionChange(item.id)}
                isActive={activeSection === item.id}
                className={cn(
                  "w-full justify-start px-4 py-3 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors",
                  activeSection === item.id &&
                    "bg-blue-50 text-blue-700 hover:bg-blue-100 border-l-4 border-blue-500 shadow-sm",
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
