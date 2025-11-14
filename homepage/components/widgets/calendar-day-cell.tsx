"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CalendarDayData } from "@/lib/db/calendar";
import { Smile, Frown, Meh, Activity, Film, Tv, Book, Gamepad2, CheckSquare, Clock, X, Plus, Calendar, Trees, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const hasMood = data?.mood !== null && data?.mood !== undefined;
  const hasActivities = (data?.activities.length ?? 0) > 0;
  const hasMedia = (data?.media.length ?? 0) > 0;
  const hasTasks = (data?.tasks.length ?? 0) > 0;
  const hasEvents = (data?.events.length ?? 0) > 0;
  const hasParks = (data?.parks.length ?? 0) > 0;
  const hasJournals = (data?.journals.length ?? 0) > 0;
  const hasAnyData = hasMood || hasActivities || hasMedia || hasTasks || hasEvents || hasParks || hasJournals;

  // Get mood icon
  const MoodIcon = hasMood ? MOOD_ICONS[data!.mood!.rating].icon : null;
  const moodColor = hasMood ? MOOD_ICONS[data!.mood!.rating].color : "";

  // Get today's date for comparison
  const today = new Date().toISOString().split("T")[0];

  // Check if this day is today or in the past and doesn't have a mood
  const isPastOrToday = date <= today;
  const shouldShowAddMood = isPastOrToday && !hasMood;

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

        {/* Mood indicator or Add Mood button */}
        {hasMood && MoodIcon ? (
          <MoodIcon className={cn("h-4 w-4", moodColor)} />
        ) : shouldShowAddMood ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenMoodModal(date);
            }}
            className="cursor-pointer h-4 w-4 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors"
            title="Add mood for this day"
            aria-label={`Add mood for ${date}`}
          >
            <Plus className="h-3 w-3 text-muted-foreground" />
          </button>
        ) : null}
      </div>

      {/* Content */}
      {hasAnyData ? (
        <div className="flex-1 space-y-1 text-xs overflow-hidden">
          {/* Activities */}
          {hasActivities && (
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-blue-500 flex-shrink-0" />
              <span className="text-blue-500 truncate">
                {data!.activities.length} {data!.activities.length === 1 ? "activity" : "activities"}
              </span>
            </div>
          )}

          {/* Media completed */}
          {hasMedia && (
            <div className="flex items-center gap-1">
              {(() => {
                const mediaType = data!.media[0].type;
                const MediaIcon = MEDIA_ICONS[mediaType] || Film;
                return <MediaIcon className="h-3 w-3 text-purple-500 flex-shrink-0" />;
              })()}
              <span className="text-purple-500 truncate">
                {data!.media[0].title}
                {data!.media.length > 1 && ` +${data!.media.length - 1}`}
              </span>
            </div>
          )}

          {/* Parks visited */}
          {hasParks && (
            <div className="flex items-center gap-1">
              <Trees className="h-3 w-3 text-emerald-600 flex-shrink-0" />
              <span className="text-emerald-600 truncate">
                {data!.parks[0].title}
                {data!.parks.length > 1 && ` +${data!.parks.length - 1}`}
              </span>
            </div>
          )}

          {/* Journals */}
          {hasJournals && (
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3 flex-shrink-0 text-[#CC5500]" />
              <span className="truncate text-[#CC5500]">
                {data!.journals[0].title}
                {data!.journals.length > 1 && ` +${data!.journals.length - 1}`}
              </span>
            </div>
          )}

          {/* Events */}
          {hasEvents && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-indigo-500 flex-shrink-0" />
              <span className="text-indigo-500 truncate">
                {data!.events[0].title}
                {data!.events.length > 1 && ` +${data!.events.length - 1}`}
              </span>
            </div>
          )}

          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div className="flex items-center gap-1">
              <X className="h-3 w-3 text-red-500 flex-shrink-0" />
              <span className="text-red-500 truncate">
                {overdueTasks.length} task overdue
              </span>
            </div>
          )}

          {/* Upcoming Tasks (includes due today and future) */}
          {upcomingTasks.length > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-yellow-500 flex-shrink-0" />
              <span className="text-yellow-500 truncate">
                {upcomingTasks.length} task upcoming
              </span>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="flex items-center gap-1">
              <CheckSquare className="h-3 w-3 text-green-500 flex-shrink-0" />
              <span className="text-green-500 truncate">
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
            <div className="w-2 h-2 rounded-full bg-blue-500" title="Activities" />
          )}
          {hasMedia && (
            <div className="w-2 h-2 rounded-full bg-purple-500" title="Media" />
          )}
          {hasParks && (
            <div className="w-2 h-2 rounded-full bg-emerald-600" title="Parks" />
          )}
          {hasJournals && (
            <div className="w-2 h-2 rounded-full bg-[#CC5500]" title="Journals" />
          )}
          {hasEvents && (
            <div className="w-2 h-2 rounded-full bg-indigo-500" title="Events" />
          )}
          {overdueTasks.length > 0 && (
            <div className="w-2 h-2 rounded-full bg-red-500" title="Overdue Tasks" />
          )}
          {upcomingTasks.length > 0 && (
            <div className="w-2 h-2 rounded-full bg-yellow-500" title="Upcoming Tasks" />
          )}
          {completedTasks.length > 0 && (
            <div className="w-2 h-2 rounded-full bg-green-500" title="Completed Tasks" />
          )}
        </div>
      )}
    </Card>
  );
}
