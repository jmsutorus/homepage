"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Sparkles, WifiOff, Bell } from "lucide-react";
import { TaskPriority, TaskCategory, TaskStatusRecord, PredefinedTaskStatus } from "@/lib/db/tasks";
import { showCreationSuccess, showCreationError } from "@/lib/success-toasts";
import type { TaskTemplate } from "@/lib/db/task-templates";
import { parseTaskInput, hasParseableContent } from "@/lib/utils/task-parser";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { addToQueue } from "@/lib/pwa/offline-queue";
import { generateTempId } from "@/lib/pwa/optimistic-updates";
import { useHaptic } from "@/hooks/use-haptic";
import { toast } from "sonner";

interface TaskFormProps {
  onTaskAdded: () => void;
}

export function TaskForm({ onTaskAdded }: TaskFormProps) {
  const { isOnline } = useNetworkStatus();
  const haptic = useHaptic();
  const [rawInput, setRawInput] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [category, setCategory] = useState<string>("");
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [status, setStatus] = useState<string>("active");
  const [statuses, setStatuses] = useState<{ predefined: PredefinedTaskStatus[]; custom: TaskStatusRecord[] }>({ predefined: [], custom: [] });
  const [showDescription, setShowDescription] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [notificationSetting, setNotificationSetting] = useState<string>("");
  const [notificationTime, setNotificationTime] = useState<string>("09:00");
  const [isAdding, setIsAdding] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);

  // Parse natural language input
  const parsedContent = useMemo(() => {
    if (!rawInput.trim()) return null;
    return hasParseableContent(rawInput);
  }, [rawInput]);

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

  const showNLPHint = parsedContent && (parsedContent.hasDate || parsedContent.hasPriority);

  // Fetch categories and statuses on mount
  useEffect(() => {
    fetchCategories();
    fetchStatuses();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rawInput.trim()) return;

    haptic.trigger("medium");
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

      const taskData = {
        title: finalTitle,
        description: description.trim() || undefined,
        status: status,
        priority: finalPriority,
        category: category || undefined,
        dueDate: dueDateString,
        notification_setting: notificationSetting || undefined,
      };

      // Handle offline mode
      if (!isOnline) {
        const tempId = generateTempId("task");
        await addToQueue("CREATE_TASK", taskData, tempId);

        // Reset form
        setRawInput("");
        setDescription("");
        setStatus("active");
        setPriority("medium");
        setCategory("");
        setDueDate(undefined);
        setManualOverride(false);
        setShowDescription(false);

        // Show offline success message
        toast.success("Task saved offline", {
          description: "Will sync when you're back online",
          icon: <WifiOff className="h-4 w-4" />,
        });

        haptic.trigger("success");
        onTaskAdded();
        return;
      }

      // Online mode - normal API call
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        setRawInput("");
        setDescription("");
        setStatus("active");
        setPriority("medium");
        setCategory("");
        setDueDate(undefined);
        setNotificationSetting("");
        setNotificationTime("09:00");
        setManualOverride(false);
        setShowDescription(false);
        showCreationSuccess("task");
        haptic.trigger("success");
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
    if (date && !notificationSetting) {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      setNotificationSetting(`${dateStr}T${notificationTime}:00.000Z`);
    }
  };

  return (
    <div className="bg-media-surface-container-lowest p-6 md:p-10 rounded-2xl shadow-sm border border-media-outline-variant/10 text-left">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title Input Area */}
        <div className="group">
          <input
            className="w-full text-2xl md:text-3xl font-bold tracking-tight bg-media-surface-container-low/20 border border-media-outline-variant/20 rounded-2xl p-6 md:p-5 placeholder:text-media-outline-variant/40 focus:ring-4 focus:ring-media-secondary/5 focus:border-media-secondary text-media-on-surface transition-all duration-300 outline-none"
            placeholder="Title of the task..."
            type="text"
            value={rawInput}
            onChange={(e) => {
              setRawInput(e.target.value);
              if (!manualOverride) setManualOverride(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                handleSubmit(e);
              }
            }}
            disabled={isAdding}
          />
          
          {showNLPHint && (
            <div className="flex items-center gap-1.5 mt-4 ml-4 text-amber-600 dark:text-amber-500 animate-in fade-in slide-in-from-top-1 duration-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                Smart parsing: 
                {parsedContent?.hasDate && " date detected"}
                {parsedContent?.hasDate && parsedContent?.hasPriority && ","}
                {parsedContent?.hasPriority && " priority detected"}
              </span>
            </div>
          )}
        </div>

        {/* Description Area */}
        <div className="group">
          <textarea
            className="w-full bg-media-surface-container-low/20 border border-media-outline-variant/20 rounded-2xl md:p-5 resize-none text-media-on-surface-variant focus:ring-4 focus:ring-media-secondary/5 focus:border-media-secondary h-32 text-lg placeholder:text-media-outline-variant/30 transition-all duration-300 outline-none"
            placeholder="Optional description of the objective..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isAdding}
          ></textarea>
        </div>

        {/* Controls Area */}
        <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-media-outline-variant/10">
          <div className="flex flex-wrap gap-4">
            {/* Priority Select */}
            <Select value={priority} onValueChange={handleManualPriorityChange}>
              <SelectTrigger className="bg-media-surface-container-low border border-media-outline-variant/20 rounded-lg text-xs font-lexend uppercase tracking-widest px-4 py-3 focus:ring-4 focus:ring-media-secondary/5 focus:border-media-secondary h-auto w-auto min-w-[160px] transition-all outline-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>

            {/* Deadline / Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  className="cursor-pointer flex items-center gap-2 text-media-on-surface-variant text-xs font-lexend uppercase tracking-widest hover:text-media-primary transition-colors px-4 border border-media-outline-variant/20 rounded-lg h-[46px]" 
                  type="button"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {dueDate ? format(dueDate, "MMM d, yyyy") : "Set Deadline"}
                </button>
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

            {/* Notification Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  className="cursor-pointer flex items-center gap-2 text-media-on-surface-variant text-xs font-lexend uppercase tracking-widest hover:text-media-primary transition-colors px-4 border border-media-outline-variant/20 rounded-lg h-[46px]" 
                  type="button"
                >
                  <Bell className="w-3.5 h-3.5" />
                  {notificationSetting && notificationSetting !== 'none' ? (
                    notificationSetting.includes('T') 
                      ? format(new Date(notificationSetting.replace('Z', '')), "MMM d, h:mm a")
                      : "Notification Set"
                  ) : "No Notification"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4 flex flex-col gap-3 bg-media-surface border border-media-outline-variant/20 rounded-xl" align="start">
                <div className="text-xs font-bold uppercase tracking-wider text-media-on-surface-variant mb-1">Notification Time</div>
                <input 
                  type="time" 
                  value={notificationTime}
                  onChange={(e) => {
                    setNotificationTime(e.target.value);
                    if (dueDate) {
                      const dateStr = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
                      setNotificationSetting(`${dateStr}T${e.target.value}:00.000Z`);
                    } else {
                      const today = new Date();
                      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                      setNotificationSetting(`${dateStr}T${e.target.value}:00.000Z`);
                    }
                  }}
                  className="bg-media-surface-container-low border border-media-outline-variant/20 rounded p-2 text-media-on-surface outline-none"
                />
                <button 
                  type="button"
                  onClick={() => setNotificationSetting('none')}
                  className="text-xs font-bold uppercase tracking-widest text-media-secondary hover:bg-media-secondary/10 p-2 rounded transition-colors cursor-pointer"
                >
                  Clear Notification
                </button>
              </PopoverContent>
            </Popover>

            {/* Category Select */}
            <Select value={category || "none"} onValueChange={(value) => setCategory(value === "none" ? "" : value)}>
              <SelectTrigger className="bg-media-surface-container-low border border-media-outline-variant/20 rounded-lg text-xs font-lexend uppercase tracking-widest px-4 py-3 focus:ring-4 focus:ring-media-secondary/5 focus:border-media-secondary h-auto w-auto min-w-[160px] transition-all outline-none">
                <SelectValue placeholder="Journal Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Category</SelectItem>
                {uniqueCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button 
            type="submit"
            disabled={isAdding || !rawInput.trim()}
            className="bg-media-secondary text-media-on-secondary px-10 py-4 rounded-lg font-lexend uppercase tracking-widest text-xs font-bold kinetic-hover shadow-lg shadow-media-secondary/10 disabled:opacity-50 disabled:transform-none cursor-pointer"
          >
            {isAdding ? "Drafting..." : "Commit"}
          </button>
        </div>
      </form>
    </div>
  );
}
