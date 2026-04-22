import { getHabitsWithStatsAction } from "@/lib/actions/habits";
import { HabitsPageClient } from "./page-client";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const habits = await getHabitsWithStatsAction();
  return <HabitsPageClient habits={habits} />;
}
