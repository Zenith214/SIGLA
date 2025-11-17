'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import {
  syncPendingRecords,
  getPendingSyncCount,
  SyncProgress,
  SyncResponse,
} from '@/lib/syncService';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Cloud,
  CloudOff,
} from 'lucide-react';

interface SyncButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showCount?: boolean;
  onSyncComplete?: (result: SyncResponse) => void;
  onSyncError?: (error: Error) => void;
}

/**
 * SyncButton Component
 * Provides a button to sync pending survey records with progress indication
 */
export function SyncButton({
  className,
  variant = 'default',
  size = 'default',
  showCount = true,
  onSyncComplete,
  onSyncError,
}: SyncButtonProps) {
  const isOnline = useOnlineStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResponse | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Load pending count on mount and when online status changes
  useEffect(() => {
    loadPendingCount();
  }, [isOnline]);

  // Listen for sync-complete events (from auto-sync)
  useEffect(() => {
    const handleSyncComplete = (event: CustomEvent<SyncResponse>) => {
      setLastSyncResult(event.detail);
      setShowResult(true);
      loadPendingCount();
      
      // Hide result after 5 seconds
      setTimeout(() => setShowResult(false), 5000);
    };

    window.addEventListener('sync-complete' as any, handleSyncComplete);
    return () => {
      window.removeEventListener('sync-complete' as any, handleSyncComplete);
    };
  }, []);

  const loadPendingCount = async () => {
    try {
      const count = await getPendingSyncCount();
      setPendingCount(count);
    } catch (error) {
      console.error('Error loading pending count:', error);
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      return;
    }

    setIsSyncing(true);
    setSyncProgress(null);
    setShowResult(false);

    try {
      const result = await syncPendingRecords((progress) => {
        setSyncProgress(progress);
      });

      setLastSyncResult(result);
      setShowResult(true);
      await loadPendingCount();

      // Hide result after 5 seconds
      setTimeout(() => setShowResult(false), 5000);

      if (onSyncComplete) {
        onSyncComplete(result);
      }
    } catch (error) {
      console.error('Sync error:', error);
      const errorObj = error instanceof Error ? error : new Error('Unknown sync error');
      
      if (onSyncError) {
        onSyncError(errorObj);
      }

      setLastSyncResult({
        success: false,
        synced: 0,
        failed: 0,
        total: 0,
        results: [],
        message: errorObj.message,
      });
      setShowResult(true);
      setTimeout(() => setShowResult(false), 5000);
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  };

  const getButtonText = () => {
    if (isSyncing) {
      return 'Syncing...';
    }
    if (!isOnline) {
      return 'Offline';
    }
    if (pendingCount === 0) {
      return 'All Synced';
    }
    if (showCount) {
      return `Sync (${pendingCount})`;
    }
    return 'Sync';
  };

  const getButtonIcon = () => {
    if (isSyncing) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    if (!isOnline) {
      return <CloudOff className="h-4 w-4" />;
    }
    if (pendingCount === 0) {
      return <CheckCircle2 className="h-4 w-4" />;
    }
    return <Cloud className="h-4 w-4" />;
  };

  const progressPercentage = syncProgress
    ? Math.round((syncProgress.synced / syncProgress.total) * 100)
    : 0;

  return (
    <div className={className}>
      {/* Sync Button */}
      <Button
        variant={variant}
        size={size}
        onClick={handleSync}
        disabled={!isOnline || isSyncing || pendingCount === 0}
        className="relative"
      >
        {getButtonIcon()}
        {getButtonText()}
      </Button>

      {/* Sync Progress Indicator */}
      {isSyncing && syncProgress && (
        <div className="mt-2 space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <div className="text-xs text-muted-foreground text-center">
            Syncing {syncProgress.current} of {syncProgress.total}
            {syncProgress.currentQuestionnaire && (
              <span className="block truncate">
                ({syncProgress.currentQuestionnaire})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Sync Result Message */}
      {showResult && lastSyncResult && (
        <div
          className={`mt-2 p-3 rounded-lg text-sm ${
            lastSyncResult.success
              ? 'bg-green-50 text-green-800 border border-green-200'
              : lastSyncResult.failed > 0
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-start gap-2">
            {lastSyncResult.success ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
            ) : lastSyncResult.failed > 0 ? (
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-medium">{lastSyncResult.message}</p>
              {lastSyncResult.total > 0 && (
                <p className="text-xs mt-1">
                  {lastSyncResult.synced} synced
                  {lastSyncResult.failed > 0 && `, ${lastSyncResult.failed} failed`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
