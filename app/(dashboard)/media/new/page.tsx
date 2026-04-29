import { MediaEditorialEditor } from '@/components/widgets/media/media-editorial-editor';

export const dynamic = "force-dynamic";

export default async function NewMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; title?: string; description?: string }>;
}) {
  const params = await searchParams;
  const initialType = params.type as 'movie' | 'tv' | 'book' | 'game' | 'album' | undefined;
  const title = params.title || '';
  const description = params.description || '';

  const initialFrontmatter = {
    title,
    description,
    type: initialType || 'movie',
    status: 'planned' as const,
    genres: [],
    tags: [],
    creator: [],
    featured: false,
    published: true,
  };

  return (
    <MediaEditorialEditor
      mode="create"
      initialFrontmatter={initialFrontmatter}
      initialContent=""
    />
  );
}
