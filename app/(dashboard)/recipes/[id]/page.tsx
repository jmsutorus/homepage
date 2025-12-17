import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getMealWithIngredients } from "@/lib/db/meals";
import { MealDetailContent } from "./meal-detail-content";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MealDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const mealId = parseInt(id, 10);
  if (isNaN(mealId)) {
    notFound();
  }

  const meal = await getMealWithIngredients(mealId, session.user.id);
  if (!meal) {
    notFound();
  }

  // Serialize to plain objects for client component
  return <MealDetailContent meal={JSON.parse(JSON.stringify(meal))} />;
}
