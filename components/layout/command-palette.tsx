"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useDebounce } from "@/hooks/use-debounce";
import { searchGlobal, type SearchResults, type SearchFilters, type SearchResult } from "@/lib/actions/search";
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
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagAutocomplete } from "@/components/search/tag-autocomplete";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileCommandPalette } from "./mobile-command-palette";

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
  const [isMobile, setIsMobile] = React.useState(false);
  const router = useRouter();

  // Mobile detection
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement ||
          (e.target instanceof HTMLElement && e.target.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        setOpen(true);
        setPages(["home", "shortcuts"]);
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
        icon: <span className="material-symbols-outlined">home</span>,
        action: () => navigate("/home"),
      },
      {
        id: "nav-calendar",
        label: "Calendar",
        keywords: ["calendar", "date", "schedule"],
        icon: <span className="material-symbols-outlined">calendar_today</span>,
        action: () => navigate("/calendar"),
      },
      {
        id: "nav-tasks",
        label: "Tasks",
        keywords: ["tasks", "todo", "checklist"],
        icon: <span className="material-symbols-outlined">checklist</span>,
        action: () => navigate("/tasks"),
      },
      {
        id: "nav-habits",
        label: "Habits",
        keywords: ["habits", "tracking", "routine"],
        icon: <span className="material-symbols-outlined">repeat</span>,
        action: () => navigate("/habits"),
      },
      {
        id: "nav-journals",
        label: "Journals",
        keywords: ["journals", "diary", "writing"],
        icon: <span className="material-symbols-outlined">menu_book</span>,
        action: () => navigate("/journals"),
      },
      {
        id: "nav-media",
        label: "Media",
        keywords: ["media", "movies", "books", "tv", "games"],
        icon: <span className="material-symbols-outlined">movie</span>,
        action: () => navigate("/media"),
      },
      {
        id: "nav-parks",
        label: "Parks",
        keywords: ["parks", "national", "travel"],
        icon: <span className="material-symbols-outlined">park</span>,
        action: () => navigate("/parks"),
      },
      {
        id: "nav-exercise",
        label: "Exercise",
        keywords: ["exercise", "workout", "fitness"],
        icon: <span className="material-symbols-outlined">fitness_center</span>,
        action: () => navigate("/exercise"),
      },
      {
        id: "nav-finances",
        label: "Finances",
        keywords: ["finances", "money", "subscriptions", "savings", "debts", "budget"],
        icon: <span className="material-symbols-outlined">attach_money</span>,
        action: () => navigate("/finances"),
      },
      {
        id: "nav-year",
        label: "Year in Review",
        keywords: ["year", "review", "statistics", "stats"],
        icon: <span className="material-symbols-outlined">trending_up</span>,
        action: () => navigate(`/year/${new Date().getFullYear()}`),
      },
      {
        id: "nav-settings",
        label: "Settings",
        keywords: ["settings", "preferences", "config"],
        icon: <span className="material-symbols-outlined">settings</span>,
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
        icon: <span className="material-symbols-outlined">add</span>,
        action: () => navigate("/tasks?new=true"),
      },
      {
        id: "add-journal",
        label: "New Journal Entry",
        keywords: ["new", "create", "add", "journal", "diary"],
        icon: <span className="material-symbols-outlined">add</span>,
        action: () => navigate("/journals/new"),
      },
      {
        id: "add-media",
        label: "Add Media",
        keywords: ["new", "create", "add", "media", "movie", "book"],
        icon: <span className="material-symbols-outlined">add</span>,
        action: () => navigate("/media/new"),
      },
      {
        id: "add-park",
        label: "Add Park",
        keywords: ["new", "create", "add", "park", "national"],
        icon: <span className="material-symbols-outlined">add</span>,
        action: () => navigate("/parks/new"),
      },
    ],
  };

  // Get current page content
  const currentPage = pages[pages.length - 1];

  // Check if we're in search mode (has search query or filters)
  const isSearchMode = search.length > 0 || hasActiveFilters;

  const renderHome = () => (
    <div className="space-y-10 py-6 px-8">
      {/* Recent Inquiries (Combined Recents + Saved) */}
      {(recentSearches.length > 0 || savedSearches.length > 0) && !isSearchMode && (
        <section>
          <h3 className="text-[10px] font-bold text-media-secondary uppercase tracking-[0.2em] mb-6 px-1">Recent Inquiries</h3>
          <div className="space-y-2">
            {savedSearches.map((savedSearch) => (
              <div
                key={`saved-${savedSearch.id}`}
                onClick={() => handleSelectSavedSearch(savedSearch)}
                className="group flex items-center justify-between p-4 rounded-xl hover:bg-media-surface-container-low transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-media-surface-container-highest flex items-center justify-center text-media-primary">
                    <span className="material-symbols-outlined">save</span>
                  </div>
                  <div>
                    <p className="font-bold text-media-primary tracking-tight">Saved: {savedSearch.name}</p>
                    <p className="text-xs text-media-on-surface-variant line-clamp-1">{savedSearch.query || "No query"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-media-outline-variant">north_west</span>
                  <button
                    onClick={(e) => handleDeleteSavedSearch(e, savedSearch.id)}
                    className="cursor-pointer p-1 hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            ))}
            {recentSearches.map((term) => (
              <div
                key={`recent-${term}`}
                onClick={() => setSearch(term)}
                className="group flex items-center justify-between p-4 rounded-xl hover:bg-media-surface-container-low transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-media-surface-container-highest flex items-center justify-center text-media-primary">
                    <span className="material-symbols-outlined">history</span>
                  </div>
                  <div>
                    <p className="font-bold text-media-primary tracking-tight">{term}</p>
                    <p className="text-xs text-media-on-surface-variant">Recent search</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-media-outline-variant opacity-0 group-hover:opacity-100 transition-opacity">north_west</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Suggested Results Grid */}
      {isSearchMode && (
        <section>
          <h3 className="text-[10px] font-bold text-media-secondary uppercase tracking-[0.2em] mb-6 px-1">
            {isPending ? "Searching..." : "Suggested for you"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results && Object.entries(results).map(([type, items]) => 
              items.map((item: SearchResult) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item.url, search)}
                  className="relative overflow-hidden rounded-xl bg-media-surface-container-lowest p-5 group cursor-pointer kinetic-hover"
                >
                  <div className="flex gap-4 items-start text-left">
                    {item.image ? (
                      <img 
                        alt={item.title} 
                        className="w-16 h-16 rounded-lg object-cover shadow-sm bg-media-surface-container"
                        src={item.image} 
                      />
                    ) : (
                      <div className={cn(
                        "w-16 h-16 rounded-lg flex items-center justify-center text-3xl",
                        item.type === 'habit' ? "bg-media-primary-fixed text-media-on-primary-fixed-variant" :
                        item.type === 'journal' ? "bg-media-secondary-fixed text-media-on-secondary-container" :
                        item.type === 'task' ? "bg-media-surface-container-high text-media-primary" :
                        "bg-media-surface-container-high text-media-primary"
                      )}>
                        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {item.type === 'habit' ? 'repeat' :
                           item.type === 'journal' ? 'menu_book' :
                           item.type === 'task' ? 'check_circle' :
                           item.type === 'media' ? 'movie' :
                           item.type === 'park' ? 'park' : 'search'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <span className="inline-block px-2 py-0.5 rounded bg-media-tertiary-fixed text-[9px] font-bold text-media-on-tertiary-fixed uppercase mb-2">
                        {item.type}
                      </span>
                      <p className="font-bold text-media-primary text-sm leading-tight mb-1">{item.title}</p>
                      <p className="text-xs text-media-on-surface-variant line-clamp-1">
                        {item.description || (item.date ? `Dated: ${item.date}` : 'View details')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {results && Object.values(results).every(arr => arr.length === 0) && !isPending && (
            <div className="py-20 text-center text-sm text-media-on-surface-variant font-medium">
              No results found for &quot;{search}&quot;
            </div>
          )}
        </section>
      )}

      {/* Navigation Groups when no search */}
      {!isSearchMode && (
        <section>
          <h3 className="text-[10px] font-bold text-media-secondary uppercase tracking-[0.2em] mb-6 px-1">Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[...navigationCommands.commands, ...quickAddCommands.commands].map((cmd) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className="cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl bg-media-surface-container-lowest border border-media-outline-variant/10 hover:bg-media-primary-fixed-dim transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-media-surface-container flex items-center justify-center text-media-primary mb-3 group-hover:bg-white/50 transition-colors">
                  {cmd.icon}
                </div>
                <span className="text-xs font-bold text-media-primary">{cmd.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );

  const renderShortcuts = () => (
    <div className="py-6 px-8 space-y-8">
      <section>
        <h3 className="text-[10px] font-bold text-media-secondary uppercase tracking-[0.2em] mb-6 px-1">Keyboard Shortcuts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-media-primary mb-2">Command Palette</h4>
            {[
              { label: "Open search", key: "⌘K / Ctrl+K" },
              { label: "Open shortcuts", key: "?" },
              { label: "Navigate", key: "↑ ↓" },
              { label: "Select", key: "Enter" },
              { label: "Close", key: "Esc" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-1">
                <span className="text-[12px] text-media-on-surface-variant font-medium">{item.label}</span>
                <kbd className="bg-media-surface-container-highest px-1.5 py-0.5 rounded text-[10px] font-bold text-media-primary border-b-2 border-media-primary/20">{item.key}</kbd>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-media-primary mb-2">Navigation (G + Path)</h4>
            {[
              { label: "Calendar", key: "G then C" },
              { label: "Tasks", key: "G then T" },
              { label: "Habits", key: "G then H" },
              { label: "Media", key: "G then M" },
              { label: "Settings", key: "G then S" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-1">
                <span className="text-[12px] text-media-on-surface-variant font-medium">{item.label}</span>
                <kbd className="bg-media-surface-container-highest px-1.5 py-0.5 rounded text-[10px] font-bold text-media-primary border-b-2 border-media-primary/20">{item.key}</kbd>
              </div>
            ))}
            <button 
              onClick={() => setPages(["home"])}
              className="cursor-pointer mt-6 w-full py-2 bg-media-primary text-media-on-primary rounded-lg text-xs font-bold kinetic-hover"
            >
              Back to Home
            </button>
          </div>
        </div>
      </section>
    </div>
  );

  // Use mobile version on mobile devices
  if (isMobile) {
    return <MobileCommandPalette open={open} onOpenChange={setOpen} />;
  }

  return (
    <>
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global Command Menu"
        className={cn(
          "fixed left-[50%] top-[50%] z-[60] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-xl bg-media-surface-container shadow-2xl shadow-media-primary/10",
          "w-full max-w-3xl flex flex-col max-h-[870px] font-lexend",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          className
        )}
      >
        {/* Backdrop integrated with Dialog for better control */}
        <div className="absolute inset-x-0 -top-full h-full bg-media-primary/40 backdrop-blur-xl -z-10" />

        <Command 
          className="flex-1 flex flex-col min-h-0"
          shouldFilter={!isSearchMode}
        >
          {/* Header Section */}
          <div className="px-8 pt-8 pb-6 bg-media-surface-container-low border-b border-media-outline-variant/5">
            <div className="flex items-center gap-4 relative">
              <span className="material-symbols-outlined text-media-primary text-3xl">search</span>
              <Command.Input
                placeholder="Search your ecosystem..."
                value={search}
                onValueChange={setSearch}
                autoFocus
                className="w-full bg-transparent border-none focus:ring-0 text-2xl font-bold text-media-primary placeholder-media-primary/20 py-2 outline-none"
              />
              <div className="flex items-center gap-2 bg-media-surface-container-highest px-3 py-1.5 rounded-lg border-b-2 border-media-secondary/20">
                <span className="text-[10px] font-bold text-media-on-surface-variant tracking-widest whitespace-nowrap uppercase">CMD + K</span>
              </div>
            </div>

            {/* Filter Category Chips */}
            <div className="flex flex-wrap gap-3 mt-8 overflow-x-auto no-scrollbar">
              <button 
                onClick={clearFilters}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-bold tracking-tight kinetic-hover transition-all shrink-0",
                  !hasActiveFilters ? "bg-media-secondary text-media-on-secondary" : "bg-media-surface-container-highest text-media-on-surface-variant hover:bg-media-primary-fixed-dim"
                )}
              >
                All
              </button>
              {[
                { id: 'task', label: 'Tasks' },
                { id: 'journal', label: 'Journals' },
                { id: 'media', label: 'Media' },
                { id: 'park', label: 'Parks' },
                { id: 'habit', label: 'Habits' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleFilterChange({ ...filters, types: [cat.id] })}
                  className={cn(
                    "px-6 py-2 rounded-full text-sm font-bold tracking-tight kinetic-hover transition-all shrink-0",
                    filters.types?.[0] === cat.id ? "bg-media-secondary text-media-on-secondary" : "bg-media-surface-container-highest text-media-on-surface-variant hover:bg-media-primary-fixed-dim"
                  )}
                >
                  {cat.label}
                </button>
              ))}
              
              {/* Tag Search Popover */}
              <div className="ml-auto flex items-center gap-2">
                <TagAutocomplete
                  selectedTags={filters.tags || []}
                  onTagsChange={(tags) => handleFilterChange({ ...filters, tags })}
                />
                <Popover open={saveOpen} onOpenChange={setSaveOpen}>
                  <PopoverTrigger asChild>
                    <button className="cursor-pointer p-2 rounded-full bg-media-surface-container-highest text-media-on-surface-variant hover:text-media-primary transition-colors">
                      <span className="material-symbols-outlined text-sm">save</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 p-4 rounded-xl border-media-outline-variant/10 shadow-xl" align="end">
                    <div className="grid gap-3">
                      <Label htmlFor="name" className="text-[10px] font-bold text-media-secondary uppercase tracking-[0.2em]">
                        Save Search
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="name"
                          value={saveName}
                          onChange={(e) => setSaveName(e.target.value)}
                          placeholder="Search name..."
                          className="h-9 text-xs rounded-lg border-media-outline-variant/20 focus:border-media-primary transition-all"
                        />
                        <Button size="sm" className="h-9 bg-media-primary text-media-on-primary rounded-lg font-bold" onClick={handleSaveSearch}>
                          Save
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <Command.List className="flex-1 overflow-y-auto no-scrollbar max-h-[600px]">
            <Command.Empty className="py-20 text-center text-sm text-media-on-surface-variant font-medium">
              Start typing to see results...
            </Command.Empty>
            {currentPage === "home" && renderHome()}
            {currentPage === "shortcuts" && renderShortcuts()}
          </Command.List>

          {/* Keyboard Shortcuts Footer */}
          <div className="px-8 py-5 bg-media-surface-container-highest/30 flex items-center justify-between border-t border-media-outline-variant/10">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <kbd className="bg-media-surface-container-highest px-1.5 py-0.5 rounded text-[10px] font-bold text-media-primary border-b-2 border-media-primary/20">ESC</kbd>
                <span className="text-[10px] text-media-on-surface-variant font-semibold tracking-wide">to close</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-media-surface-container-highest px-1.5 py-0.5 rounded text-[10px] font-bold text-media-primary border-b-2 border-media-primary/20">↑↓</kbd>
                <span className="text-[10px] text-media-on-surface-variant font-semibold tracking-wide">to navigate</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-media-surface-container-highest px-1.5 py-0.5 rounded text-[10px] font-bold text-media-primary border-b-2 border-media-primary/20">ENTER</kbd>
                <span className="text-[10px] text-media-on-surface-variant font-semibold tracking-wide">to select</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-media-primary/40">
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase">Kinetic Search</span>
            </div>
          </div>
        </Command>
      </Command.Dialog>

      {/* Backdrop overlay for focus */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
