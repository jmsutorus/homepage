import { TasksPageClient } from "./page-client";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  return <TasksPageClient />;
}
