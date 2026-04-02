import { getPublishedParks } from "@/lib/db/parks";
import { getUserId } from "@/lib/auth/server";
import { ParksPageClient } from "@/components/widgets/parks/parks-page-client";

export const dynamic = "force-dynamic";

export default async function ParksPage() {
  // Require authentication
  const userId = await getUserId();

  const parks = await getPublishedParks(userId);

  // Group parks by category
  const parksByCategory = parks.reduce((acc, park) => {
    if (!acc[park.category]) {
      acc[park.category] = [];
    }
    acc[park.category].push(park);
    return acc;
  }, {} as Record<string, typeof parks>);

  return (
    <ParksPageClient parks={parks} parksByCategory={parksByCategory} />
  );
}
