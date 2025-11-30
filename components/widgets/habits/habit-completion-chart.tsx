"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { HabitCompletionChartData } from "@/lib/db/habits";
import { Flame, Trophy, TrendingUp, Target } from "lucide-react";

// Custom Tooltip component (defined outside to avoid creating during render)
 
function ChartTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm">
        <div className="grid gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Week
            </span>
            <span className="font-bold">{dataPoint.weekLabel}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Completions
            </span>
            <span className="font-bold">
              {dataPoint.completions} / {dataPoint.target} target
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Rate
            </span>
            <span className="font-bold">{dataPoint.rate}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

interface HabitCompletionChartProps {
  data: HabitCompletionChartData[];
}

export function HabitCompletionChart({ data }: HabitCompletionChartProps) {
  const [selectedHabitId, setSelectedHabitId] = useState<string>(
    data.length > 0 ? data[0].habitId.toString() : ""
  );

  const selectedHabit = useMemo(() => {
    return data.find((h) => h.habitId.toString() === selectedHabitId);
  }, [data, selectedHabitId]);

  // Calculate overall statistics for selected habit
  const overallStats = useMemo(() => {
    if (!selectedHabit) return null;

    const { weeklyData, stats } = selectedHabit;
    const totalCompletions = weeklyData.reduce(
      (sum, w) => sum + w.completions,
      0
    );
    const totalExpected = weeklyData.reduce((sum, w) => sum + w.target, 0);
    const avgRate =
      totalExpected > 0
        ? Math.round((totalCompletions / totalExpected) * 100)
        : 0;

    // Calculate trend (comparing last 4 weeks vs first 4 weeks)
    const firstHalf = weeklyData.slice(0, 6);
    const secondHalf = weeklyData.slice(6);
    const firstHalfRate =
      firstHalf.reduce((sum, w) => sum + w.rate, 0) / firstHalf.length || 0;
    const secondHalfRate =
      secondHalf.reduce((sum, w) => sum + w.rate, 0) / secondHalf.length || 0;
    const trend = secondHalfRate - firstHalfRate;

    return {
      avgRate,
      trend,
      totalCompletions,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
    };
  }, [selectedHabit]);

  // Get bar color based on completion rate
  const getBarColor = (rate: number) => {
    if (rate >= 100) return "#22c55e"; // green-500
    if (rate >= 70) return "#3b82f6"; // blue-500
    if (rate >= 50) return "#eab308"; // yellow-500
    return "#ef4444"; // red-500
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Habit Completion Rate
          </CardTitle>
          <CardDescription>
            Weekly completion trends over the last 12 weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No active habits to display. Create a habit to see completion
            trends.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Habit Completion Rate
            </CardTitle>
            <CardDescription>
              Weekly completion trends over the last 12 weeks
            </CardDescription>
          </div>
          <Select value={selectedHabitId} onValueChange={setSelectedHabitId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select habit" />
            </SelectTrigger>
            <SelectContent>
              {data.map((habit) => (
                <SelectItem
                  key={habit.habitId}
                  value={habit.habitId.toString()}
                >
                  {habit.habitTitle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Summary */}
        {overallStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Target className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Avg Rate</p>
                <p className="text-lg font-bold">{overallStats.avgRate}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Flame className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Current Streak</p>
                <p className="text-lg font-bold">
                  {overallStats.currentStreak} days
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-xs text-muted-foreground">Best Streak</p>
                <p className="text-lg font-bold">
                  {overallStats.longestStreak} days
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <TrendingUp
                className={`h-4 w-4 ${overallStats.trend >= 0 ? "text-green-500" : "text-red-500"}`}
              />
              <div>
                <p className="text-xs text-muted-foreground">Trend</p>
                <p className="text-lg font-bold flex items-center gap-1">
                  {overallStats.trend >= 0 ? "+" : ""}
                  {Math.round(overallStats.trend)}%
                  <Badge
                    variant={
                      overallStats.trend >= 0 ? "default" : "destructive"
                    }
                    className="text-[10px] px-1"
                  >
                    {overallStats.trend >= 0 ? "Improving" : "Declining"}
                  </Badge>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        {selectedHabit && (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={selectedHabit.weeklyData}
                margin={{ top: 20, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-muted"
                />
                <XAxis
                  dataKey="weekLabel"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={true}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={true}
                  width={40}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <ReferenceLine
                  y={overallStats?.avgRate || 0}
                  stroke="#8884d8"
                  strokeDasharray="3 3"
                  label={{
                    position: "right",
                    value: "Avg",
                    fill: "#8884d8",
                    fontSize: 10,
                  }}
                />
                <Bar
                  name="Completion Rate"
                  dataKey="rate"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={500}
                >
                  {selectedHabit.weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.rate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-center text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>100%+ (Excellent)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>70-99% (Good)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span>50-69% (Fair)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>&lt;50% (Needs Work)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
