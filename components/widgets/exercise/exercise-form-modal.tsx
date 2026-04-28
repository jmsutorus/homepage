"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { motion, PanInfo } from "framer-motion";

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
  const [isAtTop, setIsAtTop] = useState(true);

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
          <Label 
            htmlFor="description"
            className="text-xs font-bold text-soft-earth dark:text-white/40 uppercase tracking-tight"
          >
            Description *
          </Label>
          <Input
            id="description"
            placeholder="e.g., Bench Press or Treadmill Run"
            value={exercise.description}
            onChange={(e) => updateField("description", e.target.value)}
            required
            autoFocus
            className="rounded-xl border-stone-200 focus-visible:ring-evergreen dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label 
              htmlFor="sets"
              className="text-xs font-bold text-soft-earth dark:text-white/40 uppercase tracking-tight"
            >
              Sets
            </Label>
            <Input
              id="sets"
              type="number"
              min="0"
              placeholder="3"
              value={exercise.sets || ""}
              onChange={(e) => updateField("sets", e.target.value ? parseInt(e.target.value) : undefined)}
              className="rounded-xl border-stone-200 focus-visible:ring-evergreen dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
            />
          </div>
          <div className="space-y-2">
            <Label 
              htmlFor="reps"
              className="text-xs font-bold text-soft-earth dark:text-white/40 uppercase tracking-tight"
            >
              Reps
            </Label>
            <Input
              id="reps"
              type="number"
              min="0"
              placeholder="10"
              value={exercise.reps || ""}
              onChange={(e) => updateField("reps", e.target.value ? parseInt(e.target.value) : undefined)}
              className="rounded-xl border-stone-200 focus-visible:ring-evergreen dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label 
              htmlFor="weight"
              className="text-xs font-bold text-soft-earth dark:text-white/40 uppercase tracking-tight"
            >
              Weight (lbs)
            </Label>
            <Input
              id="weight"
              type="number"
              min="0"
              placeholder="45"
              value={exercise.weight || ""}
              onChange={(e) => updateField("weight", e.target.value ? parseInt(e.target.value) : undefined)}
              className="rounded-xl border-stone-200 focus-visible:ring-evergreen dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
            />
          </div>
          <div className="space-y-2">
            <Label 
              htmlFor="duration"
              className="text-xs font-bold text-soft-earth dark:text-white/40 uppercase tracking-tight"
            >
              Duration (min)
            </Label>
            <Input
              id="duration"
              type="number"
              min="0"
              placeholder="10"
              value={exercise.duration || ""}
              onChange={(e) => updateField("duration", e.target.value ? parseInt(e.target.value) : undefined)}
              className="rounded-xl border-stone-200 focus-visible:ring-evergreen dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label 
              htmlFor="muscleGroup"
              className="text-xs font-bold text-soft-earth dark:text-white/40 uppercase tracking-tight"
            >
              Muscle Group
            </Label>
            <Select 
              value={selectedGroup} 
              onValueChange={handleGroupChange}
            >
              <SelectTrigger 
                id="muscleGroup"
                className="rounded-xl border-stone-200 focus:ring-evergreen dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <SelectValue placeholder="Select Group" />
              </SelectTrigger>
              <SelectContent className="rounded-xl dark:bg-[#1b251e] dark:border-white/10 dark:text-white">
                {Object.keys(MUSCLE_GROUPS).map((group) => (
                  <SelectItem key={group} value={group} className="focus:bg-evergreen/10 focus:text-evergreen dark:focus:bg-white/10 dark:focus:text-white rounded-lg">
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label 
              htmlFor="muscle"
              className="text-xs font-bold text-soft-earth dark:text-white/40 uppercase tracking-tight"
            >
              Target Muscle
            </Label>
            <Select 
              value={exercise.muscle || ""} 
              onValueChange={(value) => updateField("muscle", value)}
              disabled={!selectedGroup}
            >
              <SelectTrigger 
                id="muscle"
                className="rounded-xl border-stone-200 focus:ring-evergreen dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <SelectValue placeholder="Select Muscle" />
              </SelectTrigger>
              <SelectContent className="rounded-xl dark:bg-[#1b251e] dark:border-white/10 dark:text-white">
                {selectedGroup && (MUSCLE_GROUPS as any)[selectedGroup]?.map((muscle: string) => (
                  <SelectItem key={muscle} value={muscle} className="focus:bg-evergreen/10 focus:text-evergreen dark:focus:bg-white/10 dark:focus:text-white rounded-lg">
                    {muscle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className={cn(isDesktop ? "flex justify-end gap-3" : "grid gap-3")}>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => onOpenChange(false)}
          className="rounded-xl border-evergreen/20 hover:bg-evergreen/5 hover:text-evergreen-dark text-soft-earth dark:border-white/10 dark:text-white/60 dark:hover:bg-white/5"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="bg-evergreen hover:bg-evergreen-dark text-white font-bold rounded-xl px-6"
        >
          {editExercise ? "Update Exercise" : "Add Exercise"}
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md bg-white dark:bg-[#1b251e] rounded-[2rem] border border-stone-200/50 dark:border-white/5 p-6 md:p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight text-evergreen-dark dark:text-white">
              {editExercise ? "Edit Exercise" : "Add Exercise"}
            </DialogTitle>
            <DialogDescription className="text-soft-earth dark:text-white/60 font-medium">
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
      <SheetContent side="bottom" className="rounded-t-3xl p-0 border-t-0 bg-media-surface-container-lowest overflow-hidden">
        <motion.div 
          className="flex flex-col h-full bg-media-surface-container-lowest"
          drag={isAtTop ? "y" : false}
          dragConstraints={{ top: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info: PanInfo) => {
            if (info.offset.y > 150 || info.velocity.y > 500) {
              onOpenChange(false);
            }
          }}
        >
          {/* Drag Handle */}
          <div className="flex-none flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-media-outline-variant/30 rounded-full" />
          </div>

          <div 
            className="flex flex-col h-full p-6 pt-2 overflow-y-auto"
            onScroll={(e) => setIsAtTop(e.currentTarget.scrollTop <= 0)}
          >
        <SheetHeader className="mb-4 text-left">
          <SheetTitle className="text-2xl font-black tracking-tight text-evergreen-dark dark:text-white">
            {editExercise ? "Edit Exercise" : "Add Exercise"}
          </SheetTitle>
          <SheetDescription className="text-soft-earth dark:text-white/60 font-medium">
            {editExercise ? "Update details" : "Add new exercise"}
          </SheetDescription>
        </SheetHeader>
        {formContent}
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
