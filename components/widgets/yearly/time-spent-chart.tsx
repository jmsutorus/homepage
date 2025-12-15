"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { YearlyStats } from "@/lib/data/yearly-data";
import { Clock, Film, Tv, BookOpen, Gamepad2, Dumbbell } from "lucide-react";
import { cardEntrance } from "@/lib/animation-variants";

interface TimeSpentChartProps {
  stats: YearlyStats;
}

/**
 * Time Spent Chart Component
 * Visualizes time spent across TV, Movies, Books, Video Games, and Exercise
 */
export function TimeSpentChart({ stats }: TimeSpentChartProps) {
  const tvMinutes = stats.media.timeSpentByType.tv;
  const movieMinutes = stats.media.timeSpentByType.movie;
  const bookMinutes = stats.media.timeSpentByType.book;
  const gameMinutes = stats.media.timeSpentByType.game;
  const exerciseMinutes = stats.exercises.totalDuration;

  // Format minutes to hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Calculate total
  const total = tvMinutes + movieMinutes + bookMinutes + gameMinutes + exerciseMinutes;

  // Prepare data for pie chart (only include categories with time)
  const allData = [
    {
      name: "TV Shows",
      value: tvMinutes,
      hours: formatTime(tvMinutes),
      color: "#3b82f6", // Blue
      icon: Tv,
    },
    {
      name: "Movies",
      value: movieMinutes,
      hours: formatTime(movieMinutes),
      color: "#8b5cf6", // Purple
      icon: Film,
    },
    {
      name: "Books",
      value: bookMinutes,
      hours: formatTime(bookMinutes),
      color: "#10b981", // Green
      icon: BookOpen,
    },
    {
      name: "Video Games",
      value: gameMinutes,
      hours: formatTime(gameMinutes),
      color: "#ec4899", // Pink
      icon: Gamepad2,
    },
    {
      name: "Exercise",
      value: exerciseMinutes,
      hours: formatTime(exerciseMinutes),
      color: "#f97316", // Orange
      icon: Dumbbell,
    },
  ];

  // Filter out categories with no time
  const data = allData.filter(item => item.value > 0);
  const COLORS = data.map(item => item.color);

  // Custom label for the pie chart
  const renderLabel = (entry: any) => {
    return `${entry.name}: ${((entry.value / total) * 100).toFixed(0)}%`;
  };

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="show">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Time Spent</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              {formatTime(total)} total
            </div>
          </div>
          <CardDescription>
            How you spent your time across different activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pie Chart */}
            <div className="flex items-center justify-center w-full h-[300px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active }) => {
                      if (active) {
                        // Split data into two columns
                        const leftColumn = data.filter(item =>
                          item.name === "TV Shows" || item.name === "Movies" || item.name === "Books"
                        );
                        const rightColumn = data.filter(item =>
                          item.name === "Video Games" || item.name === "Exercise"
                        );

                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-sm min-w-[320px]">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                              {/* Left Column */}
                              <div className="space-y-2">
                                {leftColumn.map((item) => {
                                  const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
                                  return (
                                    <div key={item.name} className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="h-3 w-3 rounded-full"
                                          style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-sm font-medium">{item.name}</span>
                                      </div>
                                      <div className="text-xs text-muted-foreground ml-5">
                                        {item.hours} ({percentage}%)
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Right Column */}
                              <div className="space-y-2">
                                {rightColumn.map((item) => {
                                  const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
                                  return (
                                    <div key={item.name} className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="h-3 w-3 rounded-full"
                                          style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-sm font-medium">{item.name}</span>
                                      </div>
                                      <div className="text-xs text-muted-foreground ml-5">
                                        {item.hours} ({percentage}%)
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Stats Breakdown */}
            <div className="flex flex-col justify-center gap-3">
              {data.map((item) => {
                const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
                const Icon = item.icon;

                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" style={{ color: item.color }} />
                      <h3 className="text-sm font-medium">{item.name}</h3>
                    </div>
                    <div className="ml-6 flex items-baseline gap-2">
                      <p className="text-lg font-bold">{item.hours}</p>
                      <p className="text-xs text-muted-foreground">
                        ({percentage}%)
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
