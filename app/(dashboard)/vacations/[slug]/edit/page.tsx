import { getVacationBySlug } from "@/lib/db/vacations";
import { getUserId } from "@/lib/auth/server";
import { notFound } from "next/navigation";
import { EditorialVacationEditor } from "@/components/widgets/vacations/editorial-vacation-editor";

export const dynamic = "force-dynamic";

interface EditVacationPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditVacationPage({ params }: EditVacationPageProps) {
  const { slug } = await params;
  const userId = await getUserId();
  const vacation = await getVacationBySlug(slug, userId);

  if (!vacation) {
    notFound();
  }

  // Prepare frontmatter for editor
  const frontmatter = {
    title: vacation.title,
    destination: vacation.destination,
    type: vacation.type,
    start_date: vacation.start_date,
    end_date: vacation.end_date,
    description: vacation.description || undefined,
    poster: vacation.poster || undefined,
    status: vacation.status,
    budget_planned: vacation.budget_planned || undefined,
    budget_actual: vacation.budget_actual || undefined,
    budget_currency: vacation.budget_currency,
    tags: vacation.tags,
    rating: vacation.rating || undefined,
    featured: vacation.featured,
    published: vacation.published,
  };

  return (
    <EditorialVacationEditor
      mode="edit"
      existingSlug={slug}
      initialFrontmatter={frontmatter}
      initialContent={vacation.content || ''}
    />
  );
}
