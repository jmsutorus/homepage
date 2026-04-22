"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaStatusSelectProps {
  status: string;
  slug: string;
  type: string;
  frontmatter: any;
  content: string | undefined;
  className?: string;
}

const statusColors: Record<string, string> = {
  completed: "!bg-emerald-100 !text-emerald-700 dark:!bg-emerald-500/20 dark:!text-emerald-400 !border-emerald-200 dark:!border-emerald-500/30",
  watching: "!bg-blue-100 !text-blue-700 dark:!bg-blue-500/20 dark:!text-blue-400 !border-blue-200 dark:!border-blue-500/30",
  "in-progress": "!bg-blue-100 !text-blue-700 dark:!bg-blue-500/20 dark:!text-blue-400 !border-blue-200 dark:!border-blue-500/30",
  planned: "!bg-slate-100 !text-slate-700 dark:!bg-slate-500/20 dark:!text-slate-400 !border-slate-200 dark:!border-slate-500/30",
};

export function MediaStatusSelect({
  status,
  slug,
  type,
  frontmatter,
  content,
  className,
}: MediaStatusSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status || isUpdating) return;

    setIsUpdating(true);

    try {
      const updatedFrontmatter = { ...frontmatter, status: newStatus };

      // Set completed date to today's local date if marked as completed
      if (newStatus === "completed") {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        updatedFrontmatter.completed = `${year}-${month}-${day}`;
      }

      const response = await fetch(`/api/media/${type}/${slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          frontmatter: updatedFrontmatter,
          content: content || "",
        }),
      });

      if (!response.ok) {
        let errStr = "Failed to update status";
        try {
          const errRes = await response.json();
          if (errRes.error) errStr = errRes.error;
        } catch (e) {}
        throw new Error(errStr);
      }

      toast.success(`Status updated to ${newStatus}`);
      router.refresh();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      value={status}
      onValueChange={handleStatusChange}
      disabled={isUpdating}
    >
      <SelectTrigger className={cn(
        "!h-6 !min-h-0 !text-xs !px-2.5 !py-0 font-medium w-auto inline-flex !rounded-full gap-1.5 [&>svg]:!size-3 shadow-none transition-colors",
        statusColors[status] || statusColors.planned,
        className
      )}>
        {isUpdating ? <Loader2 className="!w-3 !h-3 animate-spin mr-1" /> : null}
        <SelectValue placeholder={status} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="planned">planned</SelectItem>
        {type === "tv" ? (
          <SelectItem value="watching">watching</SelectItem>
        ) : (
          <SelectItem value="in-progress">in-progress</SelectItem>
        )}
        <SelectItem value="completed">completed</SelectItem>
      </SelectContent>
    </Select>
  );
}
