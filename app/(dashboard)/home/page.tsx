import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuickLinks } from "@/components/widgets/quick-links/quick-links";
import { getRecentlyCompletedMedia } from "@/lib/media";
import { SteamStatus } from "@/components/widgets/steam/steam-status";
import { HomeAssistantWidget } from "@/components/widgets/home-assistant/home-assistant-widget";
import { PlexStatus } from "@/components/widgets/media/plex-status";
import { MiniCalendar } from "@/components/widgets/calendar/mini-calendar";
import { RecentTasks } from "@/components/widgets/tasks/recent-tasks";
import { WeatherWidget } from "@/components/widgets/weather/weather-widget";
import { getUserId } from "@/lib/auth/server";
import { getCalendarDataForMonth } from "@/lib/db/calendar";
import { auth } from "@/auth";
import { getGithubEventsByDateRange } from "@/lib/db/github";
import { queryOne } from "@/lib/db";
import { getCalendarColorsForUser } from "@/lib/actions/calendar-colors";
import { getFeatureFlag } from "@/lib/flags";
import { ActionBanner } from "@/components/widgets/action-banner";
import { getHabits, getHabitCompletions } from "@/lib/db/habits";
import { getMoodEntry, getMoodEntriesInRange } from "@/lib/db/mood";
import { getAllParks } from "@/lib/db/parks";
import { getAllJournals } from "@/lib/db/journals";
import { getAthleteByUserId } from "@/lib/db/strava";
import { getGoalsWithProgress } from "@/lib/db/goals";
import { DailyHabits } from "@/components/widgets/habits/daily-habits";
import { MoodSummary } from "@/components/widgets/mood/mood-summary";
import { ParkSummary } from "@/components/widgets/parks/park-summary";
import { RecentActivity } from "@/components/widgets/exercise/recent-activity";
import { DailyJournalPreview } from "@/components/widgets/journal/daily-journal-preview";
import { HomeGoals } from "@/components/widgets/goals/home-goals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { ScratchPad } from "@/components/widgets/scratch-pad/scratch-pad";
import { DuolingoWidget } from "@/components/widgets/duolingo/duolingo-widget";
import { VacationModeBanner } from "@/components/widgets/vacations/vacation-mode-banner";
import { UpcomingVacations } from "@/components/widgets/vacations/upcoming-vacations";
import { getActiveVacation, getUpcomingVacations } from "@/lib/db/vacations";

export const dynamic = "force-dynamic";

// Serialize any data to plain objects (removes methods and prototypes)
function serialize<T>(data: T): T {
  if (data === null || data === undefined) return data;
  return JSON.parse(JSON.stringify(data));
}

// Serialize calendar data to plain objects
function serializeCalendarData(data: Record<string, any>) {
  // Helper to convert arrays to plain objects
  const serializeArray = (arr: any[]) => {
    if (!arr) return arr;
    return arr.map(item => {
      if (!item || typeof item !== 'object') return item;
      // Create a plain object with all enumerable properties
      return JSON.parse(JSON.stringify(item));
    });
  };

  return Object.fromEntries(
    Object.entries(data).map(([date, dayData]) => [
      date,
      {
        date: dayData.date,
        mood: dayData.mood ? JSON.parse(JSON.stringify(dayData.mood)) : null,
        activities: serializeArray(dayData.activities),
        media: serializeArray(dayData.media),
        tasks: serializeArray(dayData.tasks),
        events: serializeArray(dayData.events),
        parks: serializeArray(dayData.parks),
        journals: serializeArray(dayData.journals),
        workoutActivities: serializeArray(dayData.workoutActivities),
        githubEvents: serializeArray(dayData.githubEvents),
        habitCompletions: serializeArray(dayData.habitCompletions),
        duolingoCompleted: dayData.duolingoCompleted,
        goalsDue: serializeArray(dayData.goalsDue),
        goalsCompleted: serializeArray(dayData.goalsCompleted),
        milestonesDue: serializeArray(dayData.milestonesDue),
        milestonesCompleted: serializeArray(dayData.milestonesCompleted),
        relationshipItems: serializeArray(dayData.relationshipItems),
        dailyMeals: serializeArray(dayData.dailyMeals),
        vacations: serializeArray(dayData.vacations),
      }
    ])
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  // Require authentication
  const userId = await getUserId();
  const sessionPromise = auth();

  // Parse date params
  const params = await searchParams;
  const now = new Date();
  const currentYear = params.year ? parseInt(params.year) : now.getFullYear();
  const currentMonth = params.month ? parseInt(params.month) : now.getMonth() + 1;
  const todayStr = now.toISOString().split('T')[0];

  // Feature flags
  const isPlexEnabledPromise = getFeatureFlag("Plex", false);
  const isSteamEnabledPromise = getFeatureFlag("Steam", false);
  const isHomeAssistantEnabledPromise = getFeatureFlag("HomeAssistant", false);
  const isWeatherEnabledPromise = getFeatureFlag("Weather", false);

  // GitHub events fetch - from synced database
  const githubEventsPromise = (async () => {
    const session = await sessionPromise;
    if (session?.user?.id) {
      const startDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01T00:00:00Z`;
      const lastDay = new Date(currentYear, currentMonth, 0).getDate();
      const endDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59Z`;

      return getGithubEventsByDateRange(session.user.id, startDate, endDate);
    }
    return [];
  })();

  // Fetch data in parallel
  const [
    habitsRaw,
    habitCompletionsRaw,
    todayMoodRaw,
    recentMoodsRaw,
    allParksRaw,
    latestJournalRaw,
    recentMediaRaw,
    calendarColors,
    athleteRaw,
    activeGoalsRaw,
    recentActivitiesRaw,
    isPlexEnabled,
    isSteamEnabled,
    isHomeAssistantEnabled,
    isWeatherEnabled,
    calendarDataMap,
    activeVacationRaw,
    upcomingVacationsRaw
  ] = await Promise.all([
    getHabits(userId),
    getHabitCompletions(userId, todayStr),
    getMoodEntry(todayStr, userId),
    getMoodEntriesInRange(
      new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      todayStr,
      userId
    ),
    getAllParks(userId),
    getAllJournals(userId).then(journals => journals[0] || null),
    getRecentlyCompletedMedia(userId, 4),
    getCalendarColorsForUser(),
    getAthleteByUserId(userId),
    getGoalsWithProgress(userId, { status: ['not_started', 'in_progress'] }),
    // Use the new function to fetch activities directly by userId
    import("@/lib/db/strava").then(mod => mod.getActivitiesByUserId(userId, 5)),
    isPlexEnabledPromise,
    isSteamEnabledPromise,
    isHomeAssistantEnabledPromise,
    isWeatherEnabledPromise,
    // Pass the github events promise directly
    getCalendarDataForMonth(currentYear, currentMonth, githubEventsPromise),
    // Vacation data
    getActiveVacation(userId, todayStr),
    getUpcomingVacations(userId, todayStr, 30)
  ]);

  // Duolingo Fetch
  const duolingoData = await (async () => {
     try {
       const account = await queryOne<{ accountId: string }>(
        "SELECT accountId FROM account WHERE userId = ? AND providerId = 'duolingo'",
        [userId]
       );
       if (account?.accountId) {
          const { getDuolingoProfile } = await import("@/lib/api/duolingo");
          const { getDuolingoCompletion } = await import("@/lib/db/duolingo");
          const [profile, completion] = await Promise.all([
            getDuolingoProfile(userId),
            getDuolingoCompletion(userId, todayStr)
          ]);
          return { profile, isCompletedToday: !!completion };
       }
     } catch (e) {
       console.error("Error fetching Duolingo:", e);
     }
     return { profile: null, isCompletedToday: false };
  })();

  // Serialize all data for client components
  const habits = serialize(habitsRaw);
  const habitCompletions = serialize(habitCompletionsRaw);
  const todayMood = serialize(todayMoodRaw);
  const recentMoods = serialize(recentMoodsRaw);
  const allParks = serialize(allParksRaw);
  const latestJournal = serialize(latestJournalRaw);
  const recentMedia = serialize(recentMediaRaw);
  const activeGoals = serialize(activeGoalsRaw.slice(0, 3)); // Only show top 3 goals
  const recentActivities = serialize(recentActivitiesRaw);
  const duolingoProfileSerialized = serialize(duolingoData.profile);
  const duolingoIsCompletedToday = duolingoData.isCompletedToday;

  const calendarDataRaw = Object.fromEntries(calendarDataMap);
  const calendarData = serializeCalendarData(calendarDataRaw);

  // Vacation data
  const activeVacation = serialize(activeVacationRaw);
  const upcomingVacations = serialize(upcomingVacationsRaw);

  // Pick featured park or first park
  const featuredParkRaw = allParks.find(p => p.featured) ||
                       (allParks.length > 0 ? allParks[0] : null);
  const featuredPark = serialize(featuredParkRaw);

  return (
    <div className="space-y-6">
      {/* Vacation Mode Banner - shows when user is currently on vacation */}
      {activeVacation && (
        <VacationModeBanner vacation={activeVacation} todayDate={todayStr} />
      )}

      <ActionBanner />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Optional: Add global action buttons here */}
        </div>
      </div>

      {/* Scratch Pad */}
      <ScratchPad />

      {/* Quick Links */}
      <QuickLinks />

      {/* Upcoming Vacations - shows vacations within next 30 days */}
      {upcomingVacations.length > 0 && (
        <UpcomingVacations vacations={upcomingVacations} todayDate={todayStr} />
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Focus (Tasks & Habits) */}
        <div className="space-y-6">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Tasks</h2>
              <Button variant="ghost" size="sm" asChild className="h-6 text-xs">
                <Link href="/tasks">View All</Link>
              </Button>
            </div>
            <RecentTasks />
          </section>
          
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Habits</h2>
              <Button variant="ghost" size="sm" asChild className="h-6 text-xs">
                <Link href="/habits">View All</Link>
              </Button>
            </div>
            <Card>
              <CardContent className="pt-6">
                <DailyHabits
                  habits={habits}
                  completions={habitCompletions}
                  date={todayStr}
                />
              </CardContent>
            </Card>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Goals</h2>
              <Button variant="ghost" size="sm" asChild className="h-6 text-xs">
                <Link href="/goals">View All</Link>
              </Button>
            </div>
            <HomeGoals goals={activeGoals} />
          </section>
        </div>

        {/* Column 2: Life (Calendar, Mood, Journal) */}
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">Schedule</h2>
            <MiniCalendar 
              year={currentYear} 
              month={currentMonth} 
              calendarData={calendarData} 
              colors={calendarColors} 
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">Mind</h2>
            <div className="grid gap-4">
              <MoodSummary todayMood={todayMood} recentMoods={recentMoods} />
              
              {latestJournal && (
                <DailyJournalPreview journal={latestJournal} />
              )}
              {!latestJournal && (
                 <Card>
                   <CardContent className="pt-6 text-center">
                     <p className="text-sm text-muted-foreground mb-3">No journal entries yet.</p>
                     <Button variant="outline" size="sm" asChild>
                       <Link href="/journals">Start Journaling</Link>
                     </Button>
                   </CardContent>
                 </Card>
              )}
            </div>
          </section>
        </div>

        {/* Column 3: Leisure & Health (Exercise, Media, Parks, Weather) */}
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">Activity & Leisure</h2>
            
            {isWeatherEnabled && (
              <div className="mb-4">
                <WeatherWidget />
              </div>
            )}
            
            {/* Duolingo Widget */}
            {duolingoProfileSerialized && (
              <div className="mb-4">
                 <DuolingoWidget profile={duolingoProfileSerialized} isCompletedToday={duolingoIsCompletedToday} />
              </div>
            )}

            <div className="space-y-4">
              <RecentActivity activities={recentActivities} />
              
              <ParkSummary park={featuredPark} />

              {recentMedia.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">Recent Media</CardTitle>
                      <Button variant="ghost" size="sm" asChild className="h-6 text-xs">
                        <Link href="/media">View All</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {recentMedia.slice(0, 2).map((item) => (
                        <Link key={`${item.frontmatter.type}-${item.slug}`} href={`/media/${item.slug}`} className="block group">
                          <div className="aspect-[2/3] relative rounded-md overflow-hidden bg-muted">
                            {item.frontmatter.poster && (
                              <Image 
                                src={item.frontmatter.poster} 
                                alt={item.frontmatter.title} 
                                fill 
                                className="object-cover transition-transform group-hover:scale-105" 
                              />
                            )}
                          </div>
                          <p className="mt-1 text-xs font-medium truncate group-hover:text-primary">{item.frontmatter.title}</p>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          {(isSteamEnabled || isPlexEnabled || isHomeAssistantEnabled) && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">Services</h2>
              <div className="grid gap-3">
                {isSteamEnabled && <SteamStatus />}
                {isPlexEnabled && <PlexStatus />}
                {isHomeAssistantEnabled && <HomeAssistantWidget />}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
