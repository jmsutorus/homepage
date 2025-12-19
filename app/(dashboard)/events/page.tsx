import { getAllEvents } from "@/lib/db/events";
import { EventsPageClient } from "@/components/widgets/events/events-page-client";
import { getUserId } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const userId = await getUserId();
  const events = await getAllEvents(userId);

  return <EventsPageClient events={events} />;
}
