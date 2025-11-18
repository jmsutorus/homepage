import { getAllMediaItems } from "@/lib/media";
import { MediaPageClient } from "@/components/widgets/media/media-page-client";

export default function MediaPage() {
  // Get media items on the server
  const allMedia = getAllMediaItems();

  return <MediaPageClient allMedia={allMedia} />;
}
