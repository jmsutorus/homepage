'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  VACATION_STATUS_NAMES, 
  parseLocalDate,
  calculateTotalBudget,
  ItineraryDay,
  BookingType,
  BOOKING_TYPES,
  BOOKING_TYPE_NAMES,
  BookingStatus,
  BOOKING_STATUSES,
  BOOKING_STATUS_NAMES,
  Booking
} from '@/lib/types/vacations';
import { Edit2, ArrowLeft, PlusCircle, Check, X, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { showCreationSuccess, showCreationError } from '@/lib/success-toasts';
import { AddPersonDialog } from './add-person-dialog';

interface PlannedViewProps {
  vacationData: VacationWithDetails;
  onUpdate: () => void;
}

export function PlannedView({ vacationData, onUpdate }: PlannedViewProps) {
  const { vacation, itinerary, bookings, people } = vacationData;
  const [isAddingDay, setIsAddingDay] = useState(false);
  const [isAddingBooking, setIsAddingBooking] = useState(false);
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [editingDayId, setEditingDayId] = useState<number | null>(null);
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);
  const [dayFormData, setDayFormData] = useState<Partial<ItineraryDay>>({});
  const [bookingFormData, setBookingFormData] = useState<Partial<Booking>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleOpeningAddDay = () => {
    setEditingDayId(null);
    const nextDayNumber = itinerary.length + 1;
    const startDate = parseLocalDate(vacation.start_date);
    const nextDate = new Date(startDate.getTime() + (nextDayNumber - 1) * 24 * 60 * 60 * 1000);
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

  const handleOpeningEditDay = (day: ItineraryDay) => {
    setEditingDayId(day.id);
    setDayFormData({
      ...day,
      date: parseLocalDate(day.date).toISOString().split('T')[0],
    });
    setIsAddingDay(true);
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

  const startDate = parseLocalDate(vacation.start_date);
  const { plannedTotal } = calculateTotalBudget(itinerary, bookings);
  
  // Get year and season for the badge
  const year = startDate.getFullYear();
  const month = startDate.getMonth();
  let season = 'Winter';
  if (month >= 2 && month <= 4) season = 'Spring';
  else if (month >= 5 && month <= 7) season = 'Summer';
  else if (month >= 8 && month <= 10) season = 'Fall';

  return (
    <div className="bg-media-background text-media-on-surface min-h-screen">
      <main className="max-w-[1400px] mx-auto p-8 md:p-12">
        <header className="mb-12">
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-media-tertiary-fixed text-media-on-tertiary-fixed px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              {season} {year}
            </span>
            <span className="bg-media-tertiary-fixed text-media-on-tertiary-fixed px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              {vacation.destination}
            </span>
            {vacation.tags.map(tag => (
              <span key={tag} className="bg-media-tertiary-fixed text-media-on-tertiary-fixed px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
            <h1 className="text-4xl md:text-6xl font-black text-media-primary tracking-tighter leading-none">
              {vacation.title}
            </h1>
            <div className="flex gap-2">
              <Button variant="outline" asChild size="sm" className="rounded-full">
                <Link href="/vacations">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Link>
              </Button>
              <Button asChild size="sm" className="rounded-full bg-media-primary text-media-on-primary hover:bg-media-primary/90">
                <Link href={`/vacations/${vacation.slug}/edit`}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
            </div>
          </div>
          
          <p className="text-media-on-surface-variant text-xl max-w-2xl">
            {vacation.description || 'A curated journey through discovery and experience.'}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            {/* Trip Overview Card */}
            <section className="bg-media-surface-container-low p-8 rounded-xl relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-media-secondary opacity-5 -mr-16 -mt-16 rounded-full"></div>
              <h3 className="text-media-secondary font-bold uppercase tracking-widest text-xs mb-6">Trip Overview</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-media-on-surface-variant text-xs uppercase tracking-widest mb-1">Status</p>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${vacation.status === 'planning' ? 'bg-media-secondary' : 'bg-green-500'}`}></span>
                    <p className="text-media-primary font-bold text-lg">{VACATION_STATUS_NAMES[vacation.status]}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-media-on-surface-variant text-xs uppercase tracking-widest mb-1">Budget Allocation</p>
                  <p className="text-media-primary font-bold text-3xl">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: vacation.budget_currency || 'USD' }).format(plannedTotal || vacation.budget_planned || 0)}
                  </p>
                  <p className="text-media-on-surface-variant text-xs mt-1">
                    {vacation.budget_planned ? `${Math.round(((plannedTotal || 0) / vacation.budget_planned) * 100)}% of target reached` : 'Target not set'}
                  </p>
                </div>

                {people.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-media-on-surface-variant text-xs uppercase tracking-widest">Companions</p>
                      <button 
                        onClick={() => setIsAddingPerson(true)}
                        className="cursor-pointer text-media-primary hover:text-media-secondary transition-colors"
                        title="Add Companion"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex -space-x-2 mt-2">
                      <TooltipProvider>
                        {people.slice(0, 3).map((person) => (
                          <Tooltip key={person.id}>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => handleRemovePerson(person.id, person.name)}
                                className="w-10 h-10 rounded-full border-2 border-media-surface-container-low bg-media-primary-fixed-dim flex items-center justify-center text-media-primary text-xs font-bold overflow-hidden hover:scale-110 hover:z-10 transition-transform cursor-pointer shadow-sm"
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
                        <div className="w-10 h-10 rounded-full border-2 border-media-surface-container-low bg-media-outline-variant flex items-center justify-center text-media-on-surface text-xs font-bold">
                          +{people.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Quick Links / Content Section */}
            {(vacation.content || vacation.tags.length > 0) && (
              <section className="bg-media-surface-container-highest p-8 rounded-xl shadow-sm">
                <h3 className="text-media-primary font-bold uppercase tracking-widest text-xs mb-6 flex justify-between items-center">
                  Trip Notes
                  <span className="material-symbols-outlined text-sm">description</span>
                </h3>
                <div className="prose prose-sm text-media-on-surface-variant max-h-60 overflow-y-auto custom-scrollbar">
                  {vacation.content ? (
                    <div dangerouslySetInnerHTML={{ __html: vacation.content.replace(/\n/g, '<br/>') }} />
                  ) : (
                    <p>No notes for this journey yet.</p>
                  )}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-8 space-y-8">
            {/* Travel Logistics */}
            <section className="bg-media-surface-container-low p-8 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-media-primary tracking-tight">Travel Logistics</h2>
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
              
              <div className="space-y-6">
                {bookings.length === 0 ? (
                  <div className="bg-media-surface-container-lowest p-6 rounded-lg text-center border-2 border-dashed border-media-outline-variant">
                    <p className="text-media-on-surface-variant">No bookings added yet.</p>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div 
                      key={booking.id} 
                      onClick={() => handleOpeningEditBooking(booking)}
                      className={`bg-media-surface-container-lowest p-6 rounded-lg shadow-sm border-l-4 ${booking.type === 'flight' ? 'border-media-secondary' : 'border-media-primary'} cursor-pointer hover:bg-media-surface-container-low transition-colors group relative`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="material-symbols-outlined text-media-primary text-3xl">
                            {booking.type === 'flight' ? 'flight_takeoff' : booking.type === 'hotel' ? 'hotel' : 'event'}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-media-primary font-black text-lg">{booking.title}</p>
                              <span className="material-symbols-outlined text-media-primary/0 group-hover:text-media-primary/40 text-sm transition-colors">edit</span>
                            </div>
                            <p className="text-media-on-surface-variant text-sm">{booking.provider} • {booking.location}</p>
                          </div>
                        </div>
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="rounded uppercase text-[10px] tracking-tighter">
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-media-surface-container">
                        <div>
                          <p className="text-media-on-surface-variant text-[10px] uppercase tracking-widest">Date</p>
                          <p className="text-media-primary font-bold">{booking.date ? parseLocalDate(booking.date).toLocaleDateString() : 'TBD'}</p>
                        </div>
                        {booking.start_time && (
                          <div>
                            <p className="text-media-on-surface-variant text-[10px] uppercase tracking-widest">Time</p>
                            <p className="text-media-primary font-bold">{booking.start_time}</p>
                          </div>
                        )}
                        {booking.confirmation_number && (
                          <div className="col-span-1 md:col-span-2">
                            <p className="text-media-on-surface-variant text-[10px] uppercase tracking-widest">Confirmation #</p>
                            <p className="text-media-secondary font-bold truncate">{booking.confirmation_number}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Planned Itinerary */}
            <section className="bg-media-surface p-8 rounded-xl shadow-sm border border-media-surface-container">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-media-primary tracking-tight">Planned Itinerary</h2>
              </div>
              
              <div className="space-y-0 relative border-l-2 border-media-surface-container ml-4">
                {itinerary.length === 0 ? (
                  <div className="pl-10 pb-12 relative">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-media-outline-variant ring-4 ring-media-surface"></div>
                    <p className="text-media-on-surface-variant italic">No itinerary days planned yet.</p>
                  </div>
                ) : (
                  itinerary.map((day, i) => (
                    <div 
                      key={day.id} 
                      onClick={() => handleOpeningEditDay(day)}
                      className="relative pb-12 pl-10 group cursor-pointer"
                    >
                      <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full ${i === 0 ? 'bg-media-secondary' : 'bg-media-primary'} ring-4 ring-media-surface transition-transform group-hover:scale-125 z-10`}></div>
                      <div className="bg-transparent group-hover:bg-media-surface-container-low/50 p-4 -m-4 rounded-xl transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-media-on-surface-variant text-xs font-bold uppercase tracking-widest">
                            Day {day.day_number} • {parseLocalDate(day.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                          </p>
                          <span className="material-symbols-outlined text-media-primary/0 group-hover:text-media-primary/40 text-sm transition-colors">edit</span>
                        </div>
                        <h4 className="text-media-primary font-black text-xl mb-2">{day.title || 'Untitled Day'}</h4>
                        {day.notes && <p className="text-media-on-surface-variant text-sm leading-relaxed mb-4 line-clamp-2">{day.notes}</p>}
                        <div className="flex flex-wrap gap-2">
                          {day.activities.map((activity, idx) => (
                            <span key={idx} className="bg-media-surface-container px-3 py-1 rounded text-[10px] font-bold text-media-on-surface-variant uppercase">
                              {activity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Add Itinerary Day Button */}
                <div className="relative pl-10 pt-4">
                  <button 
                    onClick={handleOpeningAddDay}
                    className="cursor-pointer bg-media-surface-container text-media-on-surface-variant px-6 py-4 rounded-xl border-2 border-dashed border-media-outline-variant w-full text-center font-bold text-sm uppercase tracking-widest hover:bg-media-surface-container-high transition-all group flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined align-middle group-hover:scale-110 transition-transform">add_circle</span>
                    <span>Add Activity for Day {itinerary.length + 1}</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Add/Edit Day Dialog */}
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="photo" className="text-right">Photo URL</Label>
              <Input
                id="photo"
                value={dayFormData.photo || ''}
                onChange={(e) => setDayFormData({ ...dayFormData, photo: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="col-span-3"
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
    </div>
  );
}
