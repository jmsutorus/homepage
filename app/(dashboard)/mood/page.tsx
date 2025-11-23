import { MoodDashboard } from "@/components/widgets/mood/mood-dashboard";
import { getMoodEntriesForYear } from "@/lib/db/mood";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MoodPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const currentYear = new Date().getFullYear();
  const moodData = await getMoodEntriesForYear(currentYear, session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mood Tracker</h1>
        <p className="text-muted-foreground">
          Track your daily mood with year-in-pixels visualization
        </p>
      </div>

      <MoodDashboard initialMoodData={moodData} year={currentYear} />
    </div>
  );
}
