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
  const [difficulty, setDifficulty] = useState<"easy" | "moderate" | "hard" | "very hard">("moderate");
  const [type, setType] = useState<"cardio" | "strength" | "flexibility" | "sports" | "mixed" | "other">("cardio");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([
    { description: "", reps: undefined, sets: undefined, duration: undefined, pace: "", weight: undefined }
  ]);

  // Load edit activity data when provided
  useEffect(() => {
    if (editActivity) {
      setActivityId(editActivity.id);
      setDate(editActivity.date);
      setTime(editActivity.time);
      setLength(editActivity.length);
      setDifficulty(editActivity.difficulty);
      setType(editActivity.type);
      setNotes(editActivity.notes || "");

      // Parse exercises from JSON string
      try {
        const parsedExercises = JSON.parse(editActivity.exercises);
        setExercises(parsedExercises.length > 0 ? parsedExercises : [
          { description: "", reps: undefined, sets: undefined, duration: undefined, pace: "", weight: undefined }
        ]);
      } catch {
        setExercises([{ description: "", reps: undefined, sets: undefined, duration: undefined, pace: "", weight: undefined }]);
      }
    } else {
        // Reset handled by effect or parent logic - here we stay consistent with resetForm logic if needed
    }
  }, [editActivity]);

  const resetForm = () => {
    setActivityId(null);
    setDate(new Date().toISOString().split("T")[0]);
    setTime("07:00");
    setLength(60);
    setDifficulty("moderate");
    setType("cardio");
    setNotes("");
    setExercises([{ description: "", reps: undefined, sets: undefined, duration: undefined, pace: "", weight: undefined }]);
  };

  const addExercise = () => {
    setExercises([...exercises, { description: "", reps: undefined, sets: undefined, duration: undefined, pace: "", weight: undefined }]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty exercises
      const validExercises = exercises.filter(ex => ex.description?.trim() !== "");

      if (validExercises.length === 0) {
        alert("Please add at least one exercise");
        setLoading(false);
        return;
      }

      const isEditing = activityId !== null;
      const url = "/api/activities";
      const method = isEditing ? "PATCH" : "POST";
      const body = isEditing
        ? {
            id: activityId,
            date,
            time,
            length,
            difficulty,
            type,
            exercises: validExercises,
            notes,
          }
        : {
            date,
            time,
            length,
            difficulty,
            type,
            exercises: validExercises,
            notes,
          };

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

        {/* Length, Difficulty, Type */}
        <div className="grid grid-cols-3 gap-4">
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

        {/* Exercises */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Exercises</Label>
            <Button type="button" variant="outline" size="sm" onClick={addExercise}>
              <Plus className="h-4 w-4 mr-1" />
              Add Exercise
            </Button>
          </div>

          {exercises.map((exercise, index) => (
            <div key={index} className="space-y-3 p-4 border rounded-lg relative">
              {exercises.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => removeExercise(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              <div className="space-y-2">
                <Label htmlFor={`exercise-${index}`}>Description *</Label>
                <Input
                  id={`exercise-${index}`}
                  placeholder="e.g., Run 10 minutes or Barbell curls"
                  value={exercise.description}
                  onChange={(e) => updateExercise(index, "description", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor={`reps-${index}`}>Reps</Label>
                  <Input
                    id={`reps-${index}`}
                    type="number"
                    min="0"
                    placeholder="10"
                    value={exercise.reps || ""}
                    onChange={(e) => updateExercise(index, "reps", e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`sets-${index}`}>Sets</Label>
                  <Input
                    id={`sets-${index}`}
                    type="number"
                    min="0"
                    placeholder="3"
                    value={exercise.sets || ""}
                    onChange={(e) => updateExercise(index, "sets", e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`weight-${index}`}>Weight (lbs)</Label>
                  <Input
                    id={`weight-${index}`}
                    type="number"
                    min="0"
                    placeholder="45"
                    value={exercise.weight || ""}
                    onChange={(e) => updateExercise(index, "weight", e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor={`duration-${index}`}>Duration (min)</Label>
                  <Input
                    id={`duration-${index}`}
                    type="number"
                    min="0"
                    placeholder="10"
                    value={exercise.duration || ""}
                    onChange={(e) => updateExercise(index, "duration", e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`pace-${index}`}>Pace</Label>
                  <Input
                    id={`pace-${index}`}
                    placeholder="6:00/mile"
                    value={exercise.pace || ""}
                    onChange={(e) => updateExercise(index, "pace", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
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
