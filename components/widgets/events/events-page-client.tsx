'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Calendar, MapPin, CalendarDays } from 'lucide-react';
import type { Event } from '@/lib/db/events';
import { HolidayIcon, hasHolidayIcon } from './holiday-icons';

interface EventsPageClientProps {
  events: Event[];
}

export function EventsPageClient({ events }: EventsPageClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Get unique categories
  const categories = Array.from(new Set(events.map(e => e.category).filter(Boolean)));

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      searchTerm === '' ||
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Group events by year
  const eventsByYear = filteredEvents.reduce((acc, event) => {
    const year = new Date(event.date).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(event);
    return acc;
  }, {} as Record<number, Event[]>);

  // Sort years descending
  const sortedYears = Object.keys(eventsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="w-7 h-7" />
            Events
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Browse and manage your calendar events
          </p>
        </div>
        <Button onClick={() => router.push('/calendar')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category!}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      {(searchTerm || categoryFilter !== 'all') && (
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredEvents.length} of {events.length} events
        </p>
      )}

      {/* Events by Year */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No events found</p>
            <p className="text-sm mt-1">Create events from the calendar page</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {sortedYears.map((year) => (
            <div key={year}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-muted-foreground">{year}</span>
                <Badge variant="secondary">{eventsByYear[year].length}</Badge>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {eventsByYear[year].map((event) => (
                  <Link key={event.id} href={`/events/${event.slug}`}>
                    <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer relative overflow-hidden">
                      {/* Holiday Icon */}
                      {hasHolidayIcon(event.title) && (
                        <div className="absolute top-3 right-3">
                          <HolidayIcon type={event.title} className="w-6 h-6" />
                        </div>
                      )}
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base line-clamp-1">
                            {event.title}
                          </CardTitle>
                          {event.category && !hasHolidayIcon(event.title) && (
                            <Badge variant="outline" className="shrink-0 text-xs">
                              {event.category}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarDays className="w-4 h-4" />
                          <span>
                            {formatDate(event.date)}
                            {event.end_date && event.end_date !== event.date && (
                              <> - {formatDate(event.end_date)}</>
                            )}
                          </span>
                        </div>
                        {!event.all_day && event.start_time && (
                          <div className="text-sm text-muted-foreground ml-6">
                            {formatTime(event.start_time)}
                            {event.end_time && ` - ${formatTime(event.end_time)}`}
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        )}
                        {event.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
