import { getHabitsWithStatsAction, getHabitCompletionsForChartAction } from "@/lib/actions/habits";
import { HabitsList } from "@/components/widgets/habits/habits-list";
import { CreateHabitForm } from "@/components/widgets/habits/create-habit-form";
import { HabitCompletionChart } from "@/components/widgets/habits/habit-completion-chart";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const [habits, chartData] = await Promise.all([
    await getHabitsWithStatsAction(),
    await getHabitCompletionsForChartAction(),
  ]);

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Habit Tracker</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your daily habits and track your consistency
          </p>
        </div>
        <CreateHabitForm />
      </div>

      <div className="space-y-6 sm:space-y-8">
        <HabitCompletionChart data={chartData} />
        <HabitsList habits={habits} />
      </div>
    </div>
  );
}
