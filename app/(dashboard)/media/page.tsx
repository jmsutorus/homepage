import { getAllMediaItems } from "@/lib/media";
import { MediaPageClient } from "@/components/widgets/media/media-page-client";
import { getPaginatedMedia } from "@/lib/db/media";
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
      time_spent: item.time_spent,
      progress: item.progress,
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

  const [
    allMedia,
    initialCompletedMediaRaw
  ] = await Promise.all([
    getAllMediaItems(userId),
    getPaginatedMedia(userId, 1, 25, {
      status: "completed",
      sortBy: "completed-desc",
    }),
  ]);

  // Convert to plain serializable object
  const initialCompletedMedia = serializePaginatedResult(initialCompletedMediaRaw);

  return (
    <MediaPageClient
      allMedia={allMedia}
      initialCompletedMedia={initialCompletedMedia}
    />
  );
}
