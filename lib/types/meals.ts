import {
  type Meal,
  type Difficulty,
} from "@jmsutorus/earthbound-shared";

// Parsing helpers
export function parseSteps(stepsJson: string | null): string[] {
  if (!stepsJson) return [];
  try {
    const parsed = JSON.parse(stepsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return stepsJson.split("\n").filter(Boolean);
  }
}

export function parseTags(tagsJson: string | null): string[] {
  if (!tagsJson) return [];
  try {
    const parsed = JSON.parse(tagsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return tagsJson.split(",").map((t) => t.trim()).filter(Boolean);
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
  Difficulty,
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
