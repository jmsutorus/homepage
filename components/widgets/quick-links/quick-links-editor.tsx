"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { showCreationSuccess, showCreationError } from "@/lib/success-toasts";

interface QuickLink {
  id: number;
  title: string;
  url: string;
  icon: string;
  order_index: number;
}

interface QuickLinkCategory {
  id: number;
  name: string;
  order_index: number;
  links: QuickLink[];
}

interface QuickLinksEditorProps {
  categories: QuickLinkCategory[];
  onSave: () => void;
  onCancel: () => void;
}

function getIcon(iconName: string) {
  const pascalCase = iconName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
    pascalCase
  ];
  return IconComponent || LucideIcons.Link;
}

export function QuickLinksEditor({ categories: initialCategories, onSave, onCancel }: QuickLinksEditorProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingCategory, setEditingCategory] = useState<QuickLinkCategory | null>(null);
  const [editingLink, setEditingLink] = useState<{ categoryId: number; link: QuickLink | null } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  // Link form state
  const [linkForm, setLinkForm] = useState({
    title: "",
    url: "",
    icon: "link",
  });

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const response = await fetch("/api/quick-links/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories([...categories, { ...newCategory, links: [] }]);
        setNewCategoryName("");
        setShowCategoryDialog(false);
        showCreationSuccess("category");
      } else {
        throw new Error("Failed to create category");
      }
    } catch (error) {
      console.error("Failed to create category:", error);
      showCreationError("category", error);
    }
  };

  const handleEditCategory = async (category: QuickLinkCategory) => {
    if (!editingCategory) return;

    try {
      const response = await fetch("/api/quick-links/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: category.id, name: editingCategory.name }),
      });

      if (response.ok) {
        setCategories(
          categories.map((cat) =>
            cat.id === category.id ? { ...cat, name: editingCategory.name } : cat
          )
        );
        setEditingCategory(null);
      }
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm("Are you sure you want to delete this category and all its links?")) return;

    try {
      const response = await fetch(`/api/quick-links/categories?id=${categoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCategories(categories.filter((cat) => cat.id !== categoryId));
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const handleAddLink = async (categoryId: number) => {
    if (!linkForm.title.trim() || !linkForm.url.trim()) return;

    try {
      const response = await fetch("/api/quick-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          title: linkForm.title,
          url: linkForm.url,
          icon: linkForm.icon,
        }),
      });

      if (response.ok) {
        const newLink = await response.json();
        setCategories(
          categories.map((cat) =>
            cat.id === categoryId
              ? { ...cat, links: [...cat.links, newLink] }
              : cat
          )
        );
        setLinkForm({ title: "", url: "", icon: "link" });
        setShowLinkDialog(false);
        setEditingLink(null);
        showCreationSuccess("link");
      } else {
        throw new Error("Failed to create link");
      }
    } catch (error) {
      console.error("Failed to create link:", error);
      showCreationError("link", error);
    }
  };

  const handleEditLink = async () => {
    if (!editingLink?.link) return;

    try {
      const response = await fetch("/api/quick-links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingLink.link.id,
          title: linkForm.title,
          url: linkForm.url,
          icon: linkForm.icon,
        }),
      });

      if (response.ok) {
        setCategories(
          categories.map((cat) =>
            cat.id === editingLink.categoryId
              ? {
                  ...cat,
                  links: cat.links.map((link) =>
                    link.id === editingLink.link!.id
                      ? { ...link, title: linkForm.title, url: linkForm.url, icon: linkForm.icon }
                      : link
                  ),
                }
              : cat
          )
        );
        setLinkForm({ title: "", url: "", icon: "link" });
        setShowLinkDialog(false);
        setEditingLink(null);
      }
    } catch (error) {
      console.error("Failed to update link:", error);
    }
  };

  const handleDeleteLink = async (categoryId: number, linkId: number) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      const response = await fetch(`/api/quick-links?id=${linkId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCategories(
          categories.map((cat) =>
            cat.id === categoryId
              ? { ...cat, links: cat.links.filter((link) => link.id !== linkId) }
              : cat
          )
        );
      }
    } catch (error) {
      console.error("Failed to delete link:", error);
    }
  };

  const openAddLinkDialog = (categoryId: number) => {
    setEditingLink({ categoryId, link: null });
    setLinkForm({ title: "", url: "", icon: "link" });
    setShowLinkDialog(true);
  };

  const openEditLinkDialog = (categoryId: number, link: QuickLink) => {
    setEditingLink({ categoryId, link });
    setLinkForm({ title: link.title, url: link.url, icon: link.icon });
    setShowLinkDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Customize Quick Links</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Done
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                {editingCategory?.id === category.id ? (
                  <Input
                    value={editingCategory.name}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, name: e.target.value })
                    }
                    onBlur={() => handleEditCategory(category)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleEditCategory(category);
                      } else if (e.key === "Escape") {
                        setEditingCategory(null);
                      }
                    }}
                    autoFocus
                    className="text-base font-semibold"
                  />
                ) : (
                  <CardTitle className="text-base font-semibold">{category.name}</CardTitle>
                )}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setEditingCategory(category)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-2">
              {category.links.map((link) => {
                const Icon = getIcon(link.icon);
                return (
                  <div
                    key={link.id}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm bg-accent/50"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate flex-1">{link.title}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => openEditLinkDialog(category.id, link)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleDeleteLink(category.id, link.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => openAddLinkDialog(category.id)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </CardContent>
          </Card>
        ))}

        {/* Add Category Card */}
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-muted-foreground">
              Add Section
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  New Section
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Section</DialogTitle>
                  <DialogDescription>
                    Create a new section to organize your quick links.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="category-name" className="text-sm font-medium">
                      Section Name
                    </label>
                    <Input
                      id="category-name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g., Development, Social, Tools"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddCategory();
                        }
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCategory}>Add Section</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLink?.link ? "Edit Link" : "Add New Link"}
            </DialogTitle>
            <DialogDescription>
              {editingLink?.link ? "Update the link details." : "Add a new quick link to this section."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="link-title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="link-title"
                value={linkForm.title}
                onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
                placeholder="e.g., GitHub"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="link-url" className="text-sm font-medium">
                URL
              </label>
              <Input
                id="link-url"
                value={linkForm.url}
                onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="link-icon" className="text-sm font-medium">
                Icon (Lucide icon name)
              </label>
              <Input
                id="link-icon"
                value={linkForm.icon}
                onChange={(e) => setLinkForm({ ...linkForm, icon: e.target.value })}
                placeholder="e.g., github, twitter, link"
              />
              <p className="text-xs text-muted-foreground">
                See available icons at{" "}
                <a
                  href="https://lucide.dev/icons"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  lucide.dev
                </a>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingLink?.link) {
                  handleEditLink();
                } else if (editingLink) {
                  handleAddLink(editingLink.categoryId);
                }
              }}
            >
              {editingLink?.link ? "Update" : "Add"} Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
