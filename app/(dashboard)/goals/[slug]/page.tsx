import { notFound } from "next/navigation";
import { getGoalWithDetailsAction, getGoalLinksAction } from "@/lib/actions/goals";
import { GoalDetailClient } from "./page-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function GoalDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const goal = await getGoalWithDetailsAction(slug);

  if (!goal) {
    notFound();
  }

  const links = await getGoalLinksAction(goal.id);

  return <GoalDetailClient goal={goal} links={links} />;
}
