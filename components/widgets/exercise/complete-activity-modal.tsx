"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";
import type { WorkoutActivity } from "@/lib/db/workout-activities";



interface CompleteActivityModalProps {
  activity: WorkoutActivity | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onActivityCompleted?: () => void;
}

export function CompleteActivityModal({
  activity,
  isOpen,
  onOpenChange,
  onActivityCompleted,
}: CompleteActivityModalProps) {
  const [loading, setLoading] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && activity) {
      setCompletionNotes("");
    }
  }, [isOpen, activity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity) return;

    setLoading(true);

    try {
      const response = await fetch("/api/activities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activity.id,
          completion_notes: completionNotes || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark activity as complete");
      }

      // Reset form and close modal
      setCompletionNotes("");
      onOpenChange(false);
      onActivityCompleted?.();
    } catch (error) {
      console.error("Error marking activity as complete:", error);
      alert("Failed to mark activity as complete. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (meters: number) => {
    const miles = meters * 0.000621371;
    return `${miles.toFixed(2)} mi`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!activity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-[#1b251e] rounded-[2rem] border border-stone-200/50 dark:border-white/5 p-6 md:p-8">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-black tracking-tight text-evergreen-dark dark:text-white">
            <CheckCircle2 className="h-6 w-6 text-burnt-terracotta" />
            Complete Workout
          </DialogTitle>
          <DialogDescription className="text-soft-earth dark:text-white/60 font-medium">
            Log your post-activity insights and wrap up your session.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Activity Summary */}
          <div className="bg-warm-cream/50 dark:bg-white/5 p-5 rounded-2xl border border-stone-100 dark:border-white/5">
            <p className="font-bold text-evergreen-dark dark:text-white text-base">
              {activity.date} <span className="text-soft-earth/60 dark:text-white/40 font-medium text-sm">at {activity.time}</span>
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs font-bold bg-evergreen/10 text-evergreen dark:text-white dark:bg-white/10 px-3 py-1 rounded-full uppercase">
                {activity.length} min
              </span>
              <span className="text-xs font-bold bg-burnt-terracotta/10 text-burnt-terracotta px-3 py-1 rounded-full uppercase">
                {activity.type}
              </span>
              <span className="text-xs font-bold bg-stone-100 dark:bg-white/5 text-soft-earth dark:text-white/60 px-3 py-1 rounded-full uppercase">
                {activity.difficulty}
              </span>
            </div>
          </div>

          {/* Completion Notes */}
          <div className="space-y-2">
            <Label 
              htmlFor="completion-notes"
              className="text-xs font-bold text-soft-earth dark:text-white/40 uppercase tracking-tight"
            >
              Post-Activity Notes (Optional)
            </Label>
            <Textarea
              id="completion-notes"
              placeholder="How did it go? Any observations or thoughts..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={4}
              className="rounded-xl border-stone-200 focus-visible:ring-evergreen dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={loading}
              className="rounded-xl border-evergreen/20 hover:bg-evergreen/5 hover:text-evergreen-dark text-soft-earth dark:border-white/10 dark:text-white/60 dark:hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-evergreen hover:bg-evergreen-dark text-white font-bold rounded-xl px-6"
            >
              {loading ? "Completing..." : "Mark Complete"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
