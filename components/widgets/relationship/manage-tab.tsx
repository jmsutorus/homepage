"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";
import type { RelationshipPosition } from "@/lib/db/relationship";

interface ManageTabProps {
  userId: string;
}

export function ManageTab({ userId }: ManageTabProps) {
  const [positions, setPositions] = useState<RelationshipPosition[]>([]);
  const [newPositionName, setNewPositionName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Fetch positions on mount
  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await fetch("/api/relationship/positions");
      if (response.ok) {
        const data = await response.json();
        setPositions(data);
      } else {
        toast.error("Failed to load positions");
      }
    } catch (error) {
      console.error("Failed to fetch positions:", error);
      toast.error("Failed to load positions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPosition = async () => {
    if (!newPositionName.trim()) {
      toast.error("Please enter a position name");
      return;
    }

    if (newPositionName.length > 50) {
      toast.error("Position name must be 50 characters or less");
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch("/api/relationship/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPositionName.trim() }),
      });

      if (response.ok) {
        const newPosition = await response.json();
        setPositions([...positions, newPosition]);
        setNewPositionName("");
        toast.success("Position added successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add position");
      }
    } catch (error) {
      console.error("Failed to add position:", error);
      toast.error("Failed to add position");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeletePosition = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/relationship/positions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPositions(positions.filter((p) => p.id !== id));
        toast.success("Position deleted successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete position");
      }
    } catch (error) {
      console.error("Failed to delete position:", error);
      toast.error("Failed to delete position");
    }
  };

  const defaultPositions = positions.filter((p) => p.is_default);
  const customPositions = positions.filter((p) => !p.is_default);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Settings</h2>
          <p className="text-muted-foreground">Configure your relationship tracking preferences</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manage Settings</h2>
        <p className="text-muted-foreground">Configure your relationship tracking preferences</p>
      </div>

      {/* Privacy Notice */}
      <Card className="border-pink-500/20 bg-pink-500/5">
        <CardContent>
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-pink-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Privacy Notice</p>
              <p className="text-sm text-muted-foreground mt-1">
                All positions you define are completely private and only visible to you.
                This data is never shared and is used exclusively for your personal tracking.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positions Management */}
      <Card>
        <CardHeader>
          <CardTitle>Intimacy Positions</CardTitle>
          <CardDescription>
            Manage the list of positions available when logging intimacy entries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Position */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Add New Position</label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Custom Position Name"
                value={newPositionName}
                onChange={(e) => setNewPositionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddPosition();
                  }
                }}
                maxLength={50}
                disabled={isAdding}
              />
              <Button
                onClick={handleAddPosition}
                disabled={isAdding || !newPositionName.trim()}
                className="cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Default Positions */}
          {defaultPositions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Default Positions</h3>
              <div className="flex flex-wrap gap-2">
                {defaultPositions.map((position) => (
                  <Badge
                    key={position.id}
                    variant="secondary"
                    className="text-sm py-1.5 px-3"
                  >
                    {position.name}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Default positions cannot be deleted
              </p>
            </div>
          )}

          {/* Custom Positions */}
          {customPositions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Custom Positions</h3>
              <div className="flex flex-wrap gap-2">
                {customPositions.map((position) => (
                  <Badge
                    key={position.id}
                    variant="outline"
                    className="text-sm py-1.5 px-3 pr-1 flex items-center gap-1"
                  >
                    <span>{position.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 hover:bg-destructive/20 cursor-pointer"
                      onClick={() => handleDeletePosition(position.id, position.name)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {customPositions.length === 0 && (
            <div className="text-center py-6 border border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">
                No custom positions yet. Add your own above!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Future Settings Placeholder */}
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle>Additional Settings</CardTitle>
          <CardDescription>More configuration options coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Future updates will include additional privacy settings, notification preferences,
            and data export options.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
