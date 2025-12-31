import { getAllRestaurantsWithVisitCount } from "@/lib/db/restaurants";
import { RestaurantsPageClient } from "@/components/widgets/restaurants/restaurants-page-client";
import { getUserId } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function RestaurantsPage() {
  const userId = await getUserId();
  const restaurants = await getAllRestaurantsWithVisitCount(userId);

  return <RestaurantsPageClient restaurants={restaurants} />;
}
