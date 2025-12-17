"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clock, Users, MoreHorizontal, Pencil, Trash2, ShoppingCart, Star } from "lucide-react";
import { Meal, formatTime, getTotalTime, parseTags } from "@/lib/types/meals";

interface MealCardProps {
  meal: Meal;
  onEdit?: (meal: Meal) => void;
  onDelete?: (meal: Meal) => void;
  onAddToGrocery?: (meal: Meal) => void;
  onClick?: (meal: Meal) => void;
}

export function MealCard({
  meal,
  onEdit,
  onDelete,
  onAddToGrocery,
  onClick,
}: MealCardProps) {
  const tags = parseTags(meal.tags);
  const totalTime = getTotalTime(meal);

  return (
    <Card
      className={`group relative overflow-hidden transition-all hover:shadow-md ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={() => onClick?.(meal)}
    >
      {meal.image_url && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={meal.image_url}
            alt={meal.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
            {meal.name}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(meal);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onAddToGrocery && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToGrocery(meal);
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Grocery List
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(meal);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {meal.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {meal.description}
          </p>
        )}

        {meal.rating && meal.rating > 0 && (
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3.5 w-3.5 ${
                    star <= meal.rating!
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {totalTime !== null && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatTime(totalTime)}</span>
            </div>
          )}
          {meal.servings > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{meal.servings} servings</span>
            </div>
          )}
          
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
