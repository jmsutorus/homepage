"use client";

import { useState, useMemo } from "react";
import { MediaItem } from "@/lib/media";
import { MediaGrid } from "@/components/widgets/media-grid";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import Link from "next/link";

interface MediaPageClientProps {
  allMedia: MediaItem[];
}

export function MediaPageClient({ allMedia }: MediaPageClientProps) {
  const [activeTab, setActiveTab] = useState<"all" | "movie" | "tv" | "book">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and search media
  const filteredMedia = useMemo(() => {
    let filtered = allMedia;

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
  }, [allMedia, activeTab, searchQuery]);

  const stats = {
    all: allMedia.length,
    movie: allMedia.filter((item) => item.frontmatter.type === "movie").length,
    tv: allMedia.filter((item) => item.frontmatter.type === "tv").length,
    book: allMedia.filter((item) => item.frontmatter.type === "book").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground">
            Track movies, TV shows, and books you're watching/reading
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

      {/* Media Grid */}
      <MediaGrid
        items={filteredMedia}
        emptyMessage={
          searchQuery
            ? `No results found for "${searchQuery}"`
            : `No ${activeTab === "all" ? "media" : `${activeTab}s`} found`
        }
      />
    </div>
  );
}
