'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { EditorialInput, EditorialTextarea } from '@/components/ui/editorial-input';
import { toast } from 'sonner';
import { DrinkLog } from '@/lib/db/drinks';
import { TreeSuccess } from "@/components/ui/animations/tree-success";
import { useSuccessDialog } from "@/hooks/use-success-dialog";

interface DrinkLogDialogProps {
  drinkSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: DrinkLog;
}

export function DrinkLogDialog({ drinkSlug, open, onOpenChange, onSuccess, initialData }: DrinkLogDialogProps) {
  const [loading, setLoading] = useState(false);

  const { showSuccess, triggerSuccess } = useSuccessDialog({
    duration: 2000,
    onClose: () => {
      onOpenChange(false);
      onSuccess();
    },
  });

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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
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

      if (initialData) {
        toast.success('Log updated');
        onOpenChange(false);
        onSuccess();
      } else {
        triggerSuccess();
      }
    } catch (error) {
      toast.error('Something went wrong');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? 'Edit Consumption' : 'Log Consumption'}
      description={initialData ? 'Update the details of this tasting.' : 'Record a new tasting for this drink.'}
      submitText={initialData ? 'Save Changes' : 'Add Log'}
      isLoading={loading}
      loadingText={initialData ? 'Saving...' : 'Adding...'}
      onSubmit={handleSubmit}
    >
      {showSuccess ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-8">
          <div className="relative">
            <TreeSuccess size={160} showText={false} />
            <div className="absolute inset-0 bg-media-secondary/10 blur-3xl rounded-full -z-10 scale-150 animate-pulse" />
          </div>
          <div className="text-center space-y-3">
            <h3 className="text-3xl font-bold text-media-primary font-lexend tracking-tight uppercase">Tasting recorded</h3>
            <p className="text-media-on-surface-variant font-medium max-w-[280px] mx-auto">
              Your tasting notes have been synced to the archive.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <EditorialInput 
            label="Date"
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            sizeVariant="lg"
          />

          <EditorialInput 
            label="Location (Optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Home, Restaurant, etc." 
            sizeVariant="lg"
          />

          <EditorialInput 
            label="Rating (1-10)"
            type="number" 
            min="1" 
            max="10" 
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="10" 
            sizeVariant="lg"
          />

          <EditorialTextarea 
            label="Tasting Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Thoughts on this specific tasting..." 
            className="min-h-[120px]"
            sizeVariant="lg"
          />
        </form>
      )}
    </ResponsiveDialog>
  );
}


