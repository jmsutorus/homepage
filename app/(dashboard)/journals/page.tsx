export const dynamic = "force-dynamic";

import { getPublishedJournals } from "@/lib/db/journals";
import { getUserId } from "@/lib/auth/server";
import { JournalsPageClient } from "@/components/widgets/journal/journals-page-client";

export default async function JournalsPage() {
  const userId = await getUserId();
  const journals = await getPublishedJournals(userId);

  return <JournalsPageClient journals={journals} />;
}

