'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search, Star, ArrowRight, Heart, Plus } from 'lucide-react';
import type { Restaurant } from '@/lib/db/restaurants';
import { RestaurantFormDialog } from './restaurant-form-dialog';
import { cn } from '@/lib/utils';
import { FloatingActionButton } from '@/components/ui/floating-action-button';

interface RestaurantsPageClientProps {
  restaurants: (Restaurant & { visitCount: number; lastVisitDate: string | null })[];
}

export function RestaurantsPageClient({ restaurants }: RestaurantsPageClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);

  // Spotlight logic: Highest recency (lastVisitDate), then rating
  const spotlightRestaurant = useMemo(() => {
    if (restaurants.length === 0) return null;
    return [...restaurants].sort((a, b) => {
      // Prio 1: Last Visit Date (Recency)
      const dateA = a.lastVisitDate ? new Date(a.lastVisitDate).getTime() : 0;
      const dateB = b.lastVisitDate ? new Date(b.lastVisitDate).getTime() : 0;
      if (dateB !== dateA) return dateB - dateA;
      
      // Prio 2: Rating
      const ratingA = a.rating ?? 0;
      const ratingB = b.rating ?? 0;
      return ratingB - ratingA;
    })[0];
  }, [restaurants]);

  // Featured (Gourmet Discoveries): Highest visitCount, then rating
  const featuredRestaurants = useMemo(() => {
    return [...restaurants]
      .filter(r => r.id !== spotlightRestaurant?.id)
      .sort((a, b) => {
        // Prio 1: Visit Count
        if (b.visitCount !== a.visitCount) return b.visitCount - a.visitCount;
        
        // Prio 2: Rating
        const ratingA = a.rating ?? 0;
        const ratingB = b.rating ?? 0;
        return ratingB - ratingA;
      })
      .slice(0, 4);
  }, [restaurants, spotlightRestaurant]);

  // Archive filtering
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const matchesSearch =
        searchTerm === '' ||
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (restaurant.cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (restaurant.city?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesStatus = statusFilter === 'all' || restaurant.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [restaurants, searchTerm, statusFilter]);

  const [showAllArchive, setShowAllArchive] = useState(false);

  const handleCreated = () => {
    setShowForm(false);
    router.refresh();
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

  const archiveItems = showAllArchive ? filteredRestaurants : filteredRestaurants.slice(0, 5);

  return (
    <main className="min-h-screen bg-media-background font-lexend selection:bg-media-secondary-fixed selection:text-media-on-secondary-fixed">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 pt-24">
        
        {/* Spotlight Hero Section */}
        {spotlightRestaurant && (
          <section className="relative h-[600px] lg:h-[700px] rounded-2xl overflow-hidden mb-32 editorial-shadow group">
            <img 
              alt={spotlightRestaurant.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
              src={spotlightRestaurant.poster || getPlaceholder(spotlightRestaurant.cuisine)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 lg:p-16 w-full lg:w-3/4">
              <div className="inline-flex items-center gap-2 bg-media-secondary text-media-on-secondary px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-8">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                Monthly Spotlight
              </div>
              <h2 className="text-5xl lg:text-8xl font-bold text-white tracking-tighter mb-6 leading-[0.9]">
                {spotlightRestaurant.name}
              </h2>
              <div className="flex flex-wrap items-center gap-6 mb-8 text-white/90">
                <span className="flex items-center gap-2 font-medium tracking-tight">
                  <Star className="w-5 h-5 text-media-secondary fill-current" />
                  {spotlightRestaurant.rating ? `${spotlightRestaurant.rating / 2} Rating` : 'No Rating'}
                </span>
                <span className="flex items-center gap-2 font-medium tracking-tight uppercase text-xs tracking-widest">
                  <span className="material-symbols-outlined text-[18px]">restaurant</span>
                  {spotlightRestaurant.cuisine || 'Restaurant'}
                </span>
                <span className="flex items-center gap-2 font-medium tracking-tight">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  {'$'.repeat(spotlightRestaurant.price_range || 1)}
                </span>
              </div>
              <p className="text-lg lg:text-xl text-white/80 max-w-2xl leading-relaxed mb-10 font-light line-clamp-2">
                {spotlightRestaurant.notes || `A curated selection from ${spotlightRestaurant.city || 'our journeys'}. Experience the unique flavors and atmosphere of ${spotlightRestaurant.name}.`}
              </p>
              <Link href={`/restaurants/${spotlightRestaurant.slug}`}>
                <Button className="bg-media-surface hover:bg-media-surface-bright text-media-primary px-10 py-6 rounded-xl font-bold kinetic-hover transition-all flex items-center gap-3 border-none">
                  View Feature <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* Gourmet Discoveries Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16 border-b border-media-outline-variant/30 pb-12">
          <div className="max-w-xl">
            <h3 className="text-4xl lg:text-5xl font-bold tracking-tighter text-media-primary mb-4">Gourmet Discoveries</h3>
            <p className="text-lg text-media-on-surface-variant font-light">
              Curated selections from our culinary journeys across the globe, featuring the finest establishments and hidden gems.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex gap-2 bg-media-surface-container-low p-2 rounded-xl">
              {['all', 'visited', 'want_to_try'].map((status) => (
                <button 
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                    statusFilter === status ? "bg-media-primary text-white shadow-md" : "text-media-on-surface-variant hover:text-media-primary"
                  )}
                >
                  {status === 'all' ? 'All' : status === 'visited' ? 'Visited' : 'Wishes'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {featuredRestaurants.length > 0 && (
          <section className="staggered-gap mb-16">
            {featuredRestaurants.map((restaurant, idx) => (
              <Link 
                key={restaurant.id} 
                href={`/restaurants/${restaurant.slug}`}
                className={cn(
                  "group cursor-pointer block", 
                  // If we have 4 items, we offset the second column (starting at idx 2)
                  idx === 2 && "lg:pt-20"
                )}
              >
                <div className="overflow-hidden rounded-xl mb-8 bg-media-surface-container shadow-sm group-hover:shadow-2xl transition-all duration-700">
                  <img 
                    alt={restaurant.name}
                    className={cn(
                      "w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110",
                      idx === 0 ? "min-h-[500px]" : idx === 1 ? "min-h-[550px]" : "min-h-[600px]"
                    )}
                    src={restaurant.poster || getPlaceholder(restaurant.cuisine)}
                  />
                </div>
                <div className="flex justify-between items-start px-2">
                  <div>
                    <p className="text-[12px] font-bold text-media-secondary uppercase tracking-[0.3em] mb-3">
                      {[restaurant.city, restaurant.state].filter(Boolean).join(', ') || 'Global Destination'}
                    </p>
                    <h4 className="text-3xl lg:text-4xl font-bold tracking-tight text-media-primary">{restaurant.name}</h4>
                    <p className="text-media-on-surface-variant text-lg mt-2 font-light">
                      {restaurant.cuisine || 'Contemporary'} • {'$'.repeat(restaurant.price_range || 1)}
                    </p>
                  </div>
                  {restaurant.rating && (
                    <div className="bg-media-surface-container-high px-5 py-2 rounded-full text-sm font-bold text-media-primary border border-media-outline-variant/30">
                      {restaurant.rating / 2} / 5
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </section>
        )}

        {/* Culinary Archive Section */}
        <section className="mt-16 max-w-5xl mx-auto">
          <div className="flex items-center gap-8 mb-20">
            <h3 className="text-3xl lg:text-4xl font-bold tracking-tighter text-media-primary whitespace-nowrap">The Culinary Archive</h3>
            <div className="h-[1px] flex-1 bg-media-outline-variant/40"></div>
            <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-media-on-surface-variant/50">
              {filteredRestaurants.length} Entries
            </div>
          </div>
          
          <div className="flex flex-col gap-16">
            {archiveItems.map((restaurant) => (
              <Link key={restaurant.id} href={`/restaurants/${restaurant.slug}`}>
                <div className="grid grid-cols-1 md:grid-cols-[400px_1fr] gap-12 group pb-16 border-b border-media-outline-variant/10 last:border-0">
                  <div className="h-64 overflow-hidden rounded-xl bg-media-surface-container-low editorial-shadow">
                    <img 
                      alt={restaurant.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src={restaurant.poster || getPlaceholder(restaurant.cuisine)}
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[11px] font-bold text-media-secondary uppercase tracking-widest">
                        {restaurant.visitCount > 0 ? (
                          <>
                            Visited {restaurant.visitCount} {restaurant.visitCount === 1 ? 'time' : 'times'}
                            {restaurant.lastVisitDate && ` • ${new Date(restaurant.lastVisitDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`}
                          </>
                        ) : 'Looking forward to visiting'}
                      </p>
                      {restaurant.favorite && <Heart className="w-4 h-4 text-media-secondary fill-current" />}
                    </div>
                    <h5 className="text-3xl font-bold text-media-primary mb-4 leading-tight group-hover:text-media-secondary transition-colors">
                      {restaurant.name}
                    </h5>
                    <p className="text-lg text-media-on-surface-variant font-light leading-relaxed mb-6 line-clamp-3">
                      {restaurant.notes || `${restaurant.name} in ${restaurant.city || 'unspecified location'}. A destination for ${restaurant.cuisine || 'fine dining'}.`}
                    </p>
                    <div className="flex items-center gap-6">
                      {restaurant.rating && (
                        <span className="text-sm font-bold text-media-primary">{restaurant.rating / 2} / 5 Rating</span>
                      )}
                      <span className="w-1.5 h-1.5 bg-media-outline-variant rounded-full"></span>
                      <span className="text-sm text-media-on-surface-variant font-medium">
                        {[restaurant.city, restaurant.state].filter(Boolean).join(', ') || 'Various Locations'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {!showAllArchive && filteredRestaurants.length > 5 && (
            <div className="mt-20 text-center">
              <Link 
                href="/restaurants/list"
                className="text-media-primary font-bold border-b-2 border-media-primary/20 hover:border-media-secondary transition-all pb-2 text-xl tracking-tight inline-block"
              >
                Explore Full Archive ({filteredRestaurants.length} Entries)
              </Link>
            </div>
          )}

          {!searchTerm && filteredRestaurants.length === 0 && (
            <div className="text-center py-32 bg-media-surface-container-lowest rounded-3xl border-2 border-dashed border-media-outline-variant/20">
              <span className="material-symbols-outlined text-6xl text-media-on-surface-variant/20 mb-6">restaurant</span>
              <p className="text-xl text-media-on-surface-variant font-light">Your archive is empty. Begin your journey.</p>
            </div>
          )}
        </section>
      </div>

      <footer className="bg-media-surface-container mt-48 py-32 px-6 lg:px-12 border-t border-media-outline-variant/10">
        <div className="max-w-4xl mx-auto text-center">
          <h6 className="text-xs font-bold text-media-secondary uppercase tracking-[0.4em] mb-10">The Editorial Ethos</h6>
          <p className="text-3xl lg:text-5xl font-bold tracking-tighter text-media-primary leading-[1.1] mb-12 italic">
            &quot;Gastronomy is the greatest of all arts, for it engages all five senses at once and leaves only the memory of a moment perfectly spent.&quot;
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-10 text-media-on-surface-variant/70 text-xs font-medium tracking-wide">
            <span>Est. 2021</span>
            <span className="hidden lg:block w-1.5 h-1.5 bg-media-outline-variant/40 rounded-full"></span>
            <span>Curated by The Collector</span>
            <span className="hidden lg:block w-1.5 h-1.5 bg-media-outline-variant/40 rounded-full"></span>
            <span>Global Edition</span>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <FloatingActionButton 
        onClick={() => setShowForm(true)}
        tooltipText="New Restaurant"
      />

      {/* Add Restaurant Dialog */}
      <RestaurantFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={handleCreated}
      />
    </main>
  );
}
