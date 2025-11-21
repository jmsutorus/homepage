import { MediaEditor } from '@/components/widgets/media/media-editor';

export const dynamic = "force-dynamic";
import { Suspense } from 'react';

export default function NewMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Media Entry</h1>
        <p className="text-muted-foreground">
          Add a new movie, TV show, or book to your media library.
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <NewMediaForm searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function NewMediaForm({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const initialType = params.type as 'movie' | 'tv' | 'book' | undefined;

  const initialFrontmatter = initialType
    ? {
        title: '',
        type: initialType,
        status: 'planned' as const,
        genres: [],
      }
    : undefined;

  return (
    <MediaEditor
      mode="create"
      initialFrontmatter={initialFrontmatter}
      initialContent=""
    />
  );
}
