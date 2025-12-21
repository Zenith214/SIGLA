"use client";

import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, BarChart3, LogOut, ClipboardList, CheckSquare, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import { useAuth } from "@/components/auth/AuthProvider";
import { CPAPNotificationBadge } from "@/components/cpap/CPAPNotificationBadge";

export default function UserDropdown() {
  const router = useRouter();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/cpap/notifications');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const handleMenuClick = async (action: string) => {
    switch (action) {
      case "profile":
        router.push("/profile");
        break;
      case "settings":
        router.push("/settings");
        break;
      case "survey-dashboard":
        router.push("/survey");
        break;
      case "cpap":
        router.push("/cpap");
        break;
      case "cpap-management":
        router.push("/admin/cpap");
        break;
      case "logout":
        await logout();
        break;
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-slate-700">
          <Avatar className="h-8 w-8">
            {user?.profilePicture && (
              <AvatarImage src={user.profilePicture} alt={user?.firstName || 'User'} />
            )}
            <AvatarFallback className="bg-white text-slate-800">{getUserInitials()}</AvatarFallback>
          </Avatar>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-800" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {/* Profile - Available for all users */}
        <DropdownMenuItem onClick={() => handleMenuClick("profile")}>
          <User className="mr-2 h-4 w-4" />
          <span>My Profile</span>
        </DropdownMenuItem>
        {/* Show CPAP Submission for Officer role only */}
        {user?.role?.toLowerCase() === 'officer' && (
          <DropdownMenuItem onClick={() => handleMenuClick("cpap")}>
            <ClipboardList className="mr-2 h-4 w-4" />
            <span className="flex items-center gap-2">
              CPAP Submission
              <CPAPNotificationBadge />
            </span>
          </DropdownMenuItem>
        )}
        {/* Show CPAP Management for Admin role only */}
        {user?.role?.toLowerCase() === 'admin' && (
          <DropdownMenuItem onClick={() => handleMenuClick("cpap-management")}>
            <CheckSquare className="mr-2 h-4 w-4" />
            <span className="flex items-center gap-2">
              CPAP Management
              <CPAPNotificationBadge />
            </span>
          </DropdownMenuItem>
        )}
        {/* Hide System Settings for officer role */}
        {user?.role?.toLowerCase() !== 'officer' && (
          <DropdownMenuItem onClick={() => handleMenuClick("settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>System Settings</span>
          </DropdownMenuItem>
        )}
        {/* Hide Survey Dashboard for officer role */}
        {user?.role?.toLowerCase() !== 'officer' && (
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