'use client';

import { useState, useRef, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { IMDBSearchModal } from './imdb-search-modal';
import { BookSearchModal } from './book-search-modal';
import { 
  Save, 
  Image as ImageIcon, 
  Maximize2, 
  Eye, 
  Clock, 
  Lightbulb, 
  Bookmark,
  Plus
} from 'lucide-react';
import { showCreationSuccess, showCreationError } from '@/lib/success-toasts';
import { TagInput } from '@/components/search/tag-input';
import { GenreInput } from '@/components/search/genre-input';
import { CreatorInput } from '@/components/search/creator-input';
import { cn } from '@/lib/utils';
import { SuccessOverlay } from '@/components/ui/animations/success-overlay';

interface MediaFrontmatter {
  title: string;
  type: 'movie' | 'tv' | 'book' | 'game' | 'album';
  status: 'in-progress' | 'completed' | 'planned';
  rating?: number;
  started?: string;
  completed?: string;
  released?: string;
  genres?: string[];
  poster?: string;
  tags?: string[];
  description?: string;
  length?: string;
  timeSpent?: number;
  featured?: boolean;
  published?: boolean;
  creator?: string[];
  progress?: number;
}

interface MediaEditorialEditorProps {
  initialFrontmatter?: MediaFrontmatter;
  initialContent?: string;
  mode: 'create' | 'edit';
  existingType?: string;
  existingSlug?: string;
}

export function MediaEditorialEditor({
  initialFrontmatter,
  initialContent = '',
  mode,
  existingType,
  existingSlug,
}: MediaEditorialEditorProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const [frontmatter, setFrontmatter] = useState<MediaFrontmatter>(
    initialFrontmatter || {
      title: '',
      type: 'movie',
      status: 'planned',
      genres: [],
      tags: [],
      creator: [],
      featured: false,
      published: true,
      progress: 0,
    }
  );
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedPath, setSavedPath] = useState<string | null>(null);
  const [isIMDBModalOpen, setIsIMDBModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Monitor scroll for sticky header effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const normalizeDate = (dateString: string): string => {
    try {
      if (dateString.includes('T')) {
        return dateString.split('T')[0];
      }
      return dateString;
    } catch {
      return dateString;
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

  const handleSave = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const endpoint =
        mode === 'create'
          ? '/api/media'
          : `/api/media/${existingType}/${existingSlug}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          frontmatter,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save media file');
      }

      if (mode === 'create') {
        showCreationSuccess('media', { persistent: true });
        setSavedPath(data.path);
        setShowSuccess(true);
      } else {
        router.push(data.path);
        router.refresh();
      }
      setLastSaved(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showCreationError('media', err);
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (mode === 'edit' && existingType && existingSlug) {
      router.push(`/media/${existingType}/${existingSlug}`);
    } else {
      router.push('/media');
    }
  };

  // Star Rating Component
  const StarRating = ({ value, onChange }: { value: number, onChange: (val: number) => void }) => {
    return (
      <div className="space-y-1 py-1">
        {[0, 5].map((row) => (
          <div key={row} className="flex gap-1 text-media-secondary">
            {[1, 2, 3, 4, 5].map((idx) => {
              const star = row + idx;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => onChange(star === value ? star - 1 : star)} // Toggle logic if clicking same star
                  className="cursor-pointer focus:outline-none transition-transform hover:scale-110 active:scale-95"
                >
                  <span 
                    className="material-symbols-outlined text-xl" 
                    style={{ fontVariationSettings: `'FILL' ${star <= value ? 1 : 0}` }}
                  >
                    star
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };


  return (
    <main className="min-h-screen bg-media-surface text-media-primary selection:bg-media-secondary-fixed selection:text-media-on-secondary-fixed font-lexend">
      {/* Search Modals */}
      <IMDBSearchModal
        open={isIMDBModalOpen}
        onOpenChange={setIsIMDBModalOpen}
        onMediaSelect={(data) => {
          setFrontmatter(prev => ({
            ...prev,
            title: data.title || prev.title,
            type: data.type || prev.type,
            rating: data.rating !== undefined ? data.rating : prev.rating,
            released: data.released || prev.released,
            genres: data.genres && data.genres.length > 0 ? data.genres : prev.genres,
            poster: data.poster || prev.poster,
            description: data.description || prev.description,
            length: data.length || prev.length,
            creator: data.creator && data.creator.length > 0 ? data.creator : prev.creator,
          }));
        }}
      />
      <BookSearchModal
        open={isBookModalOpen}
        onOpenChange={setIsBookModalOpen}
        onBookSelect={(data) => {
          setFrontmatter(prev => ({
            ...prev,
            title: data.title || prev.title,
            type: 'book',
            rating: data.rating !== undefined ? data.rating : prev.rating,
            released: data.released || prev.released,
            genres: data.genres && data.genres.length > 0 ? data.genres : prev.genres,
            poster: data.poster || prev.poster,
            description: data.description || prev.description,
            length: data.length || prev.length,
            creator: data.creator && data.creator.length > 0 ? data.creator : prev.creator,
          }));
        }}
      />


      <div className="max-w-4xl mx-auto px-6 md:px-8 pt-12 pb-24 space-y-12">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex-1 space-y-4">
            <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-media-secondary font-bold">
              <span className="hover:opacity-70 cursor-pointer" onClick={() => router.push('/media')}>Library</span>
              <span className="opacity-30">/</span>
              <span className="hover:opacity-70 cursor-pointer" onClick={() => router.push(`/media?type=${frontmatter.type}s`)}>
                {frontmatter.type.charAt(0).toUpperCase() + frontmatter.type.slice(1)}s
              </span>
              <span className="opacity-30">/</span>
              <span className="text-media-primary opacity-50">
                {mode === 'create' ? 'New Entry' : 'Editing'}
              </span>
            </nav>
            
            <div className="space-y-1">
              <input 
                type="text"
                value={frontmatter.title}
                onChange={(e) => setFrontmatter(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-transparent border-none p-0 text-5xl font-bold tracking-tighter text-media-primary focus:ring-0 placeholder:opacity-20"
                placeholder="Entry Title"
              />
              <input 
                type="text"
                value={frontmatter.description || ''}
                onChange={(e) => setFrontmatter(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-transparent border-none p-0 text-lg font-light text-media-on-surface-variant focus:ring-0 placeholder:opacity-20"
                placeholder="Add a subtitle or short description..."
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleCancel}
              className="cursor-pointer px-6 py-2.5 rounded-xl text-media-primary font-semibold hover:bg-media-surface-container-low transition-colors duration-300"
            >
              Cancel
            </button>
            <button 
              onClick={() => handleSave()}
              disabled={isSaving}
              className="cursor-pointer group relative px-8 py-2.5 rounded-xl bg-media-secondary text-media-on-secondary font-bold shadow-xl shadow-media-secondary/10 hover:brightness-110 active:scale-95 transition-all duration-300 disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                {isSaving ? 'Saving...' : (mode === 'create' ? 'Create Entry' : 'Save Changes')}
                {!isSaving && <Save className="w-4 h-4 transition-transform group-hover:rotate-12" />}
              </span>
            </button>
          </div>
        </div>

        {/* Metadata section */}
        <section className="bg-media-surface-container-lowest p-8 rounded-[2rem] shadow-sm border border-media-outline-variant/30 relative overflow-hidden group/meta">
          <div className="absolute top-0 right-0 w-32 h-32 bg-media-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="flex flex-col md:flex-row gap-10">
            {/* Poster Upload Area */}
            <div className="w-full md:w-48 flex-shrink-0">
              <div 
                className="aspect-[2/3] w-full rounded-2xl overflow-hidden relative group cursor-pointer bg-media-surface-container-high shadow-lg transition-transform duration-500 hover:scale-[1.02]"
                onClick={() => {
                  const url = prompt('Enter image URL:', frontmatter.poster);
                  if (url !== null) setFrontmatter(prev => ({ ...prev, poster: url }));
                }}
              >
                {frontmatter.poster ? (
                  <img 
                    src={frontmatter.poster} 
                    alt={frontmatter.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-media-on-surface-variant/40 gap-2">
                    <ImageIcon className="w-10 h-10" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">No Poster</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-media-primary/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Plus className="text-white w-8 h-8" />
                </div>
              </div>

              {/* External Search Buttons */}
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => setIsIMDBModalOpen(true)}
                  className="cursor-pointer flex-1 py-2 rounded-lg bg-media-surface-container text-[10px] font-bold uppercase tracking-wider hover:bg-media-surface-container-high transition-colors flex items-center justify-center gap-1"
                >
                  IMDB
                </button>
                <button 
                  onClick={() => setIsBookModalOpen(true)}
                  className="cursor-pointer flex-1 py-2 rounded-lg bg-media-surface-container text-[10px] font-bold uppercase tracking-wider hover:bg-media-surface-container-high transition-colors flex items-center justify-center gap-1"
                >
                  Books
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-8">
              <div className="flex items-center justify-between border-b border-media-outline-variant/10 pb-2">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-media-primary/40">Technical Details</h3>
                {frontmatter.featured && (
                  <Badge className="bg-media-tertiary-fixed text-media-on-tertiary-fixed border-none text-[8px] uppercase tracking-widest">Featured</Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                {/* Media Type */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-[0.2em] font-black text-media-secondary/70 ml-1">Category</label>
                  <Select 
                    value={frontmatter.type} 
                    onValueChange={(val: any) => setFrontmatter(prev => ({ ...prev, type: val }))}
                  >
                    <SelectTrigger className="border-none bg-media-surface-container-low rounded-xl focus:ring-2 focus:ring-media-secondary/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="movie">Movie</SelectItem>
                      <SelectItem value="tv">TV Show</SelectItem>
                      <SelectItem value="book">Book</SelectItem>
                      <SelectItem value="game">Game</SelectItem>
                      <SelectItem value="album">Album</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-[0.2em] font-black text-media-secondary/70 ml-1">Current State</label>
                  <Select 
                    value={frontmatter.status} 
                    onValueChange={(val: any) => setFrontmatter(prev => ({ ...prev, status: val }))}
                  >
                    <SelectTrigger className="border-none bg-media-surface-container-low rounded-xl focus:ring-2 focus:ring-media-secondary/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-[0.2em] font-black text-media-secondary/70 ml-1">Merit / Rating</label>
                  <StarRating 
                    value={frontmatter.rating || 0} 
                    onChange={(val) => setFrontmatter(prev => ({ ...prev, rating: val }))} 
                  />
                </div>

                {/* Length */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-[0.2em] font-black text-media-secondary/70 ml-1">Magnitude / Length</label>
                  <input 
                    type="text"
                    value={frontmatter.length || ''}
                    onChange={(e) => setFrontmatter(prev => ({ ...prev, length: e.target.value }))}
                    className="w-full bg-media-surface-container-low border-none rounded-xl p-2.5 text-sm font-medium focus:ring-2 focus:ring-media-secondary/10"
                    placeholder="e.g. 120m, 350p"
                  />
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-[0.2em] font-black text-media-secondary/70 ml-1">Progress (%)</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={frontmatter.progress !== undefined ? frontmatter.progress : ''}
                    onChange={(e) => setFrontmatter(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-media-surface-container-low border-none rounded-xl p-2.5 text-sm font-medium focus:ring-2 focus:ring-media-secondary/10"
                    placeholder="e.g. 50"
                  />
                </div>

                {/* Genres */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[9px] uppercase tracking-[0.2em] font-black text-media-secondary/70 ml-1">Genre Spectrum</label>
                  <GenreInput
                    label=""
                    selectedGenres={frontmatter.genres || []}
                    onGenresChange={(val) => setFrontmatter(prev => ({ ...prev, genres: val }))}
                  />
                </div>

                {/* Creators */}
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-[9px] uppercase tracking-[0.2em] font-black text-media-secondary/70 ml-1">Curation / Creator</label>
                  <CreatorInput
                    label=""
                    selectedCreators={frontmatter.creator || []}
                    onCreatorsChange={(val) => setFrontmatter(prev => ({ ...prev, creator: val }))}
                  />
                </div>

                {/* Tags */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[9px] uppercase tracking-[0.2em] font-black text-media-secondary/70 ml-1">Descriptors / Tags</label>
                  <TagInput
                    label=""
                    selectedTags={frontmatter.tags || []}
                    onTagsChange={(val) => setFrontmatter(prev => ({ ...prev, tags: val }))}
                  />
                </div>



                {/* Dates */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-media-outline-variant/5 mt-2">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-[0.15em] font-bold text-media-primary/40 ml-1 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Released
                    </label>
                    <input 
                      type="date"
                      value={frontmatter.released ? normalizeDate(frontmatter.released) : ''}
                      onChange={(e) => setFrontmatter(prev => ({ ...prev, released: e.target.value }))}
                      className="w-full bg-transparent border-b border-media-outline-variant/20 p-1 text-xs focus:ring-0 focus:border-media-secondary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-[0.15em] font-bold text-media-primary/40 ml-1 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Commenced
                    </label>
                    <input 
                      type="date"
                      value={frontmatter.started ? normalizeDate(frontmatter.started) : ''}
                      onChange={(e) => setFrontmatter(prev => ({ ...prev, started: e.target.value }))}
                      className="w-full bg-transparent border-b border-media-outline-variant/20 p-1 text-xs focus:ring-0 focus:border-media-secondary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-[0.15em] font-bold text-media-primary/40 ml-1 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Concluded
                    </label>
                    <input 
                      type="date"
                      value={frontmatter.completed ? normalizeDate(frontmatter.completed) : ''}
                      onChange={(e) => setFrontmatter(prev => ({ ...prev, completed: e.target.value }))}
                      className="w-full bg-transparent border-b border-media-outline-variant/20 p-1 text-xs focus:ring-0 focus:border-media-secondary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Toggle for Content Section */}
        <div className="md:hidden">
          <button 
            type="button"
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(10);
              }
              setIsContentExpanded(!isContentExpanded);
            }}
            className="w-full py-4 bg-media-surface-container-low rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-media-primary hover:bg-media-surface-container-high transition-colors shadow-sm border border-media-outline-variant/10"
          >
            <span className="material-symbols-outlined">
              {isContentExpanded ? 'expand_less' : 'expand_more'}
            </span>
            {isContentExpanded ? 'Collapse Content Section' : 'Expand Content Section'}
          </button>
        </div>

        {/* Markdown Editor Section */}
        <section className={cn(
          "space-y-6",
          !isContentExpanded && "hidden md:block"
        )}>
          <div className={cn(
            "bg-media-surface-container-lowest rounded-3xl shadow-xl overflow-hidden flex flex-col h-full md:min-h-[800px] min-h-[400px] border border-media-surface-container transition-all duration-500",
            isScrolled ? "ring-1 ring-media-outline-variant/20" : ""
          )}>
            {/* Custom Header Toolbar */}
            <div className="px-8 py-3 border-b border-media-surface-container-low flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-1">
                <button 
                  type="button"
                  onClick={() => insertMarkdown('# ', '')}
                  className="cursor-pointer w-9 h-9 rounded-lg flex items-center justify-center text-media-on-surface-variant hover:bg-media-surface-container-low hover:text-media-secondary transition-all"
                >
                  <span className="material-symbols-outlined text-xl">format_h1</span>
                </button>
                <button 
                   type="button"
                   onClick={() => insertMarkdown('## ', '')}
                  className="cursor-pointer w-9 h-9 rounded-lg flex items-center justify-center text-media-on-surface-variant hover:bg-media-surface-container-low hover:text-media-secondary transition-all"
                >
                  <span className="material-symbols-outlined text-xl">format_h2</span>
                </button>
                <div className="w-px h-5 bg-media-outline-variant/20 mx-2"></div>
                <button 
                   type="button"
                   onClick={() => insertMarkdown('**', '**')}
                  className="cursor-pointer w-9 h-9 rounded-lg flex items-center justify-center text-media-on-surface-variant hover:bg-media-surface-container-low hover:text-media-secondary transition-all"
                >
                  <span className="material-symbols-outlined text-xl font-bold">format_bold</span>
                </button>
                <button 
                   type="button"
                   onClick={() => insertMarkdown('*', '*')}
                  className="cursor-pointer w-9 h-9 rounded-lg flex items-center justify-center text-media-on-surface-variant hover:bg-media-surface-container-low hover:text-media-secondary transition-all"
                >
                  <span className="material-symbols-outlined text-xl italic">format_italic</span>
                </button>
                <button 
                   type="button"
                   onClick={() => insertMarkdown('> ', '')}
                  className="cursor-pointer w-9 h-9 rounded-lg flex items-center justify-center text-media-on-surface-variant hover:bg-media-surface-container-low hover:text-media-secondary transition-all"
                >
                  <span className="material-symbols-outlined text-xl">format_quote</span>
                </button>
                <div className="w-px h-5 bg-media-outline-variant/20 mx-2"></div>
                <button 
                   type="button"
                   onClick={() => insertMarkdown('- ', '')}
                  className="cursor-pointer w-9 h-9 rounded-lg flex items-center justify-center text-media-on-surface-variant hover:bg-media-surface-container-low hover:text-media-secondary transition-all"
                >
                  <span className="material-symbols-outlined text-xl">format_list_bulleted</span>
                </button>
                <button 
                   type="button"
                   onClick={() => insertMarkdown('[', '](url)')}
                  className="cursor-pointer w-9 h-9 rounded-lg flex items-center justify-center text-media-on-surface-variant hover:bg-media-surface-container-low hover:text-media-secondary transition-all"
                >
                  <span className="material-symbols-outlined text-xl">link</span>
                </button>
              </div>

              <div className="flex items-center gap-4 text-[10px] font-bold text-media-on-surface-variant uppercase tracking-widest opacity-60">
                <span>{content.split(/\s+/).filter(Boolean).length} Words</span>
                <span className="text-media-secondary flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-media-secondary animate-pulse" />
                  Live Sync
                </span>
              </div>
            </div>

            {/* Editing Area */}
            <div className="flex-1 p-8 md:p-12 lg:p-20 bg-media-surface-container-lowest">
              <textarea 
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full border-none focus:ring-0 bg-transparent text-xl leading-[1.8] text-media-on-surface-variant font-light resize-none placeholder:text-media-outline-variant/30 selection:bg-media-secondary-fixed md:min-h-[600px] min-h-[250px]" 
                placeholder="Start weaving your analytical reflections here..."
              />
            </div>


            {/* Footer Toolbar */}
            <div className="px-8 py-4 bg-media-surface-container-low/50 border-t border-media-outline-variant/10 flex justify-between items-center">
              <div className="flex gap-4">
                <span className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-media-on-surface-variant/40">
                  <Clock className="w-3.5 h-3.5" />
                  {lastSaved ? `Last saved at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Draft initialized'}
                </span>
              </div>
              <div className="flex gap-2">
                <button className="cursor-pointer p-2 rounded-xl text-media-primary hover:bg-media-secondary/10 hover:text-media-secondary transition-all duration-300">
                  <Eye className="w-5 h-5" />
                </button>
                <button className="cursor-pointer p-2 rounded-xl text-media-primary hover:bg-media-secondary/10 hover:text-media-secondary transition-all duration-300">
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Insight Sections */}
        <section className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          <div className="bg-media-primary-container p-8 rounded-3xl text-media-on-primary-container flex gap-6 group/insight transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover/insight:scale-110 transition-transform">
              <Lightbulb className="w-6 h-6 text-media-inverse-primary" />
            </div>
            <div className="space-y-2">
              <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-1 opacity-60">Editorial Logic</h4>
              <p className="text-sm font-light leading-relaxed">
                Consider expanding on the historical subtext and visual metaphors in your next deep-dive essay for this specific collection segment.
              </p>
            </div>
          </div>
          
          <div className="bg-media-surface-container-high p-8 rounded-3xl text-media-on-surface flex gap-6 hover:-translate-y-1 transition-transform group/link">
            <div className="w-12 h-12 rounded-2xl bg-media-secondary/10 flex items-center justify-center flex-shrink-0 group-hover/link:scale-110 transition-transform">
              <Bookmark className="w-6 h-6 text-media-secondary" />
            </div>
            <div className="space-y-2">
              <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-1 opacity-40">Contextual Resonance</h4>
              <p className="text-sm font-light leading-relaxed">
                This entry maintains semantic links with &quot;Interstellar Narratives&quot; and your earlier &quot;Cinematic Perspectives&quot; archive.
              </p>
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={(e) => {
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(50);
            }
            handleSave(e);
          }}
          disabled={isSaving}
          className="w-full py-4 bg-media-secondary text-media-on-secondary font-bold text-lg rounded-2xl shadow-xl shadow-media-secondary/20 hover:brightness-110 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 mt-8 cursor-pointer flex items-center justify-center gap-2"
        >
          {isSaving ? 'Saving...' : (mode === 'create' ? 'Create Entry' : 'Save Changes')}
          {!isSaving && <Save className="w-5 h-5" />}
        </button>
      </div>
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
