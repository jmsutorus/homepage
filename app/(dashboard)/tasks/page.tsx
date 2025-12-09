import { TasksPageClient } from "./page-client";

export const dynamic = "force-dynamic";

import { getAllTasks, getTaskVelocityData } from "@/lib/db/tasks";
import { getUserId } from "@/lib/auth/server";

export default async function TasksPage() {
  const userId = await getUserId();

  const [tasks, velocityData] = await Promise.all([
    getAllTasks({}, userId),
    getTaskVelocityData(userId, "week", 12)
  ]);

  return (
    <TasksPageClient 
      initialTasks={tasks} 
      initialVelocityData={velocityData} 
    />
  );
}
