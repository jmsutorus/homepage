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
  const [name, setName] = useState(editData?.name || '');
  const [institution, setInstitution] = useState(editData?.institution || '');
  const [accountType, setAccountType] = useState(editData?.account_type || 'savings');
  const [currency, setCurrency] = useState(editData?.currency || 'USD');
  const [notes, setNotes] = useState(editData?.notes || '');

  const resetForm = () => {
    setName('');
    setInstitution('');
    setAccountType('savings');
    setCurrency('USD');
    setNotes('');
  };

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

      resetForm();
      onSuccess();
    } catch (error) {
      console.error('Error saving account:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editData ? 'Edit Account' : 'Add Savings Account'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="savings-name">Account Name *</Label>
            <Input
              id="savings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Emergency Fund, Vacation, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="savings-institution">Institution</Label>
            <Input
              id="savings-institution"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="Chase, Ally, Vanguard, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="savings-type">Account Type</Label>
              <select
                id="savings-type"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
              <Label htmlFor="savings-currency">Currency</Label>
              <Input
                id="savings-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder="USD"
                maxLength={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="savings-notes">Notes</Label>
            <Textarea
              id="savings-notes"
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
            <Button type="submit" disabled={loading || !name}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editData ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
