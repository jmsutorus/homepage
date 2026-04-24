"use client";

import { EditorialDayCell } from "./editorial-day-cell";
import type { CalendarDaySummary } from "@/lib/db/calendar";

interface CalendarGridEditorialProps {
  year: number;
  month: number;
  summaryData: Map<string, CalendarDaySummary>;
  selectedDay?: string | null;
  onDayClick: (date: string) => void;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGridEditorial({
  year,
  month,
  summaryData,
  selectedDay,
  onDayClick,
}: CalendarGridEditorialProps) {
  // Get first day of month and total days
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0-6 (Sun-Sat)
  const daysInMonth = new Date(year, month, 0).getDate();

  // Create array of day numbers to render
  const days: (number | null)[] = [];

  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="text-[10px] font-bold uppercase tracking-widest text-media-on-surface-variant opacity-50 px-2 py-4"
          >
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          if (day === null) {
            return (
              <div
                key={`empty-${index}`}
                className="bg-media-surface-container-low/30 aspect-square rounded-lg opacity-40"
              />
            );
          }

          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const daySummary = summaryData.get(dateStr);

          // Check if it's today
          const today = new Date();
          const isToday =
            today.getFullYear() === year &&
            today.getMonth() + 1 === month &&
            today.getDate() === day;

          return (
            <EditorialDayCell
              key={dateStr}
              day={day}
              date={dateStr}
              summary={daySummary}
              isToday={isToday}
              isSelected={dateStr === selectedDay}
              onDayClick={onDayClick}
            />
          );
        })}
      </div>
    </div>
  );
}
