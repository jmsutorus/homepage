"use client";

import React from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { YearlyStats } from "@/lib/data/yearly-data";
import { CalendarDays, TrendingUp, Calendar, Sparkles, Clock, CalendarRange, Tag } from "lucide-react";
import { cardEntrance } from "@/lib/animation-variants";

interface EventsTimelineProps {
  stats: YearlyStats;
}

/**
 * Events Timeline Component
 * Visualizes events throughout the year
 */
export function EventsTimeline({ stats }: EventsTimelineProps) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Transform monthly activity data for events visualization
  const monthlyEventsData = stats.monthlyActivity.map((item) => ({
    ...item,
    name: monthNames[item.month],
    count: item.events,
  }));

  // Calculate event insights
  const eventInsights = calculateEventInsights(stats);

  // Colors for category visualization
  const COLORS = ['#a855f7', '#ec4899', '#f59e0b', '#3b82f6', '#10b981'];

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="show">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-orange-500" />
              <CardTitle>Events Throughout the Year</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.events.total} events
            </div>
          </div>
          <CardDescription>
            Your scheduled events and occasions in {stats.year}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="h-4 w-4 text-orange-500" />
                <div className="text-sm font-medium text-muted-foreground">Total Events</div>
              </div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.events.total}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {(stats.events.total / 12).toFixed(1)} per month
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <div className="text-sm font-medium text-muted-foreground">All-Day Events</div>
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.events.allDayCount}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stats.events.total > 0 ? ((stats.events.allDayCount / stats.events.total) * 100).toFixed(0) : 0}% of total
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <div className="text-sm font-medium text-muted-foreground">Scheduled Events</div>
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.events.timedCount}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stats.events.total > 0 ? ((stats.events.timedCount / stats.events.total) * 100).toFixed(0) : 0}% of total
              </div>
            </div>

            {eventInsights.bestMonth && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <div className="text-sm font-medium text-muted-foreground">Busiest Month</div>
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {eventInsights.bestMonth.month}
                </div>
                <div className="text-sm text-muted-foreground">
                  {eventInsights.bestMonth.count} events
                </div>
              </div>
            )}
          </div>

          {/* Event Categories */}
          {stats.events.topCategories.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Event Categories</h4>
              <div className="space-y-3">
                {stats.events.topCategories.map((cat, index) => {
                  const percentage = (cat.count / stats.events.total) * 100;
                  const color = COLORS[index % COLORS.length];

                  return (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-medium">{cat.category}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {cat.count} ({percentage.toFixed(0)}%)
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

          {/* Monthly Events Trend */}
          {stats.events.total > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Monthly Events</h4>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyEventsData}>
                    <defs>
                      <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
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
                      itemStyle={{ color: "#f97316" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#f97316"
                      fillOpacity={1}
                      fill="url(#colorEvents)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Insights */}
          {eventInsights.insights.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Insights</h4>
              <div className="grid gap-2">
                {eventInsights.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm"
                  >
                    <insight.icon className="h-4 w-4 mt-0.5 text-orange-500 shrink-0" />
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
 * Calculate event insights from stats
 */
function calculateEventInsights(stats: YearlyStats) {
  const insights: Array<{ icon: React.ComponentType<{ className?: string }>; text: string }> = [];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Find best month for events
  let bestMonth = { month: "", count: 0, index: 0 };
  stats.monthlyActivity.forEach((month, index) => {
    if (month.events > bestMonth.count) {
      bestMonth = {
        month: monthNames[index],
        count: month.events,
        index,
      };
    }
  });

  // Generate insights
  const avgPerMonth = (stats.events.total / 12).toFixed(1);

  // Volume insights
  if (stats.events.total >= 100) {
    insights.push({
      icon: CalendarDays,
      text: `You had ${stats.events.total} scheduled events this year, averaging ${avgPerMonth} per month. That's a busy calendar!`,
    });
  } else if (stats.events.total >= 50) {
    insights.push({
      icon: CalendarDays,
      text: `${stats.events.total} events throughout the year kept your calendar active with something happening almost every week.`,
    });
  } else if (stats.events.total >= 24) {
    insights.push({
      icon: Calendar,
      text: `You tracked ${stats.events.total} events this year, about ${avgPerMonth} per month.`,
    });
  } else if (stats.events.total >= 12) {
    insights.push({
      icon: Calendar,
      text: `${stats.events.total} notable events marked your calendar throughout the year.`,
    });
  }

  // Multi-day events insight
  if (stats.events.multiDayCount >= 10) {
    insights.push({
      icon: CalendarRange,
      text: `You had ${stats.events.multiDayCount} multi-day events like trips or conferences spanning multiple days.`,
    });
  } else if (stats.events.multiDayCount >= 5) {
    insights.push({
      icon: CalendarRange,
      text: `${stats.events.multiDayCount} events spanned multiple days this year.`,
    });
  }

  // All-day vs timed events
  const allDayPercentage = stats.events.total > 0 
    ? (stats.events.allDayCount / stats.events.total) * 100 
    : 0;
  
  if (allDayPercentage >= 70) {
    insights.push({
      icon: Calendar,
      text: `${allDayPercentage.toFixed(0)}% of your events were all-day occasions like holidays, birthdays, or special dates.`,
    });
  } else if (allDayPercentage <= 30 && stats.events.timedCount > 0) {
    insights.push({
      icon: Clock,
      text: `Most of your events (${(100 - allDayPercentage).toFixed(0)}%) had specific times scheduled.`,
    });
  }

  // Best month insight
  if (bestMonth.count >= 15) {
    insights.push({
      icon: TrendingUp,
      text: `${bestMonth.month} was your busiest month with ${bestMonth.count} events!`,
    });
  } else if (bestMonth.count >= 8) {
    insights.push({
      icon: TrendingUp,
      text: `${bestMonth.month} had the most activity with ${bestMonth.count} events.`,
    });
  }

  // Consistency check
  const monthsWithEvents = stats.monthlyActivity.filter(m => m.events > 0).length;
  if (monthsWithEvents === 12) {
    insights.push({
      icon: Calendar,
      text: "You had events scheduled every month of the year!",
    });
  } else if (monthsWithEvents >= 10) {
    insights.push({
      icon: Calendar,
      text: `Events were spread across ${monthsWithEvents} months of the year.`,
    });
  }

  // Seasonal insights based on best month
  if (bestMonth.index >= 5 && bestMonth.index <= 7) { // June, July, August
    insights.push({
      icon: Sparkles,
      text: "Summer was your most eventful season!",
    });
  } else if (bestMonth.index === 11 || bestMonth.index === 0) { // December or January
    insights.push({
      icon: Sparkles,
      text: "The holiday season was your busiest time for events!",
    });
  }

  // Category insights
  if (stats.events.topCategories.length > 0) {
    const topCategory = stats.events.topCategories[0];
    const percentage = stats.events.total > 0 ? (topCategory.count / stats.events.total) * 100 : 0;

    if (percentage >= 40) {
      insights.push({
        icon: Tag,
        text: `${topCategory.category} was your dominant event type, making up ${percentage.toFixed(0)}% of all events (${topCategory.count} events).`,
      });
    } else if (stats.events.topCategories.length >= 3) {
      const top3 = stats.events.topCategories.slice(0, 3);
      const categories = top3.map(c => c.category).join(", ");
      insights.push({
        icon: Tag,
        text: `Your most common event types were ${categories}.`,
      });
    }

    // Diversity insight
    const categoriesCount = Object.keys(stats.events.byCategory).length;
    if (categoriesCount >= 4) {
      insights.push({
        icon: CalendarDays,
        text: `You organized ${categoriesCount} different types of events, showing great variety in your calendar!`,
      });
    }
  }

  return {
    bestMonth: bestMonth.count > 0 ? bestMonth : null,
    insights,
  };
}
