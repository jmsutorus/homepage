"use client";

import { useState, useMemo } from "react";
import { Search, X, ArrowLeft, BookOpen, ChevronDown } from "lucide-react";
import { ParkContent } from "@/lib/db/parks";
import { ParkListItemEditorial } from "./editorial/park-list-item-editorial";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ParksListClientProps {
  initialParks: ParkContent[];
}

export function ParksListClient({ initialParks }: ParksListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [activeYear, setActiveYear] = useState<string | null>(null);

  // Derive unique categories and years for filters
  const categories = useMemo(() => {
    return Array.from(new Set(initialParks.map((p) => p.category))).sort();
  }, [initialParks]);

  const years = useMemo(() => {
    return Array.from(
      new Set(
        initialParks
          .filter((p) => p.visited)
          .map((p) => new Date(p.visited!).getFullYear().toString())
      )
    ).sort((a, b) => b.localeCompare(a));
  }, [initialParks]);

  // Filtering Logic
  const filteredParks = useMemo(() => {
    return initialParks.filter((park) => {
      const matchesSearch =
        park.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        park.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        park.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = activeCategory ? park.category === activeCategory : true;
      const matchesRating = minRating ? (park.rating || 0) >= minRating : true;
      const matchesYear = activeYear ? (park.visited && new Date(park.visited).getFullYear().toString() === activeYear) : true;

      return matchesSearch && matchesCategory && matchesRating && matchesYear;
    });
  }, [initialParks, searchQuery, activeCategory, minRating, activeYear]);

  const resetFilters = () => {
    setSearchQuery("");
    setActiveCategory(null);
    setMinRating(null);
    setActiveYear(null);
  };

  return (
    <div className="min-h-screen bg-media-background font-lexend -mt-8 -mx-4 md:-mx-8 p-8 md:p-12">
      {/* Header Section */}
      <header className="mb-16 relative">
        <div className="max-w-4xl">
           <Link 
            href="/parks" 
            className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-media-on-surface-variant/40 hover:text-media-secondary transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Atlas
          </Link>
          <h1 className="text-6xl md:text-8xl font-black text-media-primary tracking-tighter leading-[0.9] mb-8">
            The Great <br/> <span className="text-media-secondary">Expedition</span>
          </h1>
          <p className="text-media-on-surface-variant text-lg max-w-xl leading-relaxed font-light italic opacity-80">
            A curated anthology of wild frontiers, ancient monoliths, and the quiet moments between the pines. Your personal journey through the American wilderness.
          </p>
        </div>
      </header>

      {/* Search & Filter Cluster */}
      <section className="mb-12 space-y-6">
        <div className="relative group max-w-2xl">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-media-outline" style={{ fontVariationSettings: "'opsz' 24" }}>search</span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-media-surface-container-low border-none rounded-xl py-5 pl-14 pr-6 focus:ring-2 focus:ring-media-secondary/20 focus:bg-media-surface-container-high transition-all outline-none text-media-on-surface font-medium text-lg placeholder:text-media-on-surface-variant/40" 
            placeholder="Search parks, memories, or states..." 
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-media-on-surface-variant/40 hover:text-media-primary"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-xs font-black uppercase tracking-widest text-media-on-surface-variant/60 mr-2">Filters:</span>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 4).map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={cn(
                  "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                  activeCategory === cat 
                    ? "bg-media-tertiary-fixed text-media-on-tertiary-fixed" 
                    : "bg-media-surface-container-highest text-media-on-surface-variant hover:bg-media-outline-variant/20"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-media-outline-variant/30 mx-2 hidden md:block" />

          {/* Rating Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className={cn(
                  "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                  minRating 
                    ? "bg-media-tertiary-fixed text-media-on-tertiary-fixed" 
                    : "bg-media-surface-container-highest text-media-on-surface-variant hover:bg-media-outline-variant/20"
                )}
              >
                Rating: {minRating ? `${(minRating / 2).toFixed(1)}+` : "All"}
                <ChevronDown className="w-3 h-3 opacity-40" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-white/95 dark:bg-media-surface-container-high/95 backdrop-blur-xl border-media-outline-variant/10 rounded-2xl shadow-2xl p-2 font-lexend">
               <DropdownMenuItem onClick={() => setMinRating(null)} className="rounded-xl text-xs font-bold uppercase tracking-widest py-3">All Ratings</DropdownMenuItem>
               <DropdownMenuItem onClick={() => setMinRating(10)} className="rounded-xl text-xs font-bold uppercase tracking-widest py-3">5.0 Only</DropdownMenuItem>
               <DropdownMenuItem onClick={() => setMinRating(9)} className="rounded-xl text-xs font-bold uppercase tracking-widest py-3">4.5+ Stars</DropdownMenuItem>
               <DropdownMenuItem onClick={() => setMinRating(8)} className="rounded-xl text-xs font-bold uppercase tracking-widest py-3">4.0+ Stars</DropdownMenuItem>
               <DropdownMenuItem onClick={() => setMinRating(7)} className="rounded-xl text-xs font-bold uppercase tracking-widest py-3">3.5+ Stars</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Year Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className={cn(
                  "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                  activeYear 
                    ? "bg-media-tertiary-fixed text-media-on-tertiary-fixed" 
                    : "bg-media-surface-container-highest text-media-on-surface-variant hover:bg-media-outline-variant/20"
                )}
              >
                Year: {activeYear || "All"}
                <ChevronDown className="w-3 h-3 opacity-40" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-white/95 dark:bg-media-surface-container-high/95 backdrop-blur-xl border-media-outline-variant/10 rounded-2xl shadow-2xl p-2 font-lexend max-h-64 overflow-y-auto">
               <DropdownMenuItem onClick={() => setActiveYear(null)} className="rounded-xl text-xs font-bold uppercase tracking-widest py-3">All Years</DropdownMenuItem>
               {years.map(year => (
                 <DropdownMenuItem key={year} onClick={() => setActiveYear(year)} className="rounded-xl text-xs font-bold uppercase tracking-widest py-3">{year}</DropdownMenuItem>
               ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button 
            onClick={resetFilters}
            className="cursor-pointer text-media-secondary text-xs font-bold uppercase tracking-widest ml-auto border-b border-media-secondary/30 pb-0.5 hover:text-media-primary transition-colors"
          >
            Reset All
          </button>
        </div>
      </section>

      {/* Editorial Grid of Parks */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {filteredParks.map((park) => (
          <ParkListItemEditorial key={park.id} park={park} />
        ))}
        
        {filteredParks.length === 0 && (
          <div className="col-span-full py-32 text-center bg-media-surface-container/10 rounded-[3rem] border border-dashed border-media-outline-variant/20">
             <Search className="w-16 h-16 mx-auto mb-6 text-media-on-surface-variant opacity-20" />
             <p className="text-media-on-surface-variant font-black uppercase tracking-widest text-sm">No landscapes found matching your search</p>
          </div>
        )}
      </div>

      {/* Empty State / Footer */}
      <footer className="mt-32 pt-24 border-t border-media-outline-variant/10 text-center">
        <div className="inline-block p-12 md:p-16 rounded-[3rem] bg-media-surface-container/20 max-w-xl shadow-inner border border-media-outline-variant/5">
          <BookOpen className="w-12 h-12 mx-auto mb-6 text-media-secondary opacity-40" />
          <h4 className="text-3xl font-black text-media-primary tracking-tighter mb-4 leading-none">Continue the Journal</h4>
          <p className="text-media-on-surface-variant text-lg leading-relaxed mb-10 font-light italic opacity-70">
            You&quot;ve recorded {initialParks.length} adventures so far. The horizon is calling for more. Ready to log your next discovery?
          </p>
          <Button asChild className="bg-media-primary text-white px-10 py-8 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-media-secondary hover:scale-105 transition-all shadow-2xl border-none cursor-pointer">
             <Link href="/parks/new">Plan New Expedition</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}
