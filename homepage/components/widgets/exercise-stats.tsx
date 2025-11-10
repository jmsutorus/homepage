"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Activity, TrendingUp, Clock, MapPin } from "lucide-react";
import { formatDistance, formatDuration } from "@/lib/api/strava";
import { format } from "date-fns";

interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  type: string;
  sport_type: string;
  start_date: string;
  average_speed?: number;
  total_elevation_gain: number;
}

interface Stats {
  allTime: {
    total_activities: number;
    total_distance: number;
    total_moving_time: number;
    total_elevation_gain: number;
  };
  yearToDate: {
    total_activities: number;
    total_distance: number;
    total_moving_time: number;
    total_elevation_gain: number;
  };
}

export function ExerciseStats() {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [needsSync, setNeedsSync] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/strava/activities?limit=10&stats=true");

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
        setStats(data.stats || null);
        setLastSync(data.lastSync);
        setNeedsSync(data.needsSync || false);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const response = await fetch("/api/strava/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full: false }),
      });

      if (response.ok) {
        await fetchActivities();
      }
    } catch (error) {
      console.error("Failed to sync activities:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const activityTypeColors: Record<string, string> = {
    Run: "bg-orange-500/10 text-orange-500",
    Ride: "bg-blue-500/10 text-blue-500",
    Swim: "bg-cyan-500/10 text-cyan-500",
    Walk: "bg-green-500/10 text-green-500",
    Hike: "bg-emerald-500/10 text-emerald-500",
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Exercise Stats</CardTitle>
          <CardDescription>Loading Strava activities...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Exercise Stats</CardTitle>
              <CardDescription>Connect to Strava to see your activities</CardDescription>
            </div>
            <Button onClick={handleSync} disabled={isSyncing} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
              Sync
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No activities found. Sign in with Strava to sync your data.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Exercise Stats</CardTitle>
            <CardDescription>
              {lastSync
                ? `Last synced: ${format(new Date(lastSync), "MMM d, h:mm a")}`
                : "Never synced"}
              {needsSync && (
                <span className="ml-2 text-orange-500">(Sync recommended)</span>
              )}
            </CardDescription>
          </div>
          <Button onClick={handleSync} disabled={isSyncing} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
            Sync
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">YTD Activities</p>
              <p className="text-2xl font-bold">{stats.yearToDate.total_activities}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">YTD Distance</p>
              <p className="text-2xl font-bold">
                {formatDistance(stats.yearToDate.total_distance)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">YTD Time</p>
              <p className="text-2xl font-bold">
                {formatDuration(stats.yearToDate.total_moving_time)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">YTD Elevation</p>
              <p className="text-2xl font-bold">
                {Math.round(stats.yearToDate.total_elevation_gain)} m
              </p>
            </div>
          </div>
        )}

        {/* Recent Activities */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent Activities
          </h3>
          <div className="space-y-2">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{activity.name}</p>
                    <Badge
                      variant="secondary"
                      className={
                        activityTypeColors[activity.type] ||
                        activityTypeColors[activity.sport_type] ||
                        "bg-gray-500/10 text-gray-500"
                      }
                    >
                      {activity.sport_type || activity.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {formatDistance(activity.distance)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(activity.moving_time)}
                    </span>
                    {activity.total_elevation_gain > 0 && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {Math.round(activity.total_elevation_gain)} m
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(activity.start_date), "MMM d")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
