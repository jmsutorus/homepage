"use client";

import { useState, useMemo } from "react";
import { MealCard } from "./meal-card";
import { Input } from "@/components/ui/input";
import { Search, Tag, X } from "lucide-react";
import { Meal, parseTags } from "@/lib/types/meals";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MealListProps {
  meals: Meal[];
  onMealClick?: (meal: Meal) => void;
  onMealEdit?: (meal: Meal) => void;
  onMealDelete?: (meal: Meal) => void;
  onAddToGrocery?: (meal: Meal) => void;
}

export function MealList({
  meals,
  onMealClick,
  onMealEdit,
  onMealDelete,
  onAddToGrocery,
}: MealListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags from all meals
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    meals.forEach((meal) => {
      const tags = parseTags(meal.tags);
      tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [meals]);

  // Filter meals by search term (name, description, tags) and selected tag
  const filteredMeals = useMemo(() => {
    return meals.filter((meal) => {
      const searchLower = searchTerm.toLowerCase();
      const mealTags = parseTags(meal.tags);
      
      // Check search term against name, description, and tags
      const matchesSearch = searchTerm === "" || 
        meal.name.toLowerCase().includes(searchLower) ||
        (meal.description && meal.description.toLowerCase().includes(searchLower)) ||
        mealTags.some((tag) => tag.toLowerCase().includes(searchLower));
      
      // Check tag filter
      const matchesTag = !selectedTag || mealTags.includes(selectedTag);
      
      return matchesSearch && matchesTag;
    });
  }, [meals, searchTerm, selectedTag]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTag(null);
  };

  const hasActiveFilters = searchTerm !== "" || selectedTag !== null;

  return (
    <div className="space-y-4">
      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {allTags.length > 0 && (
          <Select
            value={selectedTag || "__all__"}
            onValueChange={(value) => setSelectedTag(value === "__all__" ? null : value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All tags</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filters:</span>
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Search: &quot;{searchTerm}&quot;
              <button
                onClick={() => setSearchTerm("")}
                className="cursor-pointer ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedTag && (
            <Badge variant="secondary" className="gap-1">
              Tag: {selectedTag}
              <button
                onClick={() => setSelectedTag(null)}
                className="cursor-pointer ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {filteredMeals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {hasActiveFilters ? (
            <div className="space-y-2">
              <p>No recipes found matching your filters.</p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <p>No recipes yet. Create your first recipe to get started!</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onClick={onMealClick}
              onEdit={onMealEdit}
              onDelete={onMealDelete}
              onAddToGrocery={onAddToGrocery}
            />
          ))}
        </div>
      )}
    </div>
  );
}
