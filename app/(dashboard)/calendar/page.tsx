import { 
  getCalendarSummaryForMonth, 
  getPeopleEventsInRange, 
  getVacationsInRange,
  getMediaCompletedInRange,
  getJournalsInRange,
  getUpcomingMilestones
} from "@/lib/db/calendar";
import { getAllEventsWithCoverPhoto } from "@/lib/db/events";
import { CalendarPageClient } from "./page-client";
import { auth } from "@/auth";
import { getGithubEventsByDateRange } from "@/lib/db/github";
import { getCalendarColorsForUser } from "@/lib/actions/calendar-colors";

export const dynamic = "force-dynamic";

interface CalendarPageProps {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;

  // Get current month data or use query params
  const now = new Date();
  const currentYear = params.year ? parseInt(params.year) : now.getFullYear();
  const currentMonth = params.month ? parseInt(params.month) : now.getMonth() + 1; // JavaScript months are 0-indexed

  // Start fetching independent data in parallel
  const sessionPromise = auth();
  const calendarColorsPromise = getCalendarColorsForUser();

  // Define date range for current view month
  const startDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01T00:00:00Z`;
  const lastDay = new Date(currentYear, currentMonth, 0).getDate();
  const endDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59Z`;

  // Define date range for "Coming Up" (current + next month)
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
  const nextMonthLastDay = new Date(nextYear, nextMonth, 0).getDate();
  const rangeEndDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(nextMonthLastDay).padStart(2, "0")}T23:59:59Z`;

  // Define date range for "Past Memories" (previous month)
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const prevMonthLastDay = new Date(prevYear, prevMonth, 0).getDate();
  const prevMonthStartDate = `${prevYear}-${String(prevMonth).padStart(2, "0")}-01T00:00:00Z`;
  const prevMonthEndDate = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(prevMonthLastDay).padStart(2, "0")}T23:59:59Z`;

  const session = await sessionPromise;
  const userId = session?.user?.id;

  // Define GitHub events promise - fetch from synced database
  const githubEventsPromise = (async () => {
    if (userId) {
      return getGithubEventsByDateRange(userId, startDate, endDate);
    }
    return [];
  })();

  // Fetch summary data, passing the githubEvents promise
  const summaryDataPromise = getCalendarSummaryForMonth(currentYear, currentMonth, githubEventsPromise);

  // Fetch editorial data in parallel
  const editorialDataPromise = userId ? Promise.all([
    getAllEventsWithCoverPhoto(userId),
    getPeopleEventsInRange(startDate.split('T')[0], rangeEndDate.split('T')[0], userId),
    getVacationsInRange(userId, startDate.split('T')[0], rangeEndDate.split('T')[0]),
    getMediaCompletedInRange(prevMonthStartDate.split('T')[0], prevMonthEndDate.split('T')[0], userId),
    getJournalsInRange(prevMonthStartDate.split('T')[0], prevMonthEndDate.split('T')[0], userId),
    getUpcomingMilestones(userId, startDate.split('T')[0], rangeEndDate.split('T')[0]),
  ]) : Promise.resolve([[], [], [], [], [], []]);

  // Wait for all data to be ready
  const [summaryData, calendarColors, [allEvents, peopleEvents, vacations, pastMedia, pastJournals, milestones]] = await Promise.all([
    summaryDataPromise,
    calendarColorsPromise,
    editorialDataPromise
  ]);

  // Filter events for the upcoming range
  const upcomingEvents = allEvents.filter(e => {
    const eventDate = e.date;
    return eventDate >= startDate.split('T')[0] && eventDate <= rangeEndDate.split('T')[0];
  });

  // Convert Map to plain object for serialization
  const summaryObject = Object.fromEntries(summaryData);

  return (
    <CalendarPageClient
      year={currentYear}
      month={currentMonth}
      summaryData={summaryObject}
      colors={calendarColors}
      editorialData={JSON.parse(JSON.stringify({
        upcomingEvents,
        peopleEvents,
        vacations,
        milestones,
        pastMemories: {
          media: pastMedia,
          journals: pastJournals
        }
      }))}
    />
  );
}
