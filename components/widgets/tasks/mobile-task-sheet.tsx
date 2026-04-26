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
  Send,
  Bell
} from "lucide-react";
import { TaskPriority, TaskCategory, TaskStatusRecord, PredefinedTaskStatus } from "@/lib/db/tasks";
import { showCreationError } from "@/lib/success-toasts";
import { TreeSuccess } from "@/components/ui/animations/tree-success";
import { useSuccessDialog } from "@/hooks/use-success-dialog";
import { HapticButton } from "@/components/ui/haptic-button";
import { TemplatePicker } from "@/components/widgets/shared/template-picker";
import type { TaskTemplate } from "@/lib/db/task-templates";
import { parseTaskInput, hasParseableContent } from "@/lib/utils/task-parser";
import { cn } from "@/lib/utils";
import { motion, PanInfo } from "framer-motion";

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
  const [notificationSetting, setNotificationSetting] = useState<string>("");
  const [notificationTime, setNotificationTime] = useState<string>("09:00");
  const [isAdding, setIsAdding] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const { showSuccess, triggerSuccess, resetSuccess } = useSuccessDialog({
    duration: 2000,
    onClose: () => {
      onOpenChange(false);
    },
  });

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
          notification_setting: notificationSetting || undefined,
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
        setNotificationSetting("");
        setNotificationTime("09:00");
        setManualOverride(false);
        triggerSuccess();
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
    if (date && !notificationSetting) {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      setNotificationSetting(`${dateStr}T${notificationTime}:00.000Z`);
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case "high": return "text-media-secondary";
      case "medium": return "text-media-on-tertiary-fixed-variant";
      case "low": return "text-media-on-primary-fixed-variant";
      default: return "text-media-on-surface-variant/40";
    }
  };

  const [isAtTop, setIsAtTop] = useState(true);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-auto max-h-[90vh] rounded-t-3xl p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <motion.div 
          className="flex flex-col h-full bg-media-surface text-media-primary font-lexend"
          drag={isAtTop ? "y" : false}
          dragConstraints={{ top: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info: PanInfo) => {
            if (info.offset.y > 150 || info.velocity.y > 500) {
              onOpenChange(false);
            }
          }}
        >
          {/* Drag Handle */}
          <div className="flex-none flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-media-outline-variant/30 rounded-full" />
          </div>

          <div className="flex flex-col h-full overflow-hidden">
          <SheetHeader className="px-6 pt-8 pb-4 border-b border-media-outline-variant/10">
            <SheetTitle className="text-2xl font-bold tracking-tight text-media-on-surface">Quick Add Task</SheetTitle>
          </SheetHeader>

          {showSuccess ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 px-10 space-y-8 animate-in fade-in slide-in-from-bottom-8">
              <div className="relative">
                <TreeSuccess size={160} showText={false} />
                <div className="absolute inset-0 bg-media-secondary/10 blur-3xl rounded-full -z-10 scale-150 animate-pulse" />
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-3xl font-bold text-media-primary font-lexend tracking-tight uppercase">Task committed</h3>
                <p className="text-media-on-surface-variant font-medium max-w-[280px] mx-auto">
                  New directive integrated into the collective. Priority and parameters archived.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div 
              className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
              onScroll={(e) => setIsAtTop(e.currentTarget.scrollTop <= 0)}
            >
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
                    "text-lg h-14 border border-media-outline-variant/20 bg-media-surface-container-low/20 rounded-2xl focus-visible:ring-4 focus-visible:ring-media-secondary/5 focus-visible:border-media-secondary transition-all duration-300 outline-none",
                    showNLPHint && "pr-12"
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
                rows={4}
                className="resize-none text-base border border-media-outline-variant/20 bg-media-surface-container-low/20 rounded-2xl focus-visible:ring-4 focus-visible:ring-media-secondary/5 focus-visible:border-media-secondary p-4 transition-all duration-300 outline-none"
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
                    "h-12 w-12 rounded-xl border border-media-outline-variant/20 hover:bg-media-secondary/10 p-0 [&>svg:last-child]:hidden justify-center transition-all",
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
                    "h-12 w-12 rounded-xl border border-media-outline-variant/20 hover:bg-media-secondary/10 p-0 [&>svg:last-child]:hidden justify-center transition-all",
                    category && "text-media-secondary border-media-secondary/30 bg-media-secondary/5"
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
                  <SelectTrigger className="h-12 w-12 rounded-xl border border-media-outline-variant/20 hover:bg-media-secondary/10 hover:text-media-secondary p-0 [&>svg:last-child]:hidden justify-center transition-all">
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
                        "h-12 w-12 rounded-xl border border-media-outline-variant/20 hover:bg-media-secondary/10 transition-all",
                        dueDate && "text-media-secondary border-media-secondary/30 bg-media-secondary/5"
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

                {/* Notification Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-12 w-12 rounded-xl border border-media-outline-variant/20 hover:bg-media-secondary/10 transition-all",
                        notificationSetting && notificationSetting !== 'none' && "text-media-secondary border-media-secondary/30 bg-media-secondary/5"
                      )}
                    >
                      <Bell className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4 flex flex-col gap-3 bg-media-surface border border-media-outline-variant/20 rounded-xl" align="center">
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
              </div>

              {/* Show selected date if any */}
              {dueDate && (
                <div className="flex items-center justify-between text-sm text-media-on-surface-variant/60 bg-media-surface-container-low/40 rounded-xl p-4 border border-media-outline-variant/5">
                  <span className="font-medium">Due: {format(dueDate, "PPP")}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleManualDateChange(undefined)}
                    className="h-auto py-1 px-3 text-[10px] uppercase font-bold tracking-widest text-media-secondary hover:bg-media-secondary/10 rounded-lg"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Submit Button - Fixed at bottom */}
            <div className="border-t border-media-outline-variant/10 px-6 py-6 bg-media-surface-container-lowest/50">
              <HapticButton
                type="submit"
                hapticPattern="success"
                disabled={isAdding || !rawInput.trim()}
                className="w-full h-14 text-base font-bold uppercase tracking-widest bg-media-secondary hover:brightness-110 text-media-on-secondary rounded-2xl shadow-xl shadow-media-secondary/10 transition-all active:scale-[0.98] flex items-center justify-center"
              >
                {isAdding ? (
                  "Archiving Entry..."
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-3" />
                    Commit Task
                  </>
                )}
              </HapticButton>
            </div>
          </form>
          )}
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
