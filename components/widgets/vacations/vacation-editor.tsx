'use client';

import { useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { VacationStatus, VacationType, VACATION_STATUSES, VACATION_STATUS_NAMES, VACATION_TYPES, VACATION_TYPE_NAMES } from '@/lib/types/vacations';
import { showCreationSuccess, showCreationError } from '@/lib/success-toasts';
import { TagInput } from '@/components/search/tag-input';
import { AlertCircle, Trash2 } from 'lucide-react';
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

interface VacationEditorProps {
  initialFrontmatter?: VacationFrontmatter;
  initialContent?: string;
  mode: 'create' | 'edit';
  existingSlug?: string;
}

export function VacationEditor({
  initialFrontmatter,
  initialContent = '',
  mode,
  existingSlug,
}: VacationEditorProps) {
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

  // Markdown toolbar functions
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

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      // Validate required fields
      if (!frontmatter.title || !frontmatter.destination) {
        throw new Error('Title and destination are required');
      }
      if (!frontmatter.start_date || !frontmatter.end_date) {
        throw new Error('Start date and end date are required');
      }

      // Generate slug from title if in create mode
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

      // Show persistent success toast for create mode
      if (mode === 'create') {
        showCreationSuccess('vacation', { persistent: true });
      }

      // Redirect to the vacation detail page
      router.push(data.path || `/vacations/${slug}`);
      router.refresh();
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

      // Redirect to vacations list on success
      router.push('/vacations');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showCreationError('vacation', err);
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-6">
          {/* Front Matter Section */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Vacation Information</h3>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Title */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={frontmatter.title}
                    onChange={(e) =>
                      setFrontmatter({ ...frontmatter, title: e.target.value })
                    }
                    required
                    placeholder="e.g., Summer Europe Trip 2024"
                  />
                </div>

                {/* Destination */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="destination">Destination *</Label>
                  <Input
                    id="destination"
                    value={frontmatter.destination}
                    onChange={(e) =>
                      setFrontmatter({ ...frontmatter, destination: e.target.value })
                    }
                    required
                    placeholder="e.g., Paris, France"
                  />
                </div>

                {/* Dates */}
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={frontmatter.start_date}
                    onChange={(e) =>
                      setFrontmatter({ ...frontmatter, start_date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={frontmatter.end_date}
                    onChange={(e) =>
                      setFrontmatter({ ...frontmatter, end_date: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={frontmatter.status || 'planning'}
                    onValueChange={(value: VacationStatus) =>
                      setFrontmatter({ ...frontmatter, status: value })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VACATION_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {VACATION_STATUS_NAMES[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={frontmatter.type || 'other'}
                    onValueChange={(value: VacationType) =>
                      setFrontmatter({ ...frontmatter, type: value })
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VACATION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {VACATION_TYPE_NAMES[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (0-10)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={frontmatter.rating || ''}
                    onChange={(e) =>
                      setFrontmatter({
                        ...frontmatter,
                        rating: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="Optional"
                  />
                </div>

                {/* Budget */}
                <div className="space-y-2">
                  <Label htmlFor="budget_planned">Planned Budget</Label>
                  <Input
                    id="budget_planned"
                    type="number"
                    min="0"
                    step="0.01"
                    value={frontmatter.budget_planned || ''}
                    onChange={(e) =>
                      setFrontmatter({
                        ...frontmatter,
                        budget_planned: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget_actual">Actual Spent</Label>
                  <Input
                    id="budget_actual"
                    type="number"
                    min="0"
                    step="0.01"
                    value={frontmatter.budget_actual || ''}
                    onChange={(e) =>
                      setFrontmatter({
                        ...frontmatter,
                        budget_actual: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="Optional"
                  />
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label htmlFor="budget_currency">Currency</Label>
                  <Input
                    id="budget_currency"
                    value={frontmatter.budget_currency || 'USD'}
                    onChange={(e) =>
                      setFrontmatter({ ...frontmatter, budget_currency: e.target.value })
                    }
                    placeholder="USD, EUR, GBP, etc."
                  />
                </div>

                {/* Poster URL */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="poster">Photo URL</Label>
                  <Input
                    id="poster"
                    type="url"
                    value={frontmatter.poster || ''}
                    onChange={(e) =>
                      setFrontmatter({ ...frontmatter, poster: e.target.value })
                    }
                    placeholder="https://example.com/vacation-photo.jpg"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={frontmatter.description || ''}
                    onChange={(e) =>
                      setFrontmatter({ ...frontmatter, description: e.target.value })
                    }
                    placeholder="Short description of the vacation..."
                    className="min-h-[100px]"
                  />
                </div>

                {/* Tags */}
                <div className="md:col-span-2">
                  <TagInput
                    selectedTags={frontmatter.tags || []}
                    onTagsChange={(tags) =>
                      setFrontmatter({ ...frontmatter, tags })
                    }
                    placeholder="Enter tag (e.g., beach, family) or search existing..."
                  />
                </div>

                {/* Featured & Published */}
                <div className="space-y-4 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={frontmatter.featured}
                      onCheckedChange={(checked) =>
                        setFrontmatter({ ...frontmatter, featured: checked === true })
                      }
                    />
                    <Label htmlFor="featured" className="cursor-pointer">
                      Featured (show on homepage)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="published"
                      checked={frontmatter.published}
                      onCheckedChange={(checked) =>
                        setFrontmatter({ ...frontmatter, published: checked === true })
                      }
                    />
                    <Label htmlFor="published" className="cursor-pointer">
                      Published (visible to public)
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Markdown Editor Section */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Trip Notes</h3>
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

              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write about your vacation in Markdown..."
                className="min-h-[400px] font-mono"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardContent className="pt-6">
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <h1>{frontmatter.title || 'Untitled Vacation'}</h1>
                {frontmatter.description && <p className="lead">{frontmatter.description}</p>}
                <div className="not-prose flex gap-2 items-center mb-4">
                  <span className="text-sm text-muted-foreground">
                    {frontmatter.destination} • {frontmatter.start_date} to {frontmatter.end_date}
                  </span>
                  {frontmatter.rating && <span>★ {frontmatter.rating}/10</span>}
                </div>
                <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-between">
        {/* Delete button - only in edit mode */}
        {mode === 'edit' && existingSlug && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                disabled={isSaving}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this
                  vacation and all associated data (itinerary and bookings).
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Cancel and Save buttons */}
        <div className="flex gap-4 ml-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving || !frontmatter.title || !frontmatter.destination}>
            {isSaving ? 'Saving...' : mode === 'create' ? 'Create Vacation' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </form>
  );
}
