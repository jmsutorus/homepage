"use client";

import { useState, useEffect } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, Activity, RefreshCw, Languages } from "lucide-react";
import { signIn } from "next-auth/react";
import type { ConnectedAccount } from "@/lib/actions/settings";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface IntegrationsCardProps {
  connectedAccounts: ConnectedAccount[];
}

export function IntegrationsCard({ connectedAccounts }: IntegrationsCardProps) {
  const isGithubConnected = connectedAccounts.some(
    (account) => account.providerId === "github"
  );

  const stravaAccount = connectedAccounts.find(
    (account) => account.providerId === "strava"
  );
  const isStravaConnected = !!stravaAccount;
  
  // Check if token is expired (with 5 minute buffer)
  const [isStravaExpired, setIsStravaExpired] = useState(false);

  // GitHub sync state
  const [isGithubSyncing, setIsGithubSyncing] = useState(false);
  const [githubSyncResult, setGithubSyncResult] = useState<{ success: boolean; message: string } | null>(null);

   
  useEffect(() => {
    if (stravaAccount?.accessTokenExpiresAt) {
       
      setIsStravaExpired(stravaAccount.accessTokenExpiresAt < (Date.now() / 1000) + 300);
    }
  }, [stravaAccount]);

  const handleConnectGithub = () => {
    signIn("github", { callbackUrl: "/settings" });
  };

  const handleConnectStrava = () => {
    signIn("strava", { callbackUrl: "/settings" });
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

  // Duolingo Logic
  const [isDuolingoDialogOpen, setIsDuolingoDialogOpen] = useState(false);
  const [duolingoUsername, setDuolingoUsername] = useState("");
  const [isConnectingDuolingo, setIsConnectingDuolingo] = useState(false);
  const duolingoAccount = connectedAccounts.find(a => a.providerId === "duolingo");
  const isDuolingoConnected = !!duolingoAccount;

  const handleConnectDuolingo = async () => {
    if (!duolingoUsername.trim()) return;
    setIsConnectingDuolingo(true);
    try {
      const { connectDuolingo } = await import("@/lib/actions/settings");
      const result = await connectDuolingo(duolingoUsername);
      if (result.success) {
        setIsDuolingoDialogOpen(false);
        setDuolingoUsername("");
      } else {
        alert(result.error || "Failed to connect");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setIsConnectingDuolingo(false);
    }
  };

  const handleDisconnectDuolingo = async () => {
    if (!confirm("Are you sure you want to disconnect Duolingo?")) return;
    try {
      const { disconnectDuolingo } = await import("@/lib/actions/settings");
      await disconnectDuolingo();
    } catch (err) {
      console.error(err);
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

        {/* Strava Integration */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <Activity className="h-6 w-6 text-orange-600 dark:text-orange-500" />
            </div>
            <div>
              <h3 className="font-medium">Strava</h3>
              <p className="text-sm text-muted-foreground">
                Connect to sync your exercise activities.
              </p>
            </div>
          </div>
          <div>
            {isStravaConnected ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
                  Connected
                </Badge>
                {isStravaExpired && (
                  <Button variant="ghost" size="sm" onClick={handleConnectStrava} className="text-xs h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    Reconnect (Expired)
                  </Button>
                )}
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={handleConnectStrava}>
                Connect
              </Button>
            )}
          </div>
        </div>

        {/* Duolingo Integration */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/30`}>
              <Languages className={`h-5 w-5 text-green-600 dark:text-green-400`} />
            </div>
            <div>
              <h3 className="font-medium">Duolingo</h3>
              <p className="text-sm text-muted-foreground">
                Connect to see your daily streak.
              </p>
            </div>
          </div>
          <div>
            {isDuolingoConnected ? (
               <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
                Connected
              </Badge>
                <Button variant="ghost" size="sm" onClick={handleDisconnectDuolingo} className="h-7 text-xs text-muted-foreground">
                    Disconnect
                </Button>
               </div>
            ) : (
              <Dialog open={isDuolingoDialogOpen} onOpenChange={setIsDuolingoDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Connect Duolingo</DialogTitle>
                    <DialogDescription>
                      Enter your Duolingo username to fetch your streak and public stats.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                            id="username" 
                            placeholder="e.g. duo" 
                            value={duolingoUsername}
                            onChange={(e) => setDuolingoUsername(e.target.value)}
                        />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDuolingoDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleConnectDuolingo} disabled={isConnectingDuolingo}>
                        {isConnectingDuolingo ? "Connecting..." : "Connect"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

