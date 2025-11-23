"use client";

import { useMemo, useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
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
import type {
  TaskVelocityData,
  TaskVelocityDataPoint,
  VelocityPeriod,
} from "@/lib/db/tasks";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

// Custom Tooltip component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload as TaskVelocityDataPoint;
    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm">
        <div className="grid gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Period
            </span>
            <span className="font-bold">{dataPoint.label}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Completed
            </span>
            <span className="font-bold text-green-500">
              {dataPoint.completed} tasks
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Planned (Due)
            </span>
            <span className="font-bold text-blue-500">
              {dataPoint.planned} tasks
            </span>
          </div>
          {dataPoint.planned > 0 && (
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Completion Rate
              </span>
              <span className="font-bold">{dataPoint.completionRate}%</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

interface TaskVelocityChartProps {
  data: TaskVelocityData;
  onPeriodChange?: (period: VelocityPeriod) => void;
}

export function TaskVelocityChart({
  data,
  onPeriodChange,
}: TaskVelocityChartProps) {
  const [period, setPeriod] = useState<VelocityPeriod>(data.period);

  const handlePeriodChange = (newPeriod: VelocityPeriod) => {
    setPeriod(newPeriod);
    onPeriodChange?.(newPeriod);
  };

  // Calculate max Y value for chart scaling
  const maxValue = useMemo(() => {
    return Math.max(
      ...data.dataPoints.map((d) => Math.max(d.completed, d.planned)),
      5 // Minimum max of 5
    );
  }, [data.dataPoints]);

  const periodLabel = useMemo(() => {
    switch (period) {
      case "day":
        return "daily";
      case "week":
        return "weekly";
      case "month":
        return "monthly";
    }
  }, [period]);

  const hasData =
    data.stats.totalCompleted > 0 || data.stats.totalPlanned > 0;

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Task Velocity
          </CardTitle>
          <CardDescription>
            Track your task completion rate over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No task data available. Complete some tasks with due dates to see
            your velocity chart.
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
              <Activity className="h-5 w-5" />
              Task Velocity
            </CardTitle>
            <CardDescription>
              Tasks completed vs planned ({periodLabel} view)
            </CardDescription>
          </div>
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Zap className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Avg Completed</p>
              <p className="text-lg font-bold">
                {data.stats.avgCompleted}/{periodLabel.slice(0, -2)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Total Completed</p>
              <p className="text-lg font-bold">{data.stats.totalCompleted}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-xs text-muted-foreground">Best Period</p>
              <p className="text-lg font-bold">
                {data.stats.bestPeriod} ({data.stats.bestPeriodCount})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            {data.stats.trend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <div>
              <p className="text-xs text-muted-foreground">Trend</p>
              <p className="text-lg font-bold flex items-center gap-1">
                {data.stats.trend >= 0 ? "+" : ""}
                {data.stats.trend}%
                <Badge
                  variant={data.stats.trend >= 0 ? "default" : "destructive"}
                  className="text-[10px] px-1"
                >
                  {data.stats.trend >= 0 ? "Up" : "Down"}
                </Badge>
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data.dataPoints}
              margin={{ top: 20, right: 20, bottom: 5, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-muted"
              />
              <XAxis
                dataKey="label"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={true}
              />
              <YAxis
                domain={[0, maxValue + Math.ceil(maxValue * 0.1)]}
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={true}
                width={40}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <ReferenceLine
                y={data.stats.avgCompleted}
                stroke="#22c55e"
                strokeDasharray="3 3"
                label={{
                  position: "right",
                  value: "Avg",
                  fill: "#22c55e",
                  fontSize: 10,
                }}
              />
              <Bar
                name="Completed"
                dataKey="completed"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={500}
              />
              <Line
                name="Planned (Due)"
                type="monotone"
                dataKey="planned"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
                animationDuration={500}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>Tasks Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-blue-500" />
            <span>Tasks Due (Planned)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-0 border-t-2 border-dashed border-green-500" />
            <span>Average Completed</span>
          </div>
        </div>

        {/* Insight */}
        <div className="p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground">
          <Target className="h-4 w-4 inline mr-2" />
          {data.stats.totalPlanned > 0 ? (
            <>
              You completed{" "}
              <span className="font-medium text-foreground">
                {Math.round(
                  (data.stats.totalCompleted / data.stats.totalPlanned) * 100
                )}
                %
              </span>{" "}
              of planned tasks over this period.
              {data.stats.trend > 0 && " Your productivity is trending up!"}
              {data.stats.trend < 0 &&
                " Consider reviewing your task planning."}
            </>
          ) : (
            <>
              You completed{" "}
              <span className="font-medium text-foreground">
                {data.stats.totalCompleted}
              </span>{" "}
              tasks. Add due dates to tasks for better planning insights.
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
