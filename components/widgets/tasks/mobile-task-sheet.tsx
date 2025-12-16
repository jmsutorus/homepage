"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectSeparator } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import {
  CalendarIcon,
  Sparkles,
  Flag,
  FolderKanban,
  Circle,
  Send
} from "lucide-react";
import { TaskPriority, TaskCategory, TaskStatusRecord, PredefinedTaskStatus } from "@/lib/db/tasks";
import { showCreationSuccess, showCreationError } from "@/lib/success-toasts";
import { TemplatePicker } from "@/components/widgets/shared/template-picker";
import type { TaskTemplate } from "@/lib/db/task-templates";
import { parseTaskInput, hasParseableContent } from "@/lib/utils/task-parser";
import { cn } from "@/lib/utils";

interface MobileTaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskAdded: () => void;
}

export function MobileTaskSheet({ open, onOpenChange, onTaskAdded }: MobileTaskSheetProps) {
  const [rawInput, setRawInput] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [category, setCategory] = useState<string>("");
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [status, setStatus] = useState<string>("active");
  const [statuses, setStatuses] = useState<{ predefined: PredefinedTaskStatus[]; custom: TaskStatusRecord[] }>({ predefined: [], custom: [] });
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isAdding, setIsAdding] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Parse natural language input
  const parsedContent = useMemo(() => {
    if (!rawInput.trim()) return null;
    return hasParseableContent(rawInput);
  }, [rawInput]);

  const showNLPHint = parsedContent && (parsedContent.hasDate || parsedContent.hasPriority);

  // Fetch categories and statuses on mount
  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchStatuses();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/task-categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await fetch("/api/task-statuses");
      if (response.ok) {
        const data = await response.json();
        setStatuses(data);
      }
    } catch (error) {
      console.error("Failed to fetch statuses:", error);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!rawInput.trim()) return;

    setIsAdding(true);
    try {
      // Parse natural language input
      const parsed = parseTaskInput(rawInput);

      // Use parsed values unless user has manually overridden
      const finalTitle = parsed.title || rawInput.trim();
      const finalPriority = manualOverride ? priority : (parsed.priority || priority);
      const finalDueDate = manualOverride ? dueDate : (parsed.dueDate || dueDate);

      // Format due date as YYYY-MM-DD to avoid timezone issues
      const dueDateString = finalDueDate
        ? `${finalDueDate.getFullYear()}-${String(finalDueDate.getMonth() + 1).padStart(2, '0')}-${String(finalDueDate.getDate()).padStart(2, '0')}`
        : undefined;

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: finalTitle,
          description: description.trim() || undefined,
          status: status,
          priority: finalPriority,
          category: category || undefined,
          dueDate: dueDateString,
        }),
      });

      if (response.ok) {
        // Reset form
        setRawInput("");
        setDescription("");
        setStatus("active");
        setPriority("medium");
        setCategory("");
        setDueDate(undefined);
        setManualOverride(false);
        showCreationSuccess("task");
        onTaskAdded();
        onOpenChange(false);
      } else {
        throw new Error("Failed to create task");
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      showCreationError("task", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleTemplateSelect = (template: Partial<TaskTemplate>) => {
    if (template.title) {
      setRawInput(template.title);
    }
    if (template.priority) {
      setPriority(template.priority);
      setManualOverride(true);
    }
    if (template.category) {
      setCategory(template.category);
    }
    if (template.dueDate) {
      const dateObj = new Date(template.dueDate + 'T00:00:00');
      setDueDate(dateObj);
      setManualOverride(true);
    }
  };

  const handleManualPriorityChange = (value: TaskPriority) => {
    setPriority(value);
    setManualOverride(true);
  };

  const handleManualDateChange = (date: Date | undefined) => {
    setDueDate(date);
    setManualOverride(true);
    setDatePickerOpen(false);
  };

  const getPriorityColor = () => {
    switch (priority) {
      case "high": return "text-red-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-blue-500";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-auto max-h-[90vh] rounded-t-3xl p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle>Quick Add Task</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Task Name Input */}
              <div className="relative">
                <Input
                  placeholder='Try "Buy milk tomorrow" or "!!! Urgent task"'
                  value={rawInput}
                  onChange={(e) => {
                    setRawInput(e.target.value);
                    if (!manualOverride) setManualOverride(false);
                  }}
                  disabled={isAdding}
                  className={cn(
                    "text-base h-12 border-2 focus-visible:ring-brand",
                    showNLPHint && "pr-10"
                  )}
                  autoFocus
                />
                {showNLPHint && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                  </div>
                )}
              </div>

              {/* Description Input */}
              <Textarea
                placeholder="Add notes or details (optional)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isAdding}
                rows={3}
                className="resize-none text-base border-2 focus-visible:ring-brand"
              />

              {/* Quick Action Icons */}
              <div className="flex items-center gap-3 pt-2">
                {/* Templates */}
                <TemplatePicker
                  type="task"
                  onSelect={handleTemplateSelect}
                />

                {/* Priority */}
                <Select value={priority} onValueChange={handleManualPriorityChange}>
                  <SelectTrigger className={cn(
                    "h-11 w-11 rounded-full border-0 hover:bg-brand/10 p-0 [&>svg:last-child]:hidden justify-center",
                    getPriorityColor()
                  )}>
                    <Flag className="h-5 w-5" />
                  </SelectTrigger>
                  <SelectContent side="top">
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>

                {/* Category */}
                <Select value={category || "none"} onValueChange={(value) => setCategory(value === "none" ? "" : value)}>
                  <SelectTrigger className={cn(
                    "h-11 w-11 rounded-full border-0 hover:bg-brand/10 p-0 [&>svg:last-child]:hidden justify-center",
                    category && "text-brand"
                  )}>
                    <FolderKanban className="h-5 w-5" />
                  </SelectTrigger>
                  <SelectContent side="top">
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status */}
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-11 w-11 rounded-full border-0 hover:bg-brand/10 hover:text-brand p-0 [&>svg:last-child]:hidden justify-center">
                    <Circle className="h-5 w-5" />
                  </SelectTrigger>
                  <SelectContent side="top">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    {statuses.custom.length > 0 && (
                      <>
                        <SelectSeparator />
                        {statuses.custom.map((s) => (
                          <SelectItem key={s.id} value={s.name}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>

                {/* Due Date */}
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-11 w-11 rounded-full hover:bg-brand/10",
                        dueDate && "text-brand"
                      )}
                    >
                      <CalendarIcon className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={handleManualDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Show selected date if any */}
              {dueDate && (
                <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <span>Due: {format(dueDate, "PPP")}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleManualDateChange(undefined)}
                    className="h-auto py-1 px-2"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Submit Button - Fixed at bottom */}
            <div className="border-t px-6 py-4">
              <Button
                type="submit"
                disabled={isAdding || !rawInput.trim()}
                className="w-full h-12 text-base bg-brand hover:bg-brand/90 text-brand-foreground"
              >
                {isAdding ? (
                  "Adding..."
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Add Task
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
