'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PageTabsList } from '@/components/ui/page-tabs-list';
import { Edit2, MapPin, Calendar, Star, ArrowLeft, Info, CalendarDays, Plane, ImageIcon, Waves, Snowflake, Ship, Car, Building, Tent, Mountain, Landmark, Ticket, PartyPopper, Briefcase, Home, HelpCircle } from 'lucide-react';
import { VacationWithDetails, VacationType, VACATION_STATUS_NAMES, VACATION_TYPE_NAMES, calculateDurationDays, parseLocalDate } from '@/lib/types/vacations';
import { BudgetTracker } from './budget-tracker';
import { ItinerarySection } from './itinerary-section';
import { BookingSection } from './booking-section';
import { PhotoGallery } from './photo-gallery';
import { VacationPeopleSection } from './vacation-people-section';

interface VacationDetailClientProps {
  vacationData: VacationWithDetails;
}

type ViewTab = 'overview' | 'itinerary' | 'bookings' | 'photos';

export function VacationDetailClient({ vacationData: initialData }: VacationDetailClientProps) {
  const router = useRouter();
  const [vacationData, setVacationData] = useState(initialData);
  const [viewTab, setViewTab] = useState<ViewTab>('overview');
  const { vacation, itinerary, bookings, photos, people } = vacationData;

  const duration = calculateDurationDays(vacation.start_date, vacation.end_date);

  const handleUpdate = async () => {
    // Fetch fresh data from the API (no cache)
    const response = await fetch(`/api/vacations/${vacation.slug}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    if (response.ok) {
      const freshData = await response.json();
      setVacationData(freshData);
    }
    // Also refresh the server component for consistency
    router.refresh();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'booked':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTypeIcon = (type: VacationType) => {
    const iconClass = "w-3.5 h-3.5";
    switch (type) {
      case 'beach':
        return <Waves className={iconClass} />;
      case 'ski':
        return <Snowflake className={iconClass} />;
      case 'cruise':
        return <Ship className={iconClass} />;
      case 'road-trip':
        return <Car className={iconClass} />;
      case 'city':
        return <Building className={iconClass} />;
      case 'camping':
        return <Tent className={iconClass} />;
      case 'adventure':
        return <Mountain className={iconClass} />;
      case 'cultural':
        return <Landmark className={iconClass} />;
      case 'theme-park':
        return <Ticket className={iconClass} />;
      case 'festival':
        return <PartyPopper className={iconClass} />;
      case 'business':
        return <Briefcase className={iconClass} />;
      case 'staycation':
        return <Home className={iconClass} />;
      default:
        return <HelpCircle className={iconClass} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button variant="ghost" asChild className="w-fit">
          <Link href="/vacations">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vacations
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{vacation.title}</h1>
              {vacation.featured && (
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{vacation.destination}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {parseLocalDate(vacation.start_date).toLocaleDateString()} - {parseLocalDate(vacation.end_date).toLocaleDateString()}
                </span>
              </div>
              <Badge variant={getStatusColor(vacation.status)}>
                {VACATION_STATUS_NAMES[vacation.status]}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1.5">
                {getTypeIcon(vacation.type)}
                <span>{VACATION_TYPE_NAMES[vacation.type]}</span>
              </Badge>
            </div>
          </div>
          <Button asChild>
            <Link href={`/vacations/${vacation.slug}/edit`}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Poster Image */}
      {vacation.poster && (
        <div className="relative w-full h-96 rounded-lg overflow-hidden">
          <img
            src={vacation.poster}
            alt={vacation.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as ViewTab)} className="w-full">
        <PageTabsList
          tabs={[
            { value: 'overview', label: 'Overview', icon: Info, showLabel: false },
            { value: 'itinerary', label: 'Itinerary', icon: CalendarDays, showLabel: false },
            { value: 'bookings', label: 'Bookings', icon: Plane, showLabel: false },
            { value: 'photos', label: 'Photos', icon: ImageIcon, showLabel: false },
          ]}
        />

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 sm:space-y-8 mt-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{duration}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {duration === 1 ? 'day' : 'days'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Itinerary Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{itinerary.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {itinerary.length === duration ? 'Fully planned' : `${duration - itinerary.length} days unplanned`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookings.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {bookings.filter(b => b.status === 'confirmed').length} confirmed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Budget Tracker */}
          <BudgetTracker vacation={vacation} itinerary={itinerary} bookings={bookings} />

          {/* Travel Companions */}
          <VacationPeopleSection
            vacationSlug={vacation.slug}
            people={people}
            onUpdate={handleUpdate}
          />

          {/* Description */}
          {vacation.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{vacation.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Rating */}
          {vacation.rating && (
            <Card>
              <CardHeader>
                <CardTitle>Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-2xl font-bold">{vacation.rating}</span>
                  <span className="text-muted-foreground">/ 10</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {vacation.tags && vacation.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {vacation.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trip Notes */}
          {vacation.content && (
            <Card>
              <CardHeader>
                <CardTitle>Trip Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: vacation.content.replace(/\n/g, '<br/>') }} />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Itinerary Tab */}
        <TabsContent value="itinerary" className="space-y-6 sm:space-y-8 mt-6">
          <ItinerarySection vacation={vacation} itinerary={itinerary} onUpdate={handleUpdate} />
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6 sm:space-y-8 mt-6">
          <BookingSection vacation={vacation} bookings={bookings} onUpdate={handleUpdate} />
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-6 sm:space-y-8 mt-6">
          <PhotoGallery vacation={vacation} photos={photos} onUpdate={handleUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
