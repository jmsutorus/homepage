import { getGoalsWithProgressAction } from "@/lib/actions/goals";
import { GoalsPageClient } from "./page-client";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const goals = await getGoalsWithProgressAction({ includeArchived: true });

  return <GoalsPageClient initialGoals={goals} />;
}
