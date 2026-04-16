'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil, PiggyBank, TrendingUp, Building2 } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { SavingsAccountWithBalance } from '@/lib/db/savings';
import { SavingsFormDialog } from './savings-form-dialog';
import { SavingsBalanceDialog } from './savings-balance-dialog';

interface SavingsTabProps {
  accounts: SavingsAccountWithBalance[];
}

const accountTypeLabels: Record<string, string> = {
  savings: 'Savings',
  checking: 'Checking',
  money_market: 'Money Market',
  cd: 'CD',
  investment: 'Investment',
  other: 'Other',
};

const CHART_COLORS = [
  'hsl(217, 91%, 60%)',   // blue
  'hsl(142, 71%, 45%)',   // green
  'hsl(280, 68%, 60%)',   // purple
  'hsl(25, 95%, 53%)',    // orange
  'hsl(340, 82%, 52%)',   // pink
  'hsl(174, 72%, 40%)',   // teal
];

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function SavingsTab({ accounts: initialAccounts }: SavingsTabProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<SavingsAccountWithBalance | undefined>();
  const [balanceDialog, setBalanceDialog] = useState<{ accountId: number; accountName: string } | null>(null);

  const accounts = initialAccounts;

  // Calculate total savings
  const totalByCurrency = new Map<string, number>();
  for (const acc of accounts) {
    if (acc.currentBalance !== null) {
      const curr = acc.currency;
      totalByCurrency.set(curr, (totalByCurrency.get(curr) || 0) + acc.currentBalance);
    }
  }

  // Prepare chart data: merge all balance snapshots by date
  const chartData = useMemo(() => {
    const dateMap = new Map<string, Record<string, number>>();

    for (const acc of accounts) {
      for (const bal of acc.balances) {
        const existing = dateMap.get(bal.date) || {};
        existing[acc.name] = bal.balance;
        dateMap.set(bal.date, existing);
      }
    }

    // Sort by date and forward-fill missing values
    const sorted = Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b));

    const lastKnown: Record<string, number> = {};
    return sorted.map(([date, values]) => {
      // Update last known values
      for (const [name, val] of Object.entries(values)) {
        lastKnown[name] = val;
      }
      // Fill in all accounts with last known value
      const point: Record<string, string | number> = { date };
      for (const acc of accounts) {
        point[acc.name] = lastKnown[acc.name] ?? 0;
      }
      return point;
    });
  }, [accounts]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this account and all its balance history?')) return;
    try {
      await fetch(`/api/finances/savings/${id}`, { method: 'DELETE' });
      router.refresh();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditData(undefined);
    router.refresh();
  };

  const handleBalanceSuccess = () => {
    setBalanceDialog(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-wrap items-center gap-4">
        {Array.from(totalByCurrency.entries()).map(([currency, total]) => (
          <Card key={currency} className="flex-1 min-w-[200px]">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-emerald-500/10">
                  <PiggyBank className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Savings</p>
                  <p className="text-2xl font-bold tracking-tight">{formatCurrency(total, currency)}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {accounts.filter(a => a.currency === currency).length} accounts
              </p>
            </CardContent>
          </Card>
        ))}
        {totalByCurrency.size === 0 && (
          <Card className="flex-1">
            <CardContent className="py-4 text-center text-muted-foreground">
              <PiggyBank className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No savings accounts yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={() => { setEditData(undefined); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Balance Chart */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Balance Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    {accounts.map((acc, i) => (
                      <linearGradient key={acc.id} id={`gradient-${acc.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                    tickFormatter={(val: string) => {
                      const d = new Date(val + 'T00:00:00');
                      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                    tickFormatter={(val: number) => `$${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--popover-foreground))',
                    }}
                    formatter={(value: unknown) => [`$${Number(value).toLocaleString()}`, undefined]}
                  />
                  {accounts.map((acc, i) => (
                    <Area
                      key={acc.id}
                      type="monotone"
                      dataKey={acc.name}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      fillOpacity={1}
                      fill={`url(#gradient-${acc.id})`}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Cards */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc, i) => (
            <Card key={acc.id} className="group relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
              />
              <CardContent className="p-4 pt-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{acc.name}</p>
                      {acc.institution && (
                        <p className="text-xs text-muted-foreground">{acc.institution}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {accountTypeLabels[acc.account_type]}
                  </Badge>
                </div>

                <div className="mt-4">
                  <p className="text-2xl font-bold tracking-tight">
                    {acc.currentBalance !== null
                      ? formatCurrency(acc.currentBalance, acc.currency)
                      : '—'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {acc.balances.length} balance {acc.balances.length === 1 ? 'entry' : 'entries'}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setBalanceDialog({ accountId: acc.id, accountName: acc.name })}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Log Balance
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => { setEditData(acc); setShowForm(true); }}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(acc.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <SavingsFormDialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditData(undefined);
        }}
        onSuccess={handleSuccess}
        editData={editData}
      />

      {balanceDialog && (
        <SavingsBalanceDialog
          open={true}
          onOpenChange={(open) => { if (!open) setBalanceDialog(null); }}
          onSuccess={handleBalanceSuccess}
          accountId={balanceDialog.accountId}
          accountName={balanceDialog.accountName}
        />
      )}
    </div>
  );
}
