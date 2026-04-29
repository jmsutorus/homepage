'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, CalendarDays, Clock, ArrowRight, ChevronRight, Scissors, ClipboardList, Stethoscope, Package, Utensils } from 'lucide-react';
import type { EventWithCoverPhoto } from '@/lib/db/events';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { HomePageButton } from '@/Shared/Components/Buttons/HomePageButton';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { useHaptic } from "@/hooks/use-haptic";

interface EventsPageClientProps {
  events: EventWithCoverPhoto[];
}

export function EventsPageClient({ events }: EventsPageClientProps) {
  const router = useRouter();
  const haptic = useHaptic();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewTab, setViewTab] = useState('events');

  // Categorize events
  const { featuredEvent, weeklyEvents, comingUpEvents, milestoneEvent, filteredEvents } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysLater = today + 7 * 24 * 60 * 60 * 1000;

    const filtered = events.filter((event) => {
      const matchesSearch =
        searchTerm === '' ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    const upcoming = filtered.filter(e => new Date(e.date + 'T00:00:00').getTime() >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.start_time || '').localeCompare(b.start_time || ''));

    // Featured: Next upcoming event with cover photo
    const featured = upcoming.find(e => e.cover_photo) || upcoming[0];

    // Weekly: In next 7 days, excluding featured
    const weekly = upcoming.filter(e => {
      const date = new Date(e.date + 'T00:00:00').getTime();
      return date >= today && date < sevenDaysLater && e.id !== featured?.id;
    });

    // Coming Up: After 7 days, excluding featured
    const comingUp = upcoming.filter(e => {
      const date = new Date(e.date + 'T00:00:00').getTime();
      return date >= sevenDaysLater && e.id !== featured?.id;
    });

    // Milestone: First coming up event with cover photo
    const milestone = comingUp.find(e => e.cover_photo);
    const finalComingUp = comingUp.filter(e => e.id !== milestone?.id);

    return {
      featuredEvent: featured,
      weeklyEvents: weekly,
      comingUpEvents: finalComingUp,
      milestoneEvent: milestone,
      filteredEvents: filtered
    };
  }, [events, searchTerm, categoryFilter]);

  const categories = useMemo(() => Array.from(new Set(events.map(e => e.category).filter(Boolean))), [events]);

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return {
      day: date.getDate().toString().padStart(2, '0'),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      full: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
    <div className="min-h-screen text-media-on-background font-lexend pb-20">
      <main className="max-w-[1200px] mx-auto">
        {/* Header / Tabs */}
        <div className="px-4 md:px-8 pt-8">
          <Tabs value={viewTab} onValueChange={(v) => setViewTab(v)}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-media-primary">Events</h1>
                <p className="text-media-on-surface-variant font-light mt-1">Curated moments and upcoming milestones</p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Button 
                  variant="outline"
                  onClick={() => router.push('/events/timeline')}
                  className="border-media-outline-variant hover:bg-media-surface-container text-media-primary rounded-lg px-6 hidden md:flex"
                >
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Timeline View
                </Button>
                <HomePageButton 
                  onClick={() => router.push('/events/new')}
                  icon={<Plus className="w-4 h-4" />}
                >
                  New Event
                </HomePageButton>
              </div>
            </div>

            <TabsContent value="events" className="mt-0">
              {filteredEvents.length === 0 ? (
                <div className="flex min-h-[60vh] items-center justify-center w-full py-12">
                  <div className="flex flex-col items-center text-center px-4 max-w-md">
                    <div className="w-24 h-24 rounded-full bg-media-secondary/10 flex items-center justify-center text-media-secondary mb-6 shadow-inner">
                      <span className="material-symbols-outlined text-5xl">event</span>
                    </div>
                    <h2 className="text-3xl font-black text-media-primary mb-3 tracking-tight">
                      {searchTerm || categoryFilter !== 'all' ? "No Events Found" : "Your Calendar is Clear"}
                    </h2>
                    <p className="text-media-on-surface-variant font-medium mb-8">
                      {searchTerm || categoryFilter !== 'all' 
                        ? "Try adjusting your search or filters to find what you're looking for."
                        : "Start documenting your curated moments and upcoming milestones. Create a record of your social journeys."}
                    </p>
                    <button 
                      onClick={() => { haptic.trigger("light"); router.push("/events/new"); }}
                      className="cursor-pointer bg-media-secondary text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-media-secondary/20 border-none"
                    >
                      <span className="material-symbols-outlined text-xl">add</span>
                      <span>{searchTerm || categoryFilter !== 'all' ? "Add New Event" : "Create Your First Event"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {featuredEvent && (
                    <section className="px-0 md:px-8 pb-16">
                  <Link href={`/events/${featuredEvent.slug}`}>
                    <div className="relative overflow-hidden rounded-3xl group h-[500px] md:h-[600px] flex items-end shadow-2xl transition-transform duration-500 hover:scale-[1.01]">
                      {featuredEvent.cover_photo ? (
                        <img 
                          src={featuredEvent.cover_photo} 
                          alt={featuredEvent.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-media-primary-container flex items-center justify-center">
                          <Calendar className="w-32 h-32 text-white/10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-media-primary/95 via-media-primary/40 to-transparent"></div>
                      <div className="relative z-10 p-8 md:p-12 w-full flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                        <div className="max-w-2xl">
                          <span className="bg-media-secondary text-white px-4 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold mb-6 inline-block">
                            Featured Event
                          </span>
                          <h2 className="text-4xl md:text-7xl font-bold text-white tracking-tighter leading-none mb-6">
                            {featuredEvent.title}
                          </h2>
                          {featuredEvent.description && (
                            <p className="text-media-primary-fixed text-lg md:text-xl font-light max-w-lg line-clamp-2">
                              {featuredEvent.description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-6">
                          <div className="text-white text-left md:text-right">
                            <p className="text-[10px] uppercase tracking-widest font-bold opacity-70 mb-1">Date & Time</p>
                            <p className="text-2xl md:text-3xl font-bold">
                              {formatDateShort(featuredEvent.date).full} • {featuredEvent.all_day ? 'All Day' : formatTime(featuredEvent.start_time)}
                            </p>
                          </div>
                          <button className="cursor-pointer bg-white text-media-primary px-8 py-4 rounded-lg font-bold text-sm tracking-wide uppercase hover:bg-media-secondary hover:text-white transition-all transform active:scale-95 shadow-xl md:w-fit md:ml-auto">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </section>
              )}

              {weeklyEvents.length > 0 && (
                <section className="px-0 md:px-8 pb-16">
                  <div className="mb-8 flex justify-between items-end">
                    <div>
                      <h3 className="text-3xl font-bold tracking-tight text-media-primary">This Week</h3>
                      <p className="text-media-on-surface-variant font-light mt-1">Upcoming agenda for the next 7 days</p>
                    </div>
                  </div>
                  <div className="flex flex-nowrap overflow-x-auto gap-6 pb-8 no-scrollbar scroll-smooth">
                    {weeklyEvents.map((event) => {
                      const dateInfo = formatDateShort(event.date);
                      const CategoryIcon = getIconForCategory(event.category, event.title);
                      return (
                        <Link key={event.id} href={`/events/${event.slug}`}>
                          <div className="min-w-[320px] md:min-w-[380px] bg-media-surface-container-low p-8 rounded-2xl hover:bg-media-surface-container-high transition-all duration-300 cursor-pointer group border border-media-outline-variant/20">
                            <div className="flex gap-8">
                              <div className="flex flex-col items-center">
                                <span className="text-xs font-bold text-media-secondary uppercase tracking-tighter">{dateInfo.weekday}</span>
                                <span className="text-4xl font-bold text-media-primary">{dateInfo.day}</span>
                              </div>
                              <div className="flex-1 border-l border-media-outline-variant/30 pl-8">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant mb-2">{event.category || 'General'}</p>
                                <h4 className="text-xl font-bold text-media-primary group-hover:text-media-secondary transition-colors line-clamp-1">{event.title}</h4>
                                <div className="flex items-center gap-2 text-sm text-media-on-surface-variant mt-4">
                                  <Clock className="w-4 h-4" />
                                  <span>{event.all_day ? 'All Day' : formatTime(event.start_time)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              <section className="px-0 md:px-8 pb-32 flex flex-col gap-12">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-3xl font-bold tracking-tight text-media-primary">Following</h3>
                    <p className="text-media-on-surface-variant font-light mt-1">Upcoming milestones and plans</p>
                  </div>
                  <Link href="/calendar" className="text-media-secondary font-bold text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                    Full Calendar <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {milestoneEvent && (
                  <Link href={`/events/${milestoneEvent.slug}`}>
                    <div className="relative overflow-hidden rounded-3xl h-[400px] md:h-[450px] group bg-media-primary-container shadow-xl">
                      {milestoneEvent.cover_photo && (
                        <img 
                          src={milestoneEvent.cover_photo} 
                          alt={milestoneEvent.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-media-primary/90 to-transparent"></div>
                      <div className="relative z-10 p-10 md:p-16 h-full flex flex-col justify-center max-w-2xl">
                        <span className="text-media-secondary text-xs font-bold uppercase tracking-[0.3em] mb-6">Milestone Event</span>
                        <h4 className="text-4xl md:text-5xl font-bold text-white mb-4">{milestoneEvent.title}</h4>
                        {milestoneEvent.description && (
                          <p className="text-media-primary-fixed text-lg font-light mb-10 leading-relaxed line-clamp-2">
                            {milestoneEvent.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-white">
                          <span className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl text-sm font-medium border border-white/20">
                            {formatDateShort(milestoneEvent.date).full}
                          </span>
                          <span className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl text-sm font-medium border border-white/20">
                            {milestoneEvent.all_day ? 'All Day' : formatTime(milestoneEvent.start_time)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  {comingUpEvents.slice(0, 4).map((event, idx) => {
                    const CategoryIcon = getIconForCategory(event.category, event.title);
                    if (event.cover_photo) {
                      return (
                        <Link key={event.id} href={`/events/${event.slug}`}>
                          <div className="bg-media-surface-container flex flex-col rounded-3xl overflow-hidden group shadow-md hover:shadow-xl transition-shadow">
                            <div className="h-64 overflow-hidden relative">
                              <img src={event.cover_photo} alt={event.title} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110" />
                              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-[10px] font-bold text-media-primary uppercase tracking-widest italic">
                                {event.category || 'Upcoming'}
                              </div>
                            </div>
                            <div className="p-8 md:p-10">
                              <h4 className="text-2xl font-bold text-media-primary mb-4">{event.title}</h4>
                              {event.description && <p className="text-media-on-surface-variant text-base font-light mb-10 leading-relaxed line-clamp-2">{event.description}</p>}
                              <div className="flex items-center justify-between border-t border-media-outline-variant/30 pt-6">
                                <span className="text-media-secondary font-bold text-sm italic">{formatDateShort(event.date).full}</span>
                                <CategoryIcon className="w-5 h-5 text-media-on-surface-variant" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    }
                    return (
                      <Link key={event.id} href={`/events/${event.slug}`}>
                        <div className="bg-media-surface-container-high rounded-3xl p-8 md:p-10 h-full flex flex-col justify-between group hover:bg-media-primary-container hover:text-white transition-all duration-500 shadow-md">
                          <div>
                            <div className="w-16 h-16 bg-media-primary-fixed rounded-2xl flex items-center justify-center mb-8 text-media-primary group-hover:bg-media-secondary group-hover:text-white transition-colors">
                              <CategoryIcon className="w-8 h-8" />
                            </div>
                            <h4 className="text-2xl font-bold mb-4">{event.title}</h4>
                            {event.description && <p className="text-media-on-surface-variant group-hover:text-media-primary-fixed text-base font-light leading-relaxed line-clamp-3">{event.description}</p>}
                          </div>
                          <div className="mt-12 flex items-end justify-between">
                            <div>
                              <p className="text-[10px] uppercase tracking-widest font-bold opacity-60 mb-1">Status</p>
                              <p className="text-lg font-bold">{formatDateShort(event.date).full}</p>
                            </div>
                            <ChevronRight className="w-8 h-8 opacity-20 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>                

                <div className="w-full">
                  <div className="rounded-3xl w-full h-[400px] md:h-[500px] bg-media-surface-container-highest flex items-center justify-center text-media-on-surface-variant font-light italic text-xl border border-media-outline-variant/20">
                    &quot;The best way to predict the future is to create it.&quot;
                  </div>
                </div>

                <div className="w-full flex flex-col items-center justify-center pt-8 pb-24 border-t border-outline-variant/20">
<h3 className="text-3xl font-bold text-primary mb-4 tracking-tight">Timeline</h3>
<p className="text-on-surface-variant font-light mb-8 text-center max-w-md">Looking for a chronological journey through your life? Explore our vertical timeline of curated events and social milestones.</p>
<Link className="group flex items-center gap-4 px-8 py-4 bg-surface-container border border-outline-variant/30 rounded-full hover:bg-primary hover:text-white transition-all duration-500 editorial-shadow" href="/events/timeline">
<span className="font-lexend font-bold text-sm uppercase tracking-widest">Access Events Timeline</span>
<span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-2" data-icon="arrow_right_alt">arrow_right_alt</span>
</Link>
</div>
              </section>
            </>
          )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <FloatingActionButton 
        onClick={() => router.push('/events/new')} 
        tooltipText="New Event"
      />
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
