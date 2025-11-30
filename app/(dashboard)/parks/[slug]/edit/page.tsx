import { notFound } from "next/navigation";
import { getParkBySlug } from "@/lib/db/parks";
import { ParkEditor } from "@/components/widgets/parks/park-editor";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";

interface EditParkPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EditParkPage({ params }: EditParkPageProps) {
  const { slug } = await params;
  const park = getParkBySlug(slug);

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
  };

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 max-w-5xl">
      <div className="mb-6 sm:mb-8 space-y-4">
        <PageBreadcrumb
          items={[
            { label: "Parks", href: "/parks" },
            { label: park.title, href: `/parks/${slug}` },
            { label: "Edit" },
          ]}
        />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Edit Park</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Update the information for {park.title}
          </p>
        </div>
      </div>

      <ParkEditor
        mode="edit"
        initialFrontmatter={initialFrontmatter}
        initialContent={park.content}
        existingSlug={slug}
      />
    </div>
  );
}
