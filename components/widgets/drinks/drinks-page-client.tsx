'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wine, Search, Plus, Star, Heart, ArrowRight, Table as TableIcon, LayoutGrid, Filter } from 'lucide-react';
import type { Drink } from '@/lib/db/drinks';
import { DrinkFormDialog } from './drink-form-dialog';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PageTabsList } from '@/components/ui/page-tabs-list';

interface DrinksPageClientProps {
  drinks: (Drink & { logCount: number, lastLogDate: string | null })[];
}

export function DrinksPageClient({ drinks }: DrinksPageClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);

  // Featured Pour Logic: Highest rated in the last month, else highest of all time
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const oneMonthAgoStr = oneMonthAgo.toISOString().split('T')[0];

  const featuredDrinkRaw = drinks.length === 0 ? null : (() => {
    const recentDrinks = drinks.filter(d => d.lastLogDate && d.lastLogDate >= oneMonthAgoStr);
    if (recentDrinks.length > 0) {
      return recentDrinks.reduce((prev, current) => (prev.rating || 0) >= (current.rating || 0) ? prev : current);
    }
    return drinks.reduce((prev, current) => (prev.rating || 0) >= (current.rating || 0) ? prev : current);
  })();
  const featuredDrink = featuredDrinkRaw;

  // Recent Tastings Logic: 3 most recent logs (excluding featured)
  const recentTastings = [...drinks]
    .filter(d => d.lastLogDate && d.id !== featuredDrink?.id)
    .sort((a, b) => (b.lastLogDate || '').localeCompare(a.lastLogDate || ''))
    .slice(0, 3);

  // Filtered drinks for the archive
  const filteredDrinks = drinks.filter((drink) => {
    const matchesSearch =
      searchTerm === '' ||
      drink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (drink.producer?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (drink.type?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesType = typeFilter === 'all' || drink.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleCreated = () => {
    setShowForm(false);
    router.refresh();
  };


  return (
    <div className="min-h-screen bg-[var(--color-media-surface)] text-[var(--color-media-on-surface)] font-lexend selection:bg-[var(--color-media-secondary)]/30">
      <main className="pt-28 px-8 pb-20 max-w-7xl mx-auto space-y-24">
        
        {/* Hero Section: Featured Pour */}
        {featuredDrink && (
          <section className="relative group animate-in fade-in duration-1000">
            <Link href={`/drinks/${featuredDrink.slug}`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-2xl bg-[var(--color-media-primary)] text-[var(--color-media-on-primary)] shadow-2xl transition-all hover:shadow-primary/20">
                <div className="lg:col-span-7 h-[400px] lg:h-[550px] overflow-hidden">
                  <img
                    alt={featuredDrink.name}
                    className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                    src={featuredDrink.image_url || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop"}
                  />
                </div>
                <div className="lg:col-span-5 p-8 lg:p-14 flex flex-col justify-center space-y-8 relative">
                  <div className="space-y-3">
                    <span className="text-[var(--color-media-secondary)] font-bold uppercase tracking-widest text-xs">Featured Pour</span>
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">{featuredDrink.name}</h2>
                    {featuredDrink.producer && (
                      <p className="text-[var(--color-media-on-primary-container)] text-xl italic font-medium">{featuredDrink.producer}</p>
                    )}
                  </div>
                  
                  <p className="text-[var(--color-media-surface-variant)] text-lg leading-relaxed line-clamp-3">
                    {featuredDrink.notes || "A masterfully balanced profile with deep character and a lingering finish. One of your most exceptional tastings to date."}
                  </p>

                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center bg-[var(--color-media-secondary)]/20 px-5 py-2.5 rounded-xl border border-[var(--color-media-secondary)]/30 backdrop-blur-sm">
                      <Star className="w-5 h-5 text-[var(--color-media-secondary)] mr-2 fill-current" />
                      <span className="font-bold text-2xl text-[var(--color-media-on-secondary)]">{(featuredDrink.rating || 0).toFixed(1)}</span>
                      <span className="text-xs text-[var(--color-media-on-secondary)]/60 ml-1.5 mt-1 font-bold">/ 10</span>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                      Last Logged: {featuredDrink.lastLogDate ? new Date(featuredDrink.lastLogDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                    </div>
                  </div>

                  {/* Decorative element */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[var(--color-media-secondary)] opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity" />
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Immersive Gallery: Recent Tastings */}
        {recentTastings.length > 0 && (
          <section className="space-y-10">
            <div className="flex items-baseline justify-between border-b border-[var(--color-media-outline-variant)]/20 pb-6">
              <h3 className="text-3xl font-bold text-[var(--color-media-primary)] tracking-tight">Recent Tastings</h3>
              <button 
                onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
                className="cursor-pointer text-[var(--color-media-secondary)] font-bold text-xs uppercase tracking-widest flex items-center gap-2 group"
              >
                View Collection
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {recentTastings.map((drink, idx) => (
                <Link key={drink.id} href={`/drinks/${drink.slug}`} className={cn("group cursor-pointer", idx === 1)}>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--color-media-surface-container)] mb-8 shadow-sm">
                    <img
                      alt={drink.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      src={drink.image_url || "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=2157&auto=format&fit=crop"}
                    />
                    <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[var(--color-media-primary)] shadow-sm">
                      {drink.type || 'Reserve'}
                    </div>
                    <div className="absolute bottom-5 right-5 bg-[var(--color-media-primary)] text-white w-14 h-14 flex items-center justify-center rounded-full font-bold text-lg shadow-2xl ring-4 ring-white/10 group-hover:bg-[var(--color-media-secondary)] transition-colors duration-300">
                      {drink.rating || '-'}
                    </div>
                  </div>
                  <div className="space-y-1.5 px-3">
                    <h4 className="text-2xl font-bold text-[var(--color-media-primary)] group-hover:text-[var(--color-media-secondary)] transition-colors">{drink.name}</h4>
                    <p className="text-[var(--color-media-on-surface-variant)] font-medium text-sm flex items-center gap-2">
                      {drink.producer || 'Independent'} 
                      <span className="w-1 h-1 rounded-full bg-[var(--color-media-outline-variant)]" />
                      {drink.lastLogDate ? new Date(drink.lastLogDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Curated Archive: The Collection */}
        <section id="collection" className="space-y-12 pt-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4">
            <div className="space-y-3">
              <h3 className="text-3xl font-bold text-[var(--color-media-primary)] tracking-tight">The Collection</h3>
              <p className="text-[var(--color-media-on-surface-variant)] max-w-lg text-lg">
                An editorial archive of your liquid journey, sorted by character and memory.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-media-on-surface-variant)] group-focus-within:text-[var(--color-media-secondary)] transition-colors" />
                <input
                  type="text"
                  placeholder="Search archive..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[var(--color-media-surface-container-high)] text-[var(--color-media-on-surface)] pl-11 pr-6 py-3 rounded-xl text-sm font-medium w-full sm:w-64 focus:ring-2 focus:ring-[var(--color-media-secondary)]/30 outline-none transition-all"
                />
              </div>
              <div className="flex gap-2 p-1.5 bg-[var(--color-media-surface-container-high)] rounded-xl overflow-x-auto no-scrollbar">
                {['all', 'beer', 'wine', 'cocktail', 'spirit'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={cn(
                      "px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                      typeFilter === type 
                        ? "bg-[var(--color-media-primary)] text-white shadow-lg shadow-black/10" 
                        : "text-[var(--color-media-on-surface-variant)] hover:bg-[var(--color-media-surface-variant)]"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-media-surface-container-lowest)] rounded-3xl shadow-sm border border-[var(--color-media-outline-variant)]/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-media-outline-variant)]/20">
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[var(--color-media-on-surface-variant)]">Drink Name</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[var(--color-media-on-surface-variant)]">Type</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[var(--color-media-on-surface-variant)]">Brewery/Origin</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[var(--color-media-on-surface-variant)]">Rating</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[var(--color-media-on-surface-variant)] text-right">Date Logged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-media-outline-variant)]/10">
                  {filteredDrinks.map((drink) => (
                    <tr 
                      key={drink.id} 
                      onClick={() => router.push(`/drinks/${drink.slug}`)}
                      className="group cursor-pointer hover:bg-[var(--color-media-surface-container-low)] transition-colors"
                    >
                      <td className="px-8 py-7">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--color-media-surface-container)] flex-shrink-0 border border-[var(--color-media-outline-variant)]/10">
                            <img 
                              src={drink.image_url || "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=100&auto=format&fit=crop"} 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div>
                            <span className="block font-bold text-[var(--color-media-primary)] group-hover:text-[var(--color-media-secondary)] transition-colors text-lg">{drink.name}</span>
                            {drink.favorite && <span className="inline-flex items-center mt-1 text-[var(--color-media-secondary)]"><Heart className="w-3 h-3 fill-current mr-1" /> <span className="text-[10px] font-bold uppercase tracking-tighter">Essential</span></span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-7">
                        <span className="text-sm font-medium text-[var(--color-media-on-surface-variant)] capitalize bg-[var(--color-media-surface-container-high)] px-3 py-1 rounded-full">{drink.type || 'Other'}</span>
                      </td>
                      <td className="px-8 py-7">
                        <span className="text-sm font-medium text-[var(--color-media-on-surface)] underline decoration-[var(--color-media-outline-variant)]/30 underline-offset-4">{drink.producer || '—'}</span>
                      </td>
                      <td className="px-8 py-7">
                        <div className="flex text-[var(--color-media-secondary)] gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn(
                                "w-4 h-4", 
                                i < Math.floor((drink.rating || 0) / 2) ? "fill-current" : "text-[var(--color-media-outline-variant)]/40"
                              )} 
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-7 text-right">
                        <span className="text-sm font-medium text-[var(--color-media-on-surface-variant)]">
                          {drink.lastLogDate ? new Date(drink.lastLogDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredDrinks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-32 text-center text-[var(--color-media-on-surface-variant)] italic">
                        <div className="flex flex-col items-center gap-4">
                          <Wine className="w-12 h-12 opacity-20" />
                          <p className="text-xl font-light">Your liquid archive is empty. Begin your journey.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </section>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowForm(true)}
        className="cursor-pointer fixed bottom-10 right-10 bg-[var(--color-media-primary)] text-[var(--color-media-on-primary)] w-16 lg:w-20 h-16 lg:h-20 rounded-full shadow-2xl flex items-center justify-center kinetic-hover active:scale-95 transition-all z-50 group hover:bg-[var(--color-media-secondary)]"
      >
        <Plus className="w-8 h-8 lg:w-10 lg:h-10 transition-transform group-hover:rotate-90" />
      </button>

      <DrinkFormDialog open={showForm} onOpenChange={setShowForm} onSuccess={handleCreated} />
    </div>
  );
}
