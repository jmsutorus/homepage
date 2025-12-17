import { execute, query, queryOne } from "./index";

// Re-export types from shared types file
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

import type { DailyMeal, DailyMealWithRecipe, DailyMealInput, MealType } from "@/lib/types/meals";

// ==================== Daily Meal CRUD ====================

// Get all daily meals for a specific date
export async function getDailyMealsByDate(
  userId: string,
  date: string
): Promise<DailyMealWithRecipe[]> {
  const sql = `
    SELECT
      dm.*,
      m.id as meal_id,
      m.userId as meal_userId,
      m.name as meal_name,
      m.description as meal_description,
      m.steps as meal_steps,
      m.servings as meal_servings,
      m.prep_time as meal_prep_time,
      m.cook_time as meal_cook_time,
      m.image_url as meal_image_url,
      m.tags as meal_tags,
      m.created_at as meal_created_at,
      m.updated_at as meal_updated_at
    FROM daily_meals dm
    INNER JOIN meals m ON dm.mealId = m.id
    WHERE dm.userId = ? AND dm.date = ?
    ORDER BY
      CASE dm.meal_type
        WHEN 'breakfast' THEN 1
        WHEN 'lunch' THEN 2
        WHEN 'dinner' THEN 3
      END
  `;

  const rows = await query<any>(sql, [userId, date]);

  return rows.map(row => ({
    id: row.id,
    userId: row.userId,
    date: row.date,
    meal_type: row.meal_type as MealType,
    mealId: row.mealId,
    created_at: row.created_at,
    updated_at: row.updated_at,
    meal: {
      id: row.meal_id,
      userId: row.meal_userId,
      name: row.meal_name,
      description: row.meal_description,
      steps: row.meal_steps,
      servings: row.meal_servings,
      prep_time: row.meal_prep_time,
      cook_time: row.meal_cook_time,
      image_url: row.meal_image_url,
      tags: row.meal_tags,
      created_at: row.meal_created_at,
      updated_at: row.meal_updated_at,
    }
  }));
}

// Add a meal to a specific day
export async function addDailyMeal(
  data: DailyMealInput,
  userId: string
): Promise<DailyMeal> {
  const sql = `
    INSERT INTO daily_meals (userId, date, meal_type, mealId)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(userId, date, meal_type)
    DO UPDATE SET mealId = excluded.mealId, updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;

  const result = await queryOne<DailyMeal>(
    sql,
    [userId, data.date, data.meal_type, data.mealId]
  );

  if (!result) {
    throw new Error("Failed to add daily meal");
  }

  return result;
}

// Update a daily meal (change which recipe is linked)
export async function updateDailyMeal(
  id: number,
  mealId: number,
  userId: string
): Promise<DailyMeal> {
  const sql = `
    UPDATE daily_meals
    SET mealId = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND userId = ?
    RETURNING *
  `;

  const result = await queryOne<DailyMeal>(sql, [mealId, id, userId]);

  if (!result) {
    throw new Error("Daily meal not found or access denied");
  }

  return result;
}

// Delete a daily meal entry
export async function deleteDailyMeal(
  id: number,
  userId: string
): Promise<void> {
  const sql = `DELETE FROM daily_meals WHERE id = ? AND userId = ?`;
  await execute(sql, [id, userId]);
}

// Get a single daily meal by ID
export async function getDailyMealById(
  id: number,
  userId: string
): Promise<DailyMeal | null> {
  const sql = `
    SELECT * FROM daily_meals
    WHERE id = ? AND userId = ?
  `;

  const result = await queryOne<DailyMeal>(sql, [id, userId]);
  return result ?? null;
}

// Delete a daily meal by date and meal type
export async function deleteDailyMealByDateAndType(
  userId: string,
  date: string,
  mealType: MealType
): Promise<void> {
  const sql = `DELETE FROM daily_meals WHERE userId = ? AND date = ? AND meal_type = ?`;
  await execute(sql, [userId, date, mealType]);
}

// Get daily meals for a date range (for calendar)
export async function getDailyMealsForRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyMeal[]> {
  const sql = `
    SELECT * FROM daily_meals
    WHERE userId = ? AND date BETWEEN ? AND ?
    ORDER BY date,
      CASE meal_type
        WHEN 'breakfast' THEN 1
        WHEN 'lunch' THEN 2
        WHEN 'dinner' THEN 3
      END
  `;

  return await query<DailyMeal>(sql, [userId, startDate, endDate]);
}
