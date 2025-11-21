import { getCalendarSummaryForMonth } from "@/lib/db/calendar";
import { CalendarView } from "@/components/widgets/calendar/calendar-view";
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

  // Fetch GitHub activity if user is authenticated and has linked account
  const session = await auth();
  let githubEvents: any[] = [];

  if (session?.user?.id) {
    // Get GitHub token from account table
    const account = queryOne<{ accessToken: string }>(
      "SELECT accessToken FROM account WHERE userId = ? AND providerId = 'github'",
      [session.user.id]
    );

    if (account?.accessToken) {
      const startDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
      const lastDay = new Date(currentYear, currentMonth, 0).getDate();
      const endDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

      githubEvents = await getGithubActivity(
        account.accessToken,
        startDate,
        endDate
      );
    }
  }

  // Use lightweight summary data for initial render (optimized for calendar grid)
  // Full day details are lazy-loaded on demand when user clicks a day
  const summaryData = await getCalendarSummaryForMonth(currentYear, currentMonth, githubEvents);
  const calendarColors = await getCalendarColorsForUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">
          View your daily activities, moods, media, parks, journals, and tasks
        </p>
      </div>

      <CalendarView
        year={currentYear}
        month={currentMonth}
        summaryData={summaryData}
        colors={calendarColors}
      />
    </div>
  );
}
