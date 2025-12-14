"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { CalendarDayCell } from "./calendar-day-cell";
import { CalendarDayDetail } from "./calendar-day-detail";
import { CalendarMonthSummary } from "./calendar-month-summary";
import { MoodEntryModal } from "../mood/mood-entry-modal";
import { EventModal, type EventFormData } from "./event-modal";
import { MobileEventSheet } from "./mobile-event-sheet";
import type { CalendarDaySummary, CalendarDayData } from "@/lib/db/calendar";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface CalendarViewProps {
  year: number;
  month: number; // 1-12
  summaryData: Map<string, CalendarDaySummary>;
  colors: any;
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

export function CalendarView({ year, month, summaryData, colors }: CalendarViewProps) {
  const router = useRouter();
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDayForDetail, setSelectedDayForDetail] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Lazy loading state for day details
  const [dayDetailData, setDayDetailData] = useState<CalendarDayData | null>(null);
  const [isLoadingDayDetail, setIsLoadingDayDetail] = useState(false);
  const [dayDetailError, setDayDetailError] = useState<string | null>(null);

  // Cache for loaded day details
  const dayDetailCache = useRef<Map<string, CalendarDayData>>(new Map());

  // Simple mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Clear selected day and cache when month/year changes
  useEffect(() => {
    setSelectedDayForDetail(null);
    setDayDetailData(null);
    setDayDetailError(null);
    dayDetailCache.current.clear();
  }, [year, month]);

  // Lazy load day details when a day is selected
  const fetchDayDetails = useCallback(async (date: string) => {
    // Check cache first
    const cachedData = dayDetailCache.current.get(date);
    if (cachedData) {
      setDayDetailData(cachedData);
      setDayDetailError(null);
      return;
    }

    setIsLoadingDayDetail(true);
    setDayDetailError(null);

    try {
      const response = await fetch(`/api/calendar/day?date=${date}`);

      if (!response.ok) {
        throw new Error("Failed to load day details");
      }

      const data = await response.json();

      // Cache the result
      dayDetailCache.current.set(date, data);
      setDayDetailData(data);
    } catch (error) {
      console.error("Error fetching day details:", error);
      setDayDetailError("Failed to load day details");
      setDayDetailData(null);
    } finally {
      setIsLoadingDayDetail(false);
    }
  }, []);

  // Fetch day details when selected day changes
  useEffect(() => {
    if (selectedDayForDetail) {
      fetchDayDetails(selectedDayForDetail);
    } else {
      setDayDetailData(null);
    }
  }, [selectedDayForDetail, fetchDayDetails]);

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
    // Use YYYY-MM-DD format directly
    setSelectedDate(date);
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
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, rating, note }),
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-bold">
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => handleOpenEventModal()}
              className="cursor-pointer flex-1 sm:flex-none min-w-[100px]"
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevMonth}
                className="cursor-pointer h-9 w-9"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous month</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextMonth}
                className="cursor-pointer h-9 w-9"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next month</span>
              </Button>
            </div>
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
              className="text-center font-semibold text-xs sm:text-sm py-2 text-muted-foreground"
            >
              {day}
            </div>
          ))}

          {/* Day cells */}
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="min-h-[50px] sm:min-h-[100px] md:min-h-[120px]" />;
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
              <CalendarDayCell
                key={dateStr}
                day={day}
                date={dateStr}
                summary={daySummary}
                isToday={isToday}
                isSelected={dateStr === selectedDayForDetail}
                onOpenMoodModal={handleOpenMoodModal}
                onDayClick={handleDayClick}
                colors={colors}
              />
            );
          })}
        </div>
      </Card>

      {/* Day Detail Card - Lazy loaded */}
      {selectedDayForDetail && (
        <CalendarDayDetail
          date={selectedDayForDetail}
          data={dayDetailData}
          isLoading={isLoadingDayDetail}
          error={dayDetailError}
          onDataChange={() => {
            // Invalidate cache and refresh
            dayDetailCache.current.delete(selectedDayForDetail);
            fetchDayDetails(selectedDayForDetail);
            router.refresh();
          }}
        />
      )}

      {/* Month Summary */}
      <CalendarMonthSummary
        summaryData={summaryData}
        year={year}
        month={month}
      />

      {/* Mood Entry Modal */}
      {selectedDate && (
        <MoodEntryModal
          open={isMoodModalOpen}
          onOpenChange={setIsMoodModalOpen}
          date={selectedDate}
          initialRating={summaryData.get(selectedDate)?.moodRating ?? undefined}
          initialNote=""
          onSave={handleSaveMood}
        />
      )}

      {/* Event Modal or Sheet - Desktop uses Dialog, Mobile uses Sheet */}
      {selectedDate && (
        isMobile ? (
          <MobileEventSheet
            open={isEventModalOpen}
            onOpenChange={setIsEventModalOpen}
            date={selectedDate}
            onSave={handleSaveEvent}
          />
        ) : (
          <EventModal
            open={isEventModalOpen}
            onOpenChange={setIsEventModalOpen}
            date={selectedDate}
            onSave={handleSaveEvent}
          />
        )
      )}
    </div>
  );
}
