import { notFound } from "next/navigation";
import { MediaEditor } from "@/components/widgets/media/media-editor";
import { getMediaBySlug } from "@/lib/db/media";

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
  };
  return typeMap[type] || type;
}

export default async function EditMediaPage({ params }: EditMediaPageProps) {
  const { type, slug } = await params;
  const apiType = getApiType(type);

  // Fetch existing media data
  const media = getMediaBySlug(slug);

  if (!media) {
    notFound();
  }

  // Parse genres and tags from JSON strings
  const genres = media.genres ? JSON.parse(media.genres) : [];
  const tags = media.tags ? JSON.parse(media.tags) : [];

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
    length: media.length || undefined,
    featured: media.featured === 1,
    published: media.published === 1,
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Media Entry</h1>
        <p className="text-muted-foreground">
          Update the details for {media.title}.
        </p>
      </div>

      <MediaEditor
        mode="edit"
        existingType={apiType}
        existingSlug={slug}
        initialFrontmatter={frontmatter}
        initialContent={media.content}
      />
    </div>
  );
}
