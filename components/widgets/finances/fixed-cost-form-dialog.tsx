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

interface FixedCostFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: {
    id: number;
    name: string;
    category: string;
    amount: number;
    currency: string;
    notes: string | null;
  };
}

export function FixedCostFormDialog({
  open,
  onOpenChange,
  onSuccess,
  editData,
}: FixedCostFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(editData?.name || '');
  const [category, setCategory] = useState(editData?.category || 'other');
  const [amount, setAmount] = useState(editData?.amount?.toString() || '');
  const [currency, setCurrency] = useState(editData?.currency || 'USD');
  const [notes, setNotes] = useState(editData?.notes || '');

  const resetForm = () => {
    setName('');
    setCategory('other');
    setAmount('');
    setCurrency('USD');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    setLoading(true);
    try {
      const url = editData
        ? `/api/finances/budget/fixed-costs/${editData.id}`
        : '/api/finances/budget/fixed-costs';

      const res = await fetch(url, {
        method: editData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          amount: parseFloat(amount),
          currency,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) throw new Error('Failed to save fixed cost');

      resetForm();
      onSuccess();
    } catch (error) {
      console.error('Error saving fixed cost:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editData ? 'Edit Fixed Cost' : 'Add Fixed Cost'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fc-name">Name *</Label>
            <Input
              id="fc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rent, Electric, Groceries, etc."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fc-category">Category</Label>
              <select
                id="fc-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="housing">Housing</option>
                <option value="utilities">Utilities</option>
                <option value="groceries">Groceries</option>
                <option value="transportation">Transportation</option>
                <option value="insurance">Insurance</option>
                <option value="healthcare">Healthcare</option>
                <option value="childcare">Childcare</option>
                <option value="phone">Phone</option>
                <option value="internet">Internet</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fc-amount">Monthly Amount *</Label>
              <Input
                id="fc-amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1500"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fc-currency">Currency</Label>
            <Input
              id="fc-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              placeholder="USD"
              maxLength={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fc-notes">Notes</Label>
            <Textarea
              id="fc-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name || !amount}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editData ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
