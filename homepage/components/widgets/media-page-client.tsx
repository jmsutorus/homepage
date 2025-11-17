"use client";

import { useState, useMemo } from "react";
import { MediaItem } from "@/lib/media";
import { MediaGrid } from "@/components/widgets/media-grid";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";

interface MediaPageClientProps {
  allMedia: MediaItem[];
}

export function MediaPageClient({ allMedia }: MediaPageClientProps) {
  const [activeTab, setActiveTab] = useState<"all" | "movie" | "tv" | "book" | "game">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPlanned, setShowPlanned] = useState(false);

  // Separate in-progress, planned, and completed media
  const { inProgressMedia, plannedMedia, completedMedia } = useMemo(() => {
    // First separate by completion status
    // In Progress: no completed date AND status is not "planned"
    const inProgress = allMedia.filter((item) => !item.frontmatter.completed && item.frontmatter.status !== "planned");
    // Planned: status is "planned"
    const planned = allMedia.filter((item) => item.frontmatter.status === "planned");
    // Completed: has completed date
    const completed = allMedia.filter((item) => item.frontmatter.completed);

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

    // Search by title
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.frontmatter.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [completedMedia, activeTab, searchQuery]);

  // Filter in-progress media by type and search
  const filteredInProgress = useMemo(() => {
    let filtered = inProgressMedia;

    // Filter by type
    if (activeTab !== "all") {
      filtered = filtered.filter((item) => item.frontmatter.type === activeTab);
    }

    // Search by title
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.frontmatter.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [inProgressMedia, activeTab, searchQuery]);

  // Filter planned media by type and search
  const filteredPlanned = useMemo(() => {
    let filtered = plannedMedia;

    // Filter by type
    if (activeTab !== "all") {
      filtered = filtered.filter((item) => item.frontmatter.type === activeTab);
    }

    // Search by title
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.frontmatter.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [plannedMedia, activeTab, searchQuery]);

  const stats = {
    all: allMedia.length,
    movie: allMedia.filter((item) => item.frontmatter.type === "movie").length,
    tv: allMedia.filter((item) => item.frontmatter.type === "tv").length,
    book: allMedia.filter((item) => item.frontmatter.type === "book").length,
    game: allMedia.filter((item) => item.frontmatter.type === "game").length,
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
      </div>

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
