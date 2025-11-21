"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileText } from "lucide-react";
import { TEMPLATES, Template, TemplateType } from "@/lib/constants/templates";

interface TemplatePickerProps {
  type: TemplateType;
  onSelect: (template: Template) => void;
}

export function TemplatePicker({ type, onSelect }: TemplatePickerProps) {
  const [open, setOpen] = useState(false);
  const templates = TEMPLATES[type];

  if (!templates || templates.length === 0) return null;

  const handleSelect = (template: Template) => {
    onSelect(template);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
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
              <span className="font-medium text-sm">{template.label}</span>
              {template.description && (
                <span className="text-xs text-muted-foreground font-normal text-left">
                  {template.description}
                </span>
              )}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
