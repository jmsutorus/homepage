import { queryOne } from "@/lib/db";
import { ExercisePageClient } from "./page-client";
import { getUserId } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function ExercisePage() {
  const currentUserId = await getUserId();

  // Get athlete data for Strava sync
  const athlete = await queryOne<{ id: number; last_sync: string }>(
    "SELECT id, last_sync FROM strava_athlete WHERE userId = ? ORDER BY last_sync DESC LIMIT 1",
    [currentUserId]
  );

  return <ExercisePageClient athleteId={athlete?.id} lastSync={athlete?.last_sync} />;
}
