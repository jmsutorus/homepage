"use client";

import { useState, useEffect } from "react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { EditorialTextarea } from "@/components/ui/editorial-input";
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

  if (!activity) return null;

  const formContent = (
    <div className="space-y-8">
      {/* Activity Summary */}
      <div className="bg-media-surface-container-low p-6 rounded-2xl border border-media-outline-variant/10">
        <p className="font-bold text-media-primary text-base font-lexend">
          {activity.date} <span className="text-media-on-surface-variant/60 font-medium text-sm">at {activity.time}</span>
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-[10px] font-black bg-media-primary/10 text-media-primary px-3 py-1 rounded-full uppercase tracking-widest">
            {activity.length} min
          </span>
          <span className="text-[10px] font-black bg-media-secondary/10 text-media-secondary px-3 py-1 rounded-full uppercase tracking-widest">
            {activity.type}
          </span>
          <span className="text-[10px] font-black bg-media-surface-container-high text-media-on-surface-variant px-3 py-1 rounded-full uppercase tracking-widest">
            {activity.difficulty}
          </span>
        </div>
      </div>

      <EditorialTextarea 
        id="completion-notes"
        label="Post-Activity Notes (Optional)"
        placeholder="How did it go? Any observations or thoughts..."
        value={completionNotes}
        onChange={(e) => setCompletionNotes(e.target.value)}
        rows={4}
        sizeVariant="lg"
      />
      <button type="submit" className="cursor-pointer hidden" id="submit-completion-button" />
    </div>
  );

  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title="Complete Workout"
      description="Log your post-activity insights and wrap up your session."
      onSubmit={() => document.getElementById("submit-completion-button")?.click()}
      submitText="Mark Complete"
      isLoading={loading}
      loadingText="Completing..."
    >
      <form onSubmit={handleSubmit}>
        {formContent}
      </form>
    </ResponsiveDialog>
  );
}
