import { getAllMediaItems } from "@/lib/media";
import { MediaPageClient } from "@/components/widgets/media/media-page-client";
import { getMediaTimelineData } from "@/lib/db/media";
import { getUserId } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const userId = await getUserId();

  // Get media items on the server
  const allMedia = await getAllMediaItems(userId);

  // Get timeline data on the server for initial render
  const timelineData = await getMediaTimelineData(userId, "month", 12);

  return <MediaPageClient allMedia={allMedia} timelineData={timelineData} />;
}
