'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    category: string | null;
    billingDay: number | null;
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
  const [category, setCategory] = useState(editData?.category || '');
  const [billingDay, setBillingDay] = useState(editData?.billingDay?.toString() || '');
  const [notes, setNotes] = useState(editData?.notes || '');

  // Sync state with editData when it changes or dialog opens
  useEffect(() => {
    if (open) {
      setName(editData?.name || '');
      setWebsite(editData?.website || '');
      setPrice(editData?.price?.toString() || '');
      setCycle(editData?.cycle || 'monthly');
      setCurrency(editData?.currency || 'USD');
      setCategory(editData?.category || '');
      setBillingDay(editData?.billingDay?.toString() || '');
      setNotes(editData?.notes || '');
    }
  }, [editData, open]);

  const resetForm = () => {
    setName('');
    setWebsite('');
    setPrice('');
    setCycle('monthly');
    setCurrency('USD');
    setCategory('');
    setBillingDay('');
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
          category: category || undefined,
          billing_day: billingDay ? parseInt(billingDay) : undefined,
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
      <DialogContent showCloseButton={false} className="p-0 border-none sm:max-w-2xl bg-media-surface-container-lowest overflow-hidden shadow-[0_32px_64px_-12px_rgba(6,27,14,0.12)] rounded-2xl">
        {/* Modal Header */}
        <div className="bg-media-primary-container px-10 py-12 flex flex-col gap-2 relative">
          <div className="flex justify-between items-start z-10 relative">
            <h2 className="text-3xl font-bold tracking-tight text-media-on-primary-container font-lexend">
              {editData ? 'Adjust Enrollment' : 'Enlist Subscription'}
            </h2>
            <button 
              type="button"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer text-media-on-primary-container/60 hover:text-media-on-primary-container transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-media-on-primary-container/80 text-sm max-w-sm z-10 relative font-medium leading-relaxed">
            Configure your recurring digital footprint to refine your monthly financial velocity.
          </p>
          {/* Decorative element */}
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-media-secondary opacity-10 blur-3xl rounded-full translate-x-12 translate-y-12"></div>
        </div>

        {/* Modal Content (Form) */}
        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Name Field */}
            <div className="md:col-span-7 space-y-3">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Subscription Name</label>
              <div className="relative">
                <input 
                  autoFocus
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-xl font-lexend placeholder:text-media-on-surface-variant/20"
                  placeholder="e.g. Netflix, Spotify, ChatGPT"
                />
              </div>
            </div>

            {/* Price Field */}
            <div className="md:col-span-5 space-y-3">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-media-secondary">Subscription Fee</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-media-on-surface-variant font-bold text-xl">$</span>
                <input 
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-12 pr-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-2xl font-lexend placeholder:text-media-on-surface-variant/20"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Category Field */}
            <div className="md:col-span-6 space-y-3">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Portfolio Category</label>
              <div className="relative">
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-semibold text-lg font-lexend appearance-none cursor-pointer"
                >
                  <option value="">Select Category</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Streaming">Streaming</option>
                  <option value="Cloud">Cloud</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Finance">Finance</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Food">Food</option>
                  <option value="Other">Other</option>
                </select>
                <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-media-on-surface-variant">expand_more</span>
              </div>
            </div>

            {/* Billing Day Field */}
            <div className="md:col-span-6 space-y-3">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Renewal Date (Day)</label>
              <div className="relative">
                <input 
                  type="number"
                  min="1"
                  max="31"
                  value={billingDay}
                  onChange={(e) => setBillingDay(e.target.value)}
                  className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-semibold text-lg font-lexend placeholder:text-media-on-surface-variant/20"
                  placeholder="e.g. 1"
                />
              </div>
            </div>

            {/* Website Field */}
            <div className="md:col-span-7 space-y-3">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Provider Domain</label>
              <div className="relative">
                <input 
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-base font-lexend placeholder:text-media-on-surface-variant/20"
                  placeholder="https://provider.com"
                />
              </div>
            </div>

            {/* Cycle Field */}
            <div className="md:col-span-5 space-y-3">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Billing Cadence</label>
              <div className="relative">
                <select 
                  value={cycle}
                  onChange={(e) => setCycle(e.target.value)}
                  className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-semibold text-base font-lexend appearance-none cursor-pointer"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-media-on-surface-variant">expand_more</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
             {/* Currency Field */}
             <div className="md:col-span-4 space-y-3">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Currency</label>
              <div className="relative">
                <input 
                  maxLength={3}
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-lg font-lexend text-center"
                  placeholder="USD"
                />
              </div>
            </div>

            {/* Notes Field */}
            <div className="md:col-span-8 space-y-3">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Commitment Context (Notes)</label>
              <div className="relative">
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={1}
                  className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-base resize-none placeholder:text-media-on-surface-variant/20"
                  placeholder="Details about tiers, bundles, or shared access..."
                />
              </div>
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
              disabled={loading || !name || !price}
              className="cursor-pointer px-10 py-4 bg-media-secondary text-media-on-secondary rounded-xl font-bold tracking-tight shadow-xl shadow-media-secondary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm disabled:opacity-50 disabled:scale-100 flex items-center gap-2 font-lexend"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {editData ? 'Update Enrollment' : 'Enlist Subscription'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
