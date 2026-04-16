import { getUserId } from "@/lib/auth/server";
import { getCompletedWorkoutActivities } from "@/lib/db/workout-activities";
import { HistoryPageClient } from "./history-client";

export const dynamic = "force-dynamic";

export default async function ExerciseHistoryPage() {
  const currentUserId = await getUserId();
  
  // Fetch all completed activities (using a high limit for "history")
  const completedActivities = await getCompletedWorkoutActivities(currentUserId, 500);

  // Sanitize data
  const sanitizedActivities = JSON.parse(JSON.stringify(completedActivities));

  return (
    <HistoryPageClient 
      initialActivities={sanitizedActivities}
    />
  );
}
