"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CalendarDayCell } from "./calendar-day-cell";
import { CalendarDayDetail } from "./calendar-day-detail";
import { MoodEntryModal } from "./mood-entry-modal";
import { EventModal, type EventFormData } from "./event-modal";
import type { CalendarDayData } from "@/lib/db/calendar";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface CalendarViewProps {
  year: number;
  month: number; // 1-12
  calendarData: Map<string, CalendarDayData>;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

export function CalendarView({ year, month, calendarData }: CalendarViewProps) {
  const router = useRouter();
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDayForDetail, setSelectedDayForDetail] = useState<string | null>(null);

  // Get first day of month and total days
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0-6 (Sun-Sat)
  const daysInMonth = new Date(year, month, 0).getDate();

  // Calculate previous and next month
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const handlePrevMonth = () => {
    router.push(`/calendar?year=${prevYear}&month=${prevMonth}`);
  };

  const handleNextMonth = () => {
    router.push(`/calendar?year=${nextYear}&month=${nextMonth}`);
  };

  const handleToday = () => {
    const now = new Date();
    router.push(
      `/calendar?year=${now.getFullYear()}&month=${now.getMonth() + 1}`
    );
  };

  const handleOpenMoodModal = (date: string) => {
    // Convert date from YYYY-MM-DD to YYYY/MM/DD format
    const formattedDate = date.replace(/-/g, '/');
    setSelectedDate(formattedDate);
    setIsMoodModalOpen(true);
  };

  const handleOpenEventModal = (date?: string) => {
    const eventDate = date || new Date().toISOString().split("T")[0];
    setSelectedDate(eventDate);
    setIsEventModalOpen(true);
  };

  const handleDayClick = (date: string) => {
    setSelectedDayForDetail(date);
  };

  const handleSaveMood = async (rating: number, note: string) => {
    if (!selectedDate) return;

    try {
      // Convert date back to YYYY-MM-DD format for API
      const apiDate = selectedDate.replace(/\//g, '-');

      const response = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: apiDate, rating, note }),
      });

      if (response.ok) {
        // Refresh the page to show the updated mood
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save mood:", error);
      throw error;
    }
  };

  const handleSaveEvent = async (eventData: EventFormData) => {
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        // Refresh the page to show the new event
        router.refresh();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to save event");
      }
    } catch (error) {
      console.error("Failed to save event:", error);
      throw error;
    }
  };

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
    <div className="space-y-4">
      {/* Header with month navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => handleOpenEventModal()}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="cursor-pointer"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              className="cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Calendar Grid */}
      <Card className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-sm py-2 text-muted-foreground"
            >
              {day}
            </div>
          ))}

          {/* Day cells */}
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="min-h-[120px]" />;
            }

            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayData = calendarData.get(dateStr);

            // Check if it's today
            const today = new Date();
            const isToday =
              today.getFullYear() === year &&
              today.getMonth() + 1 === month &&
              today.getDate() === day;

            return (
              <CalendarDayCell
                key={dateStr}
                day={day}
                date={dateStr}
                data={dayData}
                isToday={isToday}
                isSelected={dateStr === selectedDayForDetail}
                onOpenMoodModal={handleOpenMoodModal}
                onDayClick={handleDayClick}
              />
            );
          })}
        </div>
      </Card>

      {/* Day Detail Card */}
      {selectedDayForDetail && (
        <CalendarDayDetail
          date={selectedDayForDetail}
          data={calendarData.get(selectedDayForDetail)}
        />
      )}

      {/* Mood Entry Modal */}
      {selectedDate && (
        <MoodEntryModal
          open={isMoodModalOpen}
          onOpenChange={setIsMoodModalOpen}
          date={selectedDate}
          initialRating={calendarData.get(selectedDate.replace(/\//g, '-'))?.mood?.rating}
          initialNote={calendarData.get(selectedDate.replace(/\//g, '-'))?.mood?.note || ""}
          onSave={handleSaveMood}
        />
      )}

      {/* Event Modal */}
      {selectedDate && (
        <EventModal
          open={isEventModalOpen}
          onOpenChange={setIsEventModalOpen}
          date={selectedDate}
          onSave={handleSaveEvent}
        />
      )}
    </div>
  );
}
