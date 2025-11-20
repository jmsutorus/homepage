import { getHabitsWithStatsAction } from "@/lib/actions/habits";
import { HabitsList } from "@/components/widgets/habits/habits-list";
import { CreateHabitForm } from "@/components/widgets/habits/create-habit-form";

export default async function HabitsPage() {
  const habits = await getHabitsWithStatsAction();

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

      <HabitsList habits={habits} />
    </div>
  );
}
