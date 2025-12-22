"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type RelationshipType } from "@/lib/db/people";
import { Plus, Trash2, Edit2, Check, X, Heart } from "lucide-react";

interface RelationshipTypeManagerProps {
  onTypesChanged?: () => void;
}

export function RelationshipTypeManager({ onTypesChanged }: RelationshipTypeManagerProps) {
  const [types, setTypes] = useState<RelationshipType[]>([]);
  const [newTypeName, setNewTypeName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const response = await fetch("/api/relationship-types");
      if (response.ok) {
        const data = await response.json();
        setTypes(data);
      }
    } catch (error) {
      console.error("Failed to fetch relationship types:", error);
    }
  };

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTypeName.trim()) return;

    setIsAdding(true);
    try {
      const response = await fetch("/api/relationship-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTypeName.trim() }),
      });

      if (response.ok) {
        setNewTypeName("");
        await fetchTypes();
        onTypesChanged?.();
      } else if (response.status === 409) {
        alert("A relationship type with this name already exists");
      }
    } catch (error) {
      console.error("Failed to create relationship type:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (type: RelationshipType) => {
    setEditingId(type.id);
    setEditingName(type.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleSaveEdit = async (typeId: number) => {
    if (!editingName.trim()) return;

    try {
      const response = await fetch(`/api/relationship-types/${typeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditingName("");
        await fetchTypes();
        onTypesChanged?.();
      } else if (response.status === 409) {
        alert("A relationship type with this name already exists");
      }
    } catch (error) {
      console.error("Failed to update relationship type:", error);
    }
  };

  const handleDelete = async (typeId: number) => {
    if (!confirm("Are you sure you want to delete this relationship type? People with this type will have it removed.")) {
      return;
    }

    setDeletingId(typeId);
    try {
      const response = await fetch(`/api/relationship-types/${typeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchTypes();
        onTypesChanged?.();
      }
    } catch (error) {
      console.error("Failed to delete relationship type:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-500" />
          <CardTitle>Relationship Types</CardTitle>
        </div>
        <CardDescription>
          Define custom relationship labels like Father, Mother, Partner, etc.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Type Form */}
        <form onSubmit={handleAddType} className="flex gap-2">
          <Input
            placeholder="New relationship type..."
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            disabled={isAdding}
            className="flex-1"
          />
          <Button type="submit" disabled={isAdding || !newTypeName.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </form>

        {/* Types List */}
        <div className="space-y-2">
          {types.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No relationship types yet. Add your first type above!
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                >
                  {editingId === type.id ? (
                    <>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-7 w-32"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveEdit(type.id);
                          } else if (e.key === "Escape") {
                            handleCancelEdit();
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleSaveEdit(type.id)}
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
                      <Badge variant="secondary" className="bg-rose-500/10 text-rose-500">
                        {type.name}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleStartEdit(type)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(type.id)}
                        disabled={deletingId === type.id}
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
