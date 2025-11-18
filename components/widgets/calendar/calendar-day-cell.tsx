"use client";

import { Card } from "@/components/ui/card";
import type { CalendarDayData } from "@/lib/db/calendar";
import { Smile, Frown, Meh, Activity, Film, Tv, Book, Gamepad2, CheckSquare, Clock, X, Plus, Calendar, Trees, BookOpen, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { CalendarColors } from "@/lib/constants/calendar";

interface CalendarDayCellProps {
  day: number;
  date: string;
  data?: CalendarDayData;
  isToday: boolean;
  isSelected: boolean;
  onOpenMoodModal: (date: string) => void;
  onDayClick: (date: string) => void;
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

export function CalendarDayCell({
  day,
  date,
  data,
  isToday,
  isSelected,
  onOpenMoodModal,
  onDayClick,
}: CalendarDayCellProps) {
  const router = useRouter();
  const hasMood = data?.mood !== null && data?.mood !== undefined;
  const hasMedia = (data?.media.length ?? 0) > 0;
  const hasTasks = (data?.tasks.length ?? 0) > 0;
  const hasEvents = (data?.events.length ?? 0) > 0;
  const hasParks = (data?.parks.length ?? 0) > 0;
  const hasJournals = (data?.journals.length ?? 0) > 0;

  // Separate upcoming and completed workout activities
  const upcomingWorkoutActivities = data?.workoutActivities.filter((w) => !w.completed) ?? [];
  const completedWorkoutActivities = data?.workoutActivities.filter((w) => w.completed) ?? [];

  // Get IDs of Strava activities that are linked to completed workouts
  const linkedStravaActivityIds = new Set(
    completedWorkoutActivities
      .filter((w) => w.strava_activity_id)
      .map((w) => w.strava_activity_id!)
  );

  // Filter out Strava activities that are already linked to completed workouts
  const unlinkedStravaActivities = data?.activities.filter(
    (activity) => !linkedStravaActivityIds.has(activity.id)
  ) ?? [];

  const hasActivities = unlinkedStravaActivities.length > 0;
  const hasWorkoutActivities = upcomingWorkoutActivities.length > 0 || completedWorkoutActivities.length > 0;

  const hasAnyData = hasMood || hasActivities || hasMedia || hasTasks || hasEvents || hasParks || hasJournals || hasWorkoutActivities;

  // Get mood icon
  const MoodIcon = hasMood ? MOOD_ICONS[data!.mood!.rating].icon : null;
  const moodColor = hasMood ? MOOD_ICONS[data!.mood!.rating].color : "";

  // Get today's date for comparison
  const today = new Date().toISOString().split("T")[0];

  // Check if this day is today or in the past and doesn't have a journal
  const isPastOrToday = date <= today;
  const shouldShowAddJournal = isPastOrToday && !hasJournals;

  // Categorize tasks by status (compare to TODAY, not the cell's date)
  const completedTasks = data?.tasks.filter((t) => t.completed) ?? [];
  const overdueTasks = data?.tasks.filter((t) => !t.completed && t.due_date && t.due_date.split("T")[0] < today) ?? [];
  const upcomingTasks = data?.tasks.filter((t) => !t.completed && t.due_date && t.due_date.split("T")[0] >= today) ?? [];

  return (
    <Card
      onClick={() => onDayClick(date)}
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
              <Activity className={cn("h-3 w-3 flex-shrink-0", CalendarColors.activity.text)} />
              <span className={cn("truncate", CalendarColors.activity.text)}>
                {unlinkedStravaActivities.length} {unlinkedStravaActivities.length === 1 ? "activity" : "activities"}
              </span>
            </div>
          )}

          {/* Upcoming Workout Activities */}
          {upcomingWorkoutActivities.length > 0 && (
            <div className="flex items-center gap-1">
              <Dumbbell className={cn("h-3 w-3 flex-shrink-0", CalendarColors.workout.upcoming.text)} />
              <span className={cn("truncate", CalendarColors.workout.upcoming.text)}>
                {upcomingWorkoutActivities[0].time} - {upcomingWorkoutActivities[0].type}
                {upcomingWorkoutActivities.length > 1 && ` +${upcomingWorkoutActivities.length - 1}`}
              </span>
            </div>
          )}

          {/* Completed Workout Activities */}
          {completedWorkoutActivities.length > 0 && upcomingWorkoutActivities.length === 0 && (
            <div className="flex items-center gap-1">
              <Dumbbell className={cn("h-3 w-3 flex-shrink-0", CalendarColors.workout.completed.text)} />
              <span className={cn("truncate", CalendarColors.workout.completed.text)}>
                {(() => {
                  const firstWorkout = completedWorkoutActivities[0];
                  const linkedStrava = firstWorkout.strava_activity_id
                    ? data?.activities.find((a) => a.id === firstWorkout.strava_activity_id)
                    : null;

                  if (linkedStrava) {
                    const distance = linkedStrava.distance ? `${(linkedStrava.distance / 1000).toFixed(1)}km` : '';
                    return `${linkedStrava.name}${distance ? ` - ${distance}` : ''}${completedWorkoutActivities.length > 1 ? ` +${completedWorkoutActivities.length - 1}` : ''}`;
                  }
                  return `${completedWorkoutActivities.length} ${completedWorkoutActivities.length === 1 ? 'workout' : 'workouts'} completed`;
                })()}
              </span>
            </div>
          )}

          {/* Media completed */}
          {hasMedia && (
            <div className="flex items-center gap-1">
              {(() => {
                const mediaType = data!.media[0].type;
                const MediaIcon = MEDIA_ICONS[mediaType] || Film;
                return <MediaIcon className={cn("h-3 w-3 flex-shrink-0", CalendarColors.media.text)} />;
              })()}
              <span className={cn("truncate", CalendarColors.media.text)}>
                {data!.media[0].title}
                {data!.media.length > 1 && ` +${data!.media.length - 1}`}
              </span>
            </div>
          )}

          {/* Parks visited */}
          {hasParks && (
            <div className="flex items-center gap-1">
              <Trees className={cn("h-3 w-3 flex-shrink-0", CalendarColors.park.text)} />
              <span className={cn("truncate", CalendarColors.park.text)}>
                {data!.parks[0].title}
                {data!.parks.length > 1 && ` +${data!.parks.length - 1}`}
              </span>
            </div>
          )}

          {/* Journals */}
          {hasJournals && (
            <div className="flex items-center gap-1">
              <BookOpen className={cn("h-3 w-3 flex-shrink-0", CalendarColors.journal.text)} />
              <span className={cn("truncate", CalendarColors.journal.text)}>
                {data!.journals[0].title}
                {data!.journals.length > 1 && ` +${data!.journals.length - 1}`}
              </span>
            </div>
          )}

          {/* Events */}
          {hasEvents && (
            <div className="flex items-center gap-1">
              <Calendar className={cn("h-3 w-3 flex-shrink-0", CalendarColors.event.text)} />
              <span className={cn("truncate", CalendarColors.event.text)}>
                {data!.events[0].title}
                {data!.events.length > 1 && ` +${data!.events.length - 1}`}
              </span>
            </div>
          )}

          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div className="flex items-center gap-1">
              <X className={cn("h-3 w-3 flex-shrink-0", CalendarColors.task.overdue.text)} />
              <span className={cn("truncate", CalendarColors.task.overdue.text)}>
                {overdueTasks.length} task overdue
              </span>
            </div>
          )}

          {/* Upcoming Tasks (includes due today and future) */}
          {upcomingTasks.length > 0 && (
            <div className="flex items-center gap-1">
              <Clock className={cn("h-3 w-3 flex-shrink-0", CalendarColors.task.upcoming.text)} />
              <span className={cn("truncate", CalendarColors.task.upcoming.text)}>
                {upcomingTasks.length} task upcoming
              </span>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="flex items-center gap-1">
              <CheckSquare className={cn("h-3 w-3 flex-shrink-0", CalendarColors.task.completed.text)} />
              <span className={cn("truncate", CalendarColors.task.completed.text)}>
                {completedTasks.length} task completed
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
            <div className={cn("w-2 h-2 rounded-full", CalendarColors.activity.bg)} title="Activities" />
          )}
          {upcomingWorkoutActivities.length > 0 && (
            <div className={cn("w-2 h-2 rounded-full", CalendarColors.workout.upcoming.bg)} title="Upcoming Workouts" />
          )}
          {completedWorkoutActivities.length > 0 && (
            <div className={cn("w-2 h-2 rounded-full", CalendarColors.workout.completed.bg)} title="Completed Workouts" />
          )}
          {hasMedia && (
            <div className={cn("w-2 h-2 rounded-full", CalendarColors.media.bg)} title="Media" />
          )}
          {hasParks && (
            <div className={cn("w-2 h-2 rounded-full", CalendarColors.park.bg)} title="Parks" />
          )}
          {hasJournals && (
            <div className={cn("w-2 h-2 rounded-full", CalendarColors.journal.bg)} title="Journals" />
          )}
          {hasEvents && (
            <div className={cn("w-2 h-2 rounded-full", CalendarColors.event.bg)} title="Events" />
          )}
          {overdueTasks.length > 0 && (
            <div className={cn("w-2 h-2 rounded-full", CalendarColors.task.overdue.bg)} title="Overdue Tasks" />
          )}
          {upcomingTasks.length > 0 && (
            <div className={cn("w-2 h-2 rounded-full", CalendarColors.task.upcoming.bg)} title="Upcoming Tasks" />
          )}
          {completedTasks.length > 0 && (
            <div className={cn("w-2 h-2 rounded-full", CalendarColors.task.completed.bg)} title="Completed Tasks" />
          )}
        </div>
      )}
    </Card>
  );
}
