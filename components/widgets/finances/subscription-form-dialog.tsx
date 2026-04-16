'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface SubscriptionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: {
    id: number;
    name: string;
    website: string | null;
    price: number;
    cycle: string;
    currency: string;
    active: boolean;
    notes: string | null;
  };
}

export function SubscriptionFormDialog({
  open,
  onOpenChange,
  onSuccess,
  editData,
}: SubscriptionFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(editData?.name || '');
  const [website, setWebsite] = useState(editData?.website || '');
  const [price, setPrice] = useState(editData?.price?.toString() || '');
  const [cycle, setCycle] = useState(editData?.cycle || 'monthly');
  const [currency, setCurrency] = useState(editData?.currency || 'USD');
  const [notes, setNotes] = useState(editData?.notes || '');

  const resetForm = () => {
    setName('');
    setWebsite('');
    setPrice('');
    setCycle('monthly');
    setCurrency('USD');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    setLoading(true);
    try {
      const url = editData
        ? `/api/finances/subscriptions/${editData.id}`
        : '/api/finances/subscriptions';

      const res = await fetch(url, {
        method: editData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          website: website || undefined,
          price: parseFloat(price),
          cycle,
          currency,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) throw new Error('Failed to save subscription');

      resetForm();
      onSuccess();
    } catch (error) {
      console.error('Error saving subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editData ? 'Edit Subscription' : 'Add Subscription'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sub-name">Name *</Label>
            <Input
              id="sub-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Netflix, Spotify, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sub-website">Website (optional)</Label>
            <Input
              id="sub-website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://netflix.com"
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              Adding a URL will auto-fetch the site&apos;s icon
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sub-price">Price *</Label>
              <Input
                id="sub-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="9.99"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-cycle">Billing Cycle</Label>
              <select
                id="sub-cycle"
                value={cycle}
                onChange={(e) => setCycle(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sub-currency">Currency</Label>
            <Input
              id="sub-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              placeholder="USD"
              maxLength={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sub-notes">Notes</Label>
            <Textarea
              id="sub-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name || !price}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editData ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
