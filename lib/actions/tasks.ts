"use server";

import { toggleTaskComplete } from "@/lib/db/tasks";
import { revalidatePath } from "next/cache";
import { getUserId } from "@/lib/auth/server";

export async function toggleTaskCompleteAction(taskId: number) {
  const userId = await getUserId();
  const success = await toggleTaskComplete(taskId, userId);
  
  if (success) {
    revalidatePath("/daily/[date]", "page");
    revalidatePath("/tasks", "page");
    revalidatePath("/calendar", "page");
  }
  
  return success;
}
