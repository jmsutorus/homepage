// Shared types for meals and grocery features
// This file contains only types and constants that can be used in both client and server components

export type IngredientCategory =
  | "produce"
  | "dairy"
  | "meat"
  | "pantry"
  | "frozen"
  | "bakery"
  | "beverages"
  | "other";

export const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  "produce",
  "dairy",
  "meat",
  "pantry",
  "frozen",
  "bakery",
  "beverages",
  "other",
];

export const CATEGORY_DISPLAY_NAMES: Record<IngredientCategory, string> = {
  produce: "Produce",
  dairy: "Dairy",
  meat: "Meat & Seafood",
  pantry: "Pantry",
  frozen: "Frozen",
  bakery: "Bakery",
  beverages: "Beverages",
  other: "Other",
};

export interface Meal {
  id: number;
  userId: string;
  name: string;
  description: string | null;
  steps: string | null;
  servings: number;
  prep_time: number | null;
  cook_time: number | null;
  image_url: string | null;
  tags: string | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface MealIngredient {
  id: number;
  mealId: number;
  name: string;
  quantity: number | null;
  unit: string | null;
  category: IngredientCategory;
  notes: string | null;
  order_index: number;
}

export interface MealInput {
  name: string;
  description?: string;
  steps?: string[];
  servings?: number;
  prep_time?: number;
  cook_time?: number;
  image_url?: string;
  tags?: string[];
  rating?: number;
}

export interface IngredientInput {
  name: string;
  quantity?: number;
  unit?: string;
  category?: IngredientCategory;
  notes?: string;
  order_index?: number;
}

export interface MealWithIngredients extends Meal {
  ingredients: MealIngredient[];
}

export interface GroceryItem {
  id: number;
  userId: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  category: IngredientCategory;
  checked: boolean;
  mealId: number | null;
  created_at: string;
}

export interface GroceryItemInput {
  name: string;
  quantity?: number;
  unit?: string;
  category?: IngredientCategory;
  mealId?: number;
}

export interface GroceryListByCategory {
  category: IngredientCategory;
  items: GroceryItem[];
}

// Helper functions that don't require server-side modules
export function parseSteps(stepsJson: string | null): string[] {
  if (!stepsJson) return [];
  try {
    const parsed = JSON.parse(stepsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseTags(tagsJson: string | null): string[] {
  if (!tagsJson) return [];
  try {
    const parsed = JSON.parse(tagsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

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

// Daily Meals Types
export type MealType = "breakfast" | "lunch" | "dinner";

export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

export const MEAL_TYPE_DISPLAY_NAMES: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

export interface DailyMeal {
  id: number;
  userId: string;
  date: string; // YYYY-MM-DD format
  meal_type: MealType;
  mealId: number;
  created_at: string;
  updated_at: string;
}

export interface DailyMealWithRecipe extends DailyMeal {
  meal: Meal;
}

export interface DailyMealInput {
  date: string;
  meal_type: MealType;
  mealId: number;
}
