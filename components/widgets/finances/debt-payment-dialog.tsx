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

interface DebtPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  debtId: number;
  debtName: string;
}

export function DebtPaymentDialog({
  open,
  onOpenChange,
  onSuccess,
  debtId,
  debtName,
}: DebtPaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/finances/debts/${debtId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          date,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) throw new Error('Failed to add payment');

      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      onSuccess();
    } catch (error) {
      console.error('Error adding payment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Log Payment — {debtName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-amount">Payment Amount *</Label>
            <Input
              id="payment-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1500.00"
              type="number"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-date">Date *</Label>
            <Input
              id="payment-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-notes">Notes</Label>
            <Textarea
              id="payment-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Extra payment, refinance, etc."
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
            <Button type="submit" disabled={loading || !amount}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Log Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
