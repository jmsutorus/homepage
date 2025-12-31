
import { getAllDrinksWithLogCount } from "@/lib/db/drinks";
import { DrinksPageClient } from "@/components/widgets/drinks/drinks-page-client";
import { getUserId } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function DrinksPage() {
  const userId = await getUserId();
  const drinks = await getAllDrinksWithLogCount(userId);

  return <DrinksPageClient drinks={drinks} />;
}
