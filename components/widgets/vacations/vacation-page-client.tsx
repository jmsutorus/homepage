'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, LayoutGrid, CalendarDays, ArrowRight } from 'lucide-react';
import { Vacation, VacationStatus, VACATION_STATUSES, VACATION_STATUS_NAMES, calculateDurationDays } from '@/lib/types/vacations';
import { EditorialVacationCard } from './editorial-vacation-card';
import { TreasuryCard } from './treasury-card';
import { cn } from '@/lib/utils';
import { FloatingActionButton } from '@/components/ui/floating-action-button';

interface VacationPageClientProps {
  vacations: Vacation[];
}

export function VacationPageClient({ vacations }: VacationPageClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<VacationStatus | 'all'>('all');

  // Categorize vacations
  const { spotlight, upcoming, archived } = useMemo(() => {
    const featured = vacations.find(v => v.featured && v.status !== 'completed');
    const future = vacations
      .filter(v => v.status === 'planning' || v.status === 'booked' || v.status === 'in-progress')
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    
    // Spotlight is either the featured one, or the very next one
    const spotlightVacation = featured || future[0];
    
    // Remaining upcoming (excluding spotlight)
    const upcomingJourneys = future.filter(v => v.id !== spotlightVacation?.id);
    
    // Archived are completed
    const archivedJourneys = vacations
      .filter(v => v.status === 'completed')
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

    return {
      spotlight: spotlightVacation,
      upcoming: upcomingJourneys,
      archived: archivedJourneys
    };
  }, [vacations]);

  // Filter archived vacations for the Treasury section
  const filteredArchived = useMemo(() => {
    return archived.filter((vacation) => {
      const matchesSearch =
        searchTerm === '' ||
        vacation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vacation.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vacation.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesStatus = statusFilter === 'all' || vacation.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [archived, searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-media-background selection:bg-media-secondary/30">
      <main>
        {/* Section 1: Hero / Spotlight */}
        {spotlight && (
          <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
            {spotlight.poster ? (
              <Image 
                src={spotlight.poster} 
                alt={spotlight.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-media-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-9xl text-media-on-primary-container/20">landscape</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-8">
              <div className="max-w-4xl mx-auto text-white">
                <span className="text-media-secondary-fixed-dim font-bold tracking-[0.4em] uppercase text-sm mb-6 block font-lexend animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {spotlight.status === 'in-progress' ? 'Current Expedition' : 'Next Odyssey'}
                </span>
                <h2 className="text-5xl lg:text-8xl font-bold tracking-tighter leading-none mb-8 font-lexend animate-in fade-in slide-in-from-bottom-6 duration-1000">
                  {spotlight.title.split(':').map((part, i) => (
                    <span key={i} className={cn(i > 0 && "italic font-light opacity-90 block mt-2")}>
                      {part}{i === 0 && spotlight.title.includes(':') ? ':' : ''}
                    </span>
                  ))}
                </h2>
                <p className="text-lg lg:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-lexend font-light opacity-90 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                  {spotlight.description || `Exploring the wonders of ${spotlight.destination}.`}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 lg:gap-12 mb-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                  <div className="text-center">
                    <span className="block text-xs uppercase tracking-[0.3em] opacity-70 mb-2 font-lexend">Departure</span>
                    <span className="font-bold text-lg font-lexend">
                      {new Date(spotlight.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="h-px w-12 bg-white/30 hidden sm:block"></div>
                  <div className="text-center">
                    <span className="block text-xs uppercase tracking-[0.3em] opacity-70 mb-2 font-lexend">Duration</span>
                    <span className="font-bold text-lg font-lexend">
                      {calculateDurationDays(spotlight.start_date, spotlight.end_date)} Days
                    </span>
                  </div>
                </div>

                <Button asChild className="bg-white text-media-primary px-12 py-7 rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-3 mx-auto hover:bg-media-secondary hover:text-white transition-all group animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                  <Link href={`/vacations/${spotlight.slug}`}>
                    Review Itinerary
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Section 2: Upcoming Journeys */}
        {upcoming.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
            <div className="flex flex-col items-center text-center mb-16 lg:mb-24">
              <h3 className="text-4xl lg:text-5xl font-bold text-media-primary tracking-tight mb-4 font-lexend">
                Upcoming Journeys
              </h3>
              <p className="text-media-on-surface-variant text-lg font-lexend font-light">
                Scheduled escapes awaiting your arrival.
              </p>
              <Button variant="ghost" className="mt-8 text-media-secondary font-bold flex items-center gap-2 hover:gap-3 transition-all uppercase tracking-widest text-xs font-lexend h-auto p-0 hover:bg-transparent">
                View Calendar <CalendarDays className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-col gap-24 lg:gap-32">
              {upcoming.map((vacation, index) => (
                <EditorialVacationCard 
                  key={vacation.id} 
                  vacation={vacation} 
                  index={index} 
                />
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Travel Treasury */}
        <section className="bg-media-surface-container-low/50 py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-16 lg:mb-20">
              <h3 className="text-3xl lg:text-4xl font-bold text-media-primary tracking-tight mb-8 font-lexend">
                Travel Treasury
              </h3>
              
              {/* Filters integrated into Treasury */}
              <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-4 mb-12">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-media-outline group-focus-within:text-media-secondary transition-colors" />
                  <Input
                    placeholder="Search the archive..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 h-12 bg-white border-media-outline-variant/30 font-lexend rounded-xl focus-visible:ring-media-secondary"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as VacationStatus | 'all')}
                >
                  <SelectTrigger className="w-full sm:w-56 h-12 bg-white border-media-outline-variant/30 font-lexend rounded-xl focus:ring-media-secondary">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-media-outline" />
                      <SelectValue placeholder="All Memories" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="font-lexend">
                    <SelectItem value="all">All Memories</SelectItem>
                    {VACATION_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {VACATION_STATUS_NAMES[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
              {/* Add New Journey Action Card */}
              <TreasuryCard isAction />
              
              {filteredArchived.map((vacation) => (
                <TreasuryCard 
                  key={vacation.id} 
                  vacation={vacation} 
                />
              ))}
              
              {/* If search leaves us empty */}
              {filteredArchived.length === 0 && searchTerm && (
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 py-20 text-center">
                  <p className="text-media-outline font-lexend italic">No expeditions found matching &quot;{searchTerm}&quot;</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <FloatingActionButton 
        onClick={() => router.push('/vacations/new')} 
        tooltipText="New Vacation" 
      />
    </div>
  );
}
