"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GroceryItemRow } from "./grocery-item";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { 
  GroceryListByCategory, 
  CATEGORY_DISPLAY_NAMES, 
  GroceryItem,
  IngredientCategory, 
  INGREDIENT_CATEGORIES 
} from "@/lib/types/meals";

interface GroceryListProps {
  groceryList: GroceryListByCategory[];
  onToggleItem: (id: number) => Promise<void>;
  onDeleteItem: (id: number) => Promise<void>;
  onAddItem: (name: string, category: IngredientCategory) => Promise<void>;
  onClearChecked: () => Promise<void>;
}

export function GroceryList({
  groceryList,
  onToggleItem,
  onDeleteItem,
  onAddItem,
  onClearChecked,
}: GroceryListProps) {
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<IngredientCategory>("other");

  const totalItems = groceryList.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedItems = groceryList.reduce(
    (sum, cat) => sum + cat.items.filter((i) => i.checked).length,
    0
  );

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;
    await onAddItem(newItemName.trim(), newItemCategory);
    setNewItemName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddItem();
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Item Form */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add item..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Select
              value={newItemCategory}
              onValueChange={(v) => setNewItemCategory(v as IngredientCategory)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INGREDIENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_DISPLAY_NAMES[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddItem} disabled={!newItemName.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats and Clear */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {checkedItems} of {totalItems} items checked
          </p>
          {checkedItems > 0 && (
            <Button variant="outline" size="sm" onClick={onClearChecked}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Checked
            </Button>
          )}
        </div>
      )}

      {/* Empty State */}
      {totalItems === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Your grocery list is empty</p>
          <p className="text-sm mt-1">
            Add items above or import from a meal
          </p>
        </div>
      )}

      {/* Categories */}
      {groceryList.map((category) => (
        <Card key={category.category}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              {CATEGORY_DISPLAY_NAMES[category.category]}
              <span className="text-muted-foreground font-normal text-sm">
                ({category.items.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y">
              {category.items.map((item: GroceryItem) => (
                <GroceryItemRow
                  key={item.id}
                  item={item}
                  onToggle={onToggleItem}
                  onDelete={onDeleteItem}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
