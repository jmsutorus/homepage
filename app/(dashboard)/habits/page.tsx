import { getHabitsWithStatsAction, getHabitCompletionsForChartAction } from "@/lib/actions/habits";
import { HabitsPageClient } from "./page-client";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const [habits, chartData] = await Promise.all([
    getHabitsWithStatsAction(),
    getHabitCompletionsForChartAction(),
  ]);

  return <HabitsPageClient habits={habits} chartData={chartData} />;
}
