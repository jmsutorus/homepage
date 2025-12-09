"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { YearlyStats } from "@/lib/data/yearly-data";
import { TreePine, MapPin, Calendar, TrendingUp, Compass } from "lucide-react";
import { cardEntrance } from "@/lib/animation-variants";

interface ParksTimelineProps {
  stats: YearlyStats;
}

/**
 * Parks Journey Timeline Component
 * Visualizes parks and outdoor adventures through the year
 */
export function ParksTimeline({ stats }: ParksTimelineProps) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Transform monthly activity data for parks visualization
  const monthlyParksData = stats.monthlyActivity.map((item) => ({
    ...item,
    name: monthNames[item.month],
    count: item.parks,
  }));

  // Calculate park insights
  const parkInsights = calculateParkInsights(stats);

  // Prepare category data for display
  const categoryData = Object.entries(stats.parks.byCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count,
    }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="show">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TreePine className="h-5 w-5 text-green-500" />
              <CardTitle>Parks & Adventures</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.parks.total} parks
            </div>
          </div>
          <CardDescription>
            Your outdoor adventures through {stats.year}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <TreePine className="h-4 w-4 text-green-500" />
                <div className="text-sm font-medium text-muted-foreground">Parks Visited</div>
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.parks.total}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {(stats.parks.total / 12).toFixed(1)} per month
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                <div className="text-sm font-medium text-muted-foreground">States Explored</div>
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.parks.states.length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stats.parks.states.length > 0 ? stats.parks.states.join(', ') : 'None'}
              </div>
            </div>

            {parkInsights.bestMonth && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <div className="text-sm font-medium text-muted-foreground">Best Month</div>
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {parkInsights.bestMonth.month}
                </div>
                <div className="text-sm text-muted-foreground">
                  {parkInsights.bestMonth.count} parks
                </div>
              </div>
            )}
          </div>

          {/* Monthly Visits Trend */}
          {stats.parks.total > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Monthly Visits</h4>
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyParksData}>
                    <defs>
                      <linearGradient id="colorParks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                      itemStyle={{ color: "#10b981" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorParks)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Park Categories */}
          {categoryData.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Park Categories</h4>
              <div className="space-y-3">
                {categoryData.map((cat, index) => {
                  const percentage = (cat.count / stats.parks.total) * 100;
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

          {/* Insights */}
          {parkInsights.insights.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Insights</h4>
              <div className="grid gap-2">
                {parkInsights.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm"
                  >
                    <insight.icon className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
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
 * Calculate park insights from stats
 */
function calculateParkInsights(stats: YearlyStats) {
  const insights: Array<{ icon: any; text: string }> = [];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Find best month for parks
  let bestMonth = { month: "", count: 0, index: 0 };
  stats.monthlyActivity.forEach((month, index) => {
    if (month.parks > bestMonth.count) {
      bestMonth = {
        month: monthNames[index],
        count: month.parks,
        index,
      };
    }
  });

  // Generate insights
  const stateCount = stats.parks.states.length;

  // Volume insights
  if (stats.parks.total >= 20) {
    insights.push({
      icon: TreePine,
      text: `You visited ${stats.parks.total} parks this year! You're a true outdoor enthusiast!`,
    });
  } else if (stats.parks.total >= 10) {
    insights.push({
      icon: TreePine,
      text: `${stats.parks.total} parks explored. Great dedication to outdoor adventures!`,
    });
  } else if (stats.parks.total >= 5) {
    insights.push({
      icon: TreePine,
      text: `You visited ${stats.parks.total} parks this year.`,
    });
  }

  // State insights
  if (stateCount >= 10) {
    insights.push({
      icon: MapPin,
      text: `You explored parks in ${stateCount} different states! Amazing travel coverage!`,
    });
  } else if (stateCount >= 5) {
    insights.push({
      icon: MapPin,
      text: `Parks visited across ${stateCount} states: ${stats.parks.states.join(', ')}.`,
    });
  } else if (stateCount >= 3) {
    insights.push({
      icon: MapPin,
      text: `You explored ${stateCount} states: ${stats.parks.states.join(', ')}.`,
    });
  } else if (stateCount > 0) {
    insights.push({
      icon: MapPin,
      text: `All parks visited in ${stats.parks.states.join(', ')}.`,
    });
  }

  // Category insights
  const categoryEntries = Object.entries(stats.parks.byCategory);
  if (categoryEntries.length > 0) {
    const topCategory = categoryEntries.sort(([, a], [, b]) => b - a)[0];
    const categoryName = topCategory[0].charAt(0).toUpperCase() + topCategory[0].slice(1);

    if (topCategory[1] > 1) {
      insights.push({
        icon: Compass,
        text: `${categoryName} parks were your favorite, with ${topCategory[1]} visits.`,
      });
    }
  }

  // Best month insight
  if (bestMonth.count >= 5) {
    insights.push({
      icon: TrendingUp,
      text: `${bestMonth.month} was your peak adventure month with ${bestMonth.count} park visits!`,
    });
  } else if (bestMonth.count >= 3) {
    insights.push({
      icon: Calendar,
      text: `${bestMonth.month} was your most active month with ${bestMonth.count} park visits.`,
    });
  }

  // Consistency check
  const monthsWithParks = stats.monthlyActivity.filter(m => m.parks > 0).length;
  if (monthsWithParks === 12) {
    insights.push({
      icon: Calendar,
      text: "You visited parks every single month. Perfect consistency in your outdoor adventures!",
    });
  } else if (monthsWithParks >= 6) {
    insights.push({
      icon: Calendar,
      text: `You explored parks in ${monthsWithParks} different months throughout the year.`,
    });
  }

  // Seasonal insight based on best month
  if (bestMonth.index >= 5 && bestMonth.index <= 7) { // June, July, August
    insights.push({
      icon: Calendar,
      text: "Summer was your favorite season for park visits!",
    });
  } else if (bestMonth.index >= 8 && bestMonth.index <= 10) { // Sept, Oct, Nov
    insights.push({
      icon: Calendar,
      text: "Fall was your peak season for outdoor adventures!",
    });
  }

  return {
    bestMonth: bestMonth.count > 0 ? bestMonth : null,
    insights,
  };
}
