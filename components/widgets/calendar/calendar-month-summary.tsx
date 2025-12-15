"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CalendarDaySummary } from "@/lib/db/calendar";
import {
  Film,
  Activity,
  Calendar,
  Trees,
  BookOpen,
  Dumbbell,
  Github,
  CheckSquare,
  Smile,
  ExternalLink,
  Target,
  Languages,
} from "lucide-react";

interface MonthSummaryProps {
  summaryData: Map<string, CalendarDaySummary>;
  year: number;
  month: number;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function CalendarMonthSummary({
  summaryData,
  year,
  month,
}: MonthSummaryProps) {
  // Calculate totals from summary data
  let totalMedia = 0;
  let totalActivities = 0;
  let totalEvents = 0;
  let totalParks = 0;
  let totalJournals = 0;
  let totalWorkouts = 0;
  let totalGithubEvents = 0;
  let totalHabits = 0;
  let totalTasksCompleted = 0;
  let totalGoalsCompleted = 0;
  let totalDuolingo = 0;
  let moodSum = 0;
  let moodCount = 0;

  // Use a Set to track unique event first titles (rough deduplication)
  const seenEventTitles = new Set<string>();

  summaryData.forEach((daySummary) => {
    totalMedia += daySummary.mediaCount;
    totalActivities += daySummary.activityCount;
    totalParks += daySummary.parkCount;
    totalJournals += daySummary.journalCount;
    totalWorkouts += daySummary.workoutCounts.completed;
    totalGithubEvents += daySummary.githubEventCount;
    totalHabits += daySummary.habitCount;
    totalTasksCompleted += daySummary.taskCounts.completed;
    totalGoalsCompleted += daySummary.goalCounts?.completed ?? 0;
    if (daySummary.duolingoCompleted) {
      totalDuolingo += 1;
    }

    // Rough event deduplication based on title
    if (daySummary.eventFirstTitle && !seenEventTitles.has(daySummary.eventFirstTitle)) {
      seenEventTitles.add(daySummary.eventFirstTitle);
      totalEvents += 1;
    } else if (daySummary.eventCount > 0 && !daySummary.eventFirstTitle) {
      totalEvents += daySummary.eventCount;
    }

    if (daySummary.moodRating !== null) {
      moodSum += daySummary.moodRating;
      moodCount++;
    }
  });

  const avgMood = moodCount > 0 ? (moodSum / moodCount).toFixed(1) : null;

  const hasAnyData = totalMedia > 0 || totalActivities > 0 || totalEvents > 0 ||
    totalParks > 0 || totalJournals > 0 || totalWorkouts > 0 ||
    totalGithubEvents > 0 || totalHabits > 0 || totalTasksCompleted > 0 ||
    totalGoalsCompleted > 0 || totalDuolingo > 0 || moodCount > 0;

  if (!hasAnyData) {
    return null;
  }

  const detailLink = `/calendar/${year}-${String(month).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {MONTH_NAMES[month - 1]} {year} Summary
          </h2>
          <p className="text-muted-foreground">
            Overview of your month&apos;s activities
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={detailLink} className="flex items-center gap-2">
            View Details
            <ExternalLink className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Average Mood */}
            {avgMood && (
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-yellow-500/10">
                    <Smile className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{avgMood}</p>
                    <p className="text-sm text-muted-foreground">Avg Mood</p>
                  </div>
                </div>
              </div>
            )}

            {/* Media */}
            {totalMedia > 0 && (
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-500/10">
                    <Film className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalMedia}</p>
                    <p className="text-sm text-muted-foreground">Media</p>
                  </div>
                </div>
              </div>
            )}

            {/* Activities */}
            {totalActivities > 0 && (
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-orange-500/10">
                    <Activity className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalActivities}</p>
                    <p className="text-sm text-muted-foreground">Activities</p>
                  </div>
                </div>
              </div>
            )}

            {/* Workouts */}
            {totalWorkouts > 0 && (
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-500/10">
                    <Dumbbell className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalWorkouts}</p>
                    <p className="text-sm text-muted-foreground">Workouts</p>
                  </div>
                </div>
              </div>
            )}

            {/* Parks */}
            {totalParks > 0 && (
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-emerald-500/10">
                    <Trees className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalParks}</p>
                    <p className="text-sm text-muted-foreground">Parks</p>
                  </div>
                </div>
              </div>
            )}

            {/* Journals */}
            {totalJournals > 0 && (
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-500/10">
                    <BookOpen className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalJournals}</p>
                    <p className="text-sm text-muted-foreground">Journals</p>
                  </div>
                </div>
              </div>
            )}

            {/* Events */}
            {totalEvents > 0 && (
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-indigo-500/10">
                    <Calendar className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalEvents}</p>
                    <p className="text-sm text-muted-foreground">Events</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tasks Completed */}
            {totalTasksCompleted > 0 && (
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-500/10">
                    <CheckSquare className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalTasksCompleted}</p>
                    <p className="text-sm text-muted-foreground">Tasks Done</p>
                  </div>
                </div>
              </div>
            )}

            {/* Goals Completed */}
            {totalGoalsCompleted > 0 && (
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-teal-500/10">
                    <Target className="h-5 w-5 text-teal-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalGoalsCompleted}</p>
                    <p className="text-sm text-muted-foreground">Goals Done</p>
                  </div>
                </div>
              </div>
            )}

            {/* Habits */}
            {totalHabits > 0 && (
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-pink-500/10">
                    <CheckSquare className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalHabits}</p>
                    <p className="text-sm text-muted-foreground">Habits</p>
                  </div>
                </div>
              </div>
            )}

            {/* Duolingo */}
            {totalDuolingo > 0 && (
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-[#58CC02]/10">
                    <Languages className="h-5 w-5 text-[#58CC02]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalDuolingo}</p>
                    <p className="text-sm text-muted-foreground">Duolingo Days</p>
                  </div>
                </div>
              </div>
            )}

            {/* GitHub */}
            {totalGithubEvents > 0 && (
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-slate-500/10">
                    <Github className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalGithubEvents}</p>
                    <p className="text-sm text-muted-foreground">GitHub</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
