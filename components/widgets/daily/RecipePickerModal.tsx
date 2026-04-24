"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MaterialSymbol } from "@/components/ui/MaterialSymbol";
import type { Meal } from "@/lib/types/meals";

interface RecipePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mealId: number) => void;
  recipes: Meal[];
  mealType: string;
  isSubmitting?: boolean;
}

export function RecipePickerModal({
  isOpen,
  onClose,
  onSelect,
  recipes,
  mealType,
  isSubmitting = false
}: RecipePickerModalProps) {
  const [search, setSearch] = useState("");

  const filteredRecipes = useMemo(() => {
    if (!search) return recipes;
    const lowerSearch = search.toLowerCase();
    return recipes.filter(r => 
      r.name.toLowerCase().includes(lowerSearch) || 
      (r.description?.toLowerCase().includes(lowerSearch))
    );
  }, [recipes, search]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-media-surface border-media-outline-variant shadow-2xl">
        <DialogHeader className="p-8 pb-4 border-b border-media-outline-variant/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded bg-media-secondary/10 flex items-center justify-center text-media-secondary">
              <MaterialSymbol icon="restaurant" opsz={20} />
            </div>
            <DialogTitle className="text-3xl font-bold tracking-tight text-media-primary">
              Log {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </DialogTitle>
          </div>
          <DialogDescription className="text-media-on-surface-variant text-lg">
            Choose a recipe from your collection to add to your daily sustenance.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 pt-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-media-on-surface-variant/40 group-focus-within:text-media-primary transition-colors">
              <MaterialSymbol icon="search" />
            </div>
            <Input
              placeholder="Search your recipes..."
              className="pl-12 py-6 bg-media-surface-container-low border-media-outline-variant focus:border-media-primary focus:ring-1 focus:ring-media-primary transition-all text-lg rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => onSelect(recipe.id)}
                disabled={isSubmitting}
                className="cursor-pointer flex flex-col text-left group bg-media-surface-container-low hover:bg-media-surface-container-high border border-media-outline-variant/10 hover:border-media-primary/30 rounded-2xl overflow-hidden transition-all duration-300 kinetic-hover disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <div className="h-40 w-full relative overflow-hidden bg-media-surface-container">
                  {recipe.image_url ? (
                    <Image 
                      src={recipe.image_url} 
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      width={400}
                      height={160}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-media-on-surface-variant/20">
                      <MaterialSymbol icon="nest_food_fruits" className="text-4xl mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                       <MaterialSymbol icon="add_circle" className="text-base" />
                       Select Recipe
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-media-primary group-hover:text-media-secondary transition-colors line-clamp-1">{recipe.name}</h4>
                    <p className="text-xs text-media-on-surface-variant/70 mt-1 line-clamp-2 min-h-[32px]">{recipe.description || "No description provided."}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-media-secondary/60">
                      <MaterialSymbol icon="timer" className="text-sm" />
                      {(recipe.prep_time || 0) + (recipe.cook_time || 0)}m
                    </div>
                    {recipe.rating && (
                       <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-amber-500/80">
                        <MaterialSymbol icon="star" className="text-sm" fill />
                        {recipe.rating}/10
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredRecipes.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-media-surface-container mx-auto flex items-center justify-center text-media-on-surface-variant/30">
                <MaterialSymbol icon="search_off" className="text-4xl" />
              </div>
              <p className="text-media-on-surface-variant opacity-50 italic">No recipes found matching &quot;{search}&quot;</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
