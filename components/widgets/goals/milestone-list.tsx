"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checklist } from "./checklist";
import {
  createMilestoneAction,
  updateMilestoneAction,
  deleteMilestoneAction,
  toggleMilestoneAction,
  createMilestoneChecklistItemAction,
  toggleChecklistItemAction,
  deleteChecklistItemAction,
  updateChecklistItemAction,
} from "@/lib/actions/goals";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  CalendarIcon,
  ChevronDown,
  Trash2,
  Pencil,
  CheckCircle2,
  Circle,
  Milestone,
} from "lucide-react";
import type { GoalMilestoneWithChecklist } from "@/lib/db/goals";

interface MilestoneListProps {
  goalId: number;
  milestones: GoalMilestoneWithChecklist[];
  goalTargetDate: string | null;
  onMilestonesChange: (milestones: GoalMilestoneWithChecklist[]) => void;
}

export function MilestoneList({
  goalId,
  milestones,
  goalTargetDate,
  onMilestonesChange,
}: MilestoneListProps) {
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<GoalMilestoneWithChecklist | null>(null);
  const [expandedMilestones, setExpandedMilestones] = useState<Set<number>>(new Set());

  // Form state for add/edit
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTargetDate, setFormTargetDate] = useState<Date | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormTargetDate(undefined);
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddingMilestone(true);
  };

  const openEditDialog = (milestone: GoalMilestoneWithChecklist) => {
    setFormTitle(milestone.title);
    setFormDescription(milestone.description || "");
    setFormTargetDate(milestone.target_date ? parseISO(milestone.target_date) : undefined);
    setEditingMilestone(milestone);
  };

  const handleAddMilestone = async () => {
    if (!formTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    setFormLoading(true);
    try {
      const milestone = await createMilestoneAction(goalId, {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        target_date: formTargetDate
          ? `${formTargetDate.getFullYear()}-${String(formTargetDate.getMonth() + 1).padStart(2, "0")}-${String(formTargetDate.getDate()).padStart(2, "0")}`
          : undefined,
      });

      onMilestonesChange([...milestones, { ...milestone, checklist: [] }]);
      setIsAddingMilestone(false);
      resetForm();
      toast.success("Milestone added");
    } catch (error) {
      console.error("Error adding milestone:", error);
      toast.error("Failed to add milestone");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateMilestone = async () => {
    if (!editingMilestone || !formTitle.trim()) return;

    setFormLoading(true);
    try {
      const updated = await updateMilestoneAction(editingMilestone.id, goalId, {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        target_date: formTargetDate
          ? `${formTargetDate.getFullYear()}-${String(formTargetDate.getMonth() + 1).padStart(2, "0")}-${String(formTargetDate.getDate()).padStart(2, "0")}`
          : null,
      });

      onMilestonesChange(
        milestones.map((m) =>
          m.id === editingMilestone.id ? { ...updated, checklist: m.checklist } : m
        )
      );
      setEditingMilestone(null);
      resetForm();
      toast.success("Milestone updated");
    } catch (error) {
      console.error("Error updating milestone:", error);
      toast.error("Failed to update milestone");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteMilestone = async (id: number) => {
    if (!confirm("Are you sure you want to delete this milestone?")) return;

    try {
      await deleteMilestoneAction(id, goalId);
      onMilestonesChange(milestones.filter((m) => m.id !== id));
      toast.success("Milestone deleted");
    } catch (error) {
      console.error("Error deleting milestone:", error);
      toast.error("Failed to delete milestone");
    }
  };

  const handleToggleMilestone = async (milestone: GoalMilestoneWithChecklist) => {
    try {
      const updated = await toggleMilestoneAction(milestone.id, goalId);
      onMilestonesChange(
        milestones.map((m) =>
          m.id === milestone.id ? { ...updated, checklist: m.checklist } : m
        )
      );
    } catch (error) {
      console.error("Error toggling milestone:", error);
      toast.error("Failed to update milestone");
    }
  };

  const toggleExpanded = (id: number) => {
    setExpandedMilestones((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Checklist handlers for milestones
  const handleAddChecklistItem = async (milestoneId: number, text: string) => {
    const item = await createMilestoneChecklistItemAction(milestoneId, goalId, { text });
    onMilestonesChange(
      milestones.map((m) =>
        m.id === milestoneId ? { ...m, checklist: [...m.checklist, item] } : m
      )
    );
  };

  const handleToggleChecklistItem = async (milestoneId: number, itemId: number) => {
    await toggleChecklistItemAction(itemId, goalId);
    onMilestonesChange(
      milestones.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              checklist: m.checklist.map((item) =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              ),
            }
          : m
      )
    );
  };

  const handleDeleteChecklistItem = async (milestoneId: number, itemId: number) => {
    await deleteChecklistItemAction(itemId, goalId);
    onMilestonesChange(
      milestones.map((m) =>
        m.id === milestoneId
          ? { ...m, checklist: m.checklist.filter((item) => item.id !== itemId) }
          : m
      )
    );
  };

  const handleUpdateChecklistText = async (milestoneId: number, itemId: number, text: string) => {
    await updateChecklistItemAction(itemId, goalId, { text });
    onMilestonesChange(
      milestones.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              checklist: m.checklist.map((item) =>
                item.id === itemId ? { ...item, text } : item
              ),
            }
          : m
      )
    );
  };

  const sortedMilestones = [...milestones].sort((a, b) => a.order_index - b.order_index);
  const completedCount = milestones.filter((m) => m.completed).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Milestone className="h-5 w-5" />
            Milestones
          </h2>
          <p className="text-sm text-muted-foreground">
            {completedCount}/{milestones.length} completed
          </p>
        </div>
        <Dialog open={isAddingMilestone} onOpenChange={setIsAddingMilestone}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Milestone</DialogTitle>
              <DialogDescription>
                Break down your goal into smaller, achievable milestones.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="milestone-title">Title</Label>
                <Input
                  id="milestone-title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Complete first module"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="milestone-description">Description (Optional)</Label>
                <Textarea
                  id="milestone-description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="What does this milestone involve?"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Target Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal cursor-pointer",
                        !formTargetDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formTargetDate ? format(formTargetDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formTargetDate}
                      onSelect={setFormTargetDate}
                      initialFocus
                      disabled={(date) => {
                        if (goalTargetDate && date > parseISO(goalTargetDate)) return true;
                        return false;
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {goalTargetDate && (
                  <p className="text-xs text-muted-foreground">
                    Must be on or before goal deadline: {format(parseISO(goalTargetDate), "PPP")}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleAddMilestone}
                disabled={formLoading || !formTitle.trim()}
                className="cursor-pointer"
              >
                {formLoading ? "Adding..." : "Add Milestone"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingMilestone} onOpenChange={(open) => !open && setEditingMilestone(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Target Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal cursor-pointer",
                      !formTargetDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formTargetDate ? format(formTargetDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formTargetDate}
                    onSelect={setFormTargetDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleUpdateMilestone}
              disabled={formLoading}
              className="cursor-pointer"
            >
              {formLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Milestones List */}
      {sortedMilestones.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Milestone className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              No milestones yet. Add milestones to break down your goal.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {sortedMilestones.map((milestone) => {
              const isExpanded = expandedMilestones.has(milestone.id);
              const checklistCompleted = milestone.checklist.filter((c) => c.completed).length;

              return (
                <motion.div
                  key={milestone.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className={cn(milestone.completed && "bg-green-50/50 dark:bg-green-950/10 border-green-300/50")}>
                    <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(milestone.id)}>
                      <CardHeader className="py-4">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleToggleMilestone(milestone)}
                            className="mt-0.5 cursor-pointer"
                          >
                            {milestone.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className={cn(
                                "font-medium",
                                milestone.completed && "line-through text-muted-foreground"
                              )}>
                                {milestone.title}
                              </h3>
                            </div>
                            {milestone.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {milestone.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              {milestone.target_date && (
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  {format(parseISO(milestone.target_date), "MMM d, yyyy")}
                                </span>
                              )}
                              {milestone.checklist.length > 0 && (
                                <span>
                                  {checklistCompleted}/{milestone.checklist.length} tasks
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 cursor-pointer"
                              onClick={() => openEditDialog(milestone)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive cursor-pointer"
                              onClick={() => handleDeleteMilestone(milestone.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                                <ChevronDown className={cn(
                                  "h-4 w-4 transition-transform",
                                  isExpanded && "rotate-180"
                                )} />
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                        </div>
                      </CardHeader>

                      <CollapsibleContent>
                        <CardContent className="pt-0 pb-4">
                          <div className="pl-8 border-l-2 border-muted ml-2">
                            <Checklist
                              items={milestone.checklist}
                              onToggle={(id) => handleToggleChecklistItem(milestone.id, id)}
                              onAdd={(text) => handleAddChecklistItem(milestone.id, text)}
                              onDelete={(id) => handleDeleteChecklistItem(milestone.id, id)}
                              onUpdateText={(id, text) => handleUpdateChecklistText(milestone.id, id, text)}
                              placeholder="Add a task for this milestone..."
                            />
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
