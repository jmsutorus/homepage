import { notFound } from "next/navigation";
import { getRestaurantWithVisits } from "@/lib/db/restaurants";
import { RestaurantDetailClient } from "@/components/widgets/restaurants/restaurant-detail-client";
import { getUserId } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

interface RestaurantDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
  const { slug } = await params;
  const userId = await getUserId();
  const restaurant = await getRestaurantWithVisits(slug, userId);

  if (!restaurant) {
    notFound();
  }

  return <RestaurantDetailClient restaurantData={restaurant} />;
}
