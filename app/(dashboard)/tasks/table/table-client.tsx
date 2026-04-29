"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { format, parseISO, isPast, isToday } from "date-fns";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowUpDown,
  Search,
  CheckCircle2,
  Circle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useHaptic } from "@/hooks/use-haptic";
import type { Task, TaskCategory, TaskStatusRecord } from "@/lib/db/tasks";

interface TasksTableClientProps {
  initialTasks: Task[];
  categories: TaskCategory[];
  statuses: TaskStatusRecord[];
}

type SortField = "title" | "due_date" | "priority" | "status" | "category";
type SortOrder = "asc" | "desc";

export function TasksTableClient({
  initialTasks,
  categories,
  statuses,
}: TasksTableClientProps) {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";
  const initialPriority = searchParams.get("priority") || "all";
  const initialCategory = searchParams.get("category") || "all";

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState<string>(initialPriority);
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory);
  const [sortField, setSortField] = useState<SortField>("due_date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const uniqueCategories = useMemo(() => {
    const seen = new Set<string>();
    return categories.filter((cat) => {
      if (!cat.name) return false;
      const lower = cat.name.toLowerCase().trim();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
  }, [categories]);

  const haptic = useHaptic();

  // Combine predefined statuses and custom ones
  const allStatuses = useMemo(() => {
    const predefined = [
      "active",
      "in_progress",
      "blocked",
      "on_hold",
      "cancelled",
      "completed",
    ];
    const custom = statuses.map((s) => s.name);
    return Array.from(new Set([...predefined, ...custom]));
  }, [statuses]);

  // Handle task completion toggle
  const handleToggleComplete = async (task: Task) => {
    const isCompleting = !task.completed;
    
    if (isCompleting) {
      haptic?.trigger?.("success");
    } else {
      haptic?.trigger?.("medium");
    }

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              completed: isCompleting,
              status: isCompleting ? "completed" : "active",
            }
          : t
      )
    );

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: isCompleting }),
      });

      if (!response.ok) {
        // Revert on error
        setTasks(initialTasks);
        toast.error("Failed to update task");
      } else {
        toast.success(isCompleting ? "Task completed" : "Task marked active");
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      setTasks(initialTasks);
      toast.error("Failed to update task");
    }
  };

  // Filter and Sort Logic
  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search filter
        if (
          search &&
          !task.title.toLowerCase().includes(search.toLowerCase()) &&
          !(task.description || "").toLowerCase().includes(search.toLowerCase())
        ) {
          return false;
        }
        // Status filter
        if (statusFilter !== "all") {
          if (statusFilter === "completed" && !task.completed) return false;
          if (statusFilter !== "completed" && task.status !== statusFilter) return false;
        }
        // Priority filter
        if (priorityFilter !== "all" && task.priority !== priorityFilter) {
          return false;
        }
        // Category filter
        if (categoryFilter !== "all") {
          if (categoryFilter === "none" && task.category) return false;
          if (categoryFilter !== "none" && task.category !== categoryFilter) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let compareValue = 0;

        if (sortField === "title") {
          compareValue = a.title.localeCompare(b.title);
        } else if (sortField === "due_date") {
          if (!a.due_date && !b.due_date) compareValue = 0;
          else if (!a.due_date) compareValue = 1;
          else if (!b.due_date) compareValue = -1;
          else compareValue = a.due_date.localeCompare(b.due_date);
        } else if (sortField === "priority") {
          const priorityWeight = { high: 3, medium: 2, low: 1 };
          compareValue =
            priorityWeight[a.priority] - priorityWeight[b.priority];
        } else if (sortField === "status") {
          compareValue = (a.status || "").localeCompare(b.status || "");
        } else if (sortField === "category") {
          compareValue = (a.category || "").localeCompare(b.category || "");
        }

        return sortOrder === "asc" ? compareValue : -compareValue;
      });
  }, [tasks, search, statusFilter, priorityFilter, categoryFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const formatStatusLabel = (status: string) => {
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500 font-bold";
      case "medium":
        return "text-yellow-500 font-bold";
      case "low":
        return "text-blue-500";
      default:
        return "text-media-on-surface";
    }
  };

  return (
    <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-12 font-lexend text-media-on-surface">
      {/* Header */}
      <div>
        <Link
          href="/tasks"
          className="flex items-center gap-2 text-media-secondary font-bold text-xs uppercase tracking-widest mb-6 hover:translate-x-[-4px] transition-transform"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Flow
        </Link>
        <h1 className="text-4xl md:text-5xl font-extrabold text-media-primary tracking-tighter mb-4 max-w-2xl leading-[0.9]">
          All Tasks <span className="text-media-secondary italic">Archive</span>.
        </h1>
        <p className="text-media-on-surface-variant max-w-lg text-lg leading-relaxed">
          A comprehensive database of every action, status, and milestone across your site workflow.
        </p>
      </div>

      {/* Controls: Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-media-surface-container-low p-6 rounded-2xl border border-media-outline-variant/10 shadow-sm">
        <div className="md:col-span-1">
          <label className="text-[10px] uppercase tracking-wider font-bold text-media-outline mb-2 block">
            Search Tasks
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-media-outline" />
            <Input
              type="text"
              placeholder="Filter by title, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-media-surface border-media-outline-variant/20 rounded-xl h-10 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider font-bold text-media-outline mb-2 block">
            Filter Status
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full bg-media-surface border-media-outline-variant/20 rounded-xl h-10 text-sm">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-media-surface-container border-media-outline-variant/20">
              <SelectItem value="all">All Statuses</SelectItem>
              {allStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {formatStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider font-bold text-media-outline mb-2 block">
            Filter Priority
          </label>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full bg-media-surface border-media-outline-variant/20 rounded-xl h-10 text-sm">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent className="bg-media-surface-container border-media-outline-variant/20">
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider font-bold text-media-outline mb-2 block">
            Filter Category
          </label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full bg-media-surface border-media-outline-variant/20 rounded-xl h-10 text-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-media-surface-container border-media-outline-variant/20">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="none">Uncategorized</SelectItem>
              {uniqueCategories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-media-surface-container rounded-2xl border border-media-outline-variant/10 shadow-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-media-surface-container-high border-b border-media-outline-variant/20">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 text-center"></TableHead>
              <TableHead
                className="cursor-pointer text-media-primary hover:text-media-secondary transition-colors"
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center gap-1">
                  Title
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-media-primary hover:text-media-secondary transition-colors"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center gap-1">
                  Category
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-media-primary hover:text-media-secondary transition-colors"
                onClick={() => handleSort("priority")}
              >
                <div className="flex items-center gap-1">
                  Priority
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-media-primary hover:text-media-secondary transition-colors"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-1">
                  Status
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-media-primary hover:text-media-secondary transition-colors"
                onClick={() => handleSort("due_date")}
              >
                <div className="flex items-center gap-1">
                  Due Date
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTasks.length > 0 ? (
              filteredAndSortedTasks.map((task) => {
                const overdue =
                  task.due_date &&
                  isPast(parseISO(task.due_date)) &&
                  !isToday(parseISO(task.due_date)) &&
                  !task.completed;

                return (
                  <TableRow
                    key={task.id}
                    className="border-b border-media-outline-variant/10 hover:bg-media-surface-container-low transition-colors"
                  >
                    <TableCell className="text-center align-middle">
                      <button
                        onClick={() => handleToggleComplete(task)}
                        className="cursor-pointer text-media-outline hover:text-media-secondary transition-colors flex items-center justify-center mx-auto"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-media-primary" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="align-middle max-w-xs md:max-w-md">
                      <div className="font-bold text-sm text-media-on-surface">
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-xs text-media-on-surface-variant truncate mt-0.5">
                          {task.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="align-middle">
                      {task.category ? (
                        <span className="text-xs px-2.5 py-1 bg-media-surface border border-media-outline-variant/20 rounded-full font-medium">
                          {task.category}
                        </span>
                      ) : (
                        <span className="text-xs text-media-outline-variant italic">
                          None
                        </span>
                      )}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "align-middle text-xs font-bold uppercase tracking-wider",
                        getPriorityColor(task.priority)
                      )}
                    >
                      {task.priority}
                    </TableCell>
                    <TableCell className="align-middle">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-md font-medium border uppercase tracking-wider text-[10px]",
                          task.status === "completed"
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : task.status === "blocked"
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : task.status === "in_progress"
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            : "bg-media-surface-container-highest text-media-on-surface border-media-outline-variant/20"
                        )}
                      >
                        {formatStatusLabel(task.status)}
                      </span>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "align-middle text-sm",
                        overdue
                          ? "text-red-500 font-medium"
                          : "text-media-on-surface"
                      )}
                    >
                      {task.due_date ? (
                        <div className="flex flex-col">
                          <span>
                            {format(parseISO(task.due_date), "MMM d, yyyy")}
                          </span>
                          {overdue && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 mt-0.5">
                              Overdue
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-media-outline-variant italic text-xs">
                          No date
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-media-outline-variant italic text-sm"
                >
                  No tasks match your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
