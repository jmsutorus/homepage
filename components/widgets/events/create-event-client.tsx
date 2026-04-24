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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Loader2,
  Save,
  X,
} from 'lucide-react';
import type { EventCategory } from '@/lib/db/events';
import { toast } from 'sonner';
import { SuccessOverlay } from '@/components/ui/animations/success-overlay';

export function CreateEventClient() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedPath, setSavedPath] = useState<string | null>(null);
  
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
          description: form.description || null,
          location: form.location || null,
          start_time: form.start_time || null,
          end_time: form.end_time || null,
          end_date: form.end_date || null,
          category: form.category || null,
          content: form.content || null,
        }),
      });

      if (response.ok) {
        const event = await response.json();
        toast.success('Journey commenced successfully');
        setSavedPath(`/events/${event.slug}`);
        setShowSuccess(true);
      } else {
        const error = await response.json();
        toast.error(`Failed to commence journey: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('A rift occurred while commencing the journey');
    } finally {
      setIsSaving(false);
    }
  };

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
    <div className="bg-media-background text-media-on-background min-h-screen font-lexend">
      <main className="max-w-7xl mx-auto px-4 md:px-12 py-8 pb-32">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/events" className="group flex items-center gap-2 text-media-on-surface-variant hover:text-media-primary transition-colors">
            <div className="p-2 rounded-full bg-media-surface-container group-hover:bg-media-primary group-hover:text-media-on-primary transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-bold uppercase tracking-widest text-[10px] text-media-on-surface-variant group-hover:text-media-primary transition-colors">Back to Timeline</span>
          </Link>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              disabled={isSaving}
              className="rounded-full border-media-outline text-media-on-surface hover:bg-media-surface-variant h-9 px-6"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave} 
              disabled={isSaving}
              className="rounded-full bg-media-primary text-media-on-primary hover:opacity-90 h-9 px-4 md:px-6"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 md:mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 md:mr-2" />
              )}
              <span className="hidden md:inline">
                {isSaving ? 'Commencing...' : 'Commence Journey'}
              </span>
            </Button>
          </div>
        </div>

        <div className="space-y-12 max-w-4xl mx-auto">
          {/* Main Details Section */}
          <section className="space-y-6">
            <h2 className="text-3xl font-black text-media-primary tracking-tight uppercase border-b-4 border-media-secondary inline-block pb-1">
              New Journey
            </h2>
            <div className="grid gap-8 p-8 rounded-[2.5rem] bg-media-surface-container-low border border-media-outline-variant editorial-shadow">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Title */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-media-secondary ml-1">Event Title</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="bg-media-surface border-media-outline-variant focus:ring-media-primary rounded-xl h-12"
                    required
                    placeholder="What shall we call this chapter?"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-media-secondary ml-1">Summary (Short)</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="bg-media-surface border-media-outline-variant focus:ring-media-primary min-h-[80px] rounded-xl"
                    placeholder="A brief overview of the experience..."
                  />
                </div>

                {/* Location */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="location" className="text-[10px] font-black uppercase tracking-widest text-media-secondary ml-1">Venue / Landscape</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="bg-media-surface border-media-outline-variant focus:ring-media-primary rounded-xl h-12"
                    placeholder="Where did this take place?"
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-[10px] font-black uppercase tracking-widest text-media-secondary ml-1">Origin Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="bg-media-surface border-media-outline-variant focus:ring-media-primary rounded-xl h-12"
                    required
                  />
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label htmlFor="end_date" className="text-[10px] font-black uppercase tracking-widest text-media-secondary ml-1">Final Horizon (Optional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="bg-media-surface border-media-outline-variant focus:ring-media-primary rounded-xl h-12"
                  />
                </div>

                {/* All Day */}
                <div className="flex items-center space-x-3 sm:col-span-2 py-2">
                  <Checkbox
                    id="all_day"
                    checked={form.all_day}
                    onCheckedChange={(checked) => setForm({ ...form, all_day: checked === true })}
                    className="border-media-primary data-[state=checked]:bg-media-primary rounded-md"
                  />
                  <Label htmlFor="all_day" className="cursor-pointer text-sm font-medium">All day duration</Label>
                </div>

                {/* Time fields (only show if not all day) */}
                {!form.all_day && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="start_time" className="text-[10px] font-black uppercase tracking-widest text-media-secondary ml-1">Commencement</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={form.start_time}
                        onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                        className="bg-media-surface border-media-outline-variant focus:ring-media-primary rounded-xl h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end_time" className="text-[10px] font-black uppercase tracking-widest text-media-secondary ml-1">Conclusion</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={form.end_time}
                        onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                        className="bg-media-surface border-media-outline-variant focus:ring-media-primary rounded-xl h-12"
                      />
                    </div>
                  </>
                )}

                {/* Category */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-media-secondary ml-1">Category / Theme</Label>
                  <Select
                    value={form.category || 'none'}
                    onValueChange={(value) =>
                      setForm({ ...form, category: value === 'none' ? '' : value })
                    }
                  >
                    <SelectTrigger id="category" className="bg-media-surface border-media-outline-variant focus:ring-media-primary rounded-xl h-12">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-media-surface-container-lowest border-media-outline-variant">
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
            </div>
          </section>

          {/* Content Editor Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-media-primary tracking-tight uppercase border-b-4 border-media-secondary inline-block pb-1">
                Detailed Archive
              </h2>
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
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Transcribe the full journey narrative in Markdown..."
              className="min-h-[400px] bg-media-surface-container-low border-media-outline-variant focus:ring-media-primary font-mono text-sm leading-relaxed p-8 rounded-[2.5rem] editorial-shadow"
            />
          </section>
        </div>
      </main>
      <SuccessOverlay 
        show={showSuccess} 
        onComplete={() => {
          if (savedPath) {
            router.push(savedPath);
            router.refresh();
          }
        }} 
      />
    </div>
  );
}
