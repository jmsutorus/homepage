"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { TaskStatusRecord } from "@/lib/db/tasks";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatusManagerProps {
  onStatusesChanged?: () => void;
}

export function StatusManager({ onStatusesChanged }: StatusManagerProps) {
  const [customStatuses, setCustomStatuses] = useState<TaskStatusRecord[]>([]);
  const [newStatusName, setNewStatusName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      const response = await fetch("/api/task-statuses?customOnly=true");
      if (response.ok) {
        const data = await response.json();
        setCustomStatuses(data.custom || []);
      }
    } catch (error) {
      console.error("Failed to fetch custom statuses:", error);
    }
  };

  const handleAddStatus = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newStatusName.trim()) return;

    setIsAdding(true);
    try {
      const response = await fetch("/api/task-statuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newStatusName.trim() }),
      });

      if (response.ok) {
        setNewStatusName("");
        await fetchStatuses();
        onStatusesChanged?.();
      } else if (response.status === 409) {
        alert("A status with this name already exists");
      }
    } catch (error) {
      console.error("Failed to create status:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (status: TaskStatusRecord) => {
    setEditingId(status.id);
    setEditingName(status.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleSaveEdit = async (statusId: number) => {
    if (!editingName.trim()) return;

    try {
      const response = await fetch(`/api/task-statuses/${statusId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditingName("");
        await fetchStatuses();
        onStatusesChanged?.();
      } else if (response.status === 409) {
        alert("A status with this name already exists");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDelete = async (statusId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this status? Tasks with this status will be set to 'active'."
      )
    ) {
      return;
    }

    setDeletingId(statusId);
    try {
      const response = await fetch(`/api/task-statuses/${statusId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchStatuses();
        onStatusesChanged?.();
      }
    } catch (error) {
      console.error("Failed to delete status:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Statuses</CardTitle>
        <CardDescription>
          Create your own task statuses in addition to the predefined ones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Predefined Statuses (read-only) */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">
            Predefined Statuses
          </h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-green-500/10 text-green-500">
              Active
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
              In Progress
            </Badge>
            <Badge variant="secondary" className="bg-red-500/10 text-red-500">
              Blocked
            </Badge>
            <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">
              On Hold
            </Badge>
            <Badge variant="secondary" className="bg-gray-500/10 text-gray-500">
              Cancelled
            </Badge>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">
              Completed
            </Badge>
          </div>
        </div>

        {/* Add Custom Status Form */}
        <div>
          <h3 className="text-sm font-medium mb-2">Your Custom Statuses</h3>
          <form onSubmit={handleAddStatus} className="flex gap-2">
            <Input
              placeholder="New status name..."
              value={newStatusName}
              onChange={(e) => setNewStatusName(e.target.value)}
              disabled={isAdding}
              className="flex-1"
            />
            <Button type="submit" disabled={isAdding || !newStatusName.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </form>
        </div>

        {/* Custom Statuses List */}
        <div className="space-y-2">
          {customStatuses.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No custom statuses yet. Add your first custom status above!
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {customStatuses.map((status) => (
                <div
                  key={status.id}
                  className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                >
                  {editingId === status.id ? (
                    <>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-7 w-32"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveEdit(status.id);
                          } else if (e.key === "Escape") {
                            handleCancelEdit();
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleSaveEdit(status.id)}
                      >
                        <Check className="h-3 w-3 text-green-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-3 w-3 text-red-500" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Badge
                        variant="secondary"
                        className="bg-purple-500/10 text-purple-500"
                      >
                        {status.name}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleStartEdit(status)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(status.id)}
                        disabled={deletingId === status.id}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
