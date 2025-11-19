"use server";

import { toggleTaskComplete } from "@/lib/db/tasks";
import { revalidatePath } from "next/cache";

export async function toggleTaskCompleteAction(taskId: number) {
  const success = toggleTaskComplete(taskId);
  
  if (success) {
    revalidatePath("/daily/[date]", "page");
    revalidatePath("/tasks", "page");
    revalidatePath("/calendar", "page");
  }
  
  return success;
}
