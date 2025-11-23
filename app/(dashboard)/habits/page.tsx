import { getHabitsWithStatsAction, getHabitCompletionsForChartAction } from "@/lib/actions/habits";
import { HabitsList } from "@/components/widgets/habits/habits-list";
import { CreateHabitForm } from "@/components/widgets/habits/create-habit-form";
import { HabitCompletionChart } from "@/components/widgets/habits/habit-completion-chart";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const [habits, chartData] = await Promise.all([
    getHabitsWithStatsAction(),
    getHabitCompletionsForChartAction(),
  ]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habit Tracker</h1>
          <p className="text-muted-foreground">
            Manage your daily habits and track your consistency
          </p>
        </div>
        <CreateHabitForm />
      </div>

      <div className="space-y-8">
        <HabitCompletionChart data={chartData} />
        <HabitsList habits={habits} />
      </div>
    </div>
  );
}
