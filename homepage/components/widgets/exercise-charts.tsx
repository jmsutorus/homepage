"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatDistance } from "@/lib/api/strava";
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, subMonths } from "date-fns";

interface Activity {
  id: number;
  distance: number;
  moving_time: number;
  start_date: string;
  type: string;
  sport_type: string;
}

type ChartType = "distance" | "time" | "count";

export function ExerciseCharts() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<ChartType>("distance");

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/strava/activities?limit=200");

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Group activities by week for the last 3 months
  const chartData = useMemo(() => {
    if (activities.length === 0) return [];

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
      const weekActivities = activities.filter((activity) => {
        const activityDate = new Date(activity.start_date);
        return activityDate >= weekStart && activityDate <= weekEnd;
      });

      const totalDistance = weekActivities.reduce((sum, a) => sum + a.distance, 0);
      const totalTime = weekActivities.reduce((sum, a) => sum + a.moving_time, 0);
      const count = weekActivities.length;

      return {
        week: format(weekStart, "MMM d"),
        distance: Math.round(totalDistance / 1000), // Convert to km
        time: Math.round(totalTime / 3600), // Convert to hours
        count,
      };
    });
  }, [activities]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Trends</CardTitle>
          <CardDescription>Loading chart data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Trends</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No activities found. Sync with Strava to see your trends.
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
          label: "Distance (km)",
          color: "hsl(var(--chart-1))",
        };
      case "time":
        return {
          dataKey: "time",
          label: "Time (hours)",
          color: "hsl(var(--chart-2))",
        };
      case "count":
        return {
          dataKey: "count",
          label: "Activities",
          color: "hsl(var(--chart-3))",
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
          <BarChart data={chartData}>
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
            <Bar dataKey={config.dataKey} fill={config.color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Summary stats below chart */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Distance</p>
            <p className="text-2xl font-bold">
              {formatDistance(
                activities.reduce((sum, a) => sum + a.distance, 0)
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Time</p>
            <p className="text-2xl font-bold">
              {Math.round(
                activities.reduce((sum, a) => sum + a.moving_time, 0) / 3600
              )}{" "}
              h
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Activities</p>
            <p className="text-2xl font-bold">{activities.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
