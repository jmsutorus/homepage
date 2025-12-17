import { notFound } from "next/navigation";
import { getCalendarDataForMonth } from "@/lib/db/calendar";
import { auth } from "@/auth";
import { getGithubEventsByDateRange } from "@/lib/db/github";
import type { GithubEvent } from "@/lib/github";
import { queryOne } from "@/lib/db";
import { getAllHabits } from "@/lib/db/habits";
import { getAllMeals } from "@/lib/db/meals";
import { CalendarMonthDetail } from "./calendar-month-detail";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface CalendarMonthPageProps {
  params: Promise<{
    date: string; // Format: YYYY-MM (e.g., "2024-11")
  }>;
}

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

export default async function CalendarMonthPage({ params }: CalendarMonthPageProps) {
  const { date } = await params;

  // Parse the date param (YYYY-MM format)
  const dateMatch = date.match(/^(\d{4})-(\d{2})$/);
  if (!dateMatch) {
    notFound();
  }

  const year = parseInt(dateMatch[1]);
  const month = parseInt(dateMatch[2]);

  // Validate month
  if (month < 1 || month > 12) {
    notFound();
  }

  // Fetch GitHub events from synced database if user is authenticated
  const session = await auth();
  let githubEvents: GithubEvent[] = [];

  if (session?.user?.id) {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01T00:00:00Z`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59Z`;

    githubEvents = await getGithubEventsByDateRange(session.user.id, startDate, endDate);
  }

  // Fetch full calendar data for the month
  const calendarDataMap = await getCalendarDataForMonth(year, month, githubEvents);
  // Convert to plain objects for client component serialization
  const calendarData = JSON.parse(JSON.stringify(Object.fromEntries(calendarDataMap)));

  // Fetch habits to get names for display
  let habitNames: Record<number, string> = {};
  let mealNames: Record<number, string> = {};
  if (session?.user?.id) {
    const habits = await getAllHabits(session.user.id);
    habitNames = habits.reduce((acc, habit) => {
      acc[habit.id] = habit.title;
      return acc;
    }, {} as Record<number, string>);

    // Fetch meals to get names for display
    const meals = await getAllMeals(session.user.id);
    mealNames = meals.reduce((acc, meal) => {
      acc[meal.id] = meal.name;
      return acc;
    }, {} as Record<number, string>);
  }

  // Calculate previous and next month for navigation
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const prevLink = `/calendar/${prevYear}-${String(prevMonth).padStart(2, "0")}`;
  const nextLink = `/calendar/${nextYear}-${String(nextMonth).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {MONTH_NAMES[month - 1]} {year}
          </h1>
          <p className="text-muted-foreground">
            Detailed monthly summary
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/calendar">
              Back to Calendar
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href={prevLink}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href={nextLink}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Month Detail Content */}
      <CalendarMonthDetail
        calendarData={calendarData}
        year={year}
        month={month}
        habitNames={habitNames}
        mealNames={mealNames}
      />
    </div>
  );
}
