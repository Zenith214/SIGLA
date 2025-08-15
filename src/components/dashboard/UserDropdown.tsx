"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Settings, BarChart3, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import { useAuth } from "@/components/auth/AuthProvider";

export default function UserDropdown() {
  const router = useRouter();
  const { user } = useAuth();

  const handleMenuClick = async (action: string) => {
    switch (action) {
      case "settings":
        router.push("/settings");
        break;
      case "survey-dashboard":
        router.push("/survey");
        break;
      case "logout":
        await logout();
        break;
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-slate-700">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-white text-slate-800">{getUserInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {/* Hide Settings for viewer role */}
        {user?.role !== 'viewer' && (
          <DropdownMenuItem onClick={() => handleMenuClick("settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        )}
        {/* Hide Survey Dashboard for viewer role */}
        {user?.role !== 'viewer' && (
          <DropdownMenuItem onClick={() => handleMenuClick("survey-dashboard")}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Survey Dashboard</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleMenuClick("logout")}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}