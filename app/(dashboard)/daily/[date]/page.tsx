import { getDailyJournalByDate } from "@/lib/db/journals";
import { getHabitsAction, getHabitCompletionsAction } from "@/lib/actions/habits";
import { getMoodForDate } from "@/lib/db/journals";
import { getCalendarDataForDate } from "@/lib/db/calendar";
import { auth } from "@/auth";
import { getGithubEventsForDate } from "@/lib/db/github";
import { queryOne } from "@/lib/db";
import { getCalendarColorsObject } from "@/lib/db/calendar-colors";
import { getDuolingoCompletion } from "@/lib/db/duolingo";
import { getDailyMealsByDate } from "@/lib/db/daily-meals";
import { getAllMeals } from "@/lib/db/meals";


interface DailyPageProps {
  params: Promise<{
    date: string;
  }>;
}

import DailyPageClient from "./daily-page-client";

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

      const duolingoCompletion = await getDuolingoCompletion(userId, date);

      return { 
        journal, 
        mood, 
        allRelevantTasks, 
        upcomingGoals, 
        upcomingMilestones, 
        completedGoals, 
        completedMilestones, 
        colors, 
        hasDuolingo: !!duolingoAccount, 
        duolingoCompleted: !!duolingoCompletion, 
        dailyMeals, 
        availableRecipes 
      };
    })(),
    allHabitsPromise,
    completionsPromise,
    dailyDataPromise
  ]);

  const habits = allHabits.filter(habit => {
    const habitCreatedDate = habit.created_at.split('T')[0].split(' ')[0];
    return habitCreatedDate <= date;
  });

  return (
    <DailyPageClient
      date={date}
      journal={userData?.journal}
      mood={userData?.mood}
      habits={habits}
      completions={completions}
      dailyData={dailyData}
      hasDuolingo={userData?.hasDuolingo ?? false}
      duolingoCompleted={userData?.duolingoCompleted ?? false}
      dailyMeals={userData?.dailyMeals ?? []}
      availableRecipes={userData?.availableRecipes ?? []}
      completedGoals={userData?.completedGoals ?? []}
      completedMilestones={userData?.completedMilestones ?? []}
      upcomingGoals={userData?.upcomingGoals ?? []}
      upcomingMilestones={userData?.upcomingMilestones ?? []}
      prevDate={prevDate}
      nextDate={nextDate}
    />
  );
}
