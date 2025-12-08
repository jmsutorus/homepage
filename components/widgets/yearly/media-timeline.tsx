"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { YearlyStats } from "@/lib/data/yearly-data";
import { Film, TrendingUp, Star, Calendar, Sparkles } from "lucide-react";
import { cardEntrance } from "@/lib/animation-variants";
import { cn } from "@/lib/utils";

interface MediaTimelineProps {
  stats: YearlyStats;
}

/**
 * Filter stats to only include movies and TV shows
 */
function filterMoviesAndTV(stats: YearlyStats) {
  // Filter media types to only movies and TV shows
  const movieTVTypes = Object.entries(stats.media.byType).filter(([type]) => {
    const normalizedType = type.toLowerCase();
    return normalizedType === 'movie' ||
           normalizedType === 'tv' ||
           normalizedType === 'tv_show' ||
           normalizedType === 'show';
  });

  const filteredByType = Object.fromEntries(movieTVTypes);
  const filteredTotal = movieTVTypes.reduce((sum, [, count]) => sum + (count as number), 0);

  // If no movies/TV found, return original stats to avoid empty state
  if (filteredTotal === 0) {
    return stats;
  }

  return {
    ...stats,
    media: {
      ...stats.media,
      byType: filteredByType,
      total: filteredTotal,
      // Use movie/TV-specific data
      averageRating: stats.media.averageMovieTVRating,
      topGenres: stats.media.topMovieTVGenres,
      topRated: stats.media.topRated,
    }
  };
}

/**
 * Media Journey Timeline Component
 * Visualizes movies and TV shows consumption journey through the year
 */
export function MediaTimeline({ stats }: MediaTimelineProps) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Filter to only movies and TV shows
  const filteredStats = filterMoviesAndTV(stats);

  // Transform monthly activity data for media visualization (movies + TV)
  const monthlyMediaData = stats.monthlyActivity.map((item) => ({
    ...item,
    name: monthNames[item.month],
    count: item.movies + item.tv, // Combine movies and TV
  }));

  // Calculate media insights
  const mediaInsights = calculateMediaInsights(filteredStats);

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="show">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="h-5 w-5 text-blue-500" />
              <CardTitle>Movies & TV Shows</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredStats.media.total} titles
            </div>
          </div>
          <CardDescription>
            Your movies and TV shows journey through {stats.year}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Film className="h-4 w-4 text-blue-500" />
                <div className="text-sm font-medium text-muted-foreground">Total Consumed</div>
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {filteredStats.media.total}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {(filteredStats.media.total / 52).toFixed(1)} per week
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <div className="text-sm font-medium text-muted-foreground">Avg Rating</div>
              </div>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {filteredStats.media.averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                out of 10
              </div>
            </div>

            {mediaInsights.bestMonth && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <div className="text-sm font-medium text-muted-foreground">Best Month</div>
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {mediaInsights.bestMonth.month}
                </div>
                <div className="text-sm text-muted-foreground">
                  {mediaInsights.bestMonth.count} titles
                </div>
              </div>
            )}

            {filteredStats.media.topGenres.length > 0 && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <div className="text-sm font-medium text-muted-foreground">Top Genre</div>
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 truncate">
                  {filteredStats.media.topGenres[0].genre}
                </div>
                <div className="text-sm text-muted-foreground">
                  {filteredStats.media.topGenres[0].count} titles
                </div>
              </div>
            )}
          </div>

          {/* Monthly Consumption Trend */}
          {filteredStats.media.total > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Monthly Consumption</h4>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyMediaData}>
                    <defs>
                      <linearGradient id="colorMedia" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                      itemStyle={{ color: "#3b82f6" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorMedia)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top Rated Movies & TV Shows */}
          {filteredStats.media.topRated.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Top Rated</h4>
              <div className="grid gap-3 md:grid-cols-3">
                {filteredStats.media.topRated.map((item, index) => (
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
                          {item.type}
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

          {/* Top Genres */}
          {filteredStats.media.topGenres.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Top Genres</h4>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredStats.media.topGenres.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="genre"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
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
                    <Bar
                      dataKey="count"
                      fill="#a855f7"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Insights */}
          {mediaInsights.insights.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Insights</h4>
              <div className="grid gap-2">
                {mediaInsights.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm"
                  >
                    <insight.icon className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
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
 * Calculate media insights from stats
 */
function calculateMediaInsights(stats: YearlyStats) {
  const insights: Array<{ icon: any; text: string }> = [];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Find best month for movies and TV
  let bestMonth = { month: "", count: 0, index: 0 };
  stats.monthlyActivity.forEach((month, index) => {
    const movieTvCount = month.movies + month.tv;
    if (movieTvCount > bestMonth.count) {
      bestMonth = {
        month: monthNames[index],
        count: movieTvCount,
        index,
      };
    }
  });

  // Generate insights
  const avgPerWeek = (stats.media.total / 52).toFixed(1);

  // Volume insights
  if (stats.media.total >= 365) {
    insights.push({
      icon: Film,
      text: `You consumed more than 1 title per day! That's ${stats.media.total} pieces of media this year.`,
    });
  } else if (stats.media.total >= 200) {
    insights.push({
      icon: Film,
      text: `${stats.media.total} titles consumed, averaging ${avgPerWeek} per week. You're a true entertainment enthusiast!`,
    });
  } else if (stats.media.total >= 100) {
    insights.push({
      icon: Film,
      text: `You enjoyed ${stats.media.total} titles this year, maintaining a steady pace of ${avgPerWeek} per week.`,
    });
  } else if (stats.media.total >= 50) {
    insights.push({
      icon: Calendar,
      text: `${stats.media.total} titles consumed throughout the year.`,
    });
  }

  // Rating insights
  if (stats.media.averageRating >= 8.5) {
    insights.push({
      icon: Star,
      text: `Your average rating of ${stats.media.averageRating.toFixed(1)}/10 shows you have excellent taste in picking quality content!`,
    });
  } else if (stats.media.averageRating >= 7.5) {
    insights.push({
      icon: Star,
      text: `With an average rating of ${stats.media.averageRating.toFixed(1)}/10, you consistently choose enjoyable content.`,
    });
  } else if (stats.media.averageRating >= 6.5) {
    insights.push({
      icon: Star,
      text: `Your average rating was ${stats.media.averageRating.toFixed(1)}/10 this year.`,
    });
  }

  // Media type insights
  const mediaTypes = Object.entries(stats.media.byType);
  if (mediaTypes.length > 0) {
    const topType = mediaTypes.sort(([, a], [, b]) => b - a)[0];
    const percentage = ((topType[1] / stats.media.total) * 100).toFixed(0);

    insights.push({
      icon: Sparkles,
      text: `${topType[0].charAt(0).toUpperCase() + topType[0].slice(1)}s were your go-to, making up ${percentage}% of what you watched.`,
    });
  }

  // Genre insights
  if (stats.media.topGenres.length > 0) {
    const topGenre = stats.media.topGenres[0];
    const secondGenre = stats.media.topGenres[1];

    if (secondGenre && topGenre.count > secondGenre.count * 2) {
      insights.push({
        icon: TrendingUp,
        text: `You have a strong preference for ${topGenre.genre}, consuming ${topGenre.count} titles in this genre!`,
      });
    } else if (secondGenre) {
      insights.push({
        icon: Sparkles,
        text: `Your top genres were ${topGenre.genre} (${topGenre.count}) and ${secondGenre.genre} (${secondGenre.count}).`,
      });
    }
  }

  // Variety insights
  const uniqueGenres = stats.media.topGenres.length;
  if (uniqueGenres >= 10) {
    insights.push({
      icon: Sparkles,
      text: `You explored ${uniqueGenres} different genres this year. Great variety in your entertainment choices!`,
    });
  } else if (uniqueGenres >= 5) {
    insights.push({
      icon: Sparkles,
      text: `You enjoyed content across ${uniqueGenres} different genres.`,
    });
  }

  // Best month insight
  if (bestMonth.count >= 20) {
    insights.push({
      icon: TrendingUp,
      text: `${bestMonth.month} was your peak entertainment month with ${bestMonth.count} titles consumed!`,
    });
  } else if (bestMonth.count >= 10) {
    insights.push({
      icon: Calendar,
      text: `${bestMonth.month} was your most active media month with ${bestMonth.count} titles.`,
    });
  }

  // Consistency check
  const monthsWithMedia = stats.monthlyActivity.filter(m => (m.movies + m.tv) > 0).length;
  if (monthsWithMedia === 12) {
    insights.push({
      icon: Calendar,
      text: "You watched movies or TV every single month. Perfect consistency in your entertainment habits!",
    });
  }

  return {
    bestMonth: bestMonth.count > 0 ? bestMonth : null,
    insights,
  };
}
