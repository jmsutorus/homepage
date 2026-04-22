import { getUserId } from "@/lib/auth/server";
import { getAllWorkoutActivities } from "@/lib/db/workout-activities";
import { HistoryPageClient } from "./history-client";

export const dynamic = "force-dynamic";

export default async function ExerciseHistoryPage() {
  const currentUserId = await getUserId();
  
  // Fetch all activities (using a high limit for "history")
  const activities = await getAllWorkoutActivities(currentUserId);

  // Sanitize data
  const sanitizedActivities = JSON.parse(JSON.stringify(activities));

  return (
    <HistoryPageClient 
      initialActivities={sanitizedActivities}
    />
  );
}
