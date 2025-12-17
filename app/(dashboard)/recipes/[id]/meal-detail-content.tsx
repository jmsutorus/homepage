"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Clock,
  Users,
  ChefHat,
  Pencil,
  Trash2,
  ShoppingCart,
  Timer,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import {
  MealWithIngredients,
  parseSteps,
  parseTags,
  formatTime,
  CATEGORY_DISPLAY_NAMES,
  IngredientCategory,
  MealInput,
  IngredientInput,
} from "@/lib/types/meals";
import { MealForm } from "@/components/widgets/meals/meal-form";

interface MealDetailContentProps {
  meal: MealWithIngredients;
}

export function MealDetailContent({ meal }: MealDetailContentProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [isEditing, setIsEditing] = useState(false);

  const steps = parseSteps(meal.steps);
  const tags = parseTags(meal.tags);
  const totalTime = (meal.prep_time || 0) + (meal.cook_time || 0);

  // Group ingredients by category
  const ingredientsByCategory = meal.ingredients.reduce((acc, ing) => {
    const cat = ing.category as IngredientCategory;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ing);
    return acc;
  }, {} as Record<IngredientCategory, typeof meal.ingredients>);

  const handleUpdateMeal = async (mealData: MealInput, ingredients: IngredientInput[]) => {
    try {
      const response = await fetch(`/api/meals/${meal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mealData),
      });

      if (!response.ok) throw new Error("Failed to update meal");

      // Delete all existing ingredients, then add the new ones
      await fetch(`/api/meals/${meal.id}/ingredients`, {
        method: "DELETE",
      });

      // Add all ingredients with their proper order
      for (let i = 0; i < ingredients.length; i++) {
        const ingredient = ingredients[i];
        if (ingredient.name.trim()) {
          await fetch(`/api/meals/${meal.id}/ingredients`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...ingredient, order_index: i }),
          });
        }
      }

      toast.success("Recipe updated successfully");
      setIsEditing(false);
      router.refresh();
    } catch {
      toast.error("Failed to update recipe");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/meals/${meal.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Recipe deleted");
      router.push("/recipes");
    } catch {
      toast.error("Failed to delete recipe");
    }
  };

  const handleAddToGrocery = async () => {
    try {
      const response = await fetch("/api/grocery-list/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealId: meal.id }),
      });
      if (!response.ok) throw new Error("Failed to import");
      const result = await response.json();
      toast.success(`Added ${result.count} items to grocery list`);
    } catch {
      toast.error("Failed to add ingredients to grocery list");
    }
  };

  const toggleIngredient = (id: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedIngredients(newChecked);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-48 sm:h-64 md:h-80 bg-gradient-to-br from-primary/20 to-primary/5">
        {meal.image_url ? (
          <>
            <img
              src={meal.image_url}
              alt={meal.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ChefHat className="h-24 w-24 text-muted-foreground/30" />
          </div>
        )}

        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Button variant="secondary" size="sm" asChild className="gap-2">
            <Link href="/recipes">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-16 relative z-10 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Title Card */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">{meal.name}</h1>
                  {meal.description && (
                    <p className="text-muted-foreground">{meal.description}</p>
                  )}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddToGrocery}
                    className="gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span className="hidden sm:inline">Add to List</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
                {meal.prep_time && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Prep:</span>
                    <span className="font-medium">{formatTime(meal.prep_time)}</span>
                  </div>
                )}
                {meal.cook_time && (
                  <div className="flex items-center gap-2 text-sm">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Cook:</span>
                    <span className="font-medium">{formatTime(meal.cook_time)}</span>
                  </div>
                )}
                {totalTime > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">{formatTime(totalTime)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Servings:</span>
                  <span className="font-medium">{meal.servings}</span>
                </div>
                {meal.rating && meal.rating > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= meal.rating!
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-muted-foreground">({meal.rating}/5)</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-5 gap-6">
            {/* Ingredients */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Ingredients
                    <Badge variant="outline" className="ml-auto">
                      {meal.ingredients.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(ingredientsByCategory).map(([category, ingredients]) => (
                    <div key={category}>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        {CATEGORY_DISPLAY_NAMES[category as IngredientCategory]}
                      </h4>
                      <ul className="space-y-2">
                        {ingredients.map((ing) => (
                          <li key={ing.id} className="flex items-start gap-3">
                            <Checkbox
                              id={`ing-${ing.id}`}
                              checked={checkedIngredients.has(ing.id)}
                              onCheckedChange={() => toggleIngredient(ing.id)}
                              className="mt-0.5"
                            />
                            <label
                              htmlFor={`ing-${ing.id}`}
                              className={`text-sm cursor-pointer ${
                                checkedIngredients.has(ing.id)
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {ing.quantity && (
                                <span className="font-medium">{ing.quantity}</span>
                              )}{" "}
                              {ing.unit && <span>{ing.unit}</span>} {ing.name}
                              {ing.notes && (
                                <span className="text-muted-foreground">
                                  {" "}
                                  ({ing.notes})
                                </span>
                              )}
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {meal.ingredients.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      No ingredients added yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Steps */}
            <div className="md:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Instructions
                    <Badge variant="outline" className="ml-auto">
                      {steps.length} steps
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {steps.length > 0 ? (
                    <ol className="space-y-6">
                      {steps.map((step, index) => (
                        <li key={index} className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <p className="text-sm leading-relaxed pt-1">{step}</p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No instructions added yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <MealForm
        open={isEditing}
        onOpenChange={setIsEditing}
        title="Edit Recipe"
        initialData={{
          name: meal.name,
          description: meal.description || undefined,
          servings: meal.servings,
          prep_time: meal.prep_time || undefined,
          cook_time: meal.cook_time || undefined,
          image_url: meal.image_url || undefined,
          tags: tags,
          steps: steps,
          rating: meal.rating || undefined,
          ingredients: meal.ingredients.map((ing) => ({
            name: ing.name,
            quantity: ing.quantity || undefined,
            unit: ing.unit || undefined,
            category: ing.category,
            notes: ing.notes || undefined,
            order_index: ing.order_index,
          })),
        }}
        onSubmit={handleUpdateMeal}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{meal.name}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
