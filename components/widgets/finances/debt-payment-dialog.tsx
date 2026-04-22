'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, DollarSign, Calendar, History, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const inputClasses = "w-full bg-transparent border-none focus:ring-0 p-0 text-[#061b0e] placeholder:text-[#434843]/40 font-medium";
  const sectionClasses = "p-4 rounded-xl border border-[#e9e8e5] bg-[#f4f3f1]/50 focus-within:border-[#061b0e] focus-within:bg-white transition-all duration-200";
  const labelClasses = "text-[10px] font-bold text-[#434843] uppercase tracking-widest mb-1 block";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none bg-transparent shadow-2xl">
        <div className="bg-[#faf9f6] flex flex-col h-full">
          <DialogHeader className="p-8 pb-4 bg-[#061b0e] text-white">
            <div className="flex items-center gap-3 mb-2">
              <History className="w-5 h-5 text-emerald-400" />
              <DialogTitle className="text-2xl font-bold tracking-tight">
                Log Transaction
              </DialogTitle>
            </div>
            <p className="text-emerald-100/60 text-sm">Recording payment for <span className="text-white font-bold">{debtName}</span></p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className={sectionClasses}>
                <label className={labelClasses}>Payment Amount</label>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#434843]" />
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className={cn(inputClasses, "text-lg font-bold truncate")}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className={sectionClasses}>
                <label className={labelClasses}>Transaction Date</label>
                <div className="flex items-center gap-2 text-[#434843]">
                  <Calendar className="w-4 h-4" />
                  <input
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    type="date"
                    className={cn(inputClasses, "text-sm")}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={sectionClasses}>
              <label className={labelClasses}>Transaction Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Principal reduction, scheduled payment, etc."
                className="bg-transparent border-none focus:ring-0 p-0 text-[#061b0e] placeholder:text-[#434843]/40 font-medium min-h-[60px]"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || !amount}
                className="cursor-pointer w-full py-4 rounded-xl bg-[#061b0e] text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Execute Payment
              </button>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer w-full py-3 rounded-xl font-bold text-sm text-[#434843] hover:bg-[#e9e8e5] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
