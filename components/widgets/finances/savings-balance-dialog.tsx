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
import { Loader2 } from 'lucide-react';

interface SavingsBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  accountId: number;
  accountName: string;
}

export function SavingsBalanceDialog({
  open,
  onOpenChange,
  onSuccess,
  accountId,
  accountName,
}: SavingsBalanceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balance || !date) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/finances/savings/${accountId}/balances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          balance: parseFloat(balance),
          date,
        }),
      });

      if (!res.ok) throw new Error('Failed to add balance');

      setBalance('');
      setDate(new Date().toISOString().split('T')[0]);
      onSuccess();
    } catch (error) {
      console.error('Error adding balance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Log Balance — {accountName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="balance-amount">Current Balance *</Label>
            <Input
              id="balance-amount"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="10000.00"
              type="number"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance-date">Date *</Label>
            <Input
              id="balance-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
              required
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
            <Button type="submit" disabled={loading || !balance}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Log Balance
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
