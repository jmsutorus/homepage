"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Send, Trash2 } from "lucide-react";
import type { WorkoutActivity } from "@/lib/db/workout-activities";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Exercise {
  description: string;
  reps?: number;
  sets?: number;
  duration?: number;
  pace?: string;
  weight?: number;
}

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

  // Load edit activity data when provided
  useEffect(() => {
    if (editActivity) {
      setActivityId(editActivity.id);
      setDate(editActivity.date);
      setTime(editActivity.time);
      setLength(editActivity.length);
      setDistance(editActivity.distance || 0);
      setDifficulty(editActivity.difficulty);
      // Normalize type to ensure it matches the select values
      const normalizedType = editActivity.type.toLowerCase() as any;
      setType(normalizedType);
      
      setNotes(editActivity.notes || "");
    } else {
        // Reset form when editActivity becomes null (switching to add mode)
        resetForm();
    }
  }, [editActivity]);

  const resetForm = () => {
    setActivityId(null);
    setDate(new Date().toISOString().split("T")[0]);
    setTime("07:00");
    setLength(60);
    setDistance(0);
    setDifficulty("moderate");
    setType("cardio");
    setNotes("");
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
        // Include distance if it's a run, otherwise undefined
        distance: type === 'run' ? distance : undefined,
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

      // Reset form
      resetForm();
      onSuccess();
      
    } catch (error) {
      console.error(`Error ${activityId ? "updating" : "creating"} activity:`, error);
      alert(`Failed to ${activityId ? "update" : "create"} activity. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!activityId || !onDelete) return;
    
    if (!confirm("Are you sure you want to delete this activity? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete activity");
      }

      toast.success("Activity deleted successfully");
      onDelete();
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast.error("Failed to delete activity. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const isEditing = activityId !== null;

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col h-full", isDesktop ? "space-y-6" : "")}>
      <div className={cn("flex-1", isDesktop ? "space-y-6" : "space-y-6 overflow-y-auto px-6 py-4")}>
        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Length, Distance (if run), Difficulty, Type */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="length">Length (min)</Label>
            <Input
              id="length"
              type="number"
              min="1"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              required
            />
          </div>
          
          {type === "run" && (
            <div className="space-y-2">
              <Label htmlFor="distance">Distance (miles)</Label>
              <Input
                id="distance"
                type="number"
                min="0"
                step="0.01"
                value={distance}
                onChange={(e) => setDistance(parseFloat(e.target.value))}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="very hard">Very Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value: any) => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="run">Run</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="flexibility">Flexibility</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any additional notes about this workout..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* Actions */}
      <div className={cn(
          isDesktop 
            ? "flex justify-between gap-2" 
            : "border-t px-6 py-4 mt-auto bg-background"
        )}>
        {isDesktop ? (
            <>
              {/* Delete button - only show when editing */}
              {isEditing && onDelete && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete} 
                  disabled={loading || deleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              )}
              
              {/* Spacer when not editing */}
              {!isEditing && <div />}
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading || deleting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || deleting}>
                  {loading
                    ? (isEditing ? "Updating..." : "Creating...")
                    : (isEditing ? "Update Activity" : "Create Activity")}
                </Button>
              </div>
            </>
        ) : (
          <div className="space-y-3">
            <Button type="submit" disabled={loading || deleting} className="w-full h-12 text-base bg-brand hover:bg-brand/90 text-brand-foreground">
              {loading
                ? (isEditing ? "Updating..." : "Creating...")
                : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      {isEditing ? "Update Activity" : "Create Activity"}
                    </>
                )}
            </Button>
            
            {/* Delete button for mobile - only show when editing */}
            {isEditing && onDelete && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete} 
                disabled={loading || deleting}
                className="w-full h-12 text-base"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                {deleting ? "Deleting..." : "Delete Activity"}
              </Button>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
