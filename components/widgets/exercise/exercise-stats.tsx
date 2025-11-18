"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Clock, MapPin, ExternalLink } from "lucide-react";
import { formatDistance, formatDuration } from "@/lib/utils/strava";
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
          <CardTitle>Exercise Stats</CardTitle>
          <CardDescription>No Strava activities synced yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <div>
              <p className="text-muted-foreground">
                No activities found. Use the Strava Sync widget below to sync your data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise Stats</CardTitle>
        <CardDescription>
          {lastSync
            ? `Last synced: ${format(new Date(lastSync), "MMM d, h:mm a")}`
            : "Never synced"}
          {needsSync && (
            <span className="ml-2 text-orange-500">(Sync recommended)</span>
          )}
        </CardDescription>
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
            {activities.slice(0, 5).map((activity) => (
              <a
                key={activity.id}
                href={`https://www.strava.com/activities/${activity.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate group-hover:text-primary transition-colors">
                      {activity.name}
                    </p>
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
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(activity.start_date), "MMM d")}
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
