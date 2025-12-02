"use server";

import { getUserId } from "@/lib/auth/server";
import { query, execute } from "@/lib/db";
import { SearchFilters } from "@/lib/actions/search";

export interface SavedSearch {
  id: number;
  name: string;
  query: string;
  filters: SearchFilters;
  created_at: string;
}

export async function getSavedSearches(): Promise<SavedSearch[]> {
  const userId = await getUserId();
  const rows = await query<{
    id: number;
    name: string;
    query: string;
    filters: string;
    created_at: string;
  }>("SELECT * FROM saved_searches WHERE userId = ? ORDER BY created_at DESC", [userId]);

  return rows.map((row) => ({
    ...row,
    filters: row.filters ? JSON.parse(row.filters) : {},
  }));
}

export async function createSavedSearch(name: string, queryStr: string, filters: SearchFilters): Promise<SavedSearch> {
  const userId = await getUserId();
  const filtersJson = JSON.stringify(filters);

  const result = execute(
    "INSERT INTO saved_searches (userId, name, query, filters) VALUES (?, ?, ?, ?)",
    [userId, name, queryStr, filtersJson]
  );

  return {
    id: Number(result.lastInsertRowid),
    name,
    query: queryStr,
    filters,
    created_at: new Date().toISOString(),
  };
}

export async function deleteSavedSearch(id: number): Promise<void> {
  const userId = await getUserId();
  execute("DELETE FROM saved_searches WHERE id = ? AND userId = ?", [id, userId]);
}
