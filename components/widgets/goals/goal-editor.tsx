"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "@/components/search/tag-input";
import { Checklist } from "./checklist";
import { MilestoneList } from "./milestone-list";
import { allStatuses, getStatusLabel } from "./goal-status-badge";
import { SimpleMarkdown } from "./simple-markdown";
import { GoalLinkPicker } from "./goal-link-picker";
import {
  updateGoalAction,
  createGoalChecklistItemAction,
  toggleChecklistItemAction,
  deleteChecklistItemAction,
  reorderGoalChecklistAction,
  updateChecklistItemAction,
  replaceGoalLinksAction,
} from "@/lib/actions/goals";
import { showCreationSuccess } from "@/lib/success-toasts";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  ArrowLeft,
  Save,
  Bold,
  Italic,
  List,
  Heading1,
  Heading2,
  Link as LinkIcon,
  Eye,
  Edit3,
} from "lucide-react";
import Link from "next/link";
import type {
  Goal,
  GoalStatus,
  GoalPriority,
  GoalMilestone,
  GoalChecklistItem,
  GoalMilestoneWithChecklist,
  GoalLink,
} from "@/lib/db/goals";

interface GoalEditorProps {
  goal: Goal;
  milestones: GoalMilestoneWithChecklist[];
  checklist: GoalChecklistItem[];
  links: GoalLink[];
  mode: "create" | "edit";
}

export function GoalEditor({ goal, milestones, checklist, links, mode }: GoalEditorProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Form state
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description || "");
  const [content, setContent] = useState(goal.content || "");
  const [status, setStatus] = useState<GoalStatus>(goal.status);
  const [priority, setPriority] = useState<GoalPriority>(goal.priority);
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    goal.target_date ? parseISO(goal.target_date) : undefined
  );
  const [tags, setTags] = useState<string[]>(goal.tags || []);

  const [isSaving, setIsSaving] = useState(false);
  const [contentTab, setContentTab] = useState<"edit" | "preview">("edit");
  const [localChecklist, setLocalChecklist] = useState(checklist);
  const [localMilestones, setLocalMilestones] = useState(milestones);
  const [localLinks, setLocalLinks] = useState<GoalLink[]>(links);

  // Markdown toolbar functions
  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);

    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSaving(true);
    try {
      await updateGoalAction(goal.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        content: content || undefined,
        status,
        priority,
        target_date: targetDate
          ? `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}-${String(targetDate.getDate()).padStart(2, "0")}`
          : null,
        tags,
      });

      // Save links
      await replaceGoalLinksAction(
        goal.id,
        localLinks.map((l) => ({
          linked_type: l.linked_type,
          linked_id: l.linked_id,
          linked_slug: l.linked_slug || undefined,
          note: l.note || undefined,
        }))
      );

      toast.success("Goal saved successfully");
      router.refresh();
    } catch (error) {
      console.error("Error saving goal:", error);
      toast.error("Failed to save goal");
    } finally {
      setIsSaving(false);
    }
  };

  // Checklist handlers
  const handleAddChecklistItem = async (text: string) => {
    const item = await createGoalChecklistItemAction(goal.id, { text });
    setLocalChecklist((prev) => [...prev, item]);
  };

  const handleToggleChecklistItem = async (id: number) => {
    await toggleChecklistItemAction(id, goal.id);
    setLocalChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleDeleteChecklistItem = async (id: number) => {
    await deleteChecklistItemAction(id, goal.id);
    setLocalChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReorderChecklist = async (ids: number[]) => {
    await reorderGoalChecklistAction(goal.id, ids);
    setLocalChecklist((prev) => {
      const itemMap = new Map(prev.map((item) => [item.id, item]));
      return ids.map((id, index) => ({
        ...itemMap.get(id)!,
        order_index: index,
      }));
    });
  };

  const handleUpdateChecklistText = async (id: number, text: string) => {
    await updateChecklistItemAction(id, goal.id, { text });
    setLocalChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item))
    );
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/goals">
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {mode === "create" ? "New Goal" : "Edit Goal"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "create"
                ? "Create a new goal with milestones"
                : `Editing: ${goal.title}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/goals/${goal.slug}`}>
            <Button variant="outline" className="cursor-pointer">
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={isSaving} className="cursor-pointer">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Editor Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details" className="cursor-pointer">Details</TabsTrigger>
          <TabsTrigger value="milestones" className="cursor-pointer">
            Milestones ({localMilestones.length})
          </TabsTrigger>
          <TabsTrigger value="content" className="cursor-pointer">Notes</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Goal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What do you want to achieve?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief summary of this goal"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as GoalStatus)}>
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allStatuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {getStatusLabel(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as GoalPriority)}>
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal cursor-pointer",
                          !targetDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {targetDate ? format(targetDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={targetDate}
                        onSelect={setTargetDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <TagInput
                  selectedTags={tags}
                  onTagsChange={setTags}
                  label="Tags"
                  placeholder="Add tags..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <Checklist
                items={localChecklist}
                onToggle={handleToggleChecklistItem}
                onAdd={handleAddChecklistItem}
                onDelete={handleDeleteChecklistItem}
                onReorder={handleReorderChecklist}
                onUpdateText={handleUpdateChecklistText}
                placeholder="Add a step to achieve this goal..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linked Items</CardTitle>
            </CardHeader>
            <CardContent>
              <GoalLinkPicker
                links={localLinks}
                onLinksChange={(newLinks) => {
                  setLocalLinks(newLinks as GoalLink[]);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones">
          <MilestoneList
            goalId={goal.id}
            milestones={localMilestones}
            goalTargetDate={goal.target_date}
            onMilestonesChange={setLocalMilestones}
          />
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Notes & Details</CardTitle>
                <div className="flex items-center gap-1 border rounded-md">
                  <Button
                    variant={contentTab === "edit" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setContentTab("edit")}
                    className="cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant={contentTab === "preview" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setContentTab("preview")}
                    className="cursor-pointer"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {contentTab === "edit" ? (
                <div className="space-y-2">
                  {/* Markdown Toolbar */}
                  <div className="flex flex-wrap gap-1 pb-2 border-b">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("# ")}
                      title="Heading 1"
                      className="cursor-pointer"
                    >
                      <Heading1 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("## ")}
                      title="Heading 2"
                      className="cursor-pointer"
                    >
                      <Heading2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("**", "**")}
                      title="Bold"
                      className="cursor-pointer"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("*", "*")}
                      title="Italic"
                      className="cursor-pointer"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("- ")}
                      title="List"
                      className="cursor-pointer"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("[", "](url)")}
                      title="Link"
                      className="cursor-pointer"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>

                  <Textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write detailed notes, plans, or reflections about this goal..."
                    className="min-h-[400px] font-mono text-sm"
                  />
                </div>
              ) : (
                <div className="min-h-[400px]">
                  {content ? (
                    <SimpleMarkdown content={content} />
                  ) : (
                    <p className="text-muted-foreground italic">
                      No content yet. Switch to Edit mode to add notes.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
