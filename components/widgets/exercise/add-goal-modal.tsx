"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useHaptic } from "@/hooks/use-haptic";
import { addWorkoutGoalAction } from "@/lib/actions/workout-goals";

export function AddGoalModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const haptic = useHaptic();

  const handleOpen = (val: boolean) => {
    if (val) haptic.trigger("light");
    setOpen(val);
    if (!val) setGoal("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    
    haptic.trigger("medium");
    setLoading(true);
    try {
      await addWorkoutGoalAction(goal);
      setOpen(false);
      setGoal("");
      haptic.trigger("success");
    } catch (error) {
      console.error(error);
      haptic.trigger("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => haptic.trigger("light")}>
            <Plus className="w-4 h-4" /> Add Goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl border-border/40">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">Set Workout Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6 pt-4">
          <div className="space-y-3">
            <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Goal</Label>
            <Input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Run a sub 3hr marathon"
              className="text-lg py-6 font-bold tracking-tight rounded-2xl bg-muted/30 border-border/40 focus-visible:ring-lime-500"
              autoFocus
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={loading || !goal.trim()}
              className="w-full sm:w-auto rounded-full px-8 py-6 text-base font-black tracking-tight"
            >
              {loading ? "Saving..." : "Save Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
