import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getRelationshipDates,
  getIntimacyEntries,
  getMilestones,
  getRelationshipStats,
} from "@/lib/db/relationship";
import { RelationshipPageClient } from "./page-client";

export const metadata = {
  title: "Relationship Tracker | Homepage",
  description: "Track dates, intimacy, and special moments together",
};

export default async function RelationshipPage() {
  const session = await auth();
  if (!session) {
    redirect("/sign-in");
  }

  const userId = session.user.id;

  // Fetch all data in parallel
  const [dates, intimacyEntries, milestones, stats] = await Promise.all([
    getRelationshipDates(userId),
    getIntimacyEntries(userId),
    getMilestones(userId),
    getRelationshipStats(userId),
  ]);

  return (
    <RelationshipPageClient
      initialDates={dates}
      initialIntimacy={intimacyEntries}
      initialMilestones={milestones}
      stats={stats}
      userId={userId}
    />
  );
}
