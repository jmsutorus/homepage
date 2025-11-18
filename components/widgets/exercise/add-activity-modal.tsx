"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import type { WorkoutActivity } from "@/lib/db/workout-activities";

interface Exercise {
  description: string;
  reps?: number;
  sets?: number;
  duration?: number;
  pace?: string;
  weight?: number;
}

interface AddActivityModalProps {
  onActivityAdded?: () => void;
  editActivity?: WorkoutActivity | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showButton?: boolean;
}

export function AddActivityModal({ onActivityAdded, editActivity, isOpen, onOpenChange, showButton }: AddActivityModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [activityId, setActivityId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("07:00");
  const [length, setLength] = useState(60);
  const [difficulty, setDifficulty] = useState<"easy" | "moderate" | "hard" | "very hard">("moderate");
  const [type, setType] = useState<"cardio" | "strength" | "flexibility" | "sports" | "mixed" | "other">("cardio");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([
    { description: "", reps: undefined, sets: undefined, duration: undefined, pace: "", weight: undefined }
  ]);

  // Use controlled open state if provided
  const isModalOpen = isOpen !== undefined ? isOpen : open;
  const setIsModalOpen = onOpenChange || setOpen;

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
      resetForm();
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
      const validExercises = exercises.filter(ex => ex.description.trim() !== "");

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
      setIsModalOpen(false);
      onActivityAdded?.();
    } catch (error) {
      console.error(`Error ${activityId ? "updating" : "creating"} activity:`, error);
      alert(`Failed to ${activityId ? "update" : "create"} activity. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = activityId !== null;

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      {!editActivity && showButton && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Activity
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Workout Activity" : "Add Workout Activity"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update your workout activity details" : "Create a new workout activity with exercises and details"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="length">Length (minutes)</Label>
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
                    placeholder="e.g., Run 10 minutes at 6 minute mile pace or Barbell curls"
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

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? (isEditing ? "Updating..." : "Creating...")
                : (isEditing ? "Update Activity" : "Create Activity")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
