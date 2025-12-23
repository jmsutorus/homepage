"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PageTabsList } from "@/components/ui/page-tabs-list";
import { Button } from "@/components/ui/button";
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
import { MealList } from "@/components/widgets/meals/meal-list";
import { MealForm } from "@/components/widgets/meals/meal-form";
import { MobileRecipeSheet } from "@/components/widgets/meals/mobile-recipe-sheet";
import { GroceryList } from "@/components/widgets/meals/grocery-list";
import { ImportIngredientsDialog } from "@/components/widgets/meals/import-ingredients-dialog";
import { Utensils, ShoppingCart, Settings, Plus } from "lucide-react";
import { toast } from "sonner";
import { Meal, MealInput, IngredientInput, IngredientCategory, GroceryListByCategory, MealWithIngredients, parseSteps, parseTags } from "@/lib/types/meals";

interface MealsPageClientProps {
  initialMeals: Meal[];
  initialGroceryList: GroceryListByCategory[];
}

export function MealsPageClient({
  initialMeals,
  initialGroceryList,
}: MealsPageClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("recipes");
  const [meals, setMeals] = useState(initialMeals);
  const [groceryList, setGroceryList] = useState(initialGroceryList);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<Meal | null>(null);
  const [editMeal, setEditMeal] = useState<Meal | MealWithIngredients | null>(null);
  const [mobileFormOpen, setMobileFormOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Meal CRUD handlers
  const handleCreateMeal = async (mealData: MealInput, ingredients: IngredientInput[]) => {
    try {
      // Create the meal
      const response = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mealData),
      });

      if (!response.ok) throw new Error("Failed to create meal");
      const meal = await response.json();

      // Add ingredients
      for (const ingredient of ingredients) {
        await fetch(`/api/meals/${meal.id}/ingredients`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ingredient),
        });
      }

      toast.success("Recipe created successfully");
      router.refresh();
      setMeals([...meals, meal]);
    } catch {
      toast.error("Failed to create recipe");
    }
  };

  const handleUpdateMeal = async (mealData: MealInput, ingredients: IngredientInput[]) => {
    if (!editMeal) return;

    try {
      const response = await fetch(`/api/meals/${editMeal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mealData),
      });

      if (!response.ok) throw new Error("Failed to update meal");
      const updated = await response.json();

      // Delete all existing ingredients, then add the new ones
      await fetch(`/api/meals/${editMeal.id}/ingredients`, {
        method: "DELETE",
      });

      // Add all ingredients with their proper order
      for (let i = 0; i < ingredients.length; i++) {
        const ingredient = ingredients[i];
        if (ingredient.name.trim()) {
          await fetch(`/api/meals/${editMeal.id}/ingredients`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...ingredient, order_index: i }),
          });
        }
      }

      toast.success("Recipe updated successfully");
      router.refresh();
      setMeals(meals.map((m) => (m.id === editMeal.id ? updated : m)));
      setEditMeal(null);
    } catch {
      toast.error("Failed to update recipe");
    }
  };

  const handleDeleteMeal = async () => {
    if (!mealToDelete) return;

    try {
      const response = await fetch(`/api/meals/${mealToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete meal");

      toast.success("Recipe deleted");
      router.refresh();
      setMeals(meals.filter((m) => m.id !== mealToDelete.id));
    } catch {
      toast.error("Failed to delete recipe");
    } finally {
      setMealToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const promptDelete = (meal: Meal) => {
    setMealToDelete(meal);
    setDeleteDialogOpen(true);
  };

  // Handle edit - fetch full meal with ingredients
  const handleEditMeal = async (meal: Meal) => {
    try {
      const response = await fetch(`/api/meals/${meal.id}`);
      if (!response.ok) throw new Error("Failed to fetch meal");
      const fullMeal: MealWithIngredients = await response.json();
      setEditMeal(fullMeal);
    } catch {
      toast.error("Failed to load recipe details");
      // Fall back to basic meal data
      setEditMeal(meal);
    }
  };

  // Grocery list handlers
  const handleToggleItem = async (id: number) => {
    try {
      await fetch(`/api/grocery-list/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggle: true }),
      });

      // Update local state
      setGroceryList(
        groceryList.map((cat) => ({
          ...cat,
          items: cat.items.map((item) =>
            item.id === id ? { ...item, checked: !item.checked } : item
          ),
        }))
      );
    } catch {
      toast.error("Failed to toggle item");
    }
  };

  const handleDeleteGroceryItem = async (id: number) => {
    try {
      await fetch(`/api/grocery-list/${id}`, { method: "DELETE" });

      // Update local state
      setGroceryList(
        groceryList
          .map((cat) => ({
            ...cat,
            items: cat.items.filter((item) => item.id !== id),
          }))
          .filter((cat) => cat.items.length > 0)
      );
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const handleAddGroceryItem = async (name: string, category: IngredientCategory) => {
    try {
      const response = await fetch("/api/grocery-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category }),
      });

      if (!response.ok) throw new Error("Failed to add item");
      
      router.refresh();
      // Refresh the grocery list
      const listResponse = await fetch("/api/grocery-list");
      const newList = await listResponse.json();
      setGroceryList(newList);
    } catch {
      toast.error("Failed to add item");
    }
  };

  const handleClearChecked = async () => {
    try {
      await fetch("/api/grocery-list", { method: "DELETE" });

      // Update local state
      setGroceryList(
        groceryList
          .map((cat) => ({
            ...cat,
            items: cat.items.filter((item) => !item.checked),
          }))
          .filter((cat) => cat.items.length > 0)
      );

      toast.success("Cleared checked items");
    } catch {
      toast.error("Failed to clear items");
    }
  };

  const handleImportFromMeal = async (mealId: number) => {
    try {
      const response = await fetch("/api/grocery-list/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealId }),
      });

      if (!response.ok) throw new Error("Failed to import");
      const result = await response.json();

      toast.success(`Added ${result.count} items to grocery list`);
      router.refresh();
      
      // Refresh the grocery list
      const listResponse = await fetch("/api/grocery-list");
      const newList = await listResponse.json();
      setGroceryList(newList);
    } catch {
      toast.error("Failed to import ingredients");
    }
  };

  const handleAddToGrocery = async (meal: Meal) => {
    await handleImportFromMeal(meal.id);
  };

  // Calculate stats
  const totalMeals = meals.length;
  const totalGroceryItems = groceryList.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 max-w-4xl">
      <div className="flex items-start justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Recipes</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {totalMeals} recipes • {totalGroceryItems} grocery items
          </p>
        </div>

        {/* Desktop: New Meal Button */}
        <div className="hidden sm:block">
          <MealForm
            onSubmit={handleCreateMeal}
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Recipe
              </Button>
            }
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <PageTabsList
          tabs={[
            { value: "recipes", label: "Recipes", icon: Utensils },
            { value: "grocery", label: "Grocery List", icon: ShoppingCart },
            { value: "manage", label: "Manage", icon: Settings },
          ]}
          actionButton={{
            label: "New Recipe",
            onClick: () => setMobileFormOpen(true),
            icon: Plus,
          }}
        />

        <TabsContent value="recipes" className="space-y-4 sm:space-y-6 mt-6 pb-20 md:pb-0">
          <MealList
            meals={meals}
            onMealClick={(meal) => router.push(`/recipes/${meal.id}`)}
            onMealEdit={handleEditMeal}
            onMealDelete={promptDelete}
            onAddToGrocery={handleAddToGrocery}
          />
        </TabsContent>

        <TabsContent value="grocery" className="space-y-4 sm:space-y-6 mt-6 pb-20 md:pb-0">
          <div className="flex justify-end mb-4">
            <ImportIngredientsDialog meals={meals} onImport={handleImportFromMeal} />
          </div>
          <GroceryList
            groceryList={groceryList}
            onToggleItem={handleToggleItem}
            onDeleteItem={handleDeleteGroceryItem}
            onAddItem={handleAddGroceryItem}
            onClearChecked={handleClearChecked}
          />
        </TabsContent>

        <TabsContent value="manage" className="space-y-4 sm:space-y-6 mt-6 pb-20 md:pb-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Manage Recipes</h2>
            <MealForm
              onSubmit={handleCreateMeal}
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Meal
                </Button>
              }
            />
          </div>
          <MealList
            meals={meals}
            onMealEdit={handleEditMeal}
            onMealDelete={promptDelete}
            onAddToGrocery={handleAddToGrocery}
          />
        </TabsContent>
      </Tabs>

      {/* Mobile Create Meal - Uses Sheet on mobile, Dialog on desktop */}
      {isMobile ? (
        <MobileRecipeSheet
          open={mobileFormOpen}
          onOpenChange={setMobileFormOpen}
          onRecipeAdded={handleCreateMeal}
        />
      ) : (
        <MealForm
          onSubmit={handleCreateMeal}
          open={mobileFormOpen}
          onOpenChange={setMobileFormOpen}
          title="New Recipe"
        />
      )}

      {/* Edit Meal Dialog */}
      {editMeal && (
        <MealForm
          key={editMeal.id}
          initialData={{
            name: editMeal.name,
            description: editMeal.description || undefined,
            servings: editMeal.servings,
            prep_time: editMeal.prep_time || undefined,
            cook_time: editMeal.cook_time || undefined,
            image_url: editMeal.image_url || undefined,
            tags: parseTags(editMeal.tags),
            steps: parseSteps(editMeal.steps),
            rating: editMeal.rating || undefined,
            ingredients: 'ingredients' in editMeal ? editMeal.ingredients.map(ing => ({
              name: ing.name,
              quantity: ing.quantity || undefined,
              unit: ing.unit || undefined,
              category: ing.category,
              notes: ing.notes || undefined,
              order_index: ing.order_index,
            })) : undefined,
          }}
          onSubmit={handleUpdateMeal}
          open={!!editMeal}
          onOpenChange={(open) => !open && setEditMeal(null)}
          title="Edit Recipe"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{mealToDelete?.name}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMeal} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
