"use server";

import { auth } from "@/auth";
import {
  getHabits,
  getAllHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  getHabitCompletions,
  toggleHabitCompletion,
  getHabitStats,
  getHabitCompletionsForChart,
  type Habit,
  type HabitStats,
  type HabitCompletionChartData
} from "@/lib/db/habits";
import { revalidatePath } from "next/cache";

export interface HabitWithStats extends Habit {
  stats: HabitStats;
}

export type { HabitCompletionChartData };

export async function getHabitsAction() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return await getHabits(session.user.id);
}

export async function getHabitsWithStatsAction(): Promise<HabitWithStats[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const habits = await getAllHabits(session.user.id);
  return await Promise.all(habits.map(async (habit) => ({
    ...habit,
    stats: await getHabitStats(habit, session.user.id)
  })));
}

export async function getAllHabitsAction() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return await getAllHabits(session.user.id);
}

export async function createHabitAction(data: {
  title: string;
  description?: string;
  frequency?: string;
  target?: number;
  createdAt?: string; // Optional client-provided timestamp in local time
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const habit = await createHabit(session.user.id, data);
  revalidatePath("/habits");
  revalidatePath("/daily/[date]", "page");
  return habit;
}

export async function updateHabitAction(id: number, data: {
  title?: string;
  description?: string;
  frequency?: string;
  target?: number;
  active?: boolean;
  completed?: boolean;
  order_index?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const habit = await updateHabit(id, session.user.id, data);
  revalidatePath("/habits");
  revalidatePath("/daily/[date]", "page");
  return habit;
}

export async function completeHabitAction(id: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Mark the habit as completed and inactive
  const habit = await updateHabit(id, session.user.id, { completed: true, active: false });
  revalidatePath("/habits");
  revalidatePath("/daily/[date]", "page");
  return habit;
}

export async function deleteHabitAction(id: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const success = await deleteHabit(id, session.user.id);
  revalidatePath("/habits");
  revalidatePath("/daily/[date]", "page");
  return success;
}

export async function getHabitCompletionsAction(date: string) {
  const session = await auth();
  if (!session?.user?.id) return [];
  return await getHabitCompletions(session.user.id, date);
}

export async function toggleHabitCompletionAction(habitId: number, date: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const completed = await toggleHabitCompletion(habitId, session.user.id, date);
  revalidatePath("/daily/[date]", "page");
  revalidatePath("/"); // Revalidate calendar
  return completed;
}

export async function getHabitCompletionsForChartAction(): Promise<HabitCompletionChartData[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  return await getHabitCompletionsForChart(session.user.id);
}
