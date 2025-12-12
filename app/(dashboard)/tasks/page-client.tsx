"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Task, TaskVelocityData, VelocityPeriod, TaskCategory, TaskStatusRecord } from "@/lib/db/tasks";
import { TaskForm } from "@/components/widgets/tasks/task-form";
import { TaskList } from "@/components/widgets/tasks/task-list";
import { CategoryManager } from "@/components/widgets/tasks/category-manager";
import { StatusManager } from "@/components/widgets/tasks/status-manager";
import { TaskTemplateManager } from "@/components/widgets/tasks/task-template-manager";
import { TaskVelocityChart } from "@/components/widgets/tasks/task-velocity-chart";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageTabsList } from "@/components/ui/page-tabs-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Plus, ListTodo, Settings, TrendingUp, ChevronDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MobileTaskSheet } from "@/components/widgets/tasks/mobile-task-sheet";
import { MobileFilterSheet } from "@/components/widgets/tasks/mobile-filter-sheet";

type FilterType = "all" | "active" | "completed";
type ViewTab = "tasks" | "manage" | "analytics";

interface TasksPageClientProps {
  initialTasks: Task[];
  initialVelocityData: TaskVelocityData;
}

export function TasksPageClient({ initialTasks, initialVelocityData }: TasksPageClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<FilterType>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [statuses, setStatuses] = useState<TaskStatusRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [velocityData, setVelocityData] = useState<TaskVelocityData | null>(initialVelocityData);
  const [velocityPeriod, setVelocityPeriod] = useState<VelocityPeriod>("week");
  const [viewTab, setViewTab] = useState<ViewTab>("tasks");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [completedTasksOpen, setCompletedTasksOpen] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Track if it's the first render to avoid double fetching
  const isFirstRender = useState(true)[0]; // We can't use useRef here because we need to trigger re-renders? No, useRef is fine for logic.
  // Actually, useRef is better for this pattern.
  const isMounted = useRef(false);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();

      if (filter === "active") {
        params.append("completed", "false");
      } else if (filter === "completed") {
        params.append("completed", "true");
      }

      if (categoryFilter !== "all") {
        params.append("category", categoryFilter);
      }

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const url = `/api/tasks${params.toString() ? `?${params.toString()}` : ""}`;
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
  }, [filter, categoryFilter, statusFilter]);

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

  const fetchCategoriesAndStatuses = useCallback(async () => {
    try {
      const [categoriesRes, statusesRes] = await Promise.all([
        fetch("/api/task-categories"),
        fetch("/api/task-statuses"),
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      if (statusesRes.ok) {
        const statusesData = await statusesRes.json();
        setStatuses(statusesData.custom || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories and statuses:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategoriesAndStatuses();
  }, [fetchCategoriesAndStatuses]);

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
    fetchCategoriesAndStatuses();
  };

  const handleMobileFilterApply = (category: string, status: string) => {
    setCategoryFilter(category);
    setStatusFilter(status);
    setMobileFilterOpen(false);
  };

  const stats = {
    total: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  };

  return (
    <div className="md:space-y-6">
      {/* Header and Actions */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your todo list with priorities and due dates
          </p>
        </div>
        
        {/* Desktop: New Task Button */}
        <Button
          onClick={() => setShowTaskForm(!showTaskForm)}
          size="sm"
          className="mt-1 hidden md:flex"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showTaskForm ? "Hide Form" : "New Task"}
        </Button>

        {/* Mobile: Options Menu */}
        <div className="md:hidden mt-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setMobileFilterOpen(true)}>
                Sort / Filter...
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowDetails(!showDetails)}>
                {showDetails ? "Hide Details" : "Show Details"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as ViewTab)}>
        <PageTabsList
          tabs={[
            { value: "tasks", label: "Tasks", icon: ListTodo, showLabel: false },
            { value: "manage", label: "Manage", icon: Settings, showLabel: false },
            { value: "analytics", label: "Analytics", icon: TrendingUp, showLabel: false },
          ]}
          actionButton={{
            label: "New Task",
            onClick: () => setMobileSheetOpen(true),
            icon: Plus,
          }}
        />

        <TabsContent value="tasks" className="space-y-6 mt-6 pb-20 md:pb-0">
          {/* Task Form - Desktop Only */}
          {showTaskForm && (
            <Card className="hidden md:block">
              <CardHeader>
                <CardTitle>Add New Task</CardTitle>
                <CardDescription>Create a task with optional due date and priority</CardDescription>
              </CardHeader>
              <CardContent>
                <TaskForm onTaskAdded={handleTasksChanged} />
              </CardContent>
            </Card>
          )}

          {/* Active Tasks - Desktop View (Card) */}
          <div className="hidden md:block">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center justify-between w-full sm:w-auto">
                      <div>
                        <CardTitle>Your Tasks</CardTitle>
                        <CardDescription className="text-sm">
                          {stats.active} active tasks
                        </CardDescription>
                      </div>
                    </div>
                  </div>

                  {/* Additional Filters */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2 flex-1 sm:flex-none">
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2 flex-1 sm:flex-none">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          {statuses.map((status) => (
                            <SelectItem key={status.id} value={status.name}>
                              {status.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
                ) : (
                  <TaskList 
                    tasks={tasks.filter(t => !t.completed)} 
                    onTasksChanged={handleTasksChanged}
                    showDetails={showDetails}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Active Tasks - Mobile View (No Card wrapper) */}
          <div className="md:hidden">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
            ) : (
              <TaskList 
                tasks={tasks.filter(t => !t.completed)} 
                onTasksChanged={handleTasksChanged}
                showDetails={showDetails}
              />
            )}
          </div>

          {/* Completed Tasks */}
          {stats.completed > 0 && (
            <Collapsible open={completedTasksOpen} onOpenChange={setCompletedTasksOpen}>
              <Card>
                <CardHeader>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity">
                      <div>
                        <CardTitle>Completed Tasks</CardTitle>
                        <CardDescription className="text-sm">
                          {stats.completed} completed tasks
                        </CardDescription>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                          completedTasksOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
                    ) : (
                      <TaskList 
                        tasks={tasks.filter(t => t.completed)} 
                        onTasksChanged={handleTasksChanged}
                        showDetails={showDetails}
                      />
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}
        </TabsContent>

        <TabsContent value="manage" className="space-y-6 md:mt-6 pb-20 md:pb-0">
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

        <TabsContent value="analytics" className="space-y-6 md:mt-6 pb-20 md:pb-0">
          {/* Task Velocity Chart */}
          {velocityData && (
            <TaskVelocityChart
              data={velocityData}
              onPeriodChange={handlePeriodChange}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Mobile Task Sheet */}
      <MobileTaskSheet
        open={mobileSheetOpen}
        onOpenChange={setMobileSheetOpen}
        onTaskAdded={handleTasksChanged}
      />

      <MobileFilterSheet
        open={mobileFilterOpen}
        onOpenChange={setMobileFilterOpen}
        categories={categories}
        statuses={statuses}
        currentCategory={categoryFilter}
        currentStatus={statusFilter}
        onApply={handleMobileFilterApply}
      />
    </div>
  );
}
