import { getAllVacations } from "@/lib/db/vacations";
import { VacationPageClient } from "@/components/widgets/vacations/vacation-page-client";
import { getUserId } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function VacationsPage() {
  const userId = await getUserId();
  const vacations = await getAllVacations(userId);

  return <VacationPageClient vacations={vacations} />;
}
