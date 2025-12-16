"use client";

import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { YearlyStats } from "@/lib/data/yearly-data";
import { Dumbbell, TrendingUp, Zap, Calendar, Award } from "lucide-react";
import { cardEntrance } from "@/lib/animation-variants";
import { cn } from "@/lib/utils";

interface ExerciseTimelineProps {
  stats: YearlyStats;
}

/**
 * Exercise Journey Timeline Component
 * Visualizes fitness journey through the year
 */
export function ExerciseTimeline({ stats }: ExerciseTimelineProps) {
  // Transform monthly activity data for exercise visualization
  const monthlyExerciseData = stats.monthlyActivity.map((month, index) => {
    const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][index];
    return {
      month: monthName,
      workouts: month.exercises,
    };
  });

  // Calculate exercise insights
  const exerciseInsights = calculateExerciseInsights(stats);



  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="show">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-orange-500" />
              <CardTitle>Exercise Journey</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.exercises.total} workouts
            </div>
          </div>
          <CardDescription>
            Your fitness journey through {stats.year}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="h-4 w-4 text-orange-500" />
                <div className="text-sm font-medium text-muted-foreground">Total Workouts</div>
              </div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.exercises.total}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {(stats.exercises.total / 52).toFixed(1)} per week
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-purple-500" />
                <div className="text-sm font-medium text-muted-foreground">Active Time</div>
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(stats.exercises.totalDuration / 60)}h
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {Math.round(stats.exercises.totalDuration / stats.exercises.total)} min avg
              </div>
            </div>

            {stats.exercises.totalDistance > 0 && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <div className="text-sm font-medium text-muted-foreground">Distance</div>
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {(stats.exercises.totalDistance / 1609.34).toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  miles covered
                </div>
              </div>
            )}

            {exerciseInsights.bestMonth && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <div className="text-sm font-medium text-muted-foreground">Best Month</div>
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {exerciseInsights.bestMonth.month}
                </div>
                <div className="text-sm text-muted-foreground">
                  {exerciseInsights.bestMonth.count} workouts
                </div>
              </div>
            )}
          </div>

          {/* Monthly Workout Trend */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Monthly Workout Frequency</h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyExerciseData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="workouts"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ fill: "#f97316", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Workout Type Breakdown */}
          {stats.exercises.byType.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Activity Breakdown</h4>
              <div className="space-y-2">
                {stats.exercises.byType
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 8)
                  .map((type, index) => {
                    const percentage = (type.count / stats.exercises.total) * 100;
                    const colors = [
                      "bg-orange-500",
                      "bg-red-500",
                      "bg-pink-500",
                      "bg-purple-500",
                      "bg-blue-500",
                      "bg-cyan-500",
                      "bg-teal-500",
                      "bg-green-500",
                    ];
                    const color = colors[index % colors.length];

                    return (
                      <div key={type.type} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-3 h-3 rounded-full", color)} />
                            <span className="font-medium capitalize">{type.type}</span>
                          </div>
                          <span className="text-muted-foreground">
                            {type.count} times ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden ml-5">
                          <motion.div
                            className={cn("h-full rounded-full", color)}
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
          {exerciseInsights.insights.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Insights</h4>
              <div className="grid gap-2">
                {exerciseInsights.insights.map((insight, index) => (
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
 * Calculate exercise insights from stats
 */
function calculateExerciseInsights(stats: YearlyStats) {
  const insights: Array<{ icon: any; text: string }> = [];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Find best month
  let bestMonth = { month: "", count: 0, index: 0 };
  stats.monthlyActivity.forEach((month, index) => {
    if (month.exercises > bestMonth.count) {
      bestMonth = {
        month: monthNames[index],
        count: month.exercises,
        index,
      };
    }
  });

  // Generate insights
  const totalHours = Math.round(stats.exercises.totalDuration / 60);
  const avgWorkoutsPerWeek = (stats.exercises.total / 52).toFixed(1);
  const totalMiles = (stats.exercises.totalDistance / 1609.34).toFixed(1);

  // Distance-based insights (with fun comparisons)
  if (stats.exercises.totalDistance > 0) {
    const miles = parseFloat(totalMiles);

    if (miles >= 2000) {
      // Coast to coast USA is ~2,800 miles
      insights.push({
        icon: Award,
        text: `You covered ${totalMiles} miles! That's enough to cross the entire United States!`,
      });
    } else if (miles >= 1000) {
      // Major milestone
      insights.push({
        icon: Award,
        text: `You traveled ${totalMiles} miles on foot! That's like running from New York to Florida.`,
      });
    } else if (miles >= 500) {
      // Half-marathon equivalent distance per week
      insights.push({
        icon: TrendingUp,
        text: `${totalMiles} miles covered this year! That's roughly the distance from San Francisco to LA.`,
      });
    } else if (miles >= 250) {
      insights.push({
        icon: TrendingUp,
        text: `You logged ${totalMiles} miles of distance. That's 9-10 marathons worth!`,
      });
    } else if (miles >= 100) {
      insights.push({
        icon: Zap,
        text: `${totalMiles} miles covered! That's like running 4 marathons back-to-back.`,
      });
    } else if (miles >= 50) {
      insights.push({
        icon: Zap,
        text: `You ran ${totalMiles} miles this year. Almost 2 marathons worth of distance!`,
      });
    } else if (miles >= 26.2) {
      insights.push({
        icon: Zap,
        text: `${totalMiles} miles logged! That's at least one full marathon distance.`,
      });
    }

    // Find running-specific distance if available
    const runType = stats.exercises.byType.find(t =>
      t.type.toLowerCase().includes('run')
    );

    if (runType && runType.distance) {
      const runMiles = (runType.distance / 1609.34).toFixed(1);
      if (parseFloat(runMiles) >= 100) {
        insights.push({
          icon: Dumbbell,
          text: `You ran ${runMiles} miles specifically! Your running dedication is impressive.`,
        });
      }
    }
  }

  if (stats.exercises.total >= 365) {
    insights.push({
      icon: Award,
      text: "You averaged more than 1 workout per day! That's exceptional dedication to fitness.",
    });
  } else if (stats.exercises.total >= 200) {
    insights.push({
      icon: Calendar,
      text: `You completed ${stats.exercises.total} workouts this year, averaging ${avgWorkoutsPerWeek} per week.`,
    });
  } else if (stats.exercises.total >= 100) {
    insights.push({
      icon: Calendar,
      text: `You stayed consistent with ${stats.exercises.total} workouts throughout the year.`,
    });
  }

  // Total time insights
  if (totalHours >= 200) {
    insights.push({
      icon: Zap,
      text: `${totalHours} hours of active time! That's ${(totalHours / 24).toFixed(1)} full days of exercise.`,
    });
  } else if (totalHours >= 100) {
    insights.push({
      icon: Zap,
      text: `You invested ${totalHours} hours in your fitness this year.`,
    });
  }

  // Workout variety
  if (stats.exercises.byType.length >= 5) {
    const topType = stats.exercises.byType[0];
    insights.push({
      icon: Award,
      text: `You tried ${stats.exercises.byType.length} different workout types, with ${topType.type} being your favorite.`,
    });
  } else if (stats.exercises.byType.length >= 3) {
    insights.push({
      icon: Award,
      text: `You kept your routine varied with ${stats.exercises.byType.length} different types of workouts.`,
    });
  }

  // Best month insight
  if (bestMonth.count >= 20) {
    insights.push({
      icon: TrendingUp,
      text: `${bestMonth.month} was your most active month with ${bestMonth.count} workouts!`,
    });
  }

  // Average workout duration
  const avgDuration = Math.round(stats.exercises.totalDuration / stats.exercises.total);
  if (avgDuration >= 60) {
    insights.push({
      icon: Zap,
      text: `Your average workout lasted ${avgDuration} minutes, showing great endurance.`,
    });
  }

  // Consistency check
  const monthsWithWorkouts = stats.monthlyActivity.filter(m => m.exercises > 0).length;
  if (monthsWithWorkouts === 12) {
    insights.push({
      icon: Calendar,
      text: "You stayed active every single month of the year. Perfect consistency!",
    });
  }

  return {
    bestMonth: bestMonth.count > 0 ? bestMonth : null,
    insights,
  };
}
