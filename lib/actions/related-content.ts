"use server";

import { getUserId } from "@/lib/auth/server";
import { query } from "@/lib/db";

interface RelatedMedia {
  id: number;
  slug: string;
  title: string;
  type: string;
  poster: string | null;
  rating: number | null;
  status: string;
  genres: string | null;
  tags: string | null;
  matchScore: number;
}

interface RelatedJournal {
  id: number;
  slug: string;
  title: string;
  journal_type: string;
  daily_date: string | null;
  created_at: string;
  tags: string | null;
  mood: number | null;
  matchScore: number;
}

interface RelatedPark {
  id: number;
  slug: string;
  title: string;
  category: string;
  state: string | null;
  poster: string | null;
  tags: string | null;
  matchScore: number;
}

/**
 * Calculate match score between two arrays (e.g., tags, genres)
 */
async function calculateArrayMatchScore(arr1: string[], arr2: string[]): Promise<number> {
  if (arr1.length === 0 || arr2.length === 0) return 0;
  const set1 = new Set(arr1);
  const matches = arr2.filter(item => set1.has(item)).length;
  return matches;
}

/**
 * Parse JSON array safely
 */
async function parseJsonArray(json: string | null): Promise<string[]> {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Get related media based on genres and tags
 */
export async function getRelatedMedia(
  currentSlug: string,
  currentGenres: string[] = [],
  currentTags: string[] = [],
  limit: number = 6
): Promise<RelatedMedia[]> {
  const userId = await getUserId();

  try {
    // Get all media except the current one
    const allMedia = await query<{
      id: number;
      slug: string;
      title: string;
      type: string;
      poster: string | null;
      rating: number | null;
      status: string;
      genres: string | null;
      tags: string | null;
    }>(
      `SELECT id, slug, title, type, poster, rating, status, genres, tags
       FROM media_content
       WHERE userId = ? AND slug != ? AND published = 1
       ORDER BY updated_at DESC`,
      [userId, currentSlug]
    );

    // Calculate match scores
    const mediaWithScores: RelatedMedia[] = await Promise.all(allMedia.map(async (media) => {
      const mediaGenres = await parseJsonArray(media.genres);
      const mediaTags = await parseJsonArray(media.tags);

      const genreScore = await calculateArrayMatchScore(currentGenres, mediaGenres) * 2; // Weight genres higher
      const tagScore = await calculateArrayMatchScore(currentTags, mediaTags);

      return {
        ...media,
        matchScore: genreScore + tagScore,
      };
    }));

    // Filter items with at least 1 match and sort by score
    const relatedMedia = mediaWithScores
      .filter((media) => media.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    return relatedMedia;
  } catch (error) {
    console.error("Error fetching related media:", error);
    return [];
  }
}

/**
 * Get related journals based on tags and mood
 */
export async function getRelatedJournals(
  currentSlug: string,
  currentTags: string[] = [],
  currentMood?: number,
  limit: number = 6
): Promise<RelatedJournal[]> {
  const userId = await getUserId();

  try {
    // Get all journals except the current one
    const allJournals = await query<{
      id: number;
      slug: string;
      title: string;
      journal_type: string;
      daily_date: string | null;
      created_at: string;
      tags: string | null;
      mood: number | null;
    }>(
      `SELECT id, slug, title, journal_type, daily_date, created_at, tags, mood
       FROM journals
       WHERE userId = ? AND slug != ? AND published = 1
       ORDER BY created_at DESC`,
      [userId, currentSlug]
    );

    // Calculate match scores
    const journalsWithScores: RelatedJournal[] = await Promise.all(allJournals.map(async (journal) => {
      const journalTags = await parseJsonArray(journal.tags);
      const tagScore = await calculateArrayMatchScore(currentTags, journalTags);

      // Add mood similarity bonus if both have mood ratings
      let moodScore = 0;
      if (currentMood !== undefined && journal.mood !== null) {
        // Similar moods get higher scores (closer = better)
        const moodDiff = Math.abs(currentMood - journal.mood);
        moodScore = moodDiff <= 1 ? 2 : moodDiff <= 2 ? 1 : 0;
      }

      return {
        ...journal,
        matchScore: tagScore + moodScore,
      };
    }));

    // Filter items with at least 1 match and sort by score
    const relatedJournals = journalsWithScores
      .filter((journal) => journal.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    return relatedJournals;
  } catch (error) {
    console.error("Error fetching related journals:", error);
    return [];
  }
}

/**
 * Get related parks based on tags and category
 */
export async function getRelatedParks(
  currentSlug: string,
  currentTags: string[] = [],
  currentCategory?: string,
  limit: number = 6
): Promise<RelatedPark[]> {
  const userId = await getUserId();

  try {
    // Get all parks except the current one
    const allParks = await query<{
      id: number;
      slug: string;
      title: string;
      category: string;
      state: string | null;
      poster: string | null;
      tags: string | null;
    }>(
      `SELECT id, slug, title, category, state, poster, tags
       FROM parks
       WHERE userId = ? AND slug != ? AND published = 1
       ORDER BY updated_at DESC`,
      [userId, currentSlug]
    );

    // Calculate match scores
    const parksWithScores: RelatedPark[] = await Promise.all(allParks.map(async (park) => {
      const parkTags = await parseJsonArray(park.tags);
      const tagScore = await calculateArrayMatchScore(currentTags, parkTags);

      // Add category match bonus
      const categoryScore = currentCategory && park.category === currentCategory ? 2 : 0;

      return {
        ...park,
        matchScore: tagScore + categoryScore,
      };
    }));

    // Filter items with at least 1 match and sort by score
    const relatedParks = parksWithScores
      .filter((park) => park.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    return relatedParks;
  } catch (error) {
    console.error("Error fetching related parks:", error);
    return [];
  }
}
