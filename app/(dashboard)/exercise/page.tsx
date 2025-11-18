import { getDatabase } from "@/lib/db";
import { ExercisePageClient } from "./page-client";

export default function ExercisePage() {
  // Get athlete data for Strava sync
  const db = getDatabase();
  const athlete = db
    .prepare("SELECT id, last_sync FROM strava_athlete ORDER BY last_sync DESC LIMIT 1")
    .get() as { id: number; last_sync: string } | undefined;

  return <ExercisePageClient athleteId={athlete?.id} lastSync={athlete?.last_sync} />;
}
