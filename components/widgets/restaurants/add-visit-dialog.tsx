'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface AddVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantSlug: string;
  onSuccess?: () => void;
  defaultEventId?: number;
  defaultDate?: string;
}

export function AddVisitDialog({
  open,
  onOpenChange,
  restaurantSlug,
  onSuccess,
  defaultEventId,
  defaultDate,
}: AddVisitDialogProps) {
  const [loading, setLoading] = useState(false);
  const [visitDate, setVisitDate] = useState(defaultDate ?? new Date().toISOString().split('T')[0]);
  const [rating, setRating] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!visitDate) {
      toast.error('Visit date is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/restaurants/${restaurantSlug}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visit_date: visitDate,
          rating: rating ? parseInt(rating) : undefined,
          notes: notes || undefined,
          eventId: defaultEventId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add visit');
      }

      toast.success('Visit added');
      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      setVisitDate(new Date().toISOString().split('T')[0]);
      setRating('');
      setNotes('');
    } catch (error) {
      console.error('Error adding visit:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add visit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Visit</DialogTitle>
          <DialogDescription>
            Record a visit to this restaurant
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Visit Date */}
          <div className="space-y-2">
            <Label htmlFor="visit_date">Date *</Label>
            <Input
              id="visit_date"
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              required
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating">Rating (optional)</Label>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger>
                <SelectValue placeholder="Rate this visit 1-10" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you order? How was it?"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Adding...' : 'Add Visit'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
