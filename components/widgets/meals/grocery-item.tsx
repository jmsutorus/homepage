"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GroceryItem } from "@/lib/types/meals";

interface GroceryItemRowProps {
  item: GroceryItem;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export function GroceryItemRow({ item, onToggle, onDelete }: GroceryItemRowProps) {
  const quantityText = item.quantity
    ? `${item.quantity}${item.unit ? ` ${item.unit}` : ""}`
    : "";

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 group">
      <Checkbox
        checked={item.checked}
        onCheckedChange={() => onToggle(item.id)}
        className="cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "text-sm",
            item.checked && "line-through text-muted-foreground"
          )}
        >
          {quantityText && (
            <span className="font-medium mr-1">{quantityText}</span>
          )}
          {item.name}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onDelete(item.id)}
      >
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
