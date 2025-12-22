import { queryOne } from "@/lib/db";
import { ExercisePageClient } from "./page-client";
import { getUserId } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

import { 
  getUpcomingWorkoutActivities, 
  getRecentWorkoutActivities,
  getCompletedWorkoutActivities,
} from "@/lib/db/workout-activities";
import { 
  getActivitiesByUserId, 
  getActivityStatsByUserId, 
  getYTDStatsByUserId 
} from "@/lib/db/strava";

export default async function ExercisePage() {
  const currentUserId = await getUserId();

  const [
    athlete,
    upcomingActivities,
    recentActivities,
    completedActivities,
    stravaActivities,
    activityStats,
    ytdStats
  ] = await Promise.all([
    queryOne<{ id: number; last_sync: string }>(
      "SELECT id, last_sync FROM strava_athlete WHERE userId = ? ORDER BY last_sync DESC LIMIT 1",
      [currentUserId]
    ),
    getUpcomingWorkoutActivities(currentUserId, 3),
    getRecentWorkoutActivities(currentUserId, 5),
    getCompletedWorkoutActivities(currentUserId, 20),
    getActivitiesByUserId(currentUserId, 200),
    getActivityStatsByUserId(currentUserId),
    getYTDStatsByUserId(currentUserId)
  ]);

  const initialStats = {
    allTime: activityStats,
    yearToDate: ytdStats
  };

  // Sanitize data to ensure plain objects are passed to Client Component
  const sanitizedAthlete = athlete ? JSON.parse(JSON.stringify(athlete)) : undefined;
  const sanitizedUpcoming = JSON.parse(JSON.stringify(upcomingActivities));
  const sanitizedRecent = JSON.parse(JSON.stringify(recentActivities));
  const sanitizedCompleted = JSON.parse(JSON.stringify(completedActivities));
  const sanitizedStrava = JSON.parse(JSON.stringify(stravaActivities));
  const sanitizedStats = JSON.parse(JSON.stringify(initialStats));

  return (
    <ExercisePageClient 
      athleteId={sanitizedAthlete?.id} 
      lastSync={sanitizedAthlete?.last_sync}
      initialUpcomingActivities={sanitizedUpcoming}
      initialRecentActivities={sanitizedRecent}
      initialCompletedActivities={sanitizedCompleted}
      initialStravaActivities={sanitizedStrava}
      initialStats={sanitizedStats}
    />
  );
}

