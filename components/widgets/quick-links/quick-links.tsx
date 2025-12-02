"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as LucideIcons from "lucide-react";
import { Settings } from "lucide-react";
import { QuickLinksEditor } from "./quick-links-editor";

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

function getIcon(iconName: string) {
  // Convert icon name from kebab-case to PascalCase
  const pascalCase = iconName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  // Get the icon component from lucide-react
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
    pascalCase
  ];

  return IconComponent || LucideIcons.Link;
}

export function QuickLinks() {
  const [categories, setCategories] = useState<QuickLinkCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const fetchQuickLinks = async () => {
    try {
      const response = await fetch("/api/quick-links");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch quick links:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuickLinks();
  }, []);

  const handleSave = () => {
    setEditMode(false);
    fetchQuickLinks(); // Refresh data
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent className="grid gap-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-8 bg-muted rounded" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (editMode) {
    return (
      <QuickLinksEditor
        categories={categories}
        onSave={handleSave}
        onCancel={() => setEditMode(false)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditMode(true)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Customize
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">{category.name}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {category.links.map((link) => {
                const Icon = getIcon(link.icon);
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{link.title}</span>
                  </a>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
