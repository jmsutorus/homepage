"use server";

import { query } from "@/lib/db";
import { getUserId } from "@/lib/auth/server";

export type SearchResult = {
  id: string | number;
  title: string;
  type: "task" | "journal" | "media" | "park" | "habit";
  url: string;
  description?: string;
  date?: string;
};

export type SearchResults = {
  tasks: SearchResult[];
  journals: SearchResult[];
  media: SearchResult[];
  parks: SearchResult[];
  habits: SearchResult[];
};

export type SearchFilters = {
  types?: string[]; // 'task', 'journal', 'media', 'park', 'habit'
  tags?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
};

export async function searchGlobal(queryStr: string, filters?: SearchFilters): Promise<SearchResults> {
  try {
    const userId = await getUserId();
    
    if (!queryStr || queryStr.trim().length === 0) {
      return { tasks: [], journals: [], media: [], parks: [], habits: [] };
    }

    const searchTerm = `%${queryStr}%`;
    const limit = 5;

    // Helper to check if a type should be searched
    const shouldSearch = (type: string) => !filters?.types || filters.types.length === 0 || filters.types.includes(type);

    // Helper to build tag clause
    const buildTagClause = () => {
      if (!filters?.tags || filters.tags.length === 0) return "";
      // For each tag, we need a LIKE clause. AND them together for "all tags" or OR for "any tag"?
      // Usually filters are AND.
      // tags column is JSON string e.g. ["tag1", "tag2"]
      return " AND (" + filters.tags.map(tag => `tags LIKE '%"${tag}"%'`).join(" AND ") + ")";
    };

    // Helper to build date clause
    const buildDateClause = (dateColumn: string) => {
      if (!filters?.dateRange) return "";
      let clause = "";
      if (filters.dateRange.start) {
        clause += ` AND ${dateColumn} >= '${filters.dateRange.start}'`;
      }
      if (filters.dateRange.end) {
        clause += ` AND ${dateColumn} <= '${filters.dateRange.end}'`;
      }
      return clause;
    };

    let tasks: SearchResult[] = [];
    if (shouldSearch("task")) {
      // Tasks don't have tags usually, so we skip tag filter for tasks or return empty if tags are required?
      // If tags are required, tasks should probably be empty unless we add tags to tasks.
      // For now, if tags are present, we skip tasks.
      if (!filters?.tags || filters.tags.length === 0) {
        tasks = await query<any>(
          `SELECT id, title, due_date as date FROM tasks WHERE userId = ? AND title LIKE ? ${buildDateClause('created_at')} ORDER BY created_at DESC LIMIT ?`,
          [userId, searchTerm, limit]
        ).map(t => ({ 
          id: t.id, 
          title: t.title, 
          type: "task" as const, 
          url: "/tasks",
          date: t.date
        }));
      }
    }

    let journals: SearchResult[] = [];
    if (shouldSearch("journal")) {
      journals = await query<any>(
        `SELECT id, title, slug, daily_date as date, content FROM journals WHERE userId = ? AND (title LIKE ? OR content LIKE ?) ${buildTagClause()} ${buildDateClause('created_at')} ORDER BY created_at DESC LIMIT ?`,
        [userId, searchTerm, searchTerm, limit]
      ).map(j => ({
        id: j.id,
        title: j.title,
        type: "journal" as const,
        url: `/journals/${j.slug}`,
        date: j.date,
        description: j.content ? j.content.substring(0, 100) + "..." : ""
      }));
    }

    let media: SearchResult[] = [];
    if (shouldSearch("media")) {
      media = await query<any>(
        `SELECT id, title, slug, type as mediaType, description FROM media_content WHERE userId = ? AND (title LIKE ? OR description LIKE ?) ${buildTagClause()} ${buildDateClause('created_at')} ORDER BY created_at DESC LIMIT ?`,
        [userId, searchTerm, searchTerm, limit]
      ).map(m => ({
        id: m.id,
        title: m.title,
        type: "media" as const,
        url: `/media/${m.mediaType}/${m.slug}`,
        description: m.description ? m.description.substring(0, 100) + "..." : ""
      }));
    }

    let parks: SearchResult[] = [];
    if (shouldSearch("park")) {
      parks = await query<any>(
        `SELECT id, title, slug, description FROM parks WHERE userId = ? AND (title LIKE ? OR description LIKE ?) ${buildTagClause()} ${buildDateClause('created_at')} ORDER BY created_at DESC LIMIT ?`,
        [userId, searchTerm, searchTerm, limit]
      ).map(p => ({
        id: p.id,
        title: p.title,
        type: "park" as const,
        url: `/parks/${p.slug}`,
        description: p.description ? p.description.substring(0, 100) + "..." : ""
      }));
    }

    let habits: SearchResult[] = [];
    if (shouldSearch("habit")) {
      // Habits don't have tags
      if (!filters?.tags || filters.tags.length === 0) {
        habits = await query<any>(
          `SELECT id, title, description FROM habits WHERE userId = ? AND (title LIKE ? OR description LIKE ?) ${buildDateClause('created_at')} ORDER BY created_at DESC LIMIT ?`,
          [userId, searchTerm, searchTerm, limit]
        ).map(h => ({
          id: h.id,
          title: h.title,
          type: "habit" as const,
          url: "/habits",
          description: h.description ? h.description.substring(0, 100) + "..." : ""
        }));
      }
    }

    return {
      tasks,
      journals,
      media,
      parks,
      habits
    };
  } catch (error) {
    console.error("Search error:", error);
    return { tasks: [], journals: [], media: [], parks: [], habits: [] };
  }
}
