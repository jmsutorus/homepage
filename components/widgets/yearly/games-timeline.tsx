"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { YearlyStats } from "@/lib/data/yearly-data";
import { Gamepad2, TrendingUp, Star, Calendar, Sparkles, Trophy, Clock, RefreshCw } from "lucide-react";
import { cardEntrance } from "@/lib/animation-variants";
import { toast } from "sonner";

interface GamesTimelineProps {
  stats: YearlyStats;
}

/**
 * Games Journey Timeline Component
 * Visualizes gaming journey through the year (database games + Steam data)
 */
export function GamesTimeline({ stats }: GamesTimelineProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Transform monthly activity data for games visualization
  const monthlyGamesData = stats.monthlyActivity.map((item) => ({
    ...item,
    name: monthNames[item.month],
    count: item.games,
  }));

  // Calculate game insights
  const gameInsights = calculateGameInsights(stats);

  // Handle Steam sync
  const handleSteamSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/steam/sync-year', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: stats.year }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync Steam data');
      }

      toast.success("Steam data synced!", {
        description: "Your gaming stats have been updated. Refresh the page to see the latest data.",
      });
    } catch (error) {
      toast.error("Sync failed", {
        description: "Failed to sync Steam data. Please try again.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="show">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-purple-500" />
              <CardTitle>Gaming Journey</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {stats.games.total} games
              </span>
              <Button
                onClick={handleSteamSync}
                disabled={isSyncing}
                size="sm"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync Steam
              </Button>
            </div>
          </div>
          <CardDescription>
            Your gaming journey through {stats.year}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Gamepad2 className="h-4 w-4 text-purple-500" />
                <div className="text-sm font-medium text-muted-foreground">Games Played</div>
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.games.total}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {(stats.games.total / 12).toFixed(1)} per month
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <div className="text-sm font-medium text-muted-foreground">Avg Rating</div>
              </div>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.games.averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                out of 10
              </div>
            </div>

            {stats.games.totalAchievements > 0 && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-green-500" />
                  <div className="text-sm font-medium text-muted-foreground">Achievements</div>
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.games.totalAchievements}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  unlocked on Steam
                </div>
              </div>
            )}

            {stats.games.totalPlaytime > 0 && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div className="text-sm font-medium text-muted-foreground">Playtime</div>
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(stats.games.totalPlaytime / 60)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  hours on Steam
                </div>
              </div>
            )}
          </div>

          {/* Monthly Gaming Trend */}
          {stats.games.total > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Monthly Gaming Activity</h4>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyGamesData}>
                    <defs>
                      <linearGradient id="colorGames" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        color: "hsl(var(--popover-foreground))"
                      }}
                      itemStyle={{ color: "#a855f7" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#a855f7"
                      fillOpacity={1}
                      fill="url(#colorGames)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top Rated Games */}
          {stats.games.topRatedGames.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Top Rated Games</h4>
              <div className="grid gap-3 md:grid-cols-3">
                {stats.games.topRatedGames.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border border-yellow-200 dark:border-yellow-800"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500 text-white font-bold text-sm">
                          #{index + 1}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          Game
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                          {item.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <h5 className="font-semibold text-base line-clamp-2 mb-1">
                      {item.title}
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      Completed {new Date(item.completed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Top Steam Games by Achievements */}
          {stats.games.topSteamGames.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Most Achievements</h4>
              <div className="space-y-2">
                {stats.games.topSteamGames.map((game, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500 text-white font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{game.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round(game.playtime / 60)} hours played
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-green-500" />
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {game.achievements}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Genres */}
          {stats.games.topGenres.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Top Genres</h4>
              <div className="space-y-3">
                {stats.games.topGenres.slice(0, 8).map((genre, index) => {
                  const percentage = (genre.count / stats.games.total) * 100;
                  const COLORS = ['#a855f7', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#3b0764', '#2e1065'];
                  const color = COLORS[index % COLORS.length];

                  return (
                    <div key={genre.genre} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-medium">{genre.genre}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {genre.count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden ml-5">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Insights */}
          {gameInsights.insights.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Insights</h4>
              <div className="grid gap-2">
                {gameInsights.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm"
                  >
                    <insight.icon className="h-4 w-4 mt-0.5 text-purple-500 shrink-0" />
                    <span>{insight.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Calculate game insights from stats
 */
function calculateGameInsights(stats: YearlyStats) {
  const insights: Array<{ icon: any; text: string }> = [];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Find best month for games
  let bestMonth = { month: "", count: 0, index: 0 };
  stats.monthlyActivity.forEach((month, index) => {
    if (month.games > bestMonth.count) {
      bestMonth = {
        month: monthNames[index],
        count: month.games,
        index,
      };
    }
  });

  // Generate insights
  const avgPerMonth = (stats.games.total / 12).toFixed(1);

  // Volume insights
  if (stats.games.total >= 100) {
    insights.push({
      icon: Gamepad2,
      text: `You played ${stats.games.total} games this year! That's more than 2 games per week. Impressive gaming library!`,
    });
  } else if (stats.games.total >= 52) {
    insights.push({
      icon: Gamepad2,
      text: `${stats.games.total} games completed, averaging more than 1 per week. You're a dedicated gamer!`,
    });
  } else if (stats.games.total >= 24) {
    insights.push({
      icon: Gamepad2,
      text: `You completed ${stats.games.total} games this year, maintaining a steady pace of ${avgPerMonth} per month.`,
    });
  } else if (stats.games.total >= 12) {
    insights.push({
      icon: Calendar,
      text: `${stats.games.total} games completed, averaging about 1 per month.`,
    });
  } else if (stats.games.total >= 6) {
    insights.push({
      icon: Calendar,
      text: `${stats.games.total} games played throughout the year.`,
    });
  }

  // Rating insights
  if (stats.games.averageRating >= 8.5) {
    insights.push({
      icon: Star,
      text: `Your average rating of ${stats.games.averageRating.toFixed(1)}/10 shows you have excellent taste in games!`,
    });
  } else if (stats.games.averageRating >= 7.5) {
    insights.push({
      icon: Star,
      text: `With an average rating of ${stats.games.averageRating.toFixed(1)}/10, you consistently pick enjoyable games.`,
    });
  } else if (stats.games.averageRating >= 6.5) {
    insights.push({
      icon: Star,
      text: `Your average game rating was ${stats.games.averageRating.toFixed(1)}/10 this year.`,
    });
  }

  // Steam achievement insights
  if (stats.games.totalAchievements >= 500) {
    insights.push({
      icon: Trophy,
      text: `You unlocked ${stats.games.totalAchievements} Steam achievements! You're a completionist!`,
    });
  } else if (stats.games.totalAchievements >= 250) {
    insights.push({
      icon: Trophy,
      text: `${stats.games.totalAchievements} achievements unlocked on Steam. Great dedication!`,
    });
  } else if (stats.games.totalAchievements >= 100) {
    insights.push({
      icon: Trophy,
      text: `You earned ${stats.games.totalAchievements} Steam achievements this year.`,
    });
  }

  // Playtime insights
  const hours = Math.round(stats.games.totalPlaytime / 60);
  if (hours >= 1000) {
    insights.push({
      icon: Clock,
      text: `${hours} hours on Steam! That's ${(hours / 365).toFixed(1)} hours per day of gaming.`,
    });
  } else if (hours >= 500) {
    insights.push({
      icon: Clock,
      text: `${hours} hours of gaming on Steam this year.`,
    });
  } else if (hours >= 100) {
    insights.push({
      icon: Clock,
      text: `You logged ${hours} hours on Steam this year.`,
    });
  }

  // Genre insights
  if (stats.games.topGenres.length > 0) {
    const topGenre = stats.games.topGenres[0];
    const secondGenre = stats.games.topGenres[1];

    if (secondGenre && topGenre.count > secondGenre.count * 2) {
      insights.push({
        icon: TrendingUp,
        text: `You have a strong preference for ${topGenre.genre}, playing ${topGenre.count} games in this genre!`,
      });
    } else if (secondGenre) {
      insights.push({
        icon: Sparkles,
        text: `Your top genres were ${topGenre.genre} (${topGenre.count}) and ${secondGenre.genre} (${secondGenre.count}).`,
      });
    }
  }

  // Variety insights
  const uniqueGenres = stats.games.topGenres.length;
  if (uniqueGenres >= 10) {
    insights.push({
      icon: Sparkles,
      text: `You explored ${uniqueGenres} different genres this year. Great variety in your gaming!`,
    });
  } else if (uniqueGenres >= 5) {
    insights.push({
      icon: Sparkles,
      text: `You enjoyed games across ${uniqueGenres} different genres.`,
    });
  }

  // Best month insight
  if (bestMonth.count >= 10) {
    insights.push({
      icon: TrendingUp,
      text: `${bestMonth.month} was your peak gaming month with ${bestMonth.count} games completed!`,
    });
  } else if (bestMonth.count >= 5) {
    insights.push({
      icon: Calendar,
      text: `${bestMonth.month} was your most active gaming month with ${bestMonth.count} games.`,
    });
  }

  // Consistency check
  const monthsWithGames = stats.monthlyActivity.filter(m => m.games > 0).length;
  if (monthsWithGames === 12) {
    insights.push({
      icon: Calendar,
      text: "You played games every single month. Perfect consistency in your gaming habit!",
    });
  }

  return {
    bestMonth: bestMonth.count > 0 ? bestMonth : null,
    insights,
  };
}
