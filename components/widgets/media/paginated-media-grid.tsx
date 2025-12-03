"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MediaItem } from "@/lib/media";
import { MediaCard } from "./media-card";
import { MediaGridSkeleton } from "./media-card-skeleton";
import type { MediaContent } from "@/lib/db/media";

type SortOption =
  | "title-asc"
  | "title-desc"
  | "rating-desc"
  | "rating-asc"
  | "completed-desc"
  | "completed-asc"
  | "started-desc"
  | "started-asc"
  | "created-desc";

interface PaginatedMediaGridProps {
  initialItems: MediaItem[];
  filters?: {
    type?: "movie" | "tv" | "book" | "game";
    status?: "in-progress" | "completed" | "planned";
    search?: string;
    genres?: string[];
    tags?: string[];
    sortBy?: SortOption;
  };
  emptyMessage?: string;
}

// Convert MediaContent to MediaItem
function dbToMediaItem(dbMedia: MediaContent): MediaItem {
  return {
    slug: dbMedia.slug,
    frontmatter: {
      title: dbMedia.title,
      type: dbMedia.type,
      status: dbMedia.status,
      rating: dbMedia.rating ?? undefined,
      started: dbMedia.started ?? undefined,
      completed: dbMedia.completed ?? undefined,
      released: dbMedia.released ?? undefined,
      genres: dbMedia.genres ? JSON.parse(dbMedia.genres) : undefined,
      poster: dbMedia.poster ?? undefined,
      tags: dbMedia.tags ? JSON.parse(dbMedia.tags) : undefined,
      description: dbMedia.description ?? undefined,
      length: dbMedia.length ?? undefined,
      featured: dbMedia.featured === 1,
      published: dbMedia.published === 1,
    },
    content: dbMedia.content,
  };
}

export function PaginatedMediaGrid({
  initialItems,
  filters,
  emptyMessage = "No media items found",
}: PaginatedMediaGridProps) {
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const prefetchedPageRef = useRef<number | null>(null);
  const prefetchedDataRef = useRef<MediaItem[] | null>(null);

  // Reset when filters change
  useEffect(() => {
    setItems(initialItems);
    setPage(1);
    setHasMore(initialItems.length >= 25); // Changed from === to >= to be safer
    setError(null); // Clear any previous errors
    prefetchedPageRef.current = null;
    prefetchedDataRef.current = null;
  }, [initialItems, filters]);

  // Fetch a specific page
  const fetchPage = useCallback(
    async (pageNum: number, isPrefetch = false) => {
      try {
        const params = new URLSearchParams({
          paginate: "true",
          page: pageNum.toString(),
          pageSize: "25",
        });

        if (filters?.type) params.set("type", filters.type);
        if (filters?.status) params.set("status", filters.status);
        if (filters?.search) params.set("search", filters.search);
        if (filters?.genres && filters.genres.length > 0)
          params.set("genres", filters.genres.join(","));
        if (filters?.tags && filters.tags.length > 0)
          params.set("tags", filters.tags.join(","));
        if (filters?.sortBy) params.set("sortBy", filters.sortBy);

        console.log("Fetching media with params:", params.toString());
        const response = await fetch(`/api/media?${params.toString()}`);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", response.status, errorText);
          throw new Error(`Failed to fetch media: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const newItems = data.items.map(dbToMediaItem);

        if (isPrefetch) {
          // Store prefetched data
          prefetchedPageRef.current = pageNum;
          prefetchedDataRef.current = newItems;
          setHasMore(data.hasMore);
        } else {
          return { items: newItems, hasMore: data.hasMore };
        }
      } catch (error) {
        console.error("Error fetching media:", error);
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        if (!isPrefetch) {
          setError(errorMsg);
          return { items: [], hasMore: false };
        }
      }
    },
    [filters]
  );

  // Load next page
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;

    // Check if we have prefetched data for this page
    const prefetchedData = prefetchedDataRef.current;
    if (prefetchedPageRef.current === nextPage && prefetchedData && prefetchedData.length > 0) {
      setItems((prev) => [...prev, ...prefetchedData]);
      setHasMore(hasMore);
      setPage(nextPage);
      prefetchedPageRef.current = null;
      prefetchedDataRef.current = null;

      // Start prefetching the next page
      if (hasMore) {
        await fetchPage(nextPage + 1, true);
      }
    } else {
      // Fetch normally
      const result = await fetchPage(nextPage);
      if (result) {
        setItems((prev) => [...prev, ...result.items]);
        setHasMore(result.hasMore);
        setPage(nextPage);

        // Start prefetching the next page
        if (result.hasMore) {
          await fetchPage(nextPage + 1, true);
        }
      }
    }

    setIsLoading(false);
  }, [isLoading, hasMore, page, fetchPage]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" } // Trigger 200px before reaching the sentinel
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore, hasMore, isLoading]);

  // Prefetch first next page on mount
  useEffect(() => {
    if (hasMore && !prefetchedPageRef.current && initialItems.length > 0) {
      fetchPage(2, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Show error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-8 text-center">
        <p className="text-red-600 dark:text-red-400 font-semibold mb-2">Error loading media</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (items.length === 0 && !isLoading) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => (
          <MediaCard key={`${item.frontmatter.type}-${item.slug}`} item={item} />
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="mt-6">
          <MediaGridSkeleton count={25} />
        </div>
      )}

      {/* Sentinel element for intersection observer */}
      {hasMore && <div ref={observerTarget} className="h-10" />}

      {/* End message */}
      {!hasMore && items.length > 0 && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          You&apos;ve reached the end of your media library
        </div>
      )}
    </div>
  );
}
