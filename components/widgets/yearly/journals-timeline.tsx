"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { YearlyStats } from "@/lib/data/yearly-data";
import { BookOpen, TrendingUp, Calendar, Sparkles, PenLine, FileText } from "lucide-react";
import { cardEntrance } from "@/lib/animation-variants";

interface JournalsTimelineProps {
  stats: YearlyStats;
}

/**
 * Journals Journey Timeline Component
 * Visualizes journaling journey through the year
 */
export function JournalsTimeline({ stats }: JournalsTimelineProps) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Transform monthly activity data for journals visualization
  const monthlyJournalsData = stats.monthlyActivity.map((item) => ({
    ...item,
    name: monthNames[item.month],
    count: item.journals,
  }));

  // Calculate journal insights
  const journalInsights = calculateJournalInsights(stats);

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="show">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              <CardTitle>Journaling Journey</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.journals.total} entries
            </div>
          </div>
          <CardDescription>
            Your journaling journey through {stats.year}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-indigo-500" />
                <div className="text-sm font-medium text-muted-foreground">Total Journals</div>
              </div>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.journals.total}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {(stats.journals.total / 12).toFixed(1)} per month
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <div className="text-sm font-medium text-muted-foreground">Daily Journals</div>
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.journals.dailyCount}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {((stats.journals.dailyCount / stats.journals.total) * 100).toFixed(0)}% of total
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-purple-500" />
                <div className="text-sm font-medium text-muted-foreground">General Journals</div>
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.journals.generalCount}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {((stats.journals.generalCount / stats.journals.total) * 100).toFixed(0)}% of total
              </div>
            </div>

            {journalInsights.bestMonth && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <div className="text-sm font-medium text-muted-foreground">Best Month</div>
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {journalInsights.bestMonth.month}
                </div>
                <div className="text-sm text-muted-foreground">
                  {journalInsights.bestMonth.count} entries
                </div>
              </div>
            )}
          </div>

          {/* Monthly Journaling Trend */}
          {stats.journals.total > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Monthly Journaling</h4>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyJournalsData}>
                    <defs>
                      <linearGradient id="colorJournals" x1="0" y1="0" x2="0" y2="1">
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
                      fill="url(#colorJournals)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Insights */}
          {journalInsights.insights.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Insights</h4>
              <div className="grid gap-2">
                {journalInsights.insights.map((insight, index) => (
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
 * Calculate journal insights from stats
 */
function calculateJournalInsights(stats: YearlyStats) {
  const insights: Array<{ icon: any; text: string }> = [];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Find best month for journaling
  let bestMonth = { month: "", count: 0, index: 0 };
  stats.monthlyActivity.forEach((month, index) => {
    if (month.journals > bestMonth.count) {
      bestMonth = {
        month: monthNames[index],
        count: month.journals,
        index,
      };
    }
  });

  // Generate insights
  const avgPerMonth = (stats.journals.total / 12).toFixed(1);

  // Volume insights
  if (stats.journals.total >= 365) {
    insights.push({
      icon: BookOpen,
      text: `You wrote more than 1 journal entry per day! That's ${stats.journals.total} entries this year. Amazing dedication to journaling!`,
    });
  } else if (stats.journals.total >= 200) {
    insights.push({
      icon: BookOpen,
      text: `${stats.journals.total} journal entries written, averaging ${avgPerMonth} per month. You're a dedicated journaler!`,
    });
  } else if (stats.journals.total >= 100) {
    insights.push({
      icon: BookOpen,
      text: `You wrote ${stats.journals.total} journal entries this year, maintaining a steady pace.`,
    });
  } else if (stats.journals.total >= 52) {
    insights.push({
      icon: Calendar,
      text: `${stats.journals.total} journal entries completed, averaging more than 1 per week.`,
    });
  } else if (stats.journals.total >= 12) {
    insights.push({
      icon: Calendar,
      text: `${stats.journals.total} journal entries written throughout the year.`,
    });
  }

  // Daily vs General insights
  const dailyPercentage = (stats.journals.dailyCount / stats.journals.total) * 100;
  if (dailyPercentage >= 80) {
    insights.push({
      icon: Calendar,
      text: `${dailyPercentage.toFixed(0)}% of your journals were daily entries. You have a strong daily reflection habit!`,
    });
  } else if (dailyPercentage >= 50) {
    insights.push({
      icon: PenLine,
      text: `You balanced daily journals (${stats.journals.dailyCount}) with general entries (${stats.journals.generalCount}).`,
    });
  } else if (stats.journals.generalCount > stats.journals.dailyCount) {
    insights.push({
      icon: FileText,
      text: `You preferred general journal entries (${stats.journals.generalCount}) over daily logs (${stats.journals.dailyCount}).`,
    });
  }

  // Best month insight
  if (bestMonth.count >= 50) {
    insights.push({
      icon: TrendingUp,
      text: `${bestMonth.month} was your peak journaling month with ${bestMonth.count} entries!`,
    });
  } else if (bestMonth.count >= 20) {
    insights.push({
      icon: TrendingUp,
      text: `${bestMonth.month} was your most active journaling month with ${bestMonth.count} entries.`,
    });
  } else if (bestMonth.count >= 10) {
    insights.push({
      icon: Calendar,
      text: `${bestMonth.month} was your best month for journaling with ${bestMonth.count} entries.`,
    });
  }

  // Consistency check
  const monthsWithJournals = stats.monthlyActivity.filter(m => m.journals > 0).length;
  if (monthsWithJournals === 12) {
    insights.push({
      icon: Calendar,
      text: "You journaled every single month. Perfect consistency in your writing habit!",
    });
  } else if (monthsWithJournals >= 10) {
    insights.push({
      icon: Calendar,
      text: `You maintained your journaling practice in ${monthsWithJournals} out of 12 months.`,
    });
  } else if (monthsWithJournals >= 6) {
    insights.push({
      icon: Sparkles,
      text: `You journaled in ${monthsWithJournals} different months throughout the year.`,
    });
  }

  // Seasonal insights based on best month
  if (bestMonth.index >= 5 && bestMonth.index <= 7) { // June, July, August
    insights.push({
      icon: Sparkles,
      text: "Summer was your favorite season for journaling!",
    });
  } else if (bestMonth.index >= 8 && bestMonth.index <= 10) { // Sept, Oct, Nov
    insights.push({
      icon: Sparkles,
      text: "Fall was your peak season for reflection and writing!",
    });
  } else if (bestMonth.index <= 2) { // Jan, Feb, Mar
    insights.push({
      icon: Sparkles,
      text: "You started the year strong with active journaling in the winter months!",
    });
  }

  // Daily journal milestone
  if (stats.journals.dailyCount >= 365) {
    insights.push({
      icon: Calendar,
      text: "You completed a full year of daily journaling! That's an incredible achievement!",
    });
  } else if (stats.journals.dailyCount >= 200) {
    insights.push({
      icon: Calendar,
      text: `You wrote ${stats.journals.dailyCount} daily journal entries, capturing over half the year in daily reflections.`,
    });
  }

  return {
    bestMonth: bestMonth.count > 0 ? bestMonth : null,
    insights,
  };
}
