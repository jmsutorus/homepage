"use client";

import { memo } from "react";
import { MaterialSymbol } from "@/components/ui/MaterialSymbol";
import type { CalendarDaySummary } from "@/lib/db/calendar";
import { cn } from "@/lib/utils";

interface EditorialDayCellProps {
  day: number;
  date: string;
  summary?: CalendarDaySummary;
  isToday: boolean;
  isSelected: boolean;
  onDayClick: (date: string) => void;
}

function EditorialDayCellComponent({
  day,
  date,
  summary,
  isToday,
  isSelected,
  onDayClick,
}: EditorialDayCellProps) {
  const hasWorkout = (summary?.workoutCounts.completed ?? 0) > 0;
  const hasJournal = (summary?.journalCount ?? 0) > 0;
  const hasDuolingo = summary?.duolingoCompleted ?? false;
  const hasBirthday = (summary?.isBirthday ?? false) || (summary?.birthdayCount ?? 0) > 0;
  const hasRelationship = (summary?.relationshipCount ?? 0) > 0;
  const hasVacationStart = (summary?.vacationCounts.starting ?? 0) > 0;
  const hasVacation = (summary?.vacationCounts.itineraryItems ?? 0) > 0 || (summary?.vacationCounts.starting ?? 0) > 0;
  const hasImage = !!summary?.eventFirstImage;
  const hasMovie = summary?.hasMovie ?? false;
  const hasTV = summary?.hasTV ?? false;
  const hasBook = summary?.hasBook ?? false;
  const hasGame = summary?.hasGame ?? false;
  const hasPark = (summary?.parkCount ?? 0) > 0;
  const hasRestaurant = (summary?.restaurantCount ?? 0) > 0;
  const hasDrink = (summary?.drinkCount ?? 0) > 0;
  
  // Special labels
  const specialLabel = hasVacationStart ? "Trip Start" : hasJournal ? "Journal Day" : null;

  return (
    <div
      onClick={() => onDayClick(date)}
      className={cn(
        "aspect-square rounded-lg p-3 group transition-all cursor-pointer relative overflow-hidden",
        hasImage ? "bg-media-secondary-container text-white" : 
        (hasVacationStart || hasBirthday || hasJournal) ? "bg-media-surface-container-highest" : "bg-media-surface-container",
        "hover:bg-media-surface-container-high",
        isToday && "ring-2 ring-media-secondary/40 ring-inset",
        isSelected && "ring-2 ring-media-primary ring-inset scale-[1.02] shadow-sm z-10"
      )}
    >
      {/* Background Image for Featured Days */}
      {hasImage && (
        <img 
          src={summary!.eventFirstImage!} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-110 transition-transform duration-700" 
        />
      )}

      <span className={cn(
        "text-sm font-bold transition-all relative z-10",
        hasImage ? "text-white" : 
        isToday ? "text-media-secondary font-black" : 
        (hasVacationStart || hasBirthday || hasJournal) ? "text-media-primary" : "text-media-primary/40 group-hover:text-media-primary"
      )}>
        {day < 10 ? `0${day}` : day}
      </span>

      <div className="mt-2 flex flex-wrap gap-1 relative z-10">
        {hasWorkout && (
          <MaterialSymbol 
            icon="fitness_center" 
            size={14} 
            fill={true} 
            className={hasImage ? "text-white" : "text-media-primary"} 
          />
        )}
        {hasDuolingo && (
          <MaterialSymbol 
            icon="translate" 
            size={14} 
            className={hasImage ? "text-white" : "text-media-secondary"} 
          />
        )}
        {hasRelationship && (
          <MaterialSymbol 
            icon="favorite" 
            size={14} 
            fill={true} 
            className={hasImage ? "text-white" : "text-media-secondary"} 
          />
        )}
        {hasJournal && (
          <MaterialSymbol 
            icon="edit_note" 
            size={14} 
            className={hasImage ? "text-white" : "text-media-primary"} 
          />
        )}
        {hasBirthday && (
          <MaterialSymbol 
            icon="cake" 
            size={14} 
            fill={true} 
            className={hasImage ? "text-white" : "text-media-secondary"} 
          />
        )}
        {hasMovie && (
          <MaterialSymbol 
            icon="movie" 
            size={14} 
            className={hasImage ? "text-white" : "text-media-primary"} 
          />
        )}
        {hasTV && (
          <MaterialSymbol 
            icon="tv" 
            size={14} 
            className={hasImage ? "text-white" : "text-media-primary"} 
          />
        )}
        {hasBook && (
          <MaterialSymbol 
            icon="book" 
            size={14} 
            className={hasImage ? "text-white" : "text-media-primary"} 
          />
        )}
        {hasGame && (
          <MaterialSymbol 
            icon="sports_esports" 
            size={14} 
            className={hasImage ? "text-white" : "text-media-primary"} 
          />
        )}
        {hasPark && (
          <MaterialSymbol 
            icon="park" 
            size={14} 
            className={hasImage ? "text-white" : "text-media-primary"} 
          />
        )}
        {hasRestaurant && (
          <MaterialSymbol 
            icon="restaurant" 
            size={14} 
            className={hasImage ? "text-white" : "text-media-primary"} 
          />
        )}
        {hasVacation && (
          <MaterialSymbol 
            icon="beach_access" 
            size={14} 
            className={hasImage ? "text-white" : "text-media-primary"} 
          />
        )}
        {hasDrink && (
          <MaterialSymbol 
            icon="local_bar" 
            size={14} 
            className={hasImage ? "text-white" : "text-media-primary"} 
          />
        )}
      </div>

      <div className="mt-auto relative z-10">
        {hasImage ? (
           <div className="text-[9px] uppercase font-bold tracking-tighter line-clamp-1 opacity-90">
             {summary!.eventFirstTitle}
           </div>
        ) : specialLabel ? (
          <div className="text-[9px] uppercase font-bold tracking-tighter text-media-secondary">
            {specialLabel}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const EditorialDayCell = memo(EditorialDayCellComponent);
