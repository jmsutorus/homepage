"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Task, TaskVelocityData, VelocityPeriod } from "@/lib/db/tasks";
import { TaskForm } from "@/components/widgets/tasks/task-form";
import { TaskList } from "@/components/widgets/tasks/task-list";
import { CategoryManager } from "@/components/widgets/tasks/category-manager";
import { StatusManager } from "@/components/widgets/tasks/status-manager";
import { TaskTemplateManager } from "@/components/widgets/tasks/task-template-manager";
import { TaskVelocityChart } from "@/components/widgets/tasks/task-velocity-chart";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageTabsList } from "@/components/ui/page-tabs-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type FilterType = "all" | "active" | "completed";
type ViewTab = "tasks" | "manage" | "analytics";

interface TasksPageClientProps {
  initialTasks: Task[];
  initialVelocityData: TaskVelocityData;
}

export function TasksPageClient({ initialTasks, initialVelocityData }: TasksPageClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [velocityData, setVelocityData] = useState<TaskVelocityData | null>(initialVelocityData);
  const [velocityPeriod, setVelocityPeriod] = useState<VelocityPeriod>("week");
  const [viewTab, setViewTab] = useState<ViewTab>("tasks");

  // Track if it's the first render to avoid double fetching
  const isFirstRender = useState(true)[0]; // We can't use useRef here because we need to trigger re-renders? No, useRef is fine for logic.
  // Actually, useRef is better for this pattern.
  const isMounted = useRef(false);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      let url = "/api/tasks";

      if (filter === "active") {
        url += "?completed=false";
      } else if (filter === "completed") {
        url += "?completed=true";
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  const fetchVelocityData = useCallback(async (period: VelocityPeriod) => {
    try {
      const response = await fetch(`/api/tasks/velocity?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setVelocityData(data);
      }
    } catch (error) {
      console.error("Failed to fetch velocity data:", error);
    }
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    // Only fetch if period changes (initial fetch is handled by server)
    // But velocityPeriod is state, so it's "week" initially.
    // We need to skip the first one if it matches initial.
    if (velocityPeriod === "week" && initialVelocityData) {
       // Check if we are mounting?
       // If we use the same isMounted ref, it might be tricky if effects run in different order?
       // Actually, simpler:
       // We can just check if we have data for the current period? No, we don't store it by period.
       return;
    }
    fetchVelocityData(velocityPeriod);
  }, [velocityPeriod, fetchVelocityData, initialVelocityData]);

  const handlePeriodChange = (period: VelocityPeriod) => {
    setVelocityPeriod(period);
  };

  const handleTasksChanged = () => {
    fetchTasks();
    fetchVelocityData(velocityPeriod);
  };

  const stats = {
    total: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your todo list with priorities and due dates
        </p>
      </div>

      <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as ViewTab)}>
        <PageTabsList
          tabs={[
            { value: "tasks", label: "Tasks" },
            { value: "manage", label: "Manage" },
            { value: "analytics", label: "Analytics" },
          ]}
        />

        <TabsContent value="tasks" className="space-y-6 mt-6">
          {/* Task Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Task</CardTitle>
              <CardDescription>Create a task with optional due date and priority</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskForm onTaskAdded={handleTasksChanged} />
            </CardContent>
          </Card>

          {/* Task List */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Your Tasks</CardTitle>
                  <CardDescription className="text-sm">
                    {stats.total} total • {stats.active} active • {stats.completed} completed
                  </CardDescription>
                </div>

                <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
                  <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="all" className="flex-1 sm:flex-none">All</TabsTrigger>
                    <TabsTrigger value="active" className="flex-1 sm:flex-none">Active</TabsTrigger>
                    <TabsTrigger value="completed" className="flex-1 sm:flex-none">Completed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
              ) : (
                <TaskList tasks={tasks} onTasksChanged={handleTasksChanged} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6 mt-6">
          {/* Task Templates */}
          <TaskTemplateManager onTemplatesChanged={handleTasksChanged} />

          {/* Category Manager */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Categories</CardTitle>
              <CardDescription>Add, edit, or remove task categories</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryManager onCategoriesChanged={handleTasksChanged} />
            </CardContent>
          </Card>

          {/* Status Manager */}
          <StatusManager onStatusesChanged={handleTasksChanged} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          {/* Task Velocity Chart */}
          {velocityData && (
            <TaskVelocityChart
              data={velocityData}
              onPeriodChange={handlePeriodChange}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
