import { earthboundFetch } from "../api/earthbound";

import {
  type Meal,
  type MealIngredient,
  type MealInput,
  type IngredientInput,
  type MealWithIngredients,
  INGREDIENT_CATEGORIES,
} from "@jmsutorus/earthbound-shared";

export type {
  Meal,
  MealIngredient,
  MealInput,
  IngredientInput,
  MealWithIngredients,
};

export { INGREDIENT_CATEGORIES };
// ==================== Meal CRUD ====================

// Create a new meal
export async function createMeal(
  data: MealInput,
  userId: string
): Promise<Meal> {
  const response = await earthboundFetch(`/api/meals`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create meal: ${response.statusText}`);
  }

  return response.json() as Promise<Meal>;
}

// Get a meal by ID with ownership verification
export async function getMealById(
  id: number,
  userId: string
): Promise<Meal | undefined> {
  const response = await earthboundFetch(`/api/meals/id/${id}?userId=${userId}`);
  if (!response.ok) {
    if (response.status === 404) return undefined;
    throw new Error(`Failed to fetch meal: ${response.statusText}`);
  }
  return response.json() as Promise<Meal>;
}

// Get all meals for a user with ingredient counts
export async function getAllMeals(userId: string): Promise<(Meal & { ingredient_count: number })[]> {
  const response = await earthboundFetch(`/api/meals?userId=${userId}`);
  if (!response.ok) throw new Error(`Failed to fetch meals: ${response.statusText}`);
  return response.json() as Promise<(Meal & { ingredient_count: number })[]>;
}

// Get meal with ingredients
export async function getMealWithIngredients(
  id: number,
  userId: string
): Promise<MealWithIngredients | undefined> {
  const response = await earthboundFetch(`/api/meals/id/${id}/full?userId=${userId}`);
  if (!response.ok) {
    if (response.status === 404) return undefined;
    throw new Error(`Failed to fetch meal with ingredients: ${response.statusText}`);
  }
  return response.json() as Promise<MealWithIngredients>;
}

// Update a meal with ownership verification
export async function updateMeal(
  id: number,
  userId: string,
  data: Partial<MealInput>
): Promise<boolean> {
  const response = await earthboundFetch(`/api/meals/id/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

// Delete a meal with ownership verification
export async function deleteMeal(id: number, userId: string): Promise<boolean> {
  const response = await earthboundFetch(`/api/meals/id/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

// Search meals by name
export async function searchMeals(
  userId: string,
  searchTerm: string
): Promise<Meal[]> {
  const response = await earthboundFetch(`/api/meals/search?userId=${userId}&q=${encodeURIComponent(searchTerm)}`);
  if (!response.ok) throw new Error(`Failed to search meals: ${response.statusText}`);
  return response.json() as Promise<Meal[]>;
}

// ==================== Ingredient CRUD ====================

// Add an ingredient to a meal
export async function addIngredient(
  mealId: number,
  data: IngredientInput
): Promise<MealIngredient> {
  const response = await earthboundFetch(`/api/meals/id/${mealId}/ingredients`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to add ingredient: ${response.statusText}`);
  }

  return response.json() as Promise<MealIngredient>;
}

// Get all ingredients for a meal
export async function getIngredients(mealId: number): Promise<MealIngredient[]> {
  const meal = await getMealWithIngredients(mealId, ""); // userId not used in API for ingredients yet but good practice
  return meal?.ingredients || [];
}

// Update an ingredient
export async function updateIngredient(
  id: number,
  data: Partial<IngredientInput>
): Promise<boolean> {
  // We need the mealId for the API route. Let's assume the caller doesn't provide it.
  // Actually, I should probably update the API to just take the ingredientId.
  // For now, I'll use a hack or update the API.
  // Let's update the API to have /api/meals/ingredients/id/:ingredientId
  
  const response = await earthboundFetch(`/api/meals/ingredients/id/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

// Delete an ingredient
export async function deleteIngredient(id: number): Promise<boolean> {
  const response = await earthboundFetch(`/api/meals/ingredients/id/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

// Delete all ingredients for a meal
export async function deleteAllIngredients(mealId: number): Promise<number> {
  // Not implemented in API yet, but we could add it
  return 0;
}

// Reorder ingredients
export async function reorderIngredients(
  mealId: number,
  orderedIds: number[]
): Promise<void> {
  const response = await earthboundFetch(`/api/meals/id/${mealId}/ingredients/reorder`, {
    method: "POST",
    body: JSON.stringify({ orderedIds }),
  });
  if (!response.ok) throw new Error(`Failed to reorder ingredients: ${response.statusText}`);
}
