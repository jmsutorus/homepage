"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart } from "lucide-react";
import { Meal } from "@/lib/types/meals";

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Import from Recipe
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Ingredients from Recipe</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Select value={selectedMealId} onValueChange={setSelectedMealId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a recipe..." />
              </SelectTrigger>
              <SelectContent>
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
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!selectedMealId || loading}
            >
              {loading ? "Importing..." : "Import Ingredients"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
