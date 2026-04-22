"use client";

import { CalendarEditorial } from "@/components/widgets/calendar/calendar-editorial";
import type { CalendarDaySummary } from "@/lib/db/calendar";

interface CalendarPageClientProps {
  year: number;
  month: number;
  summaryData: Record<string, CalendarDaySummary>;
  colors: any;
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

export function CalendarPageClient({
  year,
  month,
  summaryData: summaryObject,
  colors,
  editorialData,
}: CalendarPageClientProps) {
  // Convert back to Map for child components that expect it
  const summaryData = new Map(Object.entries(summaryObject));

  return (
    <div className="pb-20 md:pb-0 font-lexend">
      <CalendarEditorial
        year={year}
        month={month}
        summaryData={summaryData}
        editorialData={editorialData}
      />
    </div>
  );
}
