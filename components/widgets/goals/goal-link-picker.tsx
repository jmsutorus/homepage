"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Search, Repeat, CheckSquare, BookOpen } from "lucide-react";
import type { GoalLink, GoalLinkType } from "@/lib/db/goals";

interface LinkData {
  linked_type: GoalLinkType;
  linked_id: number;
  linked_slug?: string;
  note?: string;
}

interface GoalLinkPickerProps {
  links: GoalLink[];
  onLinksChange: (links: LinkData[]) => void;
}

interface SearchResult {
  id: number;
  slug?: string;
  title: string;
  type?: string;
  subtype?: string;
}

const linkTypeConfig: Record<GoalLinkType, { label: string; icon: React.ReactNode; plural: string }> = {
  habit: { label: "Habit", icon: <Repeat className="h-4 w-4" />, plural: "habits" },
  task: { label: "Task", icon: <CheckSquare className="h-4 w-4" />, plural: "tasks" },
  journal: { label: "Journal", icon: <BookOpen className="h-4 w-4" />, plural: "journals" },
};

export function GoalLinkPicker({ links, onLinksChange }: GoalLinkPickerProps) {
  const [selectedType, setSelectedType] = useState<GoalLinkType>("habit");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [linkedItemDetails, setLinkedItemDetails] = useState<Map<string, SearchResult>>(new Map());

  // Fetch details for linked items
  useEffect(() => {
    const fetchLinkedDetails = async () => {
      for (const link of links) {
        const key = `${link.linked_type}-${link.linked_id}`;
        if (!linkedItemDetails.has(key)) {
          try {
            let endpoint = "";
            switch (link.linked_type) {
              case "habit":
                endpoint = `/api/habits`;
                break;
              case "task":
                endpoint = `/api/tasks`;
                break;
              case "journal":
                if (link.linked_slug) {
                  endpoint = `/api/journals/${link.linked_slug}`;
                }
                break;
            }

            if (endpoint) {
              const res = await fetch(endpoint);
              if (res.ok) {
                const data = await res.json();

                // For habits and tasks, find the specific item in the array
                if (link.linked_type === "habit" || link.linked_type === "task") {
                  const items = Array.isArray(data) ? data : [];
                  const item = items.find((i: any) => i.id === link.linked_id);
                  if (item) {
                    setLinkedItemDetails((prev) =>
                      new Map(prev).set(key, {
                        id: link.linked_id,
                        slug: item.slug,
                        title: item.title,
                        type: link.linked_type,
                      })
                    );
                  }
                } else {
                  // Journal returns single item
                  setLinkedItemDetails((prev) =>
                    new Map(prev).set(key, {
                      id: link.linked_id,
                      slug: data.slug,
                      title: data.frontmatter?.title || data.title || "Unknown",
                      type: link.linked_type,
                      subtype: data.frontmatter?.journal_type,
                    })
                  );
                }
              }
            }
          } catch (error) {
            console.error("Error fetching linked item details:", error);
          }
        }
      }
    };

    if (links.length > 0) {
      fetchLinkedDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [links]);

  // Search for items to link
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      let endpoint = "";
      switch (selectedType) {
        case "habit":
          endpoint = "/api/habits";
          break;
        case "task":
          endpoint = "/api/tasks";
          break;
        case "journal":
          endpoint = "/api/journals";
          break;
      }

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();

        // Filter results based on search query
        const filtered = data.filter((item: any) => {
          const title = item.title || item.frontmatter?.title || "";
          return title.toLowerCase().includes(searchQuery.toLowerCase());
        });

        setSearchResults(
          filtered.map((item: any) => ({
            id: item.id,
            slug: item.slug,
            title: item.title || item.frontmatter?.title,
            type: selectedType,
            subtype: item.frontmatter?.journal_type,
          }))
        );
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const addLink = (result: SearchResult) => {
    const newLink: LinkData = {
      linked_type: selectedType,
      linked_id: result.id,
      linked_slug: result.slug,
    };

    // Check if already linked
    const exists = links.some(
      (l) => l.linked_type === newLink.linked_type && l.linked_id === newLink.linked_id
    );

    if (!exists) {
      onLinksChange([
        ...links.map((l): LinkData => ({
          linked_type: l.linked_type,
          linked_id: l.linked_id,
          linked_slug: l.linked_slug || undefined,
          note: l.note || undefined,
        })),
        newLink,
      ]);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const removeLink = (linkedType: GoalLinkType, linkedId: number) => {
    onLinksChange(
      links
        .filter((l) => !(l.linked_type === linkedType && l.linked_id === linkedId))
        .map((l): LinkData => ({
          linked_type: l.linked_type,
          linked_id: l.linked_id,
          linked_slug: l.linked_slug || undefined,
          note: l.note || undefined,
        }))
    );
  };

  const getIcon = (type: GoalLinkType) => linkTypeConfig[type].icon;

  return (
    <div className="space-y-4">
      {/* Current Links */}
      {links.length > 0 && (
        <div className="space-y-2">
          <Label>Linked Items ({links.length})</Label>
          <div className="flex flex-wrap gap-2">
            {links.map((link, idx) => {
              const key = `${link.linked_type}-${link.linked_id}`;
              const details = linkedItemDetails.get(key);
              const config = linkTypeConfig[link.linked_type];
              return (
                <Badge key={idx} variant="secondary" className="flex items-center gap-2 py-1.5 px-3">
                  {config.icon}
                  <span className="text-xs text-muted-foreground capitalize">{config.label}:</span>
                  <span>{details?.title || link.linked_slug || `ID ${link.linked_id}`}</span>
                  {details?.subtype && (
                    <span className="text-xs text-muted-foreground">({details.subtype})</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeLink(link.linked_type, link.linked_id)}
                    className="cursor-pointer hover:text-destructive ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Add New Link */}
      <div className="border rounded-lg p-4 space-y-4">
        <Label>Link Habits, Tasks, or Journals</Label>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="link-type" className="text-sm text-muted-foreground">
              Type
            </Label>
            <Select value={selectedType} onValueChange={(val) => setSelectedType(val as GoalLinkType)}>
              <SelectTrigger id="link-type" className="cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(linkTypeConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      {config.icon}
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm text-muted-foreground">
              Search
            </Label>
            <div className="flex gap-2">
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${linkTypeConfig[selectedType].plural}...`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                variant="outline"
                size="icon"
                className="cursor-pointer"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Results</Label>
            <div className="max-h-48 overflow-y-auto space-y-1 border rounded p-2">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => addLink(result)}
                >
                  <div className="flex items-center gap-2">
                    {getIcon(selectedType)}
                    <div>
                      <p className="font-medium">{result.title}</p>
                      {result.subtype && (
                        <p className="text-xs text-muted-foreground capitalize">
                          {result.subtype} journal
                        </p>
                      )}
                    </div>
                  </div>
                  <Button type="button" size="icon" variant="ghost" className="cursor-pointer">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchQuery && searchResults.length === 0 && !isSearching && (
          <p className="text-sm text-muted-foreground">
            No {linkTypeConfig[selectedType].plural} found matching &quot;{searchQuery}&quot;
          </p>
        )}
      </div>
    </div>
  );
}
