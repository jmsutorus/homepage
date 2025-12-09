"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Activity, TrendingUp, Clock, MapPin, ExternalLink, RefreshCw, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { formatDistance, formatDuration } from "@/lib/utils/strava";
import { format } from "date-fns";
import { syncStravaActivities } from "@/lib/actions/strava";

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

interface ExerciseStatsProps {
  initialActivities?: StravaActivity[];
  initialStats?: Stats;
}

export function ExerciseStats({ initialActivities = [], initialStats }: ExerciseStatsProps) {
  const [activities, setActivities] = useState<StravaActivity[]>(initialActivities);
  const [stats, setStats] = useState<Stats | null>(initialStats || null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(initialActivities.length === 0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [needsSync, setNeedsSync] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isFirstRender = useState(true)[0];

  useEffect(() => {
    if (isFirstRender && initialActivities.length > 0) {
      setIsLoading(false);
      return;
    }
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
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const result = await syncStravaActivities();
      if (result.success) {
        setSyncMessage({ type: 'success', text: 'Synced!' });
        // Refresh data
        fetchActivities();
      } else {
        setSyncMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setSyncMessage({ type: 'error', text: "Failed to sync" });
      console.error(error);
    } finally {
      setIsSyncing(false);
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSyncMessage((prev) => (prev?.type === 'success' ? null : prev));
      }, 3000);
    }
  };

  const handleDeleteClick = (activityId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActivityToDelete(activityId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!activityToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/strava/activities/${activityToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove activity from local state
        setActivities((prev) => prev.filter((a) => a.id !== activityToDelete));
        setSyncMessage({ type: 'success', text: 'Activity deleted' });
        // Refresh to update stats
        fetchActivities();
      } else {
        setSyncMessage({ type: 'error', text: 'Failed to delete activity' });
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
      setSyncMessage({ type: 'error', text: 'Failed to delete activity' });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setActivityToDelete(null);
      // Clear message after 3 seconds
      setTimeout(() => {
        setSyncMessage((prev) => (prev?.type === 'success' ? null : prev));
      }, 3000);
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
              <CardDescription>No Strava activities synced yet</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {syncMessage && (
                <span className={`text-sm ${syncMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {syncMessage.text}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing..." : "Sync"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <div>
              <p className="text-muted-foreground">
                No activities found. Click Sync to fetch your data from Strava.
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
          <div className="flex items-center gap-2">
            {syncMessage && (
              <span className={`text-sm flex items-center gap-1 ${syncMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {syncMessage.type === 'success' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                {syncMessage.text}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync"}
            </Button>
          </div>
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
            {activities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
              >
                <a
                  href={`https://www.strava.com/activities/${activity.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-0 cursor-pointer"
                >
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
                </a>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(activity.start_date), "MMM d")}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDeleteClick(activity.id, e)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this activity? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
