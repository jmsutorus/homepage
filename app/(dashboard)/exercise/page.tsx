import { queryOne } from "@/lib/db";
import { ExercisePageClient } from "./page-client";
import { getUserId } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

import { 
  getUpcomingWorkoutActivities, 
  getRecentWorkoutActivities,
  getCompletedWorkoutActivities,
  getWorkoutActivityStats,
} from "@/lib/db/workout-activities";
import {
  getExerciseSettings,
  getPersonalRecords
} from "@/lib/db/personal-records";

export default async function ExercisePage() {
  const currentUserId = await getUserId();
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
  const endOfYear = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];

  const [
    upcomingActivities,
    recentActivities,
    completedActivities,
    workoutStats,
    exerciseSettings,
    personalRecords
  ] = await Promise.all([
    getUpcomingWorkoutActivities(currentUserId, 3),
    getRecentWorkoutActivities(currentUserId, 5),
    getCompletedWorkoutActivities(currentUserId, 20),
    getWorkoutActivityStats(currentUserId, startOfYear, endOfYear),
    getExerciseSettings(currentUserId),
    getPersonalRecords(currentUserId)
  ]);

  // Sanitize data to ensure plain objects are passed to Client Component
  const sanitizedUpcoming = JSON.parse(JSON.stringify(upcomingActivities));
  const sanitizedRecent = JSON.parse(JSON.stringify(recentActivities));
  const sanitizedCompleted = JSON.parse(JSON.stringify(completedActivities));
  const sanitizedStats = JSON.parse(JSON.stringify(workoutStats));
  const sanitizedSettings = JSON.parse(JSON.stringify(exerciseSettings));
  const sanitizedRecords = JSON.parse(JSON.stringify(personalRecords));

  return (
    <ExercisePageClient 
      initialUpcomingActivities={sanitizedUpcoming}
      initialRecentActivities={sanitizedRecent}
      initialCompletedActivities={sanitizedCompleted}
      initialStats={sanitizedStats}
      initialSettings={sanitizedSettings}
      initialRecords={sanitizedRecords}
    />
  );
}

