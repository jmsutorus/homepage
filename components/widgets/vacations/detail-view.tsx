'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  VacationWithDetails,
  parseLocalDate,
  calculateTotalBudget,
  BookingType,
  BOOKING_TYPES,
  BOOKING_TYPE_NAMES,
  BookingStatus,
  BOOKING_STATUSES,
  BOOKING_STATUS_NAMES,
  ItineraryDay,
  Booking
} from '@/lib/types/vacations';
import { Edit2, ArrowLeft, Plus, PlusCircle, Pencil, Image as ImageIcon, Trash2 } from 'lucide-react';
import { VacationPosterEditDialog } from './vacation-poster-edit-dialog';
import { VacationPhotoAddDialog } from './vacation-photo-add-dialog';
import { VacationDayPhotoEditDialog } from './vacation-day-photo-edit-dialog';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { showCreationSuccess, showCreationError } from '@/lib/success-toasts';
import { AddPersonDialog } from './add-person-dialog';

interface DetailViewProps {
  vacationData: VacationWithDetails;
  onUpdate: () => void;
}

export function DetailView({ vacationData, onUpdate }: DetailViewProps) {
  const { vacation, itinerary, bookings, photos, people } = vacationData;
  const [isAddingDay, setIsAddingDay] = useState(false);
  const [isAddingBooking, setIsAddingBooking] = useState(false);
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [editingDayId, setEditingDayId] = useState<number | null>(null);
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);
  const [isPosterDialogOpen, setIsPosterDialogOpen] = useState(false);
  const [isPhotoAddDialogOpen, setIsPhotoAddDialogOpen] = useState(false);
  const [isDayPhotoEditDialogOpen, setIsDayPhotoEditDialogOpen] = useState(false);
  const [activeDayForPhotoEdit, setActiveDayForPhotoEdit] = useState<ItineraryDay | null>(null);
  const [dayFormData, setDayFormData] = useState<Partial<ItineraryDay>>({});
  const [bookingFormData, setBookingFormData] = useState<Partial<Booking>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleOpeningAddDay = () => {
    setEditingDayId(null);
    const nextDayNumber = itinerary.length + 1;
    const startDateRaw = parseLocalDate(vacation.start_date);
    const nextDate = new Date(startDateRaw.getTime() + (nextDayNumber - 1) * 24 * 60 * 60 * 1000);
    const dateStr = nextDate.toISOString().split('T')[0];

    setDayFormData({
      day_number: nextDayNumber,
      date: dateStr,
      title: '',
      location: '',
      activities: [],
      notes: '',
      photo: '',
    });
    setIsAddingDay(true);
  };

  const handleOpeningDayPhotoEdit = (e: React.MouseEvent, day: ItineraryDay) => {
    e.stopPropagation();
    setActiveDayForPhotoEdit(day);
    setIsDayPhotoEditDialogOpen(true);
  };

  const handleOpeningEditDay = (day: ItineraryDay) => {
    setEditingDayId(day.id);
    setDayFormData({
      ...day,
      date: parseLocalDate(day.date).toISOString().split('T')[0],
    });
    setIsAddingDay(true);
  };

  const handleSaveDay = async () => {
    if (!dayFormData.date) return;
    setIsSaving(true);
    try {
      const endpoint = editingDayId 
        ? `/api/vacations/${vacation.slug}/itinerary/${editingDayId}`
        : `/api/vacations/${vacation.slug}/itinerary`;
      
      const method = editingDayId ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dayFormData,
          activities: dayFormData.activities?.filter(Boolean) || [],
        }),
      });

      if (!response.ok) throw new Error('Failed to save itinerary day');

      showCreationSuccess('event');
      setIsAddingDay(false);
      setEditingDayId(null);
      onUpdate();
    } catch (error) {
      showCreationError('event', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDay = async () => {
    if (!editingDayId || !confirm('Delete this itinerary day?')) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/vacations/${vacation.slug}/itinerary/${editingDayId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete itinerary day');

      showCreationSuccess('event');
      setIsAddingDay(false);
      setEditingDayId(null);
      onUpdate();
    } catch (error) {
      showCreationError('event', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpeningAddBooking = () => {
    setEditingBookingId(null);
    setBookingFormData({ type: 'flight' as BookingType, status: 'pending' as BookingStatus });
    setIsAddingBooking(true);
  };

  const handleOpeningEditBooking = (booking: Booking) => {
    setEditingBookingId(booking.id as number);
    setBookingFormData({
      ...booking,
      date: booking.date ? parseLocalDate(booking.date).toISOString().split('T')[0] : '',
    });
    setIsAddingBooking(true);
  };

  const handleSaveBooking = async () => {
    if (!bookingFormData.type || !bookingFormData.title) return;
    setIsSaving(true);
    try {
      const endpoint = editingBookingId 
        ? `/api/vacations/${vacation.slug}/bookings/${editingBookingId}`
        : `/api/vacations/${vacation.slug}/bookings`;
      
      const method = editingBookingId ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingFormData),
      });

      if (!response.ok) throw new Error('Failed to save booking');

      showCreationSuccess('event');
      setIsAddingBooking(false);
      setEditingBookingId(null);
      onUpdate();
    } catch (error) {
      showCreationError('event', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!editingBookingId || !confirm('Delete this booking?')) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/vacations/${vacation.slug}/bookings/${editingBookingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete booking');

      showCreationSuccess('event');
      setIsAddingBooking(false);
      setEditingBookingId(null);
      onUpdate();
    } catch (error) {
      showCreationError('event', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePerson = async (personAssociationId: number, personName: string) => {
    if (!confirm(`Remove ${personName} from this vacation?`)) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/vacations/${vacation.slug}/people/${personAssociationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove person');

      showCreationSuccess('event');
      onUpdate();
    } catch (error) {
      showCreationError('event', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('Delete this memory? This will permanently remove the photo.')) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/vacations/${vacation.slug}/photos/${photoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete photo');

      toast.success('Memory removed');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete photo');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const { actualTotal, plannedTotal } = calculateTotalBudget(itinerary, bookings);
  
  const startDate = parseLocalDate(vacation.start_date);
  const endDate = parseLocalDate(vacation.end_date);
  
  const formatDateRange = () => {
    const startStr = startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const endStr = endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return `${startStr} — ${endStr}`;
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 9) return 'Phenomenal';
    if (rating >= 8) return 'Excellent';
    if (rating >= 7) return 'Great';
    if (rating >= 5) return 'Good';
    return 'Memorable';
  };

  return (
    <div className="text-media-on-surface selection:bg-media-secondary-fixed">
      <main className="pt-8 pb-32 max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Navigation / Actions */}
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" asChild className="rounded-full">
            <Link href="/vacations">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Journeys
            </Link>
          </Button>
          <Button asChild className="rounded-full bg-media-primary text-media-on-primary hover:bg-media-primary/90">
            <Link href={`/vacations/${vacation.slug}/edit`}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit details
            </Link>
          </Button>
        </div>

        <div className="space-y-24">
          {/* Hero Section */}
          <section className="relative h-[600px] md:h-[819px] w-full rounded-3xl overflow-hidden shadow-2xl">
            {vacation.poster ? (
              <img 
                className="absolute inset-0 w-full h-full object-cover" 
                src={vacation.poster} 
                alt={vacation.title} 
              />
            ) : (
              <div className="absolute inset-0 bg-media-primary-container"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-media-primary/80 via-transparent to-transparent"></div>

            {/* Photo Edit Button */}
            <button 
              onClick={() => setIsPosterDialogOpen(true)}
              className="absolute top-8 right-8 z-20 bg-media-background/20 backdrop-blur-md p-3 rounded-full hover:bg-media-background/40 transition-all text-media-on-primary cursor-pointer group"
              title="Edit Vacation Poster"
            >
              <Pencil className="h-6 w-6 group-hover:scale-110 transition-transform" />
            </button>

            <div className="absolute bottom-16 left-8 right-8 md:left-12 md:right-12 flex flex-col items-start gap-4">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                <span className="text-white text-xs font-bold tracking-[0.2em] uppercase">{vacation.destination}</span>
              </div>
              <h1 className="text-white text-5xl md:text-8xl font-black tracking-tighter leading-none max-w-4xl">
                {vacation.title}
              </h1>
              <p className="text-white/80 text-xl font-light tracking-wide max-w-lg mt-4">
                {formatDateRange()}. {vacation.description || 'A timeless collection of moments and memories.'}
              </p>
            </div>
          </section>

          {/* Stats Row */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-media-surface-container-lowest p-8 rounded-2xl flex flex-col justify-between h-48 group hover:scale-[1.02] transition-transform shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-media-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-bold">Budget Status</span>
                <span className="material-symbols-outlined text-media-secondary text-xl">payments</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold text-media-primary">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: vacation.budget_currency || 'USD', maximumFractionDigits: 0 }).format(actualTotal)}
                  </span>
                  {vacation.budget_planned && (
                    <span className="text-media-on-surface-variant text-xs">of {new Intl.NumberFormat('en-US', { style: 'currency', currency: vacation.budget_currency || 'USD', maximumFractionDigits: 0 }).format(vacation.budget_planned)}</span>
                  )}
                </div>
                {vacation.budget_planned && (
                  <div className="w-full h-1.5 bg-media-surface-container-high rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-media-secondary rounded-full" 
                      style={{ width: `${Math.min(100, (actualTotal / vacation.budget_planned) * 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-media-surface-container-lowest p-8 rounded-2xl flex flex-col justify-between h-48 group hover:scale-[1.02] transition-transform shadow-sm relative">
              <div className="flex justify-between items-start">
                <span className="text-media-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-bold">Companions</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsAddingPerson(true)}
                    className="cursor-pointer text-media-primary hover:text-media-secondary transition-colors"
                    title="Add Companion"
                  >
                    <PlusCircle className="w-5 h-5" />
                  </button>
                  <span className="material-symbols-outlined text-media-secondary text-xl">group</span>
                </div>
              </div>
              <div className="flex -space-x-3 mt-4">
                <TooltipProvider>
                  {people.slice(0, 3).map((person) => (
                    <Tooltip key={person.id}>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={() => handleRemovePerson(person.id, person.name)}
                          className="w-12 h-12 rounded-full border-4 border-media-surface-container-lowest bg-media-primary-fixed flex items-center justify-center text-media-on-primary-fixed font-bold text-xs overflow-hidden hover:scale-110 hover:z-10 transition-transform cursor-pointer shadow-sm"
                        >
                          {person.photo ? <img src={person.photo} alt={person.name} className="w-full h-full object-cover" /> : person.name.substring(0, 2).toUpperCase()}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{person.name} (Click to remove)</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
                {people.length > 3 && (
                  <div className="w-12 h-12 rounded-full border-4 border-media-surface-container-lowest bg-media-primary-fixed flex items-center justify-center text-media-on-primary-fixed font-bold text-xs">
                    +{people.length - 3}
                  </div>
                )}
              </div>
              <p className="text-xs text-media-on-surface-variant mt-auto">
                {people.length === 0 ? 'Travelling solo' : people.length === 1 ? 'With 1 companion' : `With ${people.length} companions`}
              </p>
            </div>

            <div className="bg-media-surface-container-lowest p-8 rounded-2xl flex flex-col justify-between h-48 group hover:scale-[1.02] transition-transform text-media-primary shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-media-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-bold">Editorial Rating</span>
                <span className="material-symbols-outlined text-media-secondary text-xl">star</span>
              </div>
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => {
                    const ratingValue = (vacation.rating || 0) / 2;
                    return (
                      <span 
                        key={i} 
                        className="material-symbols-outlined text-media-secondary" 
                        style={{ fontVariationSettings: i < Math.floor(ratingValue) ? "'FILL' 1" : i < ratingValue ? "'FILL' 0.5" : "'FILL' 0" }}
                      >
                        {i < Math.floor(ratingValue) ? 'star' : i < ratingValue ? 'star_half' : 'star'}
                      </span>
                    );
                  })}
                </div>
                <p className="text-2xl font-bold tracking-tight">{getRatingLabel(vacation.rating || 0)}</p>
              </div>
            </div>

            <div className="bg-media-surface-container-lowest p-8 rounded-2xl flex flex-col justify-between h-48 group hover:scale-[1.02] transition-transform shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-media-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-bold">Tags</span>
                <span className="material-symbols-outlined text-media-secondary text-xl">label</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {vacation.tags.length > 0 ? (
                  vacation.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-media-tertiary-fixed text-media-on-tertiary-fixed text-[10px] font-bold uppercase tracking-wider rounded-full">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-media-on-surface-variant">No tags added</span>
                )}
              </div>
            </div>
          </section>

          {/* Itinerary Section */}
          {itinerary.length > 0 && (
            <section className="space-y-16">
              <div className="flex items-baseline gap-4">
                <h2 className="text-5xl font-black tracking-tighter text-media-primary">Itinerary</h2>
                <div className="h-px flex-grow bg-media-outline-variant/30"></div>
                <Button 
                  onClick={handleOpeningAddDay}
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full text-media-primary hover:bg-media-primary/10"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Day
                </Button>
              </div>
              <div className="space-y-32">
                {itinerary.map((day, idx) => (
                  <article 
                    key={day.id} 
                    onClick={() => handleOpeningEditDay(day)}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center cursor-pointer group hover:bg-media-surface-container-low/30 rounded-3xl -m-6 px-6 py-12 transition-all"
                  >
                    <div className={`lg:col-span-5 space-y-6 ${idx % 2 === 1 ? 'order-1 lg:order-2 lg:pl-12' : ''}`}>
                      <div className="flex items-center gap-4">
                        <span className="text-7xl font-black text-media-secondary/20 transition-colors group-hover:text-media-secondary/40">{String(day.day_number).padStart(2, '0')}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-3xl font-bold text-media-primary">{day.title || 'Journal Entry'}</h3>
                            <span className="material-symbols-outlined text-media-primary/0 group-hover:text-media-primary/40 text-sm transition-colors">edit</span>
                          </div>
                          <p className="text-media-on-surface-variant font-medium">
                            {parseLocalDate(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4 pt-4">
                        {day.notes && <p className="text-media-on-surface-variant leading-relaxed">{day.notes}</p>}
                        <ul className="space-y-4 mt-4">
                          {day.activities.map((activity, aIdx) => (
                            <li key={aIdx} className="flex items-start gap-4 group">
                              <span className="w-2 h-2 rounded-full bg-media-secondary mt-2 group-hover:scale-150 transition-transform"></span>
                              <p className="font-bold text-media-primary">{activity}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className={`lg:col-span-7 relative ${idx % 2 === 1 ? 'order-2 lg:order-1' : ''}`}>
                      <div className={`absolute -top-4 ${idx % 2 === 1 ? '-right-4' : '-left-4'} w-full h-full ${idx % 2 === 1 ? 'bg-media-secondary-fixed' : 'bg-media-primary-fixed'} rounded-3xl -z-10 transform ${idx % 2 === 1 ? '-rotate-1' : 'rotate-1'}`}></div>
                      <div className="w-full aspect-[16/10] bg-media-surface-container-high rounded-3xl shadow-xl overflow-hidden flex items-center justify-center relative group/photo">
                         {day.photo ? (
                           <img src={day.photo} alt={day.title || `Day ${day.day_number}`} className="w-full h-full object-cover" />
                         ) : (
                           <span className="material-symbols-outlined text-6xl text-media-primary/20">landscape</span>
                         )}
                         
                         <button
                           onClick={(e) => handleOpeningDayPhotoEdit(e, day)}
                           className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover/photo:opacity-100 transition-opacity hover:bg-black/70 cursor-pointer z-10"
                           title="Edit Day Photo"
                         >
                           <Pencil className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Logistics Section */}
          {bookings.length > 0 && (
            <section className="space-y-8">
              <div className="flex items-baseline gap-4">
                <h2 className="text-5xl font-black tracking-tighter text-media-primary">Travel Logistics</h2>
                <div className="h-px flex-grow bg-media-outline-variant/30"></div>
                <Button 
                  onClick={handleOpeningAddBooking}
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full text-media-primary hover:bg-media-primary/10"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Booking
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {bookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    onClick={() => handleOpeningEditBooking(booking)}
                    className="bg-media-surface-container-low p-8 rounded-3xl border border-dashed border-media-outline-variant relative overflow-hidden group cursor-pointer hover:bg-media-surface-container-high transition-colors"
                  >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-media-primary opacity-5 rounded-full scale-150 group-hover:scale-110 transition-transform"></div>
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-media-secondary">{booking.type}</span>
                          <span className="material-symbols-outlined text-media-primary/0 group-hover:text-media-primary/40 text-xs transition-colors">edit</span>
                        </div>
                        <h3 className="text-2xl font-bold text-media-primary mt-1">{booking.title}</h3>
                      </div>
                      <span className="material-symbols-outlined text-4xl text-media-primary/20">
                        {booking.type === 'flight' ? 'flight_takeoff' : booking.type === 'hotel' ? 'hotel' : 'event'}
                      </span>
                    </div>
                    
                    {booking.type === 'flight' ? (
                       <div className="flex justify-between items-center mb-10">
                        <div className="text-center">
                          <p className="text-3xl font-black text-media-primary">{booking.location?.split(' to ')[0] || 'DEP'}</p>
                          <p className="text-[10px] font-bold opacity-60">DEPARTURE</p>
                        </div>
                        <div className="flex-grow px-6 flex items-center">
                          <div className="h-[1px] w-full bg-media-outline-variant relative">
                            <div className="absolute left-1/2 -translate-x-1/2 -top-3">
                              <span className="material-symbols-outlined text-sm text-media-secondary">favorite</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-black text-media-primary">{booking.location?.split(' to ')[1] || 'ARR'}</p>
                          <p className="text-[10px] font-bold opacity-60">ARRIVAL</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 mb-10">
                        <p className="text-sm font-medium text-media-on-surface-variant flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          {booking.location}
                        </p>
                        <div className="flex gap-12">
                          {booking.date && (
                             <div>
                              <p className="text-[10px] uppercase font-bold opacity-50">Date</p>
                              <p className="font-bold">{parseLocalDate(booking.date).toLocaleDateString()}</p>
                            </div>
                          )}
                          {booking.start_time && (
                             <div>
                              <p className="text-[10px] uppercase font-bold opacity-50">Time</p>
                              <p className="font-bold">{booking.start_time}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-6 border-t border-media-outline-variant/30">
                      <div>
                        <p className="text-[10px] uppercase font-bold opacity-50">Confirmation Number</p>
                        <p className="font-bold text-media-secondary tracking-widest">{booking.confirmation_number || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Memories / Photo Gallery Section */}
          <section className="space-y-12">
            <div className="flex items-baseline gap-4">
              <h2 className="text-5xl font-black tracking-tighter text-media-primary">Memories</h2>
              <div className="h-px flex-grow bg-media-outline-variant/30"></div>
              <Button 
                onClick={() => setIsPhotoAddDialogOpen(true)}
                variant="ghost" 
                size="sm" 
                className="rounded-full text-media-primary hover:bg-media-primary/10"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Memory
              </Button>
            </div>
            {photos.length > 0 ? (
              <div className="staggered-gap">
                {photos.map((photo) => (
                  <div key={photo.id} className="group relative overflow-hidden rounded-2xl shadow-md">
                    <img 
                      className="w-full grayscale hover:grayscale-0 transition-all duration-500 hover:scale-105" 
                      src={photo.url} 
                      alt={photo.caption || 'Vacation memory'} 
                    />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photo.id);
                      }}
                      className="absolute top-2 right-2 p-2 bg-media-error/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-media-error cursor-pointer z-10"
                      title="Delete memory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 px-8 rounded-[2.5rem] bg-media-surface-container-low border-2 border-dashed border-media-outline-variant text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20 text-media-primary" />
                <p className="text-media-on-surface-variant italic">No memories captured yet.</p>
                <Button 
                  variant="link" 
                  className="text-media-secondary font-black uppercase tracking-tighter" 
                  onClick={() => setIsPhotoAddDialogOpen(true)}
                >
                  Capture First Moment
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>
      {/* Add/Edit Itinerary Day Dialog */}
      <Dialog open={isAddingDay} onOpenChange={(open) => {
        setIsAddingDay(open);
        if (!open) setEditingDayId(null);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingDayId ? 'Edit' : 'Add'} Itinerary Day {dayFormData.day_number}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input
                id="date"
                type="date"
                value={dayFormData.date || ''}
                onChange={(e) => setDayFormData({ ...dayFormData, date: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input
                id="title"
                value={dayFormData.title || ''}
                onChange={(e) => setDayFormData({ ...dayFormData, title: e.target.value })}
                placeholder="e.g., Morning Adventure"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="activities" className="text-right">Activities</Label>
              <Textarea
                id="activities"
                value={(dayFormData.activities || []).join('\n')}
                onChange={(e) => setDayFormData({ ...dayFormData, activities: e.target.value.split('\n') })}
                placeholder="Activity per line"
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Notes</Label>
              <Textarea
                id="notes"
                value={dayFormData.notes || ''}
                onChange={(e) => setDayFormData({ ...dayFormData, notes: e.target.value })}
                placeholder="Optional notes"
                className="col-span-3"
                 rows={2}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between items-center sm:justify-between w-full">
            {editingDayId ? (
              <Button variant="destructive" onClick={handleDeleteDay} disabled={isSaving} size="sm">
                Delete Day
              </Button>
            ) : <div />}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsAddingDay(false)} disabled={isSaving} size="sm">Cancel</Button>
              <Button onClick={handleSaveDay} disabled={isSaving} size="sm">
                {isSaving ? 'Saving...' : editingDayId ? 'Save Changes' : 'Add Activity'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Booking Dialog */}
      <Dialog open={isAddingBooking} onOpenChange={(open) => {
        setIsAddingBooking(open);
        if (!open) setEditingBookingId(null);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingBookingId ? 'Edit' : 'Add'} Booking</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="b-type">Type</Label>
                <Select
                  value={bookingFormData.type || 'flight'}
                  onValueChange={(value) => setBookingFormData({ ...bookingFormData, type: value as BookingType })}
                >
                  <SelectTrigger id="b-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOKING_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {BOOKING_TYPE_NAMES[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="b-status">Status</Label>
                <Select
                  value={bookingFormData.status || 'pending'}
                  onValueChange={(value) => setBookingFormData({ ...bookingFormData, status: value as BookingStatus })}
                >
                  <SelectTrigger id="b-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOKING_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {BOOKING_STATUS_NAMES[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="b-title">Title *</Label>
              <Input
                id="b-title"
                value={bookingFormData.title || ''}
                onChange={(e) => setBookingFormData({ ...bookingFormData, title: e.target.value })}
                placeholder="e.g., United Flight 1234"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="b-provider">Provider</Label>
              <Input
                id="b-provider"
                value={bookingFormData.provider || ''}
                onChange={(e) => setBookingFormData({ ...bookingFormData, provider: e.target.value })}
                placeholder="e.g., Delta, Hilton"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="b-date">Date</Label>
                <Input
                  id="b-date"
                  type="date"
                  value={bookingFormData.date || ''}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="b-cost">Cost</Label>
                <Input
                  id="b-cost"
                  type="number"
                  value={bookingFormData.cost || ''}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, cost: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="b-confirmation">Confirmation #</Label>
              <Input
                id="b-confirmation"
                value={bookingFormData.confirmation_number || ''}
                onChange={(e) => setBookingFormData({ ...bookingFormData, confirmation_number: e.target.value })}
                placeholder="XYZ123"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="b-location">Location</Label>
              <Input
                id="b-location"
                value={bookingFormData.location || ''}
                onChange={(e) => setBookingFormData({ ...bookingFormData, location: e.target.value })}
                placeholder="Address or airports"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between items-center sm:justify-between w-full">
            {editingBookingId ? (
              <Button variant="destructive" onClick={handleDeleteBooking} disabled={isSaving} size="sm">
                Delete Booking
              </Button>
            ) : <div />}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsAddingBooking(false)} disabled={isSaving} size="sm">Cancel</Button>
              <Button onClick={handleSaveBooking} disabled={isSaving} size="sm">
                {isSaving ? 'Saving...' : editingBookingId ? 'Save Changes' : 'Add Booking'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddPersonDialog
        vacationSlug={vacation.slug}
        existingPeople={people}
        open={isAddingPerson}
        onOpenChange={setIsAddingPerson}
        onSuccess={() => {
          setIsAddingPerson(false);
          onUpdate();
        }}
      />
      <VacationPosterEditDialog
        open={isPosterDialogOpen}
        onOpenChange={setIsPosterDialogOpen}
        vacation={vacation}
        onSuccess={onUpdate}
      />

      <VacationPhotoAddDialog
        open={isPhotoAddDialogOpen}
        onOpenChange={setIsPhotoAddDialogOpen}
        vacation={vacation}
        onSuccess={onUpdate}
      />

      {activeDayForPhotoEdit && (
        <VacationDayPhotoEditDialog
          open={isDayPhotoEditDialogOpen}
          onOpenChange={setIsDayPhotoEditDialogOpen}
          vacation={vacation}
          day={activeDayForPhotoEdit}
          onSuccess={onUpdate}
        />
      )}
    </div>
  );
}
