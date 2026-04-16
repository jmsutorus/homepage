'use client';

import { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PageTabsList } from '@/components/ui/page-tabs-list';
import { DollarSign, PiggyBank, CreditCard, Receipt, Plus } from 'lucide-react';
import type { Subscription } from '@/lib/db/subscriptions';
import type { SavingsAccountWithBalance } from '@/lib/db/savings';
import type { DebtWithPayments } from '@/lib/db/debts';
import type { BudgetIncome, BudgetFixedCost } from '@/lib/db/budget';
import { SubscriptionsTab } from './subscriptions-tab';
import { SavingsTab } from './savings-tab';
import { DebtsTab } from './debts-tab';
import { BudgetTab } from './budget-tab';

interface FinancesPageClientProps {
  subscriptions: Subscription[];
  savingsAccounts: SavingsAccountWithBalance[];
  debts: DebtWithPayments[];
  income: BudgetIncome[];
  fixedCosts: BudgetFixedCost[];
}

export function FinancesPageClient({
  subscriptions,
  savingsAccounts,
  debts,
  income,
  fixedCosts,
}: FinancesPageClientProps) {
  const [activeTab, setActiveTab] = useState('budget');

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="w-7 h-7" />
            Finances
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Track your budget, subscriptions, savings, and debts
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <PageTabsList
          tabs={[
            { value: 'budget', label: 'Budget', icon: Receipt, showLabel: true },
            { value: 'subscriptions', label: 'Subscriptions', icon: DollarSign, showLabel: true },
            { value: 'savings', label: 'Savings', icon: PiggyBank, showLabel: true },
            { value: 'debts', label: 'Debts', icon: CreditCard, showLabel: true },
          ]}
          actionButton={{
            label: 'Add',
            onClick: () => {
              window.dispatchEvent(new CustomEvent('finances-add', { detail: activeTab }));
            },
            icon: Plus,
          }}
        />

        <TabsContent value="budget" className="mt-6 sm:mt-8 pb-20 md:pb-0">
          <BudgetTab
            income={income}
            fixedCosts={fixedCosts}
            subscriptions={subscriptions}
            debts={debts}
          />
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-6 sm:mt-8 pb-20 md:pb-0">
          <SubscriptionsTab subscriptions={subscriptions} />
        </TabsContent>

        <TabsContent value="savings" className="mt-6 sm:mt-8 pb-20 md:pb-0">
          <SavingsTab accounts={savingsAccounts} />
        </TabsContent>

        <TabsContent value="debts" className="mt-6 sm:mt-8 pb-20 md:pb-0">
          <DebtsTab debts={debts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
