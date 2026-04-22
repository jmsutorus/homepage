import { getUserId } from "@/lib/auth/server";
import { getAllTasks, getAllTaskCategories, getCustomTaskStatuses } from "@/lib/db/tasks";
import { getTaskTemplates } from "@/lib/db/task-templates";
import { ManageClient } from "./manage-client";

export const dynamic = "force-dynamic";

export default async function ManageTasksPage() {
  const userId = await getUserId();

  const [tasks, categories, customStatuses, templates] = await Promise.all([
    getAllTasks({}, userId),
    getAllTaskCategories(), // This one doesn't take userId in the lib, it seems? Wait, let me re-check lib/db/tasks.ts
    getCustomTaskStatuses(userId),
    getTaskTemplates(userId),
  ]);

  return (
    <ManageClient
      initialTasks={tasks}
      initialCategories={categories}
      initialStatuses={customStatuses}
      initialTemplates={templates}
    />
  );
}
