"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { searchGlobal, type SearchResults, type SearchFilters } from "@/lib/actions/search";
import { getSavedSearches, deleteSavedSearch, type SavedSearch } from "@/lib/actions/saved-searches";
import {
  Calendar,
  Home,
  ListTodo,
  BookOpen,
  Film,
  Mountain,
  Activity,
  Settings,
  Plus,
  Search,
  TrendingUp,
  Loader2,
  FileText,
  CheckSquare,
  Map as MapIcon,
  History,
  Repeat,
  Save,
  Trash2,
  X,
  ArrowLeft,
  Target,
  Heart,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagAutocomplete } from "@/components/search/tag-autocomplete";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface MobileCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CommandItem = {
  id: string;
  label: string;
  keywords: string[];
  icon?: React.ReactNode;
  action: () => void;
};

type CommandGroup = {
  heading: string;
  commands: CommandItem[];
};

export function MobileCommandPalette({ open, onOpenChange }: MobileCommandPaletteProps) {
  const [search, setSearch] = React.useState("");
  const router = useRouter();

  // Search state
  const debouncedQuery = useDebounce(search, 300);
  const [results, setResults] = React.useState<SearchResults | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const [savedSearches, setSavedSearches] = React.useState<SavedSearch[]>([]);
  const [showFilters, setShowFilters] = React.useState(false);

  const [filters, setFilters] = React.useState<SearchFilters>({
    types: [],
    tags: [],
  });

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSearch("");
      setResults(null);
      setFilters({ types: [], tags: [] });
      setShowFilters(false);
    } else {
      // Load saved searches and recent searches when opening
      getSavedSearches().then(setSavedSearches);
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    }
  }, [open]);

  // Perform search when query or filters change
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

  const navigate = React.useCallback(
    (path: string) => {
      onOpenChange(false);
      router.push(path);
    },
    [router, onOpenChange]
  );

  const handleSelect = (url: string, term?: string) => {
    onOpenChange(false);
    router.push(url);
    if (term) {
      saveRecentSearch(term);
    }
  };

  const saveRecentSearch = (term: string) => {
    const newRecent = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem("recentSearches", JSON.stringify(newRecent));
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleDeleteSavedSearch = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await deleteSavedSearch(id);
      setSavedSearches(savedSearches.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to delete saved search", error);
    }
  };

  const handleSelectSavedSearch = (savedSearch: SavedSearch) => {
    setSearch(savedSearch.query);
    setFilters(savedSearch.filters);
  };

  const clearFilters = () => {
    setFilters({ types: [], tags: [] });
  };

  const hasActiveFilters = (filters.types && filters.types.length > 0) || (filters.tags && filters.tags.length > 0);

  // Define command groups
  const navigationCommands: CommandGroup = {
    heading: "Navigation",
    commands: [
      {
        id: "nav-home",
        label: "Home",
        keywords: ["home", "dashboard"],
        icon: <Home className="h-5 w-5" />,
        action: () => navigate("/home"),
      },
      {
        id: "nav-calendar",
        label: "Calendar",
        keywords: ["calendar", "date", "schedule"],
        icon: <Calendar className="h-5 w-5" />,
        action: () => navigate("/calendar"),
      },
      {
        id: "nav-tasks",
        label: "Tasks",
        keywords: ["tasks", "todo", "checklist"],
        icon: <ListTodo className="h-5 w-5" />,
        action: () => navigate("/tasks"),
      },
      {
        id: "nav-habits",
        label: "Habits",
        keywords: ["habits", "tracking", "routine"],
        icon: <Heart className="h-5 w-5" />,
        action: () => navigate("/habits"),
      },
      {
        id: "nav-goals",
        label: "Goals",
        keywords: ["goals", "targets", "objectives"],
        icon: <Target className="h-5 w-5" />,
        action: () => navigate("/goals"),
      },
      {
        id: "nav-journals",
        label: "Journals",
        keywords: ["journals", "diary", "writing"],
        icon: <BookOpen className="h-5 w-5" />,
        action: () => navigate("/journals"),
      },
      {
        id: "nav-media",
        label: "Media",
        keywords: ["media", "movies", "books", "tv", "games"],
        icon: <Film className="h-5 w-5" />,
        action: () => navigate("/media"),
      },
      {
        id: "nav-parks",
        label: "Parks",
        keywords: ["parks", "national", "travel"],
        icon: <Mountain className="h-5 w-5" />,
        action: () => navigate("/parks"),
      },
      {
        id: "nav-exercise",
        label: "Exercise",
        keywords: ["exercise", "workout", "fitness"],
        icon: <Activity className="h-5 w-5" />,
        action: () => navigate("/exercise"),
      },
      {
        id: "nav-year",
        label: "Year in Review",
        keywords: ["year", "review", "statistics", "stats"],
        icon: <TrendingUp className="h-5 w-5" />,
        action: () => navigate(`/year/${new Date().getFullYear()}`),
      },
      {
        id: "nav-settings",
        label: "Settings",
        keywords: ["settings", "preferences", "config"],
        icon: <Settings className="h-5 w-5" />,
        action: () => navigate("/settings"),
      },
    ],
  };

  const quickAddCommands: CommandGroup = {
    heading: "Quick Add",
    commands: [
      {
        id: "add-task",
        label: "New Task",
        keywords: ["new", "create", "add", "task"],
        icon: <Plus className="h-5 w-5" />,
        action: () => navigate("/tasks?new=true"),
      },
      {
        id: "add-journal",
        label: "New Journal Entry",
        keywords: ["new", "create", "add", "journal", "diary"],
        icon: <Plus className="h-5 w-5" />,
        action: () => navigate("/journals/new"),
      },
      {
        id: "add-media",
        label: "Add Media",
        keywords: ["new", "create", "add", "media", "movie", "book"],
        icon: <Plus className="h-5 w-5" />,
        action: () => navigate("/media/new"),
      },
      {
        id: "add-park",
        label: "Add Park",
        keywords: ["new", "create", "add", "park", "national"],
        icon: <Plus className="h-5 w-5" />,
        action: () => navigate("/parks/new"),
      },
    ],
  };

  // Check if we're in search mode (has search query or filters)
  const isSearchMode = search.length > 0 || hasActiveFilters;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[100dvh] w-full p-0 rounded-none border-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full bg-background">
          {/* Header with Search Bar */}
          <div className="sticky top-0 z-10 bg-background border-b">
            {/* Top bar with back button */}
            <div className="flex items-center gap-3 px-4 py-3 border-b">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-10 w-10 shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search everything..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="w-full h-12 pl-10 pr-10 text-base bg-muted/50 rounded-lg border-0 outline-none focus:ring-2 focus:ring-brand"
                />
                {search && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearch("")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filters Section */}
            {showFilters && (
              <div className="flex flex-col gap-3 p-4 bg-muted/10">
                <Tabs
                  value={filters.types?.[0] || "all"}
                  onValueChange={(val) =>
                    handleFilterChange({ ...filters, types: val === "all" ? [] : [val] })
                  }
                  className="w-full"
                >
                  <TabsList className="w-full grid grid-cols-3 h-auto">
                    <TabsTrigger value="all" className="text-sm py-2 cursor-pointer">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="task" className="text-sm py-2 cursor-pointer">
                      Tasks
                    </TabsTrigger>
                    <TabsTrigger value="journal" className="text-sm py-2 cursor-pointer">
                      Journals
                    </TabsTrigger>
                  </TabsList>
                  <TabsList className="w-full grid grid-cols-3 h-auto mt-2">
                    <TabsTrigger value="media" className="text-sm py-2 cursor-pointer">
                      Media
                    </TabsTrigger>
                    <TabsTrigger value="park" className="text-sm py-2 cursor-pointer">
                      Parks
                    </TabsTrigger>
                    <TabsTrigger value="habit" className="text-sm py-2 cursor-pointer">
                      Habits
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <TagAutocomplete
                      selectedTags={filters.tags || []}
                      onTagsChange={(tags) => handleFilterChange({ ...filters, tags })}
                    />
                  </div>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 shrink-0"
                      onClick={clearFilters}
                      title="Clear filters"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Quick filter toggle */}
            <div className="px-4 py-2 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full justify-start h-10 text-sm"
              >
                <Search className="h-4 w-4 mr-2" />
                {showFilters ? "Hide Filters" : "Show Filters"}
                {hasActiveFilters && (
                  <span className="ml-2 h-5 w-5 rounded-full bg-brand text-brand-foreground text-xs flex items-center justify-center">
                    {(filters.types?.length || 0) + (filters.tags?.length || 0)}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4 pb-safe">{/* pb-safe for iOS safe area */}
              {/* Saved Searches */}
              {savedSearches.length > 0 && !isSearchMode && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground px-2">
                    Saved Searches
                  </h3>
                  {savedSearches.map((savedSearch) => (
                    <button
                      key={`saved-${savedSearch.id}`}
                      onClick={() => handleSelectSavedSearch(savedSearch)}
                      className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent active:bg-accent/80 transition-colors min-h-[56px]"
                    >
                      <Save className="h-5 w-5 text-muted-foreground shrink-0" />
                      <span className="flex-1 text-left text-base">{savedSearch.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={(e) => handleDeleteSavedSearch(e, savedSearch.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </button>
                  ))}
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && !isSearchMode && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground px-2">
                    Recent Searches
                  </h3>
                  {recentSearches.map((term) => (
                    <button
                      key={`recent-${term}`}
                      onClick={() => setSearch(term)}
                      className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent active:bg-accent/80 transition-colors min-h-[56px]"
                    >
                      <History className="h-5 w-5 text-muted-foreground shrink-0" />
                      <span className="text-left text-base">{term}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Navigation Commands */}
              {!isSearchMode && (
                <>
                  {[navigationCommands, quickAddCommands].map((group) => (
                    <div key={group.heading} className="space-y-2">
                      <h3 className="text-sm font-semibold text-muted-foreground px-2">
                        {group.heading}
                      </h3>
                      {group.commands.map((cmd) => (
                        <button
                          key={cmd.id}
                          onClick={() => cmd.action()}
                          className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent active:bg-accent/80 transition-colors min-h-[56px]"
                        >
                          {cmd.icon && <span className="text-muted-foreground shrink-0">{cmd.icon}</span>}
                          <span className="flex-1 text-left text-base">{cmd.label}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </>
              )}

              {/* Search Results */}
              {isSearchMode && (
                <>
                  {isPending && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )}

                  {results && (
                    <>
                      {results.tasks.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-semibold text-muted-foreground px-2">
                            Tasks
                          </h3>
                          {results.tasks.map((task) => (
                            <button
                              key={`task-${task.id}`}
                              onClick={() => handleSelect(task.url, search)}
                              className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent active:bg-accent/80 transition-colors min-h-[56px]"
                            >
                              <CheckSquare className="h-5 w-5 text-muted-foreground shrink-0" />
                              <span className="text-left text-base">{task.title}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {results.journals.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-semibold text-muted-foreground px-2">
                            Journals
                          </h3>
                          {results.journals.map((journal) => (
                            <button
                              key={`journal-${journal.id}`}
                              onClick={() => handleSelect(journal.url, search)}
                              className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent active:bg-accent/80 transition-colors min-h-[56px]"
                            >
                              <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                              <span className="text-left text-base">{journal.title}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {results.media.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-semibold text-muted-foreground px-2">
                            Media
                          </h3>
                          {results.media.map((item) => (
                            <button
                              key={`media-${item.id}`}
                              onClick={() => handleSelect(item.url, search)}
                              className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent active:bg-accent/80 transition-colors min-h-[56px]"
                            >
                              <Film className="h-5 w-5 text-muted-foreground shrink-0" />
                              <span className="text-left text-base">{item.title}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {results.parks.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-semibold text-muted-foreground px-2">
                            Parks
                          </h3>
                          {results.parks.map((park) => (
                            <button
                              key={`park-${park.id}`}
                              onClick={() => handleSelect(park.url, search)}
                              className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent active:bg-accent/80 transition-colors min-h-[56px]"
                            >
                              <MapIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                              <span className="text-left text-base">{park.title}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {results.habits.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-semibold text-muted-foreground px-2">
                            Habits
                          </h3>
                          {results.habits.map((habit) => (
                            <button
                              key={`habit-${habit.id}`}
                              onClick={() => handleSelect(habit.url, search)}
                              className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent active:bg-accent/80 transition-colors min-h-[56px]"
                            >
                              <Repeat className="h-5 w-5 text-muted-foreground shrink-0" />
                              <span className="text-left text-base">{habit.title}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {!isPending &&
                        results.tasks.length === 0 &&
                        results.journals.length === 0 &&
                        results.media.length === 0 &&
                        results.parks.length === 0 &&
                        results.habits.length === 0 && (
                          <div className="py-12 text-center text-base text-muted-foreground">
                            No results found.
                          </div>
                        )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
