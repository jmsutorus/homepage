import { notFound } from "next/navigation";
import { getParkBySlug } from "@/lib/db/parks";
import { ParkEditorialEditor } from "@/components/widgets/parks/park-editorial-editor";
import { getUserId } from "@/lib/auth/server";

interface EditParkPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EditParkPage({ params }: EditParkPageProps) {
  const { slug } = await params;
  const userId = await getUserId();
  const park = await getParkBySlug(slug, userId);

  if (!park) {
    notFound();
  }

  // Convert park data to frontmatter format
  const initialFrontmatter = {
    title: park.title,
    category: park.category,
    state: park.state || undefined,
    poster: park.poster || undefined,
    description: park.description || undefined,
    visited: park.visited || undefined,
    tags: park.tags,
    rating: park.rating !== null ? park.rating : undefined,
    featured: park.featured,
    published: park.published,
    quote: park.quote || undefined,
  };

  return (
    <ParkEditorialEditor
      mode="edit"
      initialFrontmatter={initialFrontmatter}
      initialContent={park.content}
      existingSlug={slug}
    />
  );
}
