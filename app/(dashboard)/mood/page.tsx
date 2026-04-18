import { MoodPageClient } from "@/components/widgets/mood/mood-page-client";
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
    <MoodPageClient initialMoodData={moodData} userId={session.user.id} />
  );
}
