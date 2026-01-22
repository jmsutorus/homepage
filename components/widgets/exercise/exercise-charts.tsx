"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, endOfWeek, eachWeekOfInterval, subMonths } from "date-fns";
import type { WorkoutActivity } from "@/lib/db/workout-activities";

interface ExerciseChartsProps {
  initialActivities: WorkoutActivity[];
}

type ChartType = "distance" | "time" | "count";

export function ExerciseCharts({ initialActivities = [] }: ExerciseChartsProps) {
  const [chartType, setChartType] = useState<ChartType>("distance");

  // Group activities by week for the last 3 months
  const chartData = useMemo(() => {
    if (initialActivities.length === 0) return [];

    const now = new Date();
    const threeMonthsAgo = subMonths(now, 3);

    // Get all weeks in the last 3 months
    const weeks = eachWeekOfInterval(
      { start: threeMonthsAgo, end: now },
      { weekStartsOn: 1 } // Monday
    );

    return weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

      // Filter activities for this week
      const weekActivities = initialActivities.filter((activity) => {
        const activityDate = new Date(activity.date);
        return activityDate >= weekStart && activityDate <= weekEnd;
      });

      const totalDistance = weekActivities.reduce((sum, a) => sum + (a.distance || 0), 0);
      const totalTime = weekActivities.reduce((sum, a) => sum + a.length, 0); // length is in minutes
      const count = weekActivities.length;

      return {
        week: format(weekStart, "MMM d"),
        distance: Number(totalDistance.toFixed(2)), // Miles
        time: Number((totalTime / 60).toFixed(1)), // Hours
        count,
      };
    });
  }, [initialActivities]);

  if (initialActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Trends</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No activities recorded in the last 3 months.
          </div>
        </CardContent>
      </Card>
    );
  }

  const getChartConfig = () => {
    switch (chartType) {
      case "distance":
        return {
          dataKey: "distance",
          label: "Distance (miles)",
          color: "#3b82f6", // Blue
        };
      case "time":
        return {
          dataKey: "time",
          label: "Time (hours)",
          color: "#10b981", // Green
        };
      case "count":
        return {
          dataKey: "count",
          label: "Activities",
          color: "#f59e0b", // Amber
        };
    }
  };

  const config = getChartConfig();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Activity Trends</CardTitle>
            <CardDescription>Your exercise activity over the last 3 months</CardDescription>
          </div>
          <Tabs value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
            <TabsList>
              <TabsTrigger value="distance">Distance</TabsTrigger>
              <TabsTrigger value="time">Time</TabsTrigger>
              <TabsTrigger value="count">Count</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="week"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Line
              type="monotone"
              dataKey={config.dataKey}
              stroke={config.color}
              strokeWidth={3}
              dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Summary stats below chart */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Distance</p>
            <p className="text-2xl font-bold">
              {initialActivities.reduce((sum, a) => sum + (a.distance || 0), 0).toFixed(1)} <span className="text-sm font-normal text-muted-foreground">mi</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Time</p>
            <p className="text-2xl font-bold">
              {(initialActivities.reduce((sum, a) => sum + a.length, 0) / 60).toFixed(1)}{" "}
              <span className="text-sm font-normal text-muted-foreground">h</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Activities</p>
            <p className="text-2xl font-bold">{initialActivities.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
