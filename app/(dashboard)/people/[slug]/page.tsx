import { notFound } from "next/navigation";
import { getUserId } from "@/lib/auth/server";
import { getPersonBySlug, getPersonSharedHistory } from "@/lib/db/people";
import { PersonDetailClient } from "./page-client";

interface PersonDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function PersonDetailPage({ params }: PersonDetailPageProps) {
  const { slug } = await params;
  const userId = await getUserId();
  
  if (!userId) {
    notFound();
  }

  const person = await getPersonBySlug(slug, userId);
  
  if (!person) {
    notFound();
  }

  const sharedHistory = await getPersonSharedHistory(person.id, userId);

  // Serialize data for client component
  const serializedPerson = JSON.parse(JSON.stringify(person));
  const serializedHistory = JSON.parse(JSON.stringify(sharedHistory));

  return (
    <PersonDetailClient 
      person={serializedPerson} 
      sharedHistory={serializedHistory} 
    />
  );
}
