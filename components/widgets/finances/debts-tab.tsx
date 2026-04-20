'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  Trash2,
  Pencil,
  CreditCard,
  Calendar,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Home,
  Car,
  GraduationCap,
  Stethoscope,
  User,
  BadgeCent,
  ArrowRight,
  Sparkles,
  Snowflake,
  Waves,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import type { DebtWithPayments } from '@/lib/db/debts';
import { generatePayoffProjection } from '@/lib/utils/finances';
import { DebtFormDialog } from './debt-form-dialog';
import { DebtPaymentDialog } from './debt-payment-dialog';
import { cn } from '@/lib/utils';

interface DebtsTabProps {
  debts: DebtWithPayments[];
}

const categoryIcons: Record<string, any> = {
  mortgage: Home,
  car: Car,
  student_loan: GraduationCap,
  credit_card: CreditCard,
  personal: User,
  medical: Stethoscope,
  other: BadgeCent,
};

const categoryLabels: Record<string, string> = {
  mortgage: 'Primary Mortgage',
  car: 'Auto Loan',
  student_loan: 'Student debt',
  credit_card: 'Credit Line',
  personal: 'Personal Loan',
  medical: 'Medical Bill',
  other: 'Other Instrument',
};

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(0)}`;
  }
}

function formatPayoffDate(months: number | null): string {
  if (months === null) return 'Infinite Horizon';
  if (months === 0) return 'Paid off!';
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function DebtsTab({ debts: initialDebts }: DebtsTabProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<DebtWithPayments | undefined>();
  const [paymentDialog, setPaymentDialog] = useState<{
    debtId: number;
    debtName: string;
  } | null>(null);
  const [expandedDebt, setExpandedDebt] = useState<number | null>(null);

  const debts = initialDebts;

  // Aggregate stats
  const totalDebt = debts.reduce((sum, d) => sum + d.current_balance, 0);
  const totalMonthlyPayment = debts.reduce(
    (sum, d) => sum + d.monthly_payment + d.extra_payment,
    0
  );
  
  // Calculate aggregate payoff momentum
  const totalOriginal = debts.reduce((sum, d) => sum + d.original_amount, 0);
  const percentPaidTotal = totalOriginal > 0 
    ? Math.round(((totalOriginal - totalDebt) / totalOriginal) * 100) 
    : 0;

  // Generate aggregate projection data for the "Freedom Horizon" chart
  const projectionData = useMemo(() => {
    if (debts.length === 0) return [];

    const maxMonths = Math.max(
      ...debts.map((d) => d.projectedPayoffMonths || 60),
      12
    );

    const projections = debts.map((d) =>
      generatePayoffProjection(
        d.current_balance,
        d.monthly_payment,
        d.extra_payment,
        d.interest_rate,
        Math.min(maxMonths, 360)
      )
    );

    const points: any[] = [];
    const step = Math.max(1, Math.floor(maxMonths / 12)); // Target ~12-15 bars

    for (let i = 0; i <= maxMonths; i += step) {
      let aggregateBalance = 0;
      projections.forEach((proj) => {
        // Find balance at month i, or 0 if already paid off
        const point = proj.find((p) => p.month === i);
        if (point) {
          aggregateBalance += point.balance;
        } else if (proj.length > 0 && i > proj[proj.length - 1].month) {
          aggregateBalance += 0;
        } else {
          // Fallback if not found (shouldn't happen with step logic but for safety)
          aggregateBalance += 0;
        }
      });

      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      points.push({
        month: i,
        balance: aggregateBalance,
        year: date.getFullYear(),
        isCurrent: i === 0,
      });
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

  const targetDate = useMemo(() => {
    if (debts.length === 0) return null;
    const maxMonths = Math.max(...debts.map(d => d.projectedPayoffMonths || 0));
    const date = new Date();
    date.setMonth(date.getMonth() + maxMonths);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
  }, [debts]);

  return (
    <div className="narrative-container min-h-screen pb-24">
      {/* Editorial Header */}
      <header className="mb-12 text-center pt-8">
        <span className="text-[#9f402d] font-bold uppercase tracking-widest text-sm mb-4 block">Current Liabilities</span>
        <h1 className="text-5xl md:text-7xl font-bold text-[#061b0e] tracking-tighter leading-tight mb-8">
          The Architecture <br /> of Freedom.
        </h1>
        <p className="text-[#434843] text-xl leading-relaxed mx-auto max-w-2xl">
          Your strategic path is holding steady. You have reduced your total principal by <span className="text-[#061b0e] font-bold">{percentPaidTotal}%</span> since inception, maintaining consistent momentum toward zero-balance.
        </p>
      </header>

      {/* Summary Stats Box */}
      <div className="mb-16 grid grid-cols-1 md:grid-cols-2 bg-[#061b0e] text-white rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-10 text-center border-b md:border-b-0 md:border-r border-white/10">
          <p className="text-emerald-100/60 text-sm font-medium uppercase tracking-widest mb-2">Total Debt</p>
          <h2 className="text-4xl md:text-5xl font-bold">{formatCurrency(totalDebt, 'USD')}</h2>
        </div>
        <div className="p-10 text-center">
          <p className="text-emerald-100/60 text-sm font-medium uppercase tracking-widest mb-2">Monthly Debt Service</p>
          <h2 className="text-4xl md:text-5xl font-bold">{formatCurrency(totalMonthlyPayment, 'USD')}</h2>
        </div>
      </div>

      {/* Freedom Horizon Chart */}
      <section className="mb-24">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-[#061b0e]">Freedom Horizon</h3>
            <p className="text-[#434843]">Projected zero-balance timeline based on current velocity.</p>
          </div>
          {targetDate && (
            <div className="bg-[#e9e8e5] px-4 py-2 rounded-lg text-xs font-bold text-[#061b0e] tracking-widest">
              TARGET: {targetDate}
            </div>
          )}
        </div>
        
        <div className="bg-[#f4f3f1] rounded-2xl p-8 md:p-12 relative overflow-hidden">
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectionData} barGap={4}>
                <XAxis 
                  dataKey="year" 
                  hide={false} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#434843', fontWeight: 'bold' }}
                  interval="preserveStartEnd"
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(6, 27, 14, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-xl border border-[#e9e8e5]">
                          <p className="text-[10px] font-bold text-[#434843] uppercase tracking-widest mb-1">
                            {payload[0].payload.month === 0 ? 'Current Balance' : `Month ${payload[0].payload.month}`}
                          </p>
                          <p className="text-lg font-bold text-[#061b0e]">
                            {formatCurrency(payload[0].value as number, 'USD')}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="balance" radius={[2, 2, 0, 0]}>
                  {projectionData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.month === 0 ? '#9f402d' : `rgba(6, 27, 14, ${0.1 + (index / projectionData.length) * 0.7})`}
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-6 text-[10px] text-[#434843] font-bold uppercase tracking-widest px-2">
             <span>{new Date().getFullYear()}</span>
             <span>STRATEGIC REDUCTION PHASE</span>
             <span>{targetDate?.split(' ')[1]}</span>
          </div>
        </div>
      </section>

      {/* Active Portfolio */}
      <section className="mb-24 space-y-12">
        <div className="flex justify-between items-center border-b border-[#061b0e]/10 pb-6">
          <h3 className="text-3xl font-bold text-[#061b0e] tracking-tight">Active Portfolio</h3>
          <button 
            onClick={() => { setEditData(undefined); setShowForm(true); }}
            className="text-[#9f402d] font-bold flex items-center gap-2 hover:opacity-80 transition-opacity text-sm group"
          >
            Add Instrument <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {debts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-[#e9e8e5]">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-[#e9e8e5]" />
            <p className="text-[#434843] font-bold uppercase tracking-widest text-sm">No Active Instruments</p>
          </div>
        ) : (
          <div className="space-y-16">
            {debts.map((debt) => {
              const Icon = categoryIcons[debt.category] || categoryIcons.other;
              const isExpanded = expandedDebt === debt.id;
              
              return (
                <div 
                  key={debt.id} 
                  className="bg-white rounded-3xl p-10 md:p-14 border border-[#e9e8e5] shadow-sm hover:shadow-md transition-shadow relative group"
                >
                  <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:bg-[#f4f3f1]"
                      onClick={() => { setEditData(debt); setShowForm(true); }}
                    >
                      <Pencil className="w-4 h-4 text-[#434843]" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:bg-red-50"
                      onClick={() => handleDelete(debt.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between mb-12 gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-6 h-6 text-[#9f402d]" />
                        <h4 className="text-2xl font-bold text-[#061b0e]">{debt.name}</h4>
                      </div>
                      <p className="text-sm text-[#434843] uppercase tracking-widest font-medium">
                        {categoryLabels[debt.category]} · {debt.interest_rate}% APR
                      </p>
                    </div>
                    <div className="bg-[#f4f3f1] px-6 py-4 rounded-xl text-center md:text-right">
                      <p className="text-xs font-bold text-[#434843] uppercase tracking-widest mb-1">Current Balance</p>
                      <p className="text-2xl font-bold text-[#9f402d]">{formatCurrency(debt.current_balance, debt.currency)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                    <div>
                      <p className="text-xs font-bold text-[#434843] uppercase tracking-widest mb-2">Principal Momentum</p>
                      <p className="text-5xl font-bold text-[#061b0e] tracking-tighter">
                        {debt.percentPaid}% <span className="text-lg text-[#434843] font-medium tracking-normal ml-2">Retired</span>
                      </p>
                    </div>
                    <div className="flex flex-col justify-end">
                      <div className="flex justify-between text-xs font-bold text-[#434843] uppercase tracking-widest mb-3">
                        <span>Progress</span>
                        <span>{formatCurrency(debt.original_amount - debt.current_balance, debt.currency)} Paid</span>
                      </div>
                      <div className="w-full bg-[#f4f3f1] h-3 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#061b0e] h-full transition-all duration-1000" 
                          style={{ width: `${debt.percentPaid}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] mt-2 font-bold text-[#434843]">
                        <span>START: {formatCurrency(debt.original_amount, debt.currency)}</span>
                        <span>EST. END: {formatPayoffDate(debt.projectedPayoffMonths).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-6 pt-8 border-t border-[#e9e8e5]">
                    <button 
                      onClick={() => setPaymentDialog({ debtId: debt.id, debtName: debt.name })}
                      className="w-full md:w-auto px-10 bg-[#061b0e] text-white py-4 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg"
                    >
                      Log Payment
                    </button>
                    <button 
                      onClick={() => setExpandedDebt(isExpanded ? null : debt.id)}
                      className="w-full md:w-auto px-10 bg-[#f4f3f1] text-[#061b0e] py-4 rounded-xl font-bold text-sm hover:bg-[#e9e8e5] transition-colors"
                    >
                      {isExpanded ? 'Hide History' : `View History (${debt.payments.length})`}
                    </button>
                    <p className="md:ml-auto text-[11px] text-[#434843] font-bold uppercase tracking-widest">
                      Next Due: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </p>
                  </div>

                  {/* Payment History Expansion */}
                  {isExpanded && (
                    <div className="mt-8 pt-8 border-t border-dashed border-[#e9e8e5] animate-in fade-in slide-in-from-top-4 duration-300">
                      <h5 className="text-xs font-bold text-[#434843] uppercase tracking-[0.2em] mb-6">Historical Ledger</h5>
                      <div className="space-y-4">
                        {debt.payments.length === 0 ? (
                          <p className="text-sm text-[#434843] italic">No transactions recorded for this instrument.</p>
                        ) : (
                          debt.payments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between py-3 border-b border-[#f4f3f1] last:border-0 hover:bg-[#f4f3f1]/50 px-4 rounded-lg transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                                  <ArrowRight className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-[#061b0e]">
                                    {new Date(payment.date + 'T00:00:00').toLocaleDateString('en-US', {
                                      month: 'long',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </p>
                                  {payment.notes && <p className="text-xs text-[#434843]">{payment.notes}</p>}
                                </div>
                              </div>
                              <p className="font-bold text-emerald-600">-{formatCurrency(payment.amount, debt.currency)}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Editorial Spotlight */}
      <section className="relative bg-[#061b0e] text-white rounded-3xl p-10 md:p-20 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <Sparkles className="w-full h-full object-cover text-white" />
        </div>
        <div className="relative z-10">
          <span className="text-emerald-100/60 font-bold uppercase tracking-[0.3em] text-xs mb-8 block">The Path to Freedom</span>
          <h3 className="text-4xl md:text-6xl font-bold mb-12 tracking-tight leading-none text-white">
            Editorial Spotlight: <br />Debt Optimization
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            <div className="space-y-4 p-8 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="text-white font-bold text-xl flex items-center gap-3">
                <Snowflake className="w-6 h-6 text-[#9f402d]" />
                The Snowball Method
              </h4>
              <p className="text-emerald-100/70 leading-relaxed">
                Psychological momentum is a powerful asset. By targeting your smallest balances first, you create a &quot;win&quot; early in the journey, fueling the discipline needed for the larger mortgage mountain ahead.
              </p>
            </div>
            <div className="space-y-4 p-8 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="text-white font-bold text-xl flex items-center gap-3">
                <Waves className="w-6 h-6 text-emerald-400" />
                The Avalanche Approach
              </h4>
              <p className="text-emerald-100/70 leading-relaxed">
                Mathematically superior, the Avalanche focuses on the highest interest rates. Currently, prioritizing extra principal on high-rate debt saves you the most in lifetime interest.
              </p>
            </div>
          </div>
          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-md">
              <p className="text-2xl italic font-light text-emerald-100/80 leading-relaxed">&quot;The best method is the one you can sustain.&quot;</p>
              <p className="text-xs uppercase tracking-[0.2em] mt-4 font-bold opacity-40">— Kinetic Editorial Council</p>
            </div>
            <Button 
              className="w-full md:w-auto bg-[#9f402d] text-white px-12 py-8 rounded-full font-bold text-lg hover:bg-[#833525] transition-all shadow-2xl active:scale-95 whitespace-nowrap"
            >
              Analyze Strategy
            </Button>
          </div>
        </div>
      </section>

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
          onOpenChange={(open) => {
            if (!open) setPaymentDialog(null);
          }}
          onSuccess={handlePaymentSuccess}
          debtId={paymentDialog.debtId}
          debtName={paymentDialog.debtName}
        />
      )}
    </div>
  );
}
