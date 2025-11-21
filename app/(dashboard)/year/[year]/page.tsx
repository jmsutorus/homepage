import { getYearlyData } from "@/lib/data/yearly-data";
import { YearlySummary } from "@/components/widgets/yearly/yearly-summary";
import { notFound } from "next/navigation";

import { requireAuth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ year: string }>;
}

export default async function YearPage({ params }: PageProps) {
  const { year } = await params;
  const yearNum = parseInt(year);
  const session = await requireAuth();

  if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
    notFound();
  }

  const stats = await getYearlyData(yearNum, session.user.id);

  return (
    <div className="container mx-auto py-8 px-4">
      <YearlySummary stats={stats} year={yearNum} />
    </div>
  );
}
