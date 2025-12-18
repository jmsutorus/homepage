"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { YearlyStats } from "@/lib/data/yearly-data";
import { Music, TrendingUp, Star, Calendar, Sparkles, User } from "lucide-react";
import { cardEntrance } from "@/lib/animation-variants";

interface AlbumsTimelineProps {
  stats: YearlyStats;
}

/**
 * Albums Journey Timeline Component
 * Visualizes music listening journey through the year
 */
export function AlbumsTimeline({ stats }: AlbumsTimelineProps) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Transform monthly activity data for albums visualization
  const monthlyAlbumsData = stats.monthlyActivity.map((item) => ({
    ...item,
    name: monthNames[item.month],
    count: item.albums,
  }));

  // Calculate album insights
  const albumInsights = calculateAlbumInsights(stats);

  // Get album count from stats.albums
  const albumCount = stats.albums.total;

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="show">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-5 w-5 text-pink-500" />
              <CardTitle>Music Journey</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground">
              {albumCount} albums
            </span>
          </div>
          <CardDescription>
            Your music listening journey through {stats.year}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border border-pink-200 dark:border-pink-800">
              <div className="flex items-center gap-2 mb-2">
                <Music className="h-4 w-4 text-pink-500" />
                <div className="text-sm font-medium text-muted-foreground">Albums Listened</div>
              </div>
              <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                {albumCount}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {(albumCount / 12).toFixed(1)} per month
              </div>
            </div>

            {albumInsights.averageRating > 0 && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div className="text-sm font-medium text-muted-foreground">Avg Rating</div>
                </div>
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {albumInsights.averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  out of 10
                </div>
              </div>
            )}

            {albumInsights.uniqueArtists > 0 && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-blue-500" />
                  <div className="text-sm font-medium text-muted-foreground">Unique Artists</div>
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {albumInsights.uniqueArtists}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {albumCount > 0 ? (albumCount / albumInsights.uniqueArtists).toFixed(1) : 0} albums per artist
                </div>
              </div>
            )}

            {albumInsights.uniqueGenres > 0 && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <div className="text-sm font-medium text-muted-foreground">Unique Genres</div>
                </div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {albumInsights.uniqueGenres}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  genres explored
                </div>
              </div>
            )}
          </div>

          {/* Monthly Albums Trend */}
          {albumCount > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Monthly Listening Activity</h4>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyAlbumsData}>
                    <defs>
                      <linearGradient id="colorAlbums" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
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
                      itemStyle={{ color: "#ec4899" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#ec4899"
                      fillOpacity={1}
                      fill="url(#colorAlbums)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top Rated Albums */}
          {albumInsights.topRatedAlbums.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Top Rated Albums</h4>
              <div className="grid gap-3 md:grid-cols-3">
                {albumInsights.topRatedAlbums.map((item, index) => (
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
                          Album
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
                    {item.creator && (
                      <p className="text-xs text-muted-foreground mb-1">
                        by {(() => {
                          try {
                            // Parse if it's a JSON string
                            const creators = typeof item.creator === 'string' 
                              ? JSON.parse(item.creator) 
                              : item.creator;
                            // Handle array of creators
                            if (Array.isArray(creators)) {
                              return creators.join(', ');
                            }
                            return creators;
                          } catch {
                            // If parsing fails, return as-is
                            return item.creator;
                          }
                        })()}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {item.completed && new Date(item.completed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Top Genres */}
          {albumInsights.topGenres.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Top Genres</h4>
              <div className="space-y-3">
                {albumInsights.topGenres.slice(0, 8).map((genre, index) => {
                  const percentage = (genre.count / albumCount) * 100;
                  const COLORS = ['#ec4899', '#db2777', '#be185d', '#9f1239', '#881337', '#701a2e', '#5a1725', '#4a141e'];
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

          {/* Top Artists */}
          {albumInsights.topCreators.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Top Artists</h4>
              <div className="space-y-3">
                {albumInsights.topCreators.slice(0, 8).map((artist, index) => {
                  const percentage = (artist.count / albumCount) * 100;
                  const COLORS = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554', '#0f172a', '#020617'];
                  const color = COLORS[index % COLORS.length];

                  return (
                    <div key={artist.creator} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-medium">{artist.creator}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {artist.count} ({percentage.toFixed(0)}%)
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
          {albumInsights.insights.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Insights</h4>
              <div className="grid gap-2">
                {albumInsights.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm"
                  >
                    <insight.icon className="h-4 w-4 mt-0.5 text-pink-500 shrink-0" />
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
 * Calculate album insights from stats
 * Uses album data from stats.albums
 */
function calculateAlbumInsights(stats: YearlyStats) {
  const insights: Array<{ icon: any; text: string }> = [];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Get album count and stats from the albums property
  const albumCount = stats.albums.total;
  const topGenres = stats.albums.topGenres;
  const topRatedAlbums = stats.albums.topRatedAlbums;
  const averageRating = stats.albums.averageRating;
  const topCreators = stats.albums.topCreators;
  const uniqueGenres = stats.albums.uniqueGenres;
  const uniqueArtists = stats.albums.uniqueArtists;

  // Find best month for albums
  let bestMonth = { month: "", count: 0, index: 0 };
  stats.monthlyActivity.forEach((month, index) => {
    if (month.albums > bestMonth.count) {
      bestMonth = {
        month: monthNames[index],
        count: month.albums,
        index,
      };
    }
  });

  // Generate insights
  const avgPerMonth = (albumCount / 12).toFixed(1);

  // Volume insights
  if (albumCount >= 100) {
    insights.push({
      icon: Music,
      text: `You listened to ${albumCount} albums this year! That's nearly 2 albums per week. Your music collection is impressive!`,
    });
  } else if (albumCount >= 52) {
    insights.push({
      icon: Music,
      text: `${albumCount} albums completed, averaging more than 1 per week. You're a dedicated music listener!`,
    });
  } else if (albumCount >= 24) {
    insights.push({
      icon: Music,
      text: `You listened to ${albumCount} albums this year, maintaining a steady pace of ${avgPerMonth} per month.`,
    });
  } else if (albumCount >= 12) {
    insights.push({
      icon: Calendar,
      text: `${albumCount} albums completed, averaging about 1 per month.`,
    });
  } else if (albumCount >= 6) {
    insights.push({
      icon: Calendar,
      text: `${albumCount} albums enjoyed throughout the year.`,
    });
  }

  // Rating insights
  if (averageRating >= 8.5) {
    insights.push({
      icon: Star,
      text: `Your average rating of ${averageRating.toFixed(1)}/10 shows you have excellent taste in music!`,
    });
  } else if (averageRating >= 7.5) {
    insights.push({
      icon: Star,
      text: `With an average rating of ${averageRating.toFixed(1)}/10, you consistently pick enjoyable albums.`,
    });
  } else if (averageRating >= 6.5) {
    insights.push({
      icon: Star,
      text: `Your average album rating was ${averageRating.toFixed(1)}/10 this year.`,
    });
  }

  // Artist insights
  if (topCreators.length > 0) {
    const topArtist = topCreators[0];
    const secondArtist = topCreators[1];
    
    if (secondArtist && topArtist.count > secondArtist.count * 2) {
      insights.push({
        icon: User,
        text: `You have a strong preference for ${topArtist.creator}, listening to ${topArtist.count} albums from this artist!`,
      });
    } else if (secondArtist) {
      insights.push({
        icon: User,
        text: `Your top artists were ${topArtist.creator} (${topArtist.count}) and ${secondArtist.creator} (${secondArtist.count}).`,
      });
    } else {
      insights.push({
        icon: User,
        text: `${topArtist.creator} was your most listened artist with ${topArtist.count} albums.`,
      });
    }
  }

  // Artist variety insights
  if (uniqueArtists >= 20) {
    insights.push({
      icon: Sparkles,
      text: `You explored ${uniqueArtists} different artists this year. Amazing musical diversity!`,
    });
  } else if (uniqueArtists >= 10) {
    insights.push({
      icon: Sparkles,
      text: `You enjoyed music from ${uniqueArtists} different artists.`,
    });
  }

  // Genre insights
  if (topGenres.length > 0) {
    const topGenre = topGenres[0];
    const secondGenre = topGenres[1];

    if (secondGenre && topGenre.count > secondGenre.count * 2) {
      insights.push({
        icon: TrendingUp,
        text: `You have a strong preference for ${topGenre.genre}, with ${topGenre.count} albums in this genre!`,
      });
    } else if (secondGenre) {
      insights.push({
        icon: Sparkles,
        text: `Your top genres were ${topGenre.genre} (${topGenre.count}) and ${secondGenre.genre} (${secondGenre.count}).`,
      });
    }
  }

  // Genre variety insights
  if (uniqueGenres >= 15) {
    insights.push({
      icon: Sparkles,
      text: `You explored ${uniqueGenres} different genres this year. Great variety in your listening!`,
    });
  } else if (uniqueGenres >= 8) {
    insights.push({
      icon: Sparkles,
      text: `You enjoyed albums across ${uniqueGenres} different genres.`,
    });
  }

  // Best month insight
  if (bestMonth.count >= 10) {
    insights.push({
      icon: TrendingUp,
      text: `${bestMonth.month} was your peak music month with ${bestMonth.count} albums completed!`,
    });
  } else if (bestMonth.count >= 5) {
    insights.push({
      icon: Calendar,
      text: `${bestMonth.month} was your most active music month with ${bestMonth.count} albums.`,
    });
  }

  // Consistency check
  const monthsWithAlbums = stats.monthlyActivity.filter(m => m.albums > 0).length;
  if (monthsWithAlbums === 12) {
    insights.push({
      icon: Calendar,
      text: "You listened to music every single month. Perfect consistency in your listening habit!",
    });
  } else if (monthsWithAlbums >= 10) {
    insights.push({
      icon: Calendar,
      text: `You enjoyed albums in ${monthsWithAlbums} out of 12 months. Great consistency!`,
    });
  }

  return {
    bestMonth: bestMonth.count > 0 ? bestMonth : null,
    insights,
    topGenres,
    topRatedAlbums,
    averageRating,
    topCreators,
    uniqueGenres,
    uniqueArtists,
  };
}
