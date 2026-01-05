'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Loader2,
  FileText,
  Save,
} from 'lucide-react';
import type { EventCategory } from '@/lib/db/events';
import { toast } from 'sonner';

export function CreateEventClient() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  // Default form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    all_day: false,
    end_date: '',
    category: '',
    content: '',
  });

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [categories, setCategories] = useState<EventCategory[]>([]);

  // Fetch categories on mount
  useEffect(() => {
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
  }, []);

  const handleSave = async () => {
    if (!form.title || !form.date) {
      toast.error('Please fill in required fields (Title and Date)');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          description: form.description || undefined,
          location: form.location || undefined,
          start_time: form.start_time || undefined,
          end_time: form.end_time || undefined,
          end_date: form.end_date || undefined,
          category: form.category || undefined,
          content: form.content || undefined,
        }),
      });

      if (response.ok) {
        const event = await response.json();
        toast.success('Event created successfully');
        router.push(`/events/${event.slug}`);
      } else {
        const error = await response.json();
        toast.error(`Failed to create event: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('An error occurred while creating the event');
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
    const selectedText = form.content.substring(start, end);
    const newText =
      form.content.substring(0, start) +
      before +
      selectedText +
      after +
      form.content.substring(end);

    setForm({ ...form, content: newText });

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
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
        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isSaving ? 'Creating...' : 'Create Event'}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Event Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Title */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  required
                  placeholder="Event title"
                />
              </div>

              {/* Description */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={2}
                  placeholder="Brief description"
                />
              </div>

              {/* Location */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  placeholder="Event location"
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Start Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({ ...form, date: e.target.value })
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
                  value={form.end_date}
                  onChange={(e) =>
                    setForm({ ...form, end_date: e.target.value })
                  }
                />
              </div>

              {/* All Day */}
              <div className="flex items-center space-x-2 sm:col-span-2">
                <Checkbox
                  id="all_day"
                  checked={form.all_day}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, all_day: checked === true })
                  }
                />
                <Label htmlFor="all_day" className="cursor-pointer">
                  All Day Event
                </Label>
              </div>

              {/* Time fields (only show if not all day) */}
              {!form.all_day && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={form.start_time}
                      onChange={(e) =>
                        setForm({ ...form, start_time: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={form.end_time}
                      onChange={(e) =>
                        setForm({ ...form, end_time: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              {/* Category */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={form.category || 'none'}
                  onValueChange={(value) =>
                    setForm({ ...form, category: value === 'none' ? '' : value })
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
              value={form.content}
              onChange={(e) =>
                setForm({ ...form, content: e.target.value })
              }
              placeholder="Write detailed event notes in Markdown..."
              className="min-h-[300px] font-mono"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
