import { getAllSubscriptions } from "@/lib/db/subscriptions";
import { getAllSavingsAccountsWithBalance } from "@/lib/db/savings";
import { getAllDebtsWithDetails } from "@/lib/db/debts";
import { getAllIncome, getAllFixedCosts } from "@/lib/db/budget";
import { FinancesPageClient } from "@/components/widgets/finances/finances-page-client";
import { getUserId } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function FinancesPage() {
  const userId = await getUserId();

  const [subscriptions, savingsAccounts, debts, income, fixedCosts] = await Promise.all([
    getAllSubscriptions(userId),
    getAllSavingsAccountsWithBalance(userId),
    getAllDebtsWithDetails(userId),
    getAllIncome(userId),
    getAllFixedCosts(userId),
  ]);

  return (
    <FinancesPageClient
      subscriptions={subscriptions}
      savingsAccounts={savingsAccounts}
      debts={debts}
      income={income}
      fixedCosts={fixedCosts}
    />
  );
}
