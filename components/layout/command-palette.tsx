"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useDebounce } from "@/hooks/use-debounce";
import { searchGlobal, type SearchResults, type SearchFilters } from "@/lib/actions/search";
import { getSavedSearches, createSavedSearch, deleteSavedSearch, type SavedSearch } from "@/lib/actions/saved-searches";
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
  Keyboard,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagAutocomplete } from "@/components/search/tag-autocomplete";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CommandPaletteProps {
  className?: string;
}

type CommandItem = {
  id: string;
  label: string;
  keywords: string[];
  icon?: React.ReactNode;
  action: () => void;
  shortcut?: string;
};

type CommandGroup = {
  heading: string;
  commands: CommandItem[];
};

export function CommandPalette({ className }: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [pages, setPages] = React.useState<string[]>(["home"]);
  const router = useRouter();

  // Search state
  const debouncedQuery = useDebounce(search, 300);
  const [results, setResults] = React.useState<SearchResults | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const [savedSearches, setSavedSearches] = React.useState<SavedSearch[]>([]);
  const [saveName, setSaveName] = React.useState("");
  const [saveOpen, setSaveOpen] = React.useState(false);

  const [filters, setFilters] = React.useState<SearchFilters>({
    types: [],
    tags: [],
  });

  // Listen for Cmd+K / Ctrl+K keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((currentOpen) => !currentOpen);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSearch("");
      setPages(["home"]);
      setResults(null);
      setFilters({ types: [], tags: [] });
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
      setOpen(false);
      router.push(path);
    },
    [router]
  );

  const handleSelect = (url: string, term?: string) => {
    setOpen(false);
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

  const handleSaveSearch = async () => {
    if (!saveName.trim()) return;
    try {
      const newSearch = await createSavedSearch(saveName, search, filters);
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
        icon: <Home className="h-4 w-4" />,
        action: () => navigate("/home"),
      },
      {
        id: "nav-calendar",
        label: "Calendar",
        keywords: ["calendar", "date", "schedule"],
        icon: <Calendar className="h-4 w-4" />,
        action: () => navigate("/calendar"),
      },
      {
        id: "nav-tasks",
        label: "Tasks",
        keywords: ["tasks", "todo", "checklist"],
        icon: <ListTodo className="h-4 w-4" />,
        action: () => navigate("/tasks"),
      },
      {
        id: "nav-habits",
        label: "Habits",
        keywords: ["habits", "tracking", "routine"],
        icon: <Activity className="h-4 w-4" />,
        action: () => navigate("/habits"),
      },
      {
        id: "nav-journals",
        label: "Journals",
        keywords: ["journals", "diary", "writing"],
        icon: <BookOpen className="h-4 w-4" />,
        action: () => navigate("/journals"),
      },
      {
        id: "nav-media",
        label: "Media",
        keywords: ["media", "movies", "books", "tv", "games"],
        icon: <Film className="h-4 w-4" />,
        action: () => navigate("/media"),
      },
      {
        id: "nav-parks",
        label: "Parks",
        keywords: ["parks", "national", "travel"],
        icon: <Mountain className="h-4 w-4" />,
        action: () => navigate("/parks"),
      },
      {
        id: "nav-exercise",
        label: "Exercise",
        keywords: ["exercise", "workout", "fitness"],
        icon: <Activity className="h-4 w-4" />,
        action: () => navigate("/exercise"),
      },
      {
        id: "nav-year",
        label: "Year in Review",
        keywords: ["year", "review", "statistics", "stats"],
        icon: <TrendingUp className="h-4 w-4" />,
        action: () => navigate(`/year/${new Date().getFullYear()}`),
      },
      {
        id: "nav-settings",
        label: "Settings",
        keywords: ["settings", "preferences", "config"],
        icon: <Settings className="h-4 w-4" />,
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
        icon: <Plus className="h-4 w-4" />,
        action: () => navigate("/tasks?new=true"),
      },
      {
        id: "add-journal",
        label: "New Journal Entry",
        keywords: ["new", "create", "add", "journal", "diary"],
        icon: <Plus className="h-4 w-4" />,
        action: () => navigate("/journals/new"),
      },
      {
        id: "add-media",
        label: "Add Media",
        keywords: ["new", "create", "add", "media", "movie", "book"],
        icon: <Plus className="h-4 w-4" />,
        action: () => navigate("/media/new"),
      },
      {
        id: "add-park",
        label: "Add Park",
        keywords: ["new", "create", "add", "park", "national"],
        icon: <Plus className="h-4 w-4" />,
        action: () => navigate("/parks/new"),
      },
    ],
  };

  const helpCommands: CommandGroup = {
    heading: "Help",
    commands: [
      {
        id: "help-shortcuts",
        label: "Keyboard Shortcuts",
        keywords: ["help", "shortcuts", "keyboard", "keys"],
        icon: <Keyboard className="h-4 w-4" />,
        action: () => setPages([...pages, "shortcuts"]),
      },
    ],
  };

  // Get current page content
  const currentPage = pages[pages.length - 1];

  // Check if we're in search mode (has search query or filters)
  const isSearchMode = search.length > 0 || hasActiveFilters;

  const renderHome = () => (
    <>
      {/* Saved Searches */}
      {savedSearches.length > 0 && !isSearchMode && (
        <Command.Group heading="Saved Searches">
          {savedSearches.map((savedSearch) => (
            <Command.Item
              key={`saved-${savedSearch.id}`}
              value={`saved-${savedSearch.name}`}
              onSelect={() => handleSelectSavedSearch(savedSearch)}
              className="flex items-center gap-2 px-4 py-3 cursor-pointer rounded-sm hover:bg-accent data-[selected=true]:bg-accent group"
            >
              <Save className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{savedSearch.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => handleDeleteSavedSearch(e, savedSearch.id)}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </Command.Item>
          ))}
        </Command.Group>
      )}

      {/* Recent Searches */}
      {recentSearches.length > 0 && !isSearchMode && (
        <Command.Group heading="Recent Searches">
          {recentSearches.map((term) => (
            <Command.Item
              key={`recent-${term}`}
              value={`recent-${term}`}
              onSelect={() => setSearch(term)}
              className="flex items-center gap-2 px-4 py-3 cursor-pointer rounded-sm hover:bg-accent data-[selected=true]:bg-accent"
            >
              <History className="h-4 w-4 text-muted-foreground" />
              <span>{term}</span>
            </Command.Item>
          ))}
        </Command.Group>
      )}

      {/* Navigation Commands */}
      {!isSearchMode && (
        <>
          {[navigationCommands, quickAddCommands, helpCommands].map((group) => (
            <Command.Group key={group.heading} heading={group.heading}>
              {group.commands.map((cmd) => (
                <Command.Item
                  key={cmd.id}
                  value={cmd.id}
                  keywords={cmd.keywords}
                  onSelect={() => cmd.action()}
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer rounded-sm hover:bg-accent data-[selected=true]:bg-accent"
                >
                  {cmd.icon && <span className="text-muted-foreground">{cmd.icon}</span>}
                  <span className="flex-1">{cmd.label}</span>
                  {cmd.shortcut && (
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </>
      )}

      {/* Search Results */}
      {isSearchMode && (
        <>
          {isPending && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {results && (
            <>
              {results.tasks.length > 0 && (
                <Command.Group heading="Tasks">
                  {results.tasks.map((task) => (
                    <Command.Item
                      key={`task-${task.id}`}
                      value={`task-${task.id}-${task.title}`}
                      onSelect={() => handleSelect(task.url, search)}
                      className="flex items-center gap-2 px-4 py-3 cursor-pointer rounded-sm hover:bg-accent data-[selected=true]:bg-accent"
                    >
                      <CheckSquare className="h-4 w-4 text-muted-foreground" />
                      <span>{task.title}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.journals.length > 0 && (
                <Command.Group heading="Journals">
                  {results.journals.map((journal) => (
                    <Command.Item
                      key={`journal-${journal.id}`}
                      value={`journal-${journal.id}-${journal.title}`}
                      onSelect={() => handleSelect(journal.url, search)}
                      className="flex items-center gap-2 px-4 py-3 cursor-pointer rounded-sm hover:bg-accent data-[selected=true]:bg-accent"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{journal.title}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.media.length > 0 && (
                <Command.Group heading="Media">
                  {results.media.map((item) => (
                    <Command.Item
                      key={`media-${item.id}`}
                      value={`media-${item.id}-${item.title}`}
                      onSelect={() => handleSelect(item.url, search)}
                      className="flex items-center gap-2 px-4 py-3 cursor-pointer rounded-sm hover:bg-accent data-[selected=true]:bg-accent"
                    >
                      <Film className="h-4 w-4 text-muted-foreground" />
                      <span>{item.title}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.parks.length > 0 && (
                <Command.Group heading="Parks">
                  {results.parks.map((park) => (
                    <Command.Item
                      key={`park-${park.id}`}
                      value={`park-${park.id}-${park.title}`}
                      onSelect={() => handleSelect(park.url, search)}
                      className="flex items-center gap-2 px-4 py-3 cursor-pointer rounded-sm hover:bg-accent data-[selected=true]:bg-accent"
                    >
                      <MapIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{park.title}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.habits.length > 0 && (
                <Command.Group heading="Habits">
                  {results.habits.map((habit) => (
                    <Command.Item
                      key={`habit-${habit.id}`}
                      value={`habit-${habit.id}-${habit.title}`}
                      onSelect={() => handleSelect(habit.url, search)}
                      className="flex items-center gap-2 px-4 py-3 cursor-pointer rounded-sm hover:bg-accent data-[selected=true]:bg-accent"
                    >
                      <Repeat className="h-4 w-4 text-muted-foreground" />
                      <span>{habit.title}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {!isPending &&
                results.tasks.length === 0 &&
                results.journals.length === 0 &&
                results.media.length === 0 &&
                results.parks.length === 0 &&
                results.habits.length === 0 && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No results found.
                  </div>
                )}
            </>
          )}
        </>
      )}
    </>
  );

  const renderShortcuts = () => (
    <Command.Group heading="Keyboard Shortcuts">
      <div className="px-4 py-2 space-y-2 text-sm">
        <div className="font-semibold text-foreground mb-2">Command Palette</div>
        <div className="flex items-center justify-between py-2">
          <span>Open command palette</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K / Ctrl+K
          </kbd>
        </div>
        <div className="flex items-center justify-between py-2">
          <span>Navigate up/down</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ↑ ↓
          </kbd>
        </div>
        <div className="flex items-center justify-between py-2">
          <span>Select item</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            Enter
          </kbd>
        </div>
        <div className="flex items-center justify-between py-2 mb-2">
          <span>Close palette</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            Esc
          </kbd>
        </div>

        <div className="font-semibold text-foreground mb-2 pt-4 border-t">Navigation (Press G then key)</div>
        <div className="flex items-center justify-between py-2">
          <span>Go to Calendar</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            G then C
          </kbd>
        </div>
        <div className="flex items-center justify-between py-2">
          <span>Go to Tasks</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            G then T
          </kbd>
        </div>
        <div className="flex items-center justify-between py-2">
          <span>Go to Habits</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            G then H
          </kbd>
        </div>
        <div className="flex items-center justify-between py-2">
          <span>Go to Media</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            G then M
          </kbd>
        </div>
        <div className="flex items-center justify-between py-2">
          <span>Go to Journals</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            G then J
          </kbd>
        </div>
        <div className="flex items-center justify-between py-2">
          <span>Go to Parks</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            G then P
          </kbd>
        </div>
        <div className="flex items-center justify-between py-2">
          <span>Go to Exercise</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            G then E
          </kbd>
        </div>
        <div className="flex items-center justify-between py-2">
          <span>Go to Settings</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            G then S
          </kbd>
        </div>
      </div>
    </Command.Group>
  );

  return (
    <>
      {/* Backdrop overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Command Dialog */}
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global Command Menu"
        className={cn(
          "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-lg border bg-popover p-0 text-popover-foreground shadow-lg",
          "w-full max-w-2xl",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          className
        )}
      >
        <Command
          className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
          shouldFilter={!isSearchMode}
        >
          {/* Filters Section */}
          {currentPage === "home" && (
            <div className="flex flex-col gap-2 p-3 border-b bg-muted/10">
              <div className="flex items-center gap-2 overflow-x-auto">
                <Tabs
                  value={filters.types?.[0] || "all"}
                  onValueChange={(val) =>
                    handleFilterChange({ ...filters, types: val === "all" ? [] : [val] })
                  }
                  className="w-full"
                >
                  <TabsList className="h-8">
                    <TabsTrigger value="all" className="text-xs h-7 cursor-pointer">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="task" className="text-xs h-7 cursor-pointer">
                      Tasks
                    </TabsTrigger>
                    <TabsTrigger value="journal" className="text-xs h-7 cursor-pointer">
                      Journals
                    </TabsTrigger>
                    <TabsTrigger value="media" className="text-xs h-7 cursor-pointer">
                      Media
                    </TabsTrigger>
                    <TabsTrigger value="park" className="text-xs h-7 cursor-pointer">
                      Parks
                    </TabsTrigger>
                    <TabsTrigger value="habit" className="text-xs h-7 cursor-pointer">
                      Habits
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
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
                    className="h-8 w-8"
                    onClick={clearFilters}
                    title="Clear filters"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Popover open={saveOpen} onOpenChange={setSaveOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Save Search">
                      <Save className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 p-3" align="end">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="text-xs font-medium">
                        Save Search
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="name"
                          value={saveName}
                          onChange={(e) => setSaveName(e.target.value)}
                          placeholder="Name..."
                          className="h-8 text-xs"
                        />
                        <Button size="sm" className="h-8" onClick={handleSaveSearch}>
                          Save
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Search Input */}
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Type a command or search..."
              value={search}
              onValueChange={setSearch}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Command List */}
          <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            {currentPage === "home" && renderHome()}
            {currentPage === "shortcuts" && renderShortcuts()}
          </Command.List>
        </Command>
      </Command.Dialog>
    </>
  );
}
