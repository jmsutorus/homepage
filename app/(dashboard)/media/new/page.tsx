import { MediaEditorialEditor } from '@/components/widgets/media/media-editorial-editor';

export const dynamic = "force-dynamic";

export default async function NewMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const initialType = params.type as 'movie' | 'tv' | 'book' | 'game' | 'album' | undefined;

  const initialFrontmatter = initialType
    ? {
        title: '',
        type: initialType,
        status: 'planned' as const,
        genres: [],
        tags: [],
        creator: [],
        featured: false,
        published: true,
      }
    : undefined;

  return (
    <MediaEditorialEditor
      mode="create"
      initialFrontmatter={initialFrontmatter}
      initialContent=""
    />
  );
}
