'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Calendar, MapPin, CalendarDays, Clock, ArrowRight, ChevronRight, Scissors, ClipboardList, Stethoscope, Package, Utensils } from 'lucide-react';
import type { EventWithCoverPhoto } from '@/lib/db/events';
import { HolidayIcon, hasHolidayIcon } from './holiday-icons';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PageTabsList } from '@/components/ui/page-tabs-list';
import { cn } from '@/lib/utils';
import { HomePageButton } from '@/Shared/Components/Buttons/HomePageButton';

interface EventsPageClientProps {
  events: EventWithCoverPhoto[];
}

export function EventsPageClient({ events }: EventsPageClientProps) {
  const router = useRouter();
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
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1c1a] font-lexend pb-20">
      <main className="max-w-[1200px] mx-auto">
        {/* Header / Tabs */}
        <div className="px-8 pt-8">
          <Tabs value={viewTab} onValueChange={(v) => setViewTab(v)}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-[#061b0e]">Events</h1>
                <p className="text-[#434843] font-light mt-1">Curated moments and upcoming milestones</p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Button 
                  variant="outline"
                  onClick={() => router.push('/events/timeline')}
                  className="border-[#c3c8c1] hover:bg-[#efeeeb] text-[#061b0e] rounded-lg px-6 hidden md:flex"
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
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-6 text-on-surface-variant/30">
                    <Calendar className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary">No events found</h3>
                  <p className="text-on-surface-variant font-light mt-2 max-w-xs mx-auto">
                    {searchTerm || categoryFilter !== 'all' 
                      ? "Try adjusting your search or filters to find what you're looking for."
                      : "Your calendar is clear. Time to plan something new!"}
                  </p>
                  <HomePageButton 
                    onClick={() => router.push('/events/new')}
                    className="mt-8 px-8 py-6 h-auto"
                  >
                    Create your first event
                  </HomePageButton>
                </div>
              ) : (
                <>
                  {featuredEvent && (
                    <section className="px-8 pb-16">
                  <Link href={`/events/${featuredEvent.slug}`}>
                    <div className="relative overflow-hidden rounded-3xl group h-[500px] md:h-[600px] flex items-end shadow-2xl transition-transform duration-500 hover:scale-[1.01]">
                      {featuredEvent.cover_photo ? (
                        <img 
                          src={featuredEvent.cover_photo} 
                          alt={featuredEvent.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#1b3022] flex items-center justify-center">
                          <Calendar className="w-32 h-32 text-white/10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#061b0e]/95 via-[#061b0e]/40 to-transparent"></div>
                      <div className="relative z-10 p-8 md:p-12 w-full flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                        <div className="max-w-2xl">
                          <span className="bg-[#9f402d] text-white px-4 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold mb-6 inline-block">
                            Featured Event
                          </span>
                          <h2 className="text-4xl md:text-7xl font-bold text-white tracking-tighter leading-none mb-6">
                            {featuredEvent.title}
                          </h2>
                          {featuredEvent.description && (
                            <p className="text-[#d0e9d4] text-lg md:text-xl font-light max-w-lg line-clamp-2">
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
                          <button className="cursor-pointer bg-white text-[#061b0e] px-8 py-4 rounded-lg font-bold text-sm tracking-wide uppercase hover:bg-[#9f402d] hover:text-white transition-all transform active:scale-95 shadow-xl md:w-fit md:ml-auto">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </section>
              )}

              {weeklyEvents.length > 0 && (
                <section className="px-8 pb-16">
                  <div className="mb-8 flex justify-between items-end">
                    <div>
                      <h3 className="text-3xl font-bold tracking-tight text-[#061b0e]">This Week</h3>
                      <p className="text-[#434843] font-light mt-1">Upcoming agenda for the next 7 days</p>
                    </div>
                  </div>
                  <div className="flex flex-nowrap overflow-x-auto gap-6 pb-8 no-scrollbar scroll-smooth">
                    {weeklyEvents.map((event) => {
                      const dateInfo = formatDateShort(event.date);
                      const CategoryIcon = getIconForCategory(event.category, event.title);
                      return (
                        <Link key={event.id} href={`/events/${event.slug}`}>
                          <div className="min-w-[320px] md:min-w-[380px] bg-[#f4f3f1] p-8 rounded-2xl hover:bg-[#e9e8e5] transition-all duration-300 cursor-pointer group border border-[#c3c8c1]/20">
                            <div className="flex gap-8">
                              <div className="flex flex-col items-center">
                                <span className="text-xs font-bold text-[#9f402d] uppercase tracking-tighter">{dateInfo.weekday}</span>
                                <span className="text-4xl font-bold text-[#061b0e]">{dateInfo.day}</span>
                              </div>
                              <div className="flex-1 border-l border-[#c3c8c1]/30 pl-8">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-[#434843] mb-2">{event.category || 'General'}</p>
                                <h4 className="text-xl font-bold text-[#061b0e] group-hover:text-[#9f402d] transition-colors line-clamp-1">{event.title}</h4>
                                <div className="flex items-center gap-2 text-sm text-[#434843] mt-4">
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

              <section className="px-8 pb-32 flex flex-col gap-12">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-3xl font-bold tracking-tight text-[#061b0e]">Following</h3>
                    <p className="text-[#434843] font-light mt-1">Upcoming milestones and plans</p>
                  </div>
                  <Link href="/calendar" className="text-[#9f402d] font-bold text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                    Full Calendar <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {milestoneEvent && (
                  <Link href={`/events/${milestoneEvent.slug}`}>
                    <div className="relative overflow-hidden rounded-3xl h-[400px] md:h-[450px] group bg-[#1b3022] shadow-xl">
                      {milestoneEvent.cover_photo && (
                        <img 
                          src={milestoneEvent.cover_photo} 
                          alt={milestoneEvent.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#061b0e]/90 to-transparent"></div>
                      <div className="relative z-10 p-10 md:p-16 h-full flex flex-col justify-center max-w-2xl">
                        <span className="text-[#9f402d] text-xs font-bold uppercase tracking-[0.3em] mb-6">Milestone Event</span>
                        <h4 className="text-4xl md:text-5xl font-bold text-white mb-4">{milestoneEvent.title}</h4>
                        {milestoneEvent.description && (
                          <p className="text-[#b4cdb8] text-lg font-light mb-10 leading-relaxed line-clamp-2">
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
                          <div className="bg-[#efeeeb] flex flex-col rounded-3xl overflow-hidden group shadow-md hover:shadow-xl transition-shadow">
                            <div className="h-64 overflow-hidden relative">
                              <img src={event.cover_photo} alt={event.title} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110" />
                              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-[10px] font-bold text-[#061b0e] uppercase tracking-widest italic">
                                {event.category || 'Upcoming'}
                              </div>
                            </div>
                            <div className="p-8 md:p-10">
                              <h4 className="text-2xl font-bold text-[#061b0e] mb-4">{event.title}</h4>
                              {event.description && <p className="text-[#434843] text-base font-light mb-10 leading-relaxed line-clamp-2">{event.description}</p>}
                              <div className="flex items-center justify-between border-t border-[#c3c8c1]/30 pt-6">
                                <span className="text-[#9f402d] font-bold text-sm italic">{formatDateShort(event.date).full}</span>
                                <CategoryIcon className="w-5 h-5 text-[#434843]" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    }
                    return (
                      <Link key={event.id} href={`/events/${event.slug}`}>
                        <div className="bg-[#e9e8e5] rounded-3xl p-8 md:p-10 h-full flex flex-col justify-between group hover:bg-[#1b3022] hover:text-white transition-all duration-500 shadow-md">
                          <div>
                            <div className="w-16 h-16 bg-[#d0e9d4] rounded-2xl flex items-center justify-center mb-8 text-[#061b0e] group-hover:bg-[#9f402d] group-hover:text-white transition-colors">
                              <CategoryIcon className="w-8 h-8" />
                            </div>
                            <h4 className="text-2xl font-bold mb-4">{event.title}</h4>
                            {event.description && <p className="text-[#434843] group-hover:text-[#b4cdb8] text-base font-light leading-relaxed line-clamp-3">{event.description}</p>}
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

                {/* Location Services Mockup */}
                <div className="bg-[#f4f3f1] rounded-3xl overflow-hidden relative border border-[#c3c8c1]/10 shadow-xl">
                  <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-2/5 p-12 md:p-16 flex flex-col justify-center">
                      <h3 className="text-3xl font-bold tracking-tight text-[#061b0e] mb-6">Location Services</h3>
                      <p className="text-[#434843] text-lg font-light mb-10 leading-relaxed">
                        Your events are automatically mapped to optimize your travel time. We analyze traffic patterns to suggest the best departure times for your upcoming appointments.
                      </p>
                      <div className="flex items-center gap-6">
                        <div className="flex -space-x-3">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-[#d0e9d4] flex items-center justify-center text-[10px] font-bold text-[#061b0e]">
                              JS
                            </div>
                          ))}
                        </div>
                        <span className="text-sm text-[#434843] italic font-medium">Smart routing enabled</span>
                      </div>
                    </div>
                    <div className="lg:w-3/5 h-[300px] lg:h-auto min-h-[400px] relative bg-[#e3e2e0] overflow-hidden">
                      <div className="absolute inset-0 bg-[#9f402d]/5 z-10 pointer-events-none"></div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-20">
                         <MapPin className="w-64 h-64 text-[#061b0e]" />
                      </div>
                      <div className="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <div className="w-6 h-6 bg-[#9f402d] rounded-full ring-[12px] ring-[#9f402d]/20 animate-pulse"></div>
                        <div className="bg-[#061b0e] text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded-md mt-4 shadow-xl">Active Location</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <div className="rounded-3xl w-full h-[400px] md:h-[500px] bg-[#e3e2e2] flex items-center justify-center text-[#434843] font-light italic text-xl border border-[#c3c8c1]/20">
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
