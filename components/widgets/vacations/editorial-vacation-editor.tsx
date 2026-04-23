'use client';

import { useState, useRef, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VacationStatus, VacationType, VACATION_STATUSES, VACATION_STATUS_NAMES, VACATION_TYPES, VACATION_TYPE_NAMES } from '@/lib/types/vacations';
import { showCreationSuccess, showCreationError } from '@/lib/success-toasts';
import { TagInput } from '@/components/search/tag-input';
import { AlertCircle, Trash2, MapPin, Calendar, CreditCard, Plus, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { SuccessOverlay } from '@/components/ui/animations/success-overlay';

interface VacationFrontmatter {
  title: string;
  destination: string;
  type?: VacationType;
  start_date: string;
  end_date: string;
  description?: string;
  poster?: string;
  status?: VacationStatus;
  budget_planned?: number;
  budget_actual?: number;
  budget_currency?: string;
  tags?: string[];
  rating?: number;
  featured?: boolean;
  published?: boolean;
}

interface EditorialVacationEditorProps {
  initialFrontmatter?: VacationFrontmatter;
  initialContent?: string;
  mode: 'create' | 'edit';
  existingSlug?: string;
}

export function EditorialVacationEditor({
  initialFrontmatter,
  initialContent = '',
  mode,
  existingSlug,
}: EditorialVacationEditorProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [frontmatter, setFrontmatter] = useState<VacationFrontmatter>(
    initialFrontmatter || {
      title: '',
      destination: '',
      type: 'other',
      start_date: '',
      end_date: '',
      status: 'planning',
      budget_currency: 'USD',
      tags: [],
      featured: false,
      published: true,
    }
  );
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedPath, setSavedPath] = useState<string | null>(null);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      if (!frontmatter.title || !frontmatter.destination) {
        throw new Error('Title and destination are required');
      }
      if (!frontmatter.start_date || !frontmatter.end_date) {
        throw new Error('Start date and end date are required');
      }

      const slug = existingSlug || frontmatter.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const endpoint = mode === 'create'
        ? '/api/vacations'
        : `/api/vacations/${existingSlug}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          frontmatter: { ...frontmatter, slug },
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save vacation');
      }

      if (mode === 'create') {
        showCreationSuccess('vacation', { persistent: true });
        setSavedPath(data.path || `/vacations/${slug}`);
        setShowSuccess(true);
      } else {
        router.push(data.path || `/vacations/${slug}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showCreationError('vacation', err);
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingSlug) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/vacations/${existingSlug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete vacation');
      }

      router.push('/vacations');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showCreationError('vacation', err);
      setIsSaving(false);
    }
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);

    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Custom theme colors based on prototype
  const colors = {
    background: '#faf9f6',
    primary: '#061b0e',
    secondary: '#9f402d',
    surfaceContainerLow: '#f4f3f1',
    surfaceContainerHigh: '#e9e8e5',
    onSurfaceVariant: '#434843',
    tertiaryFixed: '#e4e4cc',
    onTertiaryFixedVariant: '#474836',
  };

  return (
    <div className="min-h-screen pb-32 font-lexend selection:bg-secondary/20 selection:text-secondary">
      <main className="max-w-5xl mx-auto px-6 pt-12">
        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-24">
          {/* Hero Section Asymmetry */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-7 flex flex-col justify-end py-8">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none mb-6" style={{ color: colors.primary }}>
                {mode === 'create' ? 'New' : 'Edit'} <br />
                <span className="italic" style={{ color: colors.secondary }}>Curated</span> Journey
              </h1>
              <p className="text-lg max-w-md" style={{ color: colors.onSurfaceVariant }}>
                Capture the essence of your next escape. Define the mood, the movement, and the memory.
              </p>
            </div>
            <div 
              className="md:col-span-5 relative group cursor-pointer overflow-hidden rounded-xl aspect-[4/5] flex items-center justify-center"
              style={{ backgroundColor: colors.surfaceContainerLow }}
            >
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/0 transition-colors z-10"></div>
              {frontmatter.poster ? (
                <img 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src={frontmatter.poster} 
                  alt={frontmatter.title}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-outline opacity-40">
                   <Camera className="w-12 h-12" />
                   <span className="text-sm font-medium uppercase tracking-widest">No Hero Image</span>
                </div>
              )}
              <div className="relative z-20 flex flex-col items-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="rounded-full px-6 py-2"
                  onClick={() => {
                    const url = prompt('Enter image URL:', frontmatter.poster || '');
                    if (url !== null) setFrontmatter({ ...frontmatter, poster: url });
                  }}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Change Hero
                </Button>
              </div>
            </div>
          </section>

          {/* Form Canvas */}
          <div className="space-y-24">
            {/* Section: General Info */}
            <section>
              <div className="flex items-baseline gap-4 mb-8">
                <span className="font-bold text-sm tracking-widest uppercase" style={{ color: colors.secondary }}>01</span>
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: colors.primary }}>General Info</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-2">
                  <label className="block text-xs font-medium uppercase tracking-widest px-1" style={{ color: colors.onSurfaceVariant }}>Trip Title</label>
                  <input
                    className="w-full border-none rounded-lg p-4 font-medium focus:ring-0 transition-all"
                    style={{ backgroundColor: colors.surfaceContainerLow }}
                    placeholder="Summer in Tuscany 2024"
                    type="text"
                    value={frontmatter.title}
                    onChange={(e) => setFrontmatter({ ...frontmatter, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium uppercase tracking-widest px-1" style={{ color: colors.onSurfaceVariant }}>Destination</label>
                  <div className="relative">
                    <input
                      className="w-full border-none rounded-lg p-4 pl-12 font-medium focus:ring-0 transition-all"
                      style={{ backgroundColor: colors.surfaceContainerLow }}
                      placeholder="Italy"
                      type="text"
                      value={frontmatter.destination}
                      onChange={(e) => setFrontmatter({ ...frontmatter, destination: e.target.value })}
                      required
                    />
                    <MapPin className="absolute left-4 top-4 w-5 h-5 text-outline opacity-50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium uppercase tracking-widest px-1" style={{ color: colors.onSurfaceVariant }}>Trip Type</label>
                  <select
                    className="w-full border-none rounded-lg p-4 font-medium focus:ring-0 transition-all appearance-none"
                    style={{ backgroundColor: colors.surfaceContainerLow }}
                    value={frontmatter.type || 'other'}
                    onChange={(e) => setFrontmatter({ ...frontmatter, type: e.target.value as VacationType })}
                  >
                    {VACATION_TYPES.map(type => (
                      <option key={type} value={type}>{VACATION_TYPE_NAMES[type]}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium uppercase tracking-widest px-1" style={{ color: colors.onSurfaceVariant }}>Status</label>
                  <div className="flex gap-2">
                    {VACATION_STATUSES.map(status => (
                      <button
                        key={status}
                        type="button"
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                          frontmatter.status === status 
                            ? 'text-white' 
                            : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                        }`}
                        style={{ 
                          backgroundColor: frontmatter.status === status ? colors.primary : undefined,
                        }}
                        onClick={() => setFrontmatter({ ...frontmatter, status })}
                      >
                        {VACATION_STATUS_NAMES[status]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Logistics */}
            <section>
              <div className="flex items-baseline gap-4 mb-8">
                <span className="font-bold text-sm tracking-widest uppercase" style={{ color: colors.secondary }}>02</span>
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: colors.primary }}>Logistics</h2>
              </div>
              <div className="p-8 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-8" style={{ backgroundColor: colors.surfaceContainerLow }}>
                <div className="space-y-2">
                  <label className="block text-xs font-medium uppercase tracking-widest px-1" style={{ color: colors.onSurfaceVariant }}>Start Date</label>
                  <input
                    className="w-full bg-white border-none rounded-lg p-4 font-medium focus:ring-0"
                    type="date"
                    value={frontmatter.start_date}
                    onChange={(e) => setFrontmatter({ ...frontmatter, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium uppercase tracking-widest px-1" style={{ color: colors.onSurfaceVariant }}>End Date</label>
                  <input
                    className="w-full bg-white border-none rounded-lg p-4 font-medium focus:ring-0"
                    type="date"
                    value={frontmatter.end_date}
                    onChange={(e) => setFrontmatter({ ...frontmatter, end_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium uppercase tracking-widest px-1" style={{ color: colors.onSurfaceVariant }}>Budget & Currency</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-white border-none rounded-lg p-4 font-medium focus:ring-0"
                      placeholder="5000"
                      type="number"
                      value={frontmatter.budget_planned || ''}
                      onChange={(e) => setFrontmatter({ ...frontmatter, budget_planned: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                    <input
                      className="w-24 bg-white border-none rounded-lg p-4 font-medium focus:ring-0"
                      placeholder="USD"
                      value={frontmatter.budget_currency || 'USD'}
                      onChange={(e) => setFrontmatter({ ...frontmatter, budget_currency: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Personal Notes */}
            <section>
              <div className="flex items-baseline gap-4 mb-8">
                <span className="font-bold text-sm tracking-widest uppercase" style={{ color: colors.secondary }}>03</span>
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: colors.primary }}>Personal Notes</h2>
              </div>
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-xs font-medium uppercase tracking-widest px-1" style={{ color: colors.onSurfaceVariant }}>Description</label>
                  <textarea
                    className="w-full border-none rounded-lg p-6 font-medium focus:ring-0 transition-all resize-none"
                    style={{ backgroundColor: colors.surfaceContainerLow }}
                    placeholder="Write your thoughts, bucket list items, and expectations..."
                    rows={4}
                    value={frontmatter.description || ''}
                    onChange={(e) => setFrontmatter({ ...frontmatter, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <label className="block text-xs font-medium uppercase tracking-widest px-1" style={{ color: colors.onSurfaceVariant }}>Rating Expectations</label>
                    <input
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{ backgroundColor: colors.surfaceContainerHigh, accentColor: colors.secondary }}
                      max="10"
                      min="1"
                      step="1"
                      type="range"
                      value={frontmatter.rating || 1}
                      onChange={(e) => setFrontmatter({ ...frontmatter, rating: parseInt(e.target.value) })}
                    />
                    <div className="flex justify-between text-xs font-bold" style={{ color: colors.onSurfaceVariant }}>
                      <span>1</span>
                      <span>Rating: {frontmatter.rating || 8}/10</span>
                      <span>10</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs font-medium uppercase tracking-widest px-1" style={{ color: colors.onSurfaceVariant }}>Tags</label>
                    <TagInput
                      selectedTags={frontmatter.tags || []}
                      onTagsChange={(tags) => setFrontmatter({ ...frontmatter, tags })}
                      placeholder="Add tag..."
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Trip Notes (Markdown) - Added for parity */}
            <section>
              <div className="flex items-baseline gap-4 mb-8">
                <span className="font-bold text-sm tracking-widest uppercase" style={{ color: colors.secondary }}>04</span>
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: colors.primary }}>Trip Notes (Markdown)</h2>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Button type="button" variant="outline" size="sm" onClick={() => insertMarkdown('# ')}>H1</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertMarkdown('## ')}>H2</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertMarkdown('**', '**')}>B</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertMarkdown('*', '*')}>I</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertMarkdown('- ')}>List</Button>
                </div>
                <textarea
                  ref={textareaRef}
                  className="w-full border-none rounded-lg p-6 font-mono focus:ring-0 transition-all min-h-[400px]"
                  style={{ backgroundColor: colors.surfaceContainerLow }}
                  placeholder="Write your detailed itinerary and notes here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                ></textarea>
              </div>
            </section>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-outline/10">
            <div>
               {mode === 'edit' && existingSlug && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50/50"
                        disabled={isSaving}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Journey
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this
                          vacation and all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-500 text-white hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
              <button 
                type="button"
                className="text-on-surface-variant font-medium hover:text-primary transition-colors order-2 md:order-1"
                onClick={() => router.back()}
              >
                Discard Draft
              </button>
              <button 
                type="submit" 
                disabled={isSaving || !frontmatter.title || !frontmatter.destination}
                className="w-full md:w-auto text-white px-12 py-4 rounded-lg font-bold text-lg shadow-xl hover:scale-105 transition-transform order-1 md:order-2 disabled:opacity-50 disabled:hover:scale-100"
                style={{ backgroundColor: colors.secondary, boxShadow: `0 20px 25px -5px ${colors.secondary}1a` }}
              >
                {isSaving ? 'Saving...' : 'Save Journey'}
              </button>
            </div>
          </div>
        </form>
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
