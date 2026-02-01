"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

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
  const isDesktop = useMediaQuery("(min-width: 768px)");
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Input
            id="description"
            placeholder="e.g., Bench Press or Treadmill Run"
            value={exercise.description}
            onChange={(e) => updateField("description", e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sets">Sets</Label>
            <Input
              id="sets"
              type="number"
              min="0"
              placeholder="3"
              value={exercise.sets || ""}
              onChange={(e) => updateField("sets", e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reps">Reps</Label>
            <Input
              id="reps"
              type="number"
              min="0"
              placeholder="10"
              value={exercise.reps || ""}
              onChange={(e) => updateField("reps", e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (lbs)</Label>
            <Input
              id="weight"
              type="number"
              min="0"
              placeholder="45"
              value={exercise.weight || ""}
              onChange={(e) => updateField("weight", e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
          <div className="space-y-2">
               <Label htmlFor="duration">Duration (min)</Label>
               <Input
                 id="duration"
                 type="number"
                 min="0"
                 placeholder="10"
                 value={exercise.duration || ""}
                 onChange={(e) => updateField("duration", e.target.value ? parseInt(e.target.value) : undefined)}
               />
          </div>
        </div>
        
         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="muscleGroup">Muscle Group</Label>
                <Select 
                    value={selectedGroup} 
                    onValueChange={handleGroupChange}
                >
                    <SelectTrigger id="muscleGroup">
                        <SelectValue placeholder="Select Group" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(MUSCLE_GROUPS).map((group) => (
                            <SelectItem key={group} value={group}>
                                {group}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="muscle">Target Muscle</Label>
                <Select 
                    value={exercise.muscle || ""} 
                    onValueChange={(value) => updateField("muscle", value)}
                    disabled={!selectedGroup}
                >
                    <SelectTrigger id="muscle">
                        <SelectValue placeholder="Select Muscle" />
                    </SelectTrigger>
                    <SelectContent>
                        {selectedGroup && (MUSCLE_GROUPS as any)[selectedGroup]?.map((muscle: string) => (
                            <SelectItem key={muscle} value={muscle}>
                                {muscle}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
         </div>
      </div>

      <div className={cn(isDesktop ? "flex justify-end gap-2" : "grid gap-2")}>
        {isDesktop && (
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
            </Button>
        )}
        <Button type="submit">
          {editExercise ? "Update Exercise" : "Add Exercise"}
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editExercise ? "Edit Exercise" : "Add Exercise"}</DialogTitle>
             <DialogDescription>
                {editExercise ? "Update the details of this exercise." : "Add a new exercise to your workout."}
            </DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl p-6 h-auto max-h-[90vh] overflow-y-auto">
        <SheetHeader className="mb-4 text-left">
          <SheetTitle>{editExercise ? "Edit Exercise" : "Add Exercise"}</SheetTitle>
           <SheetDescription>
                {editExercise ? "Update details" : "Add new exercise"}
            </SheetDescription>
        </SheetHeader>
        {formContent}
      </SheetContent>
    </Sheet>
  );
}
