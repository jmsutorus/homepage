"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Hash, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function MediaTagsGenresManager() {
  const [tags, setTags] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagSearch, setTagSearch] = useState("");
  const [genreSearch, setGenreSearch] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ type: "tag" | "genre"; name: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tagsRes, genresRes] = await Promise.all([
        fetch("/api/media/tags"),
        fetch("/api/media/genres"),
      ]);

      const tagsData = await tagsRes.json();
      const genresData = await genresRes.json();

      setTags(tagsData.tags || []);
      setGenres(genresData.genres || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load tags and genres");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (type: "tag" | "genre", name: string) => {
    setDeleteItem({ type, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;

    const { type, name } = deleteItem;
    const endpoint = type === "tag" ? "tags" : "genres";

    try {
      const response = await fetch(`/api/media/${endpoint}/${encodeURIComponent(name)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success(`${type === "tag" ? "Tag" : "Genre"} deleted successfully`);
        if (type === "tag") {
          setTags(tags.filter((t) => t !== name));
        } else {
          setGenres(genres.filter((g) => g !== name));
        }
      } else {
        toast.error(`Failed to delete ${type}`);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(`Failed to delete ${type}`);
    } finally {
      setDeleteDialogOpen(false);
      setDeleteItem(null);
    }
  };

  if (loading) return <div className="h-40 animate-pulse bg-media-surface/50 rounded-lg" />;

  const filteredTags = tags.filter((tag) =>
    tag.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const filteredGenres = genres.filter((genre) =>
    genre.toLowerCase().includes(genreSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Tags Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-widest text-media-primary/70">
            Tags ({tags.length})
          </label>
          <div className="relative w-40">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-media-on-surface-variant" />
            <input
              className="w-full bg-media-surface border border-media-outline-variant/40 rounded-md pl-7 pr-2 py-1 text-xs focus:ring-1 focus:ring-media-primary outline-none"
              placeholder="Search tags..."
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {filteredTags.map((tag) => (
            <div 
              key={tag}
              className="group flex items-center gap-2 bg-media-surface px-3 py-1.5 rounded-lg border border-media-outline-variant/40 hover:border-media-primary transition-all cursor-default"
            >
              <Hash className="h-3 w-3 text-media-primary opacity-70" />
              <span className="text-sm font-medium">{tag}</span>
              <button 
                onClick={() => handleDeleteClick("tag", tag)}
                className="opacity-0 group-hover:opacity-100 hover:text-media-error transition-all"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {filteredTags.length === 0 && tagSearch && (
            <p className="text-xs text-media-on-surface-variant italic">No tags matching &quot;{tagSearch}&quot;</p>
          )}
        </div>
      </div>

      {/* Genres Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-widest text-media-primary/70">
            Genres ({genres.length})
          </label>
          <div className="relative w-40">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-media-on-surface-variant" />
            <input
              className="w-full bg-media-surface border border-media-outline-variant/40 rounded-md pl-7 pr-2 py-1 text-xs focus:ring-1 focus:ring-media-primary outline-none"
              placeholder="Search genres..."
              value={genreSearch}
              onChange={(e) => setGenreSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {filteredGenres.map((genre) => (
            <div 
              key={genre}
              className="group flex items-center gap-2 bg-media-surface px-3 py-1.5 rounded-lg border border-media-outline-variant/40 hover:border-media-primary transition-all cursor-default"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-media-primary opacity-70" />
              <span className="text-sm font-medium">{genre}</span>
              <button 
                onClick={() => handleDeleteClick("genre", genre)}
                className="opacity-0 group-hover:opacity-100 hover:text-media-error transition-all"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {filteredGenres.length === 0 && genreSearch && (
            <p className="text-xs text-media-on-surface-variant italic">No genres matching &quot;{genreSearch}&quot;</p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-media-surface border-media-outline-variant/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-media-on-surface">
              Delete {deleteItem?.type === "tag" ? "Tag" : "Genre"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-media-on-surface-variant">
              Are you sure you want to delete &quot;{deleteItem?.name}&quot;? This will remove it from all media items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-media-outline-variant/40 text-media-on-surface hover:bg-media-surface-variant">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-media-error text-white hover:bg-media-error/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

