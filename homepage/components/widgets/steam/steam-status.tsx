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
import { RefreshCw, Gamepad2, Clock, Trophy } from "lucide-react";
import Image from "next/image";

interface SteamStatus {
  steamId: string;
  personaName: string;
  avatarUrl: string;
  profileUrl: string;
  personaState: number;
  personaStateText: string;
  isOnline: boolean;
  isInGame: boolean;
  currentGame: string | null;
  currentGameId: string | null;
  lastLogoff: number | null;
}

interface SteamGame {
  appId: number;
  name: string;
  playtime2Weeks: number;
  playtime2WeeksFormatted: string;
  playtimeForever: number;
  playtimeForeverFormatted: string;
  headerUrl: string;
}

interface SteamAchievement {
  gameName: string;
  gameId: number;
  achievementName: string;
  achievementDescription: string;
  unlockTime: number;
  icon: string;
}

export function SteamStatus() {
  const [status, setStatus] = useState<SteamStatus | null>(null);
  const [recentGames, setRecentGames] = useState<SteamGame[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<SteamAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSteamData();
  }, []);

  const fetchSteamData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [statusResponse, recentResponse, achievementsResponse] = await Promise.all([
        fetch("/api/steam/status"),
        fetch("/api/steam/recent"),
        fetch("/api/steam/achievements"),
      ]);

      if (statusResponse.status === 503) {
        setError("Steam integration is not enabled");
        return;
      }

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setStatus(statusData);
      } else {
        const errorData = await statusResponse.json();
        setError(errorData.error || "Failed to fetch Steam status");
      }

      if (recentResponse.ok) {
        const recentData = await recentResponse.json();
        setRecentGames(recentData.games || []);
      }

      if (achievementsResponse.ok) {
        const achievementsData = await achievementsResponse.json();
        setRecentAchievements(achievementsData.achievements || []);
      }
    } catch (error) {
      console.error("Failed to fetch Steam data:", error);
      setError("Failed to connect to Steam API");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSteamData();
    setIsRefreshing(false);
  };

  const getStatusColor = (state: number) => {
    if (state === 0) return "bg-gray-500";
    if (state === 1) return "bg-green-500";
    if (state === 2) return "bg-orange-500";
    if (state === 3) return "bg-yellow-500";
    return "bg-blue-500";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Steam Status</CardTitle>
          <CardDescription>Loading Steam data...</CardDescription>
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
              <CardTitle>Steam Status</CardTitle>
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

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Steam Status</CardTitle>
          <CardDescription>No Steam data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src={status.avatarUrl}
                alt={status.personaName}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(
                  status.personaState
                )}`}
              />
            </div>
            <div>
              <CardTitle className="text-lg">{status.personaName}</CardTitle>
              <CardDescription>{status.personaStateText}</CardDescription>
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
        {/* Currently Playing */}
        {status.isInGame && status.currentGame && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Gamepad2 className="h-4 w-4 text-primary" />
              <p className="font-semibold text-primary">Currently Playing</p>
            </div>
            <p className="text-lg font-medium">{status.currentGame}</p>
          </div>
        )}

        {/* Recent Games */}
        {recentGames.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              Recent Games
            </h3>
            <div className="space-y-2">
              {recentGames.slice(0, 5).map((game) => (
                <div
                  key={game.appId}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="relative w-16 h-9 flex-shrink-0 rounded overflow-hidden bg-muted">
                    <Image
                      src={game.headerUrl}
                      alt={game.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{game.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {game.playtime2WeeksFormatted} (2 weeks)
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge variant="secondary" className="text-xs">
                      {game.playtimeForeverFormatted}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Achievements - Show when no recent games */}
        {!status.isInGame && recentGames.length === 0 && recentAchievements.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Recent Achievements
            </h3>
            <div className="space-y-2">
              {recentAchievements.slice(0, 5).map((achievement, index) => (
                <div
                  key={`${achievement.gameId}-${achievement.unlockTime}-${index}`}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-muted">
                    <Image
                      src={achievement.icon}
                      alt={achievement.achievementName}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{achievement.achievementName}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {achievement.gameName}
                    </p>
                    {achievement.achievementDescription && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {achievement.achievementDescription}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge variant="secondary" className="text-xs">
                      {new Date(achievement.unlockTime * 1000).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Recent Activity */}
        {!status.isInGame && recentGames.length === 0 && recentAchievements.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Gamepad2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No recent gaming activity</p>
          </div>
        )}

        {/* Profile Link */}
        <div className="pt-2 border-t">
          <a
            href={status.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            View Steam Profile →
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
