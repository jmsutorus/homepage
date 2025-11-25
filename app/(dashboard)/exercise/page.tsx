import { getDatabase } from "@/lib/db";
import { ExercisePageClient } from "./page-client";
import { getUserId } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function ExercisePage() {
  const currentUserId = await getUserId();

  // Get athlete data for Strava sync
  const db = getDatabase();
  const athlete = db
    .prepare("SELECT id, last_sync FROM strava_athlete WHERE userId = ? ORDER BY last_sync DESC LIMIT 1")
    .get(currentUserId) as { id: number; last_sync: string } | undefined;

  return <ExercisePageClient athleteId={athlete?.id} lastSync={athlete?.last_sync} />;
}
