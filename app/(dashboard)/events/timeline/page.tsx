import { getAllEventsForTimeline } from "@/lib/db/events";
import { EventsTimelineClient } from "@/components/widgets/events/events-timeline-client";
import { getUserId } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function EventsTimelinePage() {
  const userId = await getUserId();
  const events = await getAllEventsForTimeline(userId);

  return <EventsTimelineClient events={events} />;
}
