"use client";

import { memo } from "react";
import { Card } from "@/components/ui/card";
import type { CalendarDaySummary } from "@/lib/db/calendar";
import { Smile, Frown, Meh, Activity, Film, Tv, Book, Gamepad2, CheckSquare, Clock, X, Plus, Calendar, Trees, BookOpen, Dumbbell, Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CalendarDayCellProps {
  day: number;
  date: string;
  summary?: CalendarDaySummary;
  isToday: boolean;
  isSelected: boolean;
  onOpenMoodModal: (date: string) => void;
  onDayClick: (date: string) => void;
  colors: any;
}

// Mood icon mapping
const MOOD_ICONS: Record<number, { icon: typeof Smile; color: string }> = {
  1: { icon: Frown, color: "text-red-500" },
  2: { icon: Frown, color: "text-orange-500" },
  3: { icon: Meh, color: "text-yellow-500" },
  4: { icon: Smile, color: "text-green-500" },
  5: { icon: Smile, color: "text-emerald-500" },
};

// Media type icon mapping
const MEDIA_ICONS: Record<string, typeof Film> = {
  movie: Film,
  tv: Tv,
  book: Book,
  game: Gamepad2,
};

function CalendarDayCellComponent({
  day,
  date,
  summary,
  isToday,
  isSelected,
  onOpenMoodModal,
  onDayClick,
  colors,
}: CalendarDayCellProps) {
  const router = useRouter();

  // Use summary data for lightweight rendering
  const hasMood = summary?.moodRating !== null && summary?.moodRating !== undefined;
  const hasMedia = (summary?.mediaCount ?? 0) > 0;
  const hasTasks = (summary?.taskCounts.completed ?? 0) + (summary?.taskCounts.overdue ?? 0) + (summary?.taskCounts.upcoming ?? 0) > 0;
  const hasEvents = (summary?.eventCount ?? 0) > 0;
  const hasParks = (summary?.parkCount ?? 0) > 0;
  const hasJournals = (summary?.journalCount ?? 0) > 0;
  const hasGithub = (summary?.githubEventCount ?? 0) > 0;
  const hasHabits = (summary?.habitCount ?? 0) > 0;
  const hasActivities = (summary?.activityCount ?? 0) > 0;
  const hasWorkoutActivities = (summary?.workoutCounts.upcoming ?? 0) + (summary?.workoutCounts.completed ?? 0) > 0;

  const hasAnyData = hasMood || hasActivities || hasMedia || hasTasks || hasEvents || hasParks || hasJournals || hasWorkoutActivities || hasGithub || hasHabits;

  // Get mood icon
  const MoodIcon = hasMood && summary?.moodRating ? MOOD_ICONS[summary.moodRating]?.icon : null;
  const moodColor = hasMood && summary?.moodRating ? MOOD_ICONS[summary.moodRating]?.color : "";

  // Get today's date for comparison
  const today = new Date().toISOString().split("T")[0];

  // Check if this day is today or in the past and doesn't have a journal
  const isPastOrToday = date <= today;
  const shouldShowAddJournal = isPastOrToday && !hasJournals;

  // Use pre-calculated task counts from summary
  const completedTasksCount = summary?.taskCounts.completed ?? 0;
  const overdueTasksCount = summary?.taskCounts.overdue ?? 0;
  const upcomingTasksCount = summary?.taskCounts.upcoming ?? 0;

  return (
    <Card
      onClick={() => router.push(`/daily/${date}`)}
      className={cn(
        "min-h-[120px] p-2 flex flex-col hover:shadow-md transition-all cursor-pointer",
        isToday && "ring-2 ring-primary",
        isSelected && "ring-2 ring-blue-500 shadow-lg"
      )}
    >
      {/* Day number */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            "text-sm font-semibold",
            isToday && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
          )}
        >
          {day}
        </span>

        {/* Mood indicator or Add Journal button */}
        {hasMood && MoodIcon ? (
          <MoodIcon className={cn("h-4 w-4", moodColor)} />
        ) : shouldShowAddJournal ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/journals/new?type=daily&date=${date}`);
            }}
            className="cursor-pointer h-4 w-4 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors"
            title="Add daily journal for this day"
            aria-label={`Add daily journal for ${date}`}
          >
            <Plus className="h-3 w-3 text-muted-foreground" />
          </button>
        ) : null}
      </div>

      {/* Content */}
      {hasAnyData ? (
        <div className="flex-1 space-y-1 text-xs overflow-hidden">
          {/* Strava Activities (not linked to workouts) */}
          {hasActivities && (
            <div className="flex items-center gap-1">
              <Activity className={cn("h-3 w-3 flex-shrink-0", colors.activity?.text)} />
              <span className={cn("truncate", colors.activity?.text)}>
                {summary!.activityCount} {summary!.activityCount === 1 ? "activity" : "activities"}
              </span>
            </div>
          )}

          {/* Upcoming Workout Activities */}
          {(summary?.workoutCounts.upcoming ?? 0) > 0 && (
            <div className="flex items-center gap-1">
              <Dumbbell className={cn("h-3 w-3 flex-shrink-0", colors.workout?.upcoming?.text)} />
              <span className={cn("truncate", colors.workout?.upcoming?.text)}>
                {summary!.workoutCounts.firstUpcomingTime} - {summary!.workoutCounts.firstUpcomingType}
                {summary!.workoutCounts.upcoming > 1 && ` +${summary!.workoutCounts.upcoming - 1}`}
              </span>
            </div>
          )}

          {/* Completed Workout Activities */}
          {(summary?.workoutCounts.completed ?? 0) > 0 && (summary?.workoutCounts.upcoming ?? 0) === 0 && (
            <div className="flex items-center gap-1">
              <Dumbbell className={cn("h-3 w-3 flex-shrink-0", colors.workout?.completed?.text)} />
              <span className={cn("truncate", colors.workout?.completed?.text)}>
                {(() => {
                  if (summary!.workoutCounts.firstCompletedName) {
                    const distance = summary!.workoutCounts.firstCompletedDistance
                      ? `${(summary!.workoutCounts.firstCompletedDistance / 1000).toFixed(1)}km`
                      : '';
                    return `${summary!.workoutCounts.firstCompletedName}${distance ? ` - ${distance}` : ''}${summary!.workoutCounts.completed > 1 ? ` +${summary!.workoutCounts.completed - 1}` : ''}`;
                  }
                  return `${summary!.workoutCounts.completed} ${summary!.workoutCounts.completed === 1 ? 'workout' : 'workouts'} completed`;
                })()}
              </span>
            </div>
          )}

          {/* Media completed */}
          {hasMedia && (
            <div className="flex items-center gap-1">
              {(() => {
                const mediaType = summary!.mediaFirstType;
                const MediaIcon = mediaType ? MEDIA_ICONS[mediaType] || Film : Film;
                return <MediaIcon className={cn("h-3 w-3 flex-shrink-0", colors.media?.text)} />;
              })()}
              <span className={cn("truncate", colors.media?.text)}>
                {summary!.mediaFirstTitle}
                {summary!.mediaCount > 1 && ` +${summary!.mediaCount - 1}`}
              </span>
            </div>
          )}

          {/* Parks visited */}
          {hasParks && (
            <div className="flex items-center gap-1">
              <Trees className={cn("h-3 w-3 flex-shrink-0", colors.park?.text)} />
              <span className={cn("truncate", colors.park?.text)}>
                {summary!.parkFirstTitle}
                {summary!.parkCount > 1 && ` +${summary!.parkCount - 1}`}
              </span>
            </div>
          )}

          {/* Journals */}
          {hasJournals && (
            <div className="flex items-center gap-1">
              <BookOpen className={cn("h-3 w-3 flex-shrink-0", colors.journal?.text)} />
              <span className={cn("truncate", colors.journal?.text)}>
                {summary!.journalFirstTitle}
                {summary!.journalCount > 1 && ` +${summary!.journalCount - 1}`}
              </span>
            </div>
          )}

          {/* Events */}
          {hasEvents && (
            <div className="flex items-center gap-1">
              <Calendar className={cn("h-3 w-3 flex-shrink-0", colors.event?.text)} />
              <span className={cn("truncate", colors.event?.text)}>
                {summary!.eventFirstTitle}
                {summary!.eventCount > 1 && ` +${summary!.eventCount - 1}`}
              </span>
            </div>
          )}

          {/* Overdue Tasks */}
          {overdueTasksCount > 0 && (
            <div className="flex items-center gap-1">
              <X className={cn("h-3 w-3 flex-shrink-0", colors.task?.overdue?.text)} />
              <span className={cn("truncate", colors.task?.overdue?.text)}>
                {overdueTasksCount} task overdue
              </span>
            </div>
          )}

          {/* Upcoming Tasks (includes due today and future) */}
          {upcomingTasksCount > 0 && (
            <div className="flex items-center gap-1">
              <Clock className={cn("h-3 w-3 flex-shrink-0", colors.task?.upcoming?.text)} />
              <span className={cn("truncate", colors.task?.upcoming?.text)}>
                {upcomingTasksCount} task upcoming
              </span>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasksCount > 0 && (
            <div className="flex items-center gap-1">
              <CheckSquare className={cn("h-3 w-3 flex-shrink-0", colors.task?.completed?.text)} />
              <span className={cn("truncate", colors.task?.completed?.text)}>
                {completedTasksCount} task completed
              </span>
            </div>
          )}

          {/* GitHub Activity */}
          {hasGithub && (
            <div className="flex items-center gap-1">
              <Github className={cn("h-3 w-3 flex-shrink-0", colors.github?.text)} />
              <span className={cn("truncate", colors.github?.text)}>
                {summary!.githubEventCount} {summary!.githubEventCount === 1 ? "event" : "events"}
              </span>
            </div>
          )}

          {/* Habits */}
          {hasHabits && (
            <div className="flex items-center gap-1">
              <CheckSquare className={cn("h-3 w-3 flex-shrink-0", colors.habit?.text || "text-purple-500")} />
              <span className={cn("truncate", colors.habit?.text || "text-purple-500")}>
                {summary!.habitCount} {summary!.habitCount === 1 ? "habit" : "habits"}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs">
          {/* Empty state */}
        </div>
      )}

      {/* Indicators at bottom */}
      {hasAnyData && (
        <div className="flex gap-1 mt-1">
          {hasActivities && (
            <div className={cn("w-2 h-2 rounded-full", colors.activity?.bg)} title="Activities" />
          )}
          {(summary?.workoutCounts.upcoming ?? 0) > 0 && (
            <div className={cn("w-2 h-2 rounded-full", colors.workout?.upcoming?.bg)} title="Upcoming Workouts" />
          )}
          {(summary?.workoutCounts.completed ?? 0) > 0 && (
            <div className={cn("w-2 h-2 rounded-full", colors.workout?.completed?.bg)} title="Completed Workouts" />
          )}
          {hasMedia && (
            <div className={cn("w-2 h-2 rounded-full", colors.media?.bg)} title="Media" />
          )}
          {hasParks && (
            <div className={cn("w-2 h-2 rounded-full", colors.park?.bg)} title="Parks" />
          )}
          {hasJournals && (
            <div className={cn("w-2 h-2 rounded-full", colors.journal?.bg)} title="Journals" />
          )}
          {hasEvents && (
            <div className={cn("w-2 h-2 rounded-full", colors.event?.bg)} title="Events" />
          )}
          {overdueTasksCount > 0 && (
            <div className={cn("w-2 h-2 rounded-full", colors.task?.overdue?.bg)} title="Overdue Tasks" />
          )}
          {upcomingTasksCount > 0 && (
            <div className={cn("w-2 h-2 rounded-full", colors.task?.upcoming?.bg)} title="Upcoming Tasks" />
          )}
          {completedTasksCount > 0 && (
            <div className={cn("w-2 h-2 rounded-full", colors.task?.completed?.bg)} title="Completed Tasks" />
          )}
          {hasGithub && (
            <div className={cn("w-2 h-2 rounded-full", colors.github?.bg)} title="GitHub Activity" />
          )}
          {hasHabits && (
            <div className={cn("w-2 h-2 rounded-full", colors.habit?.bg || "bg-purple-500")} title="Habits Completed" />
          )}
        </div>
      )}
    </Card>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const CalendarDayCell = memo(CalendarDayCellComponent);
