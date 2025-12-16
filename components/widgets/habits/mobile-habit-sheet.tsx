"use client";

import { useState } from "react";
import { createHabitAction } from "@/lib/actions/habits";
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
import { showCreationSuccess, showCreationError } from "@/lib/success-toasts";
import { Send, Repeat, Target } from "lucide-react";

interface MobileHabitSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileHabitSheet({ open, onOpenChange }: MobileHabitSheetProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [target, setTarget] = useState("1");
  const [isAdding, setIsAdding] = useState(false);

  // Reset form when sheet closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setFrequency("daily");
        setTarget("1");
      }, 300);
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsAdding(true);
    try {
      // Format current time in local timezone (YYYY-MM-DD HH:MM:SS)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const localTimestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      await createHabitAction({
        title,
        description,
        frequency,
        target: parseInt(target) || 1,
        createdAt: localTimestamp,
      });

      showCreationSuccess("habit");
      handleOpenChange(false);
    } catch (error) {
      console.error("Failed to create habit:", error);
      showCreationError("habit", error);
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
            <SheetTitle>New Habit</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Title Input */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-muted-foreground">Name</Label>
                <Input
                  id="title"
                  placeholder="e.g. Read Books"
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
                  placeholder="e.g. Read 10 pages before bed..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isAdding}
                  rows={3}
                  className="resize-none text-base border-2 focus-visible:ring-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Frequency */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger className="h-12 border-2">
                      <div className="flex items-center gap-2">
                        <Repeat className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Select frequency" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="every_other_day">Every Other Day</SelectItem>
                      <SelectItem value="three_times_a_week">3x / Week</SelectItem>
                      <SelectItem value="once_a_week">Weekly</SelectItem>
                      <SelectItem value="every_week">Every Week</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Target */}
                <div className="space-y-2">
                  <Label htmlFor="target" className="text-muted-foreground">Daily Target</Label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="target"
                      type="number"
                      min="1"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      className="pl-9 h-12 border-2"
                    />
                  </div>
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
                    Create Habit
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
