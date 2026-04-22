'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavingsFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: {
    id: number;
    name: string;
    institution: string | null;
    account_type: string;
    currency: string;
    notes: string | null;
  };
}

export function SavingsFormDialog({
  open,
  onOpenChange,
  onSuccess,
  editData,
}: SavingsFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [accountType, setAccountType] = useState('savings');
  const [currency, setCurrency] = useState('USD');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      if (editData) {
        setName(editData.name);
        setInstitution(editData.institution || '');
        setAccountType(editData.account_type);
        setCurrency(editData.currency);
        setNotes(editData.notes || '');
      } else {
        setName('');
        setInstitution('');
        setAccountType('savings');
        setCurrency('USD');
        setNotes('');
      }
    }
  }, [open, editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setLoading(true);
    try {
      const url = editData
        ? `/api/finances/savings/${editData.id}`
        : '/api/finances/savings';

      const res = await fetch(url, {
        method: editData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          institution: institution || undefined,
          account_type: accountType,
          currency,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) throw new Error('Failed to save account');
      onSuccess();
    } catch (error) {
      console.error('Error saving account:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 bg-media-surface-bright rounded-[2rem]">
        <div className="relative">
          {/* Header Section */}
          <div className="bg-media-primary p-10 text-media-on-primary">
            <button 
              type="button"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60 mb-2 block font-lexend">
              Asset Registry
            </span>
            <DialogTitle className="text-3xl font-black tracking-tighter font-lexend">
              {editData ? 'Refine Account' : 'Establish Fund'}
            </DialogTitle>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8 bg-media-surface-bright">
            {/* Primary Details Section */}
            <div className="space-y-6">
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-widest text-media-primary mb-2 block opacity-60">
                  Account Nomenclature
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Primary Emergency Reserves"
                  required
                  className="h-14 bg-media-surface-container-low border-media-outline-variant/30 focus:border-media-primary rounded-xl text-lg font-bold font-lexend transition-all placeholder:opacity-30 shadow-none border-b-2"
                />
              </div>

              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-widest text-media-primary mb-2 block opacity-60">
                  Institution
                </label>
                <Input
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Ally Financial, Vanguard"
                  className="h-12 bg-media-surface-container-low border-media-outline-variant/30 focus:border-media-primary rounded-xl font-medium transition-all placeholder:opacity-30 shadow-none border-b-2"
                />
              </div>
            </div>

            {/* Classification Section */}
            <div className="grid grid-cols-2 gap-6 p-6 rounded-2xl bg-media-surface-container-low border border-media-outline-variant/20">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-media-primary mb-2 block opacity-40">
                  Portfolio Class
                </label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-media-outline-variant/30 focus:border-media-primary py-2 font-bold text-sm outline-none transition-all cursor-pointer"
                >
                  <option value="savings">Savings</option>
                  <option value="checking">Checking</option>
                  <option value="money_market">Money Market</option>
                  <option value="cd">CD</option>
                  <option value="investment">Investment</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-media-primary mb-2 block opacity-40">
                  Currency
                </label>
                <Input
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  placeholder="USD"
                  maxLength={3}
                  className="bg-transparent border-0 border-b-2 border-media-outline-variant/30 focus:ring-0 focus:border-media-primary rounded-none p-0 h-10 font-bold text-sm tracking-widest placeholder:opacity-30 shadow-none"
                />
              </div>
            </div>

            {/* Context Section */}
            <div className="group">
              <label className="text-[10px] font-black uppercase tracking-widest text-media-primary mb-2 block opacity-60">
                Stewardship Notes
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Define the purpose and intent of this fund..."
                rows={3}
                className="bg-media-surface-container-low border-media-outline-variant/30 focus:border-media-primary rounded-xl font-medium resize-none transition-all placeholder:opacity-30 shadow-none border-b-2"
              />
            </div>

            {/* Action Footer */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-16 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-media-surface-container-high transition-all"
              >
                Abstain
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !name}
                className={cn(
                  "flex-[2] h-16 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
                  editData ? "bg-media-secondary text-media-on-secondary" : "bg-media-primary text-media-on-primary"
                )}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  editData ? 'Refine Registry' : 'Establish Fund'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
