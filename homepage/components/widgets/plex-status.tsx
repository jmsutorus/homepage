"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Film, TrendingUp, Play, Pause, User } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";

interface PlexStream {
  sessionKey: string;
  user: string;
  player: string;
  platform: string;
  mediaType: string;
  title: string;
  grandparentTitle?: string;
  year?: number;
  thumb: string;
  state: string;
  progress: number;
  resolution: string;
  qualityColor: string;
  container: string;
}

interface PlexActivity {
  streamCount: number;
  streams: PlexStream[];
  isOnline: boolean;
}

interface PlexMedia {
  title: string;
  grandparentTitle?: string;
  year?: number;
  mediaType: string;
  addedAt: number;
  thumb: string;
  ratingKey: string;
}

interface PlexLibrary {
  name: string;
  type: string;
  count: number;
  parentCount?: number;
  childCount?: number;
}

interface PlexStats {
  server: {
    name: string;
    version: string;
    platform: string;
    webUrl: string;
  };
  libraries: PlexLibrary[];
}

export function PlexStatus() {
  const [activity, setActivity] = useState<PlexActivity | null>(null);
  const [recentMedia, setRecentMedia] = useState<PlexMedia[]>([]);
  const [stats, setStats] = useState<PlexStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlexData();
  }, []);

  const fetchPlexData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [activityResponse, recentResponse, statsResponse] =
        await Promise.all([
          fetch("/api/plex/activity"),
          fetch("/api/plex/recent"),
          fetch("/api/plex/stats"),
        ]);

      if (activityResponse.status === 503) {
        setError("Plex integration is not enabled");
        return;
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setActivity(activityData);
      } else {
        const errorData = await activityResponse.json();
        setError(errorData.error || "Failed to fetch Plex activity");
      }

      if (recentResponse.ok) {
        const recentData = await recentResponse.json();
        setRecentMedia(recentData.media || []);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Failed to fetch Plex data:", error);
      setError("Failed to connect to Plex server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPlexData();
    setIsRefreshing(false);
  };

  const getMediaTypeIcon = (mediaType: string) => {
    if (mediaType.toLowerCase().includes("movie")) return Film;
    if (mediaType.toLowerCase().includes("episode")) return TrendingUp;
    return Film;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plex Server</CardTitle>
          <CardDescription>Loading server status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plex Server</CardTitle>
              <CardDescription>{error}</CardDescription>
            </div>
            <Button onClick={handleRefresh} disabled={isRefreshing} size="sm">
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Retry
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            <div>
              <CardTitle>{stats?.server.name || "Plex Server"}</CardTitle>
              <CardDescription>
                {activity?.isOnline ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Online
                    {activity.streamCount > 0 &&
                      ` • ${activity.streamCount} active stream${
                        activity.streamCount > 1 ? "s" : ""
                      }`}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Offline
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing} size="sm">
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Streams */}
        {activity?.streams && activity.streams.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Play className="h-4 w-4" />
              Active Streams
            </h3>
            <div className="space-y-2">
              {activity.streams.map((stream) => (
                <div
                  key={stream.sessionKey}
                  className="p-3 rounded-lg border bg-card space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{stream.user}</span>
                      <Badge variant="secondary" className={stream.qualityColor}>
                        {stream.resolution}
                      </Badge>
                    </div>
                    {stream.state === "playing" ? (
                      <Play className="h-4 w-4 text-green-500" />
                    ) : (
                      <Pause className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium truncate">{stream.title}</p>
                    {stream.grandparentTitle && (
                      <p className="text-sm text-muted-foreground truncate">
                        {stream.grandparentTitle}
                      </p>
                    )}
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${stream.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stream.player} • {stream.platform}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recently Added */}
        {recentMedia.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recently Added
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {recentMedia.slice(0, 5).map((item) => {
                const MediaIcon = getMediaTypeIcon(item.mediaType);
                return (
                  <div
                    key={item.ratingKey}
                    className="flex-shrink-0 w-24 space-y-1"
                  >
                    <div className="relative aspect-[2/3] rounded overflow-hidden bg-muted">
                      {item.thumb ? (
                        <Image
                          src={item.thumb}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <MediaIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(item.addedAt * 1000), "MMM d")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Library Stats */}
        {stats?.libraries && stats.libraries.length > 0 && (
          <div className="pt-2 border-t">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {stats.libraries.map((lib) => (
                <div key={lib.name} className="flex justify-between">
                  <span className="text-muted-foreground">{lib.name}:</span>
                  <span className="font-medium">{lib.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Server Link */}
        {stats?.server.webUrl && (
          <div className="pt-2 border-t">
            <a
              href={stats.server.webUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Open Plex →
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
