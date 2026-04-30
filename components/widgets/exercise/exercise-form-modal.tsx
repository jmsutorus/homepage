"use client";

import { useState, useEffect } from "react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditorialInput } from "@/components/ui/editorial-input";

export interface Exercise {
  description: string;
  reps?: number;
  sets?: number;
  duration?: number;
  weight?: number;
  muscle?: string;
}

const MUSCLE_GROUPS = {
  "Chest": ["Pectorals", "Upper Chest", "Lower Chest"],
  "Back": ["Lats", "Rhomboids", "Traps", "Lower Back"],
  "Shoulders": ["Front Delts", "Side Delts", "Rear Delts", "Rotator Cuff"],
  "Arms": ["Biceps", "Triceps", "Forearms"],
  "Legs": ["Quads", "Hamstrings", "Glutes", "Calves", "Adductors", "Abductors"],
  "Core": ["Abs", "Obliques", "Serratus"],
  "Full Body": ["Full Body", "Cardio"]
};

interface ExerciseFormModalProps {
  editExercise?: Exercise | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (exercise: Exercise) => void;
}

export function ExerciseFormModal({ editExercise, isOpen, onOpenChange, onSave }: ExerciseFormModalProps) {
  const [exercise, setExercise] = useState<Exercise>({
    description: "",
    reps: undefined,
    sets: undefined,
    duration: undefined,
    weight: undefined,
    muscle: "",
  });
  const [selectedGroup, setSelectedGroup] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
        if (editExercise) {
            setExercise(editExercise);
            if (editExercise.muscle) {
                const foundGroup = Object.entries(MUSCLE_GROUPS).find(([_, muscles]) => 
                    muscles.includes(editExercise.muscle!)
                )?.[0];
                if (foundGroup) {
                    setSelectedGroup(foundGroup);
                }
            }
        } else {
            setExercise({
                description: "",
                reps: undefined,
                sets: undefined,
                duration: undefined,
                weight: undefined,
                muscle: "",
            });
            setSelectedGroup("");
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(exercise);
    onOpenChange(false);
  };

  const updateField = (field: keyof Exercise, value: any) => {
    setExercise((prev) => ({ ...prev, [field]: value }));
  };

  const handleGroupChange = (group: string) => {
      setSelectedGroup(group);
      updateField("muscle", "");
  };

  const formContent = (
    <div className="space-y-6">
      <div className="space-y-8">
        <EditorialInput
          id="description"
          label="Description *"
          placeholder="e.g., Bench Press or Treadmill Run"
          value={exercise.description}
          onChange={(e) => updateField("description", e.target.value)}
          required
          autoFocus
          sizeVariant="lg"
        />

        <div className="grid grid-cols-2 gap-8">
          <EditorialInput
            id="sets"
            label="Sets"
            type="number"
            min="0"
            placeholder="3"
            value={exercise.sets || ""}
            onChange={(e) => updateField("sets", e.target.value ? parseInt(e.target.value) : undefined)}
            sizeVariant="lg"
          />
          <EditorialInput
            id="reps"
            label="Reps"
            type="number"
            min="0"
            placeholder="10"
            value={exercise.reps || ""}
            onChange={(e) => updateField("reps", e.target.value ? parseInt(e.target.value) : undefined)}
            sizeVariant="lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-8">
          <EditorialInput
            id="weight"
            label="Weight (lbs)"
            type="number"
            min="0"
            placeholder="45"
            value={exercise.weight || ""}
            onChange={(e) => updateField("weight", e.target.value ? parseInt(e.target.value) : undefined)}
            sizeVariant="lg"
          />
          <EditorialInput
            id="duration"
            label="Duration (min)"
            type="number"
            min="0"
            placeholder="10"
            value={exercise.duration || ""}
            onChange={(e) => updateField("duration", e.target.value ? parseInt(e.target.value) : undefined)}
            sizeVariant="lg"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-3">
            <label 
              htmlFor="muscleGroup"
              className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant"
            >
              Muscle Group
            </label>
            <Select 
              value={selectedGroup} 
              onValueChange={handleGroupChange}
            >
              <SelectTrigger 
                id="muscleGroup"
                className="w-full px-8 py-8 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-lg font-lexend"
              >
                <SelectValue placeholder="Select Group" />
              </SelectTrigger>
              <SelectContent className="bg-media-surface-container border-media-outline-variant">
                {Object.keys(MUSCLE_GROUPS).map((group) => (
                  <SelectItem key={group} value={group} className="font-lexend">
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <label 
              htmlFor="muscle"
              className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant"
            >
              Target Muscle
            </label>
            <Select 
              value={exercise.muscle || ""} 
              onValueChange={(value) => updateField("muscle", value)}
              disabled={!selectedGroup}
            >
              <SelectTrigger 
                id="muscle"
                className="w-full px-8 py-8 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-lg font-lexend disabled:opacity-50"
              >
                <SelectValue placeholder="Select Muscle" />
              </SelectTrigger>
              <SelectContent className="bg-media-surface-container border-media-outline-variant">
                {selectedGroup && (MUSCLE_GROUPS as any)[selectedGroup]?.map((muscle: string) => (
                  <SelectItem key={muscle} value={muscle} className="font-lexend">
                    {muscle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <button type="submit" className="cursor-pointer hidden" id="submit-exercise-button" />
    </div>
  );

  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title={editExercise ? "Edit Exercise" : "Add Exercise"}
      description={editExercise ? "Update the details of this exercise." : "Add a new exercise to your workout."}
      onSubmit={() => document.getElementById("submit-exercise-button")?.click()}
      submitText={editExercise ? "Update Exercise" : "Add Exercise"}
      maxWidth="sm:max-w-4xl"
    >
      <form onSubmit={handleSubmit}>
        {formContent}
      </form>
    </ResponsiveDialog>
  );
}
