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
        className="h-[100dvh] w-full p-0 rounded-none border-0 bg-media-surface-container"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full bg-media-surface-container">
          {/* Header with Search Bar */}
          <div className="sticky top-0 z-10 bg-media-surface-container-low border-b border-media-outline-variant/10">
            {/* Top bar with back button */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-media-outline-variant/10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-10 w-10 shrink-0 text-media-primary hover:bg-media-surface-container-high hover:text-media-primary"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-media-primary/60" />
                <input
                  type="text"
                  placeholder="Search everything..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="w-full h-12 pl-10 pr-12 text-base bg-media-surface-container-highest/60 text-media-primary placeholder-media-primary/40 rounded-xl border border-media-outline-variant/10 outline-none focus:ring-2 focus:ring-media-primary/20 transition-all"
                />
                {search && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearch("")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-media-primary/60 hover:text-media-primary"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filters Section */}
            {showFilters && (
              <div className="flex flex-col gap-3 p-4 bg-media-surface-container-low border-b border-media-outline-variant/10">
                <Tabs
                  value={filters.types?.[0] || "all"}
                  onValueChange={(val) =>
                    handleFilterChange({ ...filters, types: val === "all" ? [] : [val] })
                  }
                  className="w-full"
                >
                  <TabsList className="w-full grid grid-cols-3 h-auto bg-media-surface-container-high border border-media-outline-variant/10">
                    <TabsTrigger value="all" className="text-xs font-bold py-2 cursor-pointer text-media-primary/80 data-[state=active]:text-media-on-secondary data-[state=active]:bg-media-secondary">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="task" className="text-xs font-bold py-2 cursor-pointer text-media-primary/80 data-[state=active]:text-media-on-secondary data-[state=active]:bg-media-secondary">
                      Tasks
                    </TabsTrigger>
                    <TabsTrigger value="journal" className="text-xs font-bold py-2 cursor-pointer text-media-primary/80 data-[state=active]:text-media-on-secondary data-[state=active]:bg-media-secondary">
                      Journals
                    </TabsTrigger>
                  </TabsList>
                  <TabsList className="w-full grid grid-cols-3 h-auto mt-2 bg-media-surface-container-high border border-media-outline-variant/10">
                    <TabsTrigger value="media" className="text-xs font-bold py-2 cursor-pointer text-media-primary/80 data-[state=active]:text-media-on-secondary data-[state=active]:bg-media-secondary">
                      Media
                    </TabsTrigger>
                    <TabsTrigger value="park" className="text-xs font-bold py-2 cursor-pointer text-media-primary/80 data-[state=active]:text-media-on-secondary data-[state=active]:bg-media-secondary">
                      Parks
                    </TabsTrigger>
                    <TabsTrigger value="habit" className="text-xs font-bold py-2 cursor-pointer text-media-primary/80 data-[state=active]:text-media-on-secondary data-[state=active]:bg-media-secondary">
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
                      className="h-10 w-10 shrink-0 text-media-primary/60 hover:text-media-primary hover:bg-media-surface-container-highest"
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
            <div className="px-4 py-2 border-b border-media-outline-variant/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full justify-start h-10 text-sm font-bold text-media-primary hover:bg-media-surface-container-highest hover:text-media-primary"
              >
                <Search className="h-4 w-4 mr-2" />
                {showFilters ? "Hide Filters" : "Show Filters"}
                {hasActiveFilters && (
                  <span className="ml-2 h-5 w-5 rounded-full bg-media-secondary text-media-on-secondary text-xs font-bold flex items-center justify-center">
                    {(filters.types?.length || 0) + (filters.tags?.length || 0)}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto bg-media-surface-container">
            <div className="p-4 space-y-4 pb-safe">{/* pb-safe for iOS safe area */}
              {/* Saved Searches */}
              {savedSearches.length > 0 && !isSearchMode && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-media-secondary uppercase tracking-[0.2em] mb-4 mt-2 px-2">
                    Saved Searches
                  </h3>
                  {savedSearches.map((savedSearch) => (
                    <button
                      key={`saved-${savedSearch.id}`}
                      onClick={() => handleSelectSavedSearch(savedSearch)}
                      className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-media-surface-container-lowest hover:bg-media-surface-container-high border border-media-outline-variant/10 active:scale-[0.98] transition-all min-h-[56px] shadow-sm"
                    >
                      <Save className="h-5 w-5 text-media-primary shrink-0" />
                      <span className="flex-1 text-left text-base font-bold text-media-primary tracking-tight">{savedSearch.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-media-primary/60 hover:text-red-500 hover:bg-media-surface-container-highest"
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
                  <h3 className="text-[10px] font-bold text-media-secondary uppercase tracking-[0.2em] mb-4 mt-2 px-2">
                    Recent Searches
                  </h3>
                  {recentSearches.map((term) => (
                    <button
                      key={`recent-${term}`}
                      onClick={() => setSearch(term)}
                      className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-media-surface-container-lowest hover:bg-media-surface-container-high border border-media-outline-variant/10 active:scale-[0.98] transition-all min-h-[56px] shadow-sm"
                    >
                      <History className="h-5 w-5 text-media-primary shrink-0" />
                      <span className="text-left text-base font-bold text-media-primary tracking-tight">{term}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Add Commands */}
              {!isSearchMode && (
                <>
                  {[quickAddCommands].map((group) => (
                    <div key={group.heading} className="space-y-2">
                      <h3 className="text-[10px] font-bold text-media-secondary uppercase tracking-[0.2em] mb-4 mt-4 px-2">
                        {group.heading}
                      </h3>
                      {group.commands.map((cmd) => (
                        <button
                          key={cmd.id}
                          onClick={() => cmd.action()}
                          className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-media-surface-container-lowest hover:bg-media-surface-container-high border border-media-outline-variant/10 active:scale-[0.98] transition-all min-h-[56px] shadow-sm"
                        >
                          {cmd.icon && <span className="text-media-primary shrink-0">{cmd.icon}</span>}
                          <span className="flex-1 text-left text-base font-bold text-media-primary tracking-tight">{cmd.label}</span>
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
                      <Loader2 className="h-8 w-8 animate-spin text-media-primary" />
                    </div>
                  )}

                  {results && (
                    <>
                      {results.tasks.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-[10px] font-bold text-media-secondary uppercase tracking-[0.2em] mb-4 mt-2 px-2">
                            Tasks
                          </h3>
                          {results.tasks.map((task) => (
                            <button
                              key={`task-${task.id}`}
                              onClick={() => handleSelect(task.url, search)}
                              className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-media-surface-container-lowest hover:bg-media-surface-container-high border border-media-outline-variant/10 active:scale-[0.98] transition-all min-h-[56px] shadow-sm"
                            >
                              <CheckSquare className="h-5 w-5 text-media-primary shrink-0" />
                              <span className="text-left text-base font-bold text-media-primary tracking-tight">{task.title}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {results.journals.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-[10px] font-bold text-media-secondary uppercase tracking-[0.2em] mb-4 mt-4 px-2">
                            Journals
                          </h3>
                          {results.journals.map((journal) => (
                            <button
                              key={`journal-${journal.id}`}
                              onClick={() => handleSelect(journal.url, search)}
                              className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-media-surface-container-lowest hover:bg-media-surface-container-high border border-media-outline-variant/10 active:scale-[0.98] transition-all min-h-[56px] shadow-sm"
                            >
                              <FileText className="h-5 w-5 text-media-primary shrink-0" />
                              <span className="text-left text-base font-bold text-media-primary tracking-tight">{journal.title}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {results.media.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-[10px] font-bold text-media-secondary uppercase tracking-[0.2em] mb-4 mt-4 px-2">
                            Media
                          </h3>
                          {results.media.map((item) => (
                            <button
                              key={`media-${item.id}`}
                              onClick={() => handleSelect(item.url, search)}
                              className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-media-surface-container-lowest hover:bg-media-surface-container-high border border-media-outline-variant/10 active:scale-[0.98] transition-all min-h-[56px] shadow-sm"
                            >
                              <Film className="h-5 w-5 text-media-primary shrink-0" />
                              <span className="text-left text-base font-bold text-media-primary tracking-tight">{item.title}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {results.parks.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-[10px] font-bold text-media-secondary uppercase tracking-[0.2em] mb-4 mt-4 px-2">
                            Parks
                          </h3>
                          {results.parks.map((park) => (
                            <button
                              key={`park-${park.id}`}
                              onClick={() => handleSelect(park.url, search)}
                              className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-media-surface-container-lowest hover:bg-media-surface-container-high border border-media-outline-variant/10 active:scale-[0.98] transition-all min-h-[56px] shadow-sm"
                            >
                              <MapIcon className="h-5 w-5 text-media-primary shrink-0" />
                              <span className="text-left text-base font-bold text-media-primary tracking-tight">{park.title}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {results.habits.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-[10px] font-bold text-media-secondary uppercase tracking-[0.2em] mb-4 mt-4 px-2">
                            Habits
                          </h3>
                          {results.habits.map((habit) => (
                            <button
                              key={`habit-${habit.id}`}
                              onClick={() => handleSelect(habit.url, search)}
                              className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-media-surface-container-lowest hover:bg-media-surface-container-high border border-media-outline-variant/10 active:scale-[0.98] transition-all min-h-[56px] shadow-sm"
                            >
                              <Repeat className="h-5 w-5 text-media-primary shrink-0" />
                              <span className="text-left text-base font-bold text-media-primary tracking-tight">{habit.title}</span>
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
                          <div className="py-12 text-center text-base font-medium text-media-primary/60">
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
