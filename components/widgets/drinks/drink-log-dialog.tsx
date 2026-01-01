'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { DrinkLog } from '@/lib/db/drinks';
import { Loader2 } from 'lucide-react';

interface DrinkLogDialogProps {
  drinkSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: DrinkLog;
}

export function DrinkLogDialog({ drinkSlug, open, onOpenChange, onSuccess, initialData }: DrinkLogDialogProps) {
  const [loading, setLoading] = useState(false);

  // Form state
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setLocation(initialData.location || '');
      setRating(initialData.rating ? String(initialData.rating) : '');
      setNotes(initialData.notes || '');
    } else {
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setLocation('');
      setRating('');
      setNotes('');
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = initialData 
        ? `/api/drinks/logs/${initialData.id}`
        : `/api/drinks/${drinkSlug}/logs`;
      
      const method = initialData ? 'PATCH' : 'POST';

      const data = {
        date,
        location: location || undefined,
        rating: rating ? parseInt(rating) : undefined,
        notes: notes || undefined,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to save log');
      }

      toast.success(initialData ? 'Log updated' : 'Log added');
      onSuccess();
    } catch (error) {
      toast.error('Something went wrong');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Consumption' : 'Log Consumption'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the details of this tasting.' : 'Record a new tasting for this drink.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input 
              id="date"
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input 
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Home, Restaurant, etc." 
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Tasting Notes</Label>
            <Textarea 
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Thoughts on this specific tasting..." 
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? 'Save Changes' : 'Add Log'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
