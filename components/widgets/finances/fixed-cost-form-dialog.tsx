'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Loader2, X } from 'lucide-react';

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

  // Sync state with editData when it changes or dialog opens
  useEffect(() => {
    if (open) {
      setName(editData?.name || '');
      setCategory(editData?.category || 'other');
      setAmount(editData?.amount?.toString() || '');
      setCurrency(editData?.currency || 'USD');
      setNotes(editData?.notes || '');
    }
  }, [editData, open]);

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
      <DialogContent showCloseButton={false} className="p-0 border-none sm:max-w-2xl bg-media-surface-container-lowest overflow-hidden shadow-[0_32px_64px_-12px_rgba(6,27,14,0.12)] rounded-2xl">
        {/* Modal Header */}
        <div className="bg-media-primary-container px-10 py-12 flex flex-col gap-2 relative">
          <div className="flex justify-between items-start z-10 relative">
            <h2 className="text-3xl font-bold tracking-tight text-media-on-primary-container font-lexend">
              {editData ? 'Edit Fixed Obligation' : 'Define Fixed Cost'}
            </h2>
            <button 
              onClick={() => onOpenChange(false)}
              className="cursor-pointer text-media-on-primary-container/60 hover:text-media-on-primary-container transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-media-on-primary-container/80 text-sm max-w-sm z-10 relative font-medium leading-relaxed">
            Specify recurring monthly expenses to establish your baseline needs and calculate discretionary overhead.
          </p>
          {/* Decorative element */}
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-media-secondary opacity-10 blur-3xl rounded-full translate-x-12 translate-y-12"></div>
        </div>

        {/* Modal Content (Form) */}
        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Name Field */}
            <div className="md:col-span-7 space-y-3">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Obligation Name</label>
              <div className="relative">
                <input 
                  autoFocus
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-xl font-lexend placeholder:text-media-on-surface-variant/20"
                  placeholder="e.g. Rent, Utilities, Groceries"
                />
              </div>
            </div>

            {/* Amount Field */}
            <div className="md:col-span-5 space-y-3">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-media-secondary">Monthly Amount</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-media-on-surface-variant font-bold text-xl">$</span>
                <input 
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

            {/* Category Field */}
            <div className="md:col-span-6 space-y-3">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Category</label>
              <div className="relative">
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-semibold text-lg font-lexend appearance-none cursor-pointer"
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
                <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-media-on-surface-variant">expand_more</span>
              </div>
            </div>

            {/* Currency Field */}
            <div className="md:col-span-6 space-y-3">
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
                placeholder="Include details about payment frequency or seasonal variability..."
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
              disabled={loading || !name || !amount}
              className="cursor-pointer px-10 py-4 bg-media-secondary text-media-on-secondary rounded-xl font-bold tracking-tight shadow-xl shadow-media-secondary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm disabled:opacity-50 disabled:scale-100 flex items-center gap-2 font-lexend"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {editData ? 'Update Obligation' : 'Define Obligation'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
