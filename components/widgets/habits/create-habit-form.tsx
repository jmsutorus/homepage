"use client";

import { createHabitAction } from "@/lib/actions/habits";
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
import { Plus } from "lucide-react";
import { useState } from "react";
import { SuccessCheck } from "@/components/ui/animations/success-check";

export function CreateHabitForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const frequency = formData.get("frequency") as string;
    const target = parseInt(formData.get("target") as string) || 1;

    try {
      await createHabitAction({
        title,
        description,
        frequency,
        target,
      });
      setShowSuccess(true);
      // Wait for animation to play before closing
      setTimeout(() => {
        setOpen(false);
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to create habit:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          New Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <SuccessCheck size={120} />
            <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-bottom-4 duration-500">
              Habit Created!
            </h3>
            <p className="text-muted-foreground text-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              You're on your way to building a better you.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
              <DialogDescription>
                Add a new habit to track.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="e.g. Drink Water" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea id="description" name="description" placeholder="e.g. Drink 8 glasses of water" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select name="frequency" defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="every_other_day">Every Other Day</SelectItem>
                      <SelectItem value="three_times_a_week">Three Times A Week</SelectItem>
                      <SelectItem value="once_a_week">Once A Week</SelectItem>
                      <SelectItem value="every_week">Every Week</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="target">Target</Label>
                  <Input 
                    id="target" 
                    name="target" 
                    type="number" 
                    min="1" 
                    defaultValue="1" 
                    required 
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="cursor-pointer">
                {loading ? "Creating..." : "Create Habit"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
