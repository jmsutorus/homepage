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
  Wallet,
  Receipt,
  TrendingUp,
  ArrowDown,
  Banknote,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import type { BudgetIncome, BudgetFixedCost } from '@/lib/db/budget';
import type { Subscription } from '@/lib/db/subscriptions';
import type { DebtWithPayments } from '@/lib/db/debts';
import { toMonthly } from '@/lib/utils/finances';
import type { SubscriptionCycle } from '@/lib/utils/finances';
import {
  calculateBudgetBreakdown,
  calculate503020,
  getSavingsRateColor,
  getSavingsRateLabel,
} from '@/lib/utils/budget';
import { IncomeFormDialog } from './income-form-dialog';
import { FixedCostFormDialog } from './fixed-cost-form-dialog';

interface BudgetTabProps {
  income: BudgetIncome[];
  fixedCosts: BudgetFixedCost[];
  subscriptions: Subscription[];
  debts: DebtWithPayments[];
}

const DONUT_COLORS = [
  'hsl(217, 91%, 60%)',   // subscriptions - blue
  'hsl(340, 82%, 52%)',   // debts - pink
  'hsl(25, 95%, 53%)',    // fixed costs - orange
  'hsl(142, 71%, 45%)',   // discretionary - green
];

const categoryLabels: Record<string, string> = {
  housing: 'Housing',
  utilities: 'Utilities',
  groceries: 'Groceries',
  transportation: 'Transportation',
  insurance: 'Insurance',
  healthcare: 'Healthcare',
  childcare: 'Childcare',
  phone: 'Phone',
  internet: 'Internet',
  other: 'Other',
};

const categoryIcons: Record<string, string> = {
  housing: '🏠',
  utilities: '⚡',
  groceries: '🛒',
  transportation: '🚗',
  insurance: '🛡️',
  healthcare: '🏥',
  childcare: '👶',
  phone: '📱',
  internet: '🌐',
  other: '📦',
};

function formatCurrency(amount: number, currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function BudgetTab({
  income: initialIncome,
  fixedCosts: initialFixedCosts,
  subscriptions,
  debts,
}: BudgetTabProps) {
  const router = useRouter();
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showCostForm, setShowCostForm] = useState(false);
  const [editIncome, setEditIncome] = useState<BudgetIncome | undefined>();
  const [editCost, setEditCost] = useState<BudgetFixedCost | undefined>();

  const income = initialIncome;
  const fixedCosts = initialFixedCosts;

  // Calculate totals
  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);

  const subscriptionMonthly = subscriptions
    .filter(s => s.active)
    .reduce((sum, s) => sum + toMonthly(s.price, s.cycle as SubscriptionCycle), 0);

  const debtMonthlyPayments = debts.reduce(
    (sum, d) => sum + d.monthly_payment + d.extra_payment, 0
  );

  const fixedCostTotal = fixedCosts.reduce((sum, c) => sum + c.amount, 0);

  // Budget breakdown
  const breakdown = useMemo(
    () => calculateBudgetBreakdown(totalIncome, subscriptionMonthly, debtMonthlyPayments, fixedCostTotal),
    [totalIncome, subscriptionMonthly, debtMonthlyPayments, fixedCostTotal]
  );

  // 50/30/20 rule
  const rule = useMemo(
    () => calculate503020(totalIncome, fixedCostTotal, subscriptionMonthly, debtMonthlyPayments),
    [totalIncome, fixedCostTotal, subscriptionMonthly, debtMonthlyPayments]
  );

  // Donut data
  const donutData = useMemo(() => {
    if (totalIncome === 0) return [];
    return [
      { name: 'Subscriptions', value: Math.round(subscriptionMonthly * 100) / 100 },
      { name: 'Debt Payments', value: Math.round(debtMonthlyPayments * 100) / 100 },
      { name: 'Fixed Costs', value: Math.round(fixedCostTotal * 100) / 100 },
      { name: 'Discretionary', value: Math.max(0, Math.round(breakdown.discretionary * 100) / 100) },
    ].filter(d => d.value > 0);
  }, [totalIncome, subscriptionMonthly, debtMonthlyPayments, fixedCostTotal, breakdown.discretionary]);

  const handleDeleteIncome = async (id: number) => {
    if (!confirm('Remove this income source?')) return;
    try {
      await fetch(`/api/finances/budget/income/${id}`, { method: 'DELETE' });
      router.refresh();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleDeleteCost = async (id: number) => {
    if (!confirm('Remove this fixed cost?')) return;
    try {
      await fetch(`/api/finances/budget/fixed-costs/${id}`, { method: 'DELETE' });
      router.refresh();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleIncomeSuccess = () => {
    setShowIncomeForm(false);
    setEditIncome(undefined);
    router.refresh();
  };

  const handleCostSuccess = () => {
    setShowCostForm(false);
    setEditCost(undefined);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Row: Income + Discretionary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Income */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Banknote className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Income</p>
                <p className="text-2xl font-bold tracking-tight">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {income.length} income {income.length === 1 ? 'source' : 'sources'}
            </p>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-500/10">
                <ArrowDown className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold tracking-tight">
                  {formatCurrency(breakdown.totalExpenses)}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {breakdown.percentages.subscriptions + breakdown.percentages.debts + breakdown.percentages.fixedCosts}% of income
            </p>
          </CardContent>
        </Card>

        {/* Discretionary */}
        <Card className={breakdown.discretionary < 0 ? 'border-destructive/50' : 'border-emerald-500/30'}>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${breakdown.discretionary < 0 ? 'bg-destructive/10' : 'bg-emerald-500/10'}`}>
                <Wallet className={`w-6 h-6 ${breakdown.discretionary < 0 ? 'text-destructive' : 'text-emerald-500'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Discretionary</p>
                <p className={`text-2xl font-bold tracking-tight ${breakdown.discretionary < 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                  {formatCurrency(breakdown.discretionary)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className={`text-xs ${getSavingsRateColor(breakdown.savingsRate)}`}
              >
                {breakdown.savingsRate}% savings rate
              </Badge>
              <span className={`text-xs ${getSavingsRateColor(breakdown.savingsRate)}`}>
                {getSavingsRateLabel(breakdown.savingsRate)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donut Chart + Breakdown */}
      {totalIncome > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Spending Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {donutData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--popover-foreground))',
                      }}
                      formatter={(value: unknown) => [`$${Number(value).toLocaleString()}`, undefined]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Left Over</p>
                    <p className={`text-lg font-bold ${breakdown.discretionary < 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                      {formatCurrency(breakdown.discretionary)}
                    </p>
                  </div>
                </div>
              </div>
              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {[
                  { label: 'Subscriptions', value: subscriptionMonthly, color: DONUT_COLORS[0], pct: breakdown.percentages.subscriptions },
                  { label: 'Debt Payments', value: debtMonthlyPayments, color: DONUT_COLORS[1], pct: breakdown.percentages.debts },
                  { label: 'Fixed Costs', value: fixedCostTotal, color: DONUT_COLORS[2], pct: breakdown.percentages.fixedCosts },
                  { label: 'Discretionary', value: Math.max(0, breakdown.discretionary), color: DONUT_COLORS[3], pct: breakdown.percentages.discretionary },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground truncate">{item.label}</span>
                    <span className="font-medium ml-auto">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 50/30/20 Rule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                50/30/20 Rule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-xs text-muted-foreground">
                Compare your spending against the guideline: 50% needs, 30% wants, 20% savings &amp; debt
              </p>

              {/* Needs (50%) */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Needs</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(rule.needs.actual)} / {formatCurrency(rule.needs.recommended)}
                  </span>
                </div>
                <Progress
                  value={Math.min(100, (rule.needs.actual / Math.max(1, rule.needs.recommended)) * 100)}
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{rule.needs.percent}% of income</span>
                  <span className={rule.needs.percent <= 50 ? 'text-emerald-500' : 'text-yellow-500'}>
                    Target: 50%
                  </span>
                </div>
              </div>

              {/* Wants (30%) */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Wants</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(rule.wants.actual)} / {formatCurrency(rule.wants.recommended)}
                  </span>
                </div>
                <Progress
                  value={Math.min(100, (rule.wants.actual / Math.max(1, rule.wants.recommended)) * 100)}
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{rule.wants.percent}% of income</span>
                  <span className={rule.wants.percent <= 30 ? 'text-emerald-500' : 'text-yellow-500'}>
                    Target: 30%
                  </span>
                </div>
              </div>

              {/* Savings & Debt (20%) */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Savings &amp; Debt</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(rule.savings.actual)} / {formatCurrency(rule.savings.recommended)}
                  </span>
                </div>
                <Progress
                  value={Math.min(100, (rule.savings.actual / Math.max(1, rule.savings.recommended)) * 100)}
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{rule.savings.percent}% of income</span>
                  <span className={rule.savings.percent >= 20 ? 'text-emerald-500' : 'text-yellow-500'}>
                    Target: 20%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Income Sources */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Banknote className="w-4 h-4" />
            Income Sources
          </CardTitle>
          <Button
            size="sm"
            onClick={() => { setEditIncome(undefined); setShowIncomeForm(true); }}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Income
          </Button>
        </CardHeader>
        <CardContent>
          {income.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No income sources added yet. Add your monthly take-home pay to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {income.map((inc) => (
                <div
                  key={inc.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg">💰</span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{inc.label}</p>
                      <p className="text-xs text-muted-foreground">
                        Since {new Date(inc.effective_date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatCurrency(inc.amount, inc.currency)}</span>
                    <span className="text-xs text-muted-foreground">/mo</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => { setEditIncome(inc); setShowIncomeForm(true); }}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDeleteIncome(inc.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fixed Costs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Fixed Monthly Costs
          </CardTitle>
          <Button
            size="sm"
            onClick={() => { setEditCost(undefined); setShowCostForm(true); }}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Cost
          </Button>
        </CardHeader>
        <CardContent>
          {fixedCosts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No fixed costs added. Add recurring expenses like rent, utilities, and groceries.
            </p>
          ) : (
            <div className="space-y-2">
              {fixedCosts.map((cost) => (
                <div
                  key={cost.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg">{categoryIcons[cost.category] || '📦'}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{cost.name}</p>
                      <Badge variant="outline" className="text-[10px]">
                        {categoryLabels[cost.category]}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatCurrency(cost.amount, cost.currency)}</span>
                    <span className="text-xs text-muted-foreground">/mo</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => { setEditCost(cost); setShowCostForm(true); }}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDeleteCost(cost.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {/* Fixed costs total */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t text-sm">
                <span className="text-muted-foreground font-medium">Total Fixed Costs</span>
                <span className="font-bold">{formatCurrency(fixedCostTotal)}/mo</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Line Items Summary */}
      {totalIncome > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Budget Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm py-1">
                <span className="text-emerald-500 font-medium">+ Income</span>
                <span className="font-semibold text-emerald-500">{formatCurrency(totalIncome)}</span>
              </div>
              <div className="flex justify-between text-sm py-1 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: DONUT_COLORS[0] }} />
                  − Subscriptions
                </span>
                <span>{formatCurrency(subscriptionMonthly)}</span>
              </div>
              <div className="flex justify-between text-sm py-1 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: DONUT_COLORS[1] }} />
                  − Debt Payments
                </span>
                <span>{formatCurrency(debtMonthlyPayments)}</span>
              </div>
              <div className="flex justify-between text-sm py-1 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: DONUT_COLORS[2] }} />
                  − Fixed Costs
                </span>
                <span>{formatCurrency(fixedCostTotal)}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-t font-bold">
                <span className={breakdown.discretionary < 0 ? 'text-destructive' : 'text-emerald-500'}>
                  = Discretionary Income
                </span>
                <span className={breakdown.discretionary < 0 ? 'text-destructive' : 'text-emerald-500'}>
                  {formatCurrency(breakdown.discretionary)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <IncomeFormDialog
        open={showIncomeForm}
        onOpenChange={(open) => {
          setShowIncomeForm(open);
          if (!open) setEditIncome(undefined);
        }}
        onSuccess={handleIncomeSuccess}
        editData={editIncome}
      />

      <FixedCostFormDialog
        open={showCostForm}
        onOpenChange={(open) => {
          setShowCostForm(open);
          if (!open) setEditCost(undefined);
        }}
        onSuccess={handleCostSuccess}
        editData={editCost}
      />
    </div>
  );
}
