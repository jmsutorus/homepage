"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CalendarDayData } from "@/lib/db/calendar";
import { ChevronLeft, ChevronRight, Calendar, Smile, Frown, Meh } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface MiniCalendarProps {
  year: number;
  month: number;
  calendarData: Record<string, CalendarDayData>;
  colors: any;
}

const DAYS_OF_WEEK = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Mood icon mapping
const MOOD_ICONS: Record<number, { icon: typeof Smile; color: string }> = {
  1: { icon: Frown, color: "text-red-500" },
  2: { icon: Frown, color: "text-orange-500" },
  3: { icon: Meh, color: "text-yellow-500" },
  4: { icon: Smile, color: "text-green-500" },
  5: { icon: Smile, color: "text-emerald-500" },
};

export function MiniCalendar({ year, month, calendarData, colors }: MiniCalendarProps) {
  const router = useRouter();

  // Get first day of month and total days
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0-6 (Sun-Sat)
  const daysInMonth = new Date(year, month, 0).getDate();

  // Generate array of days to display
  const days: (number | null)[] = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  // Calculate previous and next month
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const handlePrevMonth = () => {
    router.push(`/?year=${prevYear}&month=${prevMonth}`);
  };

  const handleNextMonth = () => {
    router.push(`/?year=${nextYear}&month=${nextMonth}`);
  };

  // Get today's date in local timezone (not UTC)
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendar
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/calendar">View Full</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="h-8 w-8 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-sm font-semibold">
            {MONTH_NAMES[month - 1]} {year}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="h-8 w-8 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {DAYS_OF_WEEK.map((day, i) => (
            <div
              key={`header-${i}`}
              className="text-center text-xs font-medium text-muted-foreground p-1"
            >
              {day}
            </div>
          ))}

          {/* Day cells */}
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayData = calendarData[dateStr];
            const isToday = dateStr === todayStr;

            // Get mood icon
            const hasMood = dayData?.mood !== null && dayData?.mood !== undefined;
            const MoodIcon = hasMood && dayData?.mood ? MOOD_ICONS[dayData.mood.rating].icon : null;
            const moodColor = hasMood && dayData?.mood ? MOOD_ICONS[dayData.mood.rating].color : null;

            // Check for different types of content
            const hasActivities = (dayData?.activities.length ?? 0) > 0;
            const hasWorkouts = (dayData?.workoutActivities.length ?? 0) > 0;
            const hasMedia = (dayData?.media.length ?? 0) > 0;
            const hasTasks = (dayData?.tasks.length ?? 0) > 0;
            const hasEvents = (dayData?.events.length ?? 0) > 0;
            const hasParks = (dayData?.parks.length ?? 0) > 0;
            const hasJournals = (dayData?.journals.length ?? 0) > 0;
            const hasGithub = (dayData?.githubEvents.length ?? 0) > 0;
            const hasHabits = (dayData?.habitCompletions.length ?? 0) > 0;
            const hasDuolingo = dayData?.duolingoCompleted ?? false;

            return (
              <button
                key={dateStr}
                onClick={() => router.push(`/daily/${dateStr}`)}
                className={cn(
                  "aspect-square rounded-md border bg-card flex flex-col items-start justify-between p-1.5 text-xs font-medium transition-all cursor-pointer",
                  "hover:bg-accent hover:shadow-md",
                  isToday && "ring-2 ring-primary"
                )}
              >
                <div className="flex items-start justify-between w-full">
                  <span className="text-xs">{day}</span>
                  {MoodIcon && moodColor && (
                    <MoodIcon className={cn("h-3 w-3", moodColor)} />
                  )}
                </div>

                {/* Color indicators */}
                <div className="flex gap-0.5 flex-wrap">
                  {hasActivities && (
                    <div className={cn("w-1.5 h-1.5 rounded-full", colors.activity?.bg)} title="Strava Activities" />
                  )}
                  {hasWorkouts && (
                    <div className={cn("w-1.5 h-1.5 rounded-full", colors.workout?.upcoming?.bg)} title="Workouts" />
                  )}
                  {hasMedia && (
                    <div className={cn("w-1.5 h-1.5 rounded-full", colors.media?.bg)} title="Media" />
                  )}
                  {hasTasks && (
                    <div className={cn("w-1.5 h-1.5 rounded-full", colors.task?.upcoming?.bg)} title="Tasks" />
                  )}
                  {hasEvents && (
                    <div className={cn("w-1.5 h-1.5 rounded-full", colors.event?.bg)} title="Events" />
                  )}
                  {hasParks && (
                    <div className={cn("w-1.5 h-1.5 rounded-full", colors.park?.bg)} title="Parks" />
                  )}
                  {hasJournals && (
                    <div className={cn("w-1.5 h-1.5 rounded-full", colors.journal?.bg)} title="Journals" />
                  )}
                  {hasGithub && (
                    <div className={cn("w-1.5 h-1.5 rounded-full", colors.github?.bg)} title="Github Activity" />
                  )}
                  {hasHabits && (
                    <div className={cn("w-1.5 h-1.5 rounded-full", colors.habit?.bg || "bg-purple-500")} title="Habits Completed" />
                  )}
                  {hasDuolingo && (
                    <div className={cn("w-1.5 h-1.5 rounded-full", colors.duolingo?.bg || "bg-[#58CC02]")} title="Duolingo" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legends */}
        <div className="space-y-2 pt-2 border-t">
          {/* Mood Legend */}
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <span>Mood:</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => {
                const MoodIcon = MOOD_ICONS[rating].icon;
                const color = MOOD_ICONS[rating].color;
                return (
                  <div key={rating} title={`${rating}/5`}>
                    <MoodIcon className={cn("h-4 w-4", color)} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Type Legend */}
          <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", colors.activity?.bg)} />
              <span>Activities</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", colors.workout?.upcoming?.bg)} />
              <span>Workouts</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", colors.media?.bg)} />
              <span>Media</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", colors.task?.upcoming?.bg)} />
              <span>Tasks</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", colors.event?.bg)} />
              <span>Events</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", colors.park?.bg)} />
              <span>Parks</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", colors.journal?.bg)} />
              <span>Journals</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", colors.github?.bg)} />
              <span>GitHub</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", colors.habit?.bg || "bg-purple-500")} />
              <span>Habits</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", colors.duolingo?.bg || "bg-[#58CC02]")} />
              <span>Duolingo</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
