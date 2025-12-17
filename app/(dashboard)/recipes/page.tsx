import { getAllMeals } from "@/lib/db/meals";
import { getGroceryListByCategory } from "@/lib/db/grocery";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MealsPageClient } from "./page-client";

export const dynamic = "force-dynamic";

export default async function MealsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const [meals, groceryList] = await Promise.all([
    getAllMeals(session.user.id),
    getGroceryListByCategory(session.user.id),
  ]);

  // Serialize to plain objects for client component
  return (
    <MealsPageClient
      initialMeals={JSON.parse(JSON.stringify(meals))}
      initialGroceryList={JSON.parse(JSON.stringify(groceryList))}
    />
  );
}
