import { notFound } from "next/navigation";
import { MediaEditorialEditor } from "@/components/widgets/media/media-editorial-editor";
import { getMediaBySlug } from "@/lib/db/media";
import { getUserId } from "@/lib/auth/server";

interface EditMediaPageProps {
  params: Promise<{
    type: string;
    slug: string;
  }>;
}

// Helper to convert plural type to singular
function getApiType(type: string): string {
  const typeMap: Record<string, string> = {
    movies: "movie",
    tv: "tv",
    books: "book",
    games: "game",
    albums: "album",
  };
  return typeMap[type] || type;
}

export default async function EditMediaPage({ params }: EditMediaPageProps) {
  const { type, slug } = await params;
  const userId = await getUserId();
  const apiType = getApiType(type);

  // Fetch existing media data
  const media = await getMediaBySlug(slug, userId);

  if (!media) {
    notFound();
  }

  // Parse genres, tags, and creator from JSON strings
  const genres = media.genres ? JSON.parse(media.genres) : [];
  const tags = media.tags ? JSON.parse(media.tags) : [];
  const creator = media.creator ? JSON.parse(media.creator) : [];

  // Prepare frontmatter for editor
  const frontmatter = {
    title: media.title,
    type: media.type,
    status: media.status,
    rating: media.rating || undefined,
    started: media.started || undefined,
    completed: media.completed || undefined,
    released: media.released || undefined,
    genres,
    poster: media.poster || undefined,
    tags,
    creator,
    length: media.length || undefined,
    timeSpent: media.time_spent || undefined,
    featured: media.featured === 1,
    published: media.published === 1,
    description: media.description || undefined,
  };

  return (
    <MediaEditorialEditor
      mode="edit"
      existingType={apiType}
      existingSlug={slug}
      initialFrontmatter={frontmatter}
      initialContent={media.content}
    />
  );
}

