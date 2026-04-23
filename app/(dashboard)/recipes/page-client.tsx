"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent } from "@/components/ui/tabs";
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
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { MealForm } from "@/components/widgets/meals/meal-form";
import { MobileRecipeSheet } from "@/components/widgets/meals/mobile-recipe-sheet";
import { GroceryList } from "@/components/widgets/meals/grocery-list";
import { ImportIngredientsDialog } from "@/components/widgets/meals/import-ingredients-dialog";
import { 
  Plus, 
  ArrowRight as ArrowForward, 
  ShoppingCart,
  Timer,
  SignalHigh,
  Share2 as Share,
  Rss as RssFeed,
  Filter,
  Utensils as Recipe,
  Package as Inventory,
  BookOpen as Book,
  Settings as SettingsIcon
} from "lucide-react";
import { toast } from "sonner";
import { 
  Meal, 
  MealInput, 
  IngredientInput, 
  IngredientCategory, 
  GroceryListByCategory, 
  MealWithIngredients, 
  parseSteps, 
  parseTags,
  getTotalTime,
  getDifficulty,
  formatTime
} from "@/lib/types/meals";
import { RecipeEditorialCard } from "@/components/widgets/meals/recipe-editorial-card";
import { PantryWidget } from "@/components/widgets/meals/pantry-widget";
import { motion, AnimatePresence } from "framer-motion";

interface MealsPageClientProps {
  initialMeals: (Meal & { ingredient_count?: number })[];
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
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Featured Recipe: Latest recipe with an image, or just the latest one
  const featuredRecipe = useMemo(() => {
    const withImage = meals.filter(m => m.image_url).sort((a, b) => b.id - a.id);
    return withImage[0] || meals[0];
  }, [meals]);

  // All unique tags for filter chips
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    meals.forEach(m => parseTags(m.tags).forEach(t => tags.add(t)));
    return Array.from(tags).sort().slice(0, 5); // Limit to top 5 for the UI
  }, [meals]);

  // Filtered meals (excluding featured one if needed, or just normal filtering)
  const filteredMeals = useMemo(() => {
    return meals.filter(m => {
      const tags = parseTags(m.tags);
      return !selectedTag || tags.includes(selectedTag);
    });
  }, [meals, selectedTag]);

  // CRUD handlers (Preserved from original)
  const handleCreateMeal = async (mealData: MealInput, ingredients: IngredientInput[]) => {
    try {
      const response = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mealData),
      });

      if (!response.ok) throw new Error("Failed to create meal");
      const meal = await response.json();

      for (const ingredient of ingredients) {
        await fetch(`/api/meals/${meal.id}/ingredients`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ingredient),
        });
      }

      toast.success("Recipe created successfully");
      router.refresh();
      setMeals([...meals, { ...meal, ingredient_count: ingredients.length }]);
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

      await fetch(`/api/meals/${editMeal.id}/ingredients`, {
        method: "DELETE",
      });

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
      setMeals(meals.map((m) => (m.id === editMeal.id ? { ...updated, ingredient_count: ingredients.length } : m)));
      setEditMeal(null);
    } catch {
      toast.error("Failed to update recipe");
    }
  };

  const handleDeleteMeal = async () => {
    if (!mealToDelete) return;
    try {
      const response = await fetch(`/api/meals/${mealToDelete.id}`, { method: "DELETE" });
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

  const handleEditMeal = async (meal: Meal) => {
    try {
      const response = await fetch(`/api/meals/${meal.id}`);
      if (!response.ok) throw new Error("Failed to fetch meal");
      const fullMeal: MealWithIngredients = await response.json();
      setEditMeal(fullMeal);
    } catch {
      toast.error("Failed to load recipe details");
      setEditMeal(meal);
    }
  };

  const handleToggleItem = async (id: number) => {
    try {
      await fetch(`/api/grocery-list/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggle: true }),
      });
      setGroceryList(groceryList.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => item.id === id ? { ...item, checked: !item.checked } : item),
      })));
    } catch {
      toast.error("Failed to toggle item");
    }
  };

  const handleDeleteGroceryItem = async (id: number) => {
    try {
      await fetch(`/api/grocery-list/${id}`, { method: "DELETE" });
      setGroceryList(groceryList.map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => item.id !== id),
      })).filter((cat) => cat.items.length > 0));
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
      setGroceryList(groceryList.map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => !item.checked),
      })).filter((cat) => cat.items.length > 0));
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

  return (
    <main className="min-h-screen text-media-on-background selection:bg-media-secondary-fixed selection:text-media-on-secondary-fixed font-lexend pb-24 lg:pb-0">
      <div className="px-6 md:px-8 py-12 max-w-6xl mx-auto space-y-24">
        
        {/* Seasonal Discovery Hero */}
        <section className="flex flex-col items-center text-center space-y-12">
          <div className="space-y-6 max-w-2xl">
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-black text-media-secondary uppercase tracking-[0.3em]"
            >
              Seasonal Discovery
            </motion.h3>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-media-primary tracking-tighter leading-tight"
            >
              Earthbound Flavors for {new Date().toLocaleDateString('en-US', { month: 'long' })}.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-media-on-surface-variant text-lg leading-relaxed mx-auto"
            >
              Explore our curated selection of recipes that celebrate the deep, woody notes of wild fungi and the golden warmth of harvest grains.
            </motion.p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button 
                onClick={() => featuredRecipe && router.push(`/recipes/${featuredRecipe.id}`)}
                className="bg-media-secondary text-media-on-secondary px-8 py-6 rounded-lg font-bold tracking-wide flex items-center gap-2 hover:bg-media-secondary/90 transition-all text-base"
              >
                Start Cooking <ArrowForward className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                onClick={() => setMobileFormOpen(true)}
                className="border-media-outline-variant text-media-primary px-8 py-6 rounded-lg font-bold tracking-wide hover:bg-media-surface-container-low transition-colors text-base"
              >
                Add Your Own
              </Button>
            </div>
          </div>

          {featuredRecipe && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full relative group cursor-pointer"
              onClick={() => router.push(`/recipes/${featuredRecipe.id}`)}
            >
              <div className="aspect-[16/9] bg-media-surface-container overflow-hidden rounded-xl editorial-shadow">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                  src={featuredRecipe.image_url || "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071&auto=format&fit=crop"} 
                  alt={featuredRecipe.name}
                />
              </div>
              <div className="absolute -bottom-6 right-8 bg-media-primary p-8 rounded-lg shadow-2xl hidden md:block max-w-md text-left transition-transform group-hover:-translate-y-2">
                <span className="text-media-secondary text-[10px] font-black uppercase tracking-[0.2em] block mb-2">Recipe of the Week</span>
                <h2 className="text-media-on-primary text-2xl font-bold leading-tight mb-4">{featuredRecipe.name}</h2>
                <div className="flex items-center gap-6 text-media-on-primary/60 text-xs font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-2"><Timer className="h-4 w-4" /> {formatTime(getTotalTime(featuredRecipe))}</span>
                  <span className="flex items-center gap-2"><SignalHigh className="h-4 w-4" /> {getDifficulty(featuredRecipe)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </section>

        {/* Recipe Gallery & Tabs */}
        <section className="space-y-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col items-center text-center gap-8 border-b border-media-outline-variant/10 pb-12">
              <div>
                <h2 className="text-4xl font-bold text-media-primary tracking-tight">The Recipe Gallery</h2>
                <p className="text-media-on-surface-variant mt-3 text-lg">Browse our editorial collection of {meals.length} dishes.</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3">
                <button 
                  onClick={() => {setActiveTab("recipes"); setSelectedTag(null);}}
                  className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    activeTab === "recipes" && !selectedTag ? "bg-media-primary text-media-on-primary" : "bg-media-surface-container-high text-media-on-surface-variant hover:bg-media-surface-container-highest"
                  }`}
                >
                  All Recipes
                </button>
                {allTags.map(tag => (
                  <button 
                    key={tag}
                    onClick={() => {setActiveTab("recipes"); setSelectedTag(tag);}}
                    className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      selectedTag === tag ? "bg-media-primary text-media-on-primary" : "bg-media-tertiary-fixed text-media-on-tertiary-fixed hover:bg-media-tertiary-fixed-dim"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                <button 
                  onClick={() => setActiveTab("grocery")}
                  className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                    activeTab === "grocery" ? "bg-media-secondary text-media-on-secondary" : "bg-media-surface-container-high text-media-on-surface-variant hover:bg-media-surface-container-highest"
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" /> Grocery List
                </button>
              </div>
            </div>

            <TabsContent value="recipes" className="mt-12">
              <div className="staggered-gap">
                {filteredMeals.map((meal, idx) => (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (idx % 4) * 0.1 }}
                  >
                    <RecipeEditorialCard 
                      meal={meal}
                      aspectRatio={idx % 4 === 0 ? "aspect-[4/5]" : idx % 4 === 1 ? "aspect-square" : idx % 4 === 2 ? "aspect-video" : "aspect-[3/4]"}
                      isFeatured={idx === 0}
                      onClick={(m) => router.push(`/recipes/${m.id}`)}
                      onEdit={handleEditMeal}
                      onDelete={(m) => { setMealToDelete(m); setDeleteDialogOpen(true); }}
                      onAddToGrocery={handleAddToGrocery}
                    />
                  </motion.div>
                ))}
              </div>
              {filteredMeals.length === 0 && (
                <div className="py-24 text-center text-media-on-surface-variant/40 italic">
                  No matches found for your selection.
                </div>
              )}
            </TabsContent>

            <TabsContent value="grocery" className="mt-12 max-w-4xl mx-auto">
              <div className="bg-media-surface-container-low p-8 rounded-xl editorial-shadow">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-media-primary">Grocery List</h2>
                  <ImportIngredientsDialog meals={meals} onImport={handleImportFromMeal} />
                </div>
                <GroceryList
                  groceryList={groceryList}
                  onToggleItem={handleToggleItem}
                  onDeleteItem={handleDeleteGroceryItem}
                  onAddItem={handleAddGroceryItem}
                  onClearChecked={handleClearChecked}
                />
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Philosophy & Pantry Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
          <div className="lg:col-span-8 flex flex-col md:flex-row bg-media-primary rounded-xl overflow-hidden shadow-2xl">
            <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-center space-y-6">
              <span className="text-media-secondary text-[10px] font-black uppercase tracking-[0.3em]">The Maker&apos;s Philosophy</span>
              <h2 className="text-3xl md:text-4xl font-bold text-media-on-primary tracking-tight">&quot;Cooking is the soul&apos;s primary language.&quot;</h2>
              <p className="text-media-on-primary/60 italic leading-relaxed text-lg">
                Join our community of tactile chefs. We believe in the slow movement, the heavy cast iron, and the patience of a proper proofing.
              </p>
              <div className="pt-4">
                <Button className="bg-media-on-primary text-media-primary px-8 py-6 rounded-lg font-bold text-sm hover:bg-media-on-primary/90 transition-all">
                  Read the Manifesto
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 h-80 md:h-auto relative">
              <img 
                className="w-full h-full object-cover grayscale opacity-80 mix-blend-luminosity" 
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop" 
                alt="Maker"
              />
            </div>
          </div>
          
          <div className="lg:col-span-4">
            <PantryWidget 
              groceryList={groceryList} 
              onViewAll={() => {
                setActiveTab("grocery");
                const rect = document.querySelector('[role="tablist"]')?.getBoundingClientRect();
                if (rect) {
                  window.scrollTo({ top: rect.top + window.scrollY - 100, behavior: 'smooth' });
                }
              }} 
            />
          </div>
        </section>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-media-surface-container-highest flex justify-around items-center py-4 px-6 z-50 border-t border-media-outline-variant/10 shadow-[0_-8px_24px_rgba(0,0,0,0.05)] backdrop-blur-lg">
        <button 
          onClick={() => {setActiveTab("recipes"); setSelectedTag(null);}}
          className={`flex flex-col items-center gap-1 ${activeTab === 'recipes' ? 'text-media-secondary' : 'text-media-on-surface-variant'}`}
        >
          <Recipe className={`h-6 w-6 ${activeTab === 'recipes' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Recipes</span>
        </button>
        <button 
          onClick={() => setActiveTab("grocery")}
          className={`flex flex-col items-center gap-1 ${activeTab === 'grocery' ? 'text-media-secondary' : 'text-media-on-surface-variant'}`}
        >
          <Inventory className={`h-6 w-6 ${activeTab === 'grocery' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Pantry</span>
        </button>
        <button className="cursor-pointer flex flex-col items-center gap-1 text-media-on-surface-variant">
          <Book className="h-6 w-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Journal</span>
        </button>
        <button className="cursor-pointer flex flex-col items-center gap-1 text-media-on-surface-variant">
          <SettingsIcon className="h-6 w-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Settings</span>
        </button>
      </nav>

      {/* Floating Action Button */}
      <FloatingActionButton 
        onClick={() => setMobileFormOpen(true)}
        tooltipText="New Recipe"
      />

      {/* Forms & Dialogs (Preserved from original) */}
      <AnimatePresence>
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
      </AnimatePresence>

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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-media-surface border-media-outline-variant">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-media-primary">Delete Recipe</AlertDialogTitle>
            <AlertDialogDescription className="text-media-on-surface-variant">
              Are you sure you want to delete &quot;{mealToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-media-outline-variant text-media-primary hover:bg-media-surface-container">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMeal} className="bg-media-error text-media-on-error hover:bg-media-error/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
