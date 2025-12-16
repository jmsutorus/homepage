"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EventCategory } from "@/lib/db/events";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

interface EventCategoryManagerProps {
  onCategoriesChanged?: () => void;
}

export function EventCategoryManager({ onCategoriesChanged }: EventCategoryManagerProps) {
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/event-categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch event categories:", error);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategoryName.trim()) return;

    setIsAdding(true);
    try {
      const response = await fetch("/api/event-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      if (response.ok) {
        setNewCategoryName("");
        await fetchCategories();
        onCategoriesChanged?.();
      } else if (response.status === 409) {
        alert("A category with this name already exists");
      }
    } catch (error) {
      console.error("Failed to create event category:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (category: EventCategory) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleSaveEdit = async (categoryId: number) => {
    if (!editingName.trim()) return;

    try {
      const response = await fetch(`/api/event-categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditingName("");
        await fetchCategories();
        onCategoriesChanged?.();
      } else if (response.status === 409) {
        alert("A category with this name already exists");
      }
    } catch (error) {
      console.error("Failed to update event category:", error);
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (!confirm("Are you sure you want to delete this category? Events with this category will have it removed.")) {
      return;
    }

    setDeletingId(categoryId);
    try {
      const response = await fetch(`/api/event-categories/${categoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCategories();
        onCategoriesChanged?.();
      }
    } catch (error) {
      console.error("Failed to delete event category:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Category Form */}
      <form onSubmit={handleAddCategory} className="flex gap-2">
        <Input
          placeholder="New event category name..."
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          disabled={isAdding}
          className="flex-1"
        />
        <Button type="submit" disabled={isAdding || !newCategoryName.trim()}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </form>

      {/* Categories List */}
      <div className="space-y-2">
        {categories.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No categories yet. Add your first category above!
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
              >
                {editingId === category.id ? (
                  <>
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="h-7 w-32"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveEdit(category.id);
                        } else if (e.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleSaveEdit(category.id)}
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
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">
                      {category.name}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleStartEdit(category)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(category.id)}
                      disabled={deletingId === category.id}
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
    </div>
  );
}
