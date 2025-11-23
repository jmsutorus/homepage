"use client";

import { createGoalAction } from "@/lib/actions/goals";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SuccessCheck } from "@/components/ui/animations/success-check";
import { useRouter } from "next/navigation";
import type { GoalPriority } from "@/lib/db/goals";

interface CreateGoalFormProps {
  onCreated?: () => void;
}

export function CreateGoalForm({ onCreated }: CreateGoalFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<GoalPriority>("medium");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    try {
      const goal = await createGoalAction({
        title,
        description: description || undefined,
        priority,
        target_date: targetDate
          ? `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`
          : undefined,
      });

      setShowSuccess(true);
      // Wait for animation to play before closing
      setTimeout(() => {
        setOpen(false);
        setShowSuccess(false);
        setTargetDate(undefined);
        setPriority("medium");
        onCreated?.();
        // Navigate to the new goal's edit page
        router.push(`/goals/${goal.slug}/edit`);
      }, 1500);
    } catch (error) {
      console.error("Failed to create goal:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <SuccessCheck size={120} />
            <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-bottom-4 duration-500">
              Goal Created!
            </h3>
            <p className="text-muted-foreground text-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              Opening editor to add details...
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>
                Start by adding basic info. You can add milestones and notes in the editor.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Learn Spanish"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Short Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="e.g. Become conversational in Spanish by the end of the year"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Target Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal cursor-pointer",
                          !targetDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {targetDate ? format(targetDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={targetDate}
                        onSelect={setTargetDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as GoalPriority)}>
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="cursor-pointer">
                {loading ? "Creating..." : "Create & Edit"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
