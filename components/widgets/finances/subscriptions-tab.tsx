'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Pencil, Wand2 } from 'lucide-react';
import type { Subscription } from '@/lib/db/subscriptions';
import { toMonthly, toYearly } from '@/lib/utils/finances';
import { SubscriptionFormDialog } from './subscription-form-dialog';
import { SubscriptionEditorialCard } from './subscription-editorial-card';
import { cn } from '@/lib/utils';

interface SubscriptionsTabProps {
  subscriptions: Subscription[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function SubscriptionsTab({ subscriptions: subs }: SubscriptionsTabProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<Subscription | undefined>();

  const activeSubs = subs.filter(s => s.active);
  const inactiveSubs = subs.filter(s => !s.active);

  // Totals
  const totalMonthly = activeSubs.reduce((acc, sub) => acc + toMonthly(sub.price, sub.cycle), 0);
  const totalYearly = activeSubs.reduce((acc, sub) => acc + toYearly(sub.price, sub.cycle), 0);
  
  // Top Category
  const categorySpend = activeSubs.reduce((acc, sub) => {
    const cat = sub.category || 'Other';
    acc[cat] = (acc[cat] || 0) + toMonthly(sub.price, sub.cycle);
    return acc;
  }, {} as Record<string, number>);
  
  const topCategory = Object.entries(categorySpend).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

  // Efficiency Score: (Active Monthly / Total Possible)
  const totalPossibleMonthly = subs.reduce((acc, sub) => acc + toMonthly(sub.price, sub.cycle), 0);
  const efficiencyScore = totalPossibleMonthly > 0 
    ? Math.round((totalMonthly / totalPossibleMonthly) * 100) 
    : 100;

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this subscription?')) return;
    try {
      await fetch(`/api/finances/subscriptions/${id}`, { method: 'DELETE' });
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

  const handleEdit = (sub: Subscription) => {
    setEditData(sub);
    setShowForm(true);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start mt-8 pb-20">
      <section className="md:col-span-9 space-y-16">
        {/* Header Hero */}
        <div className="bg-media-surface-container-lowest p-12 rounded-[2.5rem] relative overflow-hidden flex flex-col md:flex-row justify-between items-center md:items-end gap-8 editorial-shadow">
          <div className="absolute top-0 right-0 w-64 h-64 bg-media-surface-container-low rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="relative z-10 space-y-4 text-center md:text-left">
            <h1 className="text-5xl font-bold tracking-tight text-media-primary max-w-md font-lexend">The Monthly Overview</h1>
            <p className="text-media-on-surface-variant max-w-sm font-medium">A consolidated view of your recurring digital and physical memberships.</p>
          </div>
          <div className="relative z-10 text-center md:text-right">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-media-secondary mb-1">Total Recurring</div>
            <div className="text-7xl font-black tracking-tighter text-media-primary font-lexend">{formatCurrency(totalMonthly)}</div>
          </div>
        </div>

        {/* Subscription Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSubs.map((sub, idx) => (
            <div key={sub.id} className="relative group">
              <SubscriptionEditorialCard 
                subscription={sub} 
                onEdit={handleEdit}
                variant={idx === 0 ? 'primary' : 'surface'}
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-20">
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-media-error/20 backdrop-blur hover:bg-media-error/40 text-white border-0" onClick={(e) => { e.stopPropagation(); handleDelete(sub.id); }}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}

          {/* Add Subscription Button Card */}
          <div 
            onClick={() => { setEditData(undefined); setShowForm(true); }}
            className="border-2 border-dashed border-media-outline-variant p-6 rounded-2xl flex flex-col items-center justify-center min-h-[200px] hover:bg-media-surface-container hover:border-media-outline transition-all cursor-pointer group"
          >
            <span className="material-symbols-outlined text-media-outline text-3xl mb-2 group-hover:text-media-primary transition-colors">add</span>
            <span className="text-media-on-surface-variant text-[10px] font-bold uppercase tracking-widest group-hover:text-media-primary transition-colors">Add Subscription</span>
          </div>
        </div>

        {/* Paused Section */}
        {inactiveSubs.length > 0 && (
          <div className="pt-8 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-media-on-surface-variant flex items-center gap-2 px-1">
              Paused Commitments
              <span className="h-px flex-1 bg-media-outline-variant/30 ml-2"></span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveSubs.map((sub) => (
                <div key={sub.id} className="relative group opacity-60 hover:opacity-100 transition-opacity">
                  <SubscriptionEditorialCard 
                    subscription={sub} 
                    onEdit={handleEdit}
                    variant="surface"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-20">
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-media-error/20 backdrop-blur hover:bg-media-error/40 text-media-error border-0" onClick={(e) => { e.stopPropagation(); handleDelete(sub.id); }}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="pt-24 flex flex-col items-center">
          <div className="max-w-xl text-center">
            <p className="text-media-on-surface-variant font-medium italic leading-relaxed text-lg">
              &quot;Ownership is not defined by the sum of our subscriptions, but by the intention behind our commitments.&quot;
            </p>
            <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-media-secondary">The Curator&apos;s Journal</div>
          </div>
        </footer>
      </section>

      {/* Sidebar */}
      <aside className="md:col-span-3 sticky top-32 space-y-12 h-fit">
        <div className="space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-media-secondary px-1">Subscription Insights</h2>
          <div className="space-y-8">
            <div className="group px-1">
              <div className="text-xs text-media-on-surface-variant mb-1 font-medium">Annual Commitment</div>
              <div className="text-3xl font-bold tracking-tighter text-media-primary font-lexend">{formatCurrency(totalYearly)}</div>
              <div className="h-1.5 w-8 bg-media-secondary mt-3 rounded-full"></div>
            </div>
            
            <div className="p-8 bg-media-surface-container-low rounded-[2rem] border border-media-outline-variant/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-media-secondary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-media-on-surface-variant uppercase tracking-wider">Top Category</span>
                  <span className="text-sm font-bold text-media-primary bg-media-primary/5 px-3 py-1 rounded-full">{topCategory}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-media-on-surface-variant uppercase tracking-wider">
                    <span>Efficiency Score</span>
                    <span className="text-media-primary">{efficiencyScore}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-media-surface-container-high rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-media-secondary transition-all duration-1000" 
                      style={{ width: `${efficiencyScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] aspect-[4/5] bg-media-primary flex flex-col justify-end p-8 group cursor-pointer shadow-2xl shadow-media-primary/20">
          <img 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50 group-hover:scale-105 transition-transform duration-700" 
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop" 
            alt="Security"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center">
              <Wand2 className="text-white w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-media-surface-bright leading-tight font-lexend">Optimize Your Portfolio</h3>
            <p className="text-sm text-media-on-primary-container leading-relaxed font-medium">Discover hidden overlaps in your digital life with our AI audit.</p>
            <Button className="w-full bg-media-secondary hover:bg-media-secondary/90 text-media-on-secondary border-0 rounded-xl py-6 font-bold uppercase tracking-widest text-[10px]">
              Run Audit
            </Button>
          </div>
        </div>
      </aside>

      {/* Form Dialog */}
      <SubscriptionFormDialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditData(undefined);
        }}
        onSuccess={handleSuccess}
        editData={editData ? {
          ...editData,
          billingDay: editData.billing_day || null
        } : undefined}
      />
    </div>
  );
}
