
import { notFound } from "next/navigation";
import { getWorkoutActivity } from "@/lib/db/workout-activities";
import { getUserId } from "@/lib/auth/server";
import { ExerciseDetailClient } from "./page-client";

export const dynamic = "force-dynamic";

interface ExerciseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ExerciseDetailPage(props: ExerciseDetailPageProps) {
  const params = await props.params;
  const userId = await getUserId();
  const activityId = parseInt(params.id);

  if (isNaN(activityId)) {
    notFound();
  }

  const activity = await getWorkoutActivity(activityId, userId);

  if (!activity) {
    notFound();
  }

  // Pass plain object to client
  const sanitizedActivity = JSON.parse(JSON.stringify(activity));

  return <ExerciseDetailClient activity={sanitizedActivity} />;
}
