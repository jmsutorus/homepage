"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { GoalStatusBadge, allStatuses, getStatusLabel } from "@/components/widgets/goals/goal-status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnimatedProgressRing } from "@/components/ui/animations/animated-progress";
import { SimpleMarkdown } from "@/components/widgets/goals/simple-markdown";
import { Checklist } from "@/components/widgets/goals/checklist";
import {
  deleteGoalAction,
  toggleChecklistItemAction,
  toggleMilestoneAction,
  updateChecklistItemAction,
  updateGoalAction,
} from "@/lib/actions/goals";
import { format, parseISO, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Flag,
  Tag,
  CheckCircle2,
  Circle,
  Milestone,
  LinkIcon,
  Repeat,
  CheckSquare,
  BookOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { GoalWithDetails, GoalPriority, GoalLink, GoalLinkType, GoalStatus } from "@/lib/db/goals";

interface GoalDetailClientProps {
  goal: GoalWithDetails;
  links: GoalLink[];
}

const priorityConfig: Record<GoalPriority, { label: string; className: string }> = {
  low: { label: "Low Priority", className: "text-slate-600" },
  medium: { label: "Medium Priority", className: "text-yellow-600" },
  high: { label: "High Priority", className: "text-red-600" },
};

const linkTypeConfig: Record<GoalLinkType, { label: string; icon: React.ReactNode; href: (link: GoalLink) => string }> = {
  habit: {
    label: "Habit",
    icon: <Repeat className="h-4 w-4" />,
    href: () => "/habits",
  },
  task: {
    label: "Task",
    icon: <CheckSquare className="h-4 w-4" />,
    href: () => "/tasks",
  },
  journal: {
    label: "Journal",
    icon: <BookOpen className="h-4 w-4" />,
    href: (link) => link.linked_slug ? `/journals/${link.linked_slug}` : "/journals",
  },
};

interface LinkDetails {
  id: number;
  title: string;
  type: GoalLinkType;
}

export function GoalDetailClient({ goal: initialGoal, links }: GoalDetailClientProps) {
  const router = useRouter();
  const [goal, setGoal] = useState(initialGoal);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [linkDetails, setLinkDetails] = useState<Map<string, LinkDetails>>(new Map());
  const [expandedMilestones, setExpandedMilestones] = useState<Set<number>>(new Set());

  // Fetch details for linked items
  useEffect(() => {
    const fetchLinkDetails = async () => {
      const newDetails = new Map(linkDetails);
      let hasChanges = false;

      for (const link of links) {
        const key = `${link.linked_type}-${link.linked_id}`;
        if (!newDetails.has(key)) {
          try {
            let endpoint = "";
            switch (link.linked_type) {
              case "habit":
                endpoint = "/api/habits";
                break;
              case "task":
                endpoint = "/api/tasks";
                break;
              case "journal":
                if (link.linked_slug) {
                  endpoint = `/api/journals/${link.linked_slug}`;
                }
                break;
            }

            if (endpoint) {
              const res = await fetch(endpoint);
              if (res.ok) {
                const data = await res.json();

                if (link.linked_type === "habit" || link.linked_type === "task") {
                  const items = Array.isArray(data) ? data : [];
                  const item = items.find((i: { id: number }) => i.id === link.linked_id);
                  if (item) {
                    newDetails.set(key, {
                      id: link.linked_id,
                      title: item.title,
                      type: link.linked_type,
                    });
                    hasChanges = true;
                  }
                } else {
                  newDetails.set(key, {
                    id: link.linked_id,
                    title: data.frontmatter?.title || data.title || "Unknown",
                    type: link.linked_type,
                  });
                  hasChanges = true;
                }
              }
            }
          } catch (error) {
            console.error("Error fetching link details:", error);
          }
        }
      }

      if (hasChanges) {
        setLinkDetails(newDetails);
      }
    };

    if (links.length > 0) {
      fetchLinkDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [links]);

  const priority = priorityConfig[goal.priority];
  const isOverdue =
    goal.target_date &&
    isPast(parseISO(goal.target_date)) &&
    !isToday(parseISO(goal.target_date)) &&
    goal.status !== "completed";

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteGoalAction(goal.id);
      toast.success("Goal deleted");
      router.push("/goals");
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: GoalStatus) => {
    if (newStatus === goal.status || isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    try {
      // Determine the completed_date based on status change
      let completedDate: string | null | undefined = undefined;
      if (newStatus === "completed") {
        completedDate = new Date().toISOString().split("T")[0];
      } else if (goal.status === "completed") {
        // Clear completed date if changing from completed to something else
        completedDate = null;
      }

      const updatedGoal = await updateGoalAction(goal.id, {
        status: newStatus,
        completed_date: completedDate,
      });
      setGoal((prev) => ({
        ...prev,
        status: updatedGoal.status,
        completed_date: updatedGoal.completed_date,
      }));
      toast.success(`Status updated to ${getStatusLabel(newStatus)}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleToggleChecklistItem = async (id: number) => {
    try {
      await toggleChecklistItemAction(id, goal.id);
      setGoal((prev) => ({
        ...prev,
        checklist: prev.checklist.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        ),
      }));
    } catch (error) {
      console.error("Error toggling checklist item:", error);
      toast.error("Failed to update item");
    }
  };

  const handleToggleMilestone = async (milestoneId: number) => {
    try {
      const updated = await toggleMilestoneAction(milestoneId, goal.id);
      setGoal((prev) => ({
        ...prev,
        milestones: prev.milestones.map((m) =>
          m.id === milestoneId ? { ...updated, checklist: m.checklist } : m
        ),
      }));
    } catch (error) {
      console.error("Error toggling milestone:", error);
      toast.error("Failed to update milestone");
    }
  };

  const handleToggleMilestoneChecklistItem = async (milestoneId: number, itemId: number) => {
    try {
      await toggleChecklistItemAction(itemId, goal.id);
      setGoal((prev) => ({
        ...prev,
        milestones: prev.milestones.map((m) =>
          m.id === milestoneId
            ? {
                ...m,
                checklist: m.checklist.map((item) =>
                  item.id === itemId ? { ...item, completed: !item.completed } : item
                ),
              }
            : m
        ),
      }));
    } catch (error) {
      console.error("Error toggling milestone checklist item:", error);
      toast.error("Failed to update item");
    }
  };

  const toggleMilestoneExpanded = (milestoneId: number) => {
    setExpandedMilestones((prev) => {
      const next = new Set(prev);
      if (next.has(milestoneId)) {
        next.delete(milestoneId);
      } else {
        next.add(milestoneId);
      }
      return next;
    });
  };

  const completedMilestones = goal.milestones.filter((m) => m.completed).length;
  const completedChecklist = goal.checklist.filter((c) => c.completed).length;

  // Calculate progress in real-time based on current state
  const calculatedProgress = useMemo(() => {
    const { milestones, checklist } = goal;

    // If no milestones and no checklist, return 0
    if (milestones.length === 0 && checklist.length === 0) {
      return 0;
    }

    // Goal checklist progress
    const goalChecklistProgress = checklist.length > 0
      ? checklist.filter((c) => c.completed).length / checklist.length
      : 1;

    // If no milestones, just use goal checklist
    if (milestones.length === 0) {
      return Math.round(goalChecklistProgress * 100);
    }

    // Calculate milestone progress (including their checklists)
    let milestoneProgress = 0;
    milestones.forEach((milestone) => {
      if (milestone.completed) {
        milestoneProgress += 1;
      } else if (milestone.checklist.length > 0) {
        // Partial progress based on checklist completion
        const checklistDone = milestone.checklist.filter((c) => c.completed).length;
        milestoneProgress += checklistDone / milestone.checklist.length;
      }
    });

    const milestoneProgressPercent = milestoneProgress / milestones.length;

    // Weight: 70% milestones, 30% goal checklist
    const totalProgress = (milestoneProgressPercent * 0.7) + (goalChecklistProgress * 0.3);
    return Math.round(totalProgress * 100);
  }, [goal]);

  return (
    <div className="container mx-auto py-4 sm:py-6 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-2 sm:gap-4">
          <Link href="/goals">
            <Button variant="ghost" size="icon" className="cursor-pointer mt-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <h1 className="text-xl sm:text-2xl font-bold">{goal.title}</h1>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-1 cursor-pointer focus:outline-none disabled:opacity-50"
                    disabled={isUpdatingStatus}
                  >
                    <GoalStatusBadge status={goal.status} />
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {allStatuses.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={cn(
                        "cursor-pointer",
                        status === goal.status && "bg-muted"
                      )}
                    >
                      <GoalStatusBadge status={status} className="mr-2" />
                      {status === goal.status && (
                        <span className="ml-auto text-xs text-muted-foreground">(current)</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {goal.description && (
              <p className="text-muted-foreground">{goal.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link href={`/goals/${goal.slug}/edit`} className="flex-1 sm:flex-none">
            <Button variant="outline" className="cursor-pointer w-full">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="cursor-pointer text-destructive hover:text-destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this goal? This will also delete all
                  milestones and checklists. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column - Progress and details */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <AnimatedProgressRing
                  value={calculatedProgress}
                  max={100}
                  size={120}
                  strokeWidth={8}
                  showLabel={true}
                  color={
                    goal.status === "completed"
                      ? "success"
                      : calculatedProgress >= 75
                        ? "success"
                        : calculatedProgress >= 50
                          ? "warning"
                          : "primary"
                  }
                />
                <p className="mt-3 text-sm text-muted-foreground">Overall Progress</p>
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {goal.target_date && (
                <div className={cn(
                  "flex items-center gap-2 text-sm",
                  isOverdue && "text-red-600"
                )}>
                  <Calendar className="h-4 w-4" />
                  <span>Target: {format(parseISO(goal.target_date), "MMMM d, yyyy")}</span>
                  {isOverdue && <Badge variant="destructive" className="text-xs">Overdue</Badge>}
                </div>
              )}

              {goal.completed_date && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Completed: {format(parseISO(goal.completed_date), "MMMM d, yyyy")}</span>
                </div>
              )}

              <div className={cn("flex items-center gap-2 text-sm", priority.className)}>
                <Flag className="h-4 w-4" />
                <span>{priority.label}</span>
              </div>

              {goal.tags && goal.tags.length > 0 && (
                <div className="flex items-start gap-2">
                  <Tag className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {goal.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-2 border-t">
                Created {format(parseISO(goal.created_at), "MMM d, yyyy")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Milestones, Checklist, Notes */}
        <div className="md:col-span-2 space-y-6">
          {/* Milestones */}
          {goal.milestones.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Milestone className="h-5 w-5" />
                  Milestones
                  <span className="text-sm font-normal text-muted-foreground ml-auto">
                    {completedMilestones}/{goal.milestones.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {goal.milestones.map((milestone) => {
                  const checklistDone = milestone.checklist.filter((c) => c.completed).length;
                  const isExpanded = expandedMilestones.has(milestone.id);
                  const hasChecklist = milestone.checklist.length > 0;

                  return (
                    <Collapsible
                      key={milestone.id}
                      open={isExpanded}
                      onOpenChange={() => hasChecklist && toggleMilestoneExpanded(milestone.id)}
                    >
                      <div
                        className={cn(
                          "p-3 rounded-lg border",
                          milestone.completed && "bg-green-50/50 dark:bg-green-950/10 border-green-300/50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleToggleMilestone(milestone.id)}
                            className="mt-0.5 cursor-pointer"
                          >
                            {milestone.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                            )}
                          </button>
                          <div className="flex-1">
                            <h4 className={cn(
                              "font-medium",
                              milestone.completed && "line-through text-muted-foreground"
                            )}>
                              {milestone.title}
                            </h4>
                            {milestone.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {milestone.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              {milestone.target_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(parseISO(milestone.target_date), "MMM d")}
                                </span>
                              )}
                              {hasChecklist && (
                                <CollapsibleTrigger asChild>
                                  <button className="flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors">
                                    {isExpanded ? (
                                      <ChevronDown className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                    <span>{checklistDone}/{milestone.checklist.length} tasks</span>
                                  </button>
                                </CollapsibleTrigger>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Checklist */}
                        <CollapsibleContent>
                          {hasChecklist && (
                            <div className="mt-3 pt-3 border-t space-y-2 ml-8">
                              {milestone.checklist
                                .sort((a, b) => a.order_index - b.order_index)
                                .map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-2"
                                  >
                                    <Checkbox
                                      checked={item.completed}
                                      onCheckedChange={() =>
                                        handleToggleMilestoneChecklistItem(milestone.id, item.id)
                                      }
                                      className="cursor-pointer"
                                    />
                                    <span
                                      className={cn(
                                        "text-sm",
                                        item.completed && "line-through text-muted-foreground"
                                      )}
                                    >
                                      {item.text}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Checklist */}
          {goal.checklist.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Checklist
                  <span className="text-sm font-normal text-muted-foreground ml-auto">
                    {completedChecklist}/{goal.checklist.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Checklist
                  items={goal.checklist}
                  onToggle={handleToggleChecklistItem}
                  onAdd={async () => {}}
                  onDelete={async () => {}}
                  readOnly={true}
                />
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {goal.content && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleMarkdown content={goal.content} />
              </CardContent>
            </Card>
          )}

          {/* Linked Items */}
          {links.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Linked Items
                  <span className="text-sm font-normal text-muted-foreground ml-auto">
                    {links.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {links.map((link) => {
                    const key = `${link.linked_type}-${link.linked_id}`;
                    const details = linkDetails.get(key);
                    const config = linkTypeConfig[link.linked_type];
                    return (
                      <Link
                        key={key}
                        href={config.href(link)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {details?.title || link.linked_slug || `${config.label} #${link.linked_id}`}
                          </p>
                          <p className="text-xs text-muted-foreground">{config.label}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty state if no content */}
          {!goal.milestones.length && !goal.checklist.length && !goal.content && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  This goal doesn&apos;t have any milestones, checklists, or notes yet.
                </p>
                <Link href={`/goals/${goal.slug}/edit`}>
                  <Button className="cursor-pointer">
                    <Edit className="h-4 w-4 mr-2" />
                    Add Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
