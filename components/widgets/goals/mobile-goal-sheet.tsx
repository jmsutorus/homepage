"use client";

import { useState } from "react";
import { createGoalAction } from "@/lib/actions/goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { showCreationSuccess, showCreationError } from "@/lib/success-toasts";
import { Send, CalendarIcon, Flag } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { GoalPriority } from "@/lib/db/goals";
import { useRouter } from "next/navigation";

interface MobileGoalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileGoalSheet({ open, onOpenChange }: MobileGoalSheetProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<GoalPriority>("medium");
  const [isAdding, setIsAdding] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Reset form when sheet closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setTargetDate(undefined);
        setPriority("medium");
      }, 300);
    }
    onOpenChange(newOpen);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setTargetDate(date);
    setDatePickerOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsAdding(true);
    try {
      const goal = await createGoalAction({
        title,
        description: description || undefined,
        priority,
        target_date: targetDate
          ? `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`
          : undefined,
      });

      showCreationSuccess("goal");
      handleOpenChange(false);
      
      // Navigate to the new goal's edit page after a short delay to let success toast show
      setTimeout(() => {
        router.push(`/goals/${goal.slug}/edit`);
      }, 500);

    } catch (error) {
      console.error("Failed to create goal:", error);
      showCreationError("goal", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="h-auto max-h-[90vh] rounded-t-3xl p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle>New Goal</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Title Input */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-muted-foreground">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Learn Spanish"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isAdding}
                  className="text-base h-12 border-2 focus-visible:ring-brand"
                  autoFocus
                />
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-muted-foreground">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="e.g. Become conversational by end of year..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isAdding}
                  rows={3}
                  className="resize-none text-base border-2 focus-visible:ring-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Priority</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as GoalPriority)}>
                    <SelectTrigger className="h-12 border-2">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-muted-foreground" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Target Date */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Target Date</Label>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal border-2",
                          !targetDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {targetDate ? format(targetDate, "PPP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={targetDate}
                        onSelect={handleDateSelect}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t px-6 py-4 mt-auto">
              <Button
                type="submit"
                disabled={isAdding || !title.trim()}
                className="w-full h-12 text-base bg-brand hover:bg-brand/90 text-brand-foreground"
              >
                {isAdding ? (
                  "Creating..."
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Create & Edit
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
