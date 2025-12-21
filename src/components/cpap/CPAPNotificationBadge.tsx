"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";

interface CPAPNotificationBadgeProps {
  onCountChange?: (count: number) => void;
}

export function CPAPNotificationBadge({ onCountChange }: CPAPNotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (onCountChange) {
      onCountChange(unreadCount);
    }
  }, [unreadCount, onCountChange]);

  const fetchUnreadCount = async () => {
    try {
      console.log('[Badge] Fetching unread count from /api/cpap/notifications');
      const response = await fetch('/api/cpap/notifications');
      console.log('[Badge] Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[Badge] Unread count data:', data);
        setUnreadCount(data.unreadCount || 0);
      } else {
        console.error('[Badge] Failed to fetch notifications:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('[Badge] Error fetching notification count:', error);
    }
  };

  if (unreadCount === 0) {
    return null;
  }

  return (
    <span className="relative inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full -ml-1">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
}
