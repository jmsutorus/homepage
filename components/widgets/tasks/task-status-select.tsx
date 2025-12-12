"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TaskStatusRecord } from "@/lib/db/tasks";
import { cn } from "@/lib/utils";

interface TaskStatusSelectProps {
  status: string;
  onStatusChange: (value: string) => void;
  customStatuses: TaskStatusRecord[];
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  blocked: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  on_hold: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  cancelled: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
  completed: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
};

function getStatusColor(status: string): string {
  return statusColors[status.toLowerCase()] || "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
}

function formatStatusName(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function TaskStatusSelect({ status, onStatusChange, customStatuses }: TaskStatusSelectProps) {
  const [open, setOpen] = useState(false);

  // When not open, show as a Badge
  if (!open) {
    return (
      <Badge
        variant="secondary"
        className={cn("cursor-pointer", getStatusColor(status || 'active'))}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        {formatStatusName(status || 'active')}
      </Badge>
    );
  }

  // When open, show as a Select
  return (
    <Select
      value={status || 'active'}
      onValueChange={onStatusChange}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectTrigger
        className="w-auto gap-1 px-2 py-0.5 text-xs font-medium h-auto"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <SelectValue>
          {formatStatusName(status || 'active')}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="in_progress">In Progress</SelectItem>
        <SelectItem value="blocked">Blocked</SelectItem>
        <SelectItem value="on_hold">On Hold</SelectItem>
        <SelectItem value="cancelled">Cancelled</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
        {customStatuses.length > 0 && (
          <>
            <SelectSeparator />
            {customStatuses.map((s) => (
              <SelectItem key={s.id} value={s.name}>
                {s.name}
              </SelectItem>
            ))}
          </>
        )}
      </SelectContent>
    </Select>
  );
}
