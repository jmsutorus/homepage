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
  type Habit,
  type HabitStats
} from "@/lib/db/habits";
import { revalidatePath } from "next/cache";

export interface HabitWithStats extends Habit {
  stats: HabitStats;
}

export async function getHabitsAction() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return getHabits(session.user.id);
}

export async function getHabitsWithStatsAction(): Promise<HabitWithStats[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const habits = getAllHabits(session.user.id);
  return habits.map(habit => ({
    ...habit,
    stats: getHabitStats(habit, session.user.id)
  }));
}

export async function getAllHabitsAction() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return getAllHabits(session.user.id);
}

export async function createHabitAction(data: {
  title: string;
  description?: string;
  frequency?: string;
  target?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const habit = createHabit(session.user.id, data);
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

  const habit = updateHabit(id, session.user.id, data);
  revalidatePath("/habits");
  revalidatePath("/daily/[date]", "page");
  return habit;
}

export async function completeHabitAction(id: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Mark the habit as completed and inactive
  const habit = updateHabit(id, session.user.id, { completed: true, active: false });
  revalidatePath("/habits");
  revalidatePath("/daily/[date]", "page");
  return habit;
}

export async function deleteHabitAction(id: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const success = deleteHabit(id, session.user.id);
  revalidatePath("/habits");
  revalidatePath("/daily/[date]", "page");
  return success;
}

export async function getHabitCompletionsAction(date: string) {
  const session = await auth();
  if (!session?.user?.id) return [];
  return getHabitCompletions(session.user.id, date);
}

export async function toggleHabitCompletionAction(habitId: number, date: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const completed = toggleHabitCompletion(habitId, session.user.id, date);
  revalidatePath("/daily/[date]", "page");
  revalidatePath("/"); // Revalidate calendar
  return completed;
}
