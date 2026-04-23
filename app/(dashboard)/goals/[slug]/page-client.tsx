"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
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
    <main className="pt-12 pb-32 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto min-h-screen font-lexend">
      {/* Editorial Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end mb-20 pt-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-wrap gap-3 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="px-3 py-1 bg-media-primary text-media-on-primary text-[10px] uppercase tracking-widest font-bold rounded-full cursor-pointer hover:opacity-90 transition-opacity"
                  disabled={isUpdatingStatus}
                >
                  {getStatusLabel(goal.status)}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-media-surface-container/95 backdrop-blur-xl border-media-outline-variant/10 rounded-2xl shadow-2xl p-2 min-w-[180px]">
                {allStatuses.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={cn(
                      "cursor-pointer rounded-xl py-3 px-4 focus:bg-media-primary/10 focus:text-media-primary transition-colors mb-1 last:mb-0",
                      status === goal.status && "bg-media-primary/5 text-media-primary font-bold"
                    )}
                  >
                    <GoalStatusBadge status={status} className="mr-2" />
                    {status === goal.status && (
                      <span className="ml-auto text-[9px] uppercase tracking-widest opacity-50">Current</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <span className={cn(
              "px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded-full",
              goal.priority === "high" ? "bg-media-secondary text-media-on-secondary" :
              goal.priority === "medium" ? "bg-media-tertiary-fixed text-media-on-tertiary-fixed" :
              "bg-media-surface-container-highest text-media-on-surface-variant"
            )}>
              {priority.label}
            </span>

            {goal.tags?.map(tag => (
              <span key={tag} className="px-3 py-1 bg-media-tertiary-fixed text-media-on-tertiary-fixed text-[10px] uppercase tracking-widest font-bold rounded-full">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="space-y-4">
            <Link href="/goals" className="inline-flex items-center text-xs uppercase tracking-widest font-bold text-media-outline hover:text-media-primary transition-colors mb-2">
              <ArrowLeft className="h-3 w-3 mr-2" />
              Back to Goals
            </Link>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-media-primary leading-[1.1] max-w-3xl">
              {goal.title}
            </h1>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6 text-media-on-surface-variant mb-2">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-media-outline">calendar_add_on</span>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold">Created</p>
              <p className="text-sm font-medium">{format(parseISO(goal.created_at), "MMM d, yyyy")}</p>
            </div>
          </div>
          
          {goal.target_date && (
            <div className={cn(
              "flex items-center gap-3",
              isOverdue ? "text-media-error" : "text-media-on-surface-variant"
            )}>
              <span className={cn(
                "material-symbols-outlined",
                isOverdue ? "text-media-error" : "text-media-secondary"
              )}>event_upcoming</span>
              <div>
                <p className={cn(
                  "text-[10px] uppercase tracking-wider font-bold",
                  !isOverdue && "text-media-secondary"
                )}>Target Completion</p>
                <p className="text-sm font-medium">
                  {format(parseISO(goal.target_date), "MMM d, yyyy")}
                  {isOverdue && <span className="ml-2 text-xs font-bold">(Overdue)</span>}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-4 border-t border-media-outline-variant/20">
            <Link href={`/goals/${goal.slug}/edit`} className="flex-1">
              <Button variant="outline" className="w-full bg-media-surface border-media-outline-variant hover:bg-media-surface-container-low text-media-on-surface-variant">
                <Edit className="h-4 w-4 mr-2" />
                Edit Goal
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-media-outline-variant text-media-error hover:bg-media-error/10" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-media-surface border-media-outline-variant">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-media-primary">Delete Goal</AlertDialogTitle>
                  <AlertDialogDescription className="text-media-on-surface-variant">
                    Are you sure you want to delete this goal? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-media-surface-container border-media-outline-variant">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-media-error text-media-on-error hover:bg-media-error/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Progress Visualization */}
        <div className="md:col-span-12 lg:col-span-5 bg-media-surface-container-low rounded-xl p-10 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-media-primary-container/5 rounded-full -mr-16 -mt-16"></div>
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full -rotate-90 transform">
              <circle
                className="text-media-surface-container-highest"
                cx="128"
                cy="128"
                fill="transparent"
                r="110"
                stroke="currentColor"
                strokeWidth="12"
              ></circle>
              <motion.circle
                className="text-media-secondary"
                cx="128"
                cy="128"
                fill="transparent"
                r="110"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray="691"
                initial={{ strokeDashoffset: 691 }}
                animate={{ strokeDashoffset: 691 - (691 * calculatedProgress) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              ></motion.circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-bold text-media-primary">{calculatedProgress}%</span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-media-on-surface-variant">Evolution</span>
            </div>
          </div>
          <div className="mt-8 text-center">
            <h3 className="text-xl font-semibold text-media-primary mb-2">
              {calculatedProgress === 100 ? "Goal Achieved" : 
               calculatedProgress >= 75 ? "Technical Mastery" :
               calculatedProgress >= 50 ? "Steady Momentum" :
               calculatedProgress >= 25 ? "Gaining Ground" : "Foundation Stage"}
            </h3>
            <p className="text-media-on-surface-variant text-sm leading-relaxed max-w-xs mx-auto">
              {calculatedProgress === 100 ? "You have reached the final phase of mastery. The structure is complete." :
               calculatedProgress >= 50 ? "Approaching the final phase of synthesis. The momentum is firm." :
               "The journey of a thousand miles begins with a single step. Keep refining."}
            </p>
          </div>
        </div>

        {/* Milestones Timeline */}
        <div className="md:col-span-7 lg:col-span-7 bg-media-surface-container-lowest rounded-xl p-8 border border-media-outline-variant/10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-media-on-surface-variant">Milestones Timeline</h3>
            <span className="text-xs font-bold text-media-primary bg-media-surface-container-high px-3 py-1 rounded-full">
              {completedMilestones}/{goal.milestones.length}
            </span>
          </div>
          
          <div className="space-y-12 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[1px] before:bg-media-outline-variant/30">
            {goal.milestones.length > 0 ? (
              goal.milestones.map((milestone) => (
                <div key={milestone.id} className="relative flex items-start gap-8 group">
                  <button 
                    onClick={() => handleToggleMilestone(milestone.id)}
                    className={cn(
                      "z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110 shadow-sm",
                      milestone.completed 
                        ? "bg-media-primary text-media-on-primary" 
                        : "bg-media-surface-container-highest text-media-on-surface-variant border-4 border-media-surface"
                    )}
                  >
                    {milestone.completed ? (
                      <span className="material-symbols-outlined text-sm font-bold">check</span>
                    ) : (
                      <div className={cn("w-2 h-2 rounded-full", milestone.completed ? "" : "bg-media-secondary")}></div>
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex flex-col gap-1">
                      <h4 className={cn(
                        "font-bold text-lg text-media-primary transition-all",
                        milestone.completed && "opacity-60 line-through decoration-media-secondary/30"
                      )}>
                        {milestone.title}
                      </h4>
                      {milestone.description && (
                        <p className="text-sm text-media-on-surface-variant leading-relaxed">{milestone.description}</p>
                      )}
                      
                      {/* Sub-checklist Indicator */}
                      {milestone.checklist.length > 0 && (
                        <div className="mt-4 space-y-2 ml-2 border-l-2 border-media-outline-variant/20 pl-4 py-1">
                          {milestone.checklist.map((item) => (
                            <div 
                              key={item.id} 
                              className="flex items-center gap-3 cursor-pointer group/item"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleMilestoneChecklistItem(milestone.id, item.id);
                              }}
                            >
                              <span className={cn(
                                "material-symbols-outlined text-xs transition-colors",
                                item.completed ? "text-media-primary" : "text-media-outline group-hover/item:text-media-secondary"
                              )}>
                                {item.completed ? "check_circle" : "radio_button_unchecked"}
                              </span>
                              <span className={cn(
                                "text-xs font-medium transition-all",
                                item.completed ? "text-media-outline-variant" : "text-media-on-surface-variant group-hover/item:text-media-primary"
                              )}>
                                {item.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-[10px] text-media-outline-variant mt-2 font-bold uppercase tracking-[0.1em]">
                        {milestone.completed 
                          ? `Phase Complete` 
                          : milestone.target_date 
                            ? `Projected Completion: ${format(parseISO(milestone.target_date), "MMM yyyy")}`
                            : "Active Phase"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-media-outline-variant italic text-sm">No milestones have been drafted for this journey.</p>
              </div>
            )}
          </div>
        </div>

        {/* Checklist & Image Row */}
        <div className="md:col-span-5 lg:col-span-4 space-y-8">
          <div className="bg-media-surface-container rounded-xl p-8">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-media-on-surface-variant mb-6">Execution Checklist</h3>
            {goal.checklist.length > 0 ? (
              <ul className="space-y-4">
                {goal.checklist.map((item) => (
                  <li 
                    key={item.id} 
                    className="flex items-center gap-4 cursor-pointer group"
                    onClick={() => handleToggleChecklistItem(item.id)}
                  >
                    <span className={cn(
                      "material-symbols-outlined transition-colors",
                      item.completed ? "text-media-primary" : "text-media-outline group-hover:text-media-primary"
                    )}>
                      {item.completed ? "check_box" : "check_box_outline_blank"}
                    </span>
                    <span className={cn(
                      "text-sm font-medium transition-all",
                      item.completed ? "line-through text-media-outline-variant" : "text-media-on-surface"
                    )}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-media-outline-variant italic text-sm">No checklist items.</p>
            )}
          </div>
          
          <div className="aspect-square rounded-xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 cursor-pointer shadow-xl relative group">
            <img 
              alt="Goal Context" 
              className="w-full h-full object-cover" 
              src={goal.slug?.includes("piano") ? "https://lh3.googleusercontent.com/aida-public/AB6AXuB214UbpUWFuWmys_wFDBXh0T6m0uH2V3hMsMxE29F8l_EajPbUeHez0GMIbP2douBSC33u0v6cNGXiDGTYaY5ENnvP_RaFxpvIXlndHyJ0l6GgVWypON_QDnRLik3A5mqzLUK6S-0PgsSRVjO2A95vUhHFq2rcuohqf-3o7HKX7gIvy8qLRDobi9Lj0u3sK68LG-59tJ9aP3WyE-K1su1klYZxHBD_b_ZcLYCwSz6VG-yJMApaWWdxq_wRJc86pVOzKGWEeMV_8BA" : "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop"}
            />
            <div className="absolute inset-0 bg-media-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-bold uppercase tracking-widest">Detail View</span>
            </div>
          </div>
        </div>

        {/* Personal Reflections & Linked Items */}
        <div className="md:col-span-7 lg:col-span-8 space-y-8">
          <div className="bg-media-surface-container-low rounded-xl p-10 flex flex-col h-full border border-media-outline-variant/10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-media-on-surface-variant">Editorial Reflections</h3>
              <Link href={`/goals/${goal.slug}/edit`}>
                <span className="material-symbols-outlined text-media-outline cursor-pointer hover:text-media-secondary transition-colors">edit_note</span>
              </Link>
            </div>
            
            <div className="flex-grow">
              {goal.content ? (
                <div className="prose prose-sm max-w-none text-media-on-surface-variant">
                  <SimpleMarkdown content={goal.content} />
                </div>
              ) : (
                <p className="text-media-outline-variant italic">No reflections or notes recorded for this aspiration.</p>
              )}
            </div>

            {/* Linked Items Integration */}
            {links.length > 0 && (
              <div className="mt-12 pt-8 border-t border-media-outline-variant/20">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-media-on-surface-variant mb-6">Structural Linkages</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {links.map((link) => {
                    const key = `${link.linked_type}-${link.linked_id}`;
                    const details = linkDetails.get(key);
                    const config = linkTypeConfig[link.linked_type];
                    return (
                      <Link
                        key={key}
                        href={config.href(link)}
                        className="flex items-center gap-4 p-4 rounded-xl bg-media-surface border border-media-outline-variant/10 hover:border-media-secondary hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-media-surface-container-highest text-media-primary">
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-media-primary truncate text-sm">
                            {details?.title || link.linked_slug || `${config.label} #${link.linked_id}`}
                          </p>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-media-outline-variant">{config.label}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="mt-12 flex gap-4">
              <Link href={`/goals/${goal.slug}/edit`}>
                <button className="cursor-pointer bg-media-secondary text-media-on-secondary px-6 py-3 rounded-lg font-bold text-sm tracking-tight hover:opacity-90 transition-all">Add Reflection</button>
              </Link>
              <Link href={`/goals/${goal.slug}/edit`}>
                <button className="cursor-pointer bg-media-primary text-media-on-primary px-6 py-3 rounded-lg font-bold text-sm tracking-tight hover:opacity-90 transition-all">Update Strategy</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
