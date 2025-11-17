'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import {
  syncPendingRecords,
  getPendingSyncCount,
  getSyncQueueInfo,
  retryFailedSyncs,
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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SyncStatusProps {
  className?: string;
  autoSync?: boolean;
  showDetails?: boolean;
}

/**
 * SyncStatus Component
 * Comprehensive sync status display with queue information and retry functionality
 */
export function SyncStatus({
  className,
  autoSync = true,
  showDetails = false,
}: SyncStatusProps) {
  const isOnline = useOnlineStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResponse | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [queueInfo, setQueueInfo] = useState<any>(null);

  // Load pending count and queue info
  useEffect(() => {
    loadSyncInfo();
  }, [isOnline]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (autoSync && isOnline && pendingCount > 0) {
      const timer = setTimeout(() => {
        handleSync();
      }, 2000); // Wait 2 seconds after coming online

      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingCount, autoSync]);

  // Listen for sync-complete events
  useEffect(() => {
    const handleSyncComplete = (event: CustomEvent<SyncResponse>) => {
      setLastSyncResult(event.detail);
      setShowResult(true);
      loadSyncInfo();
      
      setTimeout(() => setShowResult(false), 5000);
    };

    window.addEventListener('sync-complete' as any, handleSyncComplete);
    return () => {
      window.removeEventListener('sync-complete' as any, handleSyncComplete);
    };
  }, []);

  const loadSyncInfo = async () => {
    try {
      const count = await getPendingSyncCount();
      setPendingCount(count);

      if (showDetails || expanded) {
        const info = await getSyncQueueInfo();
        setQueueInfo(info);
      }
    } catch (error) {
      console.error('Error loading sync info:', error);
    }
  };

  const handleSync = async () => {
    if (!isOnline || isSyncing) {
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
      await loadSyncInfo();

      setTimeout(() => setShowResult(false), 5000);
    } catch (error) {
      console.error('Sync error:', error);
      const errorObj = error instanceof Error ? error : new Error('Unknown sync error');
      
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

  const handleRetry = async () => {
    if (!isOnline || isSyncing) {
      return;
    }

    setIsSyncing(true);
    setSyncProgress(null);
    setShowResult(false);

    try {
      const result = await retryFailedSyncs((progress) => {
        setSyncProgress(progress);
      });

      setLastSyncResult(result);
      setShowResult(true);
      await loadSyncInfo();

      setTimeout(() => setShowResult(false), 5000);
    } catch (error) {
      console.error('Retry error:', error);
      const errorObj = error instanceof Error ? error : new Error('Unknown retry error');
      
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

  const toggleExpanded = () => {
    setExpanded(!expanded);
    if (!expanded) {
      loadSyncInfo();
    }
  };

  const progressPercentage = syncProgress
    ? Math.round((syncProgress.synced / syncProgress.total) * 100)
    : 0;

  if (pendingCount === 0 && !showResult && !isSyncing) {
    return null; // Don't show anything if nothing to sync
  }

  return (
    <div className={`bg-white border rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Cloud className="h-5 w-5 text-blue-500" />
            ) : (
              <CloudOff className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <h3 className="font-medium text-sm">Sync Status</h3>
              <p className="text-xs text-muted-foreground">
                {pendingCount > 0
                  ? `${pendingCount} record${pendingCount !== 1 ? 's' : ''} pending sync`
                  : 'All records synced'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <Button
                size="sm"
                onClick={handleSync}
                disabled={!isOnline || isSyncing}
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            )}

            {showDetails && (
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleExpanded}
              >
                {expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Sync Progress */}
        {isSyncing && syncProgress && (
          <div className="mt-4 space-y-2">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {syncProgress.synced} of {syncProgress.total} synced
              </span>
              <span>{progressPercentage}%</span>
            </div>
            {syncProgress.currentQuestionnaire && (
              <p className="text-xs text-muted-foreground truncate">
                Current: {syncProgress.currentQuestionnaire}
              </p>
            )}
          </div>
        )}

        {/* Sync Result */}
        {showResult && lastSyncResult && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
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
                {lastSyncResult.failed > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRetry}
                    disabled={!isOnline || isSyncing}
                    className="mt-2"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Retry Failed
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {expanded && queueInfo && (
        <div className="border-t p-4 bg-gray-50">
          <h4 className="text-sm font-medium mb-3">Pending Records</h4>
          {queueInfo.records.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending records</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {queueInfo.records.map((record: any, index: number) => (
                <div
                  key={`${record.questionnaireId}-${record.cycleId}`}
                  className="bg-white p-3 rounded border text-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{record.questionnaireId}</p>
                      <p className="text-xs text-muted-foreground">
                        Cycle {record.cycleId} • Spot {record.spotId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.visitCount} visit{record.visitCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(record.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
