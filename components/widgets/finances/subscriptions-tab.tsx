'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil, Globe, DollarSign, Pause, Play } from 'lucide-react';
import type { Subscription } from '@/lib/db/subscriptions';
import { toMonthly, toYearly } from '@/lib/utils/finances';
import type { SubscriptionCycle } from '@/lib/utils/finances';
import { SubscriptionFormDialog } from './subscription-form-dialog';

interface SubscriptionsTabProps {
  subscriptions: Subscription[];
}

const cycleLabels: Record<SubscriptionCycle, string> = {
  weekly: '/wk',
  monthly: '/mo',
  quarterly: '/qtr',
  yearly: '/yr',
};

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function SubscriptionsTab({ subscriptions: initialSubs }: SubscriptionsTabProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<Subscription | undefined>();

  const subs = initialSubs;
  const activeSubs = subs.filter(s => s.active);
  const inactiveSubs = subs.filter(s => !s.active);

  // Calculate totals by currency
  const totals = new Map<string, { monthly: number; yearly: number }>();
  for (const sub of activeSubs) {
    const curr = sub.currency;
    const current = totals.get(curr) || { monthly: 0, yearly: 0 };
    current.monthly += toMonthly(sub.price, sub.cycle);
    current.yearly += toYearly(sub.price, sub.cycle);
    totals.set(curr, current);
  }

  // Find max monthly cost for proportional sizing
  const maxMonthlyCost = Math.max(...activeSubs.map(s => toMonthly(s.price, s.cycle)), 1);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this subscription?')) return;
    try {
      await fetch(`/api/finances/subscriptions/${id}`, { method: 'DELETE' });
      router.refresh();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleToggleActive = async (sub: Subscription) => {
    try {
      await fetch(`/api/finances/subscriptions/${sub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !sub.active }),
      });
      router.refresh();
    } catch (error) {
      console.error('Error toggling:', error);
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
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="flex flex-wrap items-center gap-4">
        {Array.from(totals.entries()).map(([currency, data]) => (
          <Card key={currency} className="flex-1 min-w-[200px]">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Total</p>
                  <p className="text-2xl font-bold tracking-tight">
                    {formatCurrency(data.monthly, currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Yearly Total</p>
                  <p className="text-lg font-semibold text-muted-foreground">
                    {formatCurrency(data.yearly, currency)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeSubs.filter(s => s.currency === currency).length} active subscriptions
              </p>
            </CardContent>
          </Card>
        ))}
        {totals.size === 0 && (
          <Card className="flex-1">
            <CardContent className="py-4 text-center text-muted-foreground">
              <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No active subscriptions yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={() => { setEditData(undefined); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Subscription
        </Button>
      </div>

      {/* Proportional Grid */}
      {activeSubs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr">
          {activeSubs
            .sort((a, b) => toMonthly(b.price, b.cycle) - toMonthly(a.price, a.cycle))
            .map((sub) => {
              const monthlyCost = toMonthly(sub.price, sub.cycle);
              const proportion = monthlyCost / maxMonthlyCost;
              // Scale from 1 to 3 rows based on proportion
              const span = Math.max(1, Math.ceil(proportion * 3));

              return (
                <Card
                  key={sub.id}
                  className="relative group overflow-hidden transition-all hover:shadow-md border-l-4"
                  style={{
                    gridRow: `span ${span}`,
                    borderLeftColor: `hsl(${(sub.id * 47) % 360}, 70%, 55%)`,
                  }}
                >
                  <CardContent className="p-4 h-full flex flex-col justify-between">
                    <div className="flex items-start gap-2">
                      {/* Icon */}
                      {sub.icon_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={sub.icon_url}
                          alt=""
                          className="w-6 h-6 rounded flex-shrink-0"
                        />
                      ) : sub.website ? (
                        <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <DollarSign className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{sub.name}</p>
                        {sub.website && (
                          <a
                            href={sub.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-brand truncate block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {new URL(sub.website).hostname}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="text-lg font-bold">
                        {formatCurrency(sub.price, sub.currency)}
                        <span className="text-xs font-normal text-muted-foreground ml-1">
                          {cycleLabels[sub.cycle]}
                        </span>
                      </p>
                      {sub.cycle !== 'monthly' && (
                        <p className="text-xs text-muted-foreground">
                          ≈ {formatCurrency(monthlyCost, sub.currency)}/mo
                        </p>
                      )}
                    </div>

                    {/* Actions (visible on hover) */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleEdit(sub)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleToggleActive(sub)}
                      >
                        <Pause className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDelete(sub.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}

      {/* Inactive Subscriptions */}
      {inactiveSubs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Paused ({inactiveSubs.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {inactiveSubs.map((sub) => (
              <Card key={sub.id} className="opacity-60 group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {sub.icon_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={sub.icon_url} alt="" className="w-5 h-5 rounded grayscale" />
                    ) : (
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm truncate">{sub.name}</span>
                    <Badge variant="secondary" className="text-xs">Paused</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      {formatCurrency(sub.price, sub.currency)}{cycleLabels[sub.cycle]}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100"
                      onClick={() => handleToggleActive(sub)}
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100"
                      onClick={() => handleDelete(sub.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Form Dialog */}
      <SubscriptionFormDialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditData(undefined);
        }}
        onSuccess={handleSuccess}
        editData={editData}
      />
    </div>
  );
}
