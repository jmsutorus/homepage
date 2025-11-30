"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronUp } from "lucide-react";

interface StravaSyncProps {
  athleteId?: number;
  lastSync?: string;
}

export function StravaSync({ athleteId, lastSync }: StravaSyncProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ activitiesSynced: number; athleteId: number } | null>(null);

  const handleSync = async (full = false) => {
    if (!accessToken.trim()) {
      setError("Please enter your Strava access token");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/strava/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: accessToken.trim(),
          full,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync");
      }

      setSuccess({
        activitiesSynced: data.activitiesSynced,
        athleteId: data.athleteId,
      });

      // Refresh the page to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync");
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastSync = (lastSyncStr: string) => {
    const date = new Date(lastSyncStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>Strava Sync</CardTitle>
            <CardDescription>
              Sync your Strava activities using your access token
              {lastSync && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Last synced: {formatLastSync(lastSync)}
                </div>
              )}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="access-token">Access Token</Label>
          <Input
            id="access-token"
            type="password"
            placeholder="Enter your Strava access token"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            disabled={isLoading}
          />
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">How to get a properly scoped token:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>
                Go to{" "}
                <a
                  href="https://www.strava.com/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Strava API Settings
                </a>
              </li>
              <li>Create an application (if you haven&apos;t already)</li>
              <li>
                Use this URL (replace YOUR_CLIENT_ID):{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost&response_type=code&scope=activity:read_all,profile:read_all
                </code>
              </li>
              <li>Authorize and copy the code from the URL</li>
              <li>
                Exchange code for token using cURL or Postman:{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded block mt-1">
                  curl -X POST https://www.strava.com/oauth/token -d client_id=YOUR_ID -d
                  client_secret=YOUR_SECRET -d code=YOUR_CODE -d grant_type=authorization_code
                </code>
              </li>
            </ol>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handleSync(false)}
            disabled={isLoading || !accessToken.trim()}
            className="flex-1"
          >
            {isLoading ? "Syncing..." : "Sync New Activities"}
          </Button>
          <Button
            onClick={() => handleSync(true)}
            disabled={isLoading || !accessToken.trim()}
            variant="outline"
            className="flex-1"
          >
            {isLoading ? "Syncing..." : "Full Sync"}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>
              Successfully synced {success.activitiesSynced} activities!
              {athleteId && ` (Athlete ID: ${success.athleteId})`}
            </AlertDescription>
          </Alert>
        )}
        </CardContent>
      )}
    </Card>
  );
}
