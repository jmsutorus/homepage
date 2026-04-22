'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [label, setLabel] = useState(editData?.label || 'Primary Salary');
  const [effectiveDate, setEffectiveDate] = useState(
    editData?.effective_date || new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(editData?.notes || '');

  // Sync state with editData when it changes or dialog opens
  useEffect(() => {
    if (open) {
      setAmount(editData?.amount?.toString() || '');
      setCurrency(editData?.currency || 'USD');
      setLabel(editData?.label || 'Primary Salary');
      setEffectiveDate(
        editData?.effective_date || new Date().toISOString().split('T')[0]
      );
      setNotes(editData?.notes || '');
    }
  }, [editData, open]);

  const resetForm = () => {
    setAmount('');
    setCurrency('USD');
    setLabel('Primary Salary');
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
      <DialogContent showCloseButton={false} className="p-0 border-none sm:max-w-2xl bg-media-surface-container-lowest overflow-hidden shadow-[0_32px_64px_-12px_rgba(6,27,14,0.12)] rounded-2xl">
        {/* Modal Header */}
        <div className="bg-media-primary-container px-10 py-12 flex flex-col gap-2 relative">
          <div className="flex justify-between items-start z-10 relative">
            <h2 className="text-3xl font-bold tracking-tight text-media-on-primary-container font-lexend">
              {editData ? 'Edit Income Source' : 'New Strategic Source'}
            </h2>
            <button 
              onClick={() => onOpenChange(false)}
              className="cursor-pointer text-media-on-primary-container/60 hover:text-media-on-primary-container transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-media-on-primary-container/80 text-sm max-w-sm z-10 relative font-medium leading-relaxed">
            Update your monthly recurring revenue details. Changes will reflect in your financial forecasts and budget allocations.
          </p>
          {/* Decorative element */}
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-media-secondary opacity-10 blur-3xl rounded-full translate-x-12 translate-y-12"></div>
        </div>

        {/* Modal Content (Form) */}
        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Amount Field */}
            <div className="space-y-3">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-media-secondary">Monthly Take-Home Amount</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-media-on-surface-variant font-bold text-xl">$</span>
                <input 
                  autoFocus
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-2xl font-lexend placeholder:text-media-on-surface-variant/20"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Label Field */}
            <div className="space-y-3">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Source Label</label>
              <div className="relative">
                <input 
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-semibold text-lg font-lexend placeholder:text-media-on-surface-variant/20"
                  placeholder="e.g. Primary Salary"
                />
              </div>
            </div>

            {/* Currency Field */}
            <div className="space-y-3">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Currency</label>
              <div className="relative">
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-semibold text-lg font-lexend appearance-none cursor-pointer"
                >
                  <option value="USD">USD - United States Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                </select>
                <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-media-on-surface-variant">expand_more</span>
              </div>
            </div>

            {/* Date Field */}
            <div className="space-y-3">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Effective Since</label>
              <div className="relative">
                <input 
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-semibold text-lg font-lexend cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Notes Field */}
          <div className="space-y-3">
            <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Allocated Context (Notes)</label>
            <div className="relative">
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-base resize-none placeholder:text-media-on-surface-variant/20"
                placeholder="Include details about raises, bonuses, or frequency..."
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-10 pt-6">
            <button 
              type="button"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.2em] text-media-on-surface-variant hover:text-media-primary transition-colors font-lexend"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading || !amount}
              className="cursor-pointer px-10 py-4 bg-media-secondary text-media-on-secondary rounded-xl font-bold tracking-tight shadow-xl shadow-media-secondary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm disabled:opacity-50 disabled:scale-100 flex items-center gap-2 font-lexend"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {editData ? 'Update Source' : 'Establish Source'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
