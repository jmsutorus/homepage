"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task, TaskVelocityData, VelocityPeriod } from "@/lib/db/tasks";
import { TaskForm } from "@/components/widgets/tasks/task-form";
import { TaskList } from "@/components/widgets/tasks/task-list";
import { CategoryManager } from "@/components/widgets/tasks/category-manager";
import { TaskVelocityChart } from "@/components/widgets/tasks/task-velocity-chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type FilterType = "all" | "active" | "completed";

export function TasksPageClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [velocityData, setVelocityData] = useState<TaskVelocityData | null>(null);
  const [velocityPeriod, setVelocityPeriod] = useState<VelocityPeriod>("week");

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
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchVelocityData(velocityPeriod);
  }, [velocityPeriod, fetchVelocityData]);

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

      {/* Task Velocity Chart */}
      {velocityData && (
        <TaskVelocityChart
          data={velocityData}
          onPeriodChange={handlePeriodChange}
        />
      )}

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
    </div>
  );
}
