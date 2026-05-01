import {
  type Meal,
} from "@jmsutorus/earthbound-shared";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

// Parsing helpers
export function parseSteps(steps: string | string[] | null): string[] {
  if (!steps) return [];
  if (Array.isArray(steps)) return steps;
  try {
    const parsed = JSON.parse(steps);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return steps.split("\n").filter(Boolean);
  }
}

export function parseTags(tags: string | string[] | null): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return tags.split(",").map((t) => t.trim()).filter(Boolean);
  }
}

// Re-export core types for convenience
export type {
  IngredientCategory,
  Meal,
  MealIngredient,
  MealInput,
  IngredientInput,
  MealWithIngredients,
  GroceryItem,
  GroceryItemInput,
  GroceryListByCategory,
  MealType,
  DailyMeal,
  DailyMealWithRecipe,
  DailyMealInput,
} from "@jmsutorus/earthbound-shared";

export {
  INGREDIENT_CATEGORIES,
  CATEGORY_DISPLAY_NAMES,
  MEAL_TYPES,
  MEAL_TYPE_DISPLAY_NAMES,
} from "@jmsutorus/earthbound-shared";

// Helper functions for UI calculations
export function getTotalTime(meal: Meal): number | null {
  if (meal.prep_time === null && meal.cook_time === null) return null;
  return (meal.prep_time || 0) + (meal.cook_time || 0);
}

export function formatTime(minutes: number | null): string {
  if (minutes === null) return "";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getDifficulty(meal: Meal & { ingredient_count?: number }): Difficulty {
  const totalTime = getTotalTime(meal) || 0;
  const steps = parseSteps(meal.steps);
  const stepCount = steps.length;
  const ingredientCount = meal.ingredient_count || 0;

  // Algorithm: 
  // Beginner: Time < 30m AND steps < 6 AND ingredients < 8
  // Advanced: Time > 90m OR steps > 12 OR ingredients > 15
  // Intermediate: Everything else
  
  if (totalTime <= 30 && stepCount < 6 && ingredientCount < 8) {
    return "Beginner";
  }
  
  if (totalTime >= 90 || stepCount >= 12 || ingredientCount >= 15) {
    return "Advanced";
  }
  
  return "Intermediate";
}
