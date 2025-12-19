"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Utensils } from "lucide-react";
import { toast } from "sonner";
import type { Meal, DailyMealWithRecipe, MealType } from "@/lib/types/meals";
import { MEAL_TYPE_DISPLAY_NAMES as DISPLAY_NAMES } from "@/lib/types/meals";

interface DailyMealsProps {
  date: string;
  initialDailyMeals: DailyMealWithRecipe[];
  availableRecipes: Meal[];
}

export function DailyMeals({
  date,
  initialDailyMeals,
  availableRecipes,
}: DailyMealsProps) {
  const [dailyMeals, setDailyMeals] = useState<Record<MealType, number | null>>({
    breakfast: null,
    lunch: null,
    dinner: null,
  });

  const [loading, setLoading] = useState<Record<MealType, boolean>>({
    breakfast: false,
    lunch: false,
    dinner: false,
  });

  // Initialize state from initial data
  useEffect(() => {
    const meals: Record<MealType, number | null> = {
      breakfast: null,
      lunch: null,
      dinner: null,
    };

    initialDailyMeals.forEach((dm) => {
      meals[dm.meal_type] = dm.mealId;
    });

    setDailyMeals(meals);
  }, [initialDailyMeals]);

  const handleMealChange = async (mealType: MealType, mealId: string) => {
    if (!mealId) return;

    setLoading((prev) => ({ ...prev, [mealType]: true }));

    try {
      const response = await fetch("/api/daily-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          meal_type: mealType,
          mealId: parseInt(mealId),
        }),
      });

      if (!response.ok) throw new Error("Failed to save meal");

      setDailyMeals((prev) => ({ ...prev, [mealType]: parseInt(mealId) }));
      toast.success(`${DISPLAY_NAMES[mealType]} updated`);
    } catch {
      toast.error("Failed to save meal");
    } finally {
      setLoading((prev) => ({ ...prev, [mealType]: false }));
    }
  };

  const handleRemoveMeal = async (mealType: MealType) => {
    setLoading((prev) => ({ ...prev, [mealType]: true }));

    try {
      const response = await fetch(
        `/api/daily-meals?date=${date}&meal_type=${mealType}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to remove meal");

      setDailyMeals((prev) => ({ ...prev, [mealType]: null }));
      toast.success(`${DISPLAY_NAMES[mealType]} removed`);
    } catch {
      toast.error("Failed to remove meal");
    } finally {
      setLoading((prev) => ({ ...prev, [mealType]: false }));
    }
  };

  const getRecipeName = (mealId: number | null): string => {
    if (!mealId) return "";
    const recipe = availableRecipes.find((r) => r.id === mealId);
    return recipe?.name || "";
  };

  const mealTypes: MealType[] = ["breakfast", "lunch", "dinner"];

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {mealTypes.map((mealType) => (
          <div key={mealType} className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Utensils className="h-4 w-4 text-muted-foreground" />
              {DISPLAY_NAMES[mealType]}
            </label>
            <div className="flex gap-2">
              <Select
                value={dailyMeals[mealType]?.toString() || ""}
                onValueChange={(value) => handleMealChange(mealType, value)}
                disabled={loading[mealType]}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a recipe...">
                    {dailyMeals[mealType]
                      ? getRecipeName(dailyMeals[mealType])
                      : "Select a recipe..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableRecipes.length === 0 ? (
                    <SelectItem value="" disabled>
                      No recipes available
                    </SelectItem>
                  ) : (
                    availableRecipes.map((recipe) => (
                      <SelectItem key={recipe.id} value={recipe.id.toString()}>
                        {recipe.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {dailyMeals[mealType] && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMeal(mealType)}
                  disabled={loading[mealType]}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove {mealType}</span>
                </Button>
              )}
            </div>
          </div>
        ))}

        {availableRecipes.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            No recipes available. Create some recipes first!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
