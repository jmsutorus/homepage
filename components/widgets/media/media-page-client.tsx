"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MediaItem } from "@/lib/media";
import { MediaGrid } from "./media-grid";
import { MediaConsumptionTimeline } from "./media-consumption-timeline";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Search, Plus, ChevronDown, ChevronRight, X, BarChart3 } from "lucide-react";
import Link from "next/link";
import type { MediaTimelineData } from "@/lib/db/media";

interface MediaPageClientProps {
  allMedia: MediaItem[];
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

export function MediaPageClient({ allMedia, timelineData }: MediaPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "movie" | "tv" | "book" | "game">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPlanned, setShowPlanned] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);
  const [activeGenres, setActiveGenres] = useState<string[]>([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("completed-desc");
  const [genreSearch, setGenreSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");

  // Read genres and tags from URL parameters
  useEffect(() => {
    const genre = searchParams.get("genre");
    const tag = searchParams.get("tag");
    const genres = searchParams.get("genres");
    const tags = searchParams.get("tags");

    // Handle single genre/tag for backwards compatibility
    if (genre && !genres) {
      setActiveGenres([genre]);
    } else if (genres) {
      setActiveGenres(genres.split(","));
    }

    if (tag && !tags) {
      setActiveTags([tag]);
    } else if (tags) {
      setActiveTags(tags.split(","));
    }
  }, [searchParams]);

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

  // Sort media items
  const sortMedia = useCallback((items: MediaItem[]) => {
    const sorted = [...items];

    switch (sortBy) {
      case "title-asc":
        return sorted.sort((a, b) =>
          a.frontmatter.title.localeCompare(b.frontmatter.title)
        );
      case "title-desc":
        return sorted.sort((a, b) =>
          b.frontmatter.title.localeCompare(a.frontmatter.title)
        );
      case "rating-desc":
        return sorted.sort((a, b) => {
          const ratingA = a.frontmatter.rating || 0;
          const ratingB = b.frontmatter.rating || 0;
          return ratingB - ratingA;
        });
      case "rating-asc":
        return sorted.sort((a, b) => {
          const ratingA = a.frontmatter.rating || 0;
          const ratingB = b.frontmatter.rating || 0;
          return ratingA - ratingB;
        });
      case "completed-desc":
        return sorted.sort((a, b) => {
          const dateA = a.frontmatter.completed || "";
          const dateB = b.frontmatter.completed || "";
          return dateB.localeCompare(dateA);
        });
      case "completed-asc":
        return sorted.sort((a, b) => {
          const dateA = a.frontmatter.completed || "";
          const dateB = b.frontmatter.completed || "";
          return dateA.localeCompare(dateB);
        });
      case "started-desc":
        return sorted.sort((a, b) => {
          const dateA = a.frontmatter.started || "";
          const dateB = b.frontmatter.started || "";
          return dateB.localeCompare(dateA);
        });
      case "started-asc":
        return sorted.sort((a, b) => {
          const dateA = a.frontmatter.started || "";
          const dateB = b.frontmatter.started || "";
          return dateA.localeCompare(dateB);
        });
      default:
        return sorted;
    }
  }, [sortBy]);

  // Separate in-progress, planned, and completed media
  const { inProgressMedia, plannedMedia, completedMedia } = useMemo(() => {
    // First separate by completion status
    // In Progress: no completed date AND status is not "planned"
    const inProgress = allMedia.filter((item) => item.frontmatter.status === "in-progress");
    // Planned: status is "planned"
    const planned = allMedia.filter((item) => item.frontmatter.status === "planned");
    // Completed: has completed date
    const completed = allMedia.filter((item) => item.frontmatter.completed && item.frontmatter.status === "completed");

    // Sort in-progress by started date (most recent first)
    const sortedInProgress = [...inProgress].sort((a, b) => {
      const dateA = a.frontmatter.started || "";
      const dateB = b.frontmatter.started || "";
      return dateB.localeCompare(dateA);
    });

    // Sort planned by title alphabetically
    const sortedPlanned = [...planned].sort((a, b) => {
      return a.frontmatter.title.localeCompare(b.frontmatter.title);
    });

    return {
      inProgressMedia: sortedInProgress,
      plannedMedia: sortedPlanned,
      completedMedia: completed,
    };
  }, [allMedia]);

  // Filter and search media (only apply to completed media)
  const filteredMedia = useMemo(() => {
    let filtered = completedMedia;

    // Filter by type
    if (activeTab !== "all") {
      filtered = filtered.filter((item) => item.frontmatter.type === activeTab);
    }

    // Filter by genres (match ANY of the selected genres)
    if (activeGenres.length > 0) {
      filtered = filtered.filter((item) =>
        item.frontmatter.genres?.some((genre) => activeGenres.includes(genre))
      );
    }

    // Filter by tags (match ANY of the selected tags)
    if (activeTags.length > 0) {
      filtered = filtered.filter((item) =>
        item.frontmatter.tags?.some((tag) => activeTags.includes(tag))
      );
    }

    // Search by title
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.frontmatter.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return sortMedia(filtered);
  }, [completedMedia, activeTab, searchQuery, activeGenres, activeTags, sortMedia]);

  // Filter in-progress media by type and search
  const filteredInProgress = useMemo(() => {
    let filtered = inProgressMedia;

    // Filter by type
    if (activeTab !== "all") {
      filtered = filtered.filter((item) => item.frontmatter.type === activeTab);
    }

    // Filter by genres (match ANY of the selected genres)
    if (activeGenres.length > 0) {
      filtered = filtered.filter((item) =>
        item.frontmatter.genres?.some((genre) => activeGenres.includes(genre))
      );
    }

    // Filter by tags (match ANY of the selected tags)
    if (activeTags.length > 0) {
      filtered = filtered.filter((item) =>
        item.frontmatter.tags?.some((tag) => activeTags.includes(tag))
      );
    }

    // Search by title
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.frontmatter.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return sortMedia(filtered);
  }, [inProgressMedia, activeTab, searchQuery, activeGenres, activeTags, sortMedia]);

  // Filter planned media by type and search
  const filteredPlanned = useMemo(() => {
    let filtered = plannedMedia;

    // Filter by type
    if (activeTab !== "all") {
      filtered = filtered.filter((item) => item.frontmatter.type === activeTab);
    }

    // Filter by genres (match ANY of the selected genres)
    if (activeGenres.length > 0) {
      filtered = filtered.filter((item) =>
        item.frontmatter.genres?.some((genre) => activeGenres.includes(genre))
      );
    }

    // Filter by tags (match ANY of the selected tags)
    if (activeTags.length > 0) {
      filtered = filtered.filter((item) =>
        item.frontmatter.tags?.some((tag) => activeTags.includes(tag))
      );
    }

    // Search by title
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.frontmatter.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return sortMedia(filtered);
  }, [plannedMedia, activeTab, searchQuery, activeGenres, activeTags, sortMedia]);

  const stats = {
    all: allMedia.length,
    movie: allMedia.filter((item) => item.frontmatter.type === "movie").length,
    tv: allMedia.filter((item) => item.frontmatter.type === "tv").length,
    book: allMedia.filter((item) => item.frontmatter.type === "book").length,
    game: allMedia.filter((item) => item.frontmatter.type === "game").length,
  };

  // Toggle genre selection
  const toggleGenre = (genre: string) => {
    const newGenres = activeGenres.includes(genre)
      ? activeGenres.filter((g) => g !== genre)
      : [...activeGenres, genre];
    setActiveGenres(newGenres);
    updateURL({ genres: newGenres });
  };

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    const newTags = activeTags.includes(tag)
      ? activeTags.filter((t) => t !== tag)
      : [...activeTags, tag];
    setActiveTags(newTags);
    updateURL({ tags: newTags });
  };

  // Clear all genre filters
  const clearGenreFilter = () => {
    setActiveGenres([]);
    updateURL({ genres: [] });
  };

  // Clear all tag filters
  const clearTagFilter = () => {
    setActiveTags([]);
    updateURL({ tags: [] });
  };

  // Update URL with current filters
  const updateURL = ({ genres, tags }: { genres?: string[]; tags?: string[] }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (genres !== undefined) {
      params.delete("genre");
      params.delete("genres");
      if (genres.length > 0) {
        params.set("genres", genres.join(","));
      }
    }

    if (tags !== undefined) {
      params.delete("tag");
      params.delete("tags");
      if (tags.length > 0) {
        params.set("tags", tags.join(","));
      }
    }

    router.push(`/media${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground">
            Track movies, TV shows, books, and video games you&apos;re watching/reading/playing
          </p>
        </div>
        <Button asChild>
          <Link href="/media/new">
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All ({stats.all})</TabsTrigger>
            <TabsTrigger value="movie">Movies ({stats.movie})</TabsTrigger>
            <TabsTrigger value="tv">TV ({stats.tv})</TabsTrigger>
            <TabsTrigger value="book">Books ({stats.book})</TabsTrigger>
            <TabsTrigger value="game">Games ({stats.game})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="completed-desc">Completed (Newest)</SelectItem>
            <SelectItem value="completed-asc">Completed (Oldest)</SelectItem>
            <SelectItem value="started-desc">Started (Newest)</SelectItem>
            <SelectItem value="started-asc">Started (Oldest)</SelectItem>
            <SelectItem value="title-asc">Title (A-Z)</SelectItem>
            <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            <SelectItem value="rating-desc">Rating (High to Low)</SelectItem>
            <SelectItem value="rating-asc">Rating (Low to High)</SelectItem>
          </SelectContent>
        </Select>

        {/* Genre Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-[180px] justify-between">
              <span className="truncate">
                {activeGenres.length > 0
                  ? `${activeGenres.length} Genre${activeGenres.length > 1 ? "s" : ""}`
                  : "Filter by Genre"}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <div className="p-2">
              <Input
                placeholder="Search genres..."
                value={genreSearch}
                onChange={(e) => setGenreSearch(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {allGenres
                .filter((genre) =>
                  genre.toLowerCase().includes(genreSearch.toLowerCase())
                )
                .map((genre) => (
                  <div
                    key={genre}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent cursor-pointer"
                    onClick={() => toggleGenre(genre)}
                  >
                    <Checkbox
                      checked={activeGenres.includes(genre)}
                      className="pointer-events-none"
                    />
                    <span className="text-sm">{genre}</span>
                  </div>
                ))}
              {allGenres.filter((genre) =>
                genre.toLowerCase().includes(genreSearch.toLowerCase())
              ).length === 0 && (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No genres found
                </div>
              )}
            </div>
            {activeGenres.length > 0 && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-8"
                  onClick={clearGenreFilter}
                >
                  Clear All
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Tag Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-[180px] justify-between">
              <span className="truncate">
                {activeTags.length > 0
                  ? `${activeTags.length} Tag${activeTags.length > 1 ? "s" : ""}`
                  : "Filter by Tag"}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <div className="p-2">
              <Input
                placeholder="Search tags..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {allTags
                .filter((tag) =>
                  tag.toLowerCase().includes(tagSearch.toLowerCase())
                )
                .map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    <Checkbox
                      checked={activeTags.includes(tag)}
                      className="pointer-events-none"
                    />
                    <span className="text-sm">{tag}</span>
                  </div>
                ))}
              {allTags.filter((tag) =>
                tag.toLowerCase().includes(tagSearch.toLowerCase())
              ).length === 0 && (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No tags found
                </div>
              )}
            </div>
            {activeTags.length > 0 && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-8"
                  onClick={clearTagFilter}
                >
                  Clear All
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters */}
      {(activeGenres.length > 0 || activeTags.length > 0) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeGenres.map((genre) => (
            <Badge key={genre} variant="secondary" className="gap-1">
              {genre}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => toggleGenre(genre)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {activeTags.map((tag) => (
            <Badge key={tag} variant="outline" className="gap-1">
              {tag}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => toggleTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {(activeGenres.length > 0 || activeTags.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => {
                clearGenreFilter();
                clearTagFilter();
              }}
            >
              Clear All
            </Button>
          )}
        </div>
      )}

      {/* Media Consumption Timeline */}
      {timelineData && (
        <div className="space-y-4">
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="cursor-pointer flex items-center gap-2 w-full text-left group"
          >
            {showTimeline ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold group-hover:text-foreground/80 transition-colors">
                Consumption Timeline
              </h2>
            </div>
          </button>
          {showTimeline && (
            <MediaConsumptionTimeline initialData={timelineData} />
          )}
        </div>
      )}

      {/* In Progress Section */}
      {filteredInProgress.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">In Progress</h2>
            <p className="text-sm text-muted-foreground">
              Currently watching, reading, or playing ({filteredInProgress.length})
            </p>
          </div>
          <MediaGrid
            items={filteredInProgress}
            emptyMessage=""
          />
        </div>
      )}

      {/* Planned Section (Collapsible) */}
      {filteredPlanned.length > 0 && (
        <div className="space-y-4">
          <button
            onClick={() => setShowPlanned(!showPlanned)}
            className="cursor-pointer flex items-center gap-2 w-full text-left group"
          >
            {showPlanned ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold tracking-tight group-hover:text-foreground/80 transition-colors">
                Planned
              </h2>
              <p className="text-sm text-muted-foreground">
                Planning to watch, read, or play ({filteredPlanned.length})
              </p>
            </div>
          </button>
          {showPlanned && (
            <MediaGrid
              items={filteredPlanned}
              emptyMessage=""
            />
          )}
        </div>
      )}

      {/* Completed Media Grid */}
      {filteredMedia.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Completed</h2>
            <p className="text-sm text-muted-foreground">
              Finished watching, reading, or playing ({filteredMedia.length})
            </p>
          </div>
          <MediaGrid
            items={filteredMedia}
            emptyMessage={
              searchQuery
                ? `No results found for "${searchQuery}"`
                : `No ${activeTab === "all" ? "media" : activeTab === "game" ? "games" : `${activeTab}s`} found`
            }
          />
        </div>
      )}

      {/* Empty state when no media at all */}
      {filteredInProgress.length === 0 && filteredPlanned.length === 0 && filteredMedia.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery
            ? `No results found for "${searchQuery}"`
            : `No ${activeTab === "all" ? "media" : activeTab === "game" ? "games" : `${activeTab}s`} found`}
        </div>
      )}
    </div>
  );
}
