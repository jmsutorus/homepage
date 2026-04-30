"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Meal } from "@/lib/types/meals";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";

interface ImportIngredientsDialogProps {
  meals: Meal[];
  onImport: (mealId: number) => Promise<void>;
  trigger?: React.ReactNode;
}

export function ImportIngredientsDialog({
  meals,
  onImport,
  trigger,
}: ImportIngredientsDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!selectedMealId) return;
    setLoading(true);
    try {
      await onImport(parseInt(selectedMealId));
      setOpen(false);
      setSelectedMealId("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {trigger && (
        <div onClick={() => setOpen(true)} className="contents">
          {trigger}
        </div>
      )}
      <ResponsiveDialog 
        open={open} 
        onOpenChange={setOpen}
        title="Import Ingredients from Recipe"
        description="Choose a recipe to pull its ingredient list into your current session."
        onSubmit={handleImport}
        submitText="Import Ingredients"
        isLoading={loading}
      >
        <div className="space-y-8 py-4">
          <div className="space-y-3">
            <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Select Recipe</label>
            <Select value={selectedMealId} onValueChange={setSelectedMealId}>
              <SelectTrigger className="w-full px-8 py-8 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary text-media-primary font-bold text-lg font-lexend">
                <SelectValue placeholder="Select a recipe..." />
              </SelectTrigger>
              <SelectContent className="bg-media-surface-container border-media-outline-variant">
                {meals.length === 0 ? (
                  <SelectItem value="" disabled>
                    No recipes available
                  </SelectItem>
                ) : (
                  meals.map((meal) => (
                    <SelectItem key={meal.id} value={meal.id.toString()}>
                      {meal.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </ResponsiveDialog>
    </>
  );
}
