"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Github, RefreshCw, ChevronRight } from "lucide-react";
import { signIn } from "next-auth/react";
import type { ConnectedAccount } from "@/lib/actions/settings";
import { cn } from "@/lib/utils";

interface IntegrationsCardProps {
  connectedAccounts: ConnectedAccount[];
}

export function IntegrationsCard({ connectedAccounts }: IntegrationsCardProps) {
  const isGithubConnected = connectedAccounts.some(
    (account) => account.providerId === "github"
  );

  const [isGithubSyncing, setIsGithubSyncing] = useState(false);
  const [githubSyncResult, setGithubSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleConnectGithub = () => {
    signIn("github", { callbackUrl: "/settings" });
  };

  const handleSyncGithub = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGithubSyncing(true);
    setGithubSyncResult(null);
    try {
      const response = await fetch("/api/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full: false }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setGithubSyncResult({ 
          success: true, 
          message: `Synced ${data.eventsSynced} events` 
        });
      } else {
        setGithubSyncResult({
          success: false,
          message: data.error || "Sync failed"
        });
      }
    } catch {
      setGithubSyncResult({
        success: false,
        message: "Failed to sync"
      });
    } finally {
      setIsGithubSyncing(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* GitHub Integration */}
      <button
        onClick={!isGithubConnected ? handleConnectGithub : undefined}
        className={cn(
          "w-full flex items-center justify-between p-4 rounded-lg bg-media-surface border border-media-outline-variant/20 hover:border-media-primary/40 transition-all group text-left",
          !isGithubConnected && "cursor-pointer"
        )}
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-media-surface-variant rounded-full">
            <Github className="h-5 w-5 text-media-primary" />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-bold text-media-on-surface text-sm">GitHub Integration</span>
            <span className="text-xs text-media-on-surface-variant">
              {isGithubConnected ? "Connected • Sync activity" : "Not connected • Click to connect"}
            </span>
            {githubSyncResult && (
              <span className={cn(
                "text-[10px] mt-0.5",
                githubSyncResult.success ? "text-green-600" : "text-media-error"
              )}>
                {githubSyncResult.message}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isGithubConnected ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSyncGithub}
              disabled={isGithubSyncing}
              className="h-8 px-2 text-[10px] font-bold uppercase tracking-widest hover:bg-media-primary/10"
            >
              <RefreshCw className={cn("h-3 w-3 mr-1", isGithubSyncing && "animate-spin")} />
              {isGithubSyncing ? "Syncing" : "Sync"}
            </Button>
          ) : (
            <ChevronRight className="h-5 w-5 text-media-on-surface-variant group-hover:text-media-primary transition-colors" />
          )}
        </div>
      </button>
    </div>
  );
}

