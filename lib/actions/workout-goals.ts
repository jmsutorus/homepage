"use server";

import { getUserId } from "@/lib/auth/server";
import { createWorkoutGoal, markWorkoutGoalMet, deleteWorkoutGoal } from "@/lib/db/workout-goals";
import { revalidatePath } from "next/cache";

export async function addWorkoutGoalAction(goal: string) {
  const userId = await getUserId();
  await createWorkoutGoal(userId, goal);
  revalidatePath("/exercise");
  return { success: true };
}

export async function toggleWorkoutGoalMetAction(id: number, met: boolean) {
  const userId = await getUserId();
  await markWorkoutGoalMet(id, userId, met);
  revalidatePath("/exercise");
  return { success: true };
}

export async function deleteWorkoutGoalAction(id: number) {
  const userId = await getUserId();
  await deleteWorkoutGoal(id, userId);
  revalidatePath("/exercise");
  return { success: true };
}
