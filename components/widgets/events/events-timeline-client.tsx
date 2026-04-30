'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Scissors, 
  ClipboardList, 
  Stethoscope, 
  Package, 
  Utensils,
  Plus,
  History,
  ArrowRight
} from 'lucide-react';
import type { TimelineEvent } from '@/lib/db/events';
import { cn } from '@/lib/utils';
import { HomePageButton } from '@/Shared/Components/Buttons/HomePageButton';
import { FloatingActionButton } from '@/components/ui/floating-action-button';

interface EventsTimelineClientProps {
  events: TimelineEvent[];
}

function AttendeeStack({ people, max = 3 }: { people: TimelineEvent['people'], max?: number }) {
  if (people.length === 0) return null;
  
  const displayed = people.slice(0, max);
  const remaining = people.length - max;
  
  return (
    <div className="flex -space-x-2">
      {displayed.map((person) => (
        <div key={person.id} className="relative group/avatar">
          {person.photo ? (
            <img 
              src={person.photo} 
              alt={person.name} 
              className="w-8 h-8 rounded-full border-2 border-[var(--color-media-surface)] object-cover" 
            />
          ) : (
            <div className="w-8 h-8 rounded-full border-2 border-[var(--color-media-surface)] bg-[var(--color-media-primary-fixed)] flex items-center justify-center text-[10px] font-bold text-[var(--color-media-primary)]">
              {person.name.charAt(0)}
            </div>
          )}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[var(--color-media-primary)] text-white text-[10px] rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            {person.name}
          </div>
        </div>
      ))}
      {remaining > 0 && (
        <div className="w-8 h-8 rounded-full bg-[var(--color-media-surface-variant)] border-2 border-[var(--color-media-surface)] flex items-center justify-center text-[10px] font-bold">
          +{remaining}
        </div>
      )}
    </div>
  );
}

export function EventsTimelineClient({ events }: EventsTimelineClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filter and sort events
  const { filteredUpcoming, filteredPast, categories } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const filtered = events.filter((event) => {
      const matchesSearch =
        searchTerm === '' ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    const upcoming = filtered
      .filter(e => new Date(e.date + 'T00:00:00').getTime() >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.start_time || '').localeCompare(b.start_time || ''));

    const past = filtered
      .filter(e => new Date(e.date + 'T00:00:00').getTime() < today)
      .sort((a, b) => b.date.localeCompare(a.date) || (b.start_time || '').localeCompare(a.start_time || ''));

    const cats = Array.from(new Set(events.map(e => e.category).filter(Boolean)));

    return {
      filteredUpcoming: upcoming,
      filteredPast: past,
      categories: cats as string[]
    };
  }, [events, searchTerm, categoryFilter]);

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return {
      day: date.getDate().toString().padStart(2, '0'),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      full: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      year: date.getFullYear()
    };
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getIconForCategory = (category: string | null, title: string) => {
    const t = title.toLowerCase();
    const c = (category || '').toLowerCase();
    
    if (t.includes('haircut') || c.includes('care')) return Scissors;
    if (t.includes('dentist') || t.includes('doctor') || c.includes('health')) return Stethoscope;
    if (t.includes('appointment') || c.includes('admin')) return ClipboardList;
    if (t.includes('pickup') || t.includes('ikea') || c.includes('logistics')) return Package;
    if (t.includes('dinner') || t.includes('brunch') || c.includes('social')) return Utensils;
    
    return Calendar;
  };

  return (
    <div className="min-h-screen bg-[var(--color-media-background)] text-[var(--color-media-on-surface)] font-lexend pb-20 pt-8">
      <main className="max-w-7xl w-full mx-auto px-4 md:px-8 lg:px-12">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-[var(--color-media-primary)] tracking-tight mb-4">Event Archive & Timeline</h2>
            <div className="w-24 h-1.5 bg-[var(--color-media-secondary)] rounded-full"></div>
          </div>
          <HomePageButton 
            onClick={() => router.push('/events/new')}
            icon={<Plus className="w-5 h-5" />}
          >
            New Event
          </HomePageButton>
        </div>

        {/* Filters Section */}
        <section className="bg-[var(--color-media-surface-container-low)] p-6 md:p-8 rounded-xl mb-16 flex flex-wrap items-center gap-8 shadow-sm">
          <div className="flex flex-col gap-2 min-w-[200px] flex-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-media-on-surface-variant)] opacity-70">Search Events</span>
            <div className="flex items-center bg-[var(--color-media-surface-container-lowest)] px-4 py-2 rounded-lg border border-[var(--color-media-outline-variant)]/30">
              <Search className="w-4 h-4 mr-2 opacity-40" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 min-w-[200px]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-media-on-surface-variant)] opacity-70">Event Type</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCategoryFilter('all')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                  categoryFilter === 'all' 
                    ? "bg-[var(--color-media-primary)] text-white" 
                    : "bg-[var(--color-media-surface-container-highest)] hover:bg-[var(--color-media-surface-container-high)] text-[var(--color-media-on-surface)]"
                )}
              >
                All
              </button>
              {categories.slice(0, 3).map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                    categoryFilter === cat 
                      ? "bg-[var(--color-media-primary)] text-white" 
                      : "bg-[var(--color-media-surface-container-highest)] hover:bg-[var(--color-media-surface-container-high)] text-[var(--color-media-on-surface)]"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-[250px]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-media-on-surface-variant)] opacity-70">Popular Tags</span>
            <div className="flex flex-wrap gap-2">
              <span className="text-[var(--color-media-secondary)] text-xs font-bold px-3 py-1 bg-[var(--color-media-secondary)]/10 rounded-lg cursor-pointer hover:bg-[var(--color-media-secondary)]/20 transition-colors">#social</span>
              <span className="text-[var(--color-media-on-surface-variant)] text-xs font-medium px-3 py-1 bg-[var(--color-media-surface-variant)]/40 rounded-lg cursor-pointer hover:bg-[var(--color-media-surface-variant)]/60 transition-colors">#milestone</span>
              <span className="text-[var(--color-media-on-surface-variant)] text-xs font-medium px-3 py-1 bg-[var(--color-media-surface-variant)]/40 rounded-lg cursor-pointer hover:bg-[var(--color-media-surface-variant)]/60 transition-colors">#growth</span>
            </div>
          </div>
        </section>

        {/* Timeline Content */}
        <div className="relative timeline-container">
          {/* Vertical Line */}
          <div className="absolute left-[70px] md:left-[140px] top-0 bottom-0 w-[1px] bg-[var(--color-media-outline-variant)] z-0 hidden sm:block"></div>

          {/* Upcoming Section */}
          <div className="flex items-center gap-4 mb-12 relative z-10">
            <div className="w-[70px] md:w-[140px] flex justify-end shrink-0 hidden sm:flex">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-media-secondary)]">Upcoming</span>
            </div>
            <div className="w-3 h-3 rounded-full bg-[var(--color-media-secondary)] border-4 border-[var(--color-media-background)] shrink-0 hidden sm:block"></div>
            <div className="sm:hidden px-4 py-2 bg-[var(--color-media-secondary)]/10 rounded-xl border border-[var(--color-media-secondary)]/20 shadow-sm">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-media-secondary)]">Upcoming Schedule</span>
            </div>
            <div className="flex-1 h-[1px] bg-[var(--color-media-surface-variant)]/50"></div>
          </div>

          {filteredUpcoming.length === 0 && (
            <div className="flex gap-8 mb-16 relative z-10 sm:ml-[70px] md:ml-[140px]">
               <p className="text-[var(--color-media-on-surface-variant)] opacity-60 text-sm italic">No upcoming events scheduled.</p>
            </div>
          )}

          {filteredUpcoming.map((event, index) => {
            const dateInfo = formatDateShort(event.date);
            const CategoryIcon = getIconForCategory(event.category, event.title);
            
            // Choose card style: 
            // 1. Hero style if it has a photo
            // 2. Dark style for every 3rd event or Milestone
            // 3. Simple style otherwise
            const isHero = !!event.cover_photo;
            const isDark = !isHero && (index % 3 === 2 || event.category?.toLowerCase() === 'milestone');

            return (
              <div key={event.id} className="flex gap-4 md:gap-8 mb-16 group relative z-10">
                <div className="w-[70px] md:w-[140px] pt-1 text-right flex flex-col gap-1 flex-shrink-0 hidden sm:flex">
                  <span className="text-xs font-black uppercase tracking-widest text-[var(--color-media-primary)]">{dateInfo.month} {dateInfo.day}</span>
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-[var(--color-media-on-surface-variant)] opacity-60 truncate">{event.category || 'General'}</span>
                </div>
                
                <div className="flex-1">
                  <Link href={`/events/${event.slug}`}>
                    {isHero ? (
                      <div className="bg-[var(--color-media-surface-container-lowest)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col lg:flex-row border border-[var(--color-media-surface-container-high)]">
                        <div className="lg:w-72 h-48 lg:h-auto overflow-hidden">
                          <img 
                            src={event.cover_photo!} 
                            alt={event.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          />
                        </div>
                        <div className="p-8 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="text-2xl font-black text-[var(--color-media-primary)] tracking-tight">{event.title}</h4>
                              <div className="flex gap-2">
                                {event.category && (
                                  <span className="text-[10px] text-[var(--color-media-secondary)] font-bold uppercase">#{event.category.toLowerCase()}</span>
                                )}
                              </div>
                            </div>
                            <p className="text-[var(--color-media-on-surface-variant)] text-sm leading-relaxed mb-6 line-clamp-2">
                              {event.description || "No description provided."}
                            </p>
                          </div>
                          
                          <div className="flex justify-between items-end mt-4">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter opacity-50">
                                <MapPin className="w-3.5 h-3.5" />
                                {event.location || "Online"}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter opacity-50">
                                <Clock className="w-3.5 h-3.5" />
                                {formatTime(event.start_time)}
                              </div>
                            </div>
                            <AttendeeStack people={event.people} />
                          </div>
                        </div>
                      </div>
                    ) : isDark ? (
                      <div className="bg-[var(--color-media-primary)] p-8 rounded-2xl shadow-sm hover:translate-x-1 transition-transform cursor-pointer relative overflow-hidden group/dark">
                        <div className="relative z-10">
                          <h5 className="text-xl font-bold text-white mb-2">{event.title}</h5>
                          <p className="text-sm text-white/70 leading-relaxed max-w-2xl mb-6 line-clamp-2">
                            {event.description || "Deep dive into your next big milestone."}
                          </p>
                          <div className="flex justify-between items-end">
                            <div className="flex flex-col gap-1.5">
                              {event.location && (
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-white/40">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {event.location}
                                </div>
                              )}
                              <span className="text-xs text-white/40 font-bold uppercase tracking-widest">
                                {event.category || 'Milestone Session'}
                              </span>
                            </div>
                            <AttendeeStack people={event.people} />
                          </div>
                        </div>
                        <div className="absolute -right-4 -top-4 opacity-10 transform group-hover/dark:rotate-12 transition-transform duration-500">
                           <CategoryIcon className="w-32 h-32 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[var(--color-media-surface-container-lowest)] p-8 rounded-2xl border border-[var(--color-media-surface-container-high)] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                          <h5 className="text-xl font-bold text-[var(--color-media-primary)] mb-2">{event.title}</h5>
                          <AttendeeStack people={event.people} />
                        </div>
                        <p className="text-sm text-[var(--color-media-on-surface-variant)] opacity-80 mb-6 leading-relaxed max-w-2xl line-clamp-2">
                          {event.description || "A standard event in your schedule."}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter opacity-50">
                          <Clock className="w-3.5 h-3.5" />
                          {event.all_day ? 'All Day' : formatTime(event.start_time)}
                          {event.location && (
                            <>
                              <span className="mx-2">•</span>
                              <MapPin className="w-3.5 h-3.5" />
                              {event.location}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Past Section Marker */}
          <div className="flex items-center gap-4 mb-12 relative z-10 mt-12 sm:mt-0">
            <div className="w-[70px] md:w-[140px] flex justify-end shrink-0 hidden sm:flex">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-media-on-surface-variant)] opacity-40">Past Memories</span>
            </div>
            <div className="w-3 h-3 rounded-full bg-[var(--color-media-on-surface-variant)]/30 border-4 border-[var(--color-media-background)] shrink-0 hidden sm:block"></div>
            <div className="sm:hidden px-4 py-2 bg-[var(--color-media-surface-variant)]/20 rounded-xl border border-[var(--color-media-outline-variant)]/20 shadow-sm">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-media-on-surface-variant)] opacity-60">Past Memories Archive</span>
            </div>
            <div className="flex-1 h-[1px] bg-[var(--color-media-surface-variant)]/50"></div>
          </div>

          {filteredPast.length === 0 && (
            <div className="flex gap-8 mb-16 relative z-10 sm:ml-[70px] md:ml-[140px]">
               <p className="text-[var(--color-media-on-surface-variant)] opacity-60 text-sm italic">No past events found.</p>
            </div>
          )}

          {filteredPast.map((event) => {
            const dateInfo = formatDateShort(event.date);
            return (
              <div key={event.id} className="flex gap-4 md:gap-8 mb-12 group relative z-10">
                <div className="w-[70px] md:w-[140px] pt-1 text-right flex flex-col gap-1 flex-shrink-0 hidden sm:flex">
                  <span className="text-xs font-black uppercase tracking-widest text-[var(--color-media-primary)] opacity-40 group-hover:opacity-100 transition-opacity">
                    {dateInfo.month} {dateInfo.day}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-[var(--color-media-on-surface-variant)] opacity-30 group-hover:opacity-60 transition-opacity truncate">
                    {event.category || 'Social'}
                  </span>
                </div>
                
                <div className="flex-1">
                  <Link href={`/events/${event.slug}`}>
                    <div className="bg-[var(--color-media-surface-container-lowest)] p-6 rounded-xl border border-transparent hover:border-[var(--color-media-secondary)]/20 hover:bg-[var(--color-media-surface-container-low)] transition-all duration-300 flex items-center gap-6 md:gap-8">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h5 className="text-lg font-bold text-[var(--color-media-primary)]">{event.title}</h5>
                          <AttendeeStack people={event.people} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-[var(--color-media-on-surface-variant)] leading-relaxed opacity-80 line-clamp-1">
                            {event.description || "A memory worth keeping."}
                          </p>
                          {event.location && (
                            <div className="flex items-center gap-1 text-[9px] font-bold opacity-30 uppercase tracking-tighter">
                              <MapPin className="w-2.5 h-2.5" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 shrink-0">
                        {event.cover_photo && (
                          <div className="w-20 h-20 rounded-xl border border-[var(--color-media-surface-variant)] overflow-hidden hidden md:block group-hover:shadow-md transition-shadow">
                            <img src={event.cover_photo} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        )}
                        <button className="cursor-pointer text-[var(--color-media-secondary)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-bold text-xs uppercase whitespace-nowrap">
                          View Story
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}

          {/* End marker */}
          <div className="flex items-center gap-4 mb-16 relative z-10 hidden sm:flex">
            <div className="w-[70px] md:w-[140px]"></div>
            <div className="w-3 h-3 rounded-full bg-[var(--color-media-on-surface-variant)]/20 shadow-inner"></div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button 
            variant="outline"
            className="px-12 py-4 bg-[var(--color-media-surface-container-high)] text-[var(--color-media-primary)] font-bold rounded-lg hover:bg-[var(--color-media-surface-container-highest)] transition-colors flex items-center gap-3 border-none"
          >
            Discover Older Memories
            <History className="w-5 h-5" />
          </Button>
        </div>
      </main>

      {/* FAB for mobile */}
      <FloatingActionButton 
        onClick={() => router.push('/events/new')}
        tooltipText="New Event"
        className="md:hidden"
      />

      {/* Navigation section at the bottom to return home */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 mt-24 mb-12">
        <div className="w-full flex flex-col items-center justify-center pt-16 pb-16 border-t border-[var(--color-media-outline-variant)]/20">
          <h3 className="text-3xl font-bold text-[var(--color-media-primary)] mb-4 tracking-tight">Return to Dashboard</h3>
          <p className="text-[var(--color-media-on-surface-variant)] font-light mb-8 text-center max-w-md">Finished exploring your timeline? Head back to the main events overview.</p>
          <Link 
            href="/events" 
            className="group flex items-center gap-4 px-8 py-4 bg-[var(--color-media-surface-container)] border border-[var(--color-media-outline-variant)]/30 rounded-full hover:bg-[var(--color-media-primary)] hover:text-white transition-all duration-500 shadow-md"
          >
            <span className="font-bold text-sm uppercase tracking-widest text-[#061b0e] group-hover:text-white">Main Events Page</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}
