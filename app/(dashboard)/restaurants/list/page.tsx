import { getAllRestaurantsWithVisitCount } from "@/lib/db/restaurants";
import { RestaurantListPageClient } from "@/components/widgets/restaurants/restaurant-list-page-client";
import { getUserId } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function RestaurantsListPage() {
  const userId = await getUserId();
  const restaurants = await getAllRestaurantsWithVisitCount(userId);

  return <RestaurantListPageClient restaurants={restaurants} />;
}
