"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import type { WorkoutActivity } from "@/lib/db/workout-activities";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TreeSuccess } from "@/components/ui/animations/tree-success";
import { useSuccessDialog } from "@/hooks/use-success-dialog";
import { EditorialInput, EditorialTextarea } from "@/components/ui/editorial-input";

interface ActivityFormProps {
  editActivity?: WorkoutActivity | null;
  onSuccess: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function ActivityForm({ editActivity, onSuccess, onCancel, onDelete }: ActivityFormProps) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activityId, setActivityId] = useState<number | null>(null);

  const { showSuccess, triggerSuccess, resetSuccess } = useSuccessDialog({
    duration: 2000,
    onClose: () => {
      onSuccess();
    },
  });
  
  // Form state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("07:00");
  const [length, setLength] = useState(60);
  const [distance, setDistance] = useState(0);
  const [difficulty, setDifficulty] = useState<"easy" | "moderate" | "hard" | "very hard">("moderate");
  const [type, setType] = useState<"run" | "cardio" | "strength" | "flexibility" | "sports" | "mixed" | "other">("cardio");
  const [notes, setNotes] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  // Load edit activity data when provided
  useEffect(() => {
    if (editActivity) {
      // Prevent infinite loops by only updating if the activity ID is different
      if (activityId === editActivity.id) return;

      setActivityId(editActivity.id);
      setDate(editActivity.date);
      setTime(editActivity.time);
      setLength(editActivity.length || 0);
      setDistance(editActivity.distance || 0);
      setDifficulty(editActivity.difficulty);
      const rawType = editActivity.type ? editActivity.type.toLowerCase() : "other";
      const validTypes = ["run", "cardio", "strength", "flexibility", "sports", "mixed", "other"];
      setType(validTypes.includes(rawType) ? (rawType as any) : "other");
      setNotes(editActivity.notes || "");
      setIsCompleted(editActivity.completed || false);
    } else if (activityId !== null) {
        // Only reset if we were previously editing an activity
        resetForm();
    }
  }, [editActivity, activityId]);

  const resetForm = () => {
    setActivityId(null);
    setDate(new Date().toISOString().split("T")[0]);
    setTime("07:00");
    setLength(60);
    setDistance(0);
    setDifficulty("moderate");
    setType("cardio");
    setNotes("");
    setIsCompleted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isEditing = activityId !== null;
      const url = "/api/activities";
      const method = isEditing ? "PATCH" : "POST";
      
      const baseBody = {
        date,
        time,
        length,
        difficulty,
        type,
        notes,
        distance: type === 'run' ? distance : undefined,
        completed: isCompleted,
      };

      const body = isEditing
        ? { id: activityId, ...baseBody }
        : { ...baseBody, exercises: [] };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? "update" : "create"} activity`);
      }

      resetForm();
      if (isEditing) {
        toast.success("Activity updated successfully");
        onSuccess();
      } else {
        triggerSuccess();
      }
    } catch (error) {
      console.error(`Error ${activityId ? "updating" : "creating"} activity:`, error);
      toast.error(`Failed to ${activityId ? "update" : "create"} activity.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!activityId || !onDelete) return;
    if (!confirm("Are you sure you want to delete this activity?")) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete activity");
      toast.success("Activity deleted successfully");
      onDelete();
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast.error("Failed to delete activity.");
    } finally {
      setDeleting(false);
    }
  };

  const inputClasses = "w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-lg font-lexend placeholder:text-media-on-surface-variant/20 appearance-none cursor-pointer";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <form id="activity-form" onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        {showSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 px-10 space-y-8 animate-in fade-in slide-in-from-bottom-8">
            <div className="relative">
              <TreeSuccess size={160} showText={false} />
              <div className="absolute inset-0 bg-media-secondary/10 blur-3xl rounded-full -z-10 scale-150 animate-pulse" />
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-3xl font-bold text-media-primary font-lexend tracking-tight uppercase">Session Logged</h3>
              <p className="text-media-on-surface-variant font-medium max-w-[280px] mx-auto">
                Biometric performance archived. Movement data and physiological metrics integrated into the collective.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-8">
              {/* Date and Time Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                <EditorialInput 
                  label="Session Date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  sizeVariant="lg"
                />
                <EditorialInput 
                  label="Start Time"
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  sizeVariant="lg"
                />
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-12 gap-4 md:gap-10">
                <EditorialInput 
                  label="Duration (minutes)"
                  type="number"
                  min="1"
                  required
                  value={isNaN(length) ? "" : length}
                  onChange={(e) => setLength(parseInt(e.target.value))}
                  sizeVariant="lg"
                  containerClassName="col-span-1 md:col-span-4"
                />

                <EditorialInput 
                  label="Distance (miles)"
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={type !== "run"}
                  value={isNaN(distance) ? "" : distance}
                  onChange={(e) => setDistance(parseFloat(e.target.value))}
                  sizeVariant="lg"
                  placeholder="0.00"
                  containerClassName={cn(
                    "col-span-1 md:col-span-4", 
                    type !== "run" && "opacity-20 pointer-events-none"
                  )}
                />

                <div className="col-span-2 md:col-span-4 space-y-3">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Intensity Tier</label>
                  <div className="relative">
                    <select 
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className={inputClasses}
                    >
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="hard">Hard</option>
                      <option value="very hard">Very Hard</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-media-on-surface-variant pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Activity Type Select */}
              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Activity Classification</label>
                <div className="relative">
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className={inputClasses}
                  >
                    <option value="cardio">Cardio</option>
                    <option value="run">Running</option>
                    <option value="strength">Strength Training</option>
                    <option value="flexibility">Flexibility / Yoga</option>
                    <option value="sports">Competitive Sports</option>
                    <option value="mixed">Mixed Discipline</option>
                    <option value="other">Other Activity</option>
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-media-on-surface-variant pointer-events-none" />
                </div>
              </div>

              {/* Notes */}
              <EditorialTextarea 
                label="Allocated Context (Notes)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Record details about performance, location, or energy levels..."
                sizeVariant="lg"
              />

              {/* Completed Checkbox */}
              <div 
                onClick={() => setIsCompleted(!isCompleted)}
                className={cn(
                  "group cursor-pointer p-6 rounded-2xl border-2 transition-all flex items-center justify-between",
                  isCompleted 
                    ? "bg-media-primary/5 border-media-primary" 
                    : "bg-media-surface-container-low border-transparent hover:border-media-outline-variant/30"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    isCompleted ? "bg-media-primary text-media-on-primary scale-110" : "bg-white/50 text-media-on-surface-variant"
                  )}>
                    {isCompleted ? <Check className="w-6 h-6" /> : <div className="w-2 h-2 rounded-full bg-media-outline-variant" />}
                  </div>
                  <div>
                    <p className={cn("font-bold text-sm", isCompleted ? "text-media-primary" : "text-media-on-surface-variant")}>
                      Historical Entry
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-media-on-surface-variant/60">
                      Mark this activity as completed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hidden buttons for external triggering if needed, but we'll use form ID */}
            <button type="submit" className="cursor-pointer hidden" />
          </>
        )}
      </form>

      {/* Expose action handlers for the parent modal */}
      <div id="activity-form-actions" className="hidden">
        <button id="submit-activity" onClick={() => document.getElementById("activity-form")?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))} />
        <button id="delete-activity" onClick={handleDelete} />
        <button id="cancel-activity" onClick={onCancel} />
      </div>
    </div>
  );
}
