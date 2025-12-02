"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileText } from "lucide-react";
import type { TaskTemplate } from "@/lib/db/task-templates";

interface TemplatePickerProps {
  type: "task";
  onSelect: (template: Partial<TaskTemplate>) => void;
}

export function TemplatePicker({ type, onSelect }: TemplatePickerProps) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (type === "task") {
      fetchTaskTemplates();
    }
  }, [type]);

  const fetchTaskTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/task-templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error("Failed to fetch task templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || templates.length === 0) return null;

  const handleSelect = (template: TaskTemplate) => {
    onSelect(template);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Templates
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        <div className="space-y-1">
          <h4 className="font-medium text-sm px-2 py-1.5 mb-1">Choose a template</h4>
          {templates.map((template) => (
            <Button
              key={template.id}
              variant="ghost"
              className="w-full justify-start h-auto py-2 px-2 flex-col items-start gap-1"
              onClick={() => handleSelect(template)}
            >
              <span className="font-medium text-sm">{template.name}</span>
              <span className="text-xs text-muted-foreground font-normal text-left">
                {template.title} • {template.priority}
                {template.category && ` • ${template.category}`}
              </span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
