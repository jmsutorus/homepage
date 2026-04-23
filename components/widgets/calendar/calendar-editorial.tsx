"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ComingUpSection } from "./sections/coming-up-section";
import { PastMemoriesSection } from "./sections/past-memories-section";
import { CalendarGridEditorial } from "./calendar-grid-editorial";
import { MoodEntryModal } from "../mood/mood-entry-modal";
import { EventModal, type EventFormData } from "./event-modal";
import { MobileEventSheet } from "./mobile-event-sheet";
import { MaterialSymbol } from "@/components/ui/MaterialSymbol";
import type { CalendarDaySummary } from "@/lib/db/calendar";

interface CalendarEditorialProps {
  year: number;
  month: number;
  summaryData: Map<string, CalendarDaySummary>;
  editorialData: {
    upcomingEvents: any[];
    peopleEvents: any[];
    vacations: any[];
    milestones: any[];
    pastMemories: {
      media: any[];
      journals: any[];
    };
  };
}

export function CalendarEditorial({
  year,
  month,
  summaryData,
  editorialData,
}: CalendarEditorialProps) {
  const router = useRouter();
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePrevMonth = () => {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    router.push(`/calendar?year=${prevYear}&month=${prevMonth}`);
  };

  const handleNextMonth = () => {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    router.push(`/calendar?year=${nextYear}&month=${nextMonth}`);
  };

  const handleSaveMood = async (rating: number, note: string) => {
    if (!targetDate) return;
    try {
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: targetDate, rating, note }),
      });
      if (response.ok) router.refresh();
    } catch (error) {
      console.error("Failed to save mood:", error);
    }
  };

  const handleSaveEvent = async (eventData: EventFormData) => {
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
      if (response.ok) router.refresh();
    } catch (error) {
      console.error("Failed to save event:", error);
    }
  };

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="flex min-h-screen text-media-on-background font-lexend">
      <main className="p-8 md:p-12 max-w-[1600px] mx-auto w-full pb-32">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="flex flex-col gap-1">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-media-primary leading-none">
              {MONTH_NAMES[month - 1]} {year}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setTargetDate(new Date().toISOString().split('T')[0]);
                setIsEventModalOpen(true);
              }}
              className="cursor-pointer flex items-center gap-2 px-6 py-4 rounded-full bg-media-primary text-white font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-sm"
            >
              <MaterialSymbol icon="add" size={18} />
              New Entry
            </button>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevMonth}
                className="cursor-pointer p-4 rounded-full bg-media-surface-container-low hover:bg-media-surface-container text-media-primary transition-all"
              >
                <MaterialSymbol icon="chevron_left" size={24} />
              </button>
              <button 
                onClick={handleNextMonth}
                className="cursor-pointer p-4 rounded-full bg-media-surface-container-low hover:bg-media-surface-container text-media-primary transition-all"
              >
                <MaterialSymbol icon="chevron_right" size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Content */}
        <ComingUpSection 
          events={editorialData.upcomingEvents}
          peopleEvents={editorialData.peopleEvents}
          vacations={editorialData.vacations}
          milestones={editorialData.milestones}
        />

        {/* Calendar Grid */}
        <CalendarGridEditorial 
          year={year} 
          month={month} 
          summaryData={summaryData} 
          onDayClick={(date) => router.push(`/daily/${date}`)}
        />

        {/* Past Memories */}
        <PastMemoriesSection 
          media={editorialData.pastMemories.media}
          journals={editorialData.pastMemories.journals}
        />

        {/* Modals */}
        {targetDate && (
          <MoodEntryModal
            open={isMoodModalOpen}
            onOpenChange={setIsMoodModalOpen}
            date={targetDate}
            initialRating={summaryData.get(targetDate)?.moodRating ?? undefined}
            initialNote=""
            onSave={handleSaveMood}
          />
        )}

        {targetDate && (
          isMobile ? (
            <MobileEventSheet
              open={isEventModalOpen}
              onOpenChange={setIsEventModalOpen}
              date={targetDate}
              onSave={handleSaveEvent}
            />
          ) : (
            <EventModal
              open={isEventModalOpen}
              onOpenChange={setIsEventModalOpen}
              date={targetDate}
              onSave={handleSaveEvent}
            />
          )
        )}
      </main>
    </div>
  );
}
