"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { YearlyStats } from "@/lib/data/yearly-data";
import { BookOpen, TrendingUp, Star, Calendar, Sparkles } from "lucide-react";
import { cardEntrance } from "@/lib/animation-variants";

interface BooksTimelineProps {
  stats: YearlyStats;
}

/**
 * Filter stats to only include books
 */
function filterBooks(stats: YearlyStats) {
  // Filter media types to only books
  const bookTypes = Object.entries(stats.media.byType).filter(([type]) => {
    const normalizedType = type.toLowerCase();
    return normalizedType === 'book';
  });

  const filteredByType = Object.fromEntries(bookTypes);
  const filteredTotal = bookTypes.reduce((sum, [, count]) => sum + (count as number), 0);

  // If no books found, return original stats to avoid empty state
  if (filteredTotal === 0) {
    return stats;
  }

  return {
    ...stats,
    media: {
      ...stats.media,
      byType: filteredByType,
      total: filteredTotal,
      // Use book-specific data
      averageRating: stats.media.averageBookRating,
      topGenres: stats.media.topBookGenres,
      topRated: stats.media.topRatedBooks,
    }
  };
}

/**
 * Books Journey Timeline Component
 * Visualizes reading journey through the year
 */
export function BooksTimeline({ stats }: BooksTimelineProps) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Filter to only books
  const filteredStats = filterBooks(stats);

  // Transform monthly activity data for books visualization
  const monthlyBooksData = stats.monthlyActivity.map((item) => ({
    ...item,
    name: monthNames[item.month],
    count: item.books, // Use books field instead of media
  }));

  // Calculate book insights
  const bookInsights = calculateBookInsights(filteredStats);

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="show">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              <CardTitle>Reading Journey</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredStats.media.total} books
            </div>
          </div>
          <CardDescription>
            Your reading journey through {stats.year}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-indigo-500" />
                <div className="text-sm font-medium text-muted-foreground">Books Read</div>
              </div>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {filteredStats.media.total}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {(filteredStats.media.total / 12).toFixed(1)} per month
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

            {bookInsights.bestMonth && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <div className="text-sm font-medium text-muted-foreground">Best Month</div>
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {bookInsights.bestMonth.month}
                </div>
                <div className="text-sm text-muted-foreground">
                  {bookInsights.bestMonth.count} books
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
                  {filteredStats.media.topGenres[0].count} books
                </div>
              </div>
            )}
          </div>

          {/* Monthly Reading Trend */}
          {filteredStats.media.total > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Monthly Reading</h4>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyBooksData}>
                    <defs>
                      <linearGradient id="colorBooks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
                      itemStyle={{ color: "#6366f1" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#6366f1"
                      fillOpacity={1}
                      fill="url(#colorBooks)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top Rated Books */}
          {filteredStats.media.topRated.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Top Rated Books</h4>
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
                          Book
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
                      itemStyle={{ color: "#6366f1" }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#6366f1"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Insights */}
          {bookInsights.insights.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Insights</h4>
              <div className="grid gap-2">
                {bookInsights.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm"
                  >
                    <insight.icon className="h-4 w-4 mt-0.5 text-indigo-500 shrink-0" />
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
 * Calculate book insights from stats
 */
function calculateBookInsights(stats: YearlyStats) {
  const insights: Array<{ icon: any; text: string }> = [];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Find best month for books
  let bestMonth = { month: "", count: 0, index: 0 };
  stats.monthlyActivity.forEach((month, index) => {
    if (month.books > bestMonth.count) {
      bestMonth = {
        month: monthNames[index],
        count: month.books,
        index,
      };
    }
  });

  // Generate insights
  const avgPerMonth = (stats.media.total / 12).toFixed(1);

  // Volume insights
  if (stats.media.total >= 100) {
    insights.push({
      icon: BookOpen,
      text: `You read ${stats.media.total} books this year! That's more than 2 books per week. Impressive reading habit!`,
    });
  } else if (stats.media.total >= 52) {
    insights.push({
      icon: BookOpen,
      text: `${stats.media.total} books read, averaging more than 1 per week. You're a dedicated reader!`,
    });
  } else if (stats.media.total >= 24) {
    insights.push({
      icon: BookOpen,
      text: `You read ${stats.media.total} books this year, maintaining a steady pace of ${avgPerMonth} per month.`,
    });
  } else if (stats.media.total >= 12) {
    insights.push({
      icon: Calendar,
      text: `${stats.media.total} books completed, averaging about 1 per month.`,
    });
  } else if (stats.media.total >= 6) {
    insights.push({
      icon: Calendar,
      text: `${stats.media.total} books read throughout the year.`,
    });
  }

  // Rating insights
  if (stats.media.averageRating >= 8.5) {
    insights.push({
      icon: Star,
      text: `Your average rating of ${stats.media.averageRating.toFixed(1)}/10 shows you have excellent taste in choosing books!`,
    });
  } else if (stats.media.averageRating >= 7.5) {
    insights.push({
      icon: Star,
      text: `With an average rating of ${stats.media.averageRating.toFixed(1)}/10, you consistently pick enjoyable reads.`,
    });
  } else if (stats.media.averageRating >= 6.5) {
    insights.push({
      icon: Star,
      text: `Your average book rating was ${stats.media.averageRating.toFixed(1)}/10 this year.`,
    });
  }

  // Genre insights
  if (stats.media.topGenres.length > 0) {
    const topGenre = stats.media.topGenres[0];
    const secondGenre = stats.media.topGenres[1];

    if (secondGenre && topGenre.count > secondGenre.count * 2) {
      insights.push({
        icon: TrendingUp,
        text: `You have a strong preference for ${topGenre.genre}, reading ${topGenre.count} books in this genre!`,
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
      text: `You explored ${uniqueGenres} different genres this year. Great variety in your reading choices!`,
    });
  } else if (uniqueGenres >= 5) {
    insights.push({
      icon: Sparkles,
      text: `You enjoyed books across ${uniqueGenres} different genres.`,
    });
  }

  // Best month insight
  if (bestMonth.count >= 10) {
    insights.push({
      icon: TrendingUp,
      text: `${bestMonth.month} was your peak reading month with ${bestMonth.count} books completed!`,
    });
  } else if (bestMonth.count >= 5) {
    insights.push({
      icon: Calendar,
      text: `${bestMonth.month} was your most active reading month with ${bestMonth.count} books.`,
    });
  }

  // Consistency check
  const monthsWithBooks = stats.monthlyActivity.filter(m => m.books > 0).length;
  if (monthsWithBooks === 12) {
    insights.push({
      icon: Calendar,
      text: "You read books every single month. Perfect consistency in your reading habit!",
    });
  }

  // Reading challenge milestones
  if (stats.media.total >= 50) {
    insights.push({
      icon: TrendingUp,
      text: `You've read ${stats.media.total} books! That's an average of ${avgPerMonth} books per month.`,
    });
  }

  return {
    bestMonth: bestMonth.count > 0 ? bestMonth : null,
    insights,
  };
}
