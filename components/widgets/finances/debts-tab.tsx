'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  Trash2,
  Pencil,
  TrendingDown,
  CreditCard,
  Calendar,
  ChevronDown,
  ChevronUp,
  DollarSign,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { DebtWithPayments } from '@/lib/db/debts';
import { generatePayoffProjection } from '@/lib/utils/finances';
import { DebtFormDialog } from './debt-form-dialog';
import { DebtPaymentDialog } from './debt-payment-dialog';

interface DebtsTabProps {
  debts: DebtWithPayments[];
}

const categoryLabels: Record<string, string> = {
  mortgage: 'Mortgage',
  car: 'Car Loan',
  student_loan: 'Student Loan',
  credit_card: 'Credit Card',
  personal: 'Personal Loan',
  medical: 'Medical',
  other: 'Other',
};

const categoryColors: Record<string, string> = {
  mortgage: 'hsl(217, 91%, 60%)',
  car: 'hsl(142, 71%, 45%)',
  student_loan: 'hsl(280, 68%, 60%)',
  credit_card: 'hsl(340, 82%, 52%)',
  personal: 'hsl(25, 95%, 53%)',
  medical: 'hsl(174, 72%, 40%)',
  other: 'hsl(210, 40%, 50%)',
};

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function formatPayoffDate(months: number | null): string {
  if (months === null) return 'Never (payment < interest)';
  if (months === 0) return 'Paid off!';
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function DebtsTab({ debts: initialDebts }: DebtsTabProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<DebtWithPayments | undefined>();
  const [paymentDialog, setPaymentDialog] = useState<{ debtId: number; debtName: string } | null>(null);
  const [expandedDebt, setExpandedDebt] = useState<number | null>(null);

  const debts = initialDebts;

  // Totals by currency
  const totalByCurrency = new Map<string, { owed: number; monthlyPayments: number }>();
  for (const debt of debts) {
    const curr = debt.currency;
    const existing = totalByCurrency.get(curr) || { owed: 0, monthlyPayments: 0 };
    existing.owed += debt.current_balance;
    existing.monthlyPayments += debt.monthly_payment + debt.extra_payment;
    totalByCurrency.set(curr, existing);
  }

  // Generate projection data for the overview chart
  const projectionData = useMemo(() => {
    if (debts.length === 0) return [];

    // Find the longest projection
    const maxMonths = Math.max(
      ...debts.map(d => d.projectedPayoffMonths || 60),
      12
    );

    const points: Record<string, number | string>[] = [];
    const projections = debts.map(d =>
      generatePayoffProjection(d.current_balance, d.monthly_payment, d.extra_payment, d.interest_rate, Math.min(maxMonths, 360))
    );

    const maxLen = Math.max(...projections.map(p => p.length));
    for (let i = 0; i < maxLen; i++) {
      const point: Record<string, number | string> = {
        month: i,
        label: `Month ${i}`,
      };
      debts.forEach((debt, di) => {
        const proj = projections[di];
        point[debt.name] = proj[i]?.balance ?? 0;
      });
      points.push(point);
    }

    return points;
  }, [debts]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this debt and all payment history?')) return;
    try {
      await fetch(`/api/finances/debts/${id}`, { method: 'DELETE' });
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

  const handlePaymentSuccess = () => {
    setPaymentDialog(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="flex flex-wrap items-center gap-4">
        {Array.from(totalByCurrency.entries()).map(([currency, data]) => (
          <Card key={currency} className="flex-1 min-w-[200px]">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Debt</p>
                  <p className="text-2xl font-bold tracking-tight text-destructive">
                    {formatCurrency(data.owed, currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Monthly Payments</p>
                  <p className="text-lg font-semibold text-muted-foreground">
                    {formatCurrency(data.monthlyPayments, currency)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {debts.filter(d => d.currency === currency).length} debts
              </p>
            </CardContent>
          </Card>
        ))}
        {totalByCurrency.size === 0 && (
          <Card className="flex-1">
            <CardContent className="py-4 text-center text-muted-foreground">
              <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No debts tracked — that&apos;s great!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={() => { setEditData(undefined); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Debt
        </Button>
      </div>

      {/* Payoff Projection Chart */}
      {projectionData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Payoff Projection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                    tickFormatter={(val: number) => {
                      if (val === 0) return 'Now';
                      if (val % 12 === 0) return `${val / 12}yr`;
                      return `${val}mo`;
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
                    labelFormatter={(label: unknown) => `Month ${label}`}
                  />
                  {debts.map((debt) => (
                    <Line
                      key={debt.id}
                      type="monotone"
                      dataKey={debt.name}
                      stroke={categoryColors[debt.category] || categoryColors.other}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debt Cards */}
      {debts.length > 0 && (
        <div className="space-y-4">
          {debts.map((debt) => {
            const isExpanded = expandedDebt === debt.id;
            const color = categoryColors[debt.category] || categoryColors.other;

            return (
              <Card key={debt.id} className="group relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 bottom-0 w-1"
                  style={{ backgroundColor: color }}
                />
                <CardContent className="p-4 pl-5">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{debt.name}</h3>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {categoryLabels[debt.category]}
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {formatCurrency(debt.original_amount - debt.current_balance, debt.currency)} paid
                          </span>
                          <span className="font-medium">
                            {formatCurrency(debt.current_balance, debt.currency)} remaining
                          </span>
                        </div>
                        <Progress value={debt.percentPaid} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{debt.percentPaid}% paid off</span>
                          <span>of {formatCurrency(debt.original_amount, debt.currency)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Monthly Payment</p>
                      <p className="font-medium">{formatCurrency(debt.monthly_payment, debt.currency)}</p>
                    </div>
                    {debt.extra_payment > 0 && (
                      <div>
                        <p className="text-muted-foreground text-xs">Extra Payment</p>
                        <p className="font-medium text-emerald-500">
                          +{formatCurrency(debt.extra_payment, debt.currency)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground text-xs">Interest Rate</p>
                      <p className="font-medium">{debt.interest_rate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Est. Payoff
                      </p>
                      <p className="font-medium">
                        {formatPayoffDate(debt.projectedPayoffMonths)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => setPaymentDialog({ debtId: debt.id, debtName: debt.name })}
                    >
                      <DollarSign className="w-3 h-3 mr-1" />
                      Log Payment
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedDebt(isExpanded ? null : debt.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3 mr-1" />
                      ) : (
                        <ChevronDown className="w-3 h-3 mr-1" />
                      )}
                      Payments ({debt.payments.length})
                    </Button>
                    <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => { setEditData(debt); setShowForm(true); }}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(debt.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Payment History */}
                  {isExpanded && debt.payments.length > 0 && (
                    <div className="mt-4 border-t pt-4 space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Payment History</h4>
                      <div className="space-y-1 max-h-[200px] overflow-y-auto">
                        {debt.payments.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between text-sm py-1.5 px-2 rounded hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-xs">
                                {new Date(payment.date + 'T00:00:00').toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                              {payment.notes && (
                                <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                  — {payment.notes}
                                </span>
                              )}
                            </div>
                            <span className="font-medium text-emerald-500">
                              -{formatCurrency(payment.amount, debt.currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isExpanded && debt.payments.length === 0 && (
                    <div className="mt-4 border-t pt-4 text-center text-sm text-muted-foreground">
                      No payments logged yet
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <DebtFormDialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditData(undefined);
        }}
        onSuccess={handleSuccess}
        editData={editData}
      />

      {paymentDialog && (
        <DebtPaymentDialog
          open={true}
          onOpenChange={(open) => { if (!open) setPaymentDialog(null); }}
          onSuccess={handlePaymentSuccess}
          debtId={paymentDialog.debtId}
          debtName={paymentDialog.debtName}
        />
      )}
    </div>
  );
}
