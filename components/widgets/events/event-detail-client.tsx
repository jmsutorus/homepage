'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Edit2,
  Trash2,
  FileText,
  Save,
  X,
  Loader2,
} from 'lucide-react';
import { EventPhotoGallery } from './event-photo-gallery';
import { EventPeopleSection } from './event-people-section';
import type { Event, EventPhoto, EventWithDetails, EventCategory } from '@/lib/db/events';

interface EventDetailClientProps {
  eventData: EventWithDetails;
}

export function EventDetailClient({ eventData: initialData }: EventDetailClientProps) {
  const router = useRouter();
  const [data, setData] = useState<EventWithDetails>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { event, photos, people } = data;

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
  });

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [categories, setCategories] = useState<EventCategory[]>([]);

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
      const response = await fetch(`/api/events/${event.slug}`);
      if (response.ok) {
        const updatedData = await response.json();
        setData(updatedData);
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
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
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

  // Markdown toolbar functions
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
    <div className="container mx-auto py-6 sm:py-8 px-4 max-w-4xl">
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/events">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Link>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleStartEdit}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        /* Edit Mode */
        <div className="space-y-6">
          {/* Event Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Title */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                {/* Location */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm({ ...editForm, location: e.target.value })
                    }
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">Start Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={editForm.date}
                    onChange={(e) =>
                      setEditForm({ ...editForm, date: e.target.value })
                    }
                    required
                  />
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={editForm.end_date}
                    onChange={(e) =>
                      setEditForm({ ...editForm, end_date: e.target.value })
                    }
                  />
                </div>

                {/* All Day */}
                <div className="flex items-center space-x-2 sm:col-span-2">
                  <Checkbox
                    id="all_day"
                    checked={editForm.all_day}
                    onCheckedChange={(checked) =>
                      setEditForm({ ...editForm, all_day: checked === true })
                    }
                  />
                  <Label htmlFor="all_day" className="cursor-pointer">
                    All Day Event
                  </Label>
                </div>

                {/* Time fields (only show if not all day) */}
                {!editForm.all_day && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="start_time">Start Time</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={editForm.start_time}
                        onChange={(e) =>
                          setEditForm({ ...editForm, start_time: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2t">
                      <Label htmlFor="end_time">End Time</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={editForm.end_time}
                        onChange={(e) =>
                          setEditForm({ ...editForm, end_time: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}

                {/* Category */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={editForm.category || 'none'}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, category: value === 'none' ? '' : value })
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Editor Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5" />
                  Event Content
                </CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMarkdown('# ')}
                  >
                    H1
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMarkdown('## ')}
                  >
                    H2
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMarkdown('**', '**')}
                  >
                    Bold
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMarkdown('*', '*')}
                  >
                    Italic
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMarkdown('- ')}
                  >
                    List
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                ref={contentRef}
                value={editForm.content}
                onChange={(e) =>
                  setEditForm({ ...editForm, content: e.target.value })
                }
                placeholder="Write detailed event notes in Markdown..."
                className="min-h-[300px] font-mono"
              />
            </CardContent>
          </Card>

          {/* Photo Gallery (still editable) */}
          <EventPhotoGallery event={event} photos={photos} onUpdate={handleUpdate} />
        </div>
      ) : (
        /* View Mode */
        <>
          {/* Event Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl mb-2">{event.title}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {event.category && (
                      <Badge variant="secondary">{event.category}</Badge>
                    )}
                    {event.all_day && <Badge variant="outline">All Day</Badge>}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date & Time */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-5 h-5" />
                <span>
                  {formatDate(event.date)}
                  {event.end_date && event.end_date !== event.date && (
                    <> - {formatDate(event.end_date)}</>
                  )}
                </span>
              </div>

              {!event.all_day && event.start_time && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span>
                    {formatTime(event.start_time)}
                    {event.end_time && ` - ${formatTime(event.end_time)}`}
                  </span>
                </div>
              )}

              {/* Location */}
              {event.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-5 h-5" />
                  <span>{event.location}</span>
                </div>
              )}

              {/* Description */}
              {event.description && (
                <div className="pt-4 border-t">
                  <p className="text-muted-foreground">{event.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Markdown Content */}
          {event.content ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {event.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 whitespace-pre-wrap">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardContent className="py-8 text-center text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No event details yet</p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={handleStartEdit}
                >
                  Add details
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Attendees */}
          <EventPeopleSection
            eventSlug={event.slug}
            people={people}
            onUpdate={handleUpdate}
          />

          {/* Photo Gallery */}
          <EventPhotoGallery event={event} photos={photos} onUpdate={handleUpdate} />
        </>
      )}
    </div>
  );
}
