import { getEventWithDetails } from "@/lib/db/events";
import { getUserId } from "@/lib/auth/server";
import { notFound } from "next/navigation";
import { EventDetailClient } from "@/components/widgets/events/event-detail-client";

export const dynamic = "force-dynamic";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const userId = await getUserId();
  const eventData = await getEventWithDetails(slug, userId);

  if (!eventData) {
    notFound();
  }

  // Serialize data to ensure it's passable to client components
  const serializedData = JSON.parse(JSON.stringify(eventData));

  return <EventDetailClient eventData={serializedData} />;
}
