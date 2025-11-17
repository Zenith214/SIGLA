"use client";

import { useEffect, useRef } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { syncPendingRecords, getPendingSyncCount } from '@/lib/syncService';
import { useToast } from '@/hooks/use-toast';

/**
 * AutoSync component
 * Automatically syncs pending records when connection is restored
 * Should be mounted at the app level
 */
export function AutoSync() {
  const isOnline = useOnlineStatus();
  const { toast } = useToast();
  const previousOnlineStatus = useRef(isOnline);
  const isSyncing = useRef(false);

  useEffect(() => {
    const handleReconnection = async () => {
      // Only trigger sync when transitioning from offline to online
      if (isOnline && !previousOnlineStatus.current && !isSyncing.current) {
        console.log('🔄 Connection restored, checking for pending sync records...');
        
        try {
          // Check if there are any pending records
          const pendingCount = await getPendingSyncCount();
          
          if (pendingCount === 0) {
            console.log('✅ No pending records to sync');
            previousOnlineStatus.current = isOnline;
            return;
          }

          console.log(`📤 Found ${pendingCount} pending record(s), starting auto-sync...`);
          isSyncing.current = true;

          // Show notification that sync is starting
          toast({
            title: 'Syncing Data',
            description: `Syncing ${pendingCount} pending record(s)...`,
          });

          // Perform sync
          const result = await syncPendingRecords((progress) => {
            console.log(`Sync progress: ${progress.synced}/${progress.total}`);
          });

          // Show result notification
          if (result.success) {
            toast({
              title: 'Sync Complete',
              description: `Successfully synced ${result.synced} record(s)`,
            });
            console.log(`✅ Auto-sync complete: ${result.synced} synced, ${result.failed} failed`);
          } else {
            toast({
              title: 'Sync Partially Complete',
              description: `Synced ${result.synced} of ${result.total} record(s). ${result.failed} failed.`,
              variant: 'destructive',
            });
            console.warn(`⚠️ Auto-sync partially complete: ${result.synced} synced, ${result.failed} failed`);
          }

          // Dispatch custom event for other components to react to
          window.dispatchEvent(new CustomEvent('auto-sync-complete', { 
            detail: result 
          }));

        } catch (error) {
          console.error('❌ Auto-sync failed:', error);
          toast({
            title: 'Sync Failed',
            description: 'Failed to sync pending records. Please try manual sync.',
            variant: 'destructive',
          });
        } finally {
          isSyncing.current = false;
        }
      }

      // Update previous status
      previousOnlineStatus.current = isOnline;
    };

    handleReconnection();
  }, [isOnline, toast]);

  // This component doesn't render anything
  return null;
}

