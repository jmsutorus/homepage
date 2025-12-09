import { getAllMediaItems } from "@/lib/media";
import { MediaPageClient } from "@/components/widgets/media/media-page-client";
import { getMediaTimelineData, getPaginatedMedia } from "@/lib/db/media";
import { getUserId } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

// Convert database result to plain serializable object
function serializePaginatedResult(result: Awaited<ReturnType<typeof getPaginatedMedia>>) {
  return {
    items: result.items.map(item => ({
      id: item.id,
      userId: item.userId,
      slug: item.slug,
      title: item.title,
      type: item.type,
      status: item.status,
      rating: item.rating,
      started: item.started,
      completed: item.completed,
      released: item.released,
      genres: item.genres,
      poster: item.poster,
      tags: item.tags,
      description: item.description,
      length: item.length,
      creator: item.creator,
      featured: item.featured,
      published: item.published,
      content: item.content,
      created_at: item.created_at,
      updated_at: item.updated_at,
    })),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    hasMore: result.hasMore,
  };
}

export default async function MediaPage() {
  const userId = await getUserId();

  // Fetch all data in parallel
  const [
    allMedia,
    initialCompletedMediaRaw,
    timelineData
  ] = await Promise.all([
    // Get ALL media items for in-progress and planned (usually small numbers)
    getAllMediaItems(userId),
    // Get initial paginated completed media items (first 25)
    getPaginatedMedia(userId, 1, 25, {
      status: "completed",
      sortBy: "completed-desc",
    }),
    // Get timeline data on the server for initial render
    getMediaTimelineData(userId, "month", 12)
  ]);

  // Convert to plain serializable object
  const initialCompletedMedia = serializePaginatedResult(initialCompletedMediaRaw);

  return (
    <MediaPageClient
      allMedia={allMedia}
      initialCompletedMedia={initialCompletedMedia}
      timelineData={timelineData}
    />
  );
}
