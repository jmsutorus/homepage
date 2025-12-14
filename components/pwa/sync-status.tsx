"use client";

import { useEffect, useState } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { getQueueStats } from "@/lib/pwa/offline-queue";
import {
  syncQueue,
  addSyncListener,
  type SyncEvent,
} from "@/lib/pwa/background-sync";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Cloud,
  CloudOff,
  RefreshCw,
  WifiOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export function SyncStatus() {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [stats, setStats] = useState({ total: 0, pending: 0, syncing: 0, failed: 0 });
  const [isSyncing, setIsSyncing] = useState(false);

  // Update stats periodically
  useEffect(() => {
    const updateStats = async () => {
      const newStats = await getQueueStats();
      setStats(newStats);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Listen for sync events
  useEffect(() => {
    const cleanup = addSyncListener((event: SyncEvent) => {
      if (event.type === "sync-start") {
        setIsSyncing(true);
      } else if (event.type === "sync-complete") {
        setIsSyncing(false);

        // Refresh stats
        getQueueStats().then(setStats);

        // Show completion toast
        if (event.successCount! > 0) {
          toast.success(
            `Synced ${event.successCount} ${event.successCount === 1 ? "item" : "items"}`
          );
        }
        if (event.failureCount! > 0) {
          toast.error(
            `Failed to sync ${event.failureCount} ${event.failureCount === 1 ? "item" : "items"}`
          );
        }
      } else if (event.type === "mutation-failed") {
        toast.error(`Failed to sync: ${event.mutation?.type}`);
      }
    });

    return cleanup;
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (wasOffline && stats.pending > 0) {
      console.log("🌐 Back online - starting auto-sync");
      handleSync();
    }
  }, [wasOffline, stats.pending]);

  const handleSync = async () => {
    if (!isOnline) {
      toast.error("Cannot sync while offline");
      return;
    }

    setIsSyncing(true);
    try {
      await syncQueue();
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Sync failed. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Don't show if no pending items and online
  if (stats.total === 0 && isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      {!isOnline && (
        <Badge variant="destructive" className="flex items-center gap-1">
          <WifiOff className="h-3 w-3" />
          Offline
        </Badge>
      )}

      {stats.pending > 0 && (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
        >
          <CloudOff className="h-3 w-3" />
          {stats.pending} pending sync
        </Badge>
      )}

      {stats.failed > 0 && (
        <Badge
          variant="destructive"
          className="flex items-center gap-1"
        >
          <AlertCircle className="h-3 w-3" />
          {stats.failed} failed
        </Badge>
      )}

      {isSyncing && (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 bg-blue-500/10 text-blue-700 dark:text-blue-400"
        >
          <RefreshCw className="h-3 w-3 animate-spin" />
          Syncing...
        </Badge>
      )}

      {stats.total > 0 && isOnline && !isSyncing && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleSync}
          className="h-7 px-2"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Sync Now
        </Button>
      )}

      {stats.total === 0 && !isOnline && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <CloudOff className="h-3 w-3" />
          Changes saved locally
        </Badge>
      )}
    </div>
  );
}
