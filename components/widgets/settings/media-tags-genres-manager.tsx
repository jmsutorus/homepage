"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { ChevronDown, Search } from "lucide-react";

export function MediaTagsGenresManager() {
  const [tags, setTags] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [tagSearch, setTagSearch] = useState("");
  const [genreSearch, setGenreSearch] = useState("");
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [genrePopoverOpen, setGenrePopoverOpen] = useState(false);

  const [renameTagValue, setRenameTagValue] = useState("");
  const [renameGenreValue, setRenameGenreValue] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ type: "tag" | "genre"; name: string } | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
      showMessage("error", "Failed to load tags and genres");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleRenameTag = async () => {
    if (!selectedTag || !renameTagValue || renameTagValue === selectedTag) {
      return;
    }

    try {
      const response = await fetch(`/api/media/tags/${encodeURIComponent(selectedTag)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newName: renameTagValue }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage("success", data.message);
        setTags(tags.map((t) => (t === selectedTag ? renameTagValue : t)).sort());
        setSelectedTag(renameTagValue);
        setRenameTagValue("");
      } else {
        showMessage("error", data.error || "Failed to rename tag");
      }
    } catch (error) {
      console.error("Error renaming tag:", error);
      showMessage("error", "Failed to rename tag");
    }
  };

  const handleRenameGenre = async () => {
    if (!selectedGenre || !renameGenreValue || renameGenreValue === selectedGenre) {
      return;
    }

    try {
      const response = await fetch(`/api/media/genres/${encodeURIComponent(selectedGenre)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newName: renameGenreValue }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage("success", data.message);
        setGenres(genres.map((g) => (g === selectedGenre ? renameGenreValue : g)).sort());
        setSelectedGenre(renameGenreValue);
        setRenameGenreValue("");
      } else {
        showMessage("error", data.error || "Failed to rename genre");
      }
    } catch (error) {
      console.error("Error renaming genre:", error);
      showMessage("error", "Failed to rename genre");
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

      const data = await response.json();

      if (response.ok) {
        showMessage("success", data.message);
        if (type === "tag") {
          setTags(tags.filter((t) => t !== name));
        } else {
          setGenres(genres.filter((g) => g !== name));
        }
      } else {
        showMessage("error", data.error || `Failed to delete ${type}`);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      showMessage("error", `Failed to delete ${type}`);
    } finally {
      setDeleteDialogOpen(false);
      setDeleteItem(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Media Tags & Genres</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const filteredTags = tags.filter((tag) =>
    tag.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const filteredGenres = genres.filter((genre) =>
    genre.toLowerCase().includes(genreSearch.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Media Tags & Genres</CardTitle>
          <CardDescription>
            Manage tags and genres across all your media items. Renaming or deleting will update all related media.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Success/Error Message */}
          {message && (
            <div className={`p-3 rounded-lg ${message.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
              {message.text}
            </div>
          )}

          {/* Tags Section */}
          <div className="space-y-3">
            <Label>Manage Tags ({tags.length} total)</Label>
            <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedTag || "Select a tag..."}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tags..."
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto p-2">
                  {filteredTags.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-2">No tags found</p>
                  ) : (
                    filteredTags.map((tag) => (
                      <Button
                        key={tag}
                        variant={selectedTag === tag ? "secondary" : "ghost"}
                        className="w-full justify-start mb-1"
                        onClick={() => {
                          setSelectedTag(tag);
                          setRenameTagValue(tag);
                          setTagPopoverOpen(false);
                          setTagSearch("");
                        }}
                      >
                        {tag}
                      </Button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Rename/Delete for selected tag */}
            {selectedTag && (
              <div className="space-y-3 pt-2 border-t">
                <div className="space-y-2">
                  <Label htmlFor="rename-tag">Rename Tag</Label>
                  <div className="flex gap-2">
                    <Input
                      id="rename-tag"
                      value={renameTagValue}
                      onChange={(e) => setRenameTagValue(e.target.value)}
                      placeholder="New tag name"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameTag();
                      }}
                    />
                    <Button
                      onClick={handleRenameTag}
                      disabled={!renameTagValue || renameTagValue === selectedTag}
                    >
                      Rename
                    </Button>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleDeleteClick("tag", selectedTag)}
                >
                  Delete Tag
                </Button>
              </div>
            )}
          </div>

          {/* Genres Section */}
          <div className="space-y-3">
            <Label>Manage Genres ({genres.length} total)</Label>
            <Popover open={genrePopoverOpen} onOpenChange={setGenrePopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedGenre || "Select a genre..."}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search genres..."
                      value={genreSearch}
                      onChange={(e) => setGenreSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto p-2">
                  {filteredGenres.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-2">No genres found</p>
                  ) : (
                    filteredGenres.map((genre) => (
                      <Button
                        key={genre}
                        variant={selectedGenre === genre ? "secondary" : "ghost"}
                        className="w-full justify-start mb-1"
                        onClick={() => {
                          setSelectedGenre(genre);
                          setRenameGenreValue(genre);
                          setGenrePopoverOpen(false);
                          setGenreSearch("");
                        }}
                      >
                        {genre}
                      </Button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Rename/Delete for selected genre */}
            {selectedGenre && (
              <div className="space-y-3 pt-2 border-t">
                <div className="space-y-2">
                  <Label htmlFor="rename-genre">Rename Genre</Label>
                  <div className="flex gap-2">
                    <Input
                      id="rename-genre"
                      value={renameGenreValue}
                      onChange={(e) => setRenameGenreValue(e.target.value)}
                      placeholder="New genre name"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameGenre();
                      }}
                    />
                    <Button
                      onClick={handleRenameGenre}
                      disabled={!renameGenreValue || renameGenreValue === selectedGenre}
                    >
                      Rename
                    </Button>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleDeleteClick("genre", selectedGenre)}
                >
                  Delete Genre
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteItem?.type === "tag" ? "Tag" : "Genre"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteItem?.name}&quot;? This will remove it from all media items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
