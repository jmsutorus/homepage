'use client';

import { useState, useRef, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LinkPicker } from '@/components/widgets/link-picker';
import { MoodEntryModal } from '@/components/widgets/mood-entry-modal';
import { JournalLink } from '@/lib/db/journals';

interface JournalFrontmatter {
  title?: string;
  journal_type?: "daily" | "general";
  daily_date?: string;
  mood?: number;
  tags?: string[];
  featured?: boolean;
  published?: boolean;
}

interface JournalEditorProps {
  initialFrontmatter?: JournalFrontmatter;
  initialContent?: string;
  initialLinks?: JournalLink[];
  mode: 'create' | 'edit';
  existingSlug?: string;
}

export function JournalEditor({
  initialFrontmatter,
  initialContent = '',
  initialLinks = [],
  mode,
  existingSlug,
}: JournalEditorProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [frontmatter, setFrontmatter] = useState<JournalFrontmatter>(
    initialFrontmatter || {
      title: '',
      journal_type: 'general',
      tags: [],
      featured: false,
      published: true,
    }
  );

  const isDaily = frontmatter.journal_type === 'daily';
  const [content, setContent] = useState(initialContent);
  const [links, setLinks] = useState<Array<{
    linkedType: "media" | "park" | "journal" | "activity";
    linkedId: number;
    linkedSlug?: string;
  }>>(
    initialLinks.map(link => ({
      linkedType: link.linked_type,
      linkedId: link.linked_id,
      linkedSlug: link.linked_slug || undefined,
    }))
  );
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moodModalOpen, setMoodModalOpen] = useState(false);
  const [moodNote, setMoodNote] = useState('');
  const [lastFetchedDate, setLastFetchedDate] = useState<string | null>(null);

  // Initialize mood note on mount for existing daily journals
  useEffect(() => {
    if (mode === 'edit' && isDaily && frontmatter.daily_date && initialFrontmatter?.mood !== undefined) {
      // Fetch the full mood entry to get the note
      fetchMoodForDate(frontmatter.daily_date);
      setLastFetchedDate(frontmatter.daily_date);
    }
  }, []); // Only run on mount

  // Fetch mood when daily_date changes
  useEffect(() => {
    if (isDaily && frontmatter.daily_date && frontmatter.daily_date !== lastFetchedDate) {
      fetchMoodForDate(frontmatter.daily_date);
      setLastFetchedDate(frontmatter.daily_date);
    }
  }, [frontmatter.daily_date, isDaily, lastFetchedDate]);

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

  const addTag = () => {
    if (tagInput.trim() && !frontmatter.tags?.includes(tagInput.trim())) {
      setFrontmatter({
        ...frontmatter,
        tags: [...(frontmatter.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFrontmatter({
      ...frontmatter,
      tags: frontmatter.tags?.filter((t) => t !== tag),
    });
  };

  // Fetch mood entry for the selected date
  const fetchMoodForDate = async (date: string) => {
    try {
      const response = await fetch(`/api/mood?date=${date}`);
      if (response.ok) {
        // API returns the entry directly, not wrapped in { entry: ... }
        const data = await response.json();
        setFrontmatter(prev => ({ ...prev, mood: data.rating }));
        setMoodNote(data.note || '');
      } else if (response.status === 404) {
        // No mood entry exists for this date
        setFrontmatter(prev => ({ ...prev, mood: undefined }));
        setMoodNote('');
      }
    } catch (error) {
      console.error('Error fetching mood:', error);
    }
  };

  // Save mood entry
  const handleMoodSave = async (rating: number, note: string) => {
    if (!frontmatter.daily_date) return;

    try {
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: frontmatter.daily_date,
          rating,
          note,
        }),
      });

      if (response.ok) {
        // Update the mood in the form
        setFrontmatter(prev => ({ ...prev, mood: rating }));
        setMoodNote(note);
      } else {
        throw new Error('Failed to save mood');
      }
    } catch (error) {
      console.error('Error saving mood:', error);
      setError('Failed to save mood entry');
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const endpoint =
        mode === 'create'
          ? '/api/journals'
          : `/api/journals/${existingSlug}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          frontmatter,
          content,
          links,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save journal');
      }

      // Redirect to the journal detail page
      router.push(data.path);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
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
              <h3 className="text-lg font-semibold">Journal Information</h3>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Journal Type */}
                {mode === 'create' && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="journal-type">Journal Type *</Label>
                    <Select
                      value={frontmatter.journal_type}
                      onValueChange={(value: "daily" | "general") =>
                        setFrontmatter({ ...frontmatter, journal_type: value })
                      }
                    >
                      <SelectTrigger id="journal-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Daily Date (for daily journals only) */}
                {isDaily && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="daily-date">Date *</Label>
                    <Input
                      id="daily-date"
                      type="date"
                      value={frontmatter.daily_date || ''}
                      onChange={(e) =>
                        setFrontmatter({ ...frontmatter, daily_date: e.target.value })
                      }
                      required={isDaily}
                    />
                    <p className="text-sm text-muted-foreground">
                      Title will be automatically generated from this date
                    </p>
                  </div>
                )}

                {/* Title (for general journals only) */}
                {!isDaily && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={frontmatter.title || ''}
                      onChange={(e) =>
                        setFrontmatter({ ...frontmatter, title: e.target.value })
                      }
                      required={!isDaily}
                      placeholder="Enter journal title"
                    />
                  </div>
                )}

                {/* Mood */}
                {isDaily ? (
                  <div className="space-y-2">
                    <Label>Mood for {frontmatter.daily_date ? new Date(frontmatter.daily_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'this date'}</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setMoodModalOpen(true)}
                        disabled={!frontmatter.daily_date}
                        className="flex-1"
                      >
                        {frontmatter.mood !== undefined
                          ? `Mood: ${frontmatter.mood}/5 ${['😢', '😟', '😐', '😊', '😄'][frontmatter.mood - 1] || ''}`
                          : 'Set Mood'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {frontmatter.mood !== undefined
                        ? 'Click to edit mood entry for this date'
                        : 'Set mood from your mood tracker'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="mood">Mood (0-10)</Label>
                    <Input
                      id="mood"
                      type="number"
                      min="0"
                      max="10"
                      step="1"
                      value={frontmatter.mood || ''}
                      onChange={(e) =>
                        setFrontmatter({
                          ...frontmatter,
                          mood: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      placeholder="Optional"
                    />
                  </div>
                )}

                {/* Spacer */}
                <div />

                {/* Tags */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Enter tag (e.g., daily, travel, work)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={addTag}
                      disabled={!tagInput.trim()}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {frontmatter.tags?.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
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

          {/* Linked Items Section */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Linked Items</h3>
              <p className="text-sm text-muted-foreground">
                Link this journal to media, parks, other journals, or activities
              </p>
              <LinkPicker links={links} onLinksChange={setLinks} />
            </CardContent>
          </Card>

          {/* Markdown Editor Section */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Content</h3>
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
                placeholder="Write your journal entry in Markdown..."
                className="min-h-[400px] font-mono"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardContent className="pt-6">
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <h1>
                  {isDaily && frontmatter.daily_date
                    ? new Date(frontmatter.daily_date + 'T00:00:00').toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : frontmatter.title || 'Untitled Journal'}
                </h1>
                <div className="flex gap-2 items-center mb-4 flex-wrap">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {frontmatter.journal_type || 'general'}
                  </Badge>
                  {frontmatter.mood !== undefined && (
                    <span className="text-muted-foreground">Mood: ★ {frontmatter.mood}/10</span>
                  )}
                  {frontmatter.tags && frontmatter.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {frontmatter.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSaving || (isDaily ? !frontmatter.daily_date : !frontmatter.title)}
        >
          {isSaving ? 'Saving...' : mode === 'create' ? 'Create' : 'Save Changes'}
        </Button>
      </div>

      {/* Mood Entry Modal for Daily Journals */}
      {isDaily && frontmatter.daily_date && (
        <MoodEntryModal
          open={moodModalOpen}
          onOpenChange={setMoodModalOpen}
          date={frontmatter.daily_date}
          initialRating={frontmatter.mood || 3}
          initialNote={moodNote}
          onSave={handleMoodSave}
        />
      )}
    </form>
  );
}
