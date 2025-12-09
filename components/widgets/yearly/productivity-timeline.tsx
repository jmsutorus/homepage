"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { YearlyStats } from "@/lib/data/yearly-data";
import { Target, CheckCircle2, ListTodo, TrendingUp, Sparkles, Zap, Trophy } from "lucide-react";
import { cardEntrance } from "@/lib/animation-variants";

interface ProductivityTimelineProps {
  stats: YearlyStats;
}

/**
 * Productivity Timeline Component
 * Visualizes tasks and goals journey through the year
 */
export function ProductivityTimeline({ stats }: ProductivityTimelineProps) {
  // Calculate productivity insights
  const productivityInsights = calculateProductivityInsights(stats);

  // Prepare tasks by priority data
  const tasksByPriority = Object.entries(stats.tasks.byPriority)
    .sort(([, a], [, b]) => b - a)
    .map(([priority, count]) => ({
      priority: priority.charAt(0).toUpperCase() + priority.slice(1),
      count,
    }));

  // Prepare goals by status data
  const goalsByStatus = Object.entries(stats.goals.byStatus)
    .map(([status, count]) => ({
      status: status.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  // Prepare tasks by category data if available
  const tasksByCategory = Object.entries(stats.tasks.byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count,
    }));

  const PRIORITY_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
  const STATUS_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#6b7280'];
  const CATEGORY_COLORS = ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63', '#0c4a6e', '#082f49', '#083344'];

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="show">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <CardTitle>Productivity Journey</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.tasks.completed} tasks · {stats.goals.completed} goals
            </div>
          </div>
          <CardDescription>
            Your tasks and goals journey through {stats.year}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <ListTodo className="h-4 w-4 text-blue-500" />
                <div className="text-sm font-medium text-muted-foreground">Tasks Completed</div>
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.tasks.completed}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stats.tasks.completionRate.toFixed(0)}% completion rate
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-500" />
                <div className="text-sm font-medium text-muted-foreground">Goals Achieved</div>
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.goals.completed}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stats.goals.completionRate.toFixed(0)}% completion rate
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <div className="text-sm font-medium text-muted-foreground">Goals In Progress</div>
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.goals.inProgress}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                actively working on
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <div className="text-sm font-medium text-muted-foreground">Total Goals</div>
              </div>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.goals.total}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                set this year
              </div>
            </div>
          </div>

          {/* Tasks by Priority */}
          {tasksByPriority.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Tasks by Priority</h4>
              <div className="space-y-3">
                {tasksByPriority.map((item, index) => {
                  const percentage = (item.count / stats.tasks.total) * 100;
                  const color = PRIORITY_COLORS[index % PRIORITY_COLORS.length];

                  return (
                    <div key={item.priority} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-medium">{item.priority}</span>
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

          {/* Goals by Status */}
          {goalsByStatus.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Goals by Status</h4>
              <div className="space-y-3">
                {goalsByStatus.map((item, index) => {
                  const percentage = (item.count / stats.goals.total) * 100;
                  const color = STATUS_COLORS[index % STATUS_COLORS.length];

                  return (
                    <div key={item.status} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-medium">{item.status}</span>
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

          {/* Tasks by Category */}
          {tasksByCategory.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Tasks by Category</h4>
              <div className="space-y-3">
                {tasksByCategory.map((item, index) => {
                  const percentage = (item.count / stats.tasks.total) * 100;
                  const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];

                  return (
                    <div key={item.category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-medium">{item.category}</span>
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
          {productivityInsights.insights.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Insights</h4>
              <div className="grid gap-2">
                {productivityInsights.insights.map((insight, index) => (
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
 * Calculate productivity insights from stats
 */
function calculateProductivityInsights(stats: YearlyStats) {
  const insights: Array<{ icon: any; text: string }> = [];

  // Task completion insights
  if (stats.tasks.completed >= 500) {
    insights.push({
      icon: ListTodo,
      text: `You completed ${stats.tasks.completed} tasks this year! That's exceptional productivity with ${stats.tasks.completionRate.toFixed(0)}% completion rate.`,
    });
  } else if (stats.tasks.completed >= 250) {
    insights.push({
      icon: ListTodo,
      text: `${stats.tasks.completed} tasks completed with a ${stats.tasks.completionRate.toFixed(0)}% completion rate. Great execution!`,
    });
  } else if (stats.tasks.completed >= 100) {
    insights.push({
      icon: ListTodo,
      text: `You completed ${stats.tasks.completed} tasks this year, maintaining a ${stats.tasks.completionRate.toFixed(0)}% completion rate.`,
    });
  } else if (stats.tasks.completed >= 50) {
    insights.push({
      icon: CheckCircle2,
      text: `${stats.tasks.completed} tasks completed throughout the year.`,
    });
  }

  // Task completion rate insights
  if (stats.tasks.completionRate >= 90) {
    insights.push({
      icon: TrendingUp,
      text: `Your ${stats.tasks.completionRate.toFixed(0)}% task completion rate shows excellent follow-through!`,
    });
  } else if (stats.tasks.completionRate >= 75) {
    insights.push({
      icon: TrendingUp,
      text: `You completed ${stats.tasks.completionRate.toFixed(0)}% of your tasks. Strong execution!`,
    });
  } else if (stats.tasks.completionRate >= 50) {
    insights.push({
      icon: Sparkles,
      text: `${stats.tasks.completionRate.toFixed(0)}% of tasks completed. Room to improve your completion rate!`,
    });
  }

  // Goal achievement insights
  if (stats.goals.completed >= 20) {
    insights.push({
      icon: Target,
      text: `You achieved ${stats.goals.completed} goals this year! Outstanding goal-setting and execution.`,
    });
  } else if (stats.goals.completed >= 10) {
    insights.push({
      icon: Target,
      text: `${stats.goals.completed} goals achieved out of ${stats.goals.total} set. Great progress!`,
    });
  } else if (stats.goals.completed >= 5) {
    insights.push({
      icon: Target,
      text: `You completed ${stats.goals.completed} goals this year.`,
    });
  }

  // Goal completion rate insights
  if (stats.goals.completionRate >= 80) {
    insights.push({
      icon: Trophy,
      text: `${stats.goals.completionRate.toFixed(0)}% goal completion rate! You're excellent at achieving what you set out to do.`,
    });
  } else if (stats.goals.completionRate >= 60) {
    insights.push({
      icon: Trophy,
      text: `You achieved ${stats.goals.completionRate.toFixed(0)}% of your goals. Strong performance!`,
    });
  } else if (stats.goals.completionRate >= 40 && stats.goals.total >= 5) {
    insights.push({
      icon: Sparkles,
      text: `${stats.goals.completionRate.toFixed(0)}% of goals completed. Keep pushing toward your targets!`,
    });
  }

  // Goals in progress insights
  if (stats.goals.inProgress >= 10) {
    insights.push({
      icon: TrendingUp,
      text: `You have ${stats.goals.inProgress} goals in progress. You're actively working on multiple objectives!`,
    });
  } else if (stats.goals.inProgress >= 5) {
    insights.push({
      icon: TrendingUp,
      text: `${stats.goals.inProgress} goals currently in progress. Steady momentum on your objectives.`,
    });
  } else if (stats.goals.inProgress >= 1) {
    insights.push({
      icon: Sparkles,
      text: `You're actively working on ${stats.goals.inProgress} ${stats.goals.inProgress === 1 ? 'goal' : 'goals'}.`,
    });
  }

  // Combined productivity insight
  const totalCompleted = stats.tasks.completed + stats.goals.completed;
  const avgCompletionRate = (stats.tasks.completionRate + stats.goals.completionRate) / 2;

  if (totalCompleted >= 300 && avgCompletionRate >= 75) {
    insights.push({
      icon: Zap,
      text: `You completed ${totalCompleted} tasks and goals combined with an average ${avgCompletionRate.toFixed(0)}% completion rate. You're a productivity powerhouse!`,
    });
  } else if (totalCompleted >= 150 && avgCompletionRate >= 65) {
    insights.push({
      icon: Zap,
      text: `${totalCompleted} combined completions (tasks + goals) with ${avgCompletionRate.toFixed(0)}% average completion rate. Impressive productivity!`,
    });
  }

  // Priority insights
  const priorityEntries = Object.entries(stats.tasks.byPriority);
  if (priorityEntries.length > 0) {
    const topPriority = priorityEntries.sort(([, a], [, b]) => b - a)[0];
    const priorityName = topPriority[0].charAt(0).toUpperCase() + topPriority[0].slice(1);
    const percentage = ((topPriority[1] / stats.tasks.total) * 100).toFixed(0);

    if (priorityName.toLowerCase() === 'high' && Number(percentage) >= 40) {
      insights.push({
        icon: ListTodo,
        text: `${percentage}% of your tasks were high priority. You're focused on important work!`,
      });
    } else if (priorityName.toLowerCase() === 'low' && Number(percentage) >= 50) {
      insights.push({
        icon: Sparkles,
        text: `Most tasks (${percentage}%) were low priority. You might benefit from tackling more high-impact work.`,
      });
    }
  }

  // Category insights
  const categoryEntries = Object.entries(stats.tasks.byCategory);
  if (categoryEntries.length >= 5) {
    insights.push({
      icon: Sparkles,
      text: `You managed tasks across ${categoryEntries.length} different categories, showing diverse productivity.`,
    });
  }

  return {
    insights,
  };
}
