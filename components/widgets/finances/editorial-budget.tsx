'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  ShoppingCart,
  Car,
  Home,
  Wifi,
  MoreHorizontal,
  ChevronRight,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import type { BudgetIncome, BudgetFixedCost } from '@/lib/db/budget';
import type { Subscription } from '@/lib/db/subscriptions';
import type { DebtWithPayments } from '@/lib/db/debts';
import { toMonthly } from '@/lib/utils/finances';
import type { SubscriptionCycle } from '@/lib/utils/finances';
import {
  calculateBudgetBreakdown,
  calculate503020,
} from '@/lib/utils/budget';
import { IncomeFormDialog } from './income-form-dialog';
import { FixedCostFormDialog } from './fixed-cost-form-dialog';
import { cn } from '@/lib/utils';

interface EditorialBudgetProps {
  income: BudgetIncome[];
  fixedCosts: BudgetFixedCost[];
  subscriptions: Subscription[];
  debts: DebtWithPayments[];
}

const CATEGORY_ICONS: Record<string, string> = {
  housing: 'home',
  utilities: 'electric_bolt',
  groceries: 'shopping_cart',
  transportation: 'directions_car',
  insurance: 'shield',
  healthcare: 'medical_services',
  childcare: 'child_care',
  phone: 'smartphone',
  internet: 'wifi',
  other: 'category',
};

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function EditorialBudget({
  income: initialIncome,
  fixedCosts: initialFixedCosts,
  subscriptions,
  debts,
}: EditorialBudgetProps) {
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

  const breakdown = useMemo(
    () => calculateBudgetBreakdown(totalIncome, subscriptionMonthly, debtMonthlyPayments, fixedCostTotal),
    [totalIncome, subscriptionMonthly, debtMonthlyPayments, fixedCostTotal]
  );

  const rule = useMemo(
    () => calculate503020(totalIncome, fixedCostTotal, subscriptionMonthly, debtMonthlyPayments),
    [totalIncome, fixedCostTotal, subscriptionMonthly, debtMonthlyPayments]
  );

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

  const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-media-primary mb-2 font-lexend">
            Monthly Overview
          </h1>
          <p className="text-media-on-surface-variant font-medium tracking-wide uppercase text-[10px]">
            Reporting Period: {currentMonth}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-6 text-media-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Alerts (0)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-media-secondary font-variation-settings-fill-1">verified_user</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Synced</span>
          </div>
        </div>
      </header>

      {/* Top Cards Section */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Monthly Income */}
        <div className="bg-media-primary p-8 rounded-2xl text-media-on-primary flex justify-between items-center transition-all hover:scale-[1.02] shadow-xl group cursor-default">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-70 block mb-2">Monthly Income</span>
            <h2 className="text-3xl font-bold tracking-tight font-lexend">
              {formatCurrency(totalIncome)}
            </h2>
          </div>
          <div className="bg-white/10 p-3 rounded-full group-hover:bg-white/20 transition-colors">
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-media-surface-container-low p-8 rounded-2xl flex justify-between items-center transition-all hover:scale-[1.02] shadow-sm group cursor-default">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-media-on-surface-variant block mb-2">Total Expenses</span>
            <h2 className="text-3xl font-bold tracking-tight text-media-primary font-lexend">
              {formatCurrency(breakdown.totalExpenses)}
            </h2>
          </div>
          <div className="bg-media-secondary/10 p-3 rounded-full group-hover:bg-media-secondary/20 transition-colors">
            <ArrowUpRight className="w-8 h-8 text-media-secondary/60" />
          </div>
        </div>

        {/* Savings Rate / Leftover */}
        <div className="bg-media-surface-container-high p-8 rounded-2xl flex justify-between items-center border border-media-secondary/10 transition-all hover:scale-[1.02] shadow-sm group cursor-default">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-media-on-surface-variant">Savings Rate</span>
              <span className="bg-media-secondary text-media-on-secondary text-[9px] px-2 py-0.5 rounded font-bold">
                {breakdown.savingsRate}%
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-media-primary font-lexend">
              {formatCurrency(breakdown.discretionary)}
            </h2>
          </div>
          <div className="bg-media-primary/5 p-3 rounded-full group-hover:bg-media-primary/10 transition-colors">
            <Shield className="w-8 h-8 text-media-primary/40" />
          </div>
        </div>
      </section>

      {/* Main Grid: Costs and Income streams */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* Fixed Costs */}
        <section className="bg-white dark:bg-media-primary/5 p-8 rounded-3xl border border-media-outline-variant/20 shadow-sm">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-2xl font-bold text-media-primary tracking-tight font-lexend">Fixed Costs</h3>
              <p className="text-xs text-media-on-surface-variant mt-1 font-medium">Non-negotiable monthly obligations.</p>
            </div>
            <button 
              onClick={() => { setEditCost(undefined); setShowCostForm(true); }}
              className="cursor-pointer text-media-secondary font-bold text-[10px] tracking-widest flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              ADD NEW <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-1">
            {fixedCosts.length === 0 ? (
              <div className="py-12 text-center text-media-on-surface-variant">
                <p className="text-sm">No fixed costs detected.</p>
              </div>
            ) : (
              fixedCosts.map((cost) => (
                <div 
                  key={cost.id}
                  className="flex justify-between items-center py-5 border-b border-media-surface-container last:border-0 group cursor-pointer hover:bg-media-surface-container-low px-3 -mx-3 rounded-xl transition-colors"
                  onClick={() => { setEditCost(cost); setShowCostForm(true); }}
                >
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-media-on-surface-variant/60 transition-colors group-hover:text-media-primary">
                      {CATEGORY_ICONS[cost.category] || 'category'}
                    </span>
                    <span className="text-sm font-semibold text-media-primary">{cost.name}</span>
                  </div>
                  <span className="text-sm font-bold text-media-primary">{formatCurrency(cost.amount, cost.currency)}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Income Streams */}
        <section className="bg-media-surface-container-low p-8 rounded-3xl border border-media-outline-variant/20">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-media-primary tracking-tight font-lexend">Income Streams</h3>
            <p className="text-xs text-media-on-surface-variant mt-1 font-medium">Verified sources of capital.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {income.map((inc) => (
              <div 
                key={inc.id}
                className="bg-media-surface-container-lowest dark:bg-white/5 p-6 rounded-2xl border border-media-outline-variant/20 flex justify-between items-center shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={() => { setEditIncome(inc); setShowIncomeForm(true); }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-media-primary-fixed flex items-center justify-center group-hover:bg-media-primary group-hover:text-media-on-primary transition-colors">
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      account_balance_wallet
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-media-primary">{inc.label}</h4>
                    <p className="text-[10px] text-media-on-surface-variant font-bold uppercase tracking-wider">Salary Source</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-media-primary">{formatCurrency(inc.amount, inc.currency)}</span>
              </div>
            ))}
            
            <button 
              onClick={() => { setEditIncome(undefined); setShowIncomeForm(true); }}
              className="cursor-pointer group p-6 border-2 border-dashed border-media-outline-variant/30 rounded-2xl flex justify-center items-center gap-3 text-media-on-surface-variant hover:bg-media-surface-container-high hover:border-media-secondary/40 transition-all"
            >
              <Plus className="w-5 h-5 group-hover:text-media-secondary transition-colors" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] group-hover:text-media-primary transition-colors">Connect New Source</span>
            </button>
          </div>
        </section>
      </div>

      {/* Allocation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <section className="lg:col-span-8 bg-media-surface-container-lowest dark:bg-white/5 p-10 rounded-3xl border border-media-outline-variant/10 shadow-sm">
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-media-primary mb-3 font-lexend">The 50/30/20 Allocation</h3>
            <p className="text-media-on-surface-variant text-sm max-w-xl font-medium leading-relaxed">
              The editorial framework for balanced wealth management. We track your actual spending against the golden ratio.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Needs */}
            <div className="space-y-5">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-media-secondary block mb-2">Needs</span>
                  <span className="text-2xl font-bold text-media-primary font-lexend">{formatCurrency(rule.needs.actual)}</span>
                </div>
              </div>
              <div className="h-3 w-full bg-media-surface-container-low rounded-full overflow-hidden">
                <div 
                  className="h-full bg-media-primary rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${Math.min(100, rule.needs.percent * 2)}%` }} 
                />
              </div>
              <p className={cn(
                "text-[10px] font-bold italic transition-colors",
                rule.needs.percent > 50 ? "text-red-500" : "text-media-on-surface-variant"
              )}>
                Target: 50% ({formatCurrency(totalIncome * 0.5)})
              </p>
            </div>

            {/* Wants */}
            <div className="space-y-5">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-media-secondary block mb-2">Wants</span>
                  <span className="text-2xl font-bold text-media-primary font-lexend">{formatCurrency(rule.wants.actual)}</span>
                </div>
              </div>
              <div className="h-3 w-full bg-media-surface-container-low rounded-full overflow-hidden">
                <div 
                  className="h-full bg-media-primary rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${Math.min(100, (rule.wants.percent / 30) * 100)}%` }} 
                />
              </div>
              <p className={cn(
                "text-[10px] font-bold italic transition-colors",
                rule.wants.percent > 30 ? "text-red-500" : "text-media-on-surface-variant"
              )}>
                Target: 30% ({formatCurrency(totalIncome * 0.3)})
              </p>
            </div>

            {/* Savings */}
            <div className="space-y-5">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-media-secondary block mb-2">Savings</span>
                  <span className="text-2xl font-bold text-media-primary font-lexend">{formatCurrency(rule.savings.actual)}</span>
                </div>
              </div>
              <div className="h-3 w-full bg-media-surface-container-low rounded-full overflow-hidden">
                <div 
                  className="h-full bg-media-secondary rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${Math.min(100, (rule.savings.percent / 20) * 100)}%` }} 
                />
              </div>
              <p className={cn(
                "text-[10px] font-bold italic transition-colors",
                rule.savings.percent < 20 ? "text-media-on-surface-variant" : "text-media-secondary"
              )}>
                Target: 20% ({formatCurrency(totalIncome * 0.2)})
              </p>
            </div>
          </div>
        </section>

        {/* Insight Box */}
        <section className="lg:col-span-4 h-full">
          <div className="bg-media-primary text-media-on-primary p-10 rounded-3xl h-full flex flex-col justify-between relative overflow-hidden group shadow-2xl">
            <div className="z-10 relative">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-4 h-4 text-media-secondary font-variation-settings-fill-1" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-media-secondary">Financial Insight</h3>
              </div>
              <h2 className="text-3xl font-bold leading-tight font-lexend mb-6">
                {breakdown.savingsRate >= 20 
                  ? "Your savings rate is exceptional." 
                  : "Opportunities for optimization exist."}
              </h2>
              <p className="text-sm opacity-70 leading-relaxed font-medium">
                {breakdown.savingsRate >= 20 
                  ? "Exceeding targets allows for accelerated vault expansion and early freedom goals."
                  : "Reviewing fixed costs could unlock more capital for your savings goals."}
              </p>
            </div>
            
            <div className="mt-12 z-10 relative">
              <button className="cursor-pointer bg-media-secondary text-media-on-secondary w-full py-4 rounded-xl text-[10px] font-bold tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg">
                OPTIMIZATIONS <span className="material-symbols-outlined text-lg">insights</span>
              </button>
            </div>
            
            {/* Aesthetic circle decoration */}
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-media-secondary/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl" />
          </div>
        </section>
      </div>

      {/* Spotlight Footer */}
      <section className="mt-16 bg-media-surface-container p-12 rounded-[32px] flex flex-col md:flex-row gap-12 items-center overflow-hidden border border-media-outline-variant/10 shadow-inner">
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-media-secondary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-media-secondary">Editorial Focus</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight text-media-primary font-lexend max-w-2xl">
            Strategic growth begins with transparency of fixed obligations.
          </h2>
          <button className="cursor-pointer group flex items-center gap-2 text-media-primary font-bold text-sm border-b-2 border-media-primary/20 pb-1 hover:border-media-secondary transition-all">
            READ FULL ANALYSIS 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="w-full md:w-80 h-56 rounded-2xl overflow-hidden shadow-2xl rotate-2 relative group">
          <img 
            alt="Financial growth" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
            src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=800&auto=format&fit=crop"
          />
          <div className="absolute inset-0 bg-media-primary/10 group-hover:bg-transparent transition-colors" />
        </div>
      </section>

      {/* Dialogs */}
      <IncomeFormDialog
        key={editIncome?.id || 'new-income'}
        open={showIncomeForm}
        onOpenChange={(open) => {
          setShowIncomeForm(open);
          if (!open) setEditIncome(undefined);
        }}
        onSuccess={handleIncomeSuccess}
        editData={editIncome}
      />

      <FixedCostFormDialog
        key={editCost?.id || 'new-cost'}
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
