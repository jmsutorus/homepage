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

interface IncomeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: {
    id: number;
    amount: number;
    currency: string;
    label: string;
    effective_date: string;
    notes: string | null;
  };
}

export function IncomeFormDialog({
  open,
  onOpenChange,
  onSuccess,
  editData,
}: IncomeFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(editData?.amount?.toString() || '');
  const [currency, setCurrency] = useState(editData?.currency || 'USD');
  const [label, setLabel] = useState(editData?.label || 'Primary');
  const [effectiveDate, setEffectiveDate] = useState(
    editData?.effective_date || new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(editData?.notes || '');

  const resetForm = () => {
    setAmount('');
    setCurrency('USD');
    setLabel('Primary');
    setEffectiveDate(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setLoading(true);
    try {
      const url = editData
        ? `/api/finances/budget/income/${editData.id}`
        : '/api/finances/budget/income';

      const res = await fetch(url, {
        method: editData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency,
          label,
          effective_date: effectiveDate,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) throw new Error('Failed to save income');

      resetForm();
      onSuccess();
    } catch (error) {
      console.error('Error saving income:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {editData ? 'Edit Income Source' : 'Add Income Source'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="income-amount">Monthly Take-Home Amount *</Label>
            <Input
              id="income-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="5000"
              type="number"
              step="0.01"
              min="0"
              required
            />
            <p className="text-xs text-muted-foreground">
              After-tax income per month
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="income-label">Label</Label>
              <Input
                id="income-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Primary Job"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="income-currency">Currency</Label>
              <Input
                id="income-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder="USD"
                maxLength={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="income-date">Effective Since</Label>
            <Input
              id="income-date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              type="date"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="income-notes">Notes</Label>
            <Textarea
              id="income-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Raise, new job, etc."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !amount}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editData ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
