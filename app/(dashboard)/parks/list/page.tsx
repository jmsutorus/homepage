import { getPublishedParks } from "@/lib/db/parks";
import { getUserId } from "@/lib/auth/server";
import { ParksListClient } from "@/components/widgets/parks/parks-list-client";

export const dynamic = "force-dynamic";

export default async function ParksListPage() {
  const userId = await getUserId();
  const parks = await getPublishedParks(userId);

  return (
    <ParksListClient initialParks={parks} />
  );
}
