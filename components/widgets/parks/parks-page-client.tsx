'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, TreePine, MapPin, ArrowRight } from 'lucide-react';
import { ParkFormDialog } from './park-form-dialog';
import { NationalParksMap } from './national-parks-map';
import { ParkCardEditorial } from './editorial/park-card-editorial';
import { ParkCard } from './park-card';
import { ParkContent } from '@/lib/db/parks';

interface ParksPageClientProps {
  parks: ParkContent[];
  parksByCategory: Record<string, ParkContent[]>;
}

export function ParksPageClient({ parks, parksByCategory }: ParksPageClientProps) {
  const [showForm, setShowForm] = useState(false);
  const fullCollectionRef = useRef<HTMLDivElement>(null);

  // Calculate stats
  const totalVisits = parks.length;
  const nationalParksCount = parks.filter(p => p.category === 'National Park').length;
  const stateParksCount = parks.filter(p => p.category === 'State Park').length;

  // Get top 3 recent parks
  const recentExplorations = useMemo(() => {
    return [...parks]
      .sort((a, b) => {
        const dateA = a.visited ? new Date(a.visited).getTime() : 0;
        const dateB = b.visited ? new Date(b.visited).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 3);
  }, [parks]);

  const scrollToFullCollection = () => {
    fullCollectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-media-background font-lexend -mt-8 -mx-4 md:-mx-8">
      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button 
          onClick={() => setShowForm(true)} 
          className="w-14 h-14 rounded-full bg-media-secondary text-media-on-secondary shadow-2xl hover:scale-110 transition-transform duration-300 border-none"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 pb-20 pt-12">
        {/* Hero & Stats Header */}
        <header className="py-12 flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black text-media-primary dark:text-media-surface tracking-tighter leading-[0.9] mb-4">
              The Earthbound<br/>Atlas
            </h1>
            <p className="text-media-on-surface-variant max-w-md text-lg font-light leading-relaxed">
              A curated record of wilderness immersion, documenting the raw majesty of our protected landscapes.
            </p>
          </div>
          <div className="flex gap-12 border-l-2 border-media-outline-variant/20 pl-12 h-fit mb-4">
            <div className="flex flex-col">
              <span className="text-media-secondary font-black text-5xl leading-none tracking-tighter">{totalVisits}</span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-media-on-surface-variant mt-2 opacity-60">Total Visits</span>
            </div>
            <div className="flex flex-col">
              <span className="text-media-primary dark:text-media-surface font-black text-5xl leading-none tracking-tighter">{nationalParksCount}</span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-media-on-surface-variant mt-2 opacity-60">National Parks</span>
            </div>
            <div className="flex flex-col">
              <span className="text-media-primary dark:text-media-surface font-black text-5xl leading-none tracking-tighter">{stateParksCount}</span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-media-on-surface-variant mt-2 opacity-60">State Parks</span>
            </div>
          </div>
        </header>

        {/* Interactive Map Visual */}
        <section className="mb-24 relative">
          <div className="w-full bg-media-surface-container-low rounded-[2rem] relative overflow-hidden shadow-2xl border border-media-outline-variant/10 p-8 md:p-12">
             <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 w-full relative">
                  <div className="absolute inset-0 bg-media-primary/5 rounded-[2.5rem] skew-x-1 -z-10"></div>
                   <NationalParksMap 
                    visitedParkTitles={parks.filter(p => p.category === 'National Park').map(p => p.title)} 
                   />
                </div>
                
                <div className="md:w-80 space-y-8">
                  <div className="bg-white/50 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="material-symbols-outlined text-media-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
                      <h4 className="font-black text-xl tracking-tight text-media-primary">Current Atlas</h4>
                    </div>
                    <p className="text-sm text-media-on-surface-variant leading-relaxed mb-8 font-light italic">
                      Tracking the wild frontiers of North America. {nationalParksCount} national treasures documented in this collection.
                    </p>
                    <div className="flex -space-x-3 mb-8">
                      {recentExplorations.map((p, idx) => (
                        <div key={idx} className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-lg group-hover:translate-x-1 transition-transform">
                          <img src={p.poster || ""} alt="park" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <div className="w-12 h-12 rounded-full bg-media-primary-fixed flex items-center justify-center border-2 border-white shadow-lg">
                        <span className="text-[10px] font-black text-media-on-primary-fixed">+{Math.max(0, totalVisits - 3)}</span>
                      </div>
                    </div>
                    <Button asChild className="w-full bg-media-primary text-media-on-primary rounded-xl font-black py-6 hover:scale-[1.02] transition-transform">
                       <Link href="/parks/new">Plan New Expedition</Link>
                    </Button>
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* Recent Explorations Section */}
        <section className="mb-12">
          <div className="flex items-baseline justify-between mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-media-primary dark:text-media-surface tracking-tighter">Recent Explorations</h2>
            <Link 
              href="/parks/list"
              className="text-xs font-black uppercase tracking-[0.3em] text-media-secondary hover:text-media-primary transition-colors flex items-center gap-2 group"
            >
              View Full Collection
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {recentExplorations.map((park, index) => (
              <ParkCardEditorial 
                key={park.id} 
                park={park}
              />
            ))}
          </div>
        </section>
      </div>

      <ParkFormDialog open={showForm} onOpenChange={setShowForm} />
    </div>
  );
}

