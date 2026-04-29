import { TasksTableClient } from "./table-client";
import { getAllTasks, getAllTaskCategories, getCustomTaskStatuses } from "@/lib/db/tasks";
import { getUserId } from "@/lib/auth/server";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function TasksTablePage() {
  const userId = await getUserId();

  const [tasks, categories, customStatuses] = await Promise.all([
    getAllTasks({}, userId),
    getAllTaskCategories(userId),
    getCustomTaskStatuses(userId),
  ]);

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20 font-lexend text-media-on-surface-variant">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-media-primary mr-3"></div>
        Loading database...
      </div>
    }>
      <TasksTableClient 
        initialTasks={tasks} 
        categories={categories}
        statuses={customStatuses}
      />
    </Suspense>
  );
}
