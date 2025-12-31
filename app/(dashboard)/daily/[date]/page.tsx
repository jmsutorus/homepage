import { getDailyJournalByDate } from "@/lib/db/journals";
import { getHabitsAction, getHabitCompletionsAction } from "@/lib/actions/habits";
import { formatDateLongSafe } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { DailyHabits } from "@/components/widgets/habits/daily-habits";
import { DailyJournalPreview } from "@/components/widgets/journal/daily-journal-preview";
import { MoodSelector } from "@/components/widgets/mood/mood-selector";
import { getMoodForDate } from "@/lib/db/journals";
import { getCalendarDataForDate } from "@/lib/db/calendar";
import type { CalendarVacation } from "@/lib/db/calendar";
import { auth } from "@/auth";
import { getGithubEventsForDate } from "@/lib/db/github";
import { queryOne } from "@/lib/db";
import { DailyActivities } from "@/components/widgets/daily/daily-activities";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { getCalendarColorsObject } from "@/lib/db/calendar-colors";
import { DuolingoCompletionToggle } from "@/components/widgets/duolingo/duolingo-completion-toggle";
import { getDuolingoCompletion } from "@/lib/db/duolingo";
import { DailyMeals } from "@/components/widgets/daily/daily-meals";
import { getDailyMealsByDate } from "@/lib/db/daily-meals";
import { getAllMeals } from "@/lib/db/meals";
import { DailyVacations } from "@/components/widgets/daily/daily-vacations";
import { DailyRestaurants } from "@/components/widgets/daily/daily-restaurants";

interface DailyPageProps {
  params: Promise<{
    date: string;
  }>;
}

export default async function DailyPage({ params }: DailyPageProps) {
  const { date } = await params;

  const dateObj = new Date(date);

  const prevDateObj = new Date(dateObj);
  prevDateObj.setDate(prevDateObj.getDate() - 1);
  const prevDate = prevDateObj.toISOString().split("T")[0];

  const nextDateObj = new Date(dateObj);
  nextDateObj.setDate(nextDateObj.getDate() + 1);
  const nextDate = nextDateObj.toISOString().split("T")[0];

  // Calculate the date range: 7 days before to 7 days after
  const viewedDate = new Date(date);
  const weekBefore = new Date(viewedDate);
  weekBefore.setDate(weekBefore.getDate() - 7);
  const weekAfter = new Date(viewedDate);
  weekAfter.setDate(weekAfter.getDate() + 7);

  const startDateStr = weekBefore.toISOString().split("T")[0];
  const endDateStr = weekAfter.toISOString().split("T")[0];

  // Start fetching auth immediately
  const sessionPromise = auth();

  // Import functions dynamically to avoid blocking
  const { getTasksInRange, getUpcomingGoals, getUpcomingMilestones, getGoalsCompletedOnDate, getMilestonesCompletedOnDate } = await import("@/lib/db/calendar");



  // Start independent fetches
  const allHabitsPromise = getHabitsAction();
  const completionsPromise = getHabitCompletionsAction(date);

  // Wait for user data to get githubEvents for calendar data
  // Note: getCalendarDataForDate accepts a promise for githubEvents, so we can start it early if we extract that promise
  // But here we wrapped it in userDataPromise. Let's just wait for userDataPromise for simplicity as it bundles most things.
  // Actually, to fully optimize, we should pass the githubEvents promise to getCalendarDataForDate.
  
  // Let's reconstruct to allow passing the promise.
  const session = await sessionPromise;
  const userId = session?.user?.id;

  let githubEventsPromise: Promise<any[]> = Promise.resolve([]);
  if (userId) {
    // Read GitHub events from synced database
    githubEventsPromise = getGithubEventsForDate(userId, date);
  }

  const dailyDataPromise = getCalendarDataForDate(date, githubEventsPromise);

  // Now fetch the rest in parallel
  const [
    userData,
    allHabits,
    completions,
    dailyData
  ] = await Promise.all([
    (async () => {
      if (!userId) return null;
      const [
        journal,
        mood,
        allRelevantTasks,
        upcomingGoals,
        upcomingMilestones,
        completedGoals,
        completedMilestones,
        colors,
        dailyMeals,
        availableRecipes
      ] = await Promise.all([
        getDailyJournalByDate(date, userId),
        getMoodForDate(date, userId),
        getTasksInRange(startDateStr, endDateStr, userId),
        getUpcomingGoals(userId, date, endDateStr),
        getUpcomingMilestones(userId, date, endDateStr),
        getGoalsCompletedOnDate(userId, date),
        getMilestonesCompletedOnDate(userId, date),
        getCalendarColorsObject(userId),
        getDailyMealsByDate(userId, date),
        getAllMeals(userId)
      ]);

      // Check if user has Duolingo connected
      const duolingoAccount = await queryOne<{ accountId: string }>(
        "SELECT accountId FROM account WHERE userId = ? AND providerId = 'duolingo'",
        [userId]
      );

      let duolingoCompletion = null;
      if (duolingoAccount) {
        duolingoCompletion = await getDuolingoCompletion(userId, date);
      }

      return { journal, mood, allRelevantTasks, upcomingGoals, upcomingMilestones, completedGoals, completedMilestones, colors, hasDuolingo: !!duolingoAccount, duolingoCompleted: !!duolingoCompletion, dailyMeals, availableRecipes };
    })(),
    allHabitsPromise,
    completionsPromise,
    dailyDataPromise
  ]);

  // Extract vacation data from dailyData
  const vacations: CalendarVacation[] = dailyData?.vacations ?? [];
  const restaurantVisits = dailyData?.restaurantVisits ?? [];

  const journal = userData?.journal ?? null;
  const mood = userData?.mood ?? null;
  const allRelevantTasks = userData?.allRelevantTasks ?? [];
  const upcomingGoals = userData?.upcomingGoals ?? [];
  const upcomingMilestones = userData?.upcomingMilestones ?? [];
  const completedGoals = userData?.completedGoals ?? [];
  const completedMilestones = userData?.completedMilestones ?? [];
  const colors = userData?.colors ?? {};
  const hasDuolingo = userData?.hasDuolingo ?? false;
  const duolingoCompleted = userData?.duolingoCompleted ?? false;
  const dailyMeals = userData?.dailyMeals ?? [];
  const availableRecipes = userData?.availableRecipes ?? [];

  // Filter habits to only show those created on or before the page date
  const habits = allHabits.filter(habit => {
    // Handle both ISO format (2024-01-15T10:30:00) and SQLite format (2024-01-15 10:30:00)
    const habitCreatedDate = habit.created_at.split('T')[0].split(' ')[0];
    return habitCreatedDate <= date;
  });

  // Debug: Log the date range and tasks found
  console.log(`[Daily Page] Viewing date: ${date}`);
  console.log(`[Daily Page] Fetching tasks from ${startDateStr} to ${endDateStr}`);
  console.log(`[Daily Page] Found ${allRelevantTasks.length} tasks:`, allRelevantTasks.map(t => ({
    id: t.id,
    title: t.title,
    due_date: t.due_date,
    completed: t.completed
  })));

  // Categorize tasks based on their due date relative to the viewed date
  const completedTasks = allRelevantTasks.filter((t) => t.completed && t.completed_date?.split("T")[0] === date) ?? [];

  // Overdue: incomplete tasks with due date before the viewed date (from past 7 days)
  const overdueTasks = allRelevantTasks.filter((t) => {
    if (!t.due_date || t.completed) return false;
    const taskDueDate = t.due_date.split("T")[0];
    return taskDueDate < date;
  }) ?? [];

  // Upcoming: incomplete tasks with due date on or after the viewed date (up to 7 days ahead)
  const upcomingTasks = allRelevantTasks.filter((t) => {
    if (!t.due_date || t.completed) return false;
    const taskDueDate = t.due_date.split("T")[0];
    return taskDueDate >= date;
  }) ?? [];

  // Workout activities
  const upcomingWorkoutActivities = dailyData?.workoutActivities.filter((w) => !w.completed) ?? [];
  const completedWorkoutActivities = dailyData?.workoutActivities.filter((w) => w.completed) ?? [];

  // Get IDs of Strava activities that are linked to completed workouts
  const linkedStravaActivityIds = new Set(
    completedWorkoutActivities
      .filter((w) => w.strava_activity_id)
      .map((w) => w.strava_activity_id!)
  );

  // Filter out Strava activities that are already linked to completed workouts
  const unlinkedStravaActivities = dailyData?.activities.filter(
    (activity) => !linkedStravaActivityIds.has(activity.id)
  ) ?? [];

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8 space-y-4">
        <PageBreadcrumb
          items={[
            { label: "Calendar", href: "/calendar" },
            { label: formatDateLongSafe(date, "en-US") },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {formatDateLongSafe(date, "en-US")}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              Daily Dashboard
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild className="h-10 w-10">
              <Link href={`/daily/${prevDate}`}>
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Previous day</span>
              </Link>
            </Button>
            <Button variant="outline" size="icon" asChild className="h-10 w-10">
              <Link href={`/daily/${nextDate}`}>
                <ChevronRight className="h-5 w-5" />
                <span className="sr-only">Next day</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:gap-8 md:grid-cols-[2fr_1fr]">
        <div className="space-y-6 md:space-y-8">
          {/* Habits Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Habits</h2>
              <Button variant="ghost" size="sm" asChild className="cursor-pointer">
                <Link href="/habits">Manage</Link>
              </Button>
            </div>
            <DailyHabits 
              habits={habits} 
              completions={completions} 
              date={date} 
            />
          </section>

          {/* Journal Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Daily Journal</h2>
              {!journal && (
                <Button size="sm" asChild className="cursor-pointer">
                  <Link href={`/journals/new?type=daily&date=${date}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Entry
                  </Link>
                </Button>
              )}
            </div>
            {journal ? (
              <DailyJournalPreview journal={journal} />
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                No journal entry for this day.
              </div>
            )}
          </section>

            {/* Vacations Section */}
          {vacations.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Vacations</h2>
                <Button variant="ghost" size="sm" asChild className="cursor-pointer">
                  <Link href="/vacations">All Vacations</Link>
                </Button>
              </div>
              <DailyVacations vacations={vacations} />
            </section>
          )}

          {/* Restaurants Section */}
          {restaurantVisits.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Restaurants</h2>
                <Button variant="ghost" size="sm" asChild className="cursor-pointer">
                  <Link href="/restaurants">All Restaurants</Link>
                </Button>
              </div>
              <DailyRestaurants visits={restaurantVisits} />
            </section>
          )}

          <DailyActivities
            dailyData={dailyData}
            overdueTasks={overdueTasks}
            upcomingTasks={upcomingTasks}
            completedTasks={completedTasks}
            unlinkedStravaActivities={unlinkedStravaActivities}
            upcomingWorkoutActivities={upcomingWorkoutActivities}
            completedWorkoutActivities={completedWorkoutActivities}
            upcomingGoals={upcomingGoals}
            upcomingMilestones={upcomingMilestones}
            completedGoals={completedGoals}
            completedMilestones={completedMilestones}
            colors={colors}
          />
        </div>

        <div className="space-y-6 md:space-y-8">
          {/* Mood Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Mood</h2>
            <MoodSelector date={date} currentMood={mood} />
          </section>

          {/* Duolingo Section - only show if connected */}
          {hasDuolingo && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Duolingo</h2>
              <DuolingoCompletionToggle date={date} isCompleted={duolingoCompleted} />
            </section>
          )}

          {/* Daily Meals Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Meals</h2>
              <Button variant="ghost" size="sm" asChild className="cursor-pointer">
                <Link href="/recipes">Recipes</Link>
              </Button>
            </div>
            <DailyMeals
              date={date}
              initialDailyMeals={dailyMeals}
              availableRecipes={availableRecipes}
            />
          </section>

          {/* Stats/Summary Section */}
          <section className="rounded-lg border bg-card p-4">
            <h3 className="font-medium mb-2">Summary</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              { habits.length > 0 &&
              <div className="flex justify-between">
                <span>Habits Completed</span>
                <span className="font-medium">
                  {completions.length}/{habits.length}
                </span>
              </div>
              }
              {dailyData && (
                <>
                  <div className="flex justify-between">
                    <span>Tasks Completed</span>
                    <span className="font-medium">
                      {completedTasks.length}/{allRelevantTasks.length}
                    </span>
                  </div>
                  { dailyData.events.length > 0 &&
                  <div className="flex justify-between">
                    <span>Events</span>
                    <span className="font-medium">
                      {dailyData.events.length}
                    </span>
                  </div>
                  }
                  { dailyData.githubEvents.length > 0 &&
                  <div className="flex justify-between">
                    <span>GitHub</span>
                    <span className="font-medium">
                      {dailyData.githubEvents.length}
                    </span>
                  </div>
                  }
                  { dailyData.media.length > 0 &&
                  <div className="flex justify-between">
                    <span>Media</span>
                    <span className="font-medium">
                      {dailyData.media.length}
                    </span>
                  </div>
                  }
                  { dailyData.parks.length > 0 &&
                  <div className="flex justify-between">
                    <span>Parks</span>
                    <span className="font-medium">
                      {dailyData.parks.length}
                    </span>
                  </div>
                  }
                  { dailyData.restaurantVisits.length > 0 &&
                  <div className="flex justify-between">
                    <span>Restaurants</span>
                    <span className="font-medium">
                      {dailyData.restaurantVisits.length}
                    </span>
                  </div>
                  }
                  { dailyData.journals.length > 0 &&
                  <div className="flex justify-between">
                    <span>Journals</span>
                    <span className="font-medium">
                      {dailyData.journals.length}
                    </span>
                  </div>
                  }
                  { dailyData.workoutActivities.length > 0 &&
                  <div className="flex justify-between">
                    <span>Workouts</span>
                    <span className="font-medium">
                      {dailyData.workoutActivities.length}
                    </span>
                  </div>
                  }
                  { dailyData.activities.length > 0 &&
                  <div className="flex justify-between">
                    <span>Strava</span>
                    <span className="font-medium">
                      {dailyData.activities.length}
                    </span>
                  </div>
                  }
                  { (completedGoals.length > 0 || completedMilestones.length > 0) &&
                  <div className="flex justify-between">
                    <span>Goals/Milestones Done</span>
                    <span className="font-medium">
                      {completedGoals.length + completedMilestones.length}
                    </span>
                  </div>
                  }
                  { (upcomingGoals.length > 0 || upcomingMilestones.length > 0) &&
                  <div className="flex justify-between">
                    <span>Upcoming Goals</span>
                    <span className="font-medium">
                      {upcomingGoals.length + upcomingMilestones.length}
                    </span>
                  </div>
                  }
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
