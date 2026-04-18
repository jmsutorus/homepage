"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MediaItem } from "@/lib/media";
import { PaginatedMediaGrid } from "./paginated-media-grid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, X } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { MediaTimelineData, PaginatedMediaResult, MediaContent } from "@/lib/db/media";
import { cn } from "@/lib/utils";

import { MediaHero } from "./media-hero";
import { MediaActiveJourneys } from "./media-active-journeys";
import { MediaCuratedBento } from "./media-curated-bento";

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
      timeSpent: dbMedia.time_spent,
    },
    // Content might be undefined if not selected for performance
    content: dbMedia.content ?? "",
  };
}

interface MediaPageClientProps {
  allMedia: MediaItem[];
  initialCompletedMedia: PaginatedMediaResult;
  timelineData?: MediaTimelineData;
}

type SortOption =
  | "title-asc"
  | "title-desc"
  | "rating-desc"
  | "rating-asc"
  | "completed-desc"
  | "completed-asc"
  | "started-desc"
  | "started-asc";


export function MediaPageClient({
  allMedia,
  initialCompletedMedia,
  timelineData,
}: MediaPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "movie" | "tv" | "book" | "game" | "album">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("completed-desc");
  const [genreSearch, setGenreSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  
  // Read genres and tags directly from URL parameters on initialization
  const [activeGenres, setActiveGenres] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const genres = searchParams.get("genres");
    if (genres) return genres.split(",");
    return [];
  });

  const [activeTags, setActiveTags] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const tags = searchParams.get("tags");
    if (tags) return tags.split(",");
    return [];
  });
  
  // Detect mobile screen for responsive UI
  const isMobile = useMediaQuery("(max-width: 639px)");

  // Extract all unique genres and tags
  const allGenres = useMemo(() => {
    const genreSet = new Set<string>();
    allMedia.forEach((item) => {
      item.frontmatter.genres?.forEach((genre) => genreSet.add(genre));
    });
    return Array.from(genreSet).sort();
  }, [allMedia]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    allMedia.forEach((item) => {
      item.frontmatter.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [allMedia]);

  // Extract in-progress media for the "Active Journeys" section
  const inProgressMedia = useMemo(() => {
    return allMedia.filter((item) => item.frontmatter.status === "in-progress")
      .sort((a, b) => (b.frontmatter.started || "").localeCompare(a.frontmatter.started || ""))
      .slice(0, 5); // Show top 5 for the homepage
  }, [allMedia]);

  // Latest featured item for Hero
  const featuredItem = useMemo(() => {
    return allMedia.find(m => m.frontmatter.featured) || allMedia[0];
  }, [allMedia]);

  // Convert initial completed media to MediaItem format
  const initialCompletedItems = useMemo(
    () => initialCompletedMedia.items.map(dbToMediaItem),
    [initialCompletedMedia]
  );

  // Build filters for paginated completed media
  const completedFilters = useMemo(() => {
    const filters: any = {
      status: "completed",
      sortBy,
    };
    if (activeTab !== "all") filters.type = activeTab;
    if (searchQuery) filters.search = searchQuery;
    if (activeGenres.length > 0) filters.genres = activeGenres;
    if (activeTags.length > 0) filters.tags = activeTags;
    return filters;
  }, [activeTab, searchQuery, activeGenres, activeTags, sortBy]);

  // Toggle genre selection
  const toggleGenre = (genre: string) => {
    const newGenres = activeGenres.includes(genre)
      ? activeGenres.filter((g) => g !== genre)
      : [...activeGenres, genre];
    setActiveGenres(newGenres);
  };

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    const newTags = activeTags.includes(tag)
      ? activeTags.filter((t) => t !== tag)
      : [...activeTags, tag];
    setActiveTags(newTags);
  };

  return (
    <div className="flex bg-media-surfacedark:bg-media-primary min-h-screen font-lexend -mx-4 -my-8 sm:-mx-6 md:-mx-8">
      <main className="flex-1 min-h-screen pb-24 transition-all duration-300">
        {/* Top Content (Hero + Filters) */}
        <div className="w-full max-w-[1440px] mx-auto pt-8">
          
          {/* Hero Section */}
          {featuredItem && <MediaHero item={featuredItem} />}

          <div className="px-8 mt-12 pb-24">
            {/* Active Journeys (In Progress) */}
            <MediaActiveJourneys items={inProgressMedia} />

            {/* Curated Bento Grid */}
            <MediaCuratedBento />

            {/* Sub-Navigation & Search (Integrated into page per feedback) */}
            <div className="mb-12">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white/40 dark:bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-media-outline-variant/10 shadow-sm">
                <div className="flex-1 max-w-2xl relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-media-outline transition-colors group-hover:text-media-secondary">search</span>
                  <input 
                    className="w-full pl-12 pr-6 py-4 bg-media-surface-container-low rounded-2xl border-none focus:ring-2 focus:ring-media-secondary/20 transition-all text-sm placeholder:text-media-on-surface-variant/50 shadow-inner" 
                    placeholder="Search your media library..." 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <nav className="flex items-center gap-1 sm:gap-4 md:gap-8 text-xs sm:text-sm uppercase tracking-widest font-black">
                  {(["all", "movie", "tv", "book", "game"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "pb-2 transition-all duration-300 relative border-none bg-transparent cursor-pointer",
                        activeTab === tab 
                          ? "text-media-secondary" 
                          : "text-media-on-surface-variant dark:text-media-surface-variant/60 hover:text-media-secondary opacity-70 hover:opacity-100"
                      )}
                    >
                      {tab === "all" ? "LIBRARY" : tab === "movie" ? "MOVIES" : tab === "tv" ? "TV" : tab === "book" ? "BOOKS" : "GAMES"}
                      {activeTab === tab && (
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-media-secondary rounded-full"></span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* In-Page Stats Summary (Optional flair) */}
              <div className="flex items-center gap-4 mt-8 flex-wrap">
                <div className="flex items-center gap-2 px-6 py-3 bg-media-primary text-media-on-primary rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-lg">
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Filters</span>
                </div>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-6 py-3 bg-media-tertiary-fixed text-media-on-tertiary-fixed rounded-full text-[10px] font-black tracking-[0.1em] uppercase hover:bg-media-tertiary-fixed-dim transition-all shadow-sm border-none cursor-pointer">
                      GENRES ({activeGenres.length})
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[240px] p-4 rounded-2xl bg-white dark:bg-media-primary border-media-outline-variant/20 shadow-2xl">
                    <div className="space-y-4 font-lexend">
                      <h4 className="font-black text-sm uppercase tracking-widest text-media-primary">Genre Selection</h4>
                      <div className="max-h-[300px] overflow-y-auto pr-2 space-y-1">
                        {allGenres.map((genre) => (
                          <div 
                            key={genre} 
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-media-surface-variant/20 cursor-pointer"
                            onClick={() => toggleGenre(genre)}
                          >
                            <Checkbox checked={activeGenres.includes(genre)} className="border-media-outline" />
                            <span className="text-sm font-medium">{genre}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-6 py-3 bg-media-secondary-fixed text-media-on-secondary-fixed rounded-full text-[10px] font-black tracking-[0.1em] uppercase hover:bg-media-secondary-fixed-dim transition-all shadow-sm border-none cursor-pointer">
                      TAGS ({activeTags.length})
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[240px] p-4 rounded-2xl bg-white dark:bg-media-primary border-media-outline-variant/20 shadow-2xl">
                    <div className="space-y-4 font-lexend">
                      <h4 className="font-black text-sm uppercase tracking-widest text-media-primary">Tag Selection</h4>
                      <div className="max-h-[300px] overflow-y-auto pr-2 space-y-1">
                        {allTags.map((tag) => (
                          <div 
                            key={tag} 
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-media-surface-variant/20 cursor-pointer"
                            onClick={() => toggleTag(tag)}
                          >
                            <Checkbox checked={activeTags.includes(tag)} className="border-media-outline" />
                            <span className="text-sm font-medium">{tag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-[180px] bg-media-surface-container-high border-none rounded-full h-10 text-[10px] font-black tracking-widest uppercase px-6">
                    <SelectValue placeholder="SORT BY" />
                  </SelectTrigger>
                  <SelectContent className="font-lexend">
                    <SelectItem value="completed-desc">Completed (Newest)</SelectItem>
                    <SelectItem value="completed-asc">Completed (Oldest)</SelectItem>
                    <SelectItem value="started-desc">Started (Newest)</SelectItem>
                    <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                    <SelectItem value="rating-desc">Rating (High to Low)</SelectItem>
                  </SelectContent>
                </Select>

                {/* Active Pills */}
                <div className="flex items-center gap-2 flex-wrap">
                  {activeGenres.map(g => (
                    <Badge key={g} className="bg-media-secondary/10 text-media-secondary border-media-secondary/20 px-4 py-2 rounded-full flex items-center gap-2 font-black text-[10px] tracking-widest uppercase shadow-sm hover:bg-media-secondary/20 transition-colors">
                      {g}
                      <X className="h-3 w-3 cursor-pointer hover:scale-120 transition-transform" onClick={() => toggleGenre(g)} />
                    </Badge>
                  ))}
                  {activeTags.map(t => (
                    <Badge key={t} className="bg-media-primary/10 text-media-primary border-media-primary/20 px-4 py-2 rounded-full flex items-center gap-2 font-black text-[10px] tracking-widest uppercase shadow-sm hover:bg-media-primary/20 transition-colors">
                      {t}
                      <X className="h-3 w-3 cursor-pointer hover:scale-120 transition-transform" onClick={() => toggleTag(t)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Completed Media Section */}
            <section className="mt-24">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-media-primary dark:text-media-surface mb-2">My Library</h2>
                  <p className="text-media-on-surface-variant font-medium">
                    Everything you've finished, organized and rated.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-media-on-surface-variant">Displaying</span>
                  <Badge variant="outline" className="rounded-full px-4 border-media-secondary/30 text-media-secondary font-black">
                    {initialCompletedMedia.total} ITEMS
                  </Badge>
                </div>
              </div>

              <PaginatedMediaGrid
                initialItems={initialCompletedItems}
                filters={completedFilters}
                emptyMessage={
                  searchQuery
                    ? `No results found for "${searchQuery}"`
                    : "No completed media found"
                }
              />
            </section>
          </div>
        </div>
      </main>

      {/* Mobile Nav Overlay (Prototype style) */}
      <nav className="fixed bottom-0 left-0 w-full bg-media-surface-container-lowest flex md:hidden items-center justify-around py-4 z-50 border-t border-media-outline-variant/20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {(["subscriptions", "category", "queue_music", "history"] as const).map((icon) => (
          <button key={icon} className="flex flex-col items-center gap-1 text-media-on-surface-variant transition-all hover:text-media-secondary border-none bg-transparent">
            <span className="material-symbols-outlined text-2xl">{icon}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
