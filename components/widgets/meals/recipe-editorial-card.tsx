"use client";

import { Meal, formatTime, getTotalTime, getDifficulty } from "@/lib/types/meals";
import { Timer, SignalHigh, MoreHorizontal, Pencil, Trash2, ShoppingCart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface RecipeEditorialCardProps {
  meal: Meal & { ingredient_count?: number };
  aspectRatio?: string;
  isFeatured?: boolean;
  onClick?: (meal: Meal) => void;
  onEdit?: (meal: Meal) => void;
  onDelete?: (meal: Meal) => void;
  onAddToGrocery?: (meal: Meal) => void;
}

export function RecipeEditorialCard({
  meal,
  aspectRatio = "aspect-square",
  isFeatured = false,
  onClick,
  onEdit,
  onDelete,
  onAddToGrocery,
}: RecipeEditorialCardProps) {
  const totalTime = getTotalTime(meal);
  const difficulty = getDifficulty(meal);
  
  // Icon for difficulty
  const DifficultyIcon = SignalHigh;

  return (
    <div 
      className={`group relative overflow-hidden rounded-xl bg-media-surface-container-low editorial-shadow ${aspectRatio} cursor-pointer`}
      onClick={() => onClick?.(meal)}
    >
      {meal.image_url ? (
        <img 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          src={meal.image_url} 
          alt={meal.name}
        />
      ) : (
        <div className="w-full h-full bg-media-surface-variant flex items-center justify-center">
            <span className="text-media-on-surface-variant/30 font-bold uppercase tracking-widest text-xs">No Image</span>
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-media-primary/90 via-media-primary/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
      
      {/* Actions Dropdown */}
      <div className="absolute top-4 right-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border-none opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-media-surface border-media-outline-variant">
            {onEdit && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(meal);
                }}
                className="hover:bg-media-surface-container"
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
                className="hover:bg-media-surface-container"
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
                className="text-media-error hover:bg-media-error/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="absolute bottom-0 p-6 md:p-8 w-full">
        {isFeatured && (
            <span className="text-media-secondary-fixed text-[10px] font-black uppercase tracking-widest block mb-2">Editor&apos;s Pick</span>
        )}
        <h3 className={`${isFeatured ? 'text-3xl' : 'text-xl md:text-2xl'} font-bold text-media-on-primary leading-tight line-clamp-2`}>
            {meal.name}
        </h3>
        <div className="flex items-center gap-4 text-media-on-primary/80 text-xs md:text-sm mt-4">
          <span className="flex items-center gap-1.5">
            <Timer className="h-4 w-4" />
            {formatTime(totalTime)}
          </span>
          <span className="flex items-center gap-1.5">
            <DifficultyIcon className="h-4 w-4" />
            {difficulty}
          </span>
        </div>
      </div>
    </div>
  );
}
