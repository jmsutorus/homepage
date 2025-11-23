import { notFound } from "next/navigation";
import { getGoalWithDetailsAction, getGoalLinksAction } from "@/lib/actions/goals";
import { GoalEditor } from "@/components/widgets/goals/goal-editor";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditGoalPage({ params }: PageProps) {
  const { slug } = await params;
  const goal = await getGoalWithDetailsAction(slug);

  if (!goal) {
    notFound();
  }

  const links = await getGoalLinksAction(goal.id);

  return (
    <GoalEditor
      goal={goal}
      milestones={goal.milestones}
      checklist={goal.checklist}
      links={links}
      mode="edit"
    />
  );
}
