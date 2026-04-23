"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Trash2, ChevronDown, Check } from "lucide-react";
import type { WorkoutActivity } from "@/lib/db/workout-activities";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ActivityFormProps {
  editActivity?: WorkoutActivity | null;
  onSuccess: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  isDesktop?: boolean;
}

export function ActivityForm({ editActivity, onSuccess, onCancel, onDelete, isDesktop = true }: ActivityFormProps) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activityId, setActivityId] = useState<number | null>(null);
  
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
      onSuccess();
    } catch (error) {
      console.error(`Error ${activityId ? "updating" : "creating"} activity:`, error);
      toast.error(`Failed to ${activityId ? "update" : "create"} activity.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!activityId || !onDelete) return;
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

  const inputClasses = "w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-lg font-lexend placeholder:text-media-on-surface-variant/20 appearance-none cursor-pointer";
  const labelClasses = "block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant mb-3";

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col h-full", isDesktop ? "space-y-12" : "")}>
      <div className={cn("flex-1", isDesktop ? "space-y-10" : "space-y-10 overflow-y-auto px-10 py-12")}>
        {/* Date and Time Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className={labelClasses}>Session Date</label>
            <div className="relative group">
              <input 
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className={labelClasses}>Start Time</label>
            <div className="relative group">
              <input 
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4 space-y-3">
            <label className={labelClasses}>Duration (minutes)</label>
            <div className="relative">
              <input 
                type="number"
                min="1"
                required
                value={isNaN(length) ? "" : length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className={inputClasses}
              />
            </div>
          </div>

          <div className={cn("md:col-span-4 space-y-3", type !== "run" && "opacity-20 pointer-events-none")}>
            <label className={labelClasses}>Distance (miles)</label>
            <div className="relative">
              <input 
                type="number"
                min="0"
                step="0.01"
                disabled={type !== "run"}
                value={isNaN(distance) ? "" : distance}
                onChange={(e) => setDistance(parseFloat(e.target.value))}
                className={inputClasses}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="md:col-span-4 space-y-3">
            <label className={labelClasses}>Intensity Tier</label>
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
          <label className={labelClasses}>Activity Classification</label>
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
        <div className="space-y-3">
          <label className={labelClasses}>Allocated Context (Notes)</label>
          <div className="relative">
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-base resize-none placeholder:text-media-on-surface-variant/20 font-lexend"
              placeholder="Record details about performance, location, or energy levels..."
            />
          </div>
        </div>

        {/* Completed Checkbox redefined as an interactive card */}
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

      {/* Actions */}
      <div className={cn(
          "flex items-center py-6",
          isDesktop ? "justify-between" : "mt-auto pt-10"
        )}>
        {isIdEditable(activityId) && (
          <button 
            type="button" 
            onClick={handleDelete} 
            disabled={loading || deleting}
            className="cursor-pointer group flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest hover:opacity-70 transition-opacity"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? "Removing..." : "Delete Session"}
          </button>
        )}
        
        {!isIdEditable(activityId) && <div />}

        <div className="flex items-center gap-10">
          <button 
            type="button" 
            onClick={onCancel} 
            className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.2em] text-media-on-surface-variant hover:text-media-primary transition-colors font-lexend"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading || deleting}
            className="cursor-pointer px-10 py-4 bg-media-secondary text-media-on-secondary rounded-xl font-bold tracking-tight shadow-xl shadow-media-secondary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm disabled:opacity-50 disabled:scale-100 flex items-center gap-2 font-lexend"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {activityId ? "Update Session" : "Log Session"}
          </button>
        </div>
      </div>
    </form>
  );
}

function isIdEditable(id: number | null): id is number {
  return id !== null;
}
