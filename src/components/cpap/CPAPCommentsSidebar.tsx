"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, X, Send, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { CPAPComment } from "@/types/cpap";

interface CPAPCommentsSidebarProps {
  cpapId: number;
  currentUserId: number;
  currentUserRole: string;
  initialOpen?: boolean;
}

export function CPAPCommentsSidebar({ cpapId, currentUserId, currentUserRole, initialOpen = false }: CPAPCommentsSidebarProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [comments, setComments] = useState<CPAPComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Don't render if cpapId is invalid
  if (!cpapId || isNaN(cpapId)) {
    console.warn('[Comments] Invalid cpapId provided:', cpapId);
    return null;
  }

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    } else {
      // Fetch unread comment count when closed
      fetchUnreadCommentCount();
    }
  }, [isOpen, cpapId]);

  const fetchUnreadCommentCount = async () => {
    try {
      const response = await fetch('/api/cpap/notifications/list');
      if (response.ok) {
        const data = await response.json();
        // Count unread comment notifications for this CPAP
        const unreadComments = data.notifications?.filter(
          (n: any) => n.cpap_id === cpapId && 
                     n.notification_type === 'comment_added' && 
                     !n.is_read
        ).length || 0;
        setUnreadCount(unreadComments);
      }
    } catch (error) {
      console.error('Error fetching unread comment count:', error);
    }
  };

  useEffect(() => {
    // Auto-scroll to bottom when new comments arrive
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);

  const fetchComments = async () => {
    // Safety check
    if (!cpapId || isNaN(cpapId)) {
      console.error('[Comments] Invalid CPAP ID:', cpapId);
      setError('Invalid CPAP ID. Please refresh the page.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[Comments] Fetching comments for CPAP ID:', cpapId);
      const response = await fetch(`/api/cpap/${cpapId}/comments`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to fetch comments (${response.status})`);
      }

      const data = await response.json();
      console.log('[Comments] Fetched comments:', data.comments?.length || 0);
      setComments(data.comments || []);
      setUnreadCount(0); // Reset unread count when opening
      
      // Mark comment notifications as read for this CPAP
      try {
        const notifResponse = await fetch('/api/cpap/notifications/list');
        if (notifResponse.ok) {
          const notifData = await notifResponse.json();
          const commentNotifications = notifData.notifications?.filter(
            (n: any) => n.cpap_id === cpapId && 
                       n.notification_type === 'comment_added' && 
                       !n.is_read
          );
          // Mark each as read
          for (const notif of commentNotifications || []) {
            await fetch(`/api/cpap/notifications/${notif.id}/read`, { method: 'POST' });
          }
        }
      } catch (error) {
        console.error('Error marking comment notifications as read:', error);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError(error instanceof Error ? error.message : "Failed to load comments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;

    // Safety check
    if (!cpapId || isNaN(cpapId)) {
      console.error('[Comments] Invalid CPAP ID:', cpapId);
      setError('Invalid CPAP ID. Cannot send comment.');
      return;
    }

    try {
      setIsSending(true);
      setError(null);
      
      console.log('[Comments] Sending comment for CPAP ID:', cpapId);
      const response = await fetch(`/api/cpap/${cpapId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_text: newComment.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to send comment (${response.status})`);
      }

      const data = await response.json();
      console.log('[Comments] Comment sent successfully');
      setComments([...comments, data.comment]);
      setNewComment("");
    } catch (error) {
      console.error("Error sending comment:", error);
      setError(error instanceof Error ? error.message : "Failed to send comment. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    // Parse the timestamp - it comes from the database in UTC
    const date = new Date(timestamp);
    const now = new Date();
    
    // Calculate difference in milliseconds
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    // For older dates, show formatted date in local timezone
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    });
  };

  const getUserDisplayName = (comment: CPAPComment) => {
    if (comment.user) {
      return `${comment.user.firstName} ${comment.user.lastName}`;
    }
    return "Unknown User";
  };

  const getUserRole = (comment: CPAPComment) => {
    if (comment.user) {
      return comment.user.role?.toLowerCase() === "admin" ? "Admin" : "Officer";
    }
    return "";
  };

  const isOwnComment = (comment: CPAPComment) => {
    return comment.user_id === currentUserId;
  };

  return (
    <>
      {/* Toggle Button - Fixed position at top right */}
      <div className="fixed right-0 top-32 z-40">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`rounded-l-lg rounded-r-none shadow-lg transition-all ${
            isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          size="lg"
        >
          {isOpen ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <MessageSquare className="h-5 w-5 mr-2" />
              Comments
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </>
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full bg-white shadow-2xl border-l border-gray-200 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: "400px" }}
      >
        {/* Header */}
        <div className="bg-slate-800 text-white px-4 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <h3 className="font-semibold">CPAP Discussion</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: "calc(100vh - 200px)" }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-amber-900 font-semibold mb-2">Setup Required</p>
                <p className="text-sm text-amber-800 mb-3">{error}</p>
                {error.includes('migration') ? (
                  <div className="text-xs text-amber-700 bg-amber-100 rounded p-2 mb-3">
                    <p className="font-semibold mb-1">To enable comments:</p>
                    <ol className="list-decimal list-inside space-y-1 text-left">
                      <li>Open Supabase SQL Editor</li>
                      <li>Run: database/add-cpap-comments.sql</li>
                      <li>Run: npx prisma generate</li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>
                ) : (
                  <Button
                    onClick={fetchComments}
                    variant="outline"
                    size="sm"
                    className="text-amber-600 border-amber-300 hover:bg-amber-50"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No comments yet</p>
              <p className="text-xs mt-1">Start the discussion about this CPAP</p>
            </div>
          ) : (
            <>
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`flex ${isOwnComment(comment) ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 ${
                      isOwnComment(comment)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {/* User info */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold">
                        {getUserDisplayName(comment)}
                      </span>
                      <Badge
                        variant={getUserRole(comment) === "Admin" ? "default" : "secondary"}
                        className="text-xs px-1.5 py-0"
                      >
                        {getUserRole(comment)}
                      </Badge>
                    </div>
                    
                    {/* Comment text */}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {comment.comment_text}
                    </p>
                    
                    {/* Timestamp */}
                    <p
                      className={`text-xs mt-1 ${
                        isOwnComment(comment) ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {formatTimestamp(comment.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          {error && (
            <div className="mb-2 bg-red-50 border border-red-200 rounded px-3 py-2">
              <p className="text-xs text-red-800">{error}</p>
            </div>
          )}
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Type your comment..."
              className="resize-none text-sm"
              rows={3}
              disabled={isSending}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendComment();
                }
              }}
            />
            <Button
              onClick={handleSendComment}
              disabled={!newComment.trim() || isSending}
              className="self-end"
              size="icon"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/5 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
