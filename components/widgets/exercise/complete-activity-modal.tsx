"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Activity } from "lucide-react";
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Mark Activity Complete
          </DialogTitle>
          <DialogDescription>
            Complete your workout activity
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Activity Summary */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="font-medium">{activity.date} at {activity.time}</p>
            <p className="text-sm text-muted-foreground">
              {activity.length} minutes • {activity.type} • {activity.difficulty}
            </p>
          </div>



          {/* Completion Notes */}
          <div className="space-y-2">
            <Label htmlFor="completion-notes">Post-Activity Notes (Optional)</Label>
            <Textarea
              id="completion-notes"
              placeholder="How did it go? Any observations or thoughts..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Completing..." : "Mark Complete"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
