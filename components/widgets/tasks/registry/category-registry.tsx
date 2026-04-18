"use client";

import { useState } from "react";
import { Task, TaskCategory } from "@/lib/db/tasks";
import { Plus, Trash2, Edit2, Check, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface CategoryRegistryProps {
  initialCategories: TaskCategory[];
  tasks: Task[];
  onChanged?: () => void;
}

export function CategoryRegistry({ initialCategories, tasks, onChanged }: CategoryRegistryProps) {
  const [categories, setCategories] = useState<TaskCategory[]>(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/task-categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    setIsAdding(true);
    try {
      const response = await fetch("/api/task-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      if (response.ok) {
        setNewCategoryName("");
        await fetchCategories();
        onChanged?.();
        toast.success("Category added successfully");
      } else if (response.status === 409) {
        toast.error("Category already exists");
      }
    } catch (error) {
      toast.error("Failed to add category");
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (category: TaskCategory) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const handleSaveEdit = async (categoryId: number) => {
    if (!editingName.trim()) return;

    try {
      const response = await fetch(`/api/task-categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      if (response.ok) {
        setEditingId(null);
        await fetchCategories();
        onChanged?.();
        toast.success("Category updated");
      }
    } catch (error) {
      toast.error("Failed to update category");
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (!confirm("Delete this category? Associated tasks will have category cleared.")) return;

    try {
      const response = await fetch(`/api/task-categories/${categoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCategories();
        onChanged?.();
        toast.success("Category deleted");
      }
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const getTaskCount = (categoryName: string) => {
    return tasks.filter(t => t.category === categoryName).length;
  };

  return (
    <div className="bg-media-surface-container p-8 rounded-xl shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-black uppercase tracking-widest text-media-primary">Categories</h2>
        <button 
          onClick={fetchCategories}
          className="cursor-pointer text-media-primary hover:rotate-180 transition-transform duration-500"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <ul className="space-y-4 flex-grow overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
        {categories.map((category, index) => (
          <li 
            key={category.id} 
            className="flex items-center justify-between group p-3 hover:bg-media-surface-container-high rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className={`w-3 h-3 rounded-full ${index % 3 === 0 ? 'bg-media-primary' : index % 3 === 1 ? 'bg-media-secondary' : 'bg-media-tertiary-container'}`}></div>
              {editingId === category.id ? (
                <input
                  autoFocus
                  className="bg-transparent border-b border-media-primary text-media-primary font-semibold focus:outline-none w-full"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(category.id)}
                  onBlur={() => setEditingId(null)}
                />
              ) : (
                <span className="font-semibold text-media-primary">{category.name}</span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {editingId === category.id ? (
                <button onClick={() => handleSaveEdit(category.id)} className="cursor-pointer text-green-600">
                  <Check className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <span className="text-xs font-bold text-media-on-surface-variant opacity-40 group-hover:opacity-100 transition-opacity">
                    {getTaskCount(category.name).toString().padStart(2, '0')} Items
                  </span>
                  <div className="hidden group-hover:flex items-center gap-2">
                    <button onClick={() => handleStartEdit(category)} className="cursor-pointer text-media-primary/60 hover:text-media-primary">
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDelete(category.id)} className="cursor-pointer text-media-error/60 hover:text-media-error">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 space-y-4">
        {isAdding ? (
          <div className="flex gap-2">
            <input
              autoFocus
              className="flex-1 bg-media-surface-container-low border border-media-outline/20 rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-media-primary"
              placeholder="New category name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <button 
              onClick={handleAddCategory}
              className="cursor-pointer bg-media-primary text-media-on-primary p-2 rounded-lg"
            >
              <Check className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsAdding(false)}
              className="cursor-pointer bg-media-surface-container-high text-media-primary p-2 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsAdding(true)}
            className="cursor-pointer w-full py-3 border border-media-outline/20 rounded-lg text-media-primary font-bold text-sm uppercase tracking-widest hover:bg-media-primary hover:text-media-surface transition-all"
          >
            Manage Categories
          </button>
        )}
      </div>
    </div>
  );
}
