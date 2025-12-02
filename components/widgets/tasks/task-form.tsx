"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { CalendarIcon, Plus, Sparkles } from "lucide-react";
import { TaskPriority, TaskCategory } from "@/lib/db/tasks";
import { showCreationSuccess, showCreationError } from "@/lib/success-toasts";
import { TemplatePicker } from "@/components/widgets/shared/template-picker";
import type { TaskTemplate } from "@/lib/db/task-templates";
import { parseTaskInput, hasParseableContent } from "@/lib/utils/task-parser";

interface TaskFormProps {
  onTaskAdded: () => void;
}

export function TaskForm({ onTaskAdded }: TaskFormProps) {
  const [rawInput, setRawInput] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [category, setCategory] = useState<string>("");
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isAdding, setIsAdding] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);

  // Parse natural language input
  const parsedContent = useMemo(() => {
    if (!rawInput.trim()) return null;
    return hasParseableContent(rawInput);
  }, [rawInput]);

  const showNLPHint = parsedContent && (parsedContent.hasDate || parsedContent.hasPriority);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
          priority: finalPriority,
          category: category || undefined,
          dueDate: dueDateString,
        }),
      });

      if (response.ok) {
        setRawInput("");
        setPriority("medium");
        setCategory("");
        setDueDate(undefined);
        setManualOverride(false);
        showCreationSuccess("task");
        onTaskAdded();
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
      // Template due date is stored in YYYY-MM-DD format, convert to Date object
      const dateObj = new Date(template.dueDate + 'T00:00:00');
      setDueDate(dateObj);
      setManualOverride(true);
    }
  };

  // Handle manual changes to priority/date
  const handleManualPriorityChange = (value: TaskPriority) => {
    setPriority(value);
    setManualOverride(true);
  };

  const handleManualDateChange = (date: Date | undefined) => {
    setDueDate(date);
    setManualOverride(true);
  };

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder='Try "Buy milk tomorrow" or "!!! Urgent task"'
              value={rawInput}
              onChange={(e) => {
                setRawInput(e.target.value);
                // Reset manual override when user types new input
                if (!manualOverride) setManualOverride(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  handleSubmit(e);
                }
              }}
              disabled={isAdding}
              className={showNLPHint ? "pr-10" : ""}
            />
            {showNLPHint && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">
                    Smart parsing detected!
                    {parsedContent?.hasDate && " Date will be extracted."}
                    {parsedContent?.hasPriority && " Priority will be set."}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <Button type="submit" disabled={isAdding || !rawInput.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

      <div className="flex gap-2 justify-end flex-wrap">
        <TemplatePicker type="task" onSelect={handleTemplateSelect} />
        <div>
          <Label htmlFor="priority" className="sr-only">
            Priority
          </Label>
          <Select value={priority} onValueChange={handleManualPriorityChange}>
            <SelectTrigger id="priority" className="cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category" className="sr-only">
            Category
          </Label>
          <Select value={category || "none"} onValueChange={(value) => setCategory(value === "none" ? "" : value)}>
            <SelectTrigger id="category" className="cursor-pointer">
              <SelectValue placeholder="No category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No category</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : "Set due date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={handleManualDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {dueDate && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleManualDateChange(undefined)}
          >
            Clear
          </Button>
        )}
      </div>
      </form>
    </TooltipProvider>
  );
}
