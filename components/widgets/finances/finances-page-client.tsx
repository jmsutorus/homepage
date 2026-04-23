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
import { EditorialBudget } from './editorial-budget';

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
    <div className="container mx-auto py-6 sm:py-10 px-4 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-3 font-lexend">
          <div className="bg-media-primary text-media-on-primary p-2 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          Finances
        </h1>
        <p className="text-media-on-surface-variant text-sm sm:text-base mt-2 font-medium">
          Control center for your monthly capital, obligations, and growth.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <PageTabsList
          tabs={[
            { value: 'budget', label: 'Overview', icon: Receipt, showLabel: true },
            { value: 'subscriptions', label: 'Subscriptions', icon: DollarSign, showLabel: true },
            { value: 'savings', label: 'Savings', icon: PiggyBank, showLabel: true },
            { value: 'debts', label: 'Debts', icon: CreditCard, showLabel: true },
          ]}
        />

        <TabsContent value="budget" className="mt-0 pb-20 md:pb-0">
          <EditorialBudget
            income={income}
            fixedCosts={fixedCosts}
            subscriptions={subscriptions}
            debts={debts}
          />
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-0 pb-20 md:pb-0">
          <SubscriptionsTab subscriptions={subscriptions} />
        </TabsContent>

        <TabsContent value="savings" className="mt-0 pb-20 md:pb-0">
          <SavingsTab accounts={savingsAccounts} />
        </TabsContent>

        <TabsContent value="debts" className="mt-0 pb-20 md:pb-0">
          <DebtsTab debts={debts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
