'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Sparkles, Calendar, Landmark, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DebtFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: {
    id: number;
    name: string;
    category: string;
    original_amount: number;
    current_balance: number;
    interest_rate: number;
    monthly_payment: number;
    extra_payment: number;
    start_date: string | null;
    currency: string;
    notes: string | null;
  };
}

export function DebtFormDialog({
  open,
  onOpenChange,
  onSuccess,
  editData,
}: DebtFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(editData?.name || '');
  const [category, setCategory] = useState(editData?.category || 'other');
  const [originalAmount, setOriginalAmount] = useState(editData?.original_amount?.toString() || '');
  const [currentBalance, setCurrentBalance] = useState(editData?.current_balance?.toString() || '');
  const [interestRate, setInterestRate] = useState(editData?.interest_rate?.toString() || '0');
  const [monthlyPayment, setMonthlyPayment] = useState(editData?.monthly_payment?.toString() || '');
  const [extraPayment, setExtraPayment] = useState(editData?.extra_payment?.toString() || '0');
  const [startDate, setStartDate] = useState(editData?.start_date || '');
  const [currency, setCurrency] = useState(editData?.currency || 'USD');
  const [notes, setNotes] = useState(editData?.notes || '');

  const resetForm = () => {
    setName('');
    setCategory('other');
    setOriginalAmount('');
    setCurrentBalance('');
    setInterestRate('0');
    setMonthlyPayment('');
    setExtraPayment('0');
    setStartDate('');
    setCurrency('USD');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !originalAmount || !currentBalance || !monthlyPayment) return;

    setLoading(true);
    try {
      const url = editData
        ? `/api/finances/debts/${editData.id}`
        : '/api/finances/debts';

      const res = await fetch(url, {
        method: editData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          original_amount: parseFloat(originalAmount),
          current_balance: parseFloat(currentBalance),
          interest_rate: parseFloat(interestRate || '0'),
          monthly_payment: parseFloat(monthlyPayment),
          extra_payment: parseFloat(extraPayment || '0'),
          start_date: startDate || undefined,
          currency,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) throw new Error('Failed to save debt');

      resetForm();
      onSuccess();
    } catch (error) {
      console.error('Error saving debt:', error);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-transparent border-none focus:ring-0 p-0 text-[#061b0e] placeholder:text-[#434843]/40 font-medium";
  const sectionClasses = "p-4 rounded-xl border border-[#e9e8e5] bg-[#f4f3f1]/50 focus-within:border-[#061b0e] focus-within:bg-white transition-all duration-200";
  const labelClasses = "text-[10px] font-bold text-[#434843] uppercase tracking-widest mb-1 block";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none bg-transparent shadow-2xl">
        <div className="bg-[#faf9f6] flex flex-col h-full max-h-[90vh]">
          <DialogHeader className="p-8 pb-4 bg-[#061b0e] text-white">
            <div className="flex items-center gap-3 mb-2">
              <Landmark className="w-5 h-5 text-emerald-400" />
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {editData ? 'Adjust Instrument' : 'Draft New Debt'}
              </DialogTitle>
            </div>
            <p className="text-emerald-100/60 text-sm">Define the architecture of your liability.</p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Identity Section */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-[#061b0e] uppercase tracking-[0.2em] flex items-center gap-2">
                <Info className="w-3 h-3" /> Identity & Classification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={sectionClasses}>
                  <label className={labelClasses}>Instrument Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Primary Mortgage"
                    className={inputClasses}
                    required
                  />
                </div>
                <div className={sectionClasses}>
                  <label className={labelClasses}>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={cn(inputClasses, "appearance-none bg-transparent cursor-pointer")}
                  >
                    <option value="mortgage">Mortgage</option>
                    <option value="car">Car Loan</option>
                    <option value="student_loan">Student Loan</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="personal">Personal Loan</option>
                    <option value="medical">Medical</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Financials Section */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-[#061b0e] uppercase tracking-[0.2em] flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-[#9f402d]" /> Principal & Rate
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={sectionClasses}>
                  <label className={labelClasses}>Original Amount</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[#434843] font-bold text-sm">$</span>
                    <input
                      value={originalAmount}
                      onChange={(e) => setOriginalAmount(e.target.value)}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      className={inputClasses}
                      required
                    />
                  </div>
                </div>
                <div className={sectionClasses}>
                  <label className={labelClasses}>Current Balance</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[#434843] font-bold text-sm">$</span>
                    <input
                      value={currentBalance}
                      onChange={(e) => setCurrentBalance(e.target.value)}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      className={cn(inputClasses, "text-[#9f402d]")}
                      required
                    />
                  </div>
                </div>
                <div className={sectionClasses}>
                  <label className={labelClasses}>Interest Rate (%)</label>
                  <input
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="6.50"
                    type="number"
                    step="0.01"
                    className={inputClasses}
                  />
                </div>
                <div className={sectionClasses}>
                  <label className={labelClasses}>Currency</label>
                  <input
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                    placeholder="USD"
                    maxLength={3}
                    className={inputClasses}
                  />
                </div>
              </div>
            </section>

            {/* Payments Section */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-[#061b0e] uppercase tracking-[0.2em] flex items-center gap-2">
                <Calendar className="w-3 h-3 text-emerald-600" /> Velocity & Timing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={sectionClasses}>
                  <label className={labelClasses}>Minimum Payment</label>
                  <input
                    value={monthlyPayment}
                    onChange={(e) => setMonthlyPayment(e.target.value)}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className={inputClasses}
                    required
                  />
                </div>
                <div className={sectionClasses}>
                  <label className={labelClasses}>Extra Payment</label>
                  <input
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(e.target.value)}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className={cn(inputClasses, "text-emerald-600")}
                  />
                </div>
                <div className={sectionClasses}>
                  <label className={labelClasses}>Origination Date</label>
                  <input
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    type="date"
                    className={cn(inputClasses, "text-sm")}
                  />
                </div>
              </div>
            </section>

            {/* Commentary Section */}
            <section className={sectionClasses}>
              <label className={labelClasses}>Strategic Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe the purpose or terms of this instrument..."
                className="bg-transparent border-none focus:ring-0 p-0 text-[#061b0e] placeholder:text-[#434843]/40 font-medium min-h-[80px]"
              />
            </section>

            <div className="flex justify-end gap-4 pb-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-6 py-3 rounded-xl font-bold text-sm text-[#434843] hover:bg-[#e9e8e5] transition-colors"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                disabled={loading || !name || !originalAmount || !currentBalance || !monthlyPayment}
                className="px-8 py-3 rounded-xl bg-[#061b0e] text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all shadow-lg flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editData ? <Sparkles className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
                {editData ? 'Update Instrument' : 'Commission Debt'}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
