import { TasksTableClient } from "./table-client";
import { getAllTasks, getAllTaskCategories, getCustomTaskStatuses } from "@/lib/db/tasks";
import { getUserId } from "@/lib/auth/server";
import { Suspense } from "react";
import { TreeRingLoader } from "@/components/ui/tree-ring-loader";

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
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <TreeRingLoader size={80} />
        <p className="text-media-on-surface-variant font-lexend text-sm animate-pulse">Accessing the task ledger...</p>
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
