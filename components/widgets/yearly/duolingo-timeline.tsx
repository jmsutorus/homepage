"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { YearlyStats } from "@/lib/data/yearly-data";
import { Languages, TrendingUp, Calendar, Flame, Sparkles } from "lucide-react";
import { cardEntrance } from "@/lib/animation-variants";

interface DuolingoTimelineProps {
  stats: YearlyStats;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

/**
 * Duolingo Timeline Component
 * Visualizes language learning journey through the year
 */
export function DuolingoTimeline({ stats }: DuolingoTimelineProps) {
  // Get days in each month for the year
  const getDaysInMonth = (monthIndex: number, year: number) => {
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  // Prepare monthly data with days in month for percentage calculation
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: MONTH_NAMES[i],
    count: stats.duolingo.byMonth[i] || 0,
    daysInMonth: getDaysInMonth(i, stats.year),
  }));

  // Calculate insights
  const insights = calculateDuolingoInsights(stats);

  // Calculate percentage of year completed
  const yearPercentage = ((stats.duolingo.totalDays / 365) * 100).toFixed(1);

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="show">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-[#58CC02]" />
              <CardTitle>Language Learning Journey</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.duolingo.totalDays} days
            </div>
          </div>
          <CardDescription>
            Your Duolingo progress through {stats.year}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-[#58CC02]/10 to-green-50 dark:from-[#58CC02]/20 dark:to-green-950/20 border border-[#58CC02]/30">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-[#58CC02]" />
                <div className="text-sm font-medium text-muted-foreground">Total Days</div>
              </div>
              <div className="text-3xl font-bold text-[#58CC02]">
                {stats.duolingo.totalDays}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {yearPercentage}% of the year
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <div className="text-sm font-medium text-muted-foreground">Longest Streak</div>
              </div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.duolingo.longestStreak}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                consecutive days
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div className="text-sm font-medium text-muted-foreground">Avg per Month</div>
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {(stats.duolingo.totalDays / 12).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                days per month
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-4 w-4 text-purple-500" />
                <div className="text-sm font-medium text-muted-foreground">Current Streak</div>
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.duolingo.currentStreak}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                days active
              </div>
            </div>
          </div>

          {/* Monthly Activity Chart */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Activity by Month</h4>
            <div className="space-y-2">
              {monthlyData.map((item, index) => {
                // Percentage is completions divided by days in that month
                const percentage = (item.count / item.daysInMonth) * 100;
                return (
                  <div key={item.month} className="flex items-center gap-3">
                    <div className="w-8 text-sm text-muted-foreground font-medium">
                      {item.month}
                    </div>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#58CC02] to-[#89E219]"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.1 + index * 0.05 }}
                      />
                    </div>
                    <div className="w-16 text-sm text-right font-medium">
                      {item.count}/{item.daysInMonth}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Insights</h4>
              <div className="grid gap-2">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm"
                  >
                    <insight.icon className="h-4 w-4 mt-0.5 text-[#58CC02] shrink-0" />
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
 * Calculate Duolingo insights from stats
 */
function calculateDuolingoInsights(stats: YearlyStats) {
  const insights: Array<{ icon: typeof Languages; text: string }> = [];

  // Total days insights
  if (stats.duolingo.totalDays >= 300) {
    insights.push({
      icon: Sparkles,
      text: `Incredible! You practiced Duolingo on ${stats.duolingo.totalDays} days this year - that's ${((stats.duolingo.totalDays / 365) * 100).toFixed(0)}% of the year! Absolute dedication!`,
    });
  } else if (stats.duolingo.totalDays >= 200) {
    insights.push({
      icon: TrendingUp,
      text: `You practiced on ${stats.duolingo.totalDays} days this year (${((stats.duolingo.totalDays / 365) * 100).toFixed(0)}% of the year). Outstanding commitment to language learning!`,
    });
  } else if (stats.duolingo.totalDays >= 100) {
    insights.push({
      icon: Languages,
      text: `${stats.duolingo.totalDays} days of language practice this year. Great consistency!`,
    });
  } else if (stats.duolingo.totalDays >= 30) {
    insights.push({
      icon: Languages,
      text: `You completed ${stats.duolingo.totalDays} Duolingo lessons this year.`,
    });
  }

  // Streak insights
  if (stats.duolingo.longestStreak >= 100) {
    insights.push({
      icon: Flame,
      text: `A ${stats.duolingo.longestStreak}-day streak! That's over 3 months of consecutive practice - legendary dedication!`,
    });
  } else if (stats.duolingo.longestStreak >= 30) {
    insights.push({
      icon: Flame,
      text: `Your longest streak was ${stats.duolingo.longestStreak} days! You maintained a whole month of consistent practice.`,
    });
  } else if (stats.duolingo.longestStreak >= 7) {
    insights.push({
      icon: Flame,
      text: `Your best streak was ${stats.duolingo.longestStreak} consecutive days of learning.`,
    });
  }

  // Current streak
  if (stats.duolingo.currentStreak >= 30) {
    insights.push({
      icon: TrendingUp,
      text: `You're on a ${stats.duolingo.currentStreak}-day streak right now! Keep it going!`,
    });
  } else if (stats.duolingo.currentStreak >= 7) {
    insights.push({
      icon: TrendingUp,
      text: `You have an active ${stats.duolingo.currentStreak}-day streak. Don't break it!`,
    });
  }

  // Monthly consistency insights
  const monthsWithActivity = Object.values(stats.duolingo.byMonth).filter(v => v > 0).length;
  if (monthsWithActivity === 12) {
    insights.push({
      icon: Calendar,
      text: "You practiced in all 12 months! Year-round dedication to language learning.",
    });
  } else if (monthsWithActivity >= 9) {
    insights.push({
      icon: Calendar,
      text: `You practiced in ${monthsWithActivity} out of 12 months. Excellent consistency throughout the year!`,
    });
  }

  // Best month
  const bestMonth = Object.entries(stats.duolingo.byMonth)
    .sort(([, a], [, b]) => b - a)[0];
  if (bestMonth && bestMonth[1] >= 20) {
    const monthName = ["January", "February", "March", "April", "May", "June",
                       "July", "August", "September", "October", "November", "December"][Number(bestMonth[0])];
    insights.push({
      icon: Sparkles,
      text: `${monthName} was your most active month with ${bestMonth[1]} days of practice!`,
    });
  }

  return insights;
}
