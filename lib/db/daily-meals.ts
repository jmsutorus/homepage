import { earthboundFetch } from "../api/earthbound";
import type { 
  DailyMeal, 
  DailyMealWithRecipe, 
  DailyMealInput, 
  MealType 
} from "@/lib/types/meals";

export type {
  MealType,
  DailyMeal,
  DailyMealWithRecipe,
  DailyMealInput,
} from "@/lib/types/meals";

export {
  MEAL_TYPES,
  MEAL_TYPE_DISPLAY_NAMES,
} from "@/lib/types/meals";

// ==================== Daily Meal CRUD ====================

// Get all daily meals for a specific date
export async function getDailyMealsByDate(
  userId: string,
  date: string
): Promise<DailyMealWithRecipe[]> {
  const res = await earthboundFetch(`/api/daily-meals/date/${date}?userId=${userId}`);
  if (!res.ok) return [];
  return await res.json();
}

// Add a meal to a specific day
export async function addDailyMeal(
  data: DailyMealInput,
  userId: string
): Promise<DailyMeal> {
  const res = await earthboundFetch(`/api/daily-meals?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to add daily meal");
  }

  return await res.json();
}

// Update a daily meal (change which recipe is linked)
export async function updateDailyMeal(
  id: number,
  mealId: number,
  userId: string
): Promise<DailyMeal> {
  const res = await earthboundFetch(`/api/daily-meals/id/${id}?userId=${userId}&mealId=${mealId}`, {
    method: 'PATCH',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Daily meal not found or access denied");
  }

  return await res.json();
}

// Delete a daily meal entry
export async function deleteDailyMeal(
  id: number,
  userId: string
): Promise<void> {
  const res = await earthboundFetch(`/api/daily-meals/id/${id}?userId=${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete daily meal");
  }
}

// Get a single daily meal by ID
export async function getDailyMealById(
  id: number,
  userId: string
): Promise<DailyMeal | null> {
  const res = await earthboundFetch(`/api/daily-meals/id/${id}?userId=${userId}`);
  if (!res.ok) return null;
  return await res.json();
}

// Delete a daily meal by date and meal type
export async function deleteDailyMealByDateAndType(
  userId: string,
  date: string,
  mealType: MealType
): Promise<void> {
  const res = await earthboundFetch(`/api/daily-meals/date/${date}/type/${mealType}?userId=${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete daily meal");
  }
}

// Get daily meals for a date range (for calendar)
export async function getDailyMealsForRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyMeal[]> {
  const res = await earthboundFetch(`/api/daily-meals/range?userId=${userId}&startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) return [];
  return await res.json();
}
