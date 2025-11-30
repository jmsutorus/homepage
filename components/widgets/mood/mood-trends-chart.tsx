"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  TooltipProps,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MoodEntry } from "@/lib/db/mood";
import { format, parseISO } from "date-fns";

interface MoodTrendsChartProps {
  data: MoodEntry[];
  year: number;
}

export function MoodTrendsChart({ data, year }: MoodTrendsChartProps) {
  // Process data for the chart
  const chartData = useMemo(() => {
    // Sort by date ascending
    const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));
    
    // Calculate Linear Regression
    const n = sortedData.length;
    let slope = 0;
    let intercept = 0;

    if (n > 1) {
      let sumX = 0;
      let sumY = 0;
      let sumXY = 0;
      let sumXX = 0;

      sortedData.forEach((entry) => {
        const x = new Date(entry.date).getTime();
        const y = Number(entry.rating);
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
      });

      slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      intercept = (sumY - slope * sumX) / n;
    }

    // Calculate 7-day moving average and Trend
    return sortedData.map((entry, index, array) => {
      const start = Math.max(0, index - 6);
      const subset = array.slice(start, index + 1);
      const validSubset = subset.filter(e => !isNaN(Number(e.rating)));
      const avg = validSubset.length > 0 
        ? validSubset.reduce((a, b) => a + Number(b.rating), 0) / validSubset.length 
        : 0;

      const x = new Date(entry.date).getTime();
      const trend = n > 1 ? slope * x + intercept : Number(entry.rating);

      return {
        date: entry.date,
        rating: isNaN(Number(entry.rating)) ? 0 : Number(entry.rating),
        movingAvg: avg,
        trend: trend,
        note: entry.note,
        formattedDate: format(parseISO(entry.date), "MMM d"),
      };
    });
  }, [data]);

  // Calculate average mood
  const averageMood = useMemo(() => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, curr) => acc + (isNaN(Number(curr.rating)) ? 0 : Number(curr.rating)), 0);
    return sum / data.length;
  }, [data]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Trends</CardTitle>
          <CardDescription>Average mood over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No mood data available for this year.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Trends</CardTitle>
        <CardDescription>
          Average mood: {averageMood.toFixed(1)} / 5.0
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis
                dataKey="formattedDate"
                stroke="#888888"
                fontSize={12}
                tickLine={true}
                axisLine={true}
                minTickGap={30}
              />
              <YAxis
                domain={[0, 6]}
                ticks={[1, 2, 3, 4, 5]}
                stroke="#888888"
                fontSize={12}
                tickLine={true}
                axisLine={true}
                width={30}
                padding={{ top: 10, bottom: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine y={averageMood} stroke="#8884d8" strokeDasharray="3 3" label={{ position: 'right', value: 'Avg', fill: '#8884d8', fontSize: 10 }} />
              <Line
                name="Daily Mood"
                type="monotone"
                dataKey="rating"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 4, fill: "#2563eb" }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
                connectNulls={true}
              />
              <Line
                name="7-Day Avg"
                type="monotone"
                dataKey="movingAvg"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                connectNulls={true}
                strokeDasharray="5 5"
              />
              <Line
                name="Trend"
                type="monotone"
                dataKey="trend"
                stroke="#dc2626"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                connectNulls={true}
                strokeDasharray="3 3"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Date
            </span>
            <span className="font-bold text-muted-foreground">
              {dataPoint.formattedDate}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Mood
            </span>
            <span className="font-bold text-muted-foreground">
              {dataPoint.rating}/5
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              7-Day Avg
            </span>
            <span className="font-bold text-muted-foreground">
              {dataPoint.movingAvg.toFixed(1)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Trend
            </span>
            <span className="font-bold text-muted-foreground">
              {dataPoint.trend.toFixed(1)}
            </span>
          </div>
        </div>
        {dataPoint.note && (
          <div className="mt-2 border-t pt-2">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Note
            </span>
            <p className="text-xs text-muted-foreground max-w-[200px] truncate">
              {dataPoint.note}
            </p>
          </div>
        )}
      </div>
    );
  }
  return null;
};
