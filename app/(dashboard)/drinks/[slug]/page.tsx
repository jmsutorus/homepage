
import { getDrinkWithLogs } from "@/lib/db/drinks";
import { DrinkDetailClient } from "@/components/widgets/drinks/drink-detail-client";
import { getUserId } from "@/lib/auth/server";
import { notFound } from "next/navigation";

export default async function DrinkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
    const slug = (await params).slug;
  const userId = await getUserId();
  const drink = await getDrinkWithLogs(slug, userId);

  if (!drink) {
    notFound();
  }

  return <DrinkDetailClient drink={drink} />;
}
