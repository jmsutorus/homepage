"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { searchGlobal, type SearchResults, type SearchFilters } from "@/lib/actions/search";
import { getSavedSearches, createSavedSearch, deleteSavedSearch, type SavedSearch } from "@/lib/actions/saved-searches";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search, Loader2, FileText, CheckSquare, Film, Map as MapIcon, History, Repeat, Filter, Save, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagAutocomplete } from "@/components/search/tag-autocomplete";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = React.useState<SearchResults | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const [savedSearches, setSavedSearches] = React.useState<SavedSearch[]>([]);
  const [saveName, setSaveName] = React.useState("");
  const [saveOpen, setSaveOpen] = React.useState(false);
  
  const [filters, setFilters] = React.useState<SearchFilters>({
    types: [],
    tags: [],
  });

  // Sync filters from URL on mount/update
  React.useEffect(() => {
    if (!open) return;
    
    const typeParam = searchParams.get("type");
    const tagParam = searchParams.get("tag");
    
    setFilters({
      types: typeParam ? [typeParam] : [],
      tags: tagParam ? tagParam.split(",") : [],
    });
    
    // Load saved searches
    getSavedSearches().then(setSavedSearches);
  }, [open, searchParams]);

  // Update URL when filters change
  const updateUrl = React.useCallback((newFilters: SearchFilters) => {
    const params = new URLSearchParams(searchParams);
    
    if (newFilters.types && newFilters.types.length > 0) {
      params.set("type", newFilters.types[0]);
    } else {
      params.delete("type");
    }
    
    if (newFilters.tags && newFilters.tags.length > 0) {
      params.set("tag", newFilters.tags.join(","));
    } else {
      params.delete("tag");
    }

    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    updateUrl(newFilters);
  };

  const handleSaveSearch = async () => {
    if (!saveName.trim()) return;
    try {
      const newSearch = await createSavedSearch(saveName, query, filters);
      setSavedSearches([newSearch, ...savedSearches]);
      setSaveName("");
      setSaveOpen(false);
    } catch (error) {
      console.error("Failed to save search", error);
    }
  };

  const handleDeleteSavedSearch = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await deleteSavedSearch(id);
      setSavedSearches(savedSearches.filter(s => s.id !== id));
    } catch (error) {
      console.error("Failed to delete saved search", error);
    }
  };

  const handleSelectSavedSearch = (search: SavedSearch) => {
    setQuery(search.query);
    setFilters(search.filters);
    updateUrl(search.filters);
  };

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  React.useEffect(() => {
    if (debouncedQuery.length === 0 && (!filters.tags || filters.tags.length === 0)) {
      setResults(null);
      return;
    }

    startTransition(async () => {
      const data = await searchGlobal(debouncedQuery, filters);
      setResults(data);
    });
  }, [debouncedQuery, filters]);

  const handleSelect = (url: string, term?: string) => {
    setOpen(false);
    router.push(url);
    if (term) {
      saveRecentSearch(term);
    }
  };

  const saveRecentSearch = (term: string) => {
    // Avoid duplicates and keep only last 5
    const newRecent = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem("recentSearches", JSON.stringify(newRecent));
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2 text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex flex-col gap-2 p-2 border-b bg-muted/10">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <Tabs 
                    value={filters.types?.[0] || "all"} 
                    onValueChange={(val) => handleFilterChange({...filters, types: val === "all" ? [] : [val]})}
                    className="w-full"
                >
                    <TabsList className="h-8">
                        <TabsTrigger value="all" className="text-xs h-7 cursor-pointer">All</TabsTrigger>
                        <TabsTrigger value="task" className="text-xs h-7 cursor-pointer">Tasks</TabsTrigger>
                        <TabsTrigger value="journal" className="text-xs h-7 cursor-pointer">Journals</TabsTrigger>
                        <TabsTrigger value="media" className="text-xs h-7 cursor-pointer">Media</TabsTrigger>
                        <TabsTrigger value="park" className="text-xs h-7 cursor-pointer">Parks</TabsTrigger>
                        <TabsTrigger value="habit" className="text-xs h-7 cursor-pointer">Habits</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex-1">
                    <TagAutocomplete 
                        selectedTags={filters.tags || []} 
                        onTagsChange={(tags) => handleFilterChange({...filters, tags})} 
                    />
                </div>
                <Popover open={saveOpen} onOpenChange={setSaveOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Save Search">
                            <Save className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60 p-3" align="end">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-xs font-medium">Save Search</Label>
                            <div className="flex gap-2">
                                <Input 
                                    id="name" 
                                    value={saveName} 
                                    onChange={(e) => setSaveName(e.target.value)} 
                                    placeholder="Name..." 
                                    className="h-8 text-xs"
                                />
                                <Button size="sm" className="h-8" onClick={handleSaveSearch}>Save</Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>

        <CommandInput
          placeholder="Type to search..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {isPending ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              "No results found."
            )}
          </CommandEmpty>
          
          {!query && (!filters.tags || filters.tags.length === 0) && (
            <>
                {savedSearches.length > 0 && (
                    <CommandGroup heading="Saved Searches">
                        {savedSearches.map((search) => (
                            <CommandItem
                                key={`saved-${search.id}`}
                                value={`saved-${search.name}`}
                                onSelect={() => handleSelectSavedSearch(search)}
                                className="group"
                            >
                                <Save className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span className="flex-1">{search.name}</span>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                    onClick={(e) => handleDeleteSavedSearch(e, search.id)}
                                >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {recentSearches.length > 0 && (
                    <CommandGroup heading="Recent Searches">
                    {recentSearches.map((term) => (
                        <CommandItem
                        key={term}
                        value={term}
                        onSelect={() => setQuery(term)}
                        >
                        <History className="mr-2 h-4 w-4 text-muted-foreground" />
                        {term}
                        </CommandItem>
                    ))}
                    </CommandGroup>
                )}
            </>
          )}

          {results && (
            <>
              {results.tasks.length > 0 && (
                <CommandGroup heading="Tasks">
                  {results.tasks.map((task) => (
                    <CommandItem
                      key={`task-${task.id}`}
                      value={task.title}
                      onSelect={() => handleSelect(task.url, query)}
                    >
                      <CheckSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                      {task.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {results.journals.length > 0 && (
                <CommandGroup heading="Journals">
                  {results.journals.map((journal) => (
                    <CommandItem
                      key={`journal-${journal.id}`}
                      value={journal.title}
                      onSelect={() => handleSelect(journal.url, query)}
                    >
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                      {journal.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results.media.length > 0 && (
                <CommandGroup heading="Media">
                  {results.media.map((item) => (
                    <CommandItem
                      key={`media-${item.id}`}
                      value={item.title}
                      onSelect={() => handleSelect(item.url, query)}
                    >
                      <Film className="mr-2 h-4 w-4 text-muted-foreground" />
                      {item.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results.parks.length > 0 && (
                <CommandGroup heading="Parks">
                  {results.parks.map((park) => (
                    <CommandItem
                      key={`park-${park.id}`}
                      value={park.title}
                      onSelect={() => handleSelect(park.url, query)}
                    >
                      <MapIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {park.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results.habits.length > 0 && (
                <CommandGroup heading="Habits">
                  {results.habits.map((habit) => (
                    <CommandItem
                      key={`habit-${habit.id}`}
                      value={habit.title}
                      onSelect={() => handleSelect(habit.url, query)}
                    >
                      <Repeat className="mr-2 h-4 w-4 text-muted-foreground" />
                      {habit.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
