'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { Drink, DrinkType, DrinkStatus } from '@/lib/db/drinks';
import { Loader2, Send } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';

interface DrinkFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: Drink;
}

export function DrinkFormDialog({ open, onOpenChange, onSuccess, initialData }: DrinkFormDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<DrinkType>('beer');
  const [producer, setProducer] = useState('');
  const [year, setYear] = useState('');
  const [abv, setAbv] = useState('');
  const [rating, setRating] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [status, setStatus] = useState<DrinkStatus>('tasted');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type || 'beer');
      setProducer(initialData.producer || '');
      setYear(initialData.year?.toString() || '');
      setAbv(initialData.abv?.toString() || '');
      setRating(initialData.rating?.toString() || '');
      setNotes(initialData.notes || '');
      setImageUrl(initialData.image_url || '');
      setFavorite(initialData.favorite);
      setStatus(initialData.status);
    } else {
      setName('');
      setType('beer');
      setProducer('');
      setYear('');
      setAbv('');
      setRating('');
      setNotes('');
      setImageUrl('');
      setFavorite(false);
      setStatus('tasted');
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name,
        type,
        producer: producer || undefined,
        year: year ? parseInt(year) : undefined,
        abv: abv ? parseFloat(abv) : undefined,
        rating: rating ? parseInt(rating) : undefined,
        notes: notes || undefined,
        image_url: imageUrl || undefined,
        favorite,
        status,
      };

      const url = initialData 
        ? `/api/drinks/${initialData.slug}`
        : '/api/drinks';
      
      const method = initialData ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to save drink');
      }

      toast.success(initialData ? 'Drink updated' : 'Drink created');
      onSuccess();
    } catch (error) {
      toast.error('Something went wrong');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formFields = (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Heady Topper" 
            className="text-base h-12 border-2 focus-visible:ring-brand"
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as DrinkType)}>
            <SelectTrigger className="text-base h-12 border-2">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beer">Beer</SelectItem>
              <SelectItem value="wine">Wine</SelectItem>
              <SelectItem value="cocktail">Cocktail</SelectItem>
              <SelectItem value="spirit">Spirit</SelectItem>
              <SelectItem value="coffee">Coffee</SelectItem>
              <SelectItem value="tea">Tea</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="producer">Producer (Brewery/Winery)</Label>
        <Input 
          id="producer"
          value={producer}
          onChange={(e) => setProducer(e.target.value)}
          placeholder="The Alchemist" 
          className="text-base h-12 border-2 focus-visible:ring-brand"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input 
            id="year"
            type="number" 
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2023" 
            className="text-base h-12 border-2 focus-visible:ring-brand"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="abv">ABV %</Label>
          <Input 
            id="abv"
            type="number" 
            step="0.1" 
            value={abv}
            onChange={(e) => setAbv(e.target.value)}
            placeholder="8.0" 
            className="text-base h-12 border-2 focus-visible:ring-brand"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rating">Rating (1-10)</Label>
          <Input 
            id="rating"
            type="number" 
            min="1" 
            max="10" 
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="10" 
            className="text-base h-12 border-2 focus-visible:ring-brand"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as DrinkStatus)}>
          <SelectTrigger className="text-base h-12 border-2">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tasted">Tasted</SelectItem>
            <SelectItem value="want_to_try">Want to Try</SelectItem>
            <SelectItem value="stocked">Stocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL (Optional)</Label>
        <Input 
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..." 
          className="text-base h-12 border-2 focus-visible:ring-brand"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea 
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Hazy, juicy, delicious..." 
          className="min-h-[100px] text-base border-2 focus-visible:ring-brand"
        />
      </div>

      <div className="flex items-center gap-3 rounded-lg border-2 p-3 shadow-sm border-input">
        <Switch
          id="favorite"
          checked={favorite}
          onCheckedChange={setFavorite}
        />
        <div className="space-y-0.5">
          <Label htmlFor="favorite">Favorite</Label>
          <div className="text-sm text-muted-foreground">
            Mark as one of your favorites
          </div>
        </div>
      </div>
    </>
  );

  const buttonText = loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Drink';

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{initialData ? 'Edit Drink' : 'Add Drink'}</DialogTitle>
            <DialogDescription>
              {initialData ? 'Update the details of this drink.' : 'Add a new drink to your collection.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formFields}
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {buttonText}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90vh] rounded-t-3xl p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-4 border-b text-left">
            <SheetTitle>{initialData ? 'Edit Drink' : 'Add Drink'}</SheetTitle>
            <SheetDescription>
              {initialData ? 'Update drink details' : 'Add a new drink to track'}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {formFields}
            </div>
            <div className="border-t px-6 py-4 bg-background">
              <Button type="submit" disabled={loading} className="w-full h-12 text-base bg-brand hover:bg-brand/90 text-brand-foreground">
                <Send className="h-5 w-5 mr-2" />
                {buttonText}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
