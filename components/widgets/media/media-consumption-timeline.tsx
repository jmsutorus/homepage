"use client";

import { useMemo, useState, useEffect } from "react";
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
  MediaTimelineData,
  MediaTimelineDataPoint,
  TimelinePeriod,
} from "@/lib/db/media";
import {
  Film,
  Tv,
  BookOpen,
  Gamepad2,
  TrendingUp,
  TrendingDown,
  Trophy,
  Star,
  Activity,
  Calendar,
} from "lucide-react";

// Color palette for media types
const TYPE_COLORS = {
  movies: "#ef4444", // red-500
  tv: "#8b5cf6", // violet-500
  books: "#3b82f6", // blue-500
  games: "#22c55e", // green-500
};

const TYPE_ICONS = {
  movie: Film,
  tv: Tv,
  book: BookOpen,
  game: Gamepad2,
};

const TYPE_LABELS: Record<string, string> = {
  movie: "Movies",
  tv: "TV Shows",
  book: "Books",
  game: "Games",
};

// Custom Tooltip component
 
function ChartTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload as MediaTimelineDataPoint;
    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm max-w-xs">
        <div className="grid gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Period
            </span>
            <span className="font-bold">{dataPoint.label}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Total Completed
            </span>
            <span className="font-bold text-foreground">
              {dataPoint.count} items
            </span>
          </div>
          {dataPoint.count > 0 && (
            <div className="grid grid-cols-2 gap-2 pt-1 border-t">
              {dataPoint.movies > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <div
                    className="w-2 h-2 rounded"
                    style={{ background: TYPE_COLORS.movies }}
                  />
                  <span>{dataPoint.movies} movies</span>
                </div>
              )}
              {dataPoint.tv > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <div
                    className="w-2 h-2 rounded"
                    style={{ background: TYPE_COLORS.tv }}
                  />
                  <span>{dataPoint.tv} TV</span>
                </div>
              )}
              {dataPoint.books > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <div
                    className="w-2 h-2 rounded"
                    style={{ background: TYPE_COLORS.books }}
                  />
                  <span>{dataPoint.books} books</span>
                </div>
              )}
              {dataPoint.games > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <div
                    className="w-2 h-2 rounded"
                    style={{ background: TYPE_COLORS.games }}
                  />
                  <span>{dataPoint.games} games</span>
                </div>
              )}
            </div>
          )}
          {dataPoint.avgRating && (
            <div className="flex flex-col pt-1 border-t">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Avg Rating
              </span>
              <span className="font-bold text-yellow-500 flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500" />
                {dataPoint.avgRating}
              </span>
            </div>
          )}
          {dataPoint.items.length > 0 && (
            <div className="flex flex-col pt-1 border-t">
              <span className="text-[0.70rem] uppercase text-muted-foreground mb-1">
                Recent Items
              </span>
              <div className="space-y-0.5 max-h-32 overflow-y-auto">
                {dataPoint.items.slice(0, 5).map((item) => {
                  const Icon = TYPE_ICONS[item.type];
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-1 text-xs text-muted-foreground"
                    >
                      <Icon className="h-3 w-3 shrink-0" />
                      <span className="truncate">{item.title}</span>
                      {item.rating && (
                        <span className="text-yellow-500 ml-auto shrink-0">
                          {item.rating}★
                        </span>
                      )}
                    </div>
                  );
                })}
                {dataPoint.items.length > 5 && (
                  <span className="text-xs text-muted-foreground">
                    +{dataPoint.items.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

interface MediaConsumptionTimelineProps {
  initialData?: MediaTimelineData;
}

export function MediaConsumptionTimeline({
  initialData,
}: MediaConsumptionTimelineProps) {
  const [period, setPeriod] = useState<TimelinePeriod>(
    initialData?.period || "month"
  );
  const [data, setData] = useState<MediaTimelineData | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);

  // Fetch data when period changes
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/media/timeline?period=${period}`);
        if (response.ok) {
          const newData = await response.json();
          setData(newData);
        }
      } catch (error) {
        console.error("Failed to fetch media timeline:", error);
      } finally {
        setIsLoading(false);
      }
    }

    // Fetch if the current data doesn't match the selected period
    if (!data || data.period !== period) {
      fetchData();
    }
  }, [period, data]);

  const handlePeriodChange = (newPeriod: TimelinePeriod) => {
    setPeriod(newPeriod);
  };

  // Calculate max Y value for chart scaling
  const maxValue = useMemo(() => {
    if (!data) return 5;
    return Math.max(...data.dataPoints.map((d) => d.count), 5);
  }, [data]);

  const periodLabel = useMemo(() => {
    switch (period) {
      case "week":
        return "weekly";
      case "month":
        return "monthly";
      case "year":
        return "yearly";
    }
  }, [period]);

  const hasData = data && data.stats.totalCompleted > 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Media Consumption Timeline
          </CardTitle>
          <CardDescription>Loading timeline data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Media Consumption Timeline
          </CardTitle>
          <CardDescription>
            Track your media consumption over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No completed media found. Mark some movies, TV shows, books, or
            games as completed to see your timeline.
          </div>
        </CardContent>
      </Card>
    );
  }

  const TopTypeIcon = TYPE_ICONS[data.stats.topType as keyof typeof TYPE_ICONS] || Film;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Media Consumption Timeline
            </CardTitle>
            <CardDescription>
              Media completed over time ({periodLabel} view)
            </CardDescription>
          </div>
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Calendar className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Avg/{periodLabel.slice(0, -2)}</p>
              <p className="text-lg font-bold">{data.stats.avgPerPeriod}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-xs text-muted-foreground">Best Period</p>
              <p className="text-lg font-bold">
                {data.stats.mostActiveMonth} ({data.stats.mostActiveMonthCount})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <TopTypeIcon className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-xs text-muted-foreground">Top Type</p>
              <p className="text-lg font-bold">
                {TYPE_LABELS[data.stats.topType] || data.stats.topType}
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
            <BarChart
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
                y={data.stats.avgPerPeriod}
                stroke="#888888"
                strokeDasharray="3 3"
                label={{
                  position: "right",
                  value: "Avg",
                  fill: "#888888",
                  fontSize: 10,
                }}
              />
              <Bar
                name="Movies"
                dataKey="movies"
                stackId="a"
                fill={TYPE_COLORS.movies}
                radius={[0, 0, 0, 0]}
                isAnimationActive={true}
                animationDuration={500}
              />
              <Bar
                name="TV Shows"
                dataKey="tv"
                stackId="a"
                fill={TYPE_COLORS.tv}
                radius={[0, 0, 0, 0]}
                isAnimationActive={true}
                animationDuration={500}
              />
              <Bar
                name="Books"
                dataKey="books"
                stackId="a"
                fill={TYPE_COLORS.books}
                radius={[0, 0, 0, 0]}
                isAnimationActive={true}
                animationDuration={500}
              />
              <Bar
                name="Games"
                dataKey="games"
                stackId="a"
                fill={TYPE_COLORS.games}
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center text-xs">
          <div className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded"
              style={{ background: TYPE_COLORS.movies }}
            />
            <span>Movies</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded"
              style={{ background: TYPE_COLORS.tv }}
            />
            <span>TV Shows</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded"
              style={{ background: TYPE_COLORS.books }}
            />
            <span>Books</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded"
              style={{ background: TYPE_COLORS.games }}
            />
            <span>Games</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-0 border-t-2 border-dashed border-muted-foreground" />
            <span>Average</span>
          </div>
        </div>

        {/* Insight */}
        <div className="p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground">
          <Star className="h-4 w-4 inline mr-2 text-yellow-500" />
          You&apos;ve completed{" "}
          <span className="font-medium text-foreground">
            {data.stats.totalCompleted}
          </span>{" "}
          media items with an average rating of{" "}
          <span className="font-medium text-foreground">
            {data.stats.avgRating}★
          </span>
          .{" "}
          {data.stats.trend > 10 &&
            "Your consumption is trending up - you're on a roll!"}
          {data.stats.trend < -10 &&
            "Your consumption has slowed down recently."}
          {data.stats.trend >= -10 &&
            data.stats.trend <= 10 &&
            "Your consumption has been steady."}
        </div>
      </CardContent>
    </Card>
  );
}
