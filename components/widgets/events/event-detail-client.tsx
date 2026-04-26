'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';


import {
  ArrowLeft,
  Edit2,
  Trash2,
  FileText,
  Save,
  X,
  Loader2,
  MoreVertical,
  Plus,
  Pencil,
} from 'lucide-react';
import { EventPhotoGallery } from './event-photo-gallery';
import { AddPersonToEventDialog } from './add-person-to-event-dialog';
import { EventPhotoUploadDialog } from './event-photo-upload-dialog';
import type { EventWithDetails, EventCategory } from '@/lib/db/events';
import type { RestaurantVisit } from '@/lib/db/restaurants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface EventDetailClientProps {
  eventData: EventWithDetails;
}

export function EventDetailClient({ eventData: initialData }: EventDetailClientProps) {
  const router = useRouter();
  const [data, setData] = useState<EventWithDetails>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddPersonDialogOpen, setIsAddPersonDialogOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const { event, photos, people } = data;
  const isUpcoming = new Date(event.date) >= new Date(new Date().setHours(0, 0, 0, 0));
  const heroImage = photos.length > 0 ? photos[0].url : 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200';

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: event.title,
    description: event.description || '',
    location: event.location || '',
    date: event.date,
    start_time: event.start_time || '',
    end_time: event.end_time || '',
    all_day: event.all_day,
    end_date: event.end_date || '',
    category: event.category || '',
    content: event.content || '',
    notification_setting: event.notification_setting || '',
    custom_notification_date: (event.notification_setting && event.notification_setting.includes('T')) ? event.notification_setting.split('T')[0] : '',
    custom_notification_time: (event.notification_setting && event.notification_setting.includes('T')) ? event.notification_setting.split('T')[1].substring(0, 5) : '',
  });

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [restaurantVisits, setRestaurantVisits] = useState<(RestaurantVisit & { restaurantName: string; restaurantSlug: string })[]>([]);

  // Fetch restaurant visits on mount
  useEffect(() => {
    const fetchRestaurantVisits = async () => {
      try {
        const response = await fetch(`/api/events/${event.slug}/restaurants`);
        if (response.ok) {
          const data = await response.json();
          setRestaurantVisits(data);
        }
      } catch (error) {
        console.error('Failed to fetch restaurant visits:', error);
      }
    };
    fetchRestaurantVisits();
  }, [event.slug]);

  // Fetch categories when entering edit mode
  useEffect(() => {
    if (isEditing) {
      const fetchCategories = async () => {
        try {
          const response = await fetch('/api/event-categories');
          if (response.ok) {
            const data = await response.json();
            setCategories(data);
          }
        } catch (error) {
          console.error('Failed to fetch event categories:', error);
        }
      };
      fetchCategories();
    }
  }, [isEditing]);

  const handleUpdate = async () => {
    try {
      const [eventResponse, restaurantsResponse] = await Promise.all([
        fetch(`/api/events/${event.slug}`),
        fetch(`/api/events/${event.slug}/restaurants`),
      ]);
      if (eventResponse.ok) {
        const updatedData = await eventResponse.json();
        setData(updatedData);
      }
      if (restaurantsResponse.ok) {
        const restaurantsData = await restaurantsResponse.json();
        setRestaurantVisits(restaurantsData);
      }
    } catch (error) {
      console.error('Error refreshing event data:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/events/${event.slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/events');
      } else {
        console.error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleStartEdit = () => {
    setEditForm({
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      date: event.date,
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      all_day: event.all_day,
      end_date: event.end_date || '',
      category: event.category || '',
      content: event.content || '',
      notification_setting: event.notification_setting || '',
      custom_notification_date: (event.notification_setting && event.notification_setting.includes('T')) ? event.notification_setting.split('T')[0] : '',
      custom_notification_time: (event.notification_setting && event.notification_setting.includes('T')) ? event.notification_setting.split('T')[1].substring(0, 5) : '',
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    let finalSetting = editForm.notification_setting;
    if (editForm.notification_setting === 'custom' || (editForm.notification_setting && editForm.notification_setting.includes('T'))) {
      if (editForm.custom_notification_date && editForm.custom_notification_time) {
        finalSetting = `${editForm.custom_notification_date}T${editForm.custom_notification_time}:00.000Z`;
      } else {
        finalSetting = ''; // Use already set default
      }
    }

    try {
      const response = await fetch(`/api/events/${event.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          description: editForm.description || null,
          location: editForm.location || null,
          start_time: editForm.start_time || null,
          end_time: editForm.end_time || null,
          end_date: editForm.end_date || null,
          category: editForm.category || null,
          content: editForm.content || null,
          notification_setting: finalSetting || null,
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setData(updatedData);
        setIsEditing(false);
      } else {
        console.error('Failed to save event');
      }
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editForm.content.substring(start, end);
    const newText =
      editForm.content.substring(0, start) +
      before +
      selectedText +
      after +
      editForm.content.substring(end);

    setEditForm({ ...editForm, content: newText });

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const getNotificationText = (setting: string | null, isAllDay: boolean) => {
    if (setting === 'none') return 'Notifications removed';
    
    // If not explicitly set or empty, use default
    const actualSetting = setting || (isAllDay ? 'day_of' : '1_hour_before');
    
    if (actualSetting === 'day_of') return isAllDay ? 'Notification: Day of event (8:00 AM)' : 'Notification: At event start';
    if (actualSetting === 'day_before') return isAllDay ? 'Notification: Day before event (8:00 AM)' : 'Notification: 24 hours before';
    if (actualSetting === '1_hour_before') return 'Notification: 1 hour before';
    if (actualSetting === '15_minutes_before') return 'Notification: 15 minutes before';
    
    // Custom date
    if (actualSetting.includes('T')) {
      try {
        const date = new Date(actualSetting);
        return `Notification: ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}`;
      } catch {
        return 'Notification: Custom';
      }
    }
    
    return isAllDay ? 'Notification: Day of event' : 'Notification: 1 hour before';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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
    <div className="text-media-on-background min-h-screen font-lexend">
      <main className="max-w-7xl mx-auto px-4 md:px-12 py-8 pb-32">
        {/* Navigation & Admin Actions */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/events" className="group flex items-center gap-2 text-media-on-surface-variant hover:text-media-primary transition-colors">
            <div className="p-2 rounded-full bg-media-surface-container group-hover:bg-media-primary group-hover:text-media-on-primary transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-bold uppercase tracking-widest text-[10px] text-media-on-surface-variant group-hover:text-media-primary transition-colors">Back to Timeline</span>
          </Link>

          {!isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-media-surface-container hover:bg-media-primary hover:text-white transition-all">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-media-surface-container-lowest border-media-outline-variant">
                <DropdownMenuItem onClick={handleStartEdit} className="gap-2 cursor-pointer">
                  <Edit2 className="w-4 h-4" />
                  Edit Journey
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="gap-2 cursor-pointer text-media-error hover:text-media-error">
                  <Trash2 className="w-4 h-4" />
                  Dissolve Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {isEditing && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="rounded-full border-media-outline text-media-on-surface hover:bg-media-surface-variant h-9 px-6"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveEdit} 
                disabled={isSaving}
                className="rounded-full bg-media-primary text-media-on-primary hover:opacity-90 h-9 px-4 md:px-6"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 md:mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 md:mr-2" />
                )}
                <span className="hidden md:inline">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </span>
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          /* Edit Mode - Re-styled to fit the theme */
          <div className="space-y-12 max-w-4xl mx-auto">
            <section className="space-y-6">
              <h2 className="text-3xl font-black text-media-primary tracking-tight uppercase border-b-4 border-media-secondary inline-block pb-1">Update Journey</h2>
              <div className="grid gap-8 p-8 rounded-[2.5rem] bg-media-surface-container-low border border-media-outline-variant editorial-shadow">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-media-secondary ml-1">Event Title</Label>
                    <Input
                      id="title"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="bg-media-surface border-media-outline-variant focus:ring-media-primary rounded-xl h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-media-secondary ml-1">Summary (Short)</Label>
                    <Textarea
                      id="description"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="bg-media-surface border-media-outline-variant focus:ring-media-primary min-h-[80px] rounded-xl"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="location" className="text-[10px] font-black uppercase tracking-widest text-media-secondary ml-1">Venue / Landscape</Label>
                    <Input
                      id="location"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="bg-media-surface border-media-outline-variant focus:ring-media-primary rounded-xl h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-[10px] font-black uppercase tracking-widest text-media-secondary ml-1">Origin Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      className="bg-media-surface border-media-outline-variant focus:ring-media-primary rounded-xl h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date" className="text-[10px] font-black uppercase tracking-widest text-media-secondary ml-1">Final Horizon (Optional)</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={editForm.end_date}
                      onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                      className="bg-media-surface border-media-outline-variant focus:ring-media-primary rounded-xl h-12"
                    />
                  </div>

                  {!editForm.all_day && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="start_time" className="text-[10px] font-black uppercase tracking-widest text-media-secondary ml-1">Commencement</Label>
                        <Input
                          id="start_time"
                          type="time"
                          value={editForm.start_time}
                          onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                          className="bg-media-surface border-media-outline-variant focus:ring-media-primary rounded-xl h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end_time" className="text-[10px] font-black uppercase tracking-widest text-media-secondary ml-1">Conclusion</Label>
                        <Input
                          id="end_time"
                          type="time"
                          value={editForm.end_time}
                          onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })}
                          className="bg-media-surface border-media-outline-variant focus:ring-media-primary rounded-xl h-12"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex items-center space-x-3 sm:col-span-2 py-2">
                    <Checkbox
                      id="all_day"
                      checked={editForm.all_day}
                      onCheckedChange={(checked) => setEditForm({ ...editForm, all_day: checked === true })}
                      className="border-media-primary data-[state=checked]:bg-media-primary rounded-md"
                    />
                    <Label htmlFor="all_day" className="cursor-pointer text-sm font-medium">All day duration</Label>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="notification_setting" className="text-[10px] font-black uppercase tracking-widest text-media-secondary ml-1">
                      Notification Setting (Default: {editForm.all_day ? 'Day of event' : '1 hour before'})
                    </Label>
                    <select
                      id="notification_setting"
                      value={editForm.notification_setting && editForm.notification_setting.includes('T') ? 'custom' : (editForm.notification_setting || '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditForm({ 
                          ...editForm, 
                          notification_setting: val,
                          custom_notification_date: val === 'custom' ? editForm.date : editForm.custom_notification_date,
                          custom_notification_time: val === 'custom' ? (editForm.start_time || '08:00') : editForm.custom_notification_time
                        });
                      }}
                      className="bg-media-surface border-media-outline-variant focus:ring-media-primary rounded-xl h-12 w-full px-4 text-sm text-media-on-surface"
                    >
                      <option value="">Default ({editForm.all_day ? 'Day of event' : '1 hour before'})</option>
                      <option value="day_of">The day of the event</option>
                      <option value="day_before">The day before the event</option>
                      <option value="1_hour_before">1 hour before the event</option>
                      <option value="15_minutes_before">15 minutes before the event</option>
                      <option value="custom">Custom date & time</option>
                      <option value="none">Remove notification</option>
                    </select>
                  </div>

                  {(editForm.notification_setting === 'custom' || (editForm.notification_setting && editForm.notification_setting.includes('T'))) && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="custom_notification_date" className="text-[10px] font-black uppercase tracking-widest text-media-secondary ml-1">Custom Notification Date</Label>
                        <Input
                          id="custom_notification_date"
                          type="date"
                          value={editForm.custom_notification_date}
                          onChange={(e) => setEditForm({ ...editForm, custom_notification_date: e.target.value })}
                          className="bg-media-surface border-media-outline-variant focus:ring-media-primary rounded-xl h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="custom_notification_time" className="text-[10px] font-black uppercase tracking-widest text-media-secondary ml-1">Custom Notification Time</Label>
                        <Input
                          id="custom_notification_time"
                          type="time"
                          value={editForm.custom_notification_time}
                          onChange={(e) => setEditForm({ ...editForm, custom_notification_time: e.target.value })}
                          className="bg-media-surface border-media-outline-variant focus:ring-media-primary rounded-xl h-12"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-media-primary tracking-tight uppercase border-b-4 border-media-secondary inline-block pb-1">Detailed Archive</h2>
                <div className="flex gap-1">
                   {['# ', '## ', '**', '- '].map((symbol) => (
                     <Button
                       key={symbol}
                       type="button"
                       variant="ghost"
                       size="sm"
                       onClick={() => insertMarkdown(symbol, symbol === '**' ? '**' : '')}
                       className="h-8 w-8 p-0 hover:bg-media-surface-variant rounded-md"
                     >
                       <span className="text-[10px] font-black">{symbol.trim() || 'L'}</span>
                     </Button>
                   ))}
                </div>
              </div>
              <Textarea
                ref={contentRef}
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                placeholder="Transcribe the full journey narrative in Markdown..."
                className="min-h-[400px] bg-media-surface-container-low border-media-outline-variant focus:ring-media-primary font-mono text-sm leading-relaxed p-8 rounded-[2.5rem] editorial-shadow"
              />
            </section>

            <section className="pt-8 border-t border-media-outline-variant">
              <EventPhotoGallery event={event} photos={photos} onUpdate={handleUpdate} />
            </section>
          </div>
        ) : (
          /* View Mode - The Editorial Experience */
          <div className="space-y-16">
            {/* Hero Section */}
            <section className="relative rounded-[2.5rem] overflow-hidden min-h-[600px] md:h-[716px] flex items-end p-8 md:p-16 editorial-shadow">
              <div className="absolute inset-0 z-0">
                <img 
                  alt={event.title} 
                  className="w-full h-full object-cover grayscale-[20%] contrast-[1.1]" 
                  src={heroImage}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-media-primary/95 via-media-primary/40 to-transparent"></div>
              </div>

              {/* Photo Edit Button */}
              <button 
                onClick={() => setIsPhotoDialogOpen(true)}
                className="absolute top-8 right-8 z-20 bg-media-background/20 backdrop-blur-md p-3 rounded-full hover:bg-media-background/40 transition-all text-white cursor-pointer group"
                title="Add Event Photo"
              >
                <Pencil className="h-6 w-6 group-hover:scale-110 transition-transform" />
              </button>
              <div className="relative z-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4 max-w-5xl">
                  <div className={cn(
                    "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase",
                    isUpcoming ? "bg-media-secondary text-media-on-secondary" : "bg-media-surface-variant text-media-on-surface-variant"
                  )}>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {isUpcoming ? 'event_available' : 'history'}
                    </span>
                    {isUpcoming ? 'Upcoming Journey' : 'Archived Chapter'}
                  </div>
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-media-surface tracking-tighter leading-[0.9] max-w-5xl">
                    {event.title}
                  </h1>
                  <div className="flex flex-wrap gap-x-8 gap-y-4 pt-6 text-media-surface/80 font-medium text-sm md:text-base">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-media-secondary" style={{ fontSize: '20px' }}>calendar_month</span>
                      <span>{formatDate(event.date)}</span>
                    </div>
                    {!event.all_day && event.start_time && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-media-secondary" style={{ fontSize: '20px' }}>schedule</span>
                        <span>{formatTime(event.start_time)}</span>
                      </div>
                    )}
                    {event.location && (
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group/loc"
                      >
                        <span className="material-symbols-outlined text-media-secondary group-hover/loc:scale-110 transition-transform" style={{ fontSize: '20px' }}>location_on</span>
                        <span className="hover:underline underline-offset-4">{event.location}</span>
                      </a>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-media-secondary" style={{ fontSize: '20px' }}>
                        {event.notification_setting === 'none' ? 'notifications_off' : 'notifications'}
                      </span>
                      <span>{getNotificationText(event.notification_setting, event.all_day)}</span>
                      {event.notification_setting !== 'none' && (
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/events/${event.slug}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ notification_setting: 'none' }),
                              });
                              if (response.ok) {
                                const updatedData = await response.json();
                                setData(updatedData);
                              }
                            } catch (error) {
                              console.error('Error removing notification:', error);
                            }
                          }}
                          className="ml-2 cursor-pointer text-xs text-media-secondary hover:text-white hover:underline uppercase tracking-widest font-black"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-4">
                  <button 
                    onClick={handleStartEdit}
                    className="cursor-pointer bg-media-secondary text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 editorial-shadow text-[10px]"
                  >
                    Narrative Control
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit_note</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              {/* Left Column: Narrative */}
              <div className="lg:col-span-7 space-y-20">
                <div className="space-y-8">
                  <h2 className="text-3xl font-black text-media-primary tracking-tight uppercase border-b-4 border-media-secondary inline-block pb-1">
                    Editorial Reflection
                  </h2>
                  <div className="text-media-on-surface-variant text-lg leading-relaxed space-y-8 max-w-2xl">
                    {event.description && (
                      <p className="first-letter:text-7xl first-letter:font-black first-letter:text-media-secondary first-letter:mr-3 first-letter:float-left first-letter:leading-[1]">
                        {event.description}
                      </p>
                    )}
                    
                    {event.content && (
                      <div className="prose prose-lg prose-stone dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-media-primary prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight">
                        {event.content.split('\n\n').map((paragraph, index) => {
                          if (paragraph.startsWith('## ')) {
                            return <h3 key={index} className="text-2xl mt-8 mb-4">{paragraph.replace('## ', '')}</h3>;
                          }
                          if (paragraph.startsWith('# ')) {
                            return <h2 key={index} className="text-3xl mt-12 mb-6">{paragraph.replace('# ', '')}</h2>;
                          }
                          return <p key={index} className="mb-6">{paragraph}</p>;
                        })}
                      </div>
                    )}

                    {!event.description && !event.content && (
                      <div className="py-12 px-8 rounded-[2.5rem] bg-media-surface-container-low border-2 border-dashed border-media-outline-variant text-center editorial-shadow">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-20 text-media-primary" />
                        <p className="text-media-on-surface-variant italic">The narrative for this chapter remains unwritten.</p>
                        <Button variant="link" className="text-media-secondary font-black uppercase tracking-tighter" onClick={handleStartEdit}>
                          Begin Transcription
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Memories Gallery */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-media-primary tracking-tight uppercase border-b-4 border-media-secondary inline-block pb-1">
                      Event Memories
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => setIsPhotoDialogOpen(true)} className="text-media-secondary hover:bg-media-secondary/10 font-bold uppercase tracking-widest text-[10px]">
                      <Plus className="w-4 h-4 mr-1" /> Add Frame
                    </Button>
                  </div>
                  
                  {photos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {photos.map((photo, i) => (
                        <div 
                          key={photo.id} 
                          className={cn(
                            "overflow-hidden rounded-2xl bg-media-surface-container relative group editorial-shadow",
                            i % 4 === 1 ? "aspect-[3/4]" : "aspect-square",
                            i % 4 === 2 && "md:col-span-2 md:aspect-[16/9]",
                            i % 4 === 3 && "aspect-square"
                          )}
                        >
                          <img 
                            alt={photo.caption || `Memory ${i+1}`} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            src={photo.url} 
                          />
                          {photo.caption && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                              <p className="text-white text-xs font-medium leading-snug">{photo.caption}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="aspect-[3/4] bg-media-surface-container-high rounded-2xl animate-pulse"></div>
                      <div className="aspect-square md:col-span-2 bg-media-surface-container rounded-2xl animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Sidebar */}
              <div className="lg:col-span-5 space-y-16">
                {/* The Guest List */}
                <div className="bg-media-surface-container-low p-10 rounded-[2.5rem] border-l-8 border-media-secondary editorial-shadow">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-black text-media-primary uppercase tracking-widest">The Guest List</h3>
                    <div className="bg-media-secondary/10 text-media-secondary px-3 py-1 rounded-full text-[10px] font-black">
                      {people.length} ADMITTED
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    {people.length > 0 ? (
                      people.map((person) => (
                        <div key={person.id} className="flex items-center gap-5 group">
                          <Avatar className="w-16 h-16 border-4 border-media-surface editorial-shadow transition-transform group-hover:scale-110 duration-300">
                            {person.photo ? (
                              <AvatarImage src={person.photo} alt={person.name} className="object-cover" />
                            ) : (
                              <AvatarFallback className="bg-media-primary text-media-on-primary font-black text-xl">
                                {person.name.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-black text-media-primary text-xl leading-tight group-hover:text-media-secondary transition-colors cursor-default">
                              {person.name}
                            </p>
                            <p className="text-[11px] text-media-secondary font-black uppercase tracking-widest mt-1 opacity-80">
                              {person.relationshipTypeName || person.relationship || 'Companion'}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-media-on-surface-variant italic text-sm py-4">Solitary journey. No companions logged.</p>
                    )}
                    
                    <button 
                      onClick={() => setIsAddPersonDialogOpen(true)}
                      className="cursor-pointer inline-flex items-center gap-2 mt-4 text-media-secondary font-black uppercase tracking-widest text-[10px] hover:underline"
                    >
                       Manage Attendees <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Add Person Dialog */}
                <AddPersonToEventDialog
                  eventSlug={event.slug}
                  existingPeople={people}
                  open={isAddPersonDialogOpen}
                  onOpenChange={setIsAddPersonDialogOpen}
                  onSuccess={handleUpdate}
                />

                {/* Linked Discoveries (Restaurants) */}
                <div className="space-y-8">
                  <h3 className="text-xl font-black text-media-primary uppercase tracking-widest border-b-2 border-media-outline-variant pb-2">
                    Linked Discoveries
                  </h3>
                  <div className="grid grid-cols-1 gap-5">
                    {restaurantVisits.length > 0 ? (
                      restaurantVisits.map((visit) => (
                        <Link 
                          key={visit.id}
                          href={`/restaurants/${visit.restaurantSlug}`}
                          className="group flex items-center gap-5 p-5 rounded-3xl bg-media-surface-container-lowest hover:bg-media-primary hover:text-white transition-all duration-500 editorial-shadow border border-media-outline-variant/30"
                        >
                          <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-media-surface group-hover:border-transparent transition-all">
                            <div className="w-full h-full bg-media-secondary/20 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                              <span className="material-symbols-outlined text-media-secondary group-hover:text-white text-3xl">restaurant</span>
                            </div>
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-black text-lg group-hover:text-white transition-colors">{visit.restaurantName}</h4>
                            <p className="text-[11px] text-media-on-surface-variant group-hover:text-white/70 font-bold uppercase tracking-tighter mt-1">
                              {visit.rating ? `${visit.rating}/10 Rating` : 'Curated Destination'}
                            </p>
                            {visit.notes && <p className="text-xs mt-2 line-clamp-1 group-hover:text-white/60">{visit.notes}</p>}
                          </div>
                          <span className="material-symbols-outlined text-media-secondary group-hover:text-white transition-all group-hover:translate-x-1" style={{ fontSize: '20px' }}>
                            open_in_new
                          </span>
                        </Link>
                      ))
                    ) : (
                      <div className="p-8 rounded-[2.5rem] bg-media-surface-container-lowest border-2 border-dashed border-media-outline-variant text-center opacity-60 editorial-shadow">
                         <span className="material-symbols-outlined text-media-primary/30 text-4xl block mb-2">restaurant_menu</span>
                         <p className="text-sm">No culinary chapters linked.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Location Map */}
                <div className="space-y-6">
                   <h3 className="text-xl font-black text-media-primary uppercase tracking-widest border-b-2 border-media-outline-variant pb-2">
                    Coordinates
                   </h3>
                   <div className="rounded-[2.5rem] overflow-hidden grayscale contrast-[1.2] opacity-90 h-72 relative bg-media-surface-container-high editorial-shadow group cursor-pointer"
                        onClick={() => event.location && window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`, '_blank')}>
                    <div className="absolute inset-0 bg-media-primary/10 group-hover:bg-transparent transition-colors z-10"></div>
                    <img 
                      alt="Map location" 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                      src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="bg-media-primary text-media-on-primary w-16 h-16 rounded-full flex items-center justify-center editorial-shadow kinetic-hover border-4 border-media-surface scale-110 group-hover:bg-media-secondary group-hover:scale-125 transition-all">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '32px' }}>location_on</span>
                      </div>
                    </div>
                    {event.location && (
                      <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl z-20 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                         <p className="text-media-primary font-black text-xs uppercase tracking-widest">{event.location}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <EventPhotoUploadDialog
        open={isPhotoDialogOpen}
        onOpenChange={setIsPhotoDialogOpen}
        eventData={data}
        onSuccess={handleUpdate}
      />
    </div>
  );
}
