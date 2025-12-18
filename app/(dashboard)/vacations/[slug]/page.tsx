import { getVacationWithDetails } from "@/lib/db/vacations";
import { getUserId } from "@/lib/auth/server";
import { notFound } from "next/navigation";
import { VacationDetailClient } from "@/components/widgets/vacations/vacation-detail-client";

export const dynamic = "force-dynamic";

interface VacationDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function VacationDetailPage({ params }: VacationDetailPageProps) {
  const { slug } = await params;
  const userId = await getUserId();
  const vacationData = await getVacationWithDetails(slug, userId);

  if (!vacationData) {
    notFound();
  }

  // Serialize data to ensure it's passable to client components
  const serializedData = JSON.parse(JSON.stringify(vacationData));

  return <VacationDetailClient vacationData={serializedData} />;
}
