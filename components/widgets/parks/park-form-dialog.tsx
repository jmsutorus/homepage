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
import { Send } from "lucide-react";
import { toast } from 'sonner';
import { PARK_CATEGORIES, DBParkCategory, ParkCategoryValue } from '@/lib/db/enums/park-enums';
import { TagInput } from '@/components/search/tag-input';
import { showCreationSuccess, showCreationError } from '@/lib/success-toasts';

interface ParkFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ParkFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: ParkFormDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ParkCategoryValue>(DBParkCategory.NationalPark);
  const [state, setState] = useState('');
  const [rating, setRating] = useState('');
  const [visited, setVisited] = useState('');
  const [poster, setPoster] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Park name is required');
      return;
    }

    setLoading(true);

    try {
      const data = {
        frontmatter: {
          title: title.trim(),
          category,
          state: state || undefined,
          rating: rating ? parseFloat(rating) : undefined,
          visited: visited || undefined,
          poster: poster || undefined,
          description: description || undefined,
          tags,
          featured,
          published,
        },
        content: '',
      };

      const response = await fetch('/api/parks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add park');
      }

      showCreationSuccess('park');
      
      // Reset form
      setTitle('');
      setCategory(DBParkCategory.NationalPark);
      setState('');
      setRating('');
      setVisited('');
      setPoster('');
      setDescription('');
      setTags([]);
      setFeatured(false);
      setPublished(true);

      onOpenChange(false);
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error('Error adding park:', error);
      showCreationError('park', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90vh] max-h-[90vh] rounded-t-3xl p-0 flex flex-col"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b text-left shrink-0">
          <SheetTitle>Add a Park</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Park Name *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Yellowstone"
                className="text-base h-12 border-2 focus-visible:ring-brand"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as ParkCategoryValue)}>
                  <SelectTrigger className="text-base h-12 border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PARK_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g., WY, MT, ID"
                  className="text-base h-12 border-2 focus-visible:ring-brand"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visited">Date Visited</Label>
                <Input
                  id="visited"
                  type="date"
                  value={visited}
                  onChange={(e) => setVisited(e.target.value)}
                  className="text-base h-12 border-2 focus-visible:ring-brand"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (0-10)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="Optional"
                  className="text-base h-12 border-2 focus-visible:ring-brand"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="poster">Photo URL</Label>
              <Input
                id="poster"
                type="url"
                value={poster}
                onChange={(e) => setPoster(e.target.value)}
                placeholder="https://..."
                className="text-base h-12 border-2 focus-visible:ring-brand"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description..."
                className="min-h-[100px] text-base border-2 focus-visible:ring-brand"
              />
            </div>

            <div className="space-y-2">
              <TagInput
                selectedTags={tags}
                onTagsChange={setTags}
                placeholder="Add tags..."
              />
            </div>

            <div className="flex flex-col gap-3 py-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={featured}
                  onCheckedChange={(c) => setFeatured(c === true)}
                  className="h-5 w-5"
                />
                <Label htmlFor="featured" className="text-base cursor-pointer">Featured (show on homepage)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="published"
                  checked={published}
                  onCheckedChange={(c) => setPublished(c === true)}
                  className="h-5 w-5"
                />
                <Label htmlFor="published" className="text-base cursor-pointer">Published (visible to public)</Label>
              </div>
            </div>
          </div>
          <div className="border-t px-6 py-4 bg-background shrink-0 pb-safe">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-16 text-lg font-black uppercase tracking-widest bg-media-secondary hover:brightness-110 text-media-on-secondary rounded-2xl shadow-xl shadow-media-secondary/20 transition-all active:scale-95"
            >
              <Send className="h-5 w-5 mr-2" />
              {loading ? 'Saving...' : 'Establish Park'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
