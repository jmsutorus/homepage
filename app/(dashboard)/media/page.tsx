import { getAllMediaItems } from "@/lib/media";
import { MediaPageClient } from "@/components/widgets/media/media-page-client";
import { getMediaTimelineData } from "@/lib/db/media";

export const dynamic = "force-dynamic";

export default function MediaPage() {
  // Get media items on the server
  const allMedia = getAllMediaItems();

  // Get timeline data on the server for initial render
  const timelineData = getMediaTimelineData("month", 12);

  return <MediaPageClient allMedia={allMedia} timelineData={timelineData} />;
}
