'use client';

import { useState } from 'react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Plus, Film, Tv, Book, Gamepad2, Disc } from "lucide-react";
import { toast } from 'sonner';
import { TagInput } from '@/components/search/tag-input';
import { GenreInput } from '@/components/search/genre-input';
import { CreatorInput } from '@/components/search/creator-input';
import { showCreationSuccess, showCreationError } from '@/lib/success-toasts';
import { IMDBSearchModal } from './imdb-search-modal';
import { BookSearchModal } from './book-search-modal';
import { motion, PanInfo } from 'framer-motion';

interface MediaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const MEDIA_TYPES = [
  { value: 'movie', label: 'Movie', icon: Film },
  { value: 'tv', label: 'TV Show', icon: Tv },
  { value: 'book', label: 'Book', icon: Book },
  { value: 'game', label: 'Game', icon: Gamepad2 },
  { value: 'album', label: 'Album', icon: Disc },
];

export function MediaFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: MediaFormDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isIMDBModalOpen, setIsIMDBModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'movie' | 'tv' | 'book' | 'game' | 'album'>('movie');
  const [status, setStatus] = useState<'planned' | 'in-progress' | 'completed'>('planned');
  const [rating, setRating] = useState('');
  const [released, setReleased] = useState('');
  const [poster, setPoster] = useState('');
  const [description, setDescription] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [creator, setCreator] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setLoading(true);

    try {
      const data = {
        frontmatter: {
          title: title.trim(),
          type,
          status,
          rating: rating ? parseFloat(rating) : undefined,
          released: released || undefined,
          poster: poster || undefined,
          description: description || undefined,
          genres,
          tags,
          creator,
          featured,
          published,
        },
        content: '',
      };

      const response = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add media');
      }

      showCreationSuccess('media');
      
      // Reset form
      setTitle('');
      setType('movie');
      setStatus('planned');
      setRating('');
      setReleased('');
      setPoster('');
      setDescription('');
      setGenres([]);
      setTags([]);
      setCreator([]);
      setFeatured(false);
      setPublished(true);

      onOpenChange(false);
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error('Error adding media:', error);
      showCreationError('media', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90vh] max-h-[90vh] rounded-t-3xl p-0 flex flex-col bg-media-surface border-none"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <motion.div 
          className='flex flex-col h-full bg-media-surface-container-lowest'
          drag='y'
          dragConstraints={{ top: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info: PanInfo) => {
            if (info.offset.y > 150 || info.velocity.y > 500) {
              onOpenChange(false);
            }
          }}
        >
          {/* Drag Handle */}
          <div className='flex-none flex justify-center pt-3 pb-1'>
            <div className='w-12 h-1.5 bg-media-outline-variant/30 rounded-full' />
          </div>

          <div className='flex flex-col h-full overflow-hidden'>
        <SheetHeader className="px-8 pt-8 pb-4 border-b border-media-outline-variant/10 text-left shrink-0">
          <SheetTitle className="text-3xl font-black tracking-tighter text-media-primary">Add to Library</SheetTitle>
        </SheetHeader>

        {/* Search Modals */}
        <IMDBSearchModal
          open={isIMDBModalOpen}
          onOpenChange={setIsIMDBModalOpen}
          onMediaSelect={(data) => {
            setTitle(data.title || title);
            if (data.type) setType(data.type as any);
            if (data.rating !== undefined) setRating(data.rating.toString());
            if (data.released) setReleased(data.released);
            if (data.genres) setGenres(data.genres);
            if (data.poster) setPoster(data.poster);
            if (data.description) setDescription(data.description);
            if (data.creator) setCreator(data.creator);
          }}
        />
        <BookSearchModal
          open={isBookModalOpen}
          onOpenChange={setIsBookModalOpen}
          onBookSelect={(data) => {
            setTitle(data.title || title);
            setType('book');
            if (data.rating !== undefined) setRating(data.rating.toString());
            if (data.released) setReleased(data.released);
            if (data.genres) setGenres(data.genres);
            if (data.poster) setPoster(data.poster);
            if (data.description) setDescription(data.description);
            if (data.creator) setCreator(data.creator);
          }}
        />

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden font-lexend">
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
            {/* Quick Search Buttons */}
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsIMDBModalOpen(true)}
                className="flex-1 h-12 rounded-xl border-media-outline-variant/20 bg-media-surface-container-low hover:bg-media-secondary hover:text-media-on-secondary transition-all font-bold text-[10px] uppercase tracking-widest gap-2"
              >
                <Plus className="w-4 h-4" /> Import from IMDB
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsBookModalOpen(true)}
                className="flex-1 h-12 rounded-xl border-media-outline-variant/20 bg-media-surface-container-low hover:bg-media-secondary hover:text-media-on-secondary transition-all font-bold text-[10px] uppercase tracking-widest gap-2"
              >
                <Plus className="w-4 h-4" /> Import from Books
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[10px] uppercase tracking-[0.2em] font-black text-media-secondary ml-1">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Inception"
                  className="text-lg h-14 bg-media-surface-container-low border-none focus-visible:ring-2 focus-visible:ring-media-secondary/20 rounded-2xl"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-[10px] uppercase tracking-[0.2em] font-black text-media-secondary ml-1">Category</Label>
                  <Select value={type} onValueChange={(v: any) => setType(v)}>
                    <SelectTrigger className="h-12 bg-media-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-media-secondary/20 font-bold text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="font-lexend">
                      {MEDIA_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          <div className="flex items-center gap-2">
                            <t.icon className="w-4 h-4" />
                            {t.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-[10px] uppercase tracking-[0.2em] font-black text-media-secondary ml-1">Status</Label>
                  <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                    <SelectTrigger className="h-12 bg-media-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-media-secondary/20 font-bold text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="font-lexend">
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="released" className="text-[10px] uppercase tracking-[0.2em] font-black text-media-secondary ml-1">Release Date</Label>
                  <Input
                    id="released"
                    type="date"
                    value={released}
                    onChange={(e) => setReleased(e.target.value)}
                    className="h-12 bg-media-surface-container-low border-none rounded-xl focus-visible:ring-2 focus-visible:ring-media-secondary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating" className="text-[10px] uppercase tracking-[0.2em] font-black text-media-secondary ml-1">Rating (0-10)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    placeholder="Optional"
                    className="h-12 bg-media-surface-container-low border-none rounded-xl focus-visible:ring-2 focus-visible:ring-media-secondary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="poster" className="text-[10px] uppercase tracking-[0.2em] font-black text-media-secondary ml-1">Poster URL</Label>
                <Input
                  id="poster"
                  type="url"
                  value={poster}
                  onChange={(e) => setPoster(e.target.value)}
                  placeholder="https://..."
                  className="h-12 bg-media-surface-container-low border-none rounded-xl focus-visible:ring-2 focus-visible:ring-media-secondary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[10px] uppercase tracking-[0.2em] font-black text-media-secondary ml-1">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A cinematic masterpiece about..."
                  className="min-h-[100px] bg-media-surface-container-low border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-media-secondary/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                   <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-media-secondary ml-1">Creators</Label>
                   <CreatorInput
                    label=""
                    selectedCreators={creator}
                    onCreatorsChange={setCreator}
                  />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-media-secondary ml-1">Genres</Label>
                   <GenreInput
                    label=""
                    selectedGenres={genres}
                    onGenresChange={setGenres}
                  />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-media-secondary ml-1">Tags</Label>
                   <TagInput
                    selectedTags={tags}
                    onTagsChange={setTags}
                    placeholder="Add tags..."
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 py-2 pt-4">
                <div className="flex items-center space-x-3 bg-media-surface-container-low/50 p-4 rounded-xl">
                  <Checkbox
                    id="featured"
                    checked={featured}
                    onCheckedChange={(c) => setFeatured(c === true)}
                    className="h-5 w-5 border-media-secondary"
                  />
                  <Label htmlFor="featured" className="text-sm font-bold text-media-primary cursor-pointer">Featured in Bento Collection</Label>
                </div>
                <div className="flex items-center space-x-3 bg-media-surface-container-low/50 p-4 rounded-xl">
                  <Checkbox
                    id="published"
                    checked={published}
                    onCheckedChange={(c) => setPublished(c === true)}
                    className="h-5 w-5 border-media-secondary"
                  />
                  <Label htmlFor="published" className="text-sm font-bold text-media-primary cursor-pointer">Publicly Published</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-media-outline-variant/10 px-8 py-6 bg-media-surface shrink-0 pb-safe">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-16 text-lg font-black uppercase tracking-widest bg-media-secondary hover:brightness-110 text-media-on-secondary rounded-2xl shadow-xl shadow-media-secondary/20 transition-all active:scale-95"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full border-2 border-media-on-secondary/30 border-t-media-on-secondary animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Finalize Entry
                </div>
              )}
            </Button>
          </div>
        </form>
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
