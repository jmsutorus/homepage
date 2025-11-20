import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuickLinks } from "@/components/widgets/quick-links/quick-links";
import { getRecentlyCompletedMedia } from "@/lib/media";
import { MediaCard } from "@/components/widgets/media/media-card";
import { SteamStatus } from "@/components/widgets/steam/steam-status";
import { HomeAssistantWidget } from "@/components/widgets/home-assistant/home-assistant-widget";
import { PlexStatus } from "@/components/widgets/media/plex-status";
import { MiniCalendar } from "@/components/widgets/calendar/mini-calendar";
import { RecentTasks } from "@/components/widgets/tasks/recent-tasks";
import { ArrowRight } from "lucide-react";
import { getUserId } from "@/lib/auth/server";
import { getCalendarDataForMonth } from "@/lib/db/calendar";
import { auth } from "@/auth";
import { getGithubActivity } from "@/lib/github";
import { queryOne } from "@/lib/db";
import { getCalendarColorsForUser } from "@/lib/actions/calendar-colors";

import { ActionBanner } from "@/components/widgets/action-banner";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  // Require authentication
  const userId = await getUserId();

  // Get recently completed media sorted by completion date (most recent first)
  const recentMedia = getRecentlyCompletedMedia(4);

  // Get calendar data for current month
  const params = await searchParams;
  const now = new Date();
  const currentYear = params.year ? parseInt(params.year) : now.getFullYear();
  const currentMonth = params.month ? parseInt(params.month) : now.getMonth() + 1;

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

  const calendarData = await getCalendarDataForMonth(currentYear, currentMonth, githubEvents);
  const calendarColors = await getCalendarColorsForUser();

  return (
    <div className="space-y-8">
      <ActionBanner />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your personal homepage
        </p>
      </div>

      {/* Quick Links */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Quick Links</h2>
        </div>
        <QuickLinks />
      </section>

      {/* Calendar & Recent Tasks */}
      <section className="grid gap-4 md:grid-cols-2">
        <MiniCalendar year={currentYear} month={currentMonth} calendarData={calendarData} colors={calendarColors} />
        <RecentTasks />
      </section>

      {/* Recently Completed Media */}
      {recentMedia.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Recently Completed</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/media">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {recentMedia.map((item) => (
              <MediaCard key={`${item.frontmatter.type}-${item.slug}`} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Gaming & Services */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Gaming & Services</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Steam Widget */}
          <SteamStatus />

          {/* Plex Widget */}
          <PlexStatus />

          {/* Home Assistant Widget */}
          <HomeAssistantWidget />
        </div>
      </section>
    </div>
  );
}
