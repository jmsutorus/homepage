'use client';

import { SavingsAccountWithBalance } from '@/lib/db/savings';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface SavingsAccountCardProps {
  account: SavingsAccountWithBalance;
  onLogBalance: (accountId: number, accountName: string) => void;
  onEdit: (account: SavingsAccountWithBalance) => void;
  onDelete: (id: number) => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
}

const accountIcons: Record<string, string> = {
  savings: 'account_balance',
  checking: 'account_balance_wallet',
  money_market: 'currency_exchange',
  cd: 'lock',
  investment: 'trending_up',
  other: 'token',
};

const accountTypeLabels: Record<string, string> = {
  savings: 'High Yield',
  checking: 'Checking',
  money_market: 'Market Fund',
  cd: 'Time Deposit',
  investment: 'Growth',
  other: 'Asset',
};

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function SavingsAccountCard({
  account,
  onLogBalance,
  onEdit,
  onDelete,
  variant = 'primary',
}: SavingsAccountCardProps) {
  const iconName = accountIcons[account.account_type] || 'account_balance';
  const typeLabel = accountTypeLabels[account.account_type] || 'Savings';

  return (
    <div className="group relative bg-media-surface-container p-1 rounded-xl transition-all duration-500 hover:scale-[1.02]">
      <div className="bg-media-surface-container-lowest p-8 rounded-lg h-full flex flex-col justify-between relative overflow-hidden">
        {/* Actions - visible on hover */}
        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-media-on-surface-variant hover:bg-media-surface-container"
            onClick={(e) => { e.stopPropagation(); onEdit(account); }}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-media-error hover:bg-media-error-container"
            onClick={(e) => { e.stopPropagation(); onDelete(account.id); }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div>
          <div className="flex justify-between items-start mb-12">
            <div className="bg-media-primary-fixed p-3 rounded-lg">
              <span className="material-symbols-outlined text-media-on-primary-fixed">
                {iconName}
              </span>
            </div>
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase",
              variant === 'primary' && "bg-media-tertiary-fixed text-media-on-tertiary-fixed",
              variant === 'secondary' && "bg-media-secondary-fixed text-media-on-secondary-fixed-variant",
              variant === 'tertiary' && "bg-media-primary-fixed text-media-on-primary-fixed"
            )}>
              {typeLabel}
            </span>
          </div>
          
          <h3 className="text-media-primary text-2xl font-bold mb-2 font-lexend">{account.name}</h3>
          <p className="text-media-on-surface-variant text-sm mb-6 max-w-[240px]">
            {account.notes || `${account.institution || 'Liquid capital'} reserves.`}
          </p>
        </div>

        <div className="pt-8 border-t border-media-outline-variant/15">
          <div className="text-media-primary text-4xl font-extrabold tracking-tight mb-8 font-lexend">
            {account.currentBalance !== null
              ? formatCurrency(account.currentBalance, account.currency)
              : formatCurrency(0, account.currency)
            }
          </div>
          
          <Button
            onClick={() => onLogBalance(account.id, account.name)}
            className={cn(
              "w-full py-6 rounded-lg font-bold tracking-tight hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 h-auto",
              variant === 'primary' && "bg-media-primary text-media-on-primary",
              variant === 'secondary' && "bg-media-secondary text-media-on-secondary",
              variant === 'tertiary' && "bg-media-tertiary text-media-on-tertiary"
            )}
          >
            <span className="material-symbols-outlined text-base">edit_note</span>
            Log Balance
          </Button>
        </div>
      </div>
    </div>
  );
}
