import { getCalendarSummaryForMonth } from "@/lib/db/calendar";
import { CalendarPageClient } from "./page-client";
import { auth } from "@/auth";
import { getGithubActivity } from "@/lib/github";
import { queryOne } from "@/lib/db";
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

  // Define GitHub events promise
  const githubEventsPromise = (async () => {
    const session = await sessionPromise;
    if (session?.user?.id) {
      const account = await queryOne<{ accessToken: string }>(
        "SELECT accessToken FROM account WHERE userId = ? AND providerId = 'github'",
        [session.user.id]
      );

      if (account?.accessToken) {
        const startDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
        const lastDay = new Date(currentYear, currentMonth, 0).getDate();
        const endDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

        return getGithubActivity(
          account.accessToken,
          startDate,
          endDate
        );
      }
    }
    return [];
  })();

  // Fetch summary data, passing the githubEvents promise
  const summaryDataPromise = getCalendarSummaryForMonth(currentYear, currentMonth, githubEventsPromise);

  // Wait for all data to be ready
  const [summaryData, calendarColors] = await Promise.all([
    summaryDataPromise,
    calendarColorsPromise
  ]);

  return (
    <div className="md:space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            View your daily activities, moods, media, parks, journals, and tasks
          </p>
        </div>
      </div>

      <CalendarPageClient
        year={currentYear}
        month={currentMonth}
        summaryData={summaryData}
        colors={calendarColors}
      />
    </div>
  );
}
