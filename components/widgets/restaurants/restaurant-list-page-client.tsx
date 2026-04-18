'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import type { Restaurant } from '@/lib/db/restaurants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface RestaurantListPageClientProps {
  restaurants: (Restaurant & { visitCount: number; lastVisitDate: string | null })[];
}

export function RestaurantListPageClient({ restaurants }: RestaurantListPageClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<number | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [yearFilter, setYearFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Extract unique values for filters
  const cuisines = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach(r => {
      if (r.cuisine) set.add(r.cuisine);
    });
    return Array.from(set).sort();
  }, [restaurants]);

  const years = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach(r => {
      if (r.lastVisitDate) {
        const year = new Date(r.lastVisitDate).getFullYear().toString();
        set.add(year);
      }
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [restaurants]);

  // Formatting date for "Visited Oct 2023" style
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  };

  const getPlaceholder = (cuisine: string | null) => {
    const c = (cuisine || 'restaurant').toLowerCase();
    if (c.includes('sushi') || c.includes('japanese')) return 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=1000';
    if (c.includes('italian') || c.includes('pizza')) return 'https://images.unsplash.com/photo-1551183053-bf91e1d81141?auto=format&fit=crop&q=80&w=1000';
    if (c.includes('burger') || c.includes('steak')) return 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=1000';
    if (c.includes('cafe') || c.includes('coffee')) return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=1000';
    if (c.includes('mexican') || c.includes('taco')) return 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=1000';
    return 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1000';
  };

  // Archive filtering
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const matchesSearch =
        searchTerm === '' ||
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (restaurant.cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (restaurant.city?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (restaurant.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesCuisine = !cuisineFilter || restaurant.cuisine === cuisineFilter;
      const matchesPrice = !priceFilter || restaurant.price_range === priceFilter;
      const matchesRating = !ratingFilter || (restaurant.rating && Math.floor(restaurant.rating / 2) >= ratingFilter);
      const matchesYear = !yearFilter || (restaurant.lastVisitDate && new Date(restaurant.lastVisitDate).getFullYear().toString() === yearFilter);

      return matchesSearch && matchesCuisine && matchesPrice && matchesRating && matchesYear;
    });
  }, [restaurants, searchTerm, cuisineFilter, priceFilter, ratingFilter, yearFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
  const paginatedRestaurants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRestaurants.slice(start, start + itemsPerPage);
  }, [filteredRestaurants, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-media-background font-lexend selection:bg-media-secondary selection:text-media-on-secondary">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-16">
          <nav className="mb-8">
            <Link 
              className="inline-flex items-center text-media-secondary text-xs font-bold uppercase tracking-widest hover:translate-x-[-4px] transition-transform" 
              href="/restaurants"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Gourmet Discoveries
            </Link>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-6xl md:text-8xl font-black text-media-primary tracking-tighter leading-none mb-4">
                The Culinary<br />Archive
              </h1>
              <p className="text-media-on-surface-variant font-medium tracking-wide flex items-center">
                <span className="w-12 h-[1px] bg-media-secondary mr-4"></span>
                {restaurants.length} TOTAL ENTRIES IN YOUR PERSONAL CURATION
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-12 bg-media-surface-container-low p-2 rounded-xl flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-media-on-surface-variant w-5 h-5" />
            <input 
              className="w-full bg-media-surface-container-lowest border-none py-6 pl-16 pr-8 rounded-lg focus:ring-2 focus:ring-media-secondary/20 transition-all text-lg placeholder:text-media-on-surface-variant/40 outline-none" 
              placeholder="Search your culinary history..." 
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto px-2 md:px-0">
            <button 
              className={cn(
                "whitespace-nowrap px-6 py-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors",
                (!cuisineFilter && !priceFilter && !ratingFilter && !yearFilter) ? "bg-media-primary text-media-on-primary" : "bg-media-surface-container-highest text-media-on-surface-variant hover:bg-media-surface-container-high"
              )}
              onClick={() => {
                setCuisineFilter(null);
                setPriceFilter(null);
                setRatingFilter(null);
                setYearFilter(null);
                setCurrentPage(1);
              }}
            >
              All
            </button>

            <Popover>
              <PopoverTrigger asChild>
                <button 
                  className={cn(
                    "whitespace-nowrap px-6 py-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors",
                    cuisineFilter ? "bg-media-primary text-media-on-primary" : "bg-media-surface-container-highest text-media-on-surface-variant hover:bg-media-surface-container-high"
                  )}
                >
                  {cuisineFilter || 'Cuisine'}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 bg-media-surface-container-lowest border-media-outline-variant/20 rounded-xl" align="end">
                <div className="flex flex-col gap-1 max-h-64 overflow-y-auto no-scrollbar">
                  {cuisines.map(c => (
                    <button
                      key={c}
                      onClick={() => {
                        setCuisineFilter(cuisineFilter === c ? null : c);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "text-left px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors",
                        cuisineFilter === c ? "bg-media-secondary text-media-on-secondary" : "hover:bg-media-surface-container-low text-media-on-surface-variant"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                  {cuisines.length === 0 && <p className="text-[10px] text-media-on-surface-variant/50 p-2 font-bold uppercase tracking-widest">No Cuisines</p>}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <button 
                  className={cn(
                    "whitespace-nowrap px-6 py-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors",
                    priceFilter ? "bg-media-primary text-media-on-primary" : "bg-media-surface-container-highest text-media-on-surface-variant hover:bg-media-surface-container-high"
                  )}
                >
                  {priceFilter ? '$'.repeat(priceFilter) : 'Price Range'}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-2 bg-media-surface-container-lowest border-media-outline-variant/20 rounded-xl" align="end">
                <div className="flex flex-col gap-1">
                  {[1, 2, 3, 4].map(p => (
                    <button
                      key={p}
                      onClick={() => {
                        setPriceFilter(priceFilter === p ? null : p);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "text-left px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors",
                        priceFilter === p ? "bg-media-secondary text-media-on-secondary" : "hover:bg-media-surface-container-low text-media-on-surface-variant"
                      )}
                    >
                      {'$'.repeat(p)}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <button 
                  className={cn(
                    "whitespace-nowrap px-6 py-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors",
                    ratingFilter ? "bg-media-primary text-media-on-primary" : "bg-media-surface-container-highest text-media-on-surface-variant hover:bg-media-surface-container-high"
                  )}
                >
                  {ratingFilter ? `${ratingFilter}+ Stars` : 'Rating'}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-2 bg-media-surface-container-lowest border-media-outline-variant/20 rounded-xl" align="end">
                <div className="flex flex-col gap-1">
                  {[5, 4, 3, 2, 1].map(r => (
                    <button
                      key={r}
                      onClick={() => {
                        setRatingFilter(ratingFilter === r ? null : r);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "text-left px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors",
                        ratingFilter === r ? "bg-media-secondary text-media-on-secondary" : "hover:bg-media-surface-container-low text-media-on-surface-variant"
                      )}
                    >
                      {r}+ Stars
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <button 
                  className={cn(
                    "whitespace-nowrap px-6 py-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors",
                    yearFilter ? "bg-media-primary text-media-on-primary" : "bg-media-surface-container-highest text-media-on-surface-variant hover:bg-media-surface-container-high"
                  )}
                >
                  {yearFilter || 'Year'}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-2 bg-media-surface-container-lowest border-media-outline-variant/20 rounded-xl" align="end">
                <div className="flex flex-col gap-1 max-h-64 overflow-y-auto no-scrollbar">
                  {years.map(y => (
                    <button
                      key={y}
                      onClick={() => {
                        setYearFilter(yearFilter === y ? null : y);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "text-left px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors",
                        yearFilter === y ? "bg-media-secondary text-media-on-secondary" : "hover:bg-media-surface-container-low text-media-on-surface-variant"
                      )}
                    >
                      {y}
                    </button>
                  ))}
                  {years.length === 0 && <p className="text-[10px] text-media-on-surface-variant/50 p-2 font-bold uppercase tracking-widest">No Dates</p>}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* List of Restaurants */}
        <div className="space-y-24">
          {paginatedRestaurants.map((restaurant) => (
            <article key={restaurant.id} className="flex flex-col group border-b border-media-surface-variant/20 pb-20 last:border-0">
              <Link href={`/restaurants/${restaurant.slug}`} className="block">
                <div className="w-full h-[500px] overflow-hidden rounded-xl bg-media-surface-container-high relative mb-12">
                  <img 
                    alt={restaurant.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    src={restaurant.poster || getPlaceholder(restaurant.cuisine)} 
                  />
                  {restaurant.lastVisitDate && (
                    <div className={cn(
                      "absolute top-6 left-6 px-4 py-1 text-[10px] font-black uppercase tracking-widest",
                      restaurant.status === 'visited' ? "bg-media-secondary text-media-on-secondary" : "bg-media-primary text-media-on-primary"
                    )}>
                      {restaurant.status === 'visited' ? 'Visited' : 'Wishlist'} {formatDate(restaurant.lastVisitDate)}
                    </div>
                  )}
                </div>
              </Link>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
                <div>
                  <Link href={`/restaurants/${restaurant.slug}`}>
                    <h2 className="text-5xl font-black text-media-primary tracking-tighter group-hover:text-media-secondary transition-colors leading-tight mb-2">
                      {restaurant.name}
                    </h2>
                  </Link>
                  <div className="flex items-center gap-4">
                    <p className="text-media-secondary font-bold tracking-[0.3em]">
                      {'$'.repeat(restaurant.price_range || 1)}
                    </p>
                    <span className="text-media-outline-variant/50">|</span>
                    <p className="text-lg font-black text-media-primary">
                      {restaurant.rating ? (restaurant.rating / 2).toFixed(1) : '—'} <span className="text-sm opacity-40">/ 5</span>
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-media-secondary text-xs font-bold tracking-widest uppercase mb-4">
                    {restaurant.cuisine || 'Restaurant'} • {[restaurant.city, restaurant.state].filter(Boolean).join(', ') || 'Global Destination'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {/* Placeholder for tags if they existed, or use cuisine fragments */}
                    {restaurant.favorite && (
                      <span className="px-4 py-1 rounded-full border border-media-outline-variant text-[10px] uppercase font-bold tracking-widest bg-media-secondary/10 text-media-secondary">
                        Top Favorite
                      </span>
                    )}
                    {restaurant.status === 'want_to_try' && (
                      <span className="px-4 py-1 rounded-full border border-media-outline-variant text-[10px] uppercase font-bold tracking-widest">
                        To Visit
                      </span>
                    )}
                    <span className="px-4 py-1 rounded-full border border-media-outline-variant text-[10px] uppercase font-bold tracking-widest">
                      {restaurant.visitCount} Visits
                    </span>
                  </div>
                </div>
                <div>
                  <p className={cn(
                    "text-media-on-surface-variant text-lg leading-relaxed",
                    restaurant.notes && restaurant.notes.length < 200 && "italic"
                  )}>
                    {restaurant.notes || `No detailed notes available for ${restaurant.name}. Explore this culinary destination to discover its unique flavors and atmosphere.`}
                  </p>
                </div>
              </div>
            </article>
          ))}

          {filteredRestaurants.length === 0 && (
            <div className="text-center py-32 bg-media-surface-container-low rounded-3xl border-2 border-dashed border-media-outline-variant/20">
              <span className="material-symbols-outlined text-6xl text-media-on-surface-variant/20 mb-6 font-variation-settings-'FILL' 0">search_off</span>
              <p className="text-xl text-media-on-surface-variant font-light italic">No matching culinary memories found.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-32 py-12 border-t border-media-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <button 
                className="w-12 h-12 rounded-full border border-media-outline flex items-center justify-center hover:bg-media-primary hover:text-media-on-primary transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-inherit"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold tracking-widest uppercase">
                PAGE {currentPage.toString().padStart(2, '0')} OF {totalPages.toString().padStart(2, '0')}
              </span>
              <button 
                className="w-12 h-12 rounded-full border border-media-outline flex items-center justify-center hover:bg-media-primary hover:text-media-on-primary transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-inherit"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button className="px-12 py-4 bg-media-primary text-media-on-primary rounded-lg text-xs font-bold uppercase tracking-[0.3em] hover:scale-105 transition-transform shadow-xl shadow-media-primary/10">
              Export Archive as PDF
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
