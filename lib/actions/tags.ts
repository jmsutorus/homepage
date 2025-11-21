"use server";

import { getUserId } from "@/lib/auth/server";
import { query } from "@/lib/db";

export interface TagFrequency {
  tag: string;
  count: number;
}

export async function getTagsWithFrequency(): Promise<TagFrequency[]> {
  const userId = await getUserId();
  const tagCounts: Record<string, number> = {};

  // Helper to process tags
  const processTags = (rows: { tags: string | null }[]) => {
    rows.forEach((row) => {
      if (row.tags) {
        try {
          const parsed = JSON.parse(row.tags);
          if (Array.isArray(parsed)) {
            parsed.forEach((tag: string) => {
              if (typeof tag === "string") {
                const normalized = tag.trim();
                if (normalized) {
                  tagCounts[normalized] = (tagCounts[normalized] || 0) + 1;
                }
              }
            });
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });
  };

  try {
    // 1. Journals
    const journals = query<{ tags: string | null }>(
      "SELECT tags FROM journals WHERE userId = ?",
      [userId]
    );
    processTags(journals);

    // 2. Media
    const media = query<{ tags: string | null }>(
      "SELECT tags FROM media_content WHERE userId = ?",
      [userId]
    );
    processTags(media);

    // 3. Parks
    const parks = query<{ tags: string | null }>(
      "SELECT tags FROM parks WHERE userId = ?",
      [userId]
    );
    processTags(parks);

    // Convert to array and sort
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}
