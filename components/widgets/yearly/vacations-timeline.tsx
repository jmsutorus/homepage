"use client";

import React from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { YearlyStats } from "@/lib/data/yearly-data";
import { 
  Plane, 
  Calendar, 
  Star, 
  DollarSign, 
  TrendingUp, 
  Sparkles, 
  MapPin,
  Clock,
  Trophy
} from "lucide-react";
import { cardEntrance } from "@/lib/animation-variants";
import { VACATION_TYPE_NAMES, VacationType } from "@/lib/types/vacations";

interface VacationsTimelineProps {
  stats: YearlyStats;
}

/**
 * Vacations Timeline Component
 * Visualizes vacations throughout the year
 */
export function VacationsTimeline({ stats }: VacationsTimelineProps) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Transform monthly activity data for vacations visualization
  const monthlyVacationsData = stats.monthlyActivity.map((item) => ({
    ...item,
    name: monthNames[item.month],
    count: item.vacations,
  }));

  // Calculate vacation insights
  const vacationInsights = calculateVacationInsights(stats);

  // Colors for type visualization
  const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981'];

  // Get vacation types with counts sorted by count
  const vacationTypes = Object.entries(stats.vacations.byType)
    .map(([type, count]) => ({
      type: type as VacationType,
      name: VACATION_TYPE_NAMES[type as VacationType] || type,
      count
    }))
    .sort((a, b) => b.count - a.count);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="show">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-cyan-500" />
              <CardTitle>Vacations & Travel</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.vacations.total} {stats.vacations.total === 1 ? 'trip' : 'trips'}
            </div>
          </div>
          <CardDescription>
            Your travel adventures in {stats.year}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/20 dark:to-sky-950/20 border border-cyan-200 dark:border-cyan-800">
              <div className="flex items-center gap-2 mb-2">
                <Plane className="h-4 w-4 text-cyan-500" />
                <div className="text-sm font-medium text-muted-foreground">Total Trips</div>
              </div>
              <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                {stats.vacations.total}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stats.vacations.completed} completed
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                <div className="text-sm font-medium text-muted-foreground">Days Away</div>
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.vacations.totalDays}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                ~{stats.vacations.avgDuration.toFixed(1)} days avg
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-amber-500" />
                <div className="text-sm font-medium text-muted-foreground">Avg Rating</div>
              </div>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {stats.vacations.avgRating > 0 ? stats.vacations.avgRating.toFixed(1) : '—'}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stats.vacations.avgRating > 0 ? 'out of 10' : 'No ratings yet'}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                <div className="text-sm font-medium text-muted-foreground">Total Spent</div>
              </div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.vacations.totalBudgetSpent > 0 
                  ? formatCurrency(stats.vacations.totalBudgetSpent) 
                  : '—'}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stats.vacations.avgBudgetPerDay > 0 
                  ? `${formatCurrency(stats.vacations.avgBudgetPerDay)}/day`
                  : 'No budget data'}
              </div>
            </div>
          </div>

          {/* Vacation Types */}
          {vacationTypes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Vacation Types</h4>
              <div className="space-y-3">
                {vacationTypes.map((vType, index) => {
                  const percentage = (vType.count / stats.vacations.total) * 100;
                  const color = COLORS[index % COLORS.length];

                  return (
                    <div key={vType.type} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-medium">{vType.name}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {vType.count} ({percentage.toFixed(0)}%)
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

          {/* Monthly Vacations Trend */}
          {stats.vacations.total > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Monthly Travel</h4>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyVacationsData}>
                    <defs>
                      <linearGradient id="colorVacations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
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
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        color: "hsl(var(--popover-foreground))"
                      }}
                      itemStyle={{ color: "#06b6d4" }}
                      formatter={(value: number) => [`${value} trip${value !== 1 ? 's' : ''}`, 'Vacations']}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#06b6d4"
                      fillOpacity={1}
                      fill="url(#colorVacations)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top Rated Vacations */}
          {stats.vacations.topRatedVacations.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Top Rated Trips</h4>
              <div className="grid gap-3">
                {stats.vacations.topRatedVacations.map((vacation, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{vacation.title}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {vacation.destination}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-4 w-4 fill-amber-400" />
                      <span className="font-medium">{vacation.rating}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          {vacationInsights.insights.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Insights</h4>
              <div className="grid gap-2">
                {vacationInsights.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm"
                  >
                    <insight.icon className="h-4 w-4 mt-0.5 text-cyan-500 shrink-0" />
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
 * Calculate vacation insights from stats
 */
function calculateVacationInsights(stats: YearlyStats) {
  const insights: Array<{ icon: React.ComponentType<{ className?: string }>; text: string }> = [];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Find busiest month for travel
  let busiestMonth = { month: "", count: 0, index: 0 };
  stats.monthlyActivity.forEach((month, index) => {
    if (month.vacations > busiestMonth.count) {
      busiestMonth = {
        month: monthNames[index],
        count: month.vacations,
        index,
      };
    }
  });

  // Travel frequency insight
  const tripsPerQuarter = stats.vacations.total / 4;
  if (tripsPerQuarter >= 2) {
    insights.push({
      icon: Plane,
      text: `You averaged ${tripsPerQuarter.toFixed(1)} trips per quarter—a true frequent traveler!`,
    });
  } else if (stats.vacations.total >= 4) {
    insights.push({
      icon: Plane,
      text: `You took ${stats.vacations.total} trips this year, roughly one each quarter.`,
    });
  } else if (stats.vacations.total >= 2) {
    insights.push({
      icon: Plane,
      text: `You enjoyed ${stats.vacations.total} getaways this year.`,
    });
  }

  // Longest trip insight
  if (stats.vacations.longestTrip) {
    const { title, destination, days } = stats.vacations.longestTrip;
    if (days >= 14) {
      insights.push({
        icon: Clock,
        text: `Your longest adventure was "${title}" in ${destination} at ${days} days—an epic journey!`,
      });
    } else if (days >= 7) {
      insights.push({
        icon: Clock,
        text: `Your longest trip was ${days} days in ${destination}.`,
      });
    }
  }

  // Days away insight
  if (stats.vacations.totalDays >= 30) {
    const weeksAway = (stats.vacations.totalDays / 7).toFixed(1);
    insights.push({
      icon: Calendar,
      text: `You spent ${stats.vacations.totalDays} days away from home—that's about ${weeksAway} weeks of adventure!`,
    });
  } else if (stats.vacations.totalDays >= 14) {
    insights.push({
      icon: Calendar,
      text: `You spent ${stats.vacations.totalDays} days traveling this year.`,
    });
  }

  // Vacation type preference
  const topType = Object.entries(stats.vacations.byType)
    .sort((a, b) => b[1] - a[1])[0];
  if (topType && stats.vacations.total >= 2) {
    const typeName = VACATION_TYPE_NAMES[topType[0] as VacationType] || topType[0];
    const percentage = ((topType[1] / stats.vacations.total) * 100).toFixed(0);
    if (topType[1] >= 2) {
      insights.push({
        icon: Sparkles,
        text: `${typeName} vacations were your favorite, making up ${percentage}% of your trips.`,
      });
    }
  }

  // Budget insight
  if (stats.vacations.totalBudgetSpent > 0 && stats.vacations.avgBudgetPerDay > 0) {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(stats.vacations.avgBudgetPerDay);
    insights.push({
      icon: DollarSign,
      text: `You spent an average of ${formatted} per day while traveling.`,
    });
  }

  // Perfect trips (10/10 rated)
  const perfectTrips = stats.vacations.topRatedVacations.filter(v => v.rating === 10).length;
  if (perfectTrips >= 2) {
    insights.push({
      icon: Trophy,
      text: `You had ${perfectTrips} perfect 10/10 trips this year!`,
    });
  } else if (perfectTrips === 1) {
    const trip = stats.vacations.topRatedVacations.find(v => v.rating === 10);
    if (trip) {
      insights.push({
        icon: Trophy,
        text: `"${trip.title}" in ${trip.destination} was your perfect 10/10 trip!`,
      });
    }
  }

  // Seasonal travel patterns
  if (busiestMonth.count >= 2) {
    insights.push({
      icon: TrendingUp,
      text: `${busiestMonth.month} was your busiest travel month with ${busiestMonth.count} trips.`,
    });
  }

  // Summer vs winter travel
  const summerTrips = [5, 6, 7].reduce((sum, m) => sum + (stats.vacations.byMonth[m] || 0), 0);
  const winterTrips = [11, 0, 1].reduce((sum, m) => sum + (stats.vacations.byMonth[m] || 0), 0);
  
  if (summerTrips >= 2 && summerTrips > winterTrips) {
    insights.push({
      icon: Sparkles,
      text: "Summer was your peak travel season!",
    });
  } else if (winterTrips >= 2 && winterTrips > summerTrips) {
    insights.push({
      icon: Sparkles,
      text: "Winter was your favorite time to getaway!",
    });
  }

  // Top destinations
  if (stats.vacations.topDestinations.length >= 2) {
    const uniqueDestinations = stats.vacations.topDestinations.length;
    insights.push({
      icon: MapPin,
      text: `You explored ${uniqueDestinations} different destinations this year.`,
    });
  }

  return {
    busiestMonth: busiestMonth.count > 0 ? busiestMonth : null,
    insights,
  };
}
