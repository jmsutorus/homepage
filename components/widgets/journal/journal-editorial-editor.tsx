'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LinkPicker } from '@/components/widgets/shared/link-picker';
import { JournalLink } from '@/lib/db/journals';
import { showCreationSuccess, showCreationError } from '@/lib/success-toasts';
import { TagInput } from '@/components/search/tag-input';
import { fireAchievementConfetti, isJournalMilestone, getJournalMilestoneMessage } from '@/lib/utils/confetti';
import { toast } from 'sonner';
import { SuccessOverlay } from '@/components/ui/animations/success-overlay';

interface JournalFrontmatter {
  title?: string;
  journal_type?: "daily" | "general";
  daily_date?: string;
  mood?: number;
  tags?: string[];
  featured?: boolean;
  published?: boolean;
  image_url?: string;
}

interface JournalEditorialEditorProps {
  initialFrontmatter?: JournalFrontmatter;
  initialContent?: string;
  initialLinks?: JournalLink[];
  mode: 'create' | 'edit';
  existingSlug?: string;
}

export function JournalEditorialEditor({
  initialFrontmatter,
  initialContent = '',
  initialLinks = [],
  mode,
  existingSlug,
}: JournalEditorialEditorProps) {
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
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedPath, setSavedPath] = useState<string | null>(null);

  // Initialize mood for resonance slider (0-10 format preferred for editorial)
  const [resonance, setResonance] = useState<number>(frontmatter.mood || 5);

  useEffect(() => {
    setFrontmatter(prev => ({ ...prev, mood: resonance }));
  }, [resonance]);

  const handleSave = async (published: boolean) => {
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
          frontmatter: { ...frontmatter, published },
          content,
          links,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save journal');
      }

      if (mode === 'create') {
        showCreationSuccess('journal', { persistent: true });

        if (data.totalJournals && isJournalMilestone(data.totalJournals)) {
          setTimeout(() => {
            fireAchievementConfetti('journal-milestone');
            toast.success('Milestone Reached!', {
              description: getJournalMilestoneMessage(data.totalJournals),
              duration: 5000,
            });
          }, 500);
        }

        setSavedPath(data.path);
        setShowSuccess(true);
      } else {
        router.push(data.path);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showCreationError('journal', err);
      setIsSaving(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-6 pt-12 pb-32">
      {error && (
        <div className="mb-8 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Header Section */}
      <section className="mb-12 text-center">
        <span className="text-media-secondary font-lexend uppercase tracking-widest text-sm mb-4 block">
          {mode === 'create' ? 'New Entry' : 'Edit Entry'}
        </span>
        <h1 className="text-5xl md:text-7xl font-lexend font-extrabold tracking-tighter text-media-primary leading-[1.1] mb-10">
          Record Your<br />Reflection
        </h1>
        <div className="max-w-2xl mx-auto">
          {!isDaily ? (
            <input
              className="w-full bg-transparent border-none p-0 text-center text-3xl md:text-4xl font-lexend font-bold text-media-primary placeholder:text-media-outline-variant focus:ring-0 transition-all"
              placeholder="Entry Title..."
              type="text"
              value={frontmatter.title || ''}
              onChange={(e) => setFrontmatter({ ...frontmatter, title: e.target.value })}
            />
          ) : (
             <div className="text-center text-3xl md:text-4xl font-lexend font-bold text-media-primary">
                {frontmatter.daily_date ? new Date(frontmatter.daily_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Select Date'}
             </div>
          )}
          <div className="h-[2px] w-full bg-media-surface-container-highest mt-4"></div>
        </div>
      </section>

      {/* Metadata Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 items-start border-b border-media-surface-container-highest pb-8">
        {/* Journal Type */}
        <div>
          <label className="block text-[10px] font-lexend text-media-secondary uppercase tracking-[0.2em] mb-3">Journal Type</label>
          <Select
            value={frontmatter.journal_type}
            onValueChange={(value: "daily" | "general") =>
              setFrontmatter({ ...frontmatter, journal_type: value })
            }
            disabled={mode === 'edit'}
          >
            <SelectTrigger className="w-full text-left px-4 py-3 h-auto rounded-xl bg-media-primary-fixed text-media-on-primary-fixed font-bold flex justify-between items-center text-sm transition-colors border-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General Reflection</SelectItem>
              <SelectItem value="daily">Daily Reflection</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-[10px] font-lexend text-media-secondary uppercase tracking-[0.2em] mb-3">Contextual Tags</label>
          <div className="bg-media-surface-container-low px-4 py-1.5 rounded-xl flex items-center gap-2 min-h-[44px]">
            <TagInput
              selectedTags={frontmatter.tags || []}
              onTagsChange={(tags) => setFrontmatter({ ...frontmatter, tags })}
              placeholder="Add tags..."
              hideLabel={true}
              className="bg-transparent border-none p-0 focus-visible:ring-0 text-sm font-lexend text-media-primary placeholder:text-media-outline-variant shadow-none"
            />
          </div>
        </div>
        {/* Current Resonance (Mood) */}
        <div>
          <label className="block text-[10px] font-lexend text-media-secondary uppercase tracking-[0.2em] mb-3">Current Resonance</label>
          <div className="relative pt-4 pb-2">
            <Slider
              value={[resonance]}
              onValueChange={([val]) => setResonance(val)}
              max={10}
              step={1}
              className="py-4"
            />
            <div className="flex justify-between mt-3 text-[9px] font-lexend text-media-outline-variant uppercase tracking-widest">
              <span>Quietude</span>
              <span>Ecstasy</span>
            </div>
          </div>
        </div>

        {/* Hero Image URL */}
        <div className="md:col-span-3">
          <label className="block text-[10px] font-lexend text-media-secondary uppercase tracking-[0.2em] mb-3">Hero Image URL</label>
          <div className="bg-media-surface-container-low px-4 py-2.5 rounded-xl flex items-center gap-2">
            <input
              type="text"
              className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-lexend text-media-primary placeholder:text-media-outline-variant transition-all font-medium"
              placeholder="https://example.com/image.jpg"
              value={frontmatter.image_url || ''}
              onChange={(e) => setFrontmatter({ ...frontmatter, image_url: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* Date Picker (Hidden by default, shown if Daily and Create mode) */}
      {isDaily && mode === 'create' && (
        <section className="mb-8">
            <label className="block text-[10px] font-lexend text-media-secondary uppercase tracking-[0.2em] mb-3 text-center">Entry Date</label>
            <div className="max-w-xs mx-auto">
                <input
                    type="date"
                    className="w-full bg-media-surface-container-low border-none rounded-xl px-4 py-3 text-media-primary font-lexend focus:ring-2 focus:ring-media-primary transition-all"
                    value={frontmatter.daily_date || ''}
                    onChange={(e) => setFrontmatter({ ...frontmatter, daily_date: e.target.value })}
                />
            </div>
        </section>
      )}

      {/* Editor Section */}
      <section className="relative mb-16">
        <div className="bg-media-surface-container-low rounded-3xl p-8 md:p-14 min-h-[600px] shadow-sm relative overflow-hidden">
          <textarea
            ref={textareaRef}
            className="w-full bg-transparent border-none focus:ring-0 text-xl md:text-2xl font-lexend leading-relaxed text-media-on-surface-variant placeholder:text-media-outline-variant/50 resize-none min-h-[500px]"
            placeholder="Tell your story..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        
        </div>
      </section>

      {/* Connections & Actions */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Linked Discoveries */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-lexend font-bold text-media-primary">Linked Discoveries</h3>
          </div>
          <LinkPicker links={links} onLinksChange={setLinks} />
        </div>

        {/* Save Actions */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving || (isDaily ? !frontmatter.daily_date : !frontmatter.title)}
              className="cursor-pointer w-full py-5 bg-media-secondary text-white rounded-2xl font-lexend font-bold text-lg shadow-xl shadow-media-secondary/10 active:scale-95 transition-transform disabled:opacity-50"
            >
              {isSaving ? 'Processing...' : 'Publish to Journal'}
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving || (isDaily ? !frontmatter.daily_date : !frontmatter.title)}
              className="cursor-pointer w-full py-5 bg-media-primary text-media-primary-fixed rounded-2xl font-lexend font-bold text-lg active:scale-95 transition-transform disabled:opacity-50"
            >
              {isSaving ? 'Processing...' : 'Save as Draft'}
            </button>
          </div>
        </div>
      </section>

      <SuccessOverlay 
        show={showSuccess} 
        onComplete={() => {
          if (savedPath) {
            router.push(savedPath);
            router.refresh();
          }
        }} 
      />
    </main>
  );
}
