"use client";

import { memo } from "react";
import { Card } from "@/components/ui/card";
import type { CalendarDaySummary } from "@/lib/db/calendar";
import { Smile, Frown, Meh, Activity, Film, Tv, Book, Gamepad2, CheckSquare, Clock, X, Plus, Calendar, Trees, BookOpen, Dumbbell, Github, Target, Flag, Languages, Heart, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarDayCellProps {
  day: number;
  date: string;
  summary?: CalendarDaySummary;
  isToday: boolean;
  isSelected: boolean;
  colors: any;
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

function CalendarDayCellComponent({
  day,
  date,
  summary,
  isToday,
  isSelected,
  colors,
  onOpenMoodModal,
  onDayClick,
}: CalendarDayCellProps) {
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
  const hasGoalsDue = (summary?.goalCounts?.due ?? 0) > 0;
  const hasGoalsCompleted = (summary?.goalCounts?.completed ?? 0) > 0;
  const hasMilestonesDue = (summary?.milestoneCounts?.due ?? 0) > 0;
  const hasMilestonesCompleted = (summary?.milestoneCounts?.completed ?? 0) > 0;
  const hasDuolingo = summary?.duolingoCompleted ?? false;
  const hasRelationship = (summary?.relationshipCount ?? 0) > 0;
  const hasMeals = (summary?.mealCount ?? 0) > 0;

  const hasAnyData = hasMood || hasActivities || hasMedia || hasTasks || hasEvents || hasParks || hasJournals || hasWorkoutActivities || hasGithub || hasHabits || hasGoalsDue || hasGoalsCompleted || hasMilestonesDue || hasMilestonesCompleted || hasDuolingo || hasRelationship || hasMeals;

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
      onClick={() => onDayClick(date)}
      className={cn(
        "min-h-[50px] sm:min-h-[100px] md:min-h-[120px] p-2 flex flex-col hover:shadow-md transition-all cursor-pointer",
        isToday && "ring-2 ring-primary",
        isSelected && "ring-2 ring-blue-500 shadow-lg"
      )}
    >
      {/* Day number and mood/journal button */}
      <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-1 sm:gap-0 sm:mb-1">
        <span
          className={cn(
            "text-xs sm:text-sm font-semibold",
            isToday && "bg-primary text-primary-foreground rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-xs"
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
              onOpenMoodModal(date);
            }}
            className="cursor-pointer h-5 w-5 sm:h-4 sm:w-4 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors"
            title="Add daily journal for this day"
            aria-label={`Add daily journal for ${date}`}
          >
            <Plus className="h-3.5 w-3.5 sm:h-3 sm:w-3 text-muted-foreground" />
          </button>
        ) : null}
      </div>

      {/* Content - Hidden on mobile, shown on sm and above */}
      {hasAnyData ? (
        <div className="hidden sm:flex sm:flex-1 sm:flex-col sm:space-y-1 text-xs overflow-hidden">
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

          {/* Duolingo */}
          {hasDuolingo && (
            <div className="flex items-center gap-1">
              <Languages className={cn("h-3 w-3 flex-shrink-0", colors.duolingo?.text || "text-[#58CC02]")} />
              <span className={cn("truncate", colors.duolingo?.text || "text-[#58CC02]")}>
                Duolingo done
              </span>
            </div>
          )}

          {/* Goals Due */}
          {hasGoalsDue && (
            <div className="flex items-center gap-1">
              <Target className={cn("h-3 w-3 flex-shrink-0", colors.goal?.due?.text || "text-cyan-500")} />
              <span className={cn("truncate", colors.goal?.due?.text || "text-cyan-500")}>
                {summary!.goalCounts.firstDueTitle}
                {summary!.goalCounts.due > 1 && ` +${summary!.goalCounts.due - 1}`}
              </span>
            </div>
          )}

          {/* Goals Completed */}
          {hasGoalsCompleted && !hasGoalsDue && (
            <div className="flex items-center gap-1">
              <Target className={cn("h-3 w-3 flex-shrink-0", colors.goal?.completed?.text || "text-teal-500")} />
              <span className={cn("truncate", colors.goal?.completed?.text || "text-teal-500")}>
                {summary!.goalCounts.completed} goal{summary!.goalCounts.completed !== 1 ? "s" : ""} done
              </span>
            </div>
          )}

          {/* Milestones Due */}
          {hasMilestonesDue && (
            <div className="flex items-center gap-1">
              <Flag className={cn("h-3 w-3 flex-shrink-0", colors.milestone?.due?.text || "text-violet-500")} />
              <span className={cn("truncate", colors.milestone?.due?.text || "text-violet-500")}>
                {summary!.milestoneCounts.firstDueTitle}
                {summary!.milestoneCounts.due > 1 && ` +${summary!.milestoneCounts.due - 1}`}
              </span>
            </div>
          )}

          {/* Milestones Completed */}
          {hasMilestonesCompleted && !hasMilestonesDue && (
            <div className="flex items-center gap-1">
              <Flag className={cn("h-3 w-3 flex-shrink-0", colors.milestone?.completed?.text || "text-fuchsia-500")} />
              <span className={cn("truncate", colors.milestone?.completed?.text || "text-fuchsia-500")}>
                {summary!.milestoneCounts.completed} milestone{summary!.milestoneCounts.completed !== 1 ? "s" : ""} done
              </span>
            </div>
          )}

          {/* Relationship */}
          {hasRelationship && (
            <div className="flex items-center gap-1">
              <Heart className={cn("h-3 w-3 flex-shrink-0", colors.relationship?.text || "text-pink-500")} />
              <span className={cn("truncate", colors.relationship?.text || "text-pink-500")}>
                {summary!.relationshipCount} {summary!.relationshipCount === 1 ? "moment" : "moments"}
              </span>
            </div>
          )}

          {/* Meals */}
          {hasMeals && (
            <div className="flex items-center gap-1">
              <Utensils className={cn("h-3 w-3 flex-shrink-0", colors.meal?.text || "text-amber-500")} />
              <span className={cn("truncate", colors.meal?.text || "text-amber-500")}>
                {summary!.mealCount} {summary!.mealCount === 1 ? "meal" : "meals"}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs">
          {/* Empty state */}
        </div>
      )}

      {/* Indicators at bottom - Hidden on mobile, shown on sm and above */}
      {hasAnyData && (
        <div className="hidden sm:flex gap-1 mt-1">
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
          {hasDuolingo && (
            <div className={cn("w-2 h-2 rounded-full", colors.duolingo?.bg || "bg-[#58CC02]")} title="Duolingo" />
          )}
          {hasGoalsDue && (
            <div className={cn("w-2 h-2 rounded-full", colors.goal?.due?.bg || "bg-cyan-500")} title="Goals Due" />
          )}
          {hasGoalsCompleted && (
            <div className={cn("w-2 h-2 rounded-full", colors.goal?.completed?.bg || "bg-teal-500")} title="Goals Completed" />
          )}
          {hasMilestonesDue && (
            <div className={cn("w-2 h-2 rounded-full", colors.milestone?.due?.bg || "bg-violet-500")} title="Milestones Due" />
          )}
          {hasMilestonesCompleted && (
            <div className={cn("w-2 h-2 rounded-full", colors.milestone?.completed?.bg || "bg-fuchsia-500")} title="Milestones Completed" />
          )}
          {hasRelationship && (
            <div className={cn("w-2 h-2 rounded-full", colors.relationship?.bg || "bg-pink-500")} title="Relationship" />
          )}
          {hasMeals && (
            <div className={cn("w-2 h-2 rounded-full", colors.meal?.bg || "bg-amber-500")} title="Meals" />
          )}
        </div>
      )}
    </Card>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const CalendarDayCell = memo(CalendarDayCellComponent);
