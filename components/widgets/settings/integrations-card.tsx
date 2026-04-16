"use client";

import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, RefreshCw } from "lucide-react";
import { signIn } from "next-auth/react";
import type { ConnectedAccount } from "@/lib/actions/settings";

interface IntegrationsCardProps {
  connectedAccounts: ConnectedAccount[];
}

export function IntegrationsCard({ connectedAccounts }: IntegrationsCardProps) {
  const isGithubConnected = connectedAccounts.some(
    (account) => account.providerId === "github"
  );

  // GitHub sync state
  const [isGithubSyncing, setIsGithubSyncing] = useState(false);
  const [githubSyncResult, setGithubSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleConnectGithub = () => {
    signIn("github", { callbackUrl: "/settings" });
  };

  const handleSyncGithub = async () => {
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
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
        <CardDescription>
          Manage your connected accounts and services.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* GitHub Integration */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
              <Github className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium">GitHub</h3>
              <p className="text-sm text-muted-foreground">
                Connect to sync your coding activity.
              </p>
              {githubSyncResult && (
                <p className={`text-xs mt-1 ${githubSyncResult.success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {githubSyncResult.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isGithubConnected ? (
              <>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
                  Connected
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSyncGithub}
                  disabled={isGithubSyncing}
                  className="h-7 text-xs"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isGithubSyncing ? "animate-spin" : ""}`} />
                  {isGithubSyncing ? "Syncing..." : "Sync"}
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={handleConnectGithub}>
                Connect
              </Button>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
