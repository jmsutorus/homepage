'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 bg-media-surface-bright rounded-[2rem]">
        <div className="relative">
          {/* Header Section */}
          <div className="bg-media-secondary p-10 text-media-on-secondary">
            <button 
              type="button"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60 mb-2 block font-lexend">
              Balance Verification
            </span>
            <h2 className="text-3xl font-black tracking-tighter font-lexend">
              Log Capital
            </h2>
            <p className="text-xs font-bold opacity-80 mt-2 tracking-widest uppercase">
              {accountName}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10 bg-media-surface-bright">
            {/* Balance Input Section */}
            <div className="text-center space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-media-primary opacity-60 block">
                Current Valuation
              </label>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-light text-media-on-surface-variant opacity-40">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0.00"
                  required
                  autoFocus
                  className="bg-transparent border-0 text-5xl md:text-6xl font-black tracking-tighter text-media-primary font-lexend focus:ring-0 w-full text-center placeholder:opacity-10 outline-none"
                />
              </div>
            </div>

            {/* Date Section */}
            <div className="flex flex-col items-center gap-4 py-6 border-y border-media-outline-variant/10">
              <label className="text-[10px] font-black uppercase tracking-widest text-media-primary opacity-60">
                Observation Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="bg-media-surface-container-low px-6 py-3 rounded-full font-bold text-sm text-media-primary border border-media-outline-variant/20 focus:border-media-primary transition-all outline-none"
              />
            </div>

            {/* Action Footer */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-16 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-media-surface-container-high transition-all"
              >
                Disregard
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !balance}
                className="flex-[2] h-16 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all bg-media-secondary text-media-on-secondary"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Confirm Deposit'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
