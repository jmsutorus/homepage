import { queryOne } from "@/lib/db";
import { ExercisePageClient } from "./page-client";
import { getUserId } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

import { 
  getUpcomingWorkoutActivities, 
  getWorkoutActivitiesByDateRange 
} from "@/lib/db/workout-activities";
import { 
  getActivitiesByUserId, 
  getActivityStatsByUserId, 
  getYTDStatsByUserId 
} from "@/lib/db/strava";
import { startOfMonth, endOfMonth, format } from "date-fns";

export default async function ExercisePage() {
  const currentUserId = await getUserId();
  const now = new Date();
  const startOfMonthStr = format(startOfMonth(now), "yyyy-MM-dd");
  const endOfMonthStr = format(endOfMonth(now), "yyyy-MM-dd");

  const [
    athlete,
    upcomingActivities,
    calendarActivities,
    stravaActivities,
    activityStats,
    ytdStats
  ] = await Promise.all([
    queryOne<{ id: number; last_sync: string }>(
      "SELECT id, last_sync FROM strava_athlete WHERE userId = ? ORDER BY last_sync DESC LIMIT 1",
      [currentUserId]
    ),
    getUpcomingWorkoutActivities(currentUserId, 3),
    getWorkoutActivitiesByDateRange(startOfMonthStr, endOfMonthStr, currentUserId),
    getActivitiesByUserId(currentUserId, 200),
    getActivityStatsByUserId(currentUserId),
    getYTDStatsByUserId(currentUserId)
  ]);

  const initialStats = {
    allTime: activityStats,
    yearToDate: ytdStats
  };

  return (
    <ExercisePageClient 
      athleteId={athlete?.id} 
      lastSync={athlete?.last_sync}
      initialUpcomingActivities={upcomingActivities}
      initialCalendarActivities={calendarActivities}
      initialStravaActivities={stravaActivities}
      initialStats={initialStats}
    />
  );
}
