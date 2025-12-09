"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { YearlyStats } from "@/lib/data/yearly-data";
import { CheckCircle2, Target, TrendingUp, Sparkles, Zap, Calendar, Repeat } from "lucide-react";
import { cardEntrance } from "@/lib/animation-variants";

interface HabitsTimelineProps {
  stats: YearlyStats;
}

/**
 * Habits Timeline Component
 * Visualizes habit tracking journey through the year
 */
export function HabitsTimeline({ stats }: HabitsTimelineProps) {
  // Calculate habit insights
  const habitInsights = calculateHabitInsights(stats);

  // Prepare habits by frequency data
  const habitsByFrequency = Object.entries(stats.habits.byFrequency)
    .sort(([, a], [, b]) => b - a)
    .map(([frequency, count]) => ({
      frequency: formatFrequency(frequency),
      count,
    }));

  const FREQUENCY_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];

  // Calculate completion rate
  const completionRate = stats.habits.total > 0
    ? (stats.habits.completed / stats.habits.total) * 100
    : 0;

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="show">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-emerald-500" />
              <CardTitle>Habits Journey</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.habits.totalCompletions} completions
            </div>
          </div>
          <CardDescription>
            Your habit tracking journey through {stats.year}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 mb-2">
                <Repeat className="h-4 w-4 text-emerald-500" />
                <div className="text-sm font-medium text-muted-foreground">Habits Created</div>
              </div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.habits.total}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stats.habits.active} currently active
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <div className="text-sm font-medium text-muted-foreground">Habits Completed</div>
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.habits.completed}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {completionRate.toFixed(0)}% met their target
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-500" />
                <div className="text-sm font-medium text-muted-foreground">Total Completions</div>
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.habits.totalCompletions}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {(stats.habits.totalCompletions / 365).toFixed(1)} per day
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <div className="text-sm font-medium text-muted-foreground">Completion Rate</div>
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {completionRate.toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                of habits met target
              </div>
            </div>
          </div>

          {/* Habits by Frequency */}
          {habitsByFrequency.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Habits by Frequency</h4>
              <div className="space-y-3">
                {habitsByFrequency.map((item, index) => {
                  const percentage = (item.count / stats.habits.total) * 100;
                  const color = FREQUENCY_COLORS[index % FREQUENCY_COLORS.length];

                  return (
                    <div key={item.frequency} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-medium">{item.frequency}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {item.count} ({percentage.toFixed(0)}%)
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
          {habitInsights.insights.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Insights</h4>
              <div className="grid gap-2">
                {habitInsights.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm"
                  >
                    <insight.icon className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
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
 * Format frequency for display
 */
function formatFrequency(frequency: string): string {
  const mapping: Record<string, string> = {
    'daily': 'Daily',
    'every_other_day': 'Every Other Day',
    'three_times_a_week': '3x per Week',
    'once_a_week': 'Once a Week',
    'every_week': 'Weekly',
    'monthly': 'Monthly',
  };
  return mapping[frequency] || frequency.charAt(0).toUpperCase() + frequency.slice(1);
}

/**
 * Calculate habit insights from stats
 */
function calculateHabitInsights(stats: YearlyStats) {
  const insights: Array<{ icon: any; text: string }> = [];

  // Habit creation insights
  if (stats.habits.total >= 20) {
    insights.push({
      icon: Repeat,
      text: `You created ${stats.habits.total} habits this year! You're committed to building multiple positive routines.`,
    });
  } else if (stats.habits.total >= 10) {
    insights.push({
      icon: Repeat,
      text: `${stats.habits.total} habits created. You're actively working on self-improvement!`,
    });
  } else if (stats.habits.total >= 5) {
    insights.push({
      icon: Repeat,
      text: `You established ${stats.habits.total} new habits this year.`,
    });
  } else if (stats.habits.total >= 1) {
    insights.push({
      icon: Sparkles,
      text: `${stats.habits.total} ${stats.habits.total === 1 ? 'habit' : 'habits'} created this year.`,
    });
  }

  // Completion rate insights
  const completionRate = stats.habits.total > 0
    ? (stats.habits.completed / stats.habits.total) * 100
    : 0;

  if (completionRate >= 80) {
    insights.push({
      icon: Trophy,
      text: `${completionRate.toFixed(0)}% of your habits met their targets! Outstanding consistency and dedication.`,
    });
  } else if (completionRate >= 60) {
    insights.push({
      icon: TrendingUp,
      text: `${stats.habits.completed} out of ${stats.habits.total} habits met their targets (${completionRate.toFixed(0)}%). Strong follow-through!`,
    });
  } else if (completionRate >= 40) {
    insights.push({
      icon: Target,
      text: `${completionRate.toFixed(0)}% completion rate. Keep pushing to build stronger habit streaks!`,
    });
  } else if (stats.habits.total > 0) {
    insights.push({
      icon: Sparkles,
      text: `${stats.habits.completed} habits met their targets. Building habits takes time and consistency!`,
    });
  }

  // Total completions insights
  if (stats.habits.totalCompletions >= 2000) {
    insights.push({
      icon: Zap,
      text: `${stats.habits.totalCompletions} total habit completions! That's ${(stats.habits.totalCompletions / 365).toFixed(1)} completions per day on average. Incredible dedication!`,
    });
  } else if (stats.habits.totalCompletions >= 1000) {
    insights.push({
      icon: CheckCircle2,
      text: `You logged ${stats.habits.totalCompletions} habit completions, averaging ${(stats.habits.totalCompletions / 365).toFixed(1)} per day. Excellent consistency!`,
    });
  } else if (stats.habits.totalCompletions >= 500) {
    insights.push({
      icon: CheckCircle2,
      text: `${stats.habits.totalCompletions} habit completions tracked this year.`,
    });
  } else if (stats.habits.totalCompletions >= 100) {
    insights.push({
      icon: Sparkles,
      text: `You completed ${stats.habits.totalCompletions} habit check-ins throughout the year.`,
    });
  }

  // Active habits insights
  if (stats.habits.active >= 10) {
    insights.push({
      icon: Repeat,
      text: `You're currently maintaining ${stats.habits.active} active habits. You're juggling multiple positive routines!`,
    });
  } else if (stats.habits.active >= 5) {
    insights.push({
      icon: Repeat,
      text: `${stats.habits.active} habits currently active. Great balance of routine building!`,
    });
  } else if (stats.habits.active >= 1) {
    insights.push({
      icon: TrendingUp,
      text: `You're actively working on ${stats.habits.active} ${stats.habits.active === 1 ? 'habit' : 'habits'}.`,
    });
  }

  // Frequency insights
  const frequencyEntries = Object.entries(stats.habits.byFrequency);
  if (frequencyEntries.length > 0) {
    const topFrequency = frequencyEntries.sort(([, a], [, b]) => b - a)[0];
    const frequencyName = formatFrequency(topFrequency[0]);
    const percentage = ((topFrequency[1] / stats.habits.total) * 100).toFixed(0);

    if (topFrequency[0] === 'daily' && Number(percentage) >= 60) {
      insights.push({
        icon: Calendar,
        text: `${percentage}% of your habits are daily routines. You're committed to consistent daily practice!`,
      });
    } else if (topFrequency[1] > 1) {
      insights.push({
        icon: Calendar,
        text: `Most of your habits (${percentage}%) follow a ${frequencyName.toLowerCase()} schedule.`,
      });
    }
  }

  // Diversity insights
  const uniqueFrequencies = Object.keys(stats.habits.byFrequency).length;
  if (uniqueFrequencies >= 4) {
    insights.push({
      icon: Sparkles,
      text: `You use ${uniqueFrequencies} different habit frequencies, showing a flexible approach to routine building.`,
    });
  } else if (uniqueFrequencies >= 2) {
    insights.push({
      icon: Sparkles,
      text: `You balance habits across ${uniqueFrequencies} different frequency patterns.`,
    });
  }

  // Comparison insights
  if (stats.habits.completed > 0 && stats.habits.active === 0) {
    insights.push({
      icon: Target,
      text: `You completed ${stats.habits.completed} habits but currently have none active. Consider starting new routines!`,
    });
  } else if (stats.habits.active > stats.habits.completed * 2 && stats.habits.completed > 0) {
    insights.push({
      icon: Sparkles,
      text: `You have more active habits (${stats.habits.active}) than completed ones (${stats.habits.completed}). Focus on consistency to meet your targets!`,
    });
  }

  return {
    insights,
  };
}

function Trophy({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}
