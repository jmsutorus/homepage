import { getUserId } from "@/lib/auth/server";
import { getPeople } from "@/lib/db/people";
import { PeoplePageClient } from "./page-client";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const userId = await getUserId();
  const people = await getPeople(userId);

  // Serialize data for client component
  const serializedPeople = JSON.parse(JSON.stringify(people));

  return <PeoplePageClient initialPeople={serializedPeople} />;
}
