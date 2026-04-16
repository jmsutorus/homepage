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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editData ? 'Edit Debt' : 'Add Debt'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="debt-name">Name *</Label>
              <Input
                id="debt-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mortgage, Car Loan, etc."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-category">Category</Label>
              <select
                id="debt-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="debt-original">Original Amount *</Label>
              <Input
                id="debt-original"
                value={originalAmount}
                onChange={(e) => setOriginalAmount(e.target.value)}
                placeholder="250000"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-balance">Current Balance *</Label>
              <Input
                id="debt-balance"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
                placeholder="200000"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="debt-rate">Interest Rate %</Label>
              <Input
                id="debt-rate"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="6.5"
                type="number"
                step="0.01"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-monthly">Monthly Payment *</Label>
              <Input
                id="debt-monthly"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
                placeholder="1500"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-extra">Extra Payment</Label>
              <Input
                id="debt-extra"
                value={extraPayment}
                onChange={(e) => setExtraPayment(e.target.value)}
                placeholder="200"
                type="number"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="debt-start">Start Date</Label>
              <Input
                id="debt-start"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                type="date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-currency">Currency</Label>
              <Input
                id="debt-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder="USD"
                maxLength={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="debt-notes">Notes</Label>
            <Textarea
              id="debt-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes..."
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
            <Button
              type="submit"
              disabled={loading || !name || !originalAmount || !currentBalance || !monthlyPayment}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editData ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
